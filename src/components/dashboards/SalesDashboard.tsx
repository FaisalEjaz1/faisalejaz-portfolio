import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Target,
  ShoppingBag,
  Percent,
  Award,
} from 'lucide-react';
import { SalesRecord, PmoDetails } from '../../types';
import { generateSalesData } from '../../data/datasets';
import { KpiCard } from '../common/KpiCard';
import { ChartCard } from '../common/ChartCard';
import { FilterBar } from '../common/FilterBar';
import { InsightsPanel } from '../common/InsightsPanel';
import { PmoCard } from '../common/PmoCard';
import { DataTable, ColumnDef } from '../common/DataTable';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
} from '../../utils/formatters';
import { computeSalesInsights } from '../../utils/insights';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const pmoCase: PmoDetails = {
  problem:
    'Disparate regional sales ERP spreadsheets caused 3-day delays in month-end revenue closing, recurring commission calculation discrepancies, and zero forward visibility into quarterly target gaps.',
  method:
    'Built an automated ingestion pipeline in Power Query to consolidate transactional ledgers across 4 zones, authored SQL window functions for MoM revenue run-rates, and built a relational Power BI star schema with dynamic quota measures.',
  outcome:
    'Shortened month-end sales reporting cycle from 72 hours to 15 minutes, provided instant visibility into ₹10.4 Cr turnover, and enabled sales leaders to adjust quota targets in real time.',
  toolsUsed: ['Excel', 'Power Query', 'PostgreSQL', 'Power BI', 'DAX Measures'],
};

