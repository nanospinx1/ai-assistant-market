/**
 * Config-versions repository — config_versions table.
 */
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export function list(deploymentId: string) {
  return getDb()
    .prepare("SELECT * FROM config_versions WHERE deployment_id = ? ORDER BY version_number DESC")
    .all(deploymentId) as any[];
}

export function findByVersion(deploymentId: string, version: number) {
  return getDb()
    .prepare("SELECT * FROM config_versions WHERE deployment_id = ? AND version_number = ?")
    .get(deploymentId, version) as any;
}

export function getLatestVersionNumber(deploymentId: string): number {
  const row = getDb()
    .prepare("SELECT MAX(version_number) as max FROM config_versions WHERE deployment_id = ?")
    .get(deploymentId) as any;
  return row?.max ?? 0;
}

export function create(params: {
  deploymentId: string;
  config: Record<string, unknown>;
  changeType: string;
  changeDescription: string;
  changedBy: string;
}): any {
  const db = getDb();
  const nextVersion = getLatestVersionNumber(params.deploymentId) + 1;
  const id = uuid();
  db.prepare(`
    INSERT INTO config_versions (id, deployment_id, version_number, config_snapshot, change_type, change_description, changed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, params.deploymentId, nextVersion, JSON.stringify(params.config), params.changeType, params.changeDescription, params.changedBy);
  return db.prepare("SELECT * FROM config_versions WHERE id = ?").get(id);
}
