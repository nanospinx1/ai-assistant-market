import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLLMProvider } from "@/lib/agents/llm-provider";

/**
 * POST /api/ai-assistant
 *
 * Unified AI assistant endpoint. Adapts its persona, tools, and context
 * based on the `scope` parameter (which page the user is on).
 */

/* ------------------------------------------------------------------ */
/*  Function schemas per scope                                          */
/* ------------------------------------------------------------------ */

const CONFIGURE_FUNCTION = {
  type: "function" as const,
  function: {
    name: "propose_setup_changes",
    description: "Propose configuration changes for the AI employee.",
    parameters: {
      type: "object",
      properties: {
        tools: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["email", "crm", "calendar", "api", "custom"] },
              name: { type: "string" },
              reason: { type: "string" },
            },
            required: ["type", "name", "reason"],
          },
        },
        knowledge: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              content: { type: "string" },
              category: { type: "string" },
              reason: { type: "string" },
            },
            required: ["title", "content", "category", "reason"],
          },
        },
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              scheduleType: { type: "string", enum: ["daily", "weekly", "monthly"] },
              taskPrompt: { type: "string" },
              reason: { type: "string" },
            },
            required: ["name", "description", "scheduleType", "taskPrompt", "reason"],
          },
        },
        approvals: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              label: { type: "string" },
              reason: { type: "string" },
            },
            required: ["category", "label", "reason"],
          },
        },
      },
    },
  },
};

const RESOURCES_FUNCTION = {
  type: "function" as const,
  function: {
    name: "propose_workspace_items",
    description: "Propose global tools and knowledge entries for the workspace.",
    parameters: {
      type: "object",
      properties: {
        tools: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["email", "crm", "calendar", "api", "custom"] },
              name: { type: "string" },
              reason: { type: "string" },
            },
            required: ["type", "name", "reason"],
          },
        },
        knowledge: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              content: { type: "string" },
              category: { type: "string" },
              reason: { type: "string" },
            },
            required: ["title", "content", "category", "reason"],
          },
        },
      },
    },
  },
};

