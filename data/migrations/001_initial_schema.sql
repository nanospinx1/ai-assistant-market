-- Migration 001: Initial schema (baseline)
-- This captures the existing schema so future migrations can build on it.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  company TEXT,
  avatar TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  capabilities TEXT,
  price_monthly REAL NOT NULL,
  price_yearly REAL,
  rating REAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  avatar TEXT,
  status TEXT DEFAULT 'available',
  is_prebuilt INTEGER DEFAULT 1,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'configuring',
  config TEXT,
  deployed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (employee_id) REFERENCES ai_employees(id)
);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deployment_id TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value REAL NOT NULL,
  recorded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id)
);

CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'active',
  purchased_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (employee_id) REFERENCES ai_employees(id)
);
