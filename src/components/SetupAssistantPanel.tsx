"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Sparkles,
  Plug,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  Check,
  Loader2,
  Bot,
  User,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Suggestion {
  type: "tool" | "knowledge" | "task" | "approval";
  data: any;
  reason: string;
  status: "pending" | "accepted" | "rejected";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
}

export interface AcceptedSuggestion {
  type: "tool" | "knowledge" | "task" | "approval";
  data: any;
}

interface SetupAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  deploymentId?: string;
  agentName?: string;
  onAcceptSuggestion: (suggestion: AcceptedSuggestion) => Promise<void>;
  apiEndpoint?: string;       // defaults to "/api/setup-assistant"
  subtitle?: string;          // custom subtitle under "AI Setup Assistant"
}

/* ------------------------------------------------------------------ */
/*  Suggestion Card                                                    */
/* ------------------------------------------------------------------ */

const SUGGESTION_META: Record<
  string,
  { icon: any; color: string; bg: string; label: string }
> = {
  tool: {
    icon: Plug,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    label: "Tool",
  },
  knowledge: {
    icon: BookOpen,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Knowledge",
  },
  task: {
    icon: ClipboardList,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    label: "Task",
  },
  approval: {
    icon: ShieldCheck,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    label: "Approval",
  },
};

function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
}: {
  suggestion: Suggestion;
  onAccept: () => void;
  onReject: () => void;
}) {
  const meta = SUGGESTION_META[suggestion.type];
  const Icon = meta.icon;
  const isResolved = suggestion.status !== "pending";

  // Build title based on type
  let title = "";
  if (suggestion.type === "tool") title = `${suggestion.data.name} (${suggestion.data.type})`;
  else if (suggestion.type === "knowledge") title = suggestion.data.title;
  else if (suggestion.type === "task") title = suggestion.data.name;
  else if (suggestion.type === "approval") title = suggestion.data.label;

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${meta.bg} ${
        isResolved ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <Icon size={16} className={`${meta.color} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${meta.color}`}
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              {meta.label}
            </span>
            {suggestion.status === "accepted" && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <Check size={10} /> Added
              </span>
            )}
            {suggestion.status === "rejected" && (
              <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                <X size={10} /> Skipped
              </span>
            )}
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {suggestion.reason}
          </p>
        </div>
      </div>
      {!isResolved && (
        <div className="flex gap-2 mt-2.5 ml-6">
          <button
            onClick={onAccept}
            className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
          >
            <Check size={12} /> Accept
          </button>
          <button
            onClick={onReject}
            className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all hover:bg-white/10"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border-primary)" }}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Prompts                                                      */
/* ------------------------------------------------------------------ */

const STARTER_PROMPTS = [
  "I'm new here — help me set up everything from scratch",
  "I have a small retail store and need help with customer support",
  "I run a consulting firm and need help with scheduling and emails",
  "I want to set up knowledge base for my team's processes",
];

/* ------------------------------------------------------------------ */
/*  Main Panel                                                         */
/* ------------------------------------------------------------------ */

export default function SetupAssistantPanel({
  isOpen,
  onClose,
  deploymentId,
  agentName = "your resources",
  onAcceptSuggestion,
  apiEndpoint = "/api/setup-assistant",
  subtitle,
}: SetupAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Reset on close/reopen
  useEffect(() => {
    if (!isOpen) {
      // Keep messages so user can reopen and continue
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      setError("");

      const userMsg: ChatMessage = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setLoading(true);

      try {
        // Send only role+content to API (no suggestions metadata)
        const apiMessages = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            ...(deploymentId ? { deploymentId } : {}),
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();

        // Build suggestion cards from structured response
        const suggestions: Suggestion[] = [];
        if (data.suggestions) {
          for (const tool of data.suggestions.tools || []) {
            suggestions.push({
              type: "tool",
              data: { type: tool.type, name: tool.name },
              reason: tool.reason,
              status: "pending",
            });
          }
          for (const k of data.suggestions.knowledge || []) {
            suggestions.push({
              type: "knowledge",
              data: { title: k.title, content: k.content, category: k.category },
              reason: k.reason,
              status: "pending",
            });
          }
          for (const t of data.suggestions.tasks || []) {
            suggestions.push({
              type: "task",
              data: {
                name: t.name,
                description: t.description,
                scheduleType: t.scheduleType,
                taskPrompt: t.taskPrompt,
              },
              reason: t.reason,
              status: "pending",
            });
          }
          for (const a of data.suggestions.approvals || []) {
            suggestions.push({
              type: "approval",
              data: { category: a.category, label: a.label },
              reason: a.reason,
              status: "pending",
            });
          }
        }

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.message,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        setError(err.message || "Failed to get response");
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, deploymentId, apiEndpoint]
  );

  const handleAcceptSuggestion = async (msgIndex: number, suggIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg.suggestions) return;
    const sugg = msg.suggestions[suggIndex];
    if (sugg.status !== "pending") return;

    try {
      await onAcceptSuggestion({ type: sugg.type, data: sugg.data });
      setMessages((prev) =>
        prev.map((m, mi) =>
          mi === msgIndex
            ? {
                ...m,
                suggestions: m.suggestions?.map((s, si) =>
                  si === suggIndex ? { ...s, status: "accepted" as const } : s
                ),
              }
            : m
        )
      );
    } catch (err) {
      console.error("Failed to accept suggestion:", err);
    }
  };

  const handleRejectSuggestion = (msgIndex: number, suggIndex: number) => {
    setMessages((prev) =>
      prev.map((m, mi) =>
        mi === msgIndex
          ? {
              ...m,
              suggestions: m.suggestions?.map((s, si) =>
                si === suggIndex ? { ...s, status: "rejected" as const } : s
              ),
            }
          : m
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl animate-slide-in-right"
        style={{
          width: "min(480px, 90vw)",
          background: "var(--bg-primary)",
          borderLeft: "1px solid var(--border-primary)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.08))",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                AI Setup Assistant
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {subtitle || `Set up ${agentName} through conversation`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Welcome message if empty */}
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
                >
                  <Bot size={16} className="text-white" />
                </div>
                <div
                  className="rounded-xl rounded-tl-sm px-4 py-3 max-w-[85%]"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    Hi! 👋 I'm your AI Setup Assistant. I'll help you configure{" "}
                    <strong>{agentName}</strong> by understanding your business and needs.
                  </p>
                  <p
                    className="text-sm mt-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Tell me about your business — what do you do, and what would you like
                    your AI employee to help with?
                  </p>
                </div>
              </div>

              {/* Starter prompts */}
              <div className="ml-11 space-y-2">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Quick start:
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTER_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs px-3 py-2 rounded-lg transition-all hover:scale-[1.02]"
                      style={{
                        color: "var(--text-secondary)",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <div key={i} className="space-y-2">
              <div
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "" : ""
                  }`}
                  style={
                    msg.role === "assistant"
                      ? { background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }
                      : { background: "var(--bg-card)", border: "1px solid var(--border-primary)" }
                  }
                >
                  {msg.role === "assistant" ? (
                    <Bot size={16} className="text-white" />
                  ) : (
                    <User size={16} style={{ color: "var(--text-secondary)" }} />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-xl px-4 py-3 max-w-[85%] ${
                    msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                  }`}
                  style={
                    msg.role === "user"
                      ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)", color: "white" }
                      : {
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-primary)",
                          color: "var(--text-primary)",
                        }
                  }
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>

              {/* Suggestion cards */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="ml-11 space-y-2">
                  <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <Sparkles size={12} /> Suggestions
                    <span className="text-[10px] opacity-60">
                      ({msg.suggestions.filter((s) => s.status === "pending").length} pending)
                    </span>
                  </p>
                  {msg.suggestions.map((sugg, si) => (
                    <SuggestionCard
                      key={si}
                      suggestion={sugg}
                      onAccept={() => handleAcceptSuggestion(i, si)}
                      onReject={() => handleRejectSuggestion(i, si)}
                    />
                  ))}
                  {/* Accept/reject all */}
                  {msg.suggestions.some((s) => s.status === "pending") && msg.suggestions.length > 1 && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          msg.suggestions!.forEach((s, si) => {
                            if (s.status === "pending") handleAcceptSuggestion(i, si);
                          });
                        }}
                        className="text-xs px-3 py-1.5 rounded-md font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
                      >
                        Accept All
                      </button>
                      <button
                        onClick={() => {
                          msg.suggestions!.forEach((_, si) => handleRejectSuggestion(i, si));
                        }}
                        className="text-xs px-3 py-1.5 rounded-md font-medium transition-all hover:bg-white/10"
                        style={{ color: "var(--text-muted)", border: "1px solid var(--border-primary)" }}
                      >
                        Skip All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
              >
                <Bot size={16} className="text-white" />
              </div>
              <div
                className="rounded-xl rounded-tl-sm px-4 py-3"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="ml-11 flex items-start gap-2 rounded-lg px-3 py-2 bg-red-500/10 border border-red-500/20">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div
          className="shrink-0 px-4 py-3"
          style={{ borderTop: "1px solid var(--border-primary)", background: "var(--bg-primary)" }}
        >
          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your business or ask for help..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-1"
              style={{ color: "var(--text-primary)", maxHeight: "120px" }}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg transition-all disabled:opacity-30"
              style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
          <p className="text-[10px] mt-1.5 text-center" style={{ color: "var(--text-muted)" }}>
            AI suggestions require your review before being applied
          </p>
        </div>
      </div>
    </>
  );
}
