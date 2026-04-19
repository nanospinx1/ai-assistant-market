// LLM provider abstraction — mock for now, swap to OpenAI via env var

import { AgentMessage, LLMResponse } from "./types";

export interface LLMProvider {
  generate(messages: AgentMessage[], options?: LLMOptions): Promise<LLMResponse>;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  tools?: any[]; // OpenAI function calling tool schemas
}

/**
 * Mock LLM provider that generates contextual responses
 * based on the system prompt and conversation history.
 */
export class MockLLMProvider implements LLMProvider {
  async generate(messages: AgentMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const start = Date.now();

    const systemMsg = messages.find((m) => m.role === "system");
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const userText = lastUserMsg?.content?.toLowerCase() || "";

    // Simulate latency (200-800ms)
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 600));

    const content = this.generateResponse(userText, systemMsg?.content || "");

    const promptTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
    const completionTokens = Math.ceil(content.length / 4);

    return {
      content,
      finishReason: "stop",
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      latencyMs: Date.now() - start,
      model: "mock-v1",
    };
  }

  private generateResponse(userText: string, systemPrompt: string): string {
    // Customer Support Agent responses
    if (systemPrompt.includes("customer support") || systemPrompt.includes("Customer Support")) {
      return this.customerSupportResponse(userText);
    }
    // Data Analyst responses
    if (systemPrompt.includes("data analy") || systemPrompt.includes("Data Analy")) {
      return this.dataAnalystResponse(userText);
    }
    // Content Writer responses
    if (systemPrompt.includes("content writ") || systemPrompt.includes("Content Writ")) {
      return this.contentWriterResponse(userText);
    }
    // Generic fallback
    return this.genericResponse(userText);
  }

  private customerSupportResponse(userText: string): string {
    if (userText.includes("refund") || userText.includes("return")) {
      return "I understand you'd like help with a refund or return. I can guide you through our return policy:\n\n1. Items can be returned within 30 days of purchase\n2. Original packaging is required\n3. Refunds are processed within 5-7 business days\n\nWould you like me to initiate a return for a specific order?";
    }
    if (userText.includes("shipping") || userText.includes("delivery") || userText.includes("track")) {
      return "I can help you track your order! To look up your shipment status, I'll need your order number. You can find it in your confirmation email.\n\nOur standard shipping times are:\n- Standard: 5-7 business days\n- Express: 2-3 business days\n- Overnight: Next business day\n\nPlease share your order number and I'll get the details for you.";
    }
    if (userText.includes("hello") || userText.includes("hi") || userText.includes("hey")) {
      return "Hello! Welcome to our support team. I'm here to help you with any questions or concerns. How can I assist you today?";
    }
    if (userText.includes("complaint") || userText.includes("unhappy") || userText.includes("frustrated")) {
      return "I'm sorry to hear about your experience, and I want to help make things right. Could you please describe the issue you're facing? I'll do my best to find a resolution for you as quickly as possible.";
    }
    if (userText.includes("hours") || userText.includes("open") || userText.includes("available")) {
      return "Our support team is available:\n\n- **Monday-Friday**: 8:00 AM - 8:00 PM EST\n- **Saturday**: 9:00 AM - 5:00 PM EST\n- **Sunday**: Closed\n\nAs an AI assistant, I'm available 24/7 to help with common questions!";
    }
    return "Thank you for reaching out! I'm here to help. Could you provide more details about your question so I can assist you better? I can help with:\n\n- Order tracking & shipping\n- Returns & refunds\n- Product information\n- Account issues\n- General inquiries";
  }

  private dataAnalystResponse(userText: string): string {
    if (userText.includes("report") || userText.includes("summary")) {
      return "I'd be happy to help generate a report. Based on the available data, here's a quick summary:\n\n📊 **Key Metrics (Last 30 Days)**\n- Total transactions: 1,247\n- Revenue: $45,832\n- Growth rate: +12.3% MoM\n- Top category: Electronics (34%)\n\nWould you like me to drill down into any specific metric or time period?";
    }
    if (userText.includes("trend") || userText.includes("forecast")) {
      return "Based on the historical data patterns, I can identify these trends:\n\n📈 **Upward Trends**: Customer acquisition (+15%), Average order value (+8%)\n📉 **Watch Areas**: Cart abandonment rate (slightly increasing)\n\nFor a detailed forecast, I'll need to process the last 90 days of data. Shall I proceed?";
    }
    return "I'm your Data Analyst assistant. I can help with:\n\n- Data visualization & reports\n- Trend analysis & forecasting\n- KPI dashboards\n- Custom queries\n\nWhat data would you like me to analyze?";
  }

  private contentWriterResponse(userText: string): string {
    if (userText.includes("blog") || userText.includes("article")) {
      return "I'd love to help with your blog content! To create a compelling article, I'll need:\n\n1. **Topic/Title**: What should the article be about?\n2. **Target Audience**: Who are we writing for?\n3. **Tone**: Professional, casual, educational?\n4. **Length**: Short (500 words), medium (1000), or long-form (2000+)?\n\nOnce you share these details, I'll draft an outline and then the full article.";
    }
    if (userText.includes("social") || userText.includes("post")) {
      return "Here are some social media post ideas:\n\n🐦 **Twitter/X**: \"Discover how AI is transforming small business operations. From customer support to data analysis, the future is here. #AI #SmallBusiness\"\n\n📸 **Instagram**: \"Behind every great business is a team that never sleeps. Meet your new AI employees. 🤖✨\"\n\n💼 **LinkedIn**: A thought leadership piece on digital transformation\n\nWant me to expand on any of these?";
    }
    return "I'm your Content Writer assistant! I can help create:\n\n- Blog posts & articles\n- Social media content\n- Email campaigns\n- Product descriptions\n- Marketing copy\n\nWhat type of content would you like me to work on?";
  }

  private genericResponse(userText: string): string {
    if (userText.includes("hello") || userText.includes("hi")) {
      return "Hello! I'm your AI assistant, ready to help. What can I do for you today?";
    }
    if (userText.includes("help") || userText.includes("what can you do")) {
      return "I'm an AI employee deployed to help you with various tasks. I can:\n\n- Answer questions and provide information\n- Help with task planning and organization\n- Generate content and suggestions\n- Process and analyze data\n\nHow would you like me to assist you?";
    }
    return "I've noted your request and I'm processing it. Could you provide a bit more context so I can give you the most helpful response? I'm here to assist you with any task related to my role.";
  }
}

/**
 * Get the active LLM provider based on environment configuration.
 * - LLM_PROVIDER=azure-openai → real Azure OpenAI calls
 * - LLM_PROVIDER=mock (or unset in dev) → mock responses
 * In production, fail fast if provider is not explicitly configured.
 */
export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER;

  if (provider === "azure-openai") {
    // Lazy import to avoid loading Azure provider when using mock
    const { AzureOpenAIProvider } = require("./azure-openai-provider");
    return new AzureOpenAIProvider();
  }

  if (provider === "mock" || !provider) {
    return new MockLLMProvider();
  }

  throw new Error(`Unknown LLM_PROVIDER: ${provider}. Use "azure-openai" or "mock".`);
}
