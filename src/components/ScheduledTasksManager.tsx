"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CalendarClock,
  Plus,
  Play,
  Pause,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

/* ── Types ── */

interface ScheduleConfig {
  time?: string;
  days?: string[];
  dayOfMonth?: number;
  cron?: string;
}

interface ScheduledTask {
  id: string;
  deployment_id: string;
  user_id: string;
  name: string;
  description: string | null;
  schedule_type: string;
  schedule_config: string | null;
  task_prompt: string;
  is_active: number;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
  created_at: string;
}

interface TaskRun {
  id: string;
  task_id: string;
  deployment_id: string;
  status: string;
  result: string | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
}

/* ── Helpers ── */

function formatSchedule(type: string, configStr: string | null): string {
  const config: ScheduleConfig = configStr ? JSON.parse(configStr) : {};
  const time = config.time || "09:00";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const timeStr = `${h12}:${m} ${ampm}`;

  switch (type) {
    case "daily":
      return `Daily at ${timeStr}`;
    case "weekly": {
      const days = config.days;
      if (!days || days.length === 0) return `Weekly at ${timeStr}`;
      if (days.length === 7) return `Daily at ${timeStr}`;
      return `Every ${days.join(", ")} at ${timeStr}`;
    }
    case "monthly": {
      const d = config.dayOfMonth || 1;
      const suffix = d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th";
      return `${d}${suffix} of every month at ${timeStr}`;
    }
    case "custom":
      return config.cron ? `Custom: ${config.cron}` : `Custom schedule at ${timeStr}`;
    default:
      return type;
  }
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ── Main Component ── */

interface Props {
  deploymentId: string;
  /** Hide the header (back button + title). Useful when embedded inside another page. */
  embedded?: boolean;
  /** Called whenever the task list changes (add/delete/toggle). Passes the current task count. */
  onTasksChange?: (count: number) => void;
}

export default function ScheduledTasksManager({ deploymentId, embedded = false, onTasksChange }: Props) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const [taskRuns, setTaskRuns] = useState<Record<string, TaskRun[]>>({});
  const [runningTasks, setRunningTasks] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrompt, setFormPrompt] = useState("");
  const [formType, setFormType] = useState<string>("daily");
  const [formTime, setFormTime] = useState("09:00");
  const [formDays, setFormDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [formDayOfMonth, setFormDayOfMonth] = useState(1);
  const [formCron, setFormCron] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!deploymentId) return;
    try {
      const res = await fetch(`/api/scheduled-tasks?deploymentId=${deploymentId}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.tasks ?? [];
        setTasks(list);
        onTasksChange?.(list.length);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [deploymentId, onTasksChange]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /* ── Actions ── */

  const createTask = async () => {
    if (!formName.trim() || !formPrompt.trim()) return;
    setSubmitting(true);
    try {
      const scheduleConfig: ScheduleConfig = { time: formTime };
      if (formType === "weekly") scheduleConfig.days = formDays;
      if (formType === "monthly") scheduleConfig.dayOfMonth = formDayOfMonth;
      if (formType === "custom") scheduleConfig.cron = formCron;

      const res = await fetch("/api/scheduled-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deploymentId,
          name: formName.trim(),
          description: formDesc.trim() || undefined,
          scheduleType: formType,
          scheduleConfig,
          taskPrompt: formPrompt.trim(),
        }),
      });
      if (res.ok) {
        setFormName("");
        setFormDesc("");
        setFormPrompt("");
        setFormType("daily");
        setFormTime("09:00");
        setFormDays(["Mon", "Wed", "Fri"]);
        setFormDayOfMonth(1);
        setFormCron("");
        setShowForm(false);
        fetchTasks();
      }
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (task: ScheduledTask) => {
    try {
      const res = await fetch("/api/scheduled-tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, isActive: !task.is_active }),
      });
      if (res.ok) fetchTasks();
    } catch {
      /* ignore */
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/scheduled-tasks?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setDeleteConfirm(null);
      }
    } catch {
      /* ignore */
    }
  };

  const runNow = async (task: ScheduledTask) => {
    setRunningTasks((prev) => ({ ...prev, [task.id]: true }));
    try {
      const chatRes = await fetch(`/api/deployments/${deploymentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: task.task_prompt }),
      });

      let status = "success";
      let result = null;
      let errorText = null;

      if (chatRes.ok) {
        result = await chatRes.json();
      } else {
        status = "error";
        const errData = await chatRes.json().catch(() => ({}));
        errorText = errData.error || `HTTP ${chatRes.status}`;
      }

      await fetch("/api/scheduled-tasks/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, deploymentId, status, result, errorText }),
      });

      fetchTasks();
      if (expandedHistory[task.id]) {
        loadHistory(task.id);
      }
    } catch {
      /* ignore */
    } finally {
      setRunningTasks((prev) => ({ ...prev, [task.id]: false }));
    }
  };

  const loadHistory = async (taskId: string) => {
    try {
      const res = await fetch(`/api/scheduled-tasks/runs?taskId=${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTaskRuns((prev) => ({ ...prev, [taskId]: data.runs ?? [] }));
      }
    } catch {
      /* ignore */
    }
  };

  const toggleHistory = (taskId: string) => {
    const newExpanded = !expandedHistory[taskId];
    setExpandedHistory((prev) => ({ ...prev, [taskId]: newExpanded }));
    if (newExpanded && !taskRuns[taskId]) {
      loadHistory(taskId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {!embedded && <div className="h-9 w-56 rounded-lg" style={{ background: "var(--bg-card)" }} />}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 animate-fade-in ${embedded ? "" : "max-w-4xl"}`}>
      {/* Description */}
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Define recurring tasks and schedules for your agent. Tasks run automatically based on the schedule you set.
      </p>

      {/* Create Task Button / Form */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:opacity-90"
        >
          <span className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-primary)" }}>
            <Plus size={18} className="text-indigo-400" />
            Create New Task
          </span>
          {showForm ? (
            <ChevronUp size={18} style={{ color: "var(--text-secondary)" }} />
          ) : (
            <ChevronDown size={18} style={{ color: "var(--text-secondary)" }} />
          )}
        </button>

        {showForm && (
          <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
            <div className="pt-4">
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Task Name *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Weekly Sales Report"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Description
              </label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Optional description..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Task Prompt * — What should the agent do?
              </label>
              <textarea
                value={formPrompt}
                onChange={(e) => setFormPrompt(e.target.value)}
                placeholder="e.g., Generate a weekly sales summary report with top performing products and revenue trends"
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Schedule Type */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Schedule
              </label>
              <div className="flex gap-2 flex-wrap">
                {(["daily", "weekly", "monthly", "custom"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormType(t)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: formType === t ? "var(--primary)" : "var(--bg-tertiary)",
                      color: formType === t ? "#fff" : "var(--text-secondary)",
                      border: `1px solid ${formType === t ? "var(--primary)" : "var(--border-primary)"}`,
                    }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time picker + conditional fields */}
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                  Time
                </label>
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {formType === "weekly" && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                    Days
                  </label>
                  <div className="flex gap-1">
                    {DAYS.map((d) => (
                      <button
                        key={d}
                        onClick={() =>
                          setFormDays((prev) =>
                            prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                          )
                        }
                        className="w-9 h-9 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: formDays.includes(d) ? "var(--primary)" : "var(--bg-tertiary)",
                          color: formDays.includes(d) ? "#fff" : "var(--text-secondary)",
                          border: `1px solid ${formDays.includes(d) ? "var(--primary)" : "var(--border-primary)"}`,
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formType === "monthly" && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                    Day of Month
                  </label>
                  <select
                    value={formDayOfMonth}
                    onChange={(e) => setFormDayOfMonth(parseInt(e.target.value, 10))}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formType === "custom" && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                    Cron Expression
                  </label>
                  <input
                    type="text"
                    value={formCron}
                    onChange={(e) => setFormCron(e.target.value)}
                    placeholder="e.g., 0 9 * * 1-5"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={createTask}
              disabled={submitting || !formName.trim() || !formPrompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Create Task
            </button>
          </div>
        )}
      </div>

      {/* Task List */}
      {tasks.length === 0 && !loading ? (
        <div
          className="rounded-xl p-10 text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <CalendarClock size={40} className="mx-auto mb-3 text-indigo-400 opacity-50" />
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            No scheduled tasks yet
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Create a task above to automate your agent&apos;s work on a recurring schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isRunning = runningTasks[task.id];
            const historyOpen = expandedHistory[task.id];
            const runs = taskRuns[task.id] || [];

            return (
              <div
                key={task.id}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderLeft: `3px solid ${task.is_active ? "#6366F1" : "#64748B"}`,
                }}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {task.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            task.is_active
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-500/15 text-slate-400 border border-slate-500/20"
                          }`}
                        >
                          {task.is_active ? "Active" : "Paused"}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatSchedule(task.schedule_type, task.schedule_config)}
                        </span>
                        <span>Last run: {timeAgo(task.last_run_at)}</span>
                        <span>Runs: {task.run_count}</span>
                      </div>
                      <p
                        className="text-xs mt-2 px-2 py-1 rounded-md inline-block"
                        style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                      >
                        {task.task_prompt.length > 100 ? task.task_prompt.slice(0, 100) + "…" : task.task_prompt}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleActive(task)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          background: task.is_active ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
                        }}
                        title={task.is_active ? "Pause task" : "Resume task"}
                      >
                        {task.is_active ? (
                          <Pause size={15} className="text-emerald-400" />
                        ) : (
                          <Play size={15} className="text-indigo-400" />
                        )}
                      </button>

                      <button
                        onClick={() => runNow(task)}
                        disabled={isRunning}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-blue-500/15 disabled:opacity-50"
                        title="Run Now"
                      >
                        {isRunning ? (
                          <Loader2 size={15} className="text-blue-400 animate-spin" />
                        ) : (
                          <Play size={15} className="text-blue-400" />
                        )}
                      </button>

                      {deleteConfirm === task.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(task.id)}
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-red-500/15"
                          title="Delete task"
                        >
                          <Trash2 size={15} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* History Toggle */}
                <button
                  onClick={() => toggleHistory(task.id)}
                  className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-medium border-t transition-colors hover:opacity-80"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}
                >
                  <span>View History ({task.run_count} runs)</span>
                  {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* History Panel */}
                {historyOpen && (
                  <div
                    className="px-5 pb-4 border-t"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    {runs.length === 0 ? (
                      <p className="text-xs py-3" style={{ color: "var(--text-muted)" }}>
                        No runs yet.
                      </p>
                    ) : (
                      <div className="space-y-2 pt-3">
                        {runs.slice(0, 5).map((run) => (
                          <div
                            key={run.id}
                            className="flex items-start gap-3 p-3 rounded-lg"
                            style={{ background: "var(--bg-tertiary)" }}
                          >
                            {run.status === "success" && <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />}
                            {run.status === "error" && <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />}
                            {run.status === "running" && <Loader2 size={16} className="text-blue-400 shrink-0 mt-0.5 animate-spin" />}
                            {run.status === "pending" && <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-xs">
                                <span
                                  className={`font-semibold ${
                                    run.status === "success"
                                      ? "text-emerald-400"
                                      : run.status === "error"
                                        ? "text-red-400"
                                        : "text-amber-400"
                                  }`}
                                >
                                  {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                                </span>
                                <span style={{ color: "var(--text-muted)" }}>
                                  {new Date(run.started_at).toLocaleString()}
                                </span>
                                {run.completed_at && run.started_at && (
                                  <span style={{ color: "var(--text-muted)" }}>
                                    ({Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s)
                                  </span>
                                )}
                              </div>
                              {run.error && (
                                <p className="text-xs mt-1 text-red-400 truncate">{run.error}</p>
                              )}
                              {run.result && (
                                <p className="text-xs mt-1 truncate" style={{ color: "var(--text-secondary)" }}>
                                  {(() => {
                                    try {
                                      const parsed = JSON.parse(run.result);
                                      return parsed.reply || parsed.message || JSON.stringify(parsed).slice(0, 120);
                                    } catch {
                                      return String(run.result).slice(0, 120);
                                    }
                                  })()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
