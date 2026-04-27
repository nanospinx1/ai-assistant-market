-- Config versioning: track every configuration change for hot-apply
CREATE TABLE IF NOT EXISTS config_versions (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  config_snapshot TEXT NOT NULL DEFAULT '{}',
  changed_fields TEXT DEFAULT '[]',
  change_summary TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_config_versions_deployment
  ON config_versions(deployment_id, version DESC);
