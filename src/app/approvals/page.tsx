"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  ShieldCheck,
  Mail,
  Database,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  UserCog,
  CalendarPlus,
} from "lucide-react";

interface ApprovalRequest {
  id: string;
  deployment_id: string;
  deployment_name: string | null;
  user_id: string;
  tool_name: string;
  action: string;
  title: string;
  description: string | null;
  payload: Record<string, any>;
  status: "pending" | "approved" | "rejected" | "expired";
  decided_at: string | null;
  decision_note: string | null;
  expires_at: string | null;
  created_at: string;
}

const TOOL_ICONS: Record<string, any> = {
  email: Mail,
  crm: Database,
  calendar: Calendar,
};

const TOOL_COLORS: Record<string, string> = {
  email: "from-blue-500 to-cyan-500",
  crm: "from-emerald-500 to-teal-500",
  calendar: "from-violet-500 to-purple-500",
};

const ACTION_ICONS: Record<string, any> = {
  send_email: Send,
  update_contact: UserCog,
  schedule_meeting: CalendarPlus,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function expiryCountdown(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m left`;
}

function PayloadPreview({ toolName, payload }: { toolName: string; payload: Record<string, any> }) {
  const tool = toolName.toLowerCase();

  if (tool === "email") {
    return (
      <div className="space-y-1 text-xs">
        {payload.to && (
          <p><span className="text-[var(--text-muted)]">To:</span> <span className="text-[var(--text-secondary)]">{payload.to}</span></p>
        )}
        {payload.subject && (
          <p><span className="text-[var(--text-muted)]">Subject:</span> <span className="text-[var(--text-secondary)]">{payload.subject}</span></p>
        )}
        {payload.body && (
          <p className="text-[var(--text-muted)] line-clamp-2">{payload.body}</p>
        )}
      </div>
    );
  }

  if (tool === "crm") {
    return (
      <div className="space-y-1 text-xs">
        {payload.contactName && (
          <p><span className="text-[var(--text-muted)]">Contact:</span> <span className="text-[var(--text-secondary)]">{payload.contactName}</span></p>
        )}
        {payload.fields && (
          <div className="text-[var(--text-muted)]">
            Fields: {Object.keys(payload.fields).join(", ")}
          </div>
        )}
      </div>
    );
  }

  if (tool === "calendar") {
    return (
      <div className="space-y-1 text-xs">
        {payload.meetingTitle && (
          <p><span className="text-[var(--text-muted)]">Meeting:</span> <span className="text-[var(--text-secondary)]">{payload.meetingTitle}</span></p>
        )}
        {payload.date && (
          <p><span className="text-[var(--text-muted)]">Date:</span> <span className="text-[var(--text-secondary)]">{payload.date}</span></p>
        )}
        {payload.attendees && (
          <p><span className="text-[var(--text-muted)]">Attendees:</span> <span className="text-[var(--text-secondary)]">
            {Array.isArray(payload.attendees) ? payload.attendees.join(", ") : payload.attendees}
          </span></p>
        )}
      </div>
    );
  }

  // Fallback: show JSON keys
  return (
    <div className="text-xs text-[var(--text-muted)]">
      {JSON.stringify(payload, null, 2).slice(0, 200)}
    </div>
  );
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "Rejected", className: "bg-red-500/20 text-red-400" },
  expired: { label: "Expired", className: "bg-amber-500/20 text-amber-400" },
  pending: { label: "Pending", className: "bg-blue-500/20 text-blue-400" },
};

export default function ApprovalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<ApprovalRequest[]>([]);
  const [history, setHistory] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  const fetchApprovals = useCallback(async () => {
    try {
      const [pendingRes, historyRes] = await Promise.all([
        fetch("/api/approvals?status=pending&limit=50"),
        fetch("/api/approvals?limit=50"),
      ]);
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPending(data.approvals || []);
      }
      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(
          (data.approvals || []).filter(
            (a: ApprovalRequest) => a.status !== "pending",
          ),
        );
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchApprovals();
  }, [user, fetchApprovals]);

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    setProcessing((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch("/api/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          note: status === "rejected" ? rejectNotes[id] : undefined,
        }),
      });
      if (res.ok) {
        await fetchApprovals();
        setShowRejectInput((s) => ({ ...s, [id]: false }));
        setRejectNotes((n) => ({ ...n, [id]: "" }));
      }
    } catch {
      // silently handle
    } finally {
      setProcessing((p) => ({ ...p, [id]: false }));
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
          }}
        >
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Approvals</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Review and approve agent actions before they execute
          </p>
        </div>
      </div>

      {/* Pending Approvals */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Clock size={18} className="text-amber-400" />
          Pending Approvals
          {pending.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
              {pending.length}
            </span>
          )}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border border-[var(--border)] bg-[var(--bg-card)]">
            <Sparkles size={40} className="mx-auto text-amber-400 mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No pending approvals
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Your agents are running smoothly! ✨
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((req) => {
              const ToolIcon = TOOL_ICONS[req.tool_name.toLowerCase()] || ShieldCheck;
              const ActionIcon = ACTION_ICONS[req.action] || ToolIcon;
              const gradient = TOOL_COLORS[req.tool_name.toLowerCase()] || "from-indigo-500 to-purple-500";
              const countdown = expiryCountdown(req.expires_at);

              return (
                <div
                  key={req.id}
                  className="rounded-2xl p-6 border border-[var(--border)] bg-[var(--bg-card)] space-y-4 transition-all hover:border-indigo-500/30"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <ToolIcon size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            {req.title}
                          </h3>
                          <ActionIcon size={14} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                          {req.deployment_name || "Agent"} · {req.tool_name} · {req.action.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-[var(--text-muted)]">{timeAgo(req.created_at)}</p>
                      {countdown && (
                        <p className={`text-xs mt-0.5 ${countdown === "Expired" ? "text-red-400" : "text-amber-400"}`}>
                          <Clock size={10} className="inline mr-1" />
                          {countdown}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {req.description && (
                    <p className="text-sm text-[var(--text-secondary)]">{req.description}</p>
                  )}

                  {/* Payload preview */}
                  <div className="rounded-xl p-3 bg-[var(--bg-surface)] border border-[var(--border)]">
                    <PayloadPreview toolName={req.tool_name} payload={req.payload} />
                  </div>

                  {/* Reject note input */}
                  {showRejectInput[req.id] && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Reason for rejection (optional)"
                        value={rejectNotes[req.id] || ""}
                        onChange={(e) =>
                          setRejectNotes((n) => ({ ...n, [req.id]: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-red-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDecision(req.id, "rejected")}
                          disabled={processing[req.id]}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => setShowRejectInput((s) => ({ ...s, [req.id]: false }))}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!showRejectInput[req.id] && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDecision(req.id, "approved")}
                        disabled={processing[req.id]}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectInput((s) => ({ ...s, [req.id]: true }))}
                        disabled={processing[req.id]}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* History Section */}
      <section>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Decision History
          {history.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)]">
              {history.length}
            </span>
          )}
        </button>

        {showHistory && (
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
            {history.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--text-muted)]">
                No past decisions yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                    <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Action</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Tool</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Decided</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((req) => {
                    const badge = STATUS_BADGE[req.status] || STATUS_BADGE.expired;
                    return (
                      <tr key={req.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-3 text-[var(--text-primary)]">{req.title}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{req.tool_name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">
                          {req.decided_at ? timeAgo(req.decided_at) : "—"}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)] max-w-[200px] truncate">
                          {req.decision_note || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
