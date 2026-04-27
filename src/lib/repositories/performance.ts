/**
 * Performance & metrics repository — EAV-style performance_metrics table.
 * Columns: id, deployment_id, metric_type, value, recorded_at
 * metric_type values: tasks_completed, response_time, accuracy, uptime
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
      AVG(CASE WHEN metric_type = 'response_time' THEN value END) as avgResponseTime,
      MIN(CASE WHEN metric_type = 'response_time' THEN value END) as minResponseTime,
      MAX(CASE WHEN metric_type = 'response_time' THEN value END) as maxResponseTime,
      AVG(CASE WHEN metric_type = 'accuracy' THEN value END) as avgSatisfaction,
      SUM(CASE WHEN metric_type = 'tasks_completed' THEN value END) as totalTasksCompleted,
      0 as totalTasksFailed,
      AVG(CASE WHEN metric_type = 'uptime' THEN value END) as avgUptime,
      0 as totalTokens,
      COUNT(DISTINCT recorded_at) as dataPoints
    FROM performance_metrics
    WHERE deployment_id = ? AND recorded_at >= datetime('now', ?)
  `).get(deploymentId, `-${days} days`) as any;
}

/** Aggregate performance across all of a user's deployments. */
export function getUserPerformanceSummary(userId: string) {
  return getDb().prepare(`
    SELECT
      d.id as deployment_id, d.name as deployment_name, d.status,
      e.name as employee_name, e.avatar as employee_avatar,
      e.role, e.category,
      AVG(CASE WHEN pm.metric_type = 'tasks_completed' THEN pm.value END) as avg_tasks,
      AVG(CASE WHEN pm.metric_type = 'response_time' THEN pm.value END) as avg_response_time,
      AVG(CASE WHEN pm.metric_type = 'accuracy' THEN pm.value END) as avg_accuracy,
      AVG(CASE WHEN pm.metric_type = 'uptime' THEN pm.value END) as avg_uptime
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
      SUM(CASE WHEN pm.metric_type = 'tasks_completed' THEN pm.value END) as totalTasks,
      0 as totalTokens,
      AVG(CASE WHEN pm.metric_type = 'accuracy' THEN pm.value END) as avgSatisfaction,
      AVG(CASE WHEN pm.metric_type = 'response_time' THEN pm.value END) as avgResponseTime,
      AVG(CASE WHEN pm.metric_type = 'uptime' THEN pm.value END) as avgUptime
    FROM deployments d
    LEFT JOIN performance_metrics pm ON pm.deployment_id = d.id
      AND pm.recorded_at >= datetime('now', '-30 days')
    WHERE d.user_id = ?
  `).get(userId) as any;
}
