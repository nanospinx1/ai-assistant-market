-- Settings table for user preferences and profile data
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  company_name TEXT,
  industry TEXT,
  company_size TEXT,
  notification_email_errors INTEGER DEFAULT 1,
  notification_email_tasks INTEGER DEFAULT 1,
  notification_email_weekly INTEGER DEFAULT 1,
  notification_inapp TEXT DEFAULT 'all',
  notification_status_alerts INTEGER DEFAULT 1,
  default_schedule TEXT DEFAULT '24/7 Always On',
  default_model_tier TEXT DEFAULT 'auto',
  team_size TEXT DEFAULT '',
  customer_volume TEXT DEFAULT '',
  business_type TEXT DEFAULT '',
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Migration: add new profile fields if upgrading from older schema
ALTER TABLE user_settings ADD COLUMN team_size TEXT DEFAULT '';
ALTER TABLE user_settings ADD COLUMN customer_volume TEXT DEFAULT '';
ALTER TABLE user_settings ADD COLUMN business_type TEXT DEFAULT '';
