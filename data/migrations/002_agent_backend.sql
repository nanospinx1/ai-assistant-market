-- Migration 002: Agent backend tables
-- Adds conversations, messages, task logs, knowledge sources, and marketplace submissions.

-- Conversations with deployed agents
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conversations_deployment ON conversations(deployment_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, updated_at DESC);

-- Messages within conversations
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);

-- Task execution logs
CREATE TABLE IF NOT EXISTS task_logs (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL,
  conversation_id TEXT,
  task_type TEXT NOT NULL,
  input TEXT,
  output TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  duration_ms INTEGER,
  tokens_used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_task_logs_deployment ON task_logs(deployment_id, created_at DESC);

-- Knowledge sources for agent configuration
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT DEFAULT 'faq' CHECK (source_type IN ('faq', 'document', 'url', 'custom')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_knowledge_deployment ON knowledge_sources(deployment_id);

-- Marketplace submissions for community-published agents
CREATE TABLE IF NOT EXISTS marketplace_submissions (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  snapshot TEXT NOT NULL,
  review_notes TEXT,
  submitted_at TEXT DEFAULT (datetime('now')),
  reviewed_at TEXT,
  FOREIGN KEY (employee_id) REFERENCES ai_employees(id),
  FOREIGN KEY (submitted_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON marketplace_submissions(status, submitted_at DESC);

-- Add system_prompt column to ai_employees for agent execution
ALTER TABLE ai_employees ADD COLUMN system_prompt TEXT;

-- Add agent_type column to identify which agent engine to use
ALTER TABLE ai_employees ADD COLUMN agent_type TEXT DEFAULT 'generic';
