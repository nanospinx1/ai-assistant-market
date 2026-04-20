import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLLMProvider } from "@/lib/agents/llm-provider";

/**
 * POST /api/setup-assistant
 * 
 * AI-powered setup assistant that helps users configure their AI employees
 * through natural conversation. Uses function calling to return structured
 * suggestions that the frontend renders as actionable cards.
 */

const TOOL_FUNCTION = {
  type: "function" as const,
  function: {
    name: "propose_setup_changes",
    description:
      "Propose configuration changes for the AI employee. Call this when you have enough information to suggest tools, knowledge, tasks, or approval rules.",
    parameters: {
      type: "object",
      properties: {
        tools: {
          type: "array",
          description: "Tool connection suggestions",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["email", "crm", "calendar", "api", "custom"],
                description: "Tool type",
              },
              name: { type: "string", description: "Display name for this connection" },
              reason: { type: "string", description: "Why this tool is recommended" },
            },
            required: ["type", "name", "reason"],
          },
        },
        knowledge: {
          type: "array",
          description: "Knowledge entry suggestions",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Knowledge entry title" },
              content: { type: "string", description: "The knowledge content text" },
              category: { type: "string", description: "Category like FAQs, Processes, etc." },
              reason: { type: "string", description: "Why this knowledge is helpful" },
            },
            required: ["title", "content", "category", "reason"],
          },
        },
        tasks: {
          type: "array",
          description: "Scheduled task suggestions",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Task name" },
              description: { type: "string", description: "What the task does" },
              scheduleType: {
                type: "string",
                enum: ["daily", "weekly", "monthly"],
                description: "How often",
              },
              taskPrompt: {
                type: "string",
                description: "The prompt/instruction for the AI to execute this task",
              },
              reason: { type: "string", description: "Why this task is recommended" },
            },
            required: ["name", "description", "scheduleType", "taskPrompt", "reason"],
          },
        },
        approvals: {
          type: "array",
          description: "Approval rule suggestions",
          items: {
            type: "object",
            properties: {
              category: { type: "string", description: "Rule category" },
              label: { type: "string", description: "Rule description" },
              reason: { type: "string", description: "Why this rule matters" },
            },
            required: ["category", "label", "reason"],
          },
        },
      },
    },
  },
};

