// Agent registry — builds agents from deployment configs using data-driven prompts

import { BaseAgent } from "./base-agent";
import { AgentConfig, KnowledgeSource } from "./types";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { getAgentDefinition } from "./agent-prompts";

/**
 * Reconstruct an agent from a deployment ID.
 * Agents are stateless — built fresh from DB on each request.
 * Uses data-driven prompt definitions instead of separate agent classes.
 */
export function buildAgentFromDeployment(deploymentId: string): BaseAgent {
  const db = getDb();

  const deployment = db
    .prepare(
      `SELECT d.*, e.name, e.role, e.category, e.capabilities, e.system_prompt, e.agent_type
       FROM deployments d
       JOIN ai_employees e ON d.employee_id = e.id
       WHERE d.id = ?`
    )
    .get(deploymentId) as any;

  if (!deployment) {
    throw new Error(`Deployment ${deploymentId} not found`);
  }

  // Load knowledge sources for this deployment
  const knowledgeSources = db
    .prepare("SELECT * FROM knowledge_sources WHERE deployment_id = ?")
    .all(deploymentId) as any[];

  const ksSources: KnowledgeSource[] = knowledgeSources.map((ks) => ({
    id: ks.id,
    title: ks.title,
    content: ks.content,
    sourceType: ks.source_type,
  }));

  const capabilities = deployment.capabilities
    ? JSON.parse(deployment.capabilities)
    : [];

  // Parse deployment config (customer's tool/data source selections)
  const rawConfig = deployment.config ? JSON.parse(deployment.config) : {};
  const deploymentConfig = {
    deploymentName: deployment.name || undefined,
    tools: rawConfig.tools || [],
    dataSources: rawConfig.dataSources || rawConfig.data_sources || [],
    schedule: rawConfig.schedule || undefined,
    customInstructions: rawConfig.customInstructions || undefined,
  };

  const agentType = deployment.agent_type || "generic";

  const config: AgentConfig = {
    id: uuid(),
    employeeId: deployment.employee_id,
    deploymentId,
    name: deployment.name,
    role: deployment.role,
    agentType,
    systemPrompt: deployment.system_prompt || "",
    capabilities,
    tools: [],
    knowledgeSources: ksSources,
    deploymentConfig,
  };

  // All agents use BaseAgent — prompt differentiation is data-driven
  return new BaseAgent(config);
}

/**
 * Seed default knowledge sources for a deployment when it's first activated.
 * Uses the agent prompt definitions to get type-specific default knowledge.
 */
export function seedDeploymentKnowledge(deploymentId: string, agentType: string) {
  const db = getDb();

  // Check if already seeded
  const existing = db
    .prepare("SELECT COUNT(*) as count FROM knowledge_sources WHERE deployment_id = ?")
    .get(deploymentId) as any;

  if (existing.count > 0) return;

  // Get default knowledge from the agent prompt definitions
  const definition = getAgentDefinition(agentType);
  if (!definition || definition.defaultKnowledge.length === 0) return;

  const insert = db.prepare(`
    INSERT INTO knowledge_sources (id, deployment_id, title, content, source_type)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const ks of definition.defaultKnowledge) {
    insert.run(uuid(), deploymentId, ks.title, ks.content, ks.sourceType);
  }
}
