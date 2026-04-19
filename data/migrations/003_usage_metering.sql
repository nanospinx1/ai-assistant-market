-- Migration 003: Usage metering, quotas, and model tracking

-- Track token usage per request for billing and analytics
CREATE TABLE IF NOT EXISTS usage_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  deployment_id TEXT NOT NULL,
  conversation_id TEXT,
  task_log_id TEXT,
  model TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'azure-openai',
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0.0,
  latency_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id)
);

-- Per-user quota tracking (per billing period)
CREATE TABLE IF NOT EXISTS user_quotas (
  user_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free',
  monthly_token_limit INTEGER NOT NULL DEFAULT 100000,
  tokens_used_this_month INTEGER NOT NULL DEFAULT 0,
  reserved_tokens INTEGER NOT NULL DEFAULT 0,
  period_start TEXT NOT NULL DEFAULT (datetime('now', 'start of month')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add default_model column to deployments
ALTER TABLE deployments ADD COLUMN default_model TEXT;

-- Add model_tier column to deployments for recommendation tracking
ALTER TABLE deployments ADD COLUMN model_tier TEXT;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_deployment ON usage_logs(deployment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_model ON usage_logs(model, created_at);
