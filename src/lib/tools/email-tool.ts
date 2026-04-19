// Email tool — SendGrid integration for sending emails, drafting, and managing messages

import { ToolHandler, ToolDefinition, OpenAIFunctionSchema, ToolExecutionResult, ToolConnection } from "./types";

export class EmailTool implements ToolHandler {
  type = "email";

  getDefinition(): ToolDefinition {
    return {
      type: "email",
      name: "Email",
      description: "Send emails, draft messages, and manage email communications",
      actions: [
        {
          name: "send_email",
          description: "Send an email to a recipient",
          parameters: [
            { name: "to", type: "string", description: "Recipient email address", required: true },
            { name: "subject", type: "string", description: "Email subject line", required: true },
            { name: "body", type: "string", description: "Email body (plain text or HTML)", required: true },
            { name: "cc", type: "string", description: "CC recipients (comma-separated)", required: false },
          ],
        },
        {
          name: "draft_email",
          description: "Draft an email without sending it (returns the draft for review)",
          parameters: [
            { name: "to", type: "string", description: "Recipient email address", required: true },
            { name: "subject", type: "string", description: "Email subject line", required: true },
            { name: "body", type: "string", description: "Email body content", required: true },
          ],
        },
        {
          name: "list_templates",
          description: "List available email templates",
          parameters: [],
        },
      ],
    };
  }

  getFunctionSchemas(): OpenAIFunctionSchema[] {
    return [
      {
        type: "function",
        function: {
          name: "send_email",
          description: "Send an email to a recipient. Use this when the user asks you to send, forward, or reply to an email.",
          parameters: {
            type: "object",
            properties: {
              to: { type: "string", description: "Recipient email address" },
              subject: { type: "string", description: "Email subject line" },
              body: { type: "string", description: "Email body in HTML format" },
              cc: { type: "string", description: "CC recipients (comma-separated)" },
            },
            required: ["to", "subject", "body"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "draft_email",
          description: "Draft an email for the user to review before sending. Use this when composing emails that need approval.",
          parameters: {
            type: "object",
            properties: {
              to: { type: "string", description: "Recipient email address" },
              subject: { type: "string", description: "Email subject line" },
              body: { type: "string", description: "Email body content" },
            },
            required: ["to", "subject", "body"],
          },
        },
      },
    ];
  }

  async execute(action: string, params: Record<string, any>, connection?: ToolConnection): Promise<ToolExecutionResult> {
    const start = Date.now();

    try {
      switch (action) {
        case "send_email":
          return await this.sendEmail(params, connection);
        case "draft_email":
          return this.draftEmail(params);
        case "list_templates":
          return this.listTemplates();
        default:
          return { success: false, output: null, error: `Unknown action: ${action}` };
      }
    } catch (err: any) {
      return {
        success: false,
        output: null,
        error: err.message || "Email tool execution failed",
        durationMs: Date.now() - start,
      };
    }
  }

  private async sendEmail(params: Record<string, any>, connection?: ToolConnection): Promise<ToolExecutionResult> {
    const start = Date.now();
    const { to, subject, body, cc } = params;

    // If SendGrid API key is configured, use it
    const apiKey = connection?.config?.sendgrid_api_key || process.env.SENDGRID_API_KEY;
    const fromEmail = connection?.config?.from_email || process.env.EMAIL_FROM || "noreply@aimarket.com";

    if (apiKey && apiKey !== "your_sendgrid_api_key_here") {
      // Real SendGrid integration
      try {
        const sgBody: any = {
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail },
          subject,
          content: [{ type: "text/html", value: body }],
        };

        if (cc) {
          sgBody.personalizations[0].cc = cc.split(",").map((e: string) => ({ email: e.trim() }));
        }

        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sgBody),
        });

        if (response.ok || response.status === 202) {
          return {
            success: true,
            output: { message: `Email sent successfully to ${to}`, subject, to, cc: cc || null },
            durationMs: Date.now() - start,
          };
        } else {
          const errText = await response.text();
          return { success: false, output: null, error: `SendGrid error: ${errText}`, durationMs: Date.now() - start };
        }
      } catch (err: any) {
        return { success: false, output: null, error: `SendGrid request failed: ${err.message}`, durationMs: Date.now() - start };
      }
    }

    // Webhook mode: POST to user-configured webhook URL
    const webhookUrl = connection?.config?.webhook_url;
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send_email", to, subject, body, cc, timestamp: new Date().toISOString() }),
        });
        return {
          success: response.ok,
          output: { message: response.ok ? `Email dispatched via webhook to ${to}` : "Webhook delivery failed", to, subject },
          durationMs: Date.now() - start,
        };
      } catch (err: any) {
        return { success: false, output: null, error: `Webhook failed: ${err.message}`, durationMs: Date.now() - start };
      }
    }

    // Simulation mode (no real integration configured)
    return {
      success: true,
      output: {
        message: `[SIMULATED] Email would be sent to ${to}`,
        subject,
        to,
        cc: cc || null,
        body_preview: body.substring(0, 200),
        note: "No email provider configured. Connect SendGrid or a webhook in Integrations settings to send real emails.",
      },
      durationMs: Date.now() - start,
    };
  }

  private draftEmail(params: Record<string, any>): ToolExecutionResult {
    return {
      success: true,
      output: {
        type: "draft",
        to: params.to,
        subject: params.subject,
        body: params.body,
        message: "Email drafted for your review. Reply with 'send' to send it, or provide edits.",
      },
    };
  }

  private listTemplates(): ToolExecutionResult {
    return {
      success: true,
      output: {
        templates: [
          { id: "welcome", name: "Welcome Email", description: "New customer welcome message" },
          { id: "followup", name: "Follow-Up", description: "General follow-up template" },
          { id: "support-resolution", name: "Support Resolution", description: "Issue resolved notification" },
          { id: "meeting-invite", name: "Meeting Invite", description: "Schedule a meeting" },
        ],
      },
    };
  }

  validateConnection(config: Record<string, any>): { valid: boolean; error?: string } {
    const hasProvider = config.sendgrid_api_key || config.webhook_url;
    if (!hasProvider) {
      return { valid: false, error: "Either SendGrid API key or webhook URL is required" };
    }
    if (config.sendgrid_api_key && !config.from_email) {
      return { valid: false, error: "From email address is required with SendGrid" };
    }
    return { valid: true };
  }
}
