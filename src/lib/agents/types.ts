// Agent system type definitions

export interface AgentConfig {
  id: string;
  employeeId: string;
  deploymentId: string;
  name: string;
  role: string;
  agentType: string;
  systemPrompt: string;
  capabilities: string[];
  tools: AgentTool[];
  knowledgeSources: KnowledgeSource[];
  /** Customer-configured deployment settings (tools, data sources, schedule) */
  deploymentConfig?: {
    deploymentName?: string;
    tools?: string[];
    dataSources?: string[];
    schedule?: string;
    customInstructions?: string;
  };
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler?: (params: Record<string, any>) => Promise<any>;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  sourceType: "faq" | "document" | "url" | "custom";
}

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, any>;
}

export interface LLMResponse {
  content: string;
  finishReason: "stop" | "tool_call" | "length" | "error";
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: ToolCall[];
  latencyMs: number;
  model: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

export interface Conversation {
  id: string;
  deploymentId: string;
  userId: string;
  title: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface TaskLog {
  id: string;
  deploymentId: string;
  conversationId?: string;
  taskType: string;
  input: string;
  output?: string;
  status: "running" | "completed" | "failed";
  durationMs?: number;
  tokensUsed?: number;
  createdAt: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  conversationId: string;
  message: AgentMessage;
  taskLog: TaskLog;
}
