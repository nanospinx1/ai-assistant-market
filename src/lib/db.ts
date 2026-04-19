import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
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
      capabilities TEXT, -- JSON array
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
      status TEXT DEFAULT 'configuring', -- configuring, deploying, active, paused, stopped
      config TEXT, -- JSON config
      deployed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (employee_id) REFERENCES ai_employees(id)
    );

    CREATE TABLE IF NOT EXISTS performance_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deployment_id TEXT NOT NULL,
      metric_type TEXT NOT NULL, -- tasks_completed, response_time, accuracy, uptime
      value REAL NOT NULL,
      recorded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (deployment_id) REFERENCES deployments(id)
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      plan TEXT NOT NULL, -- monthly, yearly
      amount REAL NOT NULL,
      status TEXT DEFAULT 'active',
      purchased_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (employee_id) REFERENCES ai_employees(id)
    );
  `);
}
