import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "app.db");
const MIGRATIONS_DIR = path.join(process.cwd(), "data", "migrations");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
  }
  return db;
}

/**
 * Simple migration runner.
 * Tracks applied migrations in a `schema_migrations` table.
 * Migration files are numbered SQL files in data/migrations/.
 */
function runMigrations(database: Database.Database) {
  // Ensure migration tracking table exists
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Read available migration files
  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f: string) => f.endsWith(".sql"))
    .sort();

  // Get already-applied versions
  const applied = new Set(
    database
      .prepare("SELECT version FROM schema_migrations")
      .all()
      .map((row: any) => row.version)
  );

  // Apply pending migrations in order
  for (const file of files) {
    const version = file.replace(".sql", "");
    if (applied.has(version)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");

    database.transaction(() => {
      // Split on semicolons and execute each statement
      const statements = sql
        .split(";")
        .map((s: string) => {
          // Strip leading comment lines from each chunk
          const lines = s.split("\n");
          const nonCommentLines = lines.filter(
            (line: string) => !line.trim().startsWith("--") && line.trim().length > 0
          );
          return nonCommentLines.join("\n").trim();
        })
        .filter((s: string) => s.length > 0);

      for (const stmt of statements) {
        try {
          database.exec(stmt + ";");
        } catch (err: any) {
          // Ignore "duplicate column" errors from re-running ALTER TABLE
          if (err.message?.includes("duplicate column")) continue;
          // Ignore "already exists" errors for CREATE IF NOT EXISTS idempotency
          if (err.message?.includes("already exists")) continue;
          throw err;
        }
      }

      database
        .prepare("INSERT INTO schema_migrations (version) VALUES (?)")
        .run(version);
    })();

    console.log(`[migration] Applied: ${file}`);
  }
}
