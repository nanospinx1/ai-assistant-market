// Tool type definitions for the agent tool execution framework

export interface ToolDefinition {
  type: string;
  name: string;
  description: string;
  actions: ToolAction[];
}

export interface ToolAction {
  name: string;
  description: string;
  parameters: ToolParameter[];
}

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  enum?: string[];
}

export interface ToolExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  durationMs?: number;
}

export interface ToolConnection {
  id: string;
  userId: string;
  toolType: string;
  name: string;
  config: Record<string, any>;
  status: string;
}

/** OpenAI function calling schema format */
export interface OpenAIFunctionSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required: string[];
    };
  };
}

export interface ToolHandler {
  type: string;
  getDefinition(): ToolDefinition;
  getFunctionSchemas(): OpenAIFunctionSchema[];
  execute(action: string, params: Record<string, any>, connection?: ToolConnection): Promise<ToolExecutionResult>;
  validateConnection(config: Record<string, any>): { valid: boolean; error?: string };
}
