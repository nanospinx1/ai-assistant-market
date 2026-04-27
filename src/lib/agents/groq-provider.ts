// Groq LLM Provider — OpenAI-compatible endpoint for fast inference

import { AgentMessage, LLMResponse } from "./types";
import { LLMProvider, LLMOptions } from "./llm-provider";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export class GroqProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY || "";
    this.baseUrl = (process.env.LLM_API_BASE || "https://api.groq.com/openai/v1").replace(/\/+$/, "");
    this.defaultModel = process.env.LLM_MODEL || DEFAULT_MODEL;

    if (!this.apiKey) {
      throw new Error("Missing LLM_API_KEY environment variable for Groq provider");
    }
  }

  async generate(messages: AgentMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const start = Date.now();
    const model = options?.model || this.defaultModel;

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.metadata?.tool_call_id ? { tool_call_id: m.metadata.tool_call_id } : {}),
      ...(m.metadata?.tool_calls ? { tool_calls: m.metadata.tool_calls } : {}),
    }));

    const body: Record<string, any> = {
      model,
      messages: formattedMessages,
      max_tokens: options?.maxTokens || 1024,
      temperature: options?.temperature ?? 0.7,
    };

    // Include tools for function calling if provided
    if (options?.tools && options.tools.length > 0) {
      body.tools = options.tools;
      body.tool_choice = "auto";
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - start;

    return this.parseResponse(data, model, latencyMs);
  }

  private parseResponse(data: any, model: string, latencyMs: number): LLMResponse {
    const choice = data.choices?.[0];
    if (!choice) {
      throw new Error("Groq API returned no choices");
    }

    const usage = data.usage || {};

    const result: LLMResponse = {
      content: choice.message?.content || "",
      finishReason: this.mapFinishReason(choice.finish_reason),
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      },
      latencyMs,
      model,
    };

    // Parse tool calls if present
    if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
      result.toolCalls = choice.message.tool_calls.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments || "{}"),
      }));
      result.finishReason = "tool_call";
    }

    return result;
  }

  private mapFinishReason(reason: string): LLMResponse["finishReason"] {
    switch (reason) {
      case "stop": return "stop";
      case "length": return "length";
      case "tool_calls": return "tool_call";
      default: return "stop";
    }
  }
}