const APPROVALS_FUNCTION = {
  type: "function" as const,
  function: {
    name: "propose_approval_rules",
    description: "Propose approval rules to keep AI employees safe and accountable.",
    parameters: {
      type: "object",
      properties: {
        approvals: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              label: { type: "string" },
              reason: { type: "string" },
            },
            required: ["category", "label", "reason"],
          },
        },
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  System prompt builders                                              */
/* ------------------------------------------------------------------ */

function buildConfigurePrompt(
  agentName: string,
  agentRole: string,
  existing: { toolNames: string[]; knowledgeTitles: string[]; taskNames: string[]; approvalLabels: string[] }
): string {
  const parts: string[] = [];
  if (existing.toolNames.length) parts.push(`Connected tools: ${existing.toolNames.join(", ")}`);
  if (existing.knowledgeTitles.length) parts.push(`Knowledge: ${existing.knowledgeTitles.join(", ")}`);
  if (existing.taskNames.length) parts.push(`Tasks: ${existing.taskNames.join(", ")}`);
  if (existing.approvalLabels.length) parts.push(`Approvals: ${existing.approvalLabels.join(", ")}`);
  const existingSection = parts.length ? `\n\nCurrent config:\n${parts.join("\n")}` : "\n\nStarting fresh — no config yet.";

  return `You are a friendly AI Setup Consultant helping configure an AI employee named "${agentName}" (role: ${agentRole}).${existingSection}

Guidelines:
- Be warm, use simple language — no jargon
- Ask 1-2 focused questions at a time
- IMPORTANT: After the user's second message, MUST call propose_setup_changes with suggestions
- Suggest incrementally — a few items now, more later
- When suggesting tools, only suggest type and name — user configures credentials separately
- When suggesting knowledge, write actual useful content
- Explain WHY each suggestion helps`;
}

function buildResourcesPrompt(toolNames: string[], knowledgeTitles: string[]): string {
  const parts: string[] = [];
  if (toolNames.length) parts.push(`Connected tools: ${toolNames.join(", ")}`);
  if (knowledgeTitles.length) parts.push(`Knowledge entries: ${knowledgeTitles.join(", ")}`);
  const existingSection = parts.length ? `\n\nCurrent workspace:\n${parts.join("\n")}` : "\n\nWorkspace is empty — starting fresh.";

  return `You are a friendly AI Workspace Consultant helping set up shared tool connections and knowledge library for all AI employees.${existingSection}

Guidelines:
- Be warm, use simple language — no jargon
- Ask 1-2 focused questions, then suggest
- IMPORTANT: After the user's second message, MUST call propose_workspace_items
- Focus on TOOLS (email, CRM, calendar, APIs) and KNOWLEDGE (FAQs, processes, policies)
- Explain WHY each suggestion helps their business`;
}

function buildApprovalsPrompt(existingRules: string[]): string {
  const existingSection = existingRules.length
    ? `\n\nCurrent approval rules:\n${existingRules.join(", ")}`
    : "\n\nNo approval rules yet.";

  return `You are a friendly AI Safety Consultant helping set up approval rules for AI employees. These rules determine which actions need human approval before the AI can proceed.${existingSection}

Guidelines:
- Be warm, use simple language
- Ask about their business and concerns, then suggest rules
- IMPORTANT: After the user's second message, MUST call propose_approval_rules
- Focus on financial safety, customer communication, data handling, and external actions
- Explain WHY each rule matters for their peace of mind`;
}

function buildGeneralPrompt(scope: string, context: string): string {
  return `You are a friendly AI assistant for the AI Market platform — a marketplace where small businesses hire, deploy, and manage AI employees.

The user is currently on the ${scope} page.${context ? `\n\nContext:\n${context}` : ""}

Guidelines:
- Be warm, helpful, and use simple language
- Help users understand the platform and guide them
- Answer questions about AI employees, deployment, performance, etc.
- If they describe a need, suggest which section of the platform can help
- Keep responses concise and actionable`;
}

/* ------------------------------------------------------------------ */
/*  Context loaders                                                     */
/* ------------------------------------------------------------------ */

function loadDeploymentContext(db: any, deploymentId: string, userId: string) {
  const deployment = db
    .prepare("SELECT * FROM deployments WHERE id = ? AND user_id = ?")
    .get(deploymentId, userId) as any;

  if (!deployment) return null;

  const existing = { toolNames: [] as string[], knowledgeTitles: [] as string[], taskNames: [] as string[], approvalLabels: [] as string[] };

  try {
    const config = JSON.parse(deployment.config || "{}");
    const onboarding = config.onboarding || {};
    if (onboarding.connectedTools) existing.toolNames = onboarding.connectedTools.map((t: any) => `${t.name} (${t.type})`);
    if (onboarding.knowledge) existing.knowledgeTitles = onboarding.knowledge.map((k: any) => `${k.title} [${k.category}]`);
    if (config.approvalRules) existing.approvalLabels = config.approvalRules.filter((r: any) => r.enabled).map((r: any) => r.label);
  } catch {}

  const tasks = db.prepare("SELECT name FROM scheduled_tasks WHERE deployment_id = ? AND user_id = ?").all(deploymentId, userId) as any[];
  existing.taskNames = tasks.map((t: any) => t.name);

  let agentName = deployment.name || "AI Employee";
  let agentRole = "General Assistant";
  try {
    const config = JSON.parse(deployment.config || "{}");
    if (config.role) agentRole = config.role;
  } catch {}
  if (deployment.employee_id) {
    const empId = deployment.employee_id as string;
    if (empId.includes("support")) agentRole = "Customer Support";
    else if (empId.includes("sales")) agentRole = "Sales Assistant";
    else if (empId.includes("data") || empId.includes("analyst")) agentRole = "Data Analyst";
    else if (empId.includes("content") || empId.includes("writer")) agentRole = "Content Writer";
    else if (empId.includes("bookkeeper") || empId.includes("finance")) agentRole = "Finance/Bookkeeper";
    else if (empId.includes("scheduler") || empId.includes("calendar")) agentRole = "Scheduling Assistant";
    else if (empId.includes("hr")) agentRole = "HR Assistant";
    else if (empId.includes("marketing")) agentRole = "Marketing Assistant";
  }

  return { deployment, existing, agentName, agentRole };
}

function loadWorkspaceContext(db: any, userId: string) {
  const tools = db.prepare("SELECT name, tool_type FROM user_tool_connections WHERE user_id = ?").all(userId) as any[];
  const knowledge = db.prepare("SELECT title, category FROM user_knowledge_library WHERE user_id = ?").all(userId) as any[];
  return {
    toolNames: tools.map((t: any) => `${t.name} (${t.tool_type})`),
    knowledgeTitles: knowledge.map((k: any) => `${k.title} [${k.category}]`),
  };
}

function loadApprovalsContext(db: any, userId: string) {
  // Load global approval rules from deployments
  const deployments = db.prepare("SELECT config FROM deployments WHERE user_id = ?").all(userId) as any[];
  const rules: string[] = [];
  for (const dep of deployments) {
    try {
      const config = JSON.parse(dep.config || "{}");
      if (config.approvalRules) {
        for (const r of config.approvalRules) {
          if (r.enabled && !rules.includes(r.label)) rules.push(r.label);
        }
      }
    } catch {}
  }
  return rules;
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                        */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { messages, scope, deploymentId } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      scope: string;
      deploymentId?: string;
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "messages are required" }, { status: 400 });
    }

    const db = getDb();
    let systemPrompt: string;
    let tools: any[] = [];

    switch (scope) {
      case "configure": {
        if (!deploymentId) return NextResponse.json({ error: "deploymentId required for configure scope" }, { status: 400 });
        const ctx = loadDeploymentContext(db, deploymentId, user.id);
        if (!ctx) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
        systemPrompt = buildConfigurePrompt(ctx.agentName, ctx.agentRole, ctx.existing);
        tools = [CONFIGURE_FUNCTION];
        break;
      }
      case "resources": {
        const { toolNames, knowledgeTitles } = loadWorkspaceContext(db, user.id);
        systemPrompt = buildResourcesPrompt(toolNames, knowledgeTitles);
        tools = [RESOURCES_FUNCTION];
        break;
      }
      case "approvals": {
        const rules = loadApprovalsContext(db, user.id);
        systemPrompt = buildApprovalsPrompt(rules);
        tools = [APPROVALS_FUNCTION];
        break;
      }
      default: {
        // General / marketplace / performance / dashboard — conversational only
        let contextInfo = "";
        if (scope === "employees" || scope === "dashboard") {
          const deps = db.prepare("SELECT name, status FROM deployments WHERE user_id = ?").all(user.id) as any[];
          if (deps.length) contextInfo = `User has ${deps.length} AI employee(s): ${deps.map((d: any) => `${d.name} (${d.status})`).join(", ")}`;
        } else if (scope === "performance") {
          const deps = db.prepare("SELECT name, status FROM deployments WHERE user_id = ?").all(user.id) as any[];
          if (deps.length) contextInfo = `User has ${deps.length} deployed AI employee(s). Performance data is displayed on this page.`;
        } else if (scope === "marketplace") {
          contextInfo = "User is browsing the AI employee marketplace. Help them find the right AI employee for their needs.";
        }
        systemPrompt = buildGeneralPrompt(scope, contextInfo);
        break;
      }
    }

    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const llm = getLLMProvider();
    const response = await llm.generate(fullMessages, {
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 4096,
      ...(tools.length ? { tools } : {}),
    });

    const result: { message: string; suggestions?: any } = { message: response.content || "" };

    if (response.toolCalls?.length) {
      const call = response.toolCalls[0];
      result.suggestions = call.arguments;

      if (!result.message) {
        const counts: string[] = [];
        if (call.arguments.tools?.length) counts.push(`${call.arguments.tools.length} tool(s)`);
        if (call.arguments.knowledge?.length) counts.push(`${call.arguments.knowledge.length} knowledge entry/entries`);
        if (call.arguments.tasks?.length) counts.push(`${call.arguments.tasks.length} task(s)`);
        if (call.arguments.approvals?.length) counts.push(`${call.arguments.approvals.length} approval rule(s)`);
        result.message = counts.length
          ? `Here are my suggestions — ${counts.join(" and ")}. Review and accept the ones that work for you!`
          : "Let me think about the best setup for your needs...";
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("AI assistant error:", err);
    return NextResponse.json({ error: err.message || "Failed to get AI response" }, { status: 500 });
  }
}