function buildSystemPrompt(
  agentName: string,
  agentRole: string,
  existingConfig: {
    toolNames: string[];
    knowledgeTitles: string[];
    taskNames: string[];
    approvalLabels: string[];
  }
): string {
  const existing = [];
  if (existingConfig.toolNames.length)
    existing.push(`Connected tools: ${existingConfig.toolNames.join(", ")}`);
  if (existingConfig.knowledgeTitles.length)
    existing.push(`Knowledge entries: ${existingConfig.knowledgeTitles.join(", ")}`);
  if (existingConfig.taskNames.length)
    existing.push(`Scheduled tasks: ${existingConfig.taskNames.join(", ")}`);
  if (existingConfig.approvalLabels.length)
    existing.push(`Approval rules: ${existingConfig.approvalLabels.join(", ")}`);

  const existingSection = existing.length
    ? `\n\nCurrent configuration:\n${existing.join("\n")}`
    : "\n\nThe employee has no configuration yet — starting fresh.";

  return `You are a friendly AI Setup Consultant helping a small business owner configure their AI employee named "${agentName}" (role: ${agentRole}).

Your job is to have a natural conversation to understand their business and needs, then suggest configuration items they should set up.${existingSection}

Guidelines:
- Be warm, professional, and use simple language — avoid technical jargon
- Ask 1-2 focused questions at a time, not a long list
- Start by understanding their business and what they want the AI employee to do
- IMPORTANT: As soon as the user describes their business and needs (even partially), call the propose_setup_changes function with your suggestions. Don't wait for a perfect picture — suggest what you can now and refine later.
- After the user's second message, you MUST include suggestions via the function call along with your conversational response
- Make suggestions incrementally — suggest a few items now, more later as you learn more
- When suggesting tools, only suggest the type and a friendly name — the user will configure credentials separately
- When suggesting knowledge, write actual useful content based on what the user told you
- When suggesting tasks, create practical recurring tasks with clear prompts
- When suggesting approvals, focus on safety-critical actions
- Always explain WHY each suggestion helps
- If the user mentions something you already see in the existing config, acknowledge it
- You can make multiple rounds of suggestions as the conversation progresses
- After making suggestions, ask if they want to adjust anything or if there are other areas to set up

Remember: these are small business owners who may not be tech-savvy. Make this feel like talking to a helpful consultant, not filling out forms.`;
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const { messages, deploymentId } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      deploymentId: string;
    };

    if (!deploymentId || !messages?.length) {
      return NextResponse.json(
        { error: "deploymentId and messages are required" },
        { status: 400 }
      );
    }

    // Load deployment context server-side (sanitized — no secrets)
    const db = getDb();

    const deployment = db
      .prepare("SELECT * FROM deployments WHERE id = ? AND user_id = ?")
      .get(deploymentId, user.id) as any;

    if (!deployment) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    }

    // Parse existing onboarding config (sanitized — no secrets sent to LLM)
    let existingConfig = {
      toolNames: [] as string[],
      knowledgeTitles: [] as string[],
      taskNames: [] as string[],
      approvalLabels: [] as string[],
    };

    try {
      const config = JSON.parse(deployment.config || "{}");
      const onboarding = config.onboarding || {};
      if (onboarding.connectedTools) {
        existingConfig.toolNames = onboarding.connectedTools.map(
          (t: any) => `${t.name} (${t.type})`
        );
      }
      if (onboarding.knowledge) {
        existingConfig.knowledgeTitles = onboarding.knowledge.map(
          (k: any) => `${k.title} [${k.category}]`
        );
      }
      if (config.approvalRules) {
        existingConfig.approvalLabels = config.approvalRules
          .filter((r: any) => r.enabled)
          .map((r: any) => r.label);
      }
    } catch {}

    // Load scheduled tasks
    const scheduledTasks = db
      .prepare("SELECT name FROM scheduled_tasks WHERE deployment_id = ? AND user_id = ?")
      .all(deploymentId, user.id) as any[];
    existingConfig.taskNames = scheduledTasks.map((t: any) => t.name);

    // Get agent info from deployment
    const agentName = deployment.name || "AI Employee";
    // Try to extract role from config or use a sensible default
    let agentRole = "General Assistant";
    try {
      const config = JSON.parse(deployment.config || "{}");
      if (config.role) agentRole = config.role;
    } catch {}
    if (deployment.employee_id) {
      // Use employee_id as a hint for the role
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

    // Build full message array with system prompt
    const systemPrompt = buildSystemPrompt(agentName, agentRole, existingConfig);

    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    // Call LLM with function calling
    const llm = getLLMProvider();
    const response = await llm.generate(fullMessages, {
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 4096,
      tools: [TOOL_FUNCTION],
    });

    // Build result
    const result: {
      message: string;
      suggestions?: {
        tools?: any[];
        knowledge?: any[];
        tasks?: any[];
        approvals?: any[];
      };
    } = {
      message: response.content || "",
    };

    // If the model made a tool call, extract suggestions
    if (response.toolCalls?.length) {
      const call = response.toolCalls[0];
      if (call.name === "propose_setup_changes") {
        result.suggestions = call.arguments;

        // If the model only returned a tool call with no text, generate a friendly summary
        if (!result.message) {
          const counts = [];
          if (call.arguments.tools?.length)
            counts.push(`${call.arguments.tools.length} tool${call.arguments.tools.length > 1 ? "s" : ""}`);
          if (call.arguments.knowledge?.length)
            counts.push(`${call.arguments.knowledge.length} knowledge ${call.arguments.knowledge.length > 1 ? "entries" : "entry"}`);
          if (call.arguments.tasks?.length)
            counts.push(`${call.arguments.tasks.length} task${call.arguments.tasks.length > 1 ? "s" : ""}`);
          if (call.arguments.approvals?.length)
            counts.push(`${call.arguments.approvals.length} approval rule${call.arguments.approvals.length > 1 ? "s" : ""}`);

          result.message = counts.length
            ? `Based on what you've told me, here are my suggestions — I'm recommending ${counts.join(", ")}. Take a look and accept the ones that work for you!`
            : "Let me think about the best setup for your needs...";
        }
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Setup assistant error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to get AI response" },
      { status: 500 }
    );
  }
}
