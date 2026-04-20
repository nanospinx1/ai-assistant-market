const db = require("better-sqlite3")("data/app.db");
db.exec("CREATE TABLE IF NOT EXISTS user_knowledge_library (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, category TEXT DEFAULT 'General', created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)");
db.exec("CREATE TABLE IF NOT EXISTS deployment_knowledge_bindings (id TEXT PRIMARY KEY, deployment_id TEXT NOT NULL, knowledge_id TEXT NOT NULL, enabled INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE, FOREIGN KEY (knowledge_id) REFERENCES user_knowledge_library(id) ON DELETE CASCADE)");
console.log("Tables created");
console.log("Tool conns:", db.prepare("SELECT * FROM user_tool_connections").all().length);
