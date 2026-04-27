-- User-level knowledge library (Resources page)
CREATE TABLE IF NOT EXISTS user_knowledge_library (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_lib_user ON user_knowledge_library(user_id, created_at DESC);

-- Deployment ↔ Knowledge bindings
CREATE TABLE IF NOT EXISTS deployment_knowledge_bindings (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL,
  knowledge_id TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id),
  FOREIGN KEY (knowledge_id) REFERENCES user_knowledge_library(id)
);

CREATE INDEX IF NOT EXISTS idx_kb_deployment ON deployment_knowledge_bindings(deployment_id);
