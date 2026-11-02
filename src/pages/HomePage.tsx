import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Headphones,
  Users,
  DollarSign,
  Package,
  Target,
  Sparkles,
  Code2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { DashboardId } from '../types';
import {
  generateSalesData,
  generateSupportData,
  generateHrData,
  generateFinanceData,
  generateInventoryData,
  generateMarketingData,
} from '../data/datasets';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

interface HomePageProps {
  onNavigate: (tab: DashboardId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { profile, setIsEditModalOpen } = useProfile();

  // Compute live dataset aggregate stats
  const aggregateStats = useMemo(() => {
    const sales = generateSalesData();
    const support = generateSupportData();
    const hr = generateHrData();
    const finance = generateFinanceData();
    const inventory = generateInventoryData();
    const marketing = generateMarketingData();

    const totalRecords =
      sales.length +
      support.length +
      hr.length +
      finance.length +
      inventory.length +
      marketing.length;

    const totalSalesRev = sales.reduce((a, s) => a + s.revenue, 0);
    const totalBudgetManaged = finance.reduce((a, f) => a + f.actual, 0);
    const overallSla =
      (support.filter((s) => s.sla_met).length / support.length) * 100;

    return {
      totalRecords,
      totalSalesRev,
      totalBudgetManaged,
      overallSla,
      dashboardsCount: 6,
      sqlQueriesCount: 8,
    };
  }, []);

  const toolkitTags = [
    { category: 'Spreadsheets', label: 'Excel (Pivot Tables, XLOOKUP, Power Query, Macros)' },
    { category: 'Database', label: 'SQL (CTEs, Window Functions, DENSE_RANK, Joins)' },
    { category: 'BI & Reporting', label: 'Power BI (DAX, Data Modeling, Star Schemas)' },
    { category: 'Visualization', label: 'Tableau Basics' },
    { category: 'Collaboration', label: 'Google Sheets (QUERY, IMPORTRANGE, ARRAYFORMULA)' },
    { category: 'Data Engineering', label: 'Data Cleaning & Transformation' },
    { category: 'Executive Tools', label: 'KPI Dashboards & Scorecards' },
    { category: 'Auditing', label: 'Reconciliation & Variance Analysis' },
    { category: 'Cadence', label: 'Daily, Weekly & Monthly MIS Automation' },
  ];

  const methodologySteps = [
    {
      step: '01',
      title: 'Clean',
      icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      desc: 'Sanitize messy data pipelines via Power Query and SQL. Standardize date strings, trim phantom spaces, impute missing values, and remove duplicate transactions.',
      tools: 'Power Query, SQL TRIM/COALESCE, Excel CLEAN',
    },
    {
      step: '02',
      title: 'Model',
      icon: <Database className="h-5 w-5 text-indigo-500" />,
      desc: 'Architect normalized relational schemas (fact and dimension tables), establish 1-to-many relationships, and author robust DAX or SQL metrics.',
      tools: 'Power BI Star Schema, SQL CTEs, Power Pivot',
    },
    {
      step: '03',
      title: 'Visualise',
      icon: <BarChart3 className="h-5 w-5 text-sky-500" />,
      desc: 'Design high-density, accessible analytics dashboards with purposeful typography, strict color hierarchy, cross-filtering, and zero visual clutter.',
      tools: 'Power BI, Recharts, Interactive Drilldowns',
    },
    {
      step: '04',
      title: 'Recommend',
      icon: <Award className="h-5 w-5 text-emerald-500" />,
      desc: 'Translate charts into plain-English commercial actions: pinpoint root-cause variances, identify margin risks, and provide actionable next steps for leadership.',
      tools: 'Executive Briefings, Variance Reports, MIS Summaries',
    },
  ];

  const dashboardCards = [
    {
      id: 'sales' as DashboardId,
      title: 'Sales Performance & Quota',
      category: 'Commercial Operations',
      icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
      highlight: `${formatCurrency(aggregateStats.totalSalesRev, true)} Analyzed`,
      metricLabel: '24-Mo Revenue Quota Tracked',
      desc: 'Regional attainment, sales executive leaderboards, discounting policy audits, and product volume.',
    },
    {
      id: 'support' as DashboardId,
      title: 'Customer Support SLA & CSAT',
      category: 'Customer Experience',
      icon: <Headphones className="h-5 w-5 text-sky-500" />,
      highlight: `${aggregateStats.overallSla.toFixed(1)}% SLA Met`,
      metricLabel: 'Incident Breach Telemetry',
      desc: 'Turnaround latency, billing surge triage, queue velocities across Email, Chat and Phone.',
    },
    {
      id: 'hr' as DashboardId,
      title: 'HR Headcount & Attrition',
      category: 'Workforce Planning',
      icon: <Users className="h-5 w-5 text-purple-500" />,
      highlight: '420 Staff Analyzed',
      metricLabel: 'Tenure Cohort Breakdown',
      desc: 'Departmental turnover rates, 0-6 month attrition spikes, exit drivers, and salary band equity.',
    },
    {
      id: 'finance' as DashboardId,
      title: 'Finance Budget vs. Actual',
      category: 'FP&A & Ledger Audit',
      icon: <DollarSign className="h-5 w-5 text-amber-500" />,
      highlight: `${formatCurrency(aggregateStats.totalBudgetManaged, true)} Reconciled`,
      metricLabel: 'Overspending Cost Centers',
      desc: 'General ledger variance modeling, departmental run-rates, vendor spending, and quarterly accruals.',
    },
    {
      id: 'inventory' as DashboardId,
      title: 'Inventory & Logistics Control',
      category: 'Supply Chain Operations',
      icon: <Package className="h-5 w-5 text-rose-500" />,
      highlight: '380 SKUs Monitored',
      metricLabel: 'Safety Stock & Lead Times',
      desc: 'Warehouse physical stockout alerts, safety stock deficits, supplier lead times, and OTD delivery rates.',
    },
    {
      id: 'marketing' as DashboardId,
      title: 'Marketing Acquisition & ROAS',
      category: 'Growth & Attribution',
      icon: <Target className="h-5 w-5 text-pink-500" />,
      highlight: 'Full Funnel Modeled',
      metricLabel: 'Impression to Conversion ROAS',
      desc: 'Blended CAC/CPA efficiency, click-through rates, lead conversion rates, and revenue returns by channel.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 lg:p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300 mb-4 sm:mb-5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Executive MIS & Decision-Support Analytics Portfolio</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.2] sm:leading-[1.15]">
            Turning complex transactional data into{' '}
            <span className="text-indigo-600 dark:text-indigo-400">clear executive decisions.</span>
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
            Hi, I’m <strong>{profile.name}</strong>, a {profile.title} with {profile.yearsExperience}+ years of experience building automated daily/weekly/monthly MIS reporting systems, financial reconciliation frameworks, and interactive Power BI & Excel models for senior leadership.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onNavigate('executive-summary')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Explore Executive Rollup</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('sales')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span>View Dashboards (6)</span>
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-3 text-xs sm:text-sm font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 transition-colors"
            >
              <span>Contact Candidate</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-16 -mr-16 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </section>

      {/* Live Aggregated Statistics Row */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Portfolio Live Telemetry & Aggregate Scope
          </h2>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Computed Live from 6 Deterministic Datasets
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Records</span>
            <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(aggregateStats.totalRecords)}
            </div>
            <span className="text-[10px] text-slate-400">Cleaned & Modeled</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Dashboards Built</span>
            <div className="mt-1 text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {aggregateStats.dashboardsCount} Complete
            </div>
            <span className="text-[10px] text-slate-400">Functional Domains</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Sales Analyzed</span>
            <div className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(aggregateStats.totalSalesRev, true)}
            </div>
            <span className="text-[10px] text-slate-400">24-Mo Commercial Orders</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">GL Budget Reconciled</span>
            <div className="mt-1 text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {formatCurrency(aggregateStats.totalBudgetManaged, true)}
            </div>
            <span className="text-[10px] text-slate-400">Department Variance</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">SQL Workbenches</span>
            <div className="mt-1 text-xl font-extrabold text-purple-600 dark:text-purple-400">
              {aggregateStats.sqlQueriesCount} Queries
            </div>
            <span className="text-[10px] text-slate-400">CTEs & Window Funcs</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">SLA Benchmark</span>
            <div className="mt-1 text-xl font-extrabold text-sky-600 dark:text-sky-400">
              {aggregateStats.overallSla.toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-400">Support Compliance</span>
          </div>
        </div>
      </section>

      {/* Technical Toolkit Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Technical Analyst Toolkit & Core Competencies
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mastered technologies, advanced data modeling techniques, and reporting cadences
            </p>
          </div>
          <button
            onClick={() => onNavigate('sql-excel')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1"
          >
            <span>See SQL & Formulas in Action</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {toolkitTags.map((tag) => (
            <div
              key={tag.label}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
            >
              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                {tag.category}
              </span>
              <span className="font-medium">{tag.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* "How I Work" 4-Step Methodology */}
      <section>
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Standard Operating Procedure
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            How I Work: The 4-Step MIS Delivery Framework
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
            Proven engineering process transforming unformatted raw dumps into rock-solid executive intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {methodologySteps.map((m) => (
            <div
              key={m.step}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-indigo-300 dark:hover:border-indigo-800"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    {m.icon}
                  </div>
                  <span className="font-mono text-xl font-black text-slate-200 dark:text-slate-800">
                    {m.step}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {m.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {m.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Primary Tooling
                </span>
                <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400">
                  {m.tools}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Dashboard Showcase Cards */}
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Interactive Dashboards
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Production Business Reporting Cockpits
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
              Click any report to explore cross-filtered charts, KPI metrics, plain-English automated insights, and exportable data tables.
            </p>
          </div>

          <button
            onClick={() => onNavigate('executive-summary')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            <span>View All in Executive Summary</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dashboardCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 transition-colors">
                    {card.icon}
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {card.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {card.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {card.highlight}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {card.metricLabel}
                  </div>
                </div>

                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 transition-colors">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Showcases Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          onClick={() => onNavigate('cleaning')}
          className="group cursor-pointer rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-white p-6 shadow-xs hover:border-amber-300 dark:border-amber-950/70 dark:from-amber-950/20 dark:to-slate-900 transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Cleaning & Pipeline Showcase
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Interactive simulator showing messy real-world transactions with inconsistent dates, duplicate keys, and missing values being cleaned step-by-step.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <span>Launch Step-by-Step Cleaning Simulator</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('sql-excel')}
          className="group cursor-pointer rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 to-white p-6 shadow-xs hover:border-indigo-300 dark:border-indigo-950/70 dark:from-indigo-950/20 dark:to-slate-900 transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              SQL Queries & Advanced Excel Formulas
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Inspect 8 production SQL CTEs and window functions with live client-evaluated outputs, plus comprehensive XLOOKUP, SUMIFS and pivot modeling guides.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            <span>Open SQL & Excel Workbench</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>
    </div>
  );
};
