import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  PieChart as PieIcon,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { FinanceRecord, PmoDetails } from '../../types';
import { generateFinanceData } from '../../data/datasets';
import { KpiCard } from '../common/KpiCard';
import { ChartCard } from '../common/ChartCard';
import { FilterBar } from '../common/FilterBar';
import { InsightsPanel } from '../common/InsightsPanel';
import { PmoCard } from '../common/PmoCard';
import { DataTable, ColumnDef } from '../common/DataTable';
import {
  formatCurrency,
  formatPercent,
  formatMonthYear,
} from '../../utils/formatters';
import { computeFinanceInsights } from '../../utils/insights';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

const pmoCase: PmoDetails = {
  problem:
    'Uncontrolled discretionary software licenses and ad-hoc digital marketing spend caused chronic 14% quarterly budget overruns that only surfaced 45 days after quarter-close during statutory audits.',
  method:
    'Ingested General Ledger SAP dumps into SQL, engineered an automated monthly reconciliation variance matrix using CTEs, and constructed an FP&A variance cockpit in Power BI with dynamic threshold alerts.',
  outcome:
    'Eliminated surprise audit reconciliation gaps, established automated vendor-level PO ceilings, and reclaimed ₹48 Lakhs in redundant SaaS seats and unbudgeted campaign expenditure.',
  toolsUsed: ['Excel', 'Power Query', 'SQL CTEs', 'Power BI FP&A', 'SAP ERP'],
};