export const SalesDashboard: React.FC = () => {
  const allData = useMemo(() => generateSalesData(), []);

  // Filter states
  const [dateRange, setDateRange] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [crossFilter, setCrossFilter] = useState<{ type: 'region' | 'category'; value: string } | null>(null);

  // Filter application
  const filteredData = useMemo(() => {
    return allData.filter((r) => {
      // Date filter
      if (dateRange === '2025' && !r.month.startsWith('2025')) return false;
      if (dateRange === '2024' && !r.month.startsWith('2024')) return false;
      if (dateRange === 'LAST_6M' && r.month < '2025-07') return false;

      // Region filter
      const effectiveRegion = crossFilter?.type === 'region' ? crossFilter.value : regionFilter;
      if (effectiveRegion !== 'ALL' && r.region !== effectiveRegion) return false;

      // Category filter
      const effectiveCategory = crossFilter?.type === 'category' ? crossFilter.value : categoryFilter;
      if (effectiveCategory !== 'ALL' && r.product_category !== effectiveCategory) return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          r.order_id.toLowerCase().includes(q) ||
          r.sales_rep.toLowerCase().includes(q) ||
          r.product.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allData, dateRange, regionFilter, categoryFilter, searchTerm, crossFilter]);

  // Insights
  const { insights, recommendation } = useMemo(
    () => computeSalesInsights(filteredData),
    [filteredData]
  );

  // KPI Calculations
  const kpiMetrics = useMemo(() => {
    const totalRev = filteredData.reduce((acc, r) => acc + r.revenue, 0);
    const totalTarget = filteredData.reduce((acc, r) => acc + r.target, 0);
    const totalUnits = filteredData.reduce((acc, r) => acc + r.units, 0);
    const aov = filteredData.length > 0 ? totalRev / filteredData.length : 0;
    const attainment = totalTarget > 0 ? (totalRev / totalTarget) * 100 : 100;
    const avgDiscount = filteredData.length > 0 ? filteredData.reduce((acc, r) => acc + r.discount_pct, 0) / filteredData.length : 0;

    return {
      revenue: totalRev,
      target: totalTarget,
      attainment,
      units: totalUnits,
      aov,
      avgDiscount,
      ordersCount: filteredData.length,
    };
  }, [filteredData]);

  // Chart 1: Monthly Trend (Line/Area)
  const monthlyTrendData = useMemo(() => {
    const map: Record<string, { month: string; revenue: number; target: number }> = {};
    for (const r of filteredData) {
      if (!map[r.month]) map[r.month] = { month: r.month, revenue: 0, target: 0 };
      map[r.month].revenue += r.revenue;
      map[r.month].target += r.target;
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  // Chart 2: Regional Performance (Bar)
  const regionalData = useMemo(() => {
    const map: Record<string, { region: string; revenue: number; target: number }> = {};
    for (const r of filteredData) {
      if (!map[r.region]) map[r.region] = { region: r.region, revenue: 0, target: 0 };
      map[r.region].revenue += r.revenue;
      map[r.region].target += r.target;
    }
    return Object.values(map);
  }, [filteredData]);

  // Chart 3: Category Share (Donut / Pie)
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of filteredData) {
      map[r.product_category] = (map[r.product_category] || 0) + r.revenue;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Chart 4: Sales Rep Leaderboard (Stacked Horizontal Bar or Bar)
  const repData = useMemo(() => {
    const map: Record<string, { rep: string; revenue: number; target: number; deals: number }> = {};
    for (const r of filteredData) {
      if (!map[r.sales_rep]) {
        map[r.sales_rep] = { rep: r.sales_rep, revenue: 0, target: 0, deals: 0 };
      }
      map[r.sales_rep].revenue += r.revenue;
      map[r.sales_rep].target += r.target;
      map[r.sales_rep].deals += 1;
    }
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 7);
  }, [filteredData]);

  // Reset filters
  const handleResetFilters = () => {
    setDateRange('ALL');
    setRegionFilter('ALL');
    setCategoryFilter('ALL');
    setSearchTerm('');
    setCrossFilter(null);
  };

  const hasActiveFilters =
    dateRange !== 'ALL' ||
    regionFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    searchTerm !== '' ||
    crossFilter !== null;

  // Table columns
  const tableColumns: ColumnDef<SalesRecord>[] = [
    { key: 'order_id', header: 'Order ID' },
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'region', header: 'Region' },
    { key: 'sales_rep', header: 'Sales Rep' },
    { key: 'product_category', header: 'Category' },
    { key: 'product', header: 'Product' },
    { key: 'units', header: 'Units', align: 'right' },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'right',
      render: (r) => <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(r.revenue)}</span>,
    },
    {
      key: 'discount_pct',
      header: 'Discount',
      align: 'right',
      render: (r) => `${r.discount_pct}%`,
    },
    {
      key: 'achieved_target',
      header: 'Target Status',
      align: 'center',
      render: (r) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            r.achieved_target
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400'
          }`}
        >
          {r.achieved_target ? 'Achieved' : 'Below Quota'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Sales Performance & Quota Attainment
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Commercial MIS cockpit evaluating 24 months of multi-regional sales orders, territory quotas, discounting thresholds, and executive rep performance.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        primaryFilterName="Region"
        primaryValue={crossFilter?.type === 'region' ? crossFilter.value : regionFilter}
        onPrimaryChange={(val) => {
          setCrossFilter(null);
          setRegionFilter(val);
        }}
        primaryOptions={[
          { label: 'North', value: 'North' },
          { label: 'South', value: 'South' },
          { label: 'East', value: 'East' },
          { label: 'West', value: 'West' },
        ]}
        secondaryFilterName="Category"
        secondaryValue={crossFilter?.type === 'category' ? crossFilter.value : categoryFilter}
        onSecondaryChange={(val) => {
          setCrossFilter(null);
          setCategoryFilter(val);
        }}
        secondaryOptions={[
          { label: 'Electronics', value: 'Electronics' },
          { label: 'Office Supplies', value: 'Office Supplies' },
          { label: 'Furniture', value: 'Furniture' },
          { label: 'Software Licenses', value: 'Software Licenses' },
          { label: 'Hardware', value: 'Hardware' },
        ]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeCrossFilter={crossFilter ? `${crossFilter.type.toUpperCase()}: ${crossFilter.value}` : null}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalCount={allData.length}
        filteredCount={filteredData.length}
      />

      {/* KPI Cards Row (5 KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Total Net Revenue"
          value={formatCurrency(kpiMetrics.revenue, true)}
          changePct={12.4}
          comparisonText="vs target plan"
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
          subtext={`Target: ${formatCurrency(kpiMetrics.target, true)}`}
        />
        <KpiCard
          title="Quota Attainment"
          value={formatPercent(kpiMetrics.attainment)}
          changePct={kpiMetrics.attainment - 100}
          comparisonText="variance to quota"
          icon={<Target className="h-4 w-4 text-indigo-600" />}
          subtext="Org benchmark: 100%"
        />
        <KpiCard
          title="Units Dispatched"
          value={formatNumber(kpiMetrics.units)}
          changePct={8.1}
          comparisonText="vs prior period"
          icon={<ShoppingBag className="h-4 w-4 text-sky-600" />}
          subtext={`${kpiMetrics.ordersCount} total orders`}
        />
        <KpiCard
          title="Average Order Value"
          value={formatCurrency(kpiMetrics.aov, true)}
          changePct={4.3}
          comparisonText="deal velocity"
          icon={<Award className="h-4 w-4 text-purple-600" />}
          subtext="Per closed transaction"
        />
        <KpiCard
          title="Average Discount"
          value={formatPercent(kpiMetrics.avgDiscount)}
          changePct={-1.2}
          isPositiveGood={false}
          comparisonText="vs policy max (12%)"
          icon={<Percent className="h-4 w-4 text-amber-600" />}
          subtext="Controlled margin leakage"
        />
      </div>

      {/* Automated Key Insights & Recommendation */}
      <InsightsPanel insights={insights} recommendation={recommendation} />

      {/* PMO Case Study */}
      <PmoCard pmo={pmoCase} dashboardTitle="Sales Performance" />

      {/* 4 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Revenue vs Target Monthly Trend (Area + Line) */}
        <ChartCard
          title="Monthly Revenue Trend vs Target"
          subtitle="24-month historical trajectory showing seasonality and fiscal close surges"
        >
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis
                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
              />
              <Tooltip
                formatter={(val: any, name: any) => [formatCurrency(Number(val)), name === 'revenue' ? 'Revenue' : 'Target']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#salesRevGrad)" />
              <Line type="monotone" dataKey="target" name="Target" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Regional Performance (Bar) - Click bar to cross filter */}
        <ChartCard
          title="Regional Revenue vs Quota (Click Bar to Filter)"
          subtitle="Direct comparison across regional operating territories"
          activeFilterBadge={crossFilter?.type === 'region' ? crossFilter.value : null}
          onClearFilter={() => setCrossFilter(null)}
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={regionalData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const clickedRegion = e.activePayload[0].payload.region;
                  setCrossFilter({ type: 'region', value: clickedRegion });
                }
              }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="region" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis
                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
              />
              <Tooltip
                formatter={(val: any, name: any) => [formatCurrency(Number(val)), name === 'revenue' ? 'Revenue' : 'Target']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Category Revenue Distribution (Donut) - Click slice to cross filter */}
        <ChartCard
          title="Revenue Share by Product Category (Click Slice to Filter)"
          subtitle="Portfolio mix across product lines"
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
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val))}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Sales Rep Leaderboard (Bar) */}
        <ChartCard
          title="Top Sales Rep Performance Leaderboard"
          subtitle="Top individual producers ranked by total realized revenue"
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={repData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis
                type="number"
                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
              />
              <YAxis
                type="category"
                dataKey="rep"
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
                width={85}
              />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val))}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Underlying Data Table */}
      <DataTable
        data={filteredData}
        columns={tableColumns}
        title="Sales Orders Transactional Ledger"
        subtitle="Detailed record-level drilldown with sorting, pagination, and CSV export"
        exportFilename="sales_orders_dataset"
        defaultSortKey="date"
        defaultSortDirection="desc"
      />
    </div>
  );
};
