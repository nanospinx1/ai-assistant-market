"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Rocket,
  Check,
  ArrowLeft,
  ArrowRight,
  Settings,
  Zap,
  Mail,
  MessageSquare,
  Phone,
  Database,
  Calendar,
  BarChart3,
  Globe,
  Wrench,
  BookOpen,
  FileText,
  FolderOpen,
  Clock,
  Shield,
  Headphones,
  TrendingUp,
  Palette,
  Calculator,
  Users,
  Monitor,
} from "lucide-react";

const categoryIcons: Record<string, any> = {
  "Customer Service": Headphones,
  "Sales": TrendingUp,
  "Marketing": Palette,
  "Finance": Calculator,
  "Analytics": BarChart3,
  "Human Resources": Users,
  "IT Support": Monitor,
  "Operations": Settings,
};

const categoryGradients: Record<string, string> = {
  "Customer Service": "from-blue-500 to-cyan-500",
  "Sales": "from-emerald-500 to-teal-500",
  "Marketing": "from-pink-500 to-rose-500",
  "Finance": "from-amber-500 to-orange-500",
  "Analytics": "from-violet-500 to-purple-500",
  "Human Resources": "from-sky-500 to-blue-500",
  "IT Support": "from-slate-400 to-zinc-500",
  "Operations": "from-indigo-500 to-blue-500",
};

const TOOLS = [
  { name: "Email", icon: Mail, desc: "Send & receive emails" },
  { name: "Live Chat", icon: MessageSquare, desc: "Real-time messaging" },
  { name: "Phone", icon: Phone, desc: "Voice call handling" },
  { name: "CRM", icon: Database, desc: "Customer relationship data" },
  { name: "Calendar", icon: Calendar, desc: "Schedule management" },
  { name: "Analytics", icon: BarChart3, desc: "Data & reporting" },
  { name: "API", icon: Globe, desc: "External integrations" },
  { name: "Custom", icon: Wrench, desc: "Custom tool setup" },
];

const DATA_SOURCES = [
  { name: "Knowledge Base", icon: BookOpen, desc: "Internal documentation" },
  { name: "Website", icon: Globe, desc: "Public web content" },
  { name: "Documents", icon: FileText, desc: "Files & PDFs" },
  { name: "CRM Data", icon: Database, desc: "Customer records" },
  { name: "Analytics", icon: BarChart3, desc: "Usage & metrics data" },
  { name: "Custom", icon: FolderOpen, desc: "Custom data source" },
];

const SCHEDULES = [
  { name: "24/7 Always On", icon: Shield, desc: "Round-the-clock availability" },
  { name: "Business Hours (9-5)", icon: Clock, desc: "Standard work hours" },
  { name: "Custom Schedule", icon: Calendar, desc: "Define your own hours" },
];

const STEPS = ["Configure Your Employee", "Review Configuration", "Deploying"];

interface Employee {
  id: string;
  name: string;
  category?: string;
  role?: string;
}

interface DeployConfig {
  name: string;
  tools: string[];
  dataSources: string[];
  schedule: string;
}

