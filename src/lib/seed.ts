import { getDb } from "./db";
import { prebuiltEmployees } from "@/data/employees";
import bcryptjs from "bcryptjs";
import { v4 as uuid } from "uuid";

export function seedDatabase() {
  const db = getDb();

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count > 0) return;

  // Create demo users
  const demoUsers = [
    { id: uuid(), email: "demo@company.com", name: "John Smith", password: bcryptjs.hashSync("demo123", 10), company: "Smith & Co." },
    { id: uuid(), email: "jane@startup.io", name: "Jane Doe", password: bcryptjs.hashSync("demo123", 10), company: "StartupIO" },
  ];

  const insertUser = db.prepare("INSERT INTO users (id, email, name, password, company) VALUES (?, ?, ?, ?, ?)");
  for (const user of demoUsers) {
    insertUser.run(user.id, user.email, user.name, user.password, user.company);
  }

  // Insert pre-built employees
  const insertEmployee = db.prepare(`
    INSERT OR IGNORE INTO ai_employees (id, name, role, category, description, long_description, capabilities, price_monthly, price_yearly, rating, reviews_count, avatar, status, is_prebuilt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const emp of prebuiltEmployees) {
    insertEmployee.run(
      emp.id, emp.name, emp.role, emp.category, emp.description, emp.long_description,
      JSON.stringify(emp.capabilities), emp.price_monthly, emp.price_yearly,
      emp.rating, emp.reviews_count, emp.avatar, emp.status, emp.is_prebuilt ? 1 : 0
    );
  }

  // Create some demo deployments and purchases for the first user
  const userId = demoUsers[0].id;
  const deployments = [
    { id: uuid(), employee_id: "emp-customer-support", name: "Main Support Bot", status: "active", deployed_at: "2026-03-15T10:00:00Z" },
    { id: uuid(), employee_id: "emp-bookkeeper", name: "Finance Assistant", status: "active", deployed_at: "2026-04-01T09:00:00Z" },
    { id: uuid(), employee_id: "emp-sales-assistant", name: "Sales Outreach", status: "paused", deployed_at: "2026-04-10T14:00:00Z" },
  ];

  const insertDeployment = db.prepare(`
    INSERT INTO deployments (id, user_id, employee_id, name, status, config, deployed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPurchase = db.prepare(`
    INSERT INTO purchases (id, user_id, employee_id, plan, amount, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertMetric = db.prepare(`
    INSERT INTO performance_metrics (deployment_id, metric_type, value, recorded_at)
    VALUES (?, ?, ?, ?)
  `);

  const defaultConfig = JSON.stringify({
    tools: ["email", "chat"],
    data_sources: ["knowledge_base"],
    schedule: "24/7",
    notifications: true,
    auto_scale: false,
  });

  for (const dep of deployments) {
    insertDeployment.run(dep.id, userId, dep.employee_id, dep.name, dep.status, defaultConfig, dep.deployed_at);
    const emp = prebuiltEmployees.find(e => e.id === dep.employee_id)!;
    insertPurchase.run(uuid(), userId, dep.employee_id, "monthly", emp.price_monthly, "active");

    // Generate performance metrics for last 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString();

      insertMetric.run(dep.id, "tasks_completed", Math.floor(Math.random() * 50) + 20, dateStr);
      insertMetric.run(dep.id, "response_time", Math.random() * 3 + 0.5, dateStr);
      insertMetric.run(dep.id, "accuracy", Math.random() * 10 + 90, dateStr);
      insertMetric.run(dep.id, "uptime", Math.random() * 2 + 98, dateStr);
    }
  }
}
