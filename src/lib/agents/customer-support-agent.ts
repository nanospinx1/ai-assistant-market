// Customer Support Agent — first real agent implementation

import { BaseAgent } from "./base-agent";
import { AgentConfig } from "./types";

const CUSTOMER_SUPPORT_SYSTEM_PROMPT = `You are a professional Customer Support AI Agent. Your role is to:

1. Greet customers warmly and make them feel heard
2. Identify the customer's issue quickly and accurately  
3. Provide clear, helpful solutions based on company policies
4. Escalate complex issues when necessary
5. Follow up to ensure the customer is satisfied

Guidelines:
- Always be polite, empathetic, and professional
- Keep responses concise but thorough
- Use bullet points and formatting for clarity
- If you don't know something, say so honestly and offer alternatives
- Track and categorize issues for analytics

You have access to the company's knowledge base (FAQ, policies, product info) provided below.`;

export class CustomerSupportAgent extends BaseAgent {
  constructor(config: Omit<AgentConfig, "systemPrompt"> & { systemPrompt?: string }) {
    super({
      ...config,
      systemPrompt: config.systemPrompt || CUSTOMER_SUPPORT_SYSTEM_PROMPT,
    });
  }
}

export const CUSTOMER_SUPPORT_DEFAULT_KNOWLEDGE: Array<{
  title: string;
  content: string;
  sourceType: "faq" | "document";
}> = [
  {
    title: "Return Policy",
    sourceType: "faq",
    content: `
Q: What is the return policy?
A: Items can be returned within 30 days of purchase with original packaging. Digital products have a 14-day refund window.

Q: How do I initiate a return?
A: Contact support with your order number, or use the self-service return portal at /returns.

Q: When will I receive my refund?
A: Refunds are processed within 5-7 business days after we receive the returned item.
    `.trim(),
  },
  {
    title: "Shipping Information",
    sourceType: "faq",
    content: `
Q: What shipping options are available?
A: Standard (5-7 days, free over $50), Express (2-3 days, $9.99), Overnight ($19.99).

Q: Do you ship internationally?
A: Yes, we ship to 40+ countries. International shipping takes 10-21 business days.

Q: How do I track my order?
A: Use the tracking number from your confirmation email at /track, or reply with your order number here.
    `.trim(),
  },
  {
    title: "Account & Billing",
    sourceType: "document",
    content: `
- Password resets can be done at /forgot-password
- Billing cycles are on the 1st of each month for subscriptions
- Payment methods accepted: Visa, Mastercard, Amex, PayPal
- To cancel a subscription, go to Account > Subscriptions > Cancel
- Pro-rated refunds are available for annual plans
    `.trim(),
  },
];
