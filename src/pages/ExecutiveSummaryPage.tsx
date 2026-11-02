import React, { useMemo } from 'react';
import {
  TrendingUp,
  Headphones,
  Users,
  DollarSign,
  Package,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DashboardId } from '../types';
import {
  generateSalesData,
  generateSupportData,
  generateHrData,
  generateFinanceData,
  generateInventoryData,
  generateMarketingData,
} from '../data/datasets';
import { KpiCard } from '../components/common/KpiCard';
import { ChartCard } from '../components/common/ChartCard';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '../utils/formatters';

interface ExecutiveSummaryPageProps {
  onNavigate: (tab: DashboardId) => void;
}

export const ExecutiveSummaryPage: React.FC<ExecutiveSummaryPageProps> = ({
  onNavigate,
}) => {
  const summaryMetrics = useMemo(() => {
    const sales = generateSalesData();
    const support = generateSupportData();
    const hr = generateHrData();
    const finance = generateFinanceData();
    const inventory = generateInventoryData();
    const marketing = generateMarketingData();

    // 1. Sales Top KPI
    const salesRev = sales.reduce((a, s) => a + s.revenue, 0);
    const salesTarget = sales.reduce((a, s) => a + s.target, 0);
    const salesAttainment = salesTarget > 0 ? (salesRev / salesTarget) * 100 : 100;

    // 2. Support Top KPI
    const totalTickets = support.length;
    const slaBreaches = support.filter((s) => !s.sla_met).length;
    const slaCompliance = totalTickets > 0 ? ((totalTickets - slaBreaches) / totalTickets) * 100 : 100;
    const avgCsat = totalTickets > 0 ? support.reduce((a, s) => a + s.csat, 0) / totalTickets : 0;

    // 3. HR Top KPI
    const totalStaff = hr.length;
    const exits = hr.filter((e) => !e.is_active).length;
    const attritionRate = totalStaff > 0 ? (exits / totalStaff) * 100 : 0;
    const earlyExits = hr.filter((e) => !e.is_active && e.tenure_months <= 6).length;

    // 4. Finance Top KPI
    const totalBudget = finance.reduce((a, f) => a + f.budget, 0);
    const totalActual = finance.reduce((a, f) => a + f.actual, 0);
    const netVariance = totalActual - totalBudget;
    const variancePct = totalBudget > 0 ? (netVariance / totalBudget) * 100 : 0;

    // 5. Inventory Top KPI
    const totalSkus = inventory.length;
    const criticalSkus = inventory.filter((i) => i.is_below_reorder).length;
    const onTimeDeliveryRate = totalSkus > 0 ? (inventory.filter((i) => i.on_time_delivery).length / totalSkus) * 100 : 0;

    // 6. Marketing Top KPI
    const mktSpend = marketing.reduce((a, m) => a + m.spend, 0);
    const mktRev = marketing.reduce((a, m) => a + m.revenue, 0);
    const roas = mktSpend > 0 ? mktRev / mktSpend : 0;

    return {
      salesRev,
      salesTarget,
      salesAttainment,
      slaCompliance,
      slaBreaches,
      avgCsat,
      attritionRate,
      exits,
      earlyExits,
      netVariance,
      variancePct,
      totalActual,
      criticalSkus,
      onTimeDeliveryRate,
      roas,
      mktRev,
      mktSpend,
    };
  }, []);

  // Department health comparison chart data
  const healthMatrixData = [
    { department: 'Sales Quota', achievement: summaryMetrics.salesAttainment, benchmark: 100 },
    { department: 'Support SLA', achievement: summaryMetrics.slaCompliance, benchmark: 90 },
    { department: 'Logistics OTD', achievement: summaryMetrics.onTimeDeliveryRate, benchmark: 88 },
    { department: 'Marketing ROAS', achievement: summaryMetrics.roas * 30, benchmark: 90 }, // Normalized for index
    { department: 'Budget Adherence', achievement: Math.max(0, 100 - Math.abs(summaryMetrics.variancePct) * 4), benchmark: 95 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              C-Suite Executive Rollup & Operational Health Cockpit
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Single-pane-of-glass executive overview consolidating the primary key performance indicator (KPI) from each of the 6 operational business domains.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>All 6 Feeds Synchronized</span>
        </div>
      </div>

      {/* Row of Top KPIs from all 6 Datasets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Sales Top KPI */}
        <div
          onClick={() => onNavigate('sales')}
          className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              1. Sales Performance
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(summaryMetrics.salesRev, true)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatPercent(summaryMetrics.salesAttainment)} Quota Attainment
            </span>
            <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform">
              Drilldown →
            </span>
          </div>
        </div>

        {/* 2. Customer Support Top KPI */}
        <div
          onClick={() => onNavigate('support')}
          className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-sky-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              2. Support SLA Compliance
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Headphones className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatPercent(summaryMetrics.slaCompliance)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              CSAT: {summaryMetrics.avgCsat.toFixed(1)}/5.0 ({summaryMetrics.slaBreaches} breaches)
            </span>
            <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform">
              Drilldown →
            </span>
          </div>
        </div>

        {/* 3. HR Attrition Top KPI */}
        <div
          onClick={() => onNavigate('hr')}
          className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-purple-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              3. Organization Attrition Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatPercent(summaryMetrics.attritionRate)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-rose-500 font-semibold">
              {summaryMetrics.earlyExits} exits within first 6 months
            </span>
            <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform">
              Drilldown →
            </span>
          </div>
        </div>

        {/* 4. Finance Top KPI */}
        <div
          onClick={() => onNavigate('finance')}
          className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              4. Budget Variance (Net)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {summaryMetrics.netVariance > 0 ? `+${formatCurrency(summaryMetrics.netVariance, true)}` : formatCurrency(summaryMetrics.netVariance, true)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {summaryMetrics.variancePct >= 0 ? '+' : ''}{summaryMetrics.variancePct.toFixed(1)}% vs approved plan
            </span>
            <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform">
              Drilldown →
            </span>
          </div>
        </div>

        {/* 5. Inventory Top KPI */}
        <div
          onClick={() => onNavigate('inventory')}
          className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-rose-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              5. Critical Reorder Alerts
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {summaryMetrics.criticalSkus} SKUs
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold">
              {formatPercent(summaryMetrics.onTimeDeliveryRate)} On-Time Delivery
            </span>
            <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform">
              Drilldown →
            </span>
          </div>
        </div>

        {/* 6. Marketing Top KPI */}
        <div
          onClick={() => onNavigate('marketing')}
          className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-pink-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              6. Blended Marketing ROAS
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summaryMetrics.roas.toFixed(2)}x
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {formatCurrency(summaryMetrics.mktRev, true)} rev on {formatCurrency(summaryMetrics.mktSpend, true)} spend
            </span>
            <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform">
              Drilldown →
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Domain Correlation Insights */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-6 shadow-xs dark:border-indigo-950 dark:from-indigo-950/30 dark:to-slate-900">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Analyst Cross-Functional Executive Synthesis
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              Commercial & Marketing Alignment
            </span>
            Sales exceeded aggregate quota by {formatPercent(summaryMetrics.salesAttainment - 100)}, driven by high-margin enterprise renewals and strong Search/Referral acquisition ROAS ({summaryMetrics.roas.toFixed(2)}x).
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              Operational Bottle-Necks
            </span>
            Customer Support SLA breached benchmarks during the Q3 payment gateway migration ({summaryMetrics.slaBreaches} breaches), creating a short-term CSAT dip that required support capacity rebalancing.
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              Fiscal & Supply Chain Guardrails
            </span>
            Marketing and Engineering overspent approved budgets by {formatCurrency(summaryMetrics.netVariance, true)}, while {summaryMetrics.criticalSkus} SKUs require immediate PO authorization to preserve logistics SLAs.
          </div>
        </div>
      </div>

      {/* Comparative Operational Health Benchmark Chart */}
      <ChartCard
        title="Cross-Functional Departmental Performance vs. Target Index"
        subtitle="Normalized operational indices compared against established organizational SLA and efficiency benchmarks"
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={healthMatrixData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis dataKey="department" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="achievement" name="Realized Performance %" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="benchmark" name="Target Benchmark (100%)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
