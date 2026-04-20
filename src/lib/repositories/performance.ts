/**
 * Performance & metrics repository — performance_metrics + aggregation queries.
 */
import { getDb } from "@/lib/db";

export function getMetrics(deploymentId: string, days = 30) {
  return getDb()
    .prepare(`
      SELECT * FROM performance_metrics
      WHERE deployment_id = ? AND recorded_at >= datetime('now', ?)
      ORDER BY recorded_at DESC
    `)
    .all(deploymentId, `-${days} days`) as any[];
}

export function getMetricsSummary(deploymentId: string, days = 30) {
  return getDb().prepare(`
    SELECT
      AVG(response_time_avg) as avgResponseTime,
      MIN(response_time_avg) as minResponseTime,
      MAX(response_time_avg) as maxResponseTime,
      AVG(satisfaction_score) as avgSatisfaction,
      SUM(tasks_completed) as totalTasksCompleted,
      SUM(tasks_failed) as totalTasksFailed,
      AVG(uptime_percentage) as avgUptime,
      SUM(tokens_used) as totalTokens,
      COUNT(*) as dataPoints
    FROM performance_metrics
    WHERE deployment_id = ? AND recorded_at >= datetime('now', ?)
  `).get(deploymentId, `-${days} days`) as any;
}

/** Aggregate performance across all of a user's deployments. */
export function getUserPerformanceSummary(userId: string) {
  return getDb().prepare(`
    SELECT
      d.id as deployment_id, d.name as deployment_name, d.status,
      e.role, e.category,
      AVG(pm.response_time_avg) as avgResponseTime,
      AVG(pm.satisfaction_score) as avgSatisfaction,
      SUM(pm.tasks_completed) as totalTasks,
      AVG(pm.uptime_percentage) as avgUptime,
      SUM(pm.tokens_used) as totalTokens
    FROM deployments d
    JOIN ai_employees e ON d.employee_id = e.id
    LEFT JOIN performance_metrics pm ON pm.deployment_id = d.id
      AND pm.recorded_at >= datetime('now', '-30 days')
    WHERE d.user_id = ?
    GROUP BY d.id
    ORDER BY d.created_at DESC
  `).all(userId) as any[];
}

export function getUserGlobalMetrics(userId: string) {
  return getDb().prepare(`
    SELECT
      COUNT(DISTINCT d.id) as totalDeployments,
      SUM(pm.tasks_completed) as totalTasks,
      SUM(pm.tokens_used) as totalTokens,
      AVG(pm.satisfaction_score) as avgSatisfaction,
      AVG(pm.response_time_avg) as avgResponseTime,
      AVG(pm.uptime_percentage) as avgUptime
    FROM deployments d
    LEFT JOIN performance_metrics pm ON pm.deployment_id = d.id
      AND pm.recorded_at >= datetime('now', '-30 days')
    WHERE d.user_id = ?
  `).get(userId) as any;
}
