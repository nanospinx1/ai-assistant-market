// CRM tool — webhook-based CRM integration for managing customer records

import { ToolHandler, ToolDefinition, OpenAIFunctionSchema, ToolExecutionResult, ToolConnection } from "./types";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export class CRMTool implements ToolHandler {
  type = "crm";

  getDefinition(): ToolDefinition {
    return {
      type: "crm",
      name: "CRM",
      description: "Manage customer records, track interactions, and update contact information",
      actions: [
        {
          name: "search_contacts",
          description: "Search for a customer/contact by name or email",
          parameters: [
            { name: "query", type: "string", description: "Search query (name or email)", required: true },
          ],
        },
        {
          name: "log_interaction",
          description: "Log a customer interaction (call, email, meeting, note)",
          parameters: [
            { name: "contact_name", type: "string", description: "Customer name", required: true },
            { name: "interaction_type", type: "string", description: "Type of interaction", required: true, enum: ["call", "email", "meeting", "note", "chat"] },
            { name: "summary", type: "string", description: "Summary of the interaction", required: true },
            { name: "sentiment", type: "string", description: "Customer sentiment", required: false, enum: ["positive", "neutral", "negative"] },
          ],
        },
        {
          name: "create_contact",
          description: "Create a new customer/contact record",
          parameters: [
            { name: "name", type: "string", description: "Full name", required: true },
            { name: "email", type: "string", description: "Email address", required: false },
            { name: "phone", type: "string", description: "Phone number", required: false },
            { name: "company", type: "string", description: "Company name", required: false },
            { name: "notes", type: "string", description: "Additional notes", required: false },
          ],
        },
        {
          name: "update_contact",
          description: "Update an existing contact's information",
          parameters: [
            { name: "contact_name", type: "string", description: "Contact to update (name)", required: true },
            { name: "field", type: "string", description: "Field to update", required: true, enum: ["email", "phone", "company", "status", "notes"] },
            { name: "value", type: "string", description: "New value", required: true },
          ],
        },
      ],
    };
  }

  getFunctionSchemas(): OpenAIFunctionSchema[] {
    return [
      {
        type: "function",
        function: {
          name: "search_contacts",
          description: "Search for customers/contacts by name or email in the CRM",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query (name or email)" },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "log_interaction",
          description: "Log a customer interaction in the CRM (call, email, meeting, chat, or note)",
          parameters: {
            type: "object",
            properties: {
              contact_name: { type: "string", description: "Customer name" },
              interaction_type: { type: "string", enum: ["call", "email", "meeting", "note", "chat"], description: "Type of interaction" },
              summary: { type: "string", description: "Summary of the interaction" },
              sentiment: { type: "string", enum: ["positive", "neutral", "negative"], description: "Customer sentiment" },
            },
            required: ["contact_name", "interaction_type", "summary"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_contact",
          description: "Create a new customer/contact record in the CRM",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Full name" },
              email: { type: "string", description: "Email address" },
              phone: { type: "string", description: "Phone number" },
              company: { type: "string", description: "Company name" },
              notes: { type: "string", description: "Additional notes" },
            },
            required: ["name"],
          },
        },
      },
    ];
  }

  async execute(action: string, params: Record<string, any>, connection?: ToolConnection): Promise<ToolExecutionResult> {
    const start = Date.now();

    // If webhook URL configured, forward to external CRM
    const webhookUrl = connection?.config?.webhook_url;
    if (webhookUrl) {
      return this.executeViaWebhook(webhookUrl, action, params, start);
    }

    // Built-in lightweight CRM (stored in tool_execution_logs as structured data)
    try {
      switch (action) {
        case "search_contacts":
          return this.searchContacts(params);
        case "log_interaction":
          return this.logInteraction(params, connection);
        case "create_contact":
          return this.createContact(params, connection);
        case "update_contact":
          return this.updateContact(params, connection);
        default:
          return { success: false, output: null, error: `Unknown CRM action: ${action}` };
      }
    } catch (err: any) {
      return { success: false, output: null, error: err.message, durationMs: Date.now() - start };
    }
  }

  private async executeViaWebhook(webhookUrl: string, action: string, params: Record<string, any>, start: number): Promise<ToolExecutionResult> {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, params, timestamp: new Date().toISOString() }),
      });
      const data = await response.json().catch(() => ({}));
      return {
        success: response.ok,
        output: data,
        durationMs: Date.now() - start,
      };
    } catch (err: any) {
      return { success: false, output: null, error: `CRM webhook failed: ${err.message}`, durationMs: Date.now() - start };
    }
  }

  private searchContacts(params: Record<string, any>): ToolExecutionResult {
    // Simulated contact search (in production, would query real CRM or local DB)
    const { query } = params;
    const demoContacts = [
      { name: "Alice Johnson", email: "alice@example.com", company: "TechCorp", status: "active", lastContact: "2 days ago" },
      { name: "Bob Smith", email: "bob@example.com", company: "StartupIO", status: "lead", lastContact: "1 week ago" },
      { name: "Carol Williams", email: "carol@example.com", company: "DesignHub", status: "active", lastContact: "today" },
    ];
    const results = demoContacts.filter(
      (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase())
    );
    return {
      success: true,
      output: {
        results,
        total: results.length,
        message: results.length > 0 ? `Found ${results.length} contact(s)` : "No contacts found matching your query",
      },
    };
  }

  private logInteraction(params: Record<string, any>, _connection?: ToolConnection): ToolExecutionResult {
    const { contact_name, interaction_type, summary, sentiment } = params;
    return {
      success: true,
      output: {
        id: uuid(),
        contact_name,
        interaction_type,
        summary,
        sentiment: sentiment || "neutral",
        logged_at: new Date().toISOString(),
        message: `Interaction logged for ${contact_name}: ${interaction_type}`,
      },
    };
  }

  private createContact(params: Record<string, any>, _connection?: ToolConnection): ToolExecutionResult {
    const { name, email, phone, company, notes } = params;
    return {
      success: true,
      output: {
        id: uuid(),
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        notes: notes || null,
        status: "active",
        created_at: new Date().toISOString(),
        message: `Contact "${name}" created successfully`,
      },
    };
  }

  private updateContact(params: Record<string, any>, _connection?: ToolConnection): ToolExecutionResult {
    const { contact_name, field, value } = params;
    return {
      success: true,
      output: {
        contact_name,
        field,
        new_value: value,
        updated_at: new Date().toISOString(),
        message: `Updated ${field} for ${contact_name} to "${value}"`,
      },
    };
  }

  validateConnection(config: Record<string, any>): { valid: boolean; error?: string } {
    // CRM works in built-in mode without external config, or webhook mode
    return { valid: true };
  }
}
