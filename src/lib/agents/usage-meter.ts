// Usage metering — tracks token usage per request, enforces quotas atomically

import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { ModelConfig, getModelConfig } from "./model-registry";

export interface UsageRecord {
  userId: string;
  deploymentId: string;
  conversationId?: string;
  taskLogId?: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs?: number;
  status: "success" | "error";
  errorMessage?: string;
}

export interface QuotaStatus {
  plan: string;
  monthlyLimit: number;
  tokensUsed: number;
  tokensReserved: number;
  tokensAvailable: number;
  percentUsed: number;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 100_000,
  starter: 500_000,
  professional: 2_000_000,
  enterprise: 10_000_000,
};

/**
 * Reserve tokens before an LLM call (atomic).
 * Estimates cost based on max_tokens and returns a reservation ID.
 * If quota exceeded, throws an error.
 */
export function reserveQuota(userId: string, estimatedTokens: number): string {
  const db = getDb();
  const reservationId = uuid();

  const result = db.transaction(() => {
    // Ensure user has a quota row
    ensureQuotaRow(userId);

    // Reset if new billing period
    resetIfNewPeriod(userId);

    // Check available quota
    const quota = db
      .prepare("SELECT monthly_token_limit, tokens_used_this_month, reserved_tokens FROM user_quotas WHERE user_id = ?")
      .get(userId) as any;

    const available = quota.monthly_token_limit - quota.tokens_used_this_month - quota.reserved_tokens;

    if (available < estimatedTokens) {
      throw new QuotaExceededError(
        `Token quota exceeded. Available: ${available}, Required: ~${estimatedTokens}. ` +
        `Usage: ${quota.tokens_used_this_month}/${quota.monthly_token_limit} this month.`
      );
    }

    // Reserve the tokens
    db.prepare(
      "UPDATE user_quotas SET reserved_tokens = reserved_tokens + ?, updated_at = datetime('now') WHERE user_id = ?"
    ).run(estimatedTokens, userId);

    return reservationId;
  })();

  return result;
}

/**
 * Reconcile usage after an LLM call — logs actual usage, releases reservation, updates quota.
 */
export function reconcileUsage(userId: string, estimatedTokens: number, record: UsageRecord): void {
  const db = getDb();

  db.transaction(() => {
    // Calculate cost
    const cost = calculateCost(record.model, record.promptTokens, record.completionTokens);

    // Insert usage log
    db.prepare(`
      INSERT INTO usage_logs (id, user_id, deployment_id, conversation_id, task_log_id, model, provider, prompt_tokens, completion_tokens, total_tokens, cost_usd, latency_ms, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuid(),
      record.userId,
      record.deploymentId,
      record.conversationId || null,
      record.taskLogId || null,
      record.model,
      record.provider,
      record.promptTokens,
      record.completionTokens,
      record.totalTokens,
      cost,
      record.latencyMs || null,
      record.status,
      record.errorMessage || null
    );

    // Release reservation and update actual usage
    db.prepare(`
      UPDATE user_quotas
      SET reserved_tokens = MAX(0, reserved_tokens - ?),
          tokens_used_this_month = tokens_used_this_month + ?,
          updated_at = datetime('now')
      WHERE user_id = ?
    `).run(estimatedTokens, record.totalTokens, userId);
  })();
}

/**
 * Release a reservation without logging usage (e.g., on error before LLM call).
 */
export function releaseReservation(userId: string, estimatedTokens: number): void {
  const db = getDb();
  db.prepare(
    "UPDATE user_quotas SET reserved_tokens = MAX(0, reserved_tokens - ?), updated_at = datetime('now') WHERE user_id = ?"
  ).run(estimatedTokens, userId);
}

/**
 * Get current quota status for a user.
 */
export function getQuotaStatus(userId: string): QuotaStatus {
  const db = getDb();
  ensureQuotaRow(userId);
  resetIfNewPeriod(userId);

  const quota = db
    .prepare("SELECT plan, monthly_token_limit, tokens_used_this_month, reserved_tokens FROM user_quotas WHERE user_id = ?")
    .get(userId) as any;

  const available = Math.max(0, quota.monthly_token_limit - quota.tokens_used_this_month - quota.reserved_tokens);
  const percentUsed = quota.monthly_token_limit > 0
    ? Math.round((quota.tokens_used_this_month / quota.monthly_token_limit) * 100)
    : 0;

  return {
    plan: quota.plan,
    monthlyLimit: quota.monthly_token_limit,
    tokensUsed: quota.tokens_used_this_month,
    tokensReserved: quota.reserved_tokens,
    tokensAvailable: available,
    percentUsed,
  };
}

/**
 * Get usage summary for a user over a period.
 */
export function getUsageSummary(userId: string, days: number = 30) {
  const db = getDb();

  const summary = db.prepare(`
    SELECT
      model,
      COUNT(*) as request_count,
      SUM(prompt_tokens) as total_prompt_tokens,
      SUM(completion_tokens) as total_completion_tokens,
      SUM(total_tokens) as total_tokens,
      SUM(cost_usd) as total_cost,
      AVG(latency_ms) as avg_latency,
      SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count
    FROM usage_logs
    WHERE user_id = ? AND created_at >= datetime('now', ?)
    GROUP BY model
    ORDER BY total_tokens DESC
  `).all(userId, `-${days} days`);

  return summary;
}

// --- Internal helpers ---

function ensureQuotaRow(userId: string): void {
  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM user_quotas WHERE user_id = ?").get(userId);
  if (!exists) {
    db.prepare(`
      INSERT INTO user_quotas (user_id, plan, monthly_token_limit, tokens_used_this_month, reserved_tokens, period_start)
      VALUES (?, 'free', ?, 0, 0, datetime('now', 'start of month'))
    `).run(userId, PLAN_LIMITS.free);
  }
}

function resetIfNewPeriod(userId: string): void {
  const db = getDb();
  // Reset if period_start is before this month
  db.prepare(`
    UPDATE user_quotas
    SET tokens_used_this_month = 0, reserved_tokens = 0, period_start = datetime('now', 'start of month'), updated_at = datetime('now')
    WHERE user_id = ? AND period_start < datetime('now', 'start of month')
  `).run(userId);
}

function calculateCost(modelId: string, promptTokens: number, completionTokens: number): number {
  const model = getModelConfig(modelId);
  if (!model) return 0;

  return (promptTokens / 1000) * model.costPer1kInput + (completionTokens / 1000) * model.costPer1kOutput;
}

/**
 * Custom error for quota exceeded — routes can catch this and return 429
 */
export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaExceededError";
  }
}
