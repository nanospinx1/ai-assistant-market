// Azure OpenAI LLM Provider — calls real Azure OpenAI REST API

import { AgentMessage, LLMResponse } from "./types";
import { LLMProvider, LLMOptions } from "./llm-provider";
import { ModelConfig, getModelConfig, getModelApiKey, MODEL_REGISTRY } from "./model-registry";

const DEFAULT_MODEL = "gpt-4o-mini";

export class AzureOpenAIProvider implements LLMProvider {
  async generate(messages: AgentMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const start = Date.now();

    const modelId = options?.model || DEFAULT_MODEL;
    const modelConfig = getModelConfig(modelId);
    if (!modelConfig) {
      throw new Error(`Unknown model: ${modelId}. Available: ${Object.keys(MODEL_REGISTRY).join(", ")}`);
    }

    const apiKey = getModelApiKey(modelConfig);
    const url = this.buildUrl(modelConfig);

    const body = this.buildRequestBody(messages, modelConfig, options);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Azure OpenAI API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - start;

    return this.parseResponse(data, modelId, latencyMs);
  }

  /**
   * Build the API URL for Azure OpenAI REST API.
   * Standard format: {endpoint}/openai/deployments/{deployment}/chat/completions?api-version={version}
   */
  private buildUrl(model: ModelConfig): string {
    const endpoint = model.endpoint.replace(/\/+$/, "");
    return `${endpoint}/openai/deployments/${model.deploymentName}/chat/completions?api-version=${model.apiVersion}`;
  }

  /**
   * Build the request body. Adapts based on model capabilities.
   */
  private buildRequestBody(
    messages: AgentMessage[],
    model: ModelConfig,
    options?: LLMOptions
  ): Record<string, any> {
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.metadata?.tool_call_id ? { tool_call_id: m.metadata.tool_call_id } : {}),
      ...(m.metadata?.tool_calls ? { tool_calls: m.metadata.tool_calls } : {}),
    }));

    const body: Record<string, any> = {
      messages: formattedMessages,
      max_tokens: options?.maxTokens || 1024,
    };

    // Reasoning models (o4-mini) don't support temperature
    if (!model.id.startsWith("o4")) {
      body.temperature = options?.temperature ?? 0.7;
    }

    // Include tools for function calling if provided
    if (options?.tools && options.tools.length > 0) {
      body.tools = options.tools;
      body.tool_choice = "auto";
    }

    return body;
  }

  /**
   * Parse Azure OpenAI API response into our LLMResponse format.
   */
  private parseResponse(data: any, modelId: string, latencyMs: number): LLMResponse {
    const choice = data.choices?.[0];
    if (!choice) {
      throw new Error("Azure OpenAI returned no choices");
    }

    const usage = data.usage || {};

    const response: LLMResponse = {
      content: choice.message?.content || "",
      finishReason: this.mapFinishReason(choice.finish_reason),
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      },
      latencyMs,
      model: modelId,
    };

    // Parse tool calls if present
    if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
      response.toolCalls = choice.message.tool_calls.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments || "{}"),
      }));
      response.finishReason = "tool_call";
    }

    return response;
  }

  private mapFinishReason(reason: string): LLMResponse["finishReason"] {
    switch (reason) {
      case "stop":
        return "stop";
      case "length":
        return "length";
      case "tool_calls":
        return "tool_call";
      default:
        return "stop";
    }
  }
}
