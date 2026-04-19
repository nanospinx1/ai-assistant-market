// Agent registry — maps employee/agent types to agent classes

import { BaseAgent } from "./base-agent";
import { CustomerSupportAgent, CUSTOMER_SUPPORT_DEFAULT_KNOWLEDGE } from "./customer-support-agent";
import { AgentConfig, KnowledgeSource } from "./types";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

/**
 * Reconstruct an agent from a deployment ID.
 * Agents are stateless — built fresh from DB on each request.
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

  const config: AgentConfig = {
    id: uuid(),
    employeeId: deployment.employee_id,
    deploymentId,
    name: deployment.name,
    role: deployment.role,
    agentType: deployment.agent_type || "generic",
    systemPrompt: deployment.system_prompt || "",
    capabilities,
    tools: [],
    knowledgeSources: ksSources,
  };

  // Route to specialized agent class based on type
  switch (config.agentType) {
    case "customer-support":
      return new CustomerSupportAgent(config);
    default:
      return new BaseAgent(config);
  }
}

/**
 * Seed default knowledge sources for a deployment when it's first activated.
 */
export function seedDeploymentKnowledge(deploymentId: string, agentType: string) {
  const db = getDb();

  // Check if already seeded
  const existing = db
    .prepare("SELECT COUNT(*) as count FROM knowledge_sources WHERE deployment_id = ?")
    .get(deploymentId) as any;

  if (existing.count > 0) return;

  if (agentType === "customer-support") {
    for (const ks of CUSTOMER_SUPPORT_DEFAULT_KNOWLEDGE) {
      db.prepare(`
        INSERT INTO knowledge_sources (id, deployment_id, title, content, source_type)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuid(), deploymentId, ks.title, ks.content, ks.sourceType);
    }
  }
}
