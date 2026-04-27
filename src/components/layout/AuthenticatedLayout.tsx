"use client";

import Sidebar from "@/components/layout/Sidebar";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import GlobalAIPanel from "@/components/GlobalAIPanel";
import { useAuth } from "@/components/layout/Providers";
import Link from "next/link";
import { Mail } from "lucide-react";

function VerificationBanner() {
  const { user } = useAuth();
  if (!user || user.email_verified !== false) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 flex items-center justify-center gap-3 text-sm">
      <Mail size={16} className="text-amber-400" />
      <span className="text-amber-300">Please verify your email to access all features.</span>
      <Link
        href="/auth/verify"
        className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
      >
        Verify Now
      </Link>
    </div>
  );
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AIAssistantProvider>
      <div className="min-h-screen">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          <VerificationBanner />
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
        </main>
      </div>
      <GlobalAIPanel />
    </AIAssistantProvider>
  );
}
