"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Scope detection                                                     */
/* ------------------------------------------------------------------ */

export type AIScope =
  | "dashboard"
  | "employees"
  | "marketplace"
  | "custom-builder"
  | "performance"
  | "resources"
  | "approvals"
  | "configure"
  | "settings"
  | "general";

export interface ScopeInfo {
  scope: AIScope;
  deploymentId?: string;
  label: string;
  subtitle: string;
  starterPrompts: string[];
}

function resolveScope(pathname: string): ScopeInfo {
  const configMatch = pathname.match(/^\/deploy\/([^/]+)\/(onboarding|tasks|workspace)/);
  if (configMatch) {
    return {
      scope: "configure",
      deploymentId: configMatch[1],
      label: "Configure Assistant",
      subtitle: "Set up your AI employee through conversation",
      starterPrompts: [
        "Help me set up this employee from scratch",
        "What tools should I connect for customer support?",
        "I need to create scheduled tasks for daily reports",
        "Help me set up approval rules for safety",
      ],
    };
  }

  if (pathname.startsWith("/dashboard")) {
    return {
      scope: "dashboard",
      label: "Dashboard Assistant",
      subtitle: "Ask about your AI employees and business overview",
      starterPrompts: [
        "Give me a summary of how my AI employees are doing",
        "Which employee needs attention?",
        "Help me get started with my first AI employee",
      ],
    };
  }

  if (pathname.startsWith("/deploy")) {
    return {
      scope: "employees",
      label: "Employee Assistant",
      subtitle: "Help with managing your AI employees",
      starterPrompts: [
        "Help me choose which AI employee to deploy next",
        "What's the best way to organize my team of AI employees?",
        "I need an AI for customer support — what should I do?",
      ],
    };
  }

  if (pathname.startsWith("/marketplace")) {
    return {
      scope: "marketplace",
      label: "Hiring Assistant",
      subtitle: "Describe what you need — I'll find the right AI employee",
      starterPrompts: [
        "I need someone to handle customer emails and support tickets",
        "I'm looking for an AI to manage my social media content",
        "Help me find an AI for bookkeeping and invoicing",
        "What AI employees do you recommend for a restaurant?",
      ],
    };
  }

  if (pathname.startsWith("/custom-builder")) {
    return {
      scope: "custom-builder",
      label: "Builder Assistant",
      subtitle: "Describe your ideal AI employee — I'll help you design it",
      starterPrompts: [
        "I need a custom AI that can handle our specific workflow",
        "Help me design an AI employee for my unique business needs",
        "What capabilities should my custom AI employee have?",
      ],
    };
  }

  if (pathname.startsWith("/performance")) {
    return {
      scope: "performance",
      label: "Performance Assistant",
      subtitle: "Ask about your AI employees' performance and insights",
      starterPrompts: [
        "How are my AI employees performing overall?",
        "Which employee has the highest task completion rate?",
        "Are there any performance issues I should address?",
        "How can I improve my AI team's efficiency?",
      ],
    };
  }

  if (pathname.startsWith("/integrations")) {
    return {
      scope: "resources",
      label: "Resources Assistant",
      subtitle: "Set up your global tools and knowledge through conversation",
      starterPrompts: [
        "Help me set up tools and knowledge for my business",
        "I have a small retail store — what tools do I need?",
        "I want to add our company processes to the knowledge base",
        "What integrations do you recommend for a consulting firm?",
      ],
    };
  }

  if (pathname.startsWith("/approvals")) {
    return {
      scope: "approvals",
      label: "Approvals Assistant",
      subtitle: "Set up smart approval rules to keep things safe",
      starterPrompts: [
        "Help me set up approval rules for my AI employees",
        "What actions should require my approval?",
        "I want to make sure no money is spent without my OK",
      ],
    };
  }

  return {
    scope: "general",
    label: "AI Assistant",
    subtitle: "How can I help you today?",
    starterPrompts: [
      "Help me get started with AI Market",
      "What can I do on this platform?",
      "I need help setting up my business",
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */

interface AIAssistantContextValue {
  isOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  scopeInfo: ScopeInfo;
  shouldPulse: boolean;
}

const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

export function useAIAssistant() {
  const ctx = useContext(AIAssistantContext);
  if (!ctx) throw new Error("useAIAssistant must be used within AIAssistantProvider");
  return ctx;
}

export function useAIAssistantOptional() {
  return useContext(AIAssistantContext);
}

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const scopeInfo = resolveScope(pathname);

  // Pulse on pages where AI can help and user hasn't opened assistant yet
  const [visitedScopes, setVisitedScopes] = useState<Set<string>>(new Set());
  const pulsableScopes: AIScope[] = ["resources", "configure", "marketplace", "custom-builder"];
  const shouldPulse = pulsableScopes.includes(scopeInfo.scope) && !visitedScopes.has(scopeInfo.scope);

  const prevScope = useRef(scopeInfo.scope);
  useEffect(() => {
    prevScope.current = scopeInfo.scope;
  }, [scopeInfo.scope]);

  const openAssistant = useCallback(() => {
    setIsOpen(true);
    setVisitedScopes((prev) => new Set(prev).add(scopeInfo.scope));
  }, [scopeInfo.scope]);

  const closeAssistant = useCallback(() => setIsOpen(false), []);
  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setVisitedScopes((vs) => new Set(vs).add(scopeInfo.scope));
      return !prev;
    });
  }, [scopeInfo.scope]);

  return (
    <AIAssistantContext.Provider
      value={{ isOpen, openAssistant, closeAssistant, toggleAssistant, scopeInfo, shouldPulse }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}
