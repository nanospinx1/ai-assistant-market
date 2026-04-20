"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  MessageSquare,
  Wrench,
  AlertCircle,
  Power,
  GraduationCap,
  CheckCircle,
  Loader2,
  Activity,
} from "lucide-react";

interface ActivityItem {
  id: string;
  deploymentId: string;
  deploymentName?: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  status: string;
  createdAt: string;
}

const typeIcons: Record<string, typeof MessageSquare> = {
  chat: MessageSquare,
  tool_call: Wrench,
  error: AlertCircle,
  status_change: Power,
  onboarding: GraduationCap,
  task_complete: CheckCircle,
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  success: { bg: "rgba(16,185,129,0.12)", text: "#10B981", dot: "#10B981" },
  error: { bg: "rgba(239,68,68,0.12)", text: "#EF4444", dot: "#EF4444" },
  warning: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", dot: "#F59E0B" },
  pending: { bg: "rgba(59,130,246,0.12)", text: "#3B82F6", dot: "#3B82F6" },
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr + "Z").getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface ActivityFeedProps {
  deploymentId?: string;
  compact?: boolean;
  limit?: number;
  maxHeight?: string;
}

export default function ActivityFeed({
  deploymentId,
  compact = false,
  limit: initialLimit = 10,
  maxHeight,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchActivities = useCallback(
    async (offset = 0, append = false) => {
      try {
        const params = new URLSearchParams();
        if (deploymentId) params.set("deploymentId", deploymentId);
        params.set("limit", String(initialLimit));
        params.set("offset", String(offset));

        const res = await fetch(`/api/activity?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setActivities((prev) =>
            append ? [...prev, ...data.activities] : data.activities
          );
          setTotal(data.total);
          setHasMore(data.hasMore);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [deploymentId, initialLimit]
  );

  useEffect(() => {
    setLoading(true);
    fetchActivities(0, false);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchActivities(0, false), 30000);

    // Refetch when tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchActivities(0, false);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchActivities]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loadingMore || !hasMore) return;
    // Load more when scrolled within 50px of bottom
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      setLoadingMore(true);
      fetchActivities(activities.length, true);
    }
  }, [loadingMore, hasMore, activities.length, fetchActivities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2
          size={20}
          className="animate-spin"
          style={{ color: "var(--text-muted)" }}
        />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div
        className="text-center py-8 rounded-xl"
        style={{
          background: compact ? "transparent" : "var(--bg-card)",
          border: compact ? "none" : "1px solid var(--border-primary)",
        }}
      >
        <Activity
          size={28}
          className="mx-auto mb-2"
          style={{ color: "var(--text-muted)" }}
        />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto space-y-0 pr-1"
      style={{ maxHeight: maxHeight ?? (compact ? "280px" : "400px") }}
      onScroll={handleScroll}
    >
      {activities.map((item, idx) => {
        const Icon = typeIcons[item.type] || Activity;
        const colors = statusColors[item.status] || statusColors.success;
        const isLast = idx === activities.length - 1;

        return (
          <div key={item.id} className="flex gap-3 relative">
            {/* Timeline line */}
            {!isLast && (
              <div
                className="absolute left-[15px] top-[36px] w-px"
                style={{
                  background: "var(--border-primary)",
                  height: "calc(100% - 20px)",
                }}
              />
            )}

            {/* Icon */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
              style={{ background: colors.bg }}
            >
              <Icon size={14} style={{ color: colors.text }} />
            </div>

            {/* Content */}
            <div
              className={`flex-1 min-w-0 ${compact ? "pb-3" : "pb-4"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium truncate ${compact ? "text-xs" : "text-sm"}`}
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </p>
                  {item.description && !compact && (
                    <p
                      className="text-xs mt-0.5 line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.description}
                    </p>
                  )}
                  {item.deploymentName && !deploymentId && (
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.deploymentName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status dot */}
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: colors.dot }}
                  />
                  <span
                    className="text-[10px] whitespace-nowrap"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {relativeTime(item.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {loadingMore && (
        <div className="flex justify-center py-3">
          <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      )}

      {!hasMore && activities.length > 0 && (
        <p className="text-center text-[10px] py-2" style={{ color: "var(--text-muted)" }}>
          All activity loaded ({total} total)
        </p>
      )}
    </div>
  );
}
