// Model registry — defines available Azure OpenAI models, their capabilities, and cost tiers

export interface ModelConfig {
  id: string;
  displayName: string;
  tier: ModelTier;
  provider: "azure-openai" | "groq";
  endpoint: string;
  apiKeyEnv: string;
  apiVersion: string;
  deploymentName: string;
  maxContextTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  capabilities: ModelCapability[];
  latencyClass: "fast" | "standard" | "slow";
}

export type ModelTier = "nano" | "mini" | "standard" | "pro" | "premium";

export type ModelCapability =
  | "chat"
  | "reasoning"
  | "code"
  | "analysis"
  | "creative"
  | "multilingual"
  | "long-context"
  | "tool-use";

/**
 * Get Azure OpenAI endpoint from env var. Falls back to empty string if not set.
 */
function getAzureEndpoint(): string {
  return process.env.AZURE_OPENAI_ENDPOINT || "";
}

/**
 * Available model configurations.
 * Only models with verified working Azure deployments are included.
 * Endpoints and API keys are loaded from environment variables at runtime.
 */
export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // Groq models (OpenAI-compatible, fast inference)
  "llama-3.3-70b-versatile": {
    id: "llama-3.3-70b-versatile",
    displayName: "Llama 3.3 70B",
    tier: "standard",
    provider: "groq",
    endpoint: process.env.LLM_API_BASE || "https://api.groq.com/openai/v1",
    apiKeyEnv: "LLM_API_KEY",
    apiVersion: "",
    deploymentName: "llama-3.3-70b-versatile",
    maxContextTokens: 128000,
    costPer1kInput: 0.0,
    costPer1kOutput: 0.0,
    capabilities: ["chat", "code", "analysis", "creative", "multilingual", "tool-use"],
    latencyClass: "fast",
  },
  "llama-3.1-8b-instant": {
    id: "llama-3.1-8b-instant",
    displayName: "Llama 3.1 8B",
    tier: "mini",
    provider: "groq",
    endpoint: process.env.LLM_API_BASE || "https://api.groq.com/openai/v1",
    apiKeyEnv: "LLM_API_KEY",
    apiVersion: "",
    deploymentName: "llama-3.1-8b-instant",
    maxContextTokens: 128000,
    costPer1kInput: 0.0,
    costPer1kOutput: 0.0,
    capabilities: ["chat", "code", "multilingual"],
    latencyClass: "fast",
  },
  // Azure OpenAI models (kept for reference, requires Azure env vars)
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    tier: "mini",
    provider: "azure-openai",
    get endpoint() { return getAzureEndpoint(); },
    apiKeyEnv: "AZURE_OPENAI_API_KEY_PRIMARY",
    apiVersion: "2024-12-01-preview",
    deploymentName: "gpt-4o-mini",
    maxContextTokens: 128000,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    capabilities: ["chat", "code", "multilingual"],
    latencyClass: "fast",
  },
  "gpt-4o": {
    id: "gpt-4o",
    displayName: "GPT-4o",
    tier: "standard",
    provider: "azure-openai",
    get endpoint() { return getAzureEndpoint(); },
    apiKeyEnv: "AZURE_OPENAI_API_KEY_PRIMARY",
    apiVersion: "2024-12-01-preview",
    deploymentName: "gpt-4o",
    maxContextTokens: 128000,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
    capabilities: ["chat", "code", "analysis", "creative", "multilingual", "tool-use"],
    latencyClass: "standard",
  },
};

/**
 * Get a model config by ID. Returns undefined if not found.
 */
export function getModelConfig(modelId: string): ModelConfig | undefined {
  return MODEL_REGISTRY[modelId];
}

/**
 * Get all models for a specific tier.
 */
export function getModelsByTier(tier: ModelTier): ModelConfig[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.tier === tier);
}

/**
 * Get the API key for a model from environment variables.
 */
export function getModelApiKey(model: ModelConfig): string {
  const key = process.env[model.apiKeyEnv];
  if (!key) {
    throw new Error(`Missing API key env var: ${model.apiKeyEnv}`);
  }
  return key;
}

/**
 * Tier display info for UI
 */
export const TIER_INFO: Record<ModelTier, { label: string; description: string; color: string }> = {
  nano: { label: "Economy", description: "Simple FAQ & greetings (→ routes to Mini)", color: "emerald" },
  mini: { label: "Mini", description: "Fast & cost-effective for standard tasks", color: "blue" },
  standard: { label: "Standard", description: "Full-powered for complex tasks & analysis", color: "violet" },
  pro: { label: "Pro", description: "Advanced reasoning (→ routes to Standard)", color: "amber" },
  premium: { label: "Premium", description: "Most capable (→ routes to Standard)", color: "rose" },
};
