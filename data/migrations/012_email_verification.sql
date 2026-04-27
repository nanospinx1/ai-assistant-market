-- Email verification support
-- Each ALTER TABLE must be a separate statement for SQLite
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 1;

ALTER TABLE users ADD COLUMN verify_code TEXT;

ALTER TABLE users ADD COLUMN verify_code_expires_at TEXT;
