import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLLMProvider } from "@/lib/agents/llm-provider";

/**
 * POST /api/workspace-assistant
 * 
 * AI-powered assistant for the global Workspace page.
 * Helps users set up global tools and knowledge entries through conversation.
 */

const TOOL_FUNCTION = {
  type: "function" as const,
  function: {
    name: "propose_workspace_items",
    description:
      "Propose global tools and knowledge entries for the workspace. Call this when you have enough info to suggest items.",
    parameters: {
      type: "object",
      properties: {
        tools: {
          type: "array",
          description: "Tool connection suggestions",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["email", "crm", "calendar", "api", "custom"] },
              name: { type: "string", description: "Display name" },
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
              title: { type: "string" },
              content: { type: "string", description: "Actual knowledge content text" },
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

function buildSystemPrompt(existingTools: string[], existingKnowledge: string[]): string {
  const existing = [];
  if (existingTools.length) existing.push(`Connected tools: ${existingTools.join(", ")}`);
  if (existingKnowledge.length) existing.push(`Knowledge entries: ${existingKnowledge.join(", ")}`);

  const existingSection = existing.length
    ? `\n\nCurrent workspace:\n${existing.join("\n")}`
    : "\n\nThe workspace is empty — starting fresh.";

  return `You are a friendly AI Workspace Consultant helping a small business owner set up their shared tool connections and knowledge library. These are global resources that all their AI employees can access.${existingSection}

Guidelines:
- Be warm, professional, and use simple language — no technical jargon
- Ask 1-2 focused questions at a time
- Understand their business first, then suggest tools and knowledge
- IMPORTANT: As soon as the user describes their business, call the propose_workspace_items function. Don't wait for a perfect picture — suggest what you can now and refine later.
- After the user's second message, you MUST include suggestions via the function call
- When suggesting tools, only suggest type and name — user configures credentials separately
- When suggesting knowledge, write actual useful content from what the user tells you
- Focus on TOOLS (email, CRM, calendar, APIs) and KNOWLEDGE (FAQs, processes, policies, product info)
- Explain WHY each suggestion helps their business
- If the user mentions something already in the workspace, acknowledge it`;
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { messages } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "messages are required" }, { status: 400 });
    }

    const db = getDb();

    // Load existing tools (sanitized — names only, no secrets)
    const tools = db
      .prepare("SELECT name, tool_type FROM user_tool_connections WHERE user_id = ?")
      .all(user.id) as any[];
    const toolNames = tools.map((t: any) => `${t.name} (${t.tool_type})`);

    // Load existing knowledge (titles only)
    const knowledge = db
      .prepare("SELECT title, category FROM user_knowledge_library WHERE user_id = ?")
      .all(user.id) as any[];
    const knowledgeTitles = knowledge.map((k: any) => `${k.title} [${k.category}]`);

    const systemPrompt = buildSystemPrompt(toolNames, knowledgeTitles);
    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const llm = getLLMProvider();
    const response = await llm.generate(fullMessages, {
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 4096,
      tools: [TOOL_FUNCTION],
    });

    const result: {
      message: string;
      suggestions?: { tools?: any[]; knowledge?: any[] };
    } = { message: response.content || "" };

    if (response.toolCalls?.length) {
      const call = response.toolCalls[0];
      if (call.name === "propose_workspace_items") {
        result.suggestions = call.arguments;
        if (!result.message) {
          const counts = [];
          if (call.arguments.tools?.length) counts.push(`${call.arguments.tools.length} tool(s)`);
          if (call.arguments.knowledge?.length) counts.push(`${call.arguments.knowledge.length} knowledge entry/entries`);
          result.message = counts.length
            ? `Based on what you've told me, here are my suggestions — ${counts.join(" and ")}. Review and accept the ones that work for you!`
            : "Let me think about the best setup for your needs...";
        }
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Workspace assistant error:", err);
    return NextResponse.json({ error: err.message || "Failed to get AI response" }, { status: 500 });
  }
}
