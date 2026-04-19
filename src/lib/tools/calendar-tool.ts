// Calendar tool — Google Calendar or webhook-based calendar integration

import { ToolHandler, ToolDefinition, OpenAIFunctionSchema, ToolExecutionResult, ToolConnection } from "./types";
import { v4 as uuid } from "uuid";

export class CalendarTool implements ToolHandler {
  type = "calendar";

  getDefinition(): ToolDefinition {
    return {
      type: "calendar",
      name: "Calendar",
      description: "Schedule appointments, manage meetings, and check availability",
      actions: [
        {
          name: "schedule_meeting",
          description: "Schedule a new meeting or appointment",
          parameters: [
            { name: "title", type: "string", description: "Meeting title", required: true },
            { name: "date", type: "string", description: "Date (YYYY-MM-DD)", required: true },
            { name: "time", type: "string", description: "Time (HH:MM)", required: true },
            { name: "duration_minutes", type: "number", description: "Duration in minutes", required: true },
            { name: "attendees", type: "string", description: "Attendee emails (comma-separated)", required: false },
            { name: "description", type: "string", description: "Meeting description or agenda", required: false },
          ],
        },
        {
          name: "check_availability",
          description: "Check calendar availability for a given date",
          parameters: [
            { name: "date", type: "string", description: "Date to check (YYYY-MM-DD)", required: true },
          ],
        },
        {
          name: "list_upcoming",
          description: "List upcoming meetings and appointments",
          parameters: [
            { name: "days", type: "number", description: "Number of days ahead to check", required: false },
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
          name: "schedule_meeting",
          description: "Schedule a new meeting or appointment on the calendar",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Meeting title" },
              date: { type: "string", description: "Date in YYYY-MM-DD format" },
              time: { type: "string", description: "Time in HH:MM format (24-hour)" },
              duration_minutes: { type: "number", description: "Duration in minutes (default: 30)" },
              attendees: { type: "string", description: "Attendee email addresses, comma-separated" },
              description: { type: "string", description: "Meeting description or agenda" },
            },
            required: ["title", "date", "time", "duration_minutes"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "check_availability",
          description: "Check calendar availability for a specific date",
          parameters: {
            type: "object",
            properties: {
              date: { type: "string", description: "Date to check in YYYY-MM-DD format" },
            },
            required: ["date"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "list_upcoming",
          description: "List upcoming meetings and appointments for the next few days",
          parameters: {
            type: "object",
            properties: {
              days: { type: "number", description: "Number of days ahead to show (default: 7)" },
            },
            required: [],
          },
        },
      },
    ];
  }

  async execute(action: string, params: Record<string, any>, connection?: ToolConnection): Promise<ToolExecutionResult> {
    const start = Date.now();

    // Webhook mode
    const webhookUrl = connection?.config?.webhook_url;
    if (webhookUrl) {
      return this.executeViaWebhook(webhookUrl, action, params, start);
    }

    try {
      switch (action) {
        case "schedule_meeting":
          return this.scheduleMeeting(params);
        case "check_availability":
          return this.checkAvailability(params);
        case "list_upcoming":
          return this.listUpcoming(params);
        default:
          return { success: false, output: null, error: `Unknown calendar action: ${action}` };
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
      return { success: response.ok, output: data, durationMs: Date.now() - start };
    } catch (err: any) {
      return { success: false, output: null, error: `Calendar webhook failed: ${err.message}`, durationMs: Date.now() - start };
    }
  }

  private scheduleMeeting(params: Record<string, any>): ToolExecutionResult {
    const { title, date, time, duration_minutes, attendees, description } = params;
    const endTime = this.addMinutes(time, duration_minutes || 30);
    return {
      success: true,
      output: {
        id: uuid(),
        title,
        date,
        start_time: time,
        end_time: endTime,
        duration_minutes: duration_minutes || 30,
        attendees: attendees ? attendees.split(",").map((a: string) => a.trim()) : [],
        description: description || "",
        status: "confirmed",
        message: `Meeting "${title}" scheduled for ${date} at ${time} (${duration_minutes || 30} min)`,
      },
    };
  }

  private checkAvailability(params: Record<string, any>): ToolExecutionResult {
    const { date } = params;
    // Simulated availability — shows busy slots and available windows
    const busySlots = [
      { time: "09:00-09:30", title: "Daily standup" },
      { time: "11:00-12:00", title: "Team meeting" },
      { time: "14:00-14:30", title: "1:1 with manager" },
    ];
    const availableSlots = [
      "09:30-11:00", "12:00-14:00", "14:30-17:00"
    ];
    return {
      success: true,
      output: {
        date,
        busy_slots: busySlots,
        available_slots: availableSlots,
        message: `On ${date}: ${availableSlots.length} available time windows, ${busySlots.length} existing meetings`,
      },
    };
  }

  private listUpcoming(params: Record<string, any>): ToolExecutionResult {
    const days = params.days || 7;
    const today = new Date();
    const meetings = [];

    for (let i = 0; i < Math.min(days, 5); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      if (i === 0) {
        meetings.push({ date: dateStr, time: "09:00", title: "Daily standup", duration: 30 });
        meetings.push({ date: dateStr, time: "14:00", title: "Client review", duration: 60 });
      } else if (i % 2 === 0) {
        meetings.push({ date: dateStr, time: "10:00", title: "Sprint planning", duration: 90 });
      } else {
        meetings.push({ date: dateStr, time: "11:00", title: "Team sync", duration: 30 });
      }
    }

    return {
      success: true,
      output: {
        meetings,
        total: meetings.length,
        period: `Next ${days} days`,
        message: `${meetings.length} upcoming meetings in the next ${days} days`,
      },
    };
  }

  private addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  }

  validateConnection(config: Record<string, any>): { valid: boolean; error?: string } {
    // Calendar works in simulation mode without external config, or webhook mode
    return { valid: true };
  }
}
