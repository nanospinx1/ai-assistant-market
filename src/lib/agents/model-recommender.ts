// Model recommender — analyzes agent config and recommends optimal model tier

import { ModelConfig, ModelTier, MODEL_REGISTRY, TIER_INFO, getModelsByTier } from "./model-registry";

export interface RecommendationInput {
  agentType: string;
  toolsCount: number;
  dataSourcesCount: number;
  capabilitiesCount: number;
  knowledgeContentSize: number; // approximate chars of knowledge base
  schedule: string;
}

export interface ModelRecommendation {
  modelId: string;
  modelDisplayName: string;
  tier: ModelTier;
  tierLabel: string;
  tierDescription: string;
  reasoning: string[];
  estimatedCostPerMessage: number; // USD estimate
  complexityScore: number;
  alternatives: AlternativeModel[];
}

interface AlternativeModel {
  modelId: string;
  modelDisplayName: string;
  tier: ModelTier;
  tradeoff: string;
}

// Complexity weights per agent type
const AGENT_TYPE_COMPLEXITY: Record<string, number> = {
  "customer-support": 1.0,
  "content-writer": 2.0,
  "social-media": 1.5,
  "email-marketing": 1.5,
  "scheduler": 1.0,
  "hr-assistant": 2.0,
  "data-analyst": 3.5,
  "it-support": 2.5,
  "sales-assistant": 2.0,
  "accountant": 3.0,
  "generic": 2.0,
};

/**
 * Analyze the agent configuration and recommend the best model.
 *
 * Scoring:
 *   - Agent type base complexity (1-3.5)
 *   - +0.3 per tool (tools increase prompt complexity)
 *   - +0.2 per data source
 *   - +1.0 per 5000 chars of knowledge content (big context needs smarter model)
 *   - 24/7 schedule: no modifier, business hours: -0.5 (lower volume expected)
 *
 * Tier mapping:
 *   Score 0-2   → nano
 *   Score 2-3.5 → mini
 *   Score 3.5-5 → standard
 *   Score 5-7   → pro
 *   Score 7+    → premium
 */
export function recommendModel(input: RecommendationInput): ModelRecommendation {
  const reasoning: string[] = [];

  // Base complexity from agent type
  const baseComplexity = AGENT_TYPE_COMPLEXITY[input.agentType] ?? 2.0;
  reasoning.push(`Agent type "${input.agentType}" base complexity: ${baseComplexity}`);

  // Tools complexity
  const toolsScore = input.toolsCount * 0.3;
  if (input.toolsCount > 0) {
    reasoning.push(`${input.toolsCount} tools configured (+${toolsScore.toFixed(1)})`);
  }

  // Data sources complexity
  const dataScore = input.dataSourcesCount * 0.2;
  if (input.dataSourcesCount > 0) {
    reasoning.push(`${input.dataSourcesCount} data sources (+${dataScore.toFixed(1)})`);
  }

  // Knowledge base size
  const knowledgeScore = Math.floor(input.knowledgeContentSize / 5000) * 1.0;
  if (knowledgeScore > 0) {
    reasoning.push(`Large knowledge base (~${Math.round(input.knowledgeContentSize / 1000)}K chars, +${knowledgeScore.toFixed(1)})`);
  }

  // Schedule modifier
  let scheduleModifier = 0;
  if (input.schedule.includes("Business Hours")) {
    scheduleModifier = -0.5;
    reasoning.push("Business hours schedule (lower volume, -0.5)");
  }

  const totalScore = baseComplexity + toolsScore + dataScore + knowledgeScore + scheduleModifier;
  reasoning.push(`Total complexity score: ${totalScore.toFixed(1)}`);

  // Map score to tier
  const tier = scoreTotier(totalScore);
  reasoning.push(`Recommended tier: ${TIER_INFO[tier].label} — ${TIER_INFO[tier].description}`);

  // Pick the best available model for this tier
  // Since we have 2 models available, route: nano+mini → gpt-4o-mini, standard+ → gpt-4o
  let selectedModel: ModelConfig;
  if (tier === "nano" || tier === "mini") {
    selectedModel = MODEL_REGISTRY["gpt-4o-mini"];
  } else {
    selectedModel = MODEL_REGISTRY["gpt-4o"];
  }

  return buildRecommendation(selectedModel, tier, totalScore, reasoning);
}

function scoreTotier(score: number): ModelTier {
  if (score < 2) return "nano";
  if (score < 3.5) return "mini";
  if (score < 5) return "standard";
  if (score < 7) return "pro";
  return "premium";
}

function buildRecommendation(
  model: ModelConfig,
  tier: ModelTier,
  score: number,
  reasoning: string[]
): ModelRecommendation {
  // Estimate cost per message (assume ~500 input tokens, ~300 output tokens per message)
  const estimatedCostPerMessage =
    (500 / 1000) * model.costPer1kInput + (300 / 1000) * model.costPer1kOutput;

  // Build alternatives (one tier up, one tier down)
  const alternatives: AlternativeModel[] = [];
  const tierOrder: ModelTier[] = ["nano", "mini", "standard", "pro", "premium"];
  const tierIdx = tierOrder.indexOf(tier);

  if (tierIdx > 0) {
    const lowerTier = tierOrder[tierIdx - 1];
    const lowerModels = getModelsByTier(lowerTier);
    if (lowerModels.length > 0) {
      alternatives.push({
        modelId: lowerModels[0].id,
        modelDisplayName: lowerModels[0].displayName,
        tier: lowerTier,
        tradeoff: "Lower cost, may reduce quality for complex queries",
      });
    }
  }

  if (tierIdx < tierOrder.length - 1) {
    const higherTier = tierOrder[tierIdx + 1];
    const higherModels = getModelsByTier(higherTier);
    if (higherModels.length > 0) {
      alternatives.push({
        modelId: higherModels[0].id,
        modelDisplayName: higherModels[0].displayName,
        tier: higherTier,
        tradeoff: "Higher quality, increased cost per message",
      });
    }
  }

  return {
    modelId: model.id,
    modelDisplayName: model.displayName,
    tier,
    tierLabel: TIER_INFO[tier].label,
    tierDescription: TIER_INFO[tier].description,
    reasoning,
    estimatedCostPerMessage,
    complexityScore: score,
    alternatives,
  };
}
