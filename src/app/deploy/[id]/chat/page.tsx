"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/Providers";
import {
  Send,
  ArrowLeft,
  MessageSquare,
  Plus,
  Bot,
  User,
  Loader2,
  Clock,
  Zap,
} from "lucide-react";

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
  metadata?: any;
}

interface Conversation {
  id: string;
  title: string;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DeploymentInfo {
  id: string;
  name: string;
  employeeName: string;
  employeeRole: string;
  employeeCategory: string;
  status: string;
}

export default function ChatPage() {
  const { id: deploymentId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [deployment, setDeployment] = useState<DeploymentInfo | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastTaskLog, setLastTaskLog] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Load deployment info
  useEffect(() => {
    if (!user) return;
    fetch("/api/deployments")
      .then((r) => r.json())
      .then((deps) => {
        const dep = deps.find((d: any) => d.id === deploymentId);
        if (dep) setDeployment(dep);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, deploymentId]);

  // Load conversations
  const loadConversations = useCallback(() => {
    fetch(`/api/deployments/${deploymentId}/conversations`)
      .then((r) => r.json())
      .then((data) => setConversations(data.conversations || []))
      .catch(() => {});
  }, [deploymentId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    fetch(`/api/deployments/${deploymentId}/conversations?conversationId=${activeConversationId}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => {});
  }, [activeConversationId, deploymentId]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/deployments/${deploymentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: activeConversationId,
        }),
      });

      if (!res.ok) throw new Error("Chat failed");
      const data = await res.json();

      setMessages((prev) => [...prev, data.message]);
      setLastTaskLog(data.taskLog);

      if (!activeConversationId) {
        setActiveConversationId(data.conversationId);
        loadConversations();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setLastTaskLog(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-secondary)]">Deployment not found.</p>
        <button onClick={() => router.push("/deploy")} className="mt-4 text-[var(--primary)] hover:underline">
          ← Back to Deployments
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4 p-4">
      {/* Sidebar — Conversations */}
      <div className="w-72 flex-shrink-0 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <button
            onClick={() => router.push("/deploy")}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Deployments
          </button>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            {deployment.employeeRole}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">{deployment.name}</p>
        </div>

        <button
          onClick={startNewConversation}
          className="mx-4 mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Chat
        </button>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeConversationId === conv.id
                  ? "bg-[var(--primary)] bg-opacity-20 text-[var(--primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-dark)] hover:text-[var(--text-primary)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
              <span className="text-xs text-[var(--text-muted)] ml-5.5">
                {conv.messageCount} messages
              </span>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-[var(--text-muted)] text-center mt-6">
              No conversations yet. Start a new chat!
            </p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] bg-opacity-20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {deployment.employeeRole}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {deployment.status === "active" ? "🟢 Online" : "⚪ Inactive"}
              </p>
            </div>
          </div>
          {lastTaskLog && (
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {lastTaskLog.durationMs}ms
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {lastTaskLog.tokensUsed} tokens
              </span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Chat with {deployment.employeeRole}
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md">
                Start a conversation with your AI employee. They&apos;re ready to help with{" "}
                {deployment.employeeCategory?.toLowerCase() || "your tasks"}.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-[var(--primary)]" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--primary)] text-white rounded-br-md"
                    : "bg-[var(--bg-dark)] text-[var(--text-primary)] rounded-bl-md border border-[var(--border)]"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div className="bg-[var(--bg-dark)] rounded-2xl rounded-bl-md px-4 py-3 border border-[var(--border)]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-[var(--border)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${deployment.employeeRole}...`}
              disabled={sending || deployment.status !== "active"}
              className="flex-1 bg-[var(--bg-dark)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || deployment.status !== "active"}
              className="px-4 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          {deployment.status !== "active" && (
            <p className="text-xs text-red-400 mt-2">
              This deployment is not active. Activate it to start chatting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
