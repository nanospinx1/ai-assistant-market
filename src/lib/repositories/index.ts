/**
 * Repository barrel — re-export all repositories for convenient imports.
 *
 * Usage: import * as UserRepo from "@/lib/repositories/users";
 *   or:  import { findById } from "@/lib/repositories/users";
 *
 * Each repository is a self-contained module. This index is only for discovery.
 */

export * as UserRepo from "./users";
export * as DeploymentRepo from "./deployments";
export * as EmployeeRepo from "./employees";
export * as ToolRepo from "./tools";
export * as KnowledgeRepo from "./knowledge";
export * as TaskRepo from "./tasks";
export * as ApprovalRepo from "./approvals";
export * as NotificationRepo from "./notifications";
export * as ActivityRepo from "./activity";
export * as PerformanceRepo from "./performance";
export * as ConversationRepo from "./conversations";
export * as ConfigVersionRepo from "./config-versions";
