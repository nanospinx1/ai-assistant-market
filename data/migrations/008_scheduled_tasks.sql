-- Scheduled tasks for AI agent deployments
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  schedule_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  schedule_config TEXT, -- JSON: { time: "09:00", days: ["Mon","Wed","Fri"], dayOfMonth: 1 }
  task_prompt TEXT NOT NULL, -- The instruction to send to the agent
  is_active INTEGER DEFAULT 1,
  last_run_at DATETIME,
  next_run_at DATETIME,
  run_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id)
);

CREATE TABLE IF NOT EXISTS task_runs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  deployment_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'success', 'error'
  result TEXT, -- JSON response from the agent
  error TEXT,
  started_at DATETIME DEFAULT (datetime('now')),
  completed_at DATETIME,
  FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id)
);