export const FinanceDashboard: React.FC = () => {
  const allData = useMemo(() => generateFinanceData(), []);

  const [dateRange, setDateRange] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [crossFilter, setCrossFilter] = useState<{ type: 'department' | 'category'; value: string } | null>(null);

  const filteredData = useMemo(() => {
    return allData.filter((f) => {
      // Date filter
      if (dateRange === '2025' && !f.month.startsWith('2025')) return false;
      if (dateRange === '2024' && !f.month.startsWith('2024')) return false;
      if (dateRange === 'LAST_6M' && f.month < '2025-07') return false;

      // Department filter
      const effectiveDept = crossFilter?.type === 'department' ? crossFilter.value : departmentFilter;
      if (effectiveDept !== 'ALL' && f.department !== effectiveDept) return false;

      // Category filter
      const effectiveCat = crossFilter?.type === 'category' ? crossFilter.value : categoryFilter;
      if (effectiveCat !== 'ALL' && f.expense_category !== effectiveCat) return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          f.department.toLowerCase().includes(q) ||
          f.expense_category.toLowerCase().includes(q) ||
          f.vendor.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allData, dateRange, departmentFilter, categoryFilter, searchTerm, crossFilter]);

  const { insights, recommendation } = useMemo(
    () => computeFinanceInsights(filteredData),
    [filteredData]
  );

  // KPIs
  const kpiMetrics = useMemo(() => {
    const totalBudget = filteredData.reduce((acc, f) => acc + f.budget, 0);
    const totalActual = filteredData.reduce((acc, f) => acc + f.actual, 0);
    const netVariance = totalActual - totalBudget;
    const variancePct = totalBudget > 0 ? (netVariance / totalBudget) * 100 : 0;

    // Overspending cost centers
    const deptTotals: Record<string, { budget: number; actual: number }> = {};
    for (const f of filteredData) {
      if (!deptTotals[f.department]) deptTotals[f.department] = { budget: 0, actual: 0 };
      deptTotals[f.department].budget += f.budget;
      deptTotals[f.department].actual += f.actual;
    }
    const overspendDepts = Object.values(deptTotals).filter((d) => d.actual > d.budget).length;

    return {
      totalBudget,
      totalActual,
      netVariance,
      variancePct,
      overspendDepts,
    };
  }, [filteredData]);

  // Chart 1: Department Budget vs Actual Spend (Bar) - Click to filter
  const departmentData = useMemo(() => {
    const map: Record<string, { department: string; budget: number; actual: number; variance: number }> = {};
    for (const f of filteredData) {
      if (!map[f.department]) map[f.department] = { department: f.department, budget: 0, actual: 0, variance: 0 };
      map[f.department].budget += f.budget;
      map[f.department].actual += f.actual;
    }
    return Object.values(map)
      .map((d) => ({
        ...d,
        variance: d.actual - d.budget,
      }))
      .sort((a, b) => b.actual - a.actual);
  }, [filteredData]);

  // Chart 2: Monthly Expenditure Run-Rate vs Budget (Line)
  const monthlyTrendData = useMemo(() => {
    const map: Record<string, { month: string; budget: number; actual: number }> = {};
    for (const f of filteredData) {
      if (!map[f.month]) map[f.month] = { month: f.month, budget: 0, actual: 0 };
      map[f.month].budget += f.budget;
      map[f.month].actual += f.actual;
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  // Chart 3: Expense Category Share (Donut) - Click to filter
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of filteredData) {
      map[f.expense_category] = (map[f.expense_category] || 0) + f.actual;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Chart 4: Variance Amount by Department (Bar with positive/negative)
  const varianceByDept = useMemo(() => {
    return departmentData.map((d) => ({
      department: d.department,
      variance: d.variance,
      isOver: d.variance > 0,
    }));
  }, [departmentData]);

  const handleResetFilters = () => {
    setDateRange('ALL');
    setDepartmentFilter('ALL');
    setCategoryFilter('ALL');
    setSearchTerm('');
    setCrossFilter(null);
  };

  const hasActiveFilters =
    dateRange !== 'ALL' ||
    departmentFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    searchTerm !== '' ||
    crossFilter !== null;

  const tableColumns: ColumnDef<FinanceRecord>[] = [
    { key: 'id', header: 'Ledger Ref' },
    { key: 'month', header: 'Fiscal Period', render: (r) => formatMonthYear(r.month) },
    { key: 'department', header: 'Department' },
    { key: 'expense_category', header: 'Expense Category' },
    { key: 'vendor', header: 'Approved Vendor' },
    { key: 'budget', header: 'Budget', align: 'right', render: (r) => formatCurrency(r.budget) },
    { key: 'actual', header: 'Actual Spend', align: 'right', render: (r) => formatCurrency(r.actual) },
    {
      key: 'variance',
      header: 'Net Variance',
      align: 'right',
      render: (r) => (
        <span
          className={`font-semibold ${
            r.variance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {r.variance > 0 ? `+${formatCurrency(r.variance)}` : formatCurrency(r.variance)}
        </span>
      ),
    },
    {
      key: 'variance_pct',
      header: 'Var %',
      align: 'right',
      render: (r) => (
        <span
          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${
            r.variance_pct > 0
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
          }`}
        >
          {r.variance_pct > 0 ? `+${r.variance_pct}%` : `${r.variance_pct}%`}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Finance Budget vs. Actual Variance Cockpit
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Corporate financial MIS tracking department run-rates, cost-center budget adherence, chronic overspending, and vendor expenditure.
        </p>
      </div>

      <FilterBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        primaryFilterName="Department"
        primaryValue={crossFilter?.type === 'department' ? crossFilter.value : departmentFilter}
        onPrimaryChange={(val) => {
          setCrossFilter(null);
          setDepartmentFilter(val);
        }}
        primaryOptions={[
          { label: 'Marketing', value: 'Marketing' },
          { label: 'Engineering', value: 'Engineering' },
          { label: 'Sales', value: 'Sales' },
          { label: 'Operations', value: 'Operations' },
          { label: 'Human Resources', value: 'Human Resources' },
          { label: 'IT & Security', value: 'IT & Security' },
        ]}
        secondaryFilterName="Category"
        secondaryValue={crossFilter?.type === 'category' ? crossFilter.value : categoryFilter}
        onSecondaryChange={(val) => {
          setCrossFilter(null);
          setCategoryFilter(val);
        }}
        secondaryOptions={[
          { label: 'Salaries', value: 'Salaries' },
          { label: 'Marketing', value: 'Marketing' },
          { label: 'Software', value: 'Software' },
          { label: 'Travel', value: 'Travel' },
          { label: 'Operations', value: 'Operations' },
        ]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeCrossFilter={crossFilter ? `${crossFilter.type.toUpperCase()}: ${crossFilter.value}` : null}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalCount={allData.length}
        filteredCount={filteredData.length}
      />

      {/* KPI Cards (5 KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Approved Budget"
          value={formatCurrency(kpiMetrics.totalBudget, true)}
          comparisonText="fiscal allocation"
          icon={<DollarSign className="h-4 w-4 text-sky-600" />}
          subtext="Base capital pool"
        />
        <KpiCard
          title="Realized Actual Spend"
          value={formatCurrency(kpiMetrics.totalActual, true)}
          changePct={kpiMetrics.variancePct}
          isPositiveGood={false}
          comparisonText="vs budget allocation"
          icon={<TrendingUp className="h-4 w-4 text-rose-600" />}
          subtext="General ledger actuals"
        />
        <KpiCard
          title="Net Budget Variance"
          value={formatCurrency(kpiMetrics.netVariance, true)}
          changePct={kpiMetrics.variancePct}
          isPositiveGood={false}
          comparisonText={kpiMetrics.netVariance > 0 ? 'Over budget' : 'Under budget'}
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
          subtext={`${kpiMetrics.variancePct >= 0 ? '+' : ''}${kpiMetrics.variancePct.toFixed(1)}% variance`}
        />
        <KpiCard
          title="Overspending Units"
          value={`${kpiMetrics.overspendDepts} Depts`}
          changePct={kpiMetrics.overspendDepts > 2 ? 15.0 : -5.0}
          isPositiveGood={false}
          comparisonText="cost centers over plan"
          icon={<Building className="h-4 w-4 text-purple-600" />}
          subtext="Marketing & Engineering"
        />
        <KpiCard
          title="Ledger Compliance"
          value={kpiMetrics.variancePct <= 5 ? 'STABLE' : 'ACTION REQ.'}
          changePct={kpiMetrics.variancePct <= 5 ? 2.5 : -8.5}
          isPositiveGood={true}
          comparisonText="governance status"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          subtext="Tolerance cap: +/- 5%"
        />
      </div>

      <InsightsPanel insights={insights} recommendation={recommendation} />
      <PmoCard pmo={pmoCase} dashboardTitle="Finance Budget vs Actual" />

      {/* 4 Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Department Budget vs Actual (Bar) - Click to filter */}
        <ChartCard
          title="Department Budget vs. Actual Spend (Click Bar to Filter)"
          subtitle="Direct comparison revealing severe overspending in Marketing & Engineering"
          activeFilterBadge={crossFilter?.type === 'department' ? crossFilter.value : null}
          onClearFilter={() => setCrossFilter(null)}
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={departmentData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setCrossFilter({ type: 'department', value: e.activePayload[0].payload.department });
                }
              }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(val: any, name: any) => [formatCurrency(Number(val)), name === 'actual' ? 'Actual Spend' : 'Budget']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="actual" name="Actual Spend" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="budget" name="Approved Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Monthly Run-Rate vs Budget (Line) */}
        <ChartCard
          title="Monthly Expenditure Trajectory vs. Budget Baseline"
          subtitle="Tracking spend acceleration and quarter-end surges over 24 calendar months"
        >
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(val: any, name: any) => [formatCurrency(Number(val)), name === 'actual' ? 'Actual' : 'Budget']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="actual" name="Actual Spend" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="budget" name="Budget" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Expense Category Share (Donut) - Click to filter */}
        <ChartCard
          title="Expenditure Breakdown by Cost Category (Click to Filter)"
          subtitle="Salaries and Software SaaS licenses dominate operational overhead"
          activeFilterBadge={crossFilter?.type === 'category' ? crossFilter.value : null}
          onClearFilter={() => setCrossFilter(null)}
        >
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                onClick={(entry) => {
                  if (entry && entry.name) {
                    setCrossFilter({ type: 'category', value: entry.name });
                  }
                }}
                className="cursor-pointer"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any) => formatCurrency(Number(val))} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Variance Amount by Department (Bar) */}
        <ChartCard
          title="Net Variance by Cost Center (Over / Under Budget)"
          subtitle="Red indicates unfavorable cost overruns; green indicates fiscal savings"
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={varianceByDept} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), 'Net Variance']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="variance" name="Variance (₹)">
                {varianceByDept.map((entry, index) => (
                  <Cell key={`var-${index}`} fill={entry.isOver ? '#f43f5e' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        data={filteredData}
        columns={tableColumns}
        title="General Ledger Financial Entries"
        subtitle="Individual transactional expenses reconciled against approved departmental budgets"
        exportFilename="finance_budget_actual_dataset"
        defaultSortKey="month"
        defaultSortDirection="desc"
      />
    </div>
  );
};
