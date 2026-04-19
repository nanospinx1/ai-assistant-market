export interface AIEmployee {
  id: string;
  name: string;
  role: string;
  category: string;
  description: string;
  long_description?: string;
  capabilities: string[];
  price_monthly: number;
  price_yearly?: number;
  rating: number;
  reviews_count: number;
  avatar: string;
  status: string;
  is_prebuilt: boolean;
  created_by?: string;
}

export interface Deployment {
  id: string;
  user_id: string;
  employee_id: string;
  name: string;
  status: "configuring" | "deploying" | "active" | "paused" | "stopped";
  config: DeploymentConfig;
  deployed_at?: string;
  created_at: string;
  employee?: AIEmployee;
}

export interface DeploymentConfig {
  tools: string[];
  data_sources: string[];
  schedule: string;
  notifications: boolean;
  auto_scale: boolean;
}

export interface PerformanceMetric {
  id: number;
  deployment_id: string;
  metric_type: string;
  value: number;
  recorded_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  avatar?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  employee_id: string;
  plan: "monthly" | "yearly";
  amount: number;
  status: string;
  purchased_at: string;
}
