-- Human-in-the-Loop Approval system
CREATE TABLE IF NOT EXISTS approval_requests (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  action TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload TEXT,
  status TEXT DEFAULT 'pending',
  decided_at DATETIME,
  decision_note TEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id)
);

CREATE INDEX IF NOT EXISTS idx_approvals_user ON approval_requests(user_id, status, created_at DESC);
