// Tool executor — central dispatcher for agent tool calls
// Routes tool_call responses from LLM to the appropriate tool handler

import { ToolHandler, ToolExecutionResult, ToolConnection, OpenAIFunctionSchema } from "./types";
import { EmailTool } from "./email-tool";
import { CRMTool } from "./crm-tool";
import { CalendarTool } from "./calendar-tool";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

// Registry of available tool handlers
const TOOL_HANDLERS: Record<string, ToolHandler> = {
  email: new EmailTool(),
  crm: new CRMTool(),
  calendar: new CalendarTool(),
};

// Map display names (from deploy config) to tool type IDs
const TOOL_NAME_MAP: Record<string, string> = {
  "Email": "email",
  "Live Chat": "chat",
  "Phone": "phone",
  "CRM": "crm",
  "Calendar": "calendar",
  "Analytics": "analytics",
  "API": "api",
  "Custom": "custom",
};

/**
 * Get function schemas for all tools enabled in a deployment.
 * These are passed to the LLM for function calling.
 */
export function getToolSchemas(enabledTools: string[]): OpenAIFunctionSchema[] {
  const schemas: OpenAIFunctionSchema[] = [];

  for (const toolName of enabledTools) {
    const toolType = TOOL_NAME_MAP[toolName] || toolName.toLowerCase();
    const handler = TOOL_HANDLERS[toolType];
    if (handler) {
      schemas.push(...handler.getFunctionSchemas());
    }
  }

  return schemas;
}

/**
 * Execute a tool call from the LLM.
 * Looks up the function name across all handlers, finds the right one, and executes.
 */
export async function executeTool(
  functionName: string,
  params: Record<string, any>,
  deploymentId: string,
  conversationId?: string,
  userId?: string
): Promise<ToolExecutionResult> {
  // Find which handler owns this function
  let matchedHandler: ToolHandler | null = null;
  for (const handler of Object.values(TOOL_HANDLERS)) {
    const schemas = handler.getFunctionSchemas();
    if (schemas.some((s) => s.function.name === functionName)) {
      matchedHandler = handler;
      break;
    }
  }

  if (!matchedHandler) {
    return {
      success: false,
      output: null,
      error: `No handler found for function: ${functionName}`,
    };
  }

  // Load user's tool connection for this tool type (if configured)
  let connection: ToolConnection | undefined;
  if (userId) {
    const db = getDb();
    const binding = db
      .prepare(
        `SELECT utc.* FROM deployment_tool_bindings dtb
         JOIN user_tool_connections utc ON dtb.connection_id = utc.id
         WHERE dtb.deployment_id = ? AND dtb.tool_type = ? AND dtb.enabled = 1`
      )
      .get(deploymentId, matchedHandler.type) as any;

    if (binding) {
      connection = {
        id: binding.id,
        userId: binding.user_id,
        toolType: binding.tool_type,
        name: binding.name,
        config: JSON.parse(binding.config || "{}"),
        status: binding.status,
      };
    }
  }

  // Execute the tool
  const result = await matchedHandler.execute(functionName, params, connection);

  // Log the execution
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO tool_execution_logs (id, deployment_id, conversation_id, tool_type, action, input, output, status, duration_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuid(),
      deploymentId,
      conversationId || null,
      matchedHandler.type,
      functionName,
      JSON.stringify(params),
      JSON.stringify(result.output),
      result.success ? "success" : "error",
      result.durationMs || 0
    );
  } catch {
    // Don't let logging errors affect tool execution
  }

  return result;
}

/**
 * Get all available tool types with their definitions.
 */
export function getAvailableTools() {
  return Object.entries(TOOL_HANDLERS).map(([toolType, handler]) => {
    const def = handler.getDefinition();
    return { ...def, type: toolType };
  });
}

/**
 * Validate a tool connection configuration.
 */
export function validateToolConnection(toolType: string, config: Record<string, any>) {
  const handler = TOOL_HANDLERS[toolType];
  if (!handler) {
    return { valid: false, error: `Unknown tool type: ${toolType}` };
  }
  return handler.validateConnection(config);
}
