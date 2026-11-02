export interface UserProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  whatsapp?: string;
  linkedin: string;
  location: string;
  bio: string;
  github?: string;
  yearsExperience: number;
}

export type DashboardId =
  | 'home'
  | 'executive-summary'
  | 'sales'
  | 'support'
  | 'hr'
  | 'finance'
  | 'inventory'
  | 'marketing'
  | 'cleaning'
  | 'sql-excel'
  | 'contact';

export interface SalesRecord {
  order_id: string;
  date: string;
  month: string;
  region: 'North' | 'South' | 'East' | 'West';
  sales_rep: string;
  product_category: 'Electronics' | 'Office Supplies' | 'Furniture' | 'Software Licenses' | 'Hardware';
  product: string;
  units: number;
  unit_price: number;
  revenue: number;
  discount_pct: number;
  target: number;
  achieved_target: boolean;
}

export interface SupportTicket {
  ticket_id: string;
  created_date: string;
  month: string;
  category: 'Billing' | 'Login' | 'Delivery' | 'Product' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  agent: string;
  team: 'Tier 1' | 'Tier 2' | 'Escalations' | 'Billing Operations';
  channel: 'Email' | 'Chat' | 'Phone';
  first_response_hrs: number;
  resolution_hrs: number;
  sla_met: boolean;
  csat: number; // 1 to 5
}

export interface HrRecord {
  employee_id: string;
  department: 'Engineering' | 'Sales' | 'Marketing' | 'Customer Support' | 'HR & Ops' | 'Finance';
  job_level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Manager';
  hire_date: string;
  exit_date: string | null;
  is_active: boolean;
  exit_reason: 'Better Opportunity' | 'Compensation' | 'Work-Life Balance' | 'Relocation' | 'Management' | null;
  tenure_months: number;
  salary_band: 'Entry' | 'Mid-Tier' | 'Senior' | 'Executive';
  gender: 'Male' | 'Female' | 'Non-Binary';
  location: 'Bangalore' | 'Mumbai' | 'Delhi NCR' | 'Hyderabad' | 'Remote';
}

export interface FinanceRecord {
  id: string;
  month: string;
  department: 'Marketing' | 'Engineering' | 'Sales' | 'Operations' | 'Human Resources' | 'IT & Security';
  expense_category: 'Salaries' | 'Marketing' | 'Software' | 'Travel' | 'Operations';
  budget: number;
  actual: number;
  variance: number; // actual - budget
  variance_pct: number; // ((actual - budget) / budget) * 100
  vendor: string;
}

export interface InventoryRecord {
  sku: string;
  product_name: string;
  category: 'Electronics' | 'Fast Moving' | 'Packaging' | 'Apparel' | 'Industrial';
  warehouse: 'Mumbai Central' | 'Delhi North' | 'Bengaluru South' | 'Kolkata East' | 'Ahmedabad Hub';
  opening_stock: number;
  received: number;
  dispatched: number;
  closing_stock: number;
  reorder_level: number;
  lead_time_days: number;
  on_time_delivery: boolean;
  delivery_city: string;
  is_below_reorder: boolean;
}

export interface MarketingRecord {
  campaign_id: string;
  campaign_name: string;
  channel: 'Email' | 'Social' | 'Search' | 'Display' | 'Referral';
  start_date: string;
  month: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  ctr: number; // percentage
  cpl: number; // cost per lead
  cpa: number; // cost per acquisition
  conv_rate: number; // percentage
  roas: number; // return on ad spend multiplier
}

export interface KpiMetric {
  title: string;
  value: string | number;
  changePct: number;
  comparisonText: string;
  isPositiveGood?: boolean; // default true (higher is good, but for SLA breach/attrition false)
  prefix?: string;
  suffix?: string;
  subtext?: string;
}

export interface PmoDetails {
  problem: string;
  method: string;
  outcome: string;
  toolsUsed: string[];
}

export interface SqlQueryItem {
  id: string;
  title: string;
  category: 'Joins' | 'GROUP BY' | 'Window Functions' | 'CTEs' | 'Aggregations' | 'Case Statements';
  difficulty: 'Intermediate' | 'Advanced';
  explanation: string;
  businessContext: string;
  sql: string;
  execute: (data: any) => { columns: string[]; rows: Record<string, any>[] };
}

export interface ExcelFormulaItem {
  id: string;
  formulaName: string;
  syntax: string;
  misUseCase: string;
  explanation: string;
  exampleData: {
    headers: string[];
    rows: (string | number)[][];
  };
  sampleFormula: string;
  calculatedResult: string | number;
  tips: string;
}
