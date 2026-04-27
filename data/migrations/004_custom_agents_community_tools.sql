-- Migration 004: Custom agent builder enhancements, community marketplace, tool integrations

-- Enhance ai_employees for custom agent builder
-- Add default_tools and default_knowledge for custom agents (JSON columns)
ALTER TABLE ai_employees ADD COLUMN default_tools TEXT;
ALTER TABLE ai_employees ADD COLUMN default_knowledge TEXT;
ALTER TABLE ai_employees ADD COLUMN custom_instructions TEXT;

-- Community marketplace: publishing metadata on ai_employees
ALTER TABLE ai_employees ADD COLUMN is_published INTEGER DEFAULT 0;
ALTER TABLE ai_employees ADD COLUMN publish_status TEXT DEFAULT 'draft';
ALTER TABLE ai_employees ADD COLUMN publisher_name TEXT;
ALTER TABLE ai_employees ADD COLUMN installs_count INTEGER DEFAULT 0;

-- Store frozen snapshot of agent definition on deployments (so edits don't affect existing deploys)
ALTER TABLE deployments ADD COLUMN agent_snapshot TEXT;

-- User tool connections: per-user credentials for external services
CREATE TABLE IF NOT EXISTS user_tool_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tool_type TEXT NOT NULL,
  name TEXT NOT NULL,
  config TEXT NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tool_connections_user ON user_tool_connections(user_id, tool_type);

-- Deployment tool bindings: links deployments to user tool connections
CREATE TABLE IF NOT EXISTS deployment_tool_bindings (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL,
  connection_id TEXT NOT NULL,
  tool_type TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE,
  FOREIGN KEY (connection_id) REFERENCES user_tool_connections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tool_bindings_deployment ON deployment_tool_bindings(deployment_id);

-- Tool execution logs: track actual tool calls made by agents
CREATE TABLE IF NOT EXISTS tool_execution_logs (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL,
  conversation_id TEXT,
  tool_type TEXT NOT NULL,
  action TEXT NOT NULL,
  input TEXT,
  output TEXT,
  status TEXT DEFAULT 'success',
  duration_ms INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tool_logs_deployment ON tool_execution_logs(deployment_id, created_at DESC);
