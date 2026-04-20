"use client";

import Sidebar from "@/components/layout/Sidebar";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import GlobalAIPanel from "@/components/GlobalAIPanel";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AIAssistantProvider>
      <div className="min-h-screen">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
        </main>
      </div>
      <GlobalAIPanel />
    </AIAssistantProvider>
  );
}