export default function DeployConfigPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [step, setStep] = useState(0);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<DeployConfig>({
    name: "",
    tools: [],
    dataSources: [],
    schedule: "24/7 Always On",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function loadEmployee() {
      try {
        const res = await fetch("/api/employees");
        if (res.ok) {
          const data = await res.json();
          const list = data.employees ?? data;
          const found = list.find((e: Employee) => e.id === employeeId);
          if (found) setEmployee(found);
        }
      } catch {
        // silently handle
      }
    }
    if (employeeId) loadEmployee();
  }, [employeeId]);

  const toggleItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const canProceed =
    step === 0
      ? config.name.trim() !== "" && config.tools.length > 0 && config.dataSources.length > 0
      : true;

  const handleDeploy = async () => {
    setDeploying(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 400);
    try {
      await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          userId: user?.id,
          ...config,
        }),
      });
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setDeployed(true), 600);
    } catch {
      clearInterval(interval);
    } finally {
      setDeploying(false);
    }
  };

  // Auto-trigger deploy on step 3
  useEffect(() => {
    if (step === 2 && !deploying && !deployed) {
      handleDeploy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  const EmployeeIcon = categoryIcons[employee?.category ?? ""] ?? Rocket;
  const gradient = categoryGradients[employee?.category ?? ""] ?? "from-indigo-500 to-purple-500";

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step
                    ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                    : i === step
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-[#141B2D] text-[#64748B] border border-[#1E293B]"
                }`}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  i <= step ? "text-[#F1F5F9]" : "text-[#64748B]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-4">
                <div className="h-0.5 rounded-full bg-[#1E293B]">
                  <div
                    className="h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                    style={{ width: i < step ? "100%" : "0%" }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl p-8 bg-[#141B2D] border border-[#1E293B]">
        {/* Step 1: Configure */}
        {step === 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <EmployeeIcon size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#F1F5F9]">
                  Configure Your Employee
                </h2>
                {employee && (
                  <p className="text-sm text-[#94A3B8]">{employee.name}</p>
                )}
              </div>
            </div>

            {/* Deployment Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94A3B8]">
                Deployment Name
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig((c) => ({ ...c, name: e.target.value }))}
                placeholder="e.g. Customer Support – West Region"
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors bg-[#0B1120] border border-[#1E293B] text-[#F1F5F9] placeholder-[#64748B] focus:border-indigo-500"
              />
            </div>

            {/* Tools */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#94A3B8]">
                Select Tools
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TOOLS.map((tool) => {
                  const active = config.tools.includes(tool.name);
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.name}
                      onClick={() => setConfig((c) => ({ ...c, tools: toggleItem(c.tools, tool.name) }))}
                      className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                        active
                          ? "bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10"
                          : "bg-[#0B1120] border-[#1E293B] hover:border-[#334155]"
                      }`}
                    >
                      <Icon size={20} className={active ? "text-indigo-400 mb-2" : "text-[#64748B] mb-2"} />
                      <p className={`text-sm font-medium ${active ? "text-[#F1F5F9]" : "text-[#94A3B8]"}`}>
                        {tool.name}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">{tool.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data Sources */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#94A3B8]">
                Data Sources
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DATA_SOURCES.map((src) => {
                  const active = config.dataSources.includes(src.name);
                  const Icon = src.icon;
                  return (
                    <button
                      key={src.name}
                      onClick={() =>
                        setConfig((c) => ({ ...c, dataSources: toggleItem(c.dataSources, src.name) }))
                      }
                      className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                        active
                          ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10"
                          : "bg-[#0B1120] border-[#1E293B] hover:border-[#334155]"
                      }`}
                    >
                      <Icon size={20} className={active ? "text-emerald-400 mb-2" : "text-[#64748B] mb-2"} />
                      <p className={`text-sm font-medium ${active ? "text-[#F1F5F9]" : "text-[#94A3B8]"}`}>
                        {src.name}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">{src.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#94A3B8]">
                Schedule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SCHEDULES.map((sched) => {
                  const active = config.schedule === sched.name;
                  const Icon = sched.icon;
                  return (
                    <button
                      key={sched.name}
                      onClick={() => setConfig((c) => ({ ...c, schedule: sched.name }))}
                      className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                        active
                          ? "bg-violet-500/10 border-violet-500 shadow-lg shadow-violet-500/10"
                          : "bg-[#0B1120] border-[#1E293B] hover:border-[#334155]"
                      }`}
                    >
                      <Icon size={20} className={active ? "text-violet-400 mb-2" : "text-[#64748B] mb-2"} />
                      <p className={`text-sm font-medium ${active ? "text-[#F1F5F9]" : "text-[#94A3B8]"}`}>
                        {sched.name}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">{sched.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#F1F5F9]">
                Review Configuration
              </h2>
            </div>

            <div className="rounded-xl bg-[#0B1120] border border-[#1E293B] divide-y divide-[#1E293B]">
              {[
                { label: "Deployment Name", value: config.name },
                { label: "Tools", value: config.tools.join(", ") },
                { label: "Data Sources", value: config.dataSources.join(", ") },
                { label: "Schedule", value: config.schedule },
                { label: "Employee", value: employee?.name ?? employeeId },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-start p-4">
                  <span className="text-sm font-medium text-[#94A3B8]">
                    {row.label}
                  </span>
                  <span className="text-sm text-right max-w-[60%] text-[#F1F5F9]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Deploying */}
        {step === 2 && (
          <div className="text-center space-y-6 py-8">
            {deployed ? (
              <>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 animate-bounce">
                  <Check size={44} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#F1F5F9]">
                  Successfully Deployed!
                </h2>
                <p className="text-[#94A3B8] max-w-sm mx-auto">
                  Your AI employee is now live and ready to work. Monitor performance from your dashboard.
                </p>
                {/* Celebration dots */}
                <div className="flex justify-center gap-2">
                  {["bg-emerald-400", "bg-indigo-400", "bg-amber-400", "bg-pink-400", "bg-cyan-400"].map((c, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${c} animate-ping`}
                      style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1.5s" }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30">
                  <Rocket size={40} className="text-white animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <h2 className="text-2xl font-bold text-[#F1F5F9]">
                  Deploying Your Employee...
                </h2>
                <p className="text-[#94A3B8]">
                  Setting up <strong className="text-[#F1F5F9]">{config.name}</strong>. This will only take a moment.
                </p>
                {/* Progress bar */}
                <div className="max-w-sm mx-auto">
                  <div className="h-2 rounded-full bg-[#0B1120]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#64748B] mt-2">{Math.round(progress)}% complete</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {!deployed && step < 2 && (
        <div className="flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 bg-[#141B2D] text-[#F1F5F9] border border-[#1E293B] hover:bg-[#1C2640]"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={!canProceed}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-30 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            {step === 1 ? "Deploy" : "Next"} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
