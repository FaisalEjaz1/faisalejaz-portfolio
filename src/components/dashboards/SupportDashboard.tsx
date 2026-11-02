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
} from 'recharts';
import {
  Headphones,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Users,
} from 'lucide-react';
import { SupportTicket, PmoDetails } from '../../types';
import { generateSupportData } from '../../data/datasets';
import { KpiCard } from '../common/KpiCard';
import { ChartCard } from '../common/ChartCard';
import { FilterBar } from '../common/FilterBar';
import { InsightsPanel } from '../common/InsightsPanel';
import { PmoCard } from '../common/PmoCard';
import { DataTable, ColumnDef } from '../common/DataTable';
import {
  formatNumber,
  formatPercent,
  formatDate,
} from '../../utils/formatters';
import { computeSupportInsights } from '../../utils/insights';

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

const pmoCase: PmoDetails = {
  problem:
    'A silent payment gateway migration led to unmonitored ticket surges in Billing, causing overall organizational SLA compliance to plummet by 32% without operational triage alerts for senior leadership.',
  method:
    'Extracted Zendesk and Freshdesk webhook logs via SQL scheduled views, flagged SLA threshold violations across priority tiers, and configured daily automated exception alerting in Excel Power Query with email alerts.',
  outcome:
    'Recovered SLA compliance back above 91% within 2 weeks of triage, instituted an automated Billing dispute deflection queue, and stabilized overall customer satisfaction (CSAT) at 4.2/5.0.',
  toolsUsed: ['Excel', 'Power Query', 'SQL Stored Procedures', 'Power BI Service', 'Zendesk API'],
};

export const SupportDashboard: React.FC = () => {
  const allData = useMemo(() => generateSupportData(), []);

  // Filters
  const [dateRange, setDateRange] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [crossFilter, setCrossFilter] = useState<{ type: 'category' | 'channel'; value: string } | null>(null);

  const filteredData = useMemo(() => {
    return allData.filter((t) => {
      // Date filter
      if (dateRange === '2025' && !t.month.startsWith('2025')) return false;
      if (dateRange === '2024' && !t.month.startsWith('2024')) return false;
      if (dateRange === 'LAST_6M' && t.month < '2025-07') return false;

      // Category filter
      const effectiveCategory = crossFilter?.type === 'category' ? crossFilter.value : categoryFilter;
      if (effectiveCategory !== 'ALL' && t.category !== effectiveCategory) return false;

      // Channel filter
      const effectiveChannel = crossFilter?.type === 'channel' ? crossFilter.value : channelFilter;
      if (effectiveChannel !== 'ALL' && t.channel !== effectiveChannel) return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          t.ticket_id.toLowerCase().includes(q) ||
          t.agent.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.team.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allData, dateRange, categoryFilter, channelFilter, searchTerm, crossFilter]);

  const { insights, recommendation } = useMemo(
    () => computeSupportInsights(filteredData),
    [filteredData]
  );

  // KPIs
  const kpiMetrics = useMemo(() => {
    const total = filteredData.length;
    const breaches = filteredData.filter((t) => !t.sla_met).length;
    const slaCompliance = total > 0 ? ((total - breaches) / total) * 100 : 100;
    const avgResHrs = total > 0 ? filteredData.reduce((acc, t) => acc + t.resolution_hrs, 0) / total : 0;
    const avgFirstResp = total > 0 ? filteredData.reduce((acc, t) => acc + t.first_response_hrs, 0) / total : 0;
    const avgCsat = total > 0 ? filteredData.reduce((acc, t) => acc + t.csat, 0) / total : 0;

    return {
      total,
      breaches,
      slaCompliance,
      avgResHrs,
      avgFirstResp,
      avgCsat,
    };
  }, [filteredData]);

  // Chart 1: Monthly SLA Trend % (Shows dip in Jul-Aug 2025)
  const monthlySlaTrend = useMemo(() => {
    const map: Record<string, { month: string; total: number; met: number }> = {};
    for (const t of filteredData) {
      if (!map[t.month]) map[t.month] = { month: t.month, total: 0, met: 0 };
      map[t.month].total += 1;
      if (t.sla_met) map[t.month].met += 1;
    }
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        month: m.month,
        compliancePct: parseFloat(((m.met / m.total) * 100).toFixed(1)),
        totalTickets: m.total,
      }));
  }, [filteredData]);

  // Chart 2: SLA Breach Count by Category (Bar) - Click to cross filter
  const breachByCategory = useMemo(() => {
    const map: Record<string, { category: string; breaches: number; total: number }> = {};
    for (const t of filteredData) {
      if (!map[t.category]) map[t.category] = { category: t.category, breaches: 0, total: 0 };
      map[t.category].total += 1;
      if (!t.sla_met) map[t.category].breaches += 1;
    }
    return Object.values(map).sort((a, b) => b.breaches - a.breaches);
  }, [filteredData]);

  // Chart 3: Ticket Volume by Channel (Pie) - Click to cross filter
  const channelData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of filteredData) {
      map[t.channel] = (map[t.channel] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Chart 4: Resolution & First Response Hours by Priority (Bar)
  const priorityData = useMemo(() => {
    const map: Record<string, { priority: string; totalRes: number; totalResp: number; count: number }> = {};
    for (const t of filteredData) {
      if (!map[t.priority]) map[t.priority] = { priority: t.priority, totalRes: 0, totalResp: 0, count: 0 };
      map[t.priority].totalRes += t.resolution_hrs;
      map[t.priority].totalResp += t.first_response_hrs;
      map[t.priority].count += 1;
    }
    const order = ['Urgent', 'High', 'Medium', 'Low'];
    return order
      .filter((p) => map[p])
      .map((p) => ({
        priority: p,
        avgResolutionHrs: parseFloat((map[p].totalRes / map[p].count).toFixed(1)),
        avgFirstResponseHrs: parseFloat((map[p].totalResp / map[p].count).toFixed(1)),
        volume: map[p].count,
      }));
  }, [filteredData]);

  const handleResetFilters = () => {
    setDateRange('ALL');
    setCategoryFilter('ALL');
    setChannelFilter('ALL');
    setSearchTerm('');
    setCrossFilter(null);
  };

  const hasActiveFilters =
    dateRange !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    channelFilter !== 'ALL' ||
    searchTerm !== '' ||
    crossFilter !== null;

  const tableColumns: ColumnDef<SupportTicket>[] = [
    { key: 'ticket_id', header: 'Ticket ID' },
    { key: 'created_date', header: 'Created', render: (r) => formatDate(r.created_date) },
    { key: 'category', header: 'Category' },
    {
      key: 'priority',
      header: 'Priority',
      render: (r) => (
        <span
          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${
            r.priority === 'Urgent'
              ? 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
              : r.priority === 'High'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {r.priority}
        </span>
      ),
    },
    { key: 'channel', header: 'Channel' },
    { key: 'agent', header: 'Support Agent' },
    { key: 'first_response_hrs', header: '1st Response', align: 'right', render: (r) => `${r.first_response_hrs}h` },
    { key: 'resolution_hrs', header: 'Resolution', align: 'right', render: (r) => `${r.resolution_hrs}h` },
    {
      key: 'sla_met',
      header: 'SLA Status',
      align: 'center',
      render: (r) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            r.sla_met
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400 font-bold'
          }`}
        >
          {r.sla_met ? 'Met SLA' : 'Breached'}
        </span>
      ),
    },
    {
      key: 'csat',
      header: 'CSAT',
      align: 'center',
      render: (r) => (
        <div className="flex items-center justify-center gap-1 font-semibold">
          <Star className={`h-3 w-3 ${r.csat >= 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
          <span>{r.csat}/5</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🎧</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Customer Support SLA & Operations Intelligence
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Multi-channel ticket telemetry analyzing first response velocity, SLA compliance drops, turnaround latency, and CSAT impact.
        </p>
      </div>

      <FilterBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        primaryFilterName="Category"
        primaryValue={crossFilter?.type === 'category' ? crossFilter.value : categoryFilter}
        onPrimaryChange={(val) => {
          setCrossFilter(null);
          setCategoryFilter(val);
        }}
        primaryOptions={[
          { label: 'Billing', value: 'Billing' },
          { label: 'Login', value: 'Login' },
          { label: 'Delivery', value: 'Delivery' },
          { label: 'Product', value: 'Product' },
          { label: 'Other', value: 'Other' },
        ]}
        secondaryFilterName="Channel"
        secondaryValue={crossFilter?.type === 'channel' ? crossFilter.value : channelFilter}
        onSecondaryChange={(val) => {
          setCrossFilter(null);
          setChannelFilter(val);
        }}
        secondaryOptions={[
          { label: 'Email', value: 'Email' },
          { label: 'Chat', value: 'Chat' },
          { label: 'Phone', value: 'Phone' },
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
          title="Total Ticket Inflow"
          value={formatNumber(kpiMetrics.total)}
          changePct={14.8}
          comparisonText="volume surge"
          icon={<Headphones className="h-4 w-4 text-sky-600" />}
          subtext="Processed by 4 teams"
        />
        <KpiCard
          title="SLA Compliance Rate"
          value={formatPercent(kpiMetrics.slaCompliance)}
          changePct={kpiMetrics.slaCompliance >= 85 ? 4.2 : -11.5}
          isPositiveGood={true}
          comparisonText="target >= 90%"
          icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
          subtext={`${kpiMetrics.breaches} breached tickets`}
        />
        <KpiCard
          title="Avg Resolution Time"
          value={`${kpiMetrics.avgResHrs.toFixed(1)} hrs`}
          changePct={-8.5}
          isPositiveGood={false}
          comparisonText="faster turnaround"
          icon={<Clock className="h-4 w-4 text-indigo-600" />}
          subtext="Target <= 24 hrs"
        />
        <KpiCard
          title="Avg First Response"
          value={`${kpiMetrics.avgFirstResp.toFixed(1)} hrs`}
          changePct={-12.0}
          isPositiveGood={false}
          comparisonText="speed improvement"
          icon={<Clock className="h-4 w-4 text-purple-600" />}
          subtext="Target <= 2 hrs"
        />
        <KpiCard
          title="Customer CSAT"
          value={`${kpiMetrics.avgCsat.toFixed(2)} / 5.0`}
          changePct={3.4}
          comparisonText="customer sentiment"
          icon={<Star className="h-4 w-4 text-amber-500 fill-amber-400" />}
          subtext="Benchmark: 4.0 / 5.0"
        />
      </div>

      <InsightsPanel insights={insights} recommendation={recommendation} />
      <PmoCard pmo={pmoCase} dashboardTitle="Customer Support SLA" />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Monthly SLA Compliance Trend (Line) - Visualizes the Jul-Aug dip */}
        <ChartCard
          title="Monthly SLA Compliance Rate Trend"
          subtitle="Pinpointing the July-August 2025 SLA dip caused by the payment gateway migration"
        >
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={monthlySlaTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis
                domain={[40, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
              />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'SLA Compliance']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="compliancePct"
                name="SLA Compliance %"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: SLA Breaches by Category (Bar) - Click bar to filter */}
        <ChartCard
          title="SLA Breaches by Category (Click Bar to Filter)"
          subtitle="Billing tickets accounted for over 50% of all SLA failures during the incident window"
          activeFilterBadge={crossFilter?.type === 'category' ? crossFilter.value : null}
          onClearFilter={() => setCrossFilter(null)}
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={breachByCategory}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setCrossFilter({ type: 'category', value: e.activePayload[0].payload.category });
                }
              }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(val: any, name: any) => [val, name === 'breaches' ? 'SLA Breaches' : 'Total Tickets']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="breaches" name="SLA Breaches" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name="Total Tickets" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Volume by Channel (Donut) - Click to filter */}
        <ChartCard
          title="Inflow Distribution by Channel (Click Slice to Filter)"
          subtitle="Email, Live Chat and Telephone queue breakdown"
          activeFilterBadge={crossFilter?.type === 'channel' ? crossFilter.value : null}
          onClearFilter={() => setCrossFilter(null)}
        >
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={channelData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                onClick={(entry) => {
                  if (entry && entry.name) {
                    setCrossFilter({ type: 'channel', value: entry.name });
                  }
                }}
                className="cursor-pointer"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val} tickets`, 'Volume']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Turnaround by Priority Tier (Bar) */}
        <ChartCard
          title="Turnaround Latency by Priority Tier"
          subtitle="Average first response vs full resolution hours"
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="priority" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis
                tickFormatter={(v) => `${v}h`}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
              />
              <Tooltip
                formatter={(val: any, name: any) => [`${val} hours`, name === 'avgResolutionHrs' ? 'Avg Resolution' : 'Avg First Response']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="avgResolutionHrs" name="Avg Resolution Hrs" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgFirstResponseHrs" name="Avg 1st Response Hrs" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        data={filteredData}
        columns={tableColumns}
        title="Support Service Request Queue"
        subtitle="Individual ticket lifecycle logs with CSAT and SLA verification"
        exportFilename="support_tickets_dataset"
        defaultSortKey="created_date"
        defaultSortDirection="desc"
      />
    </div>
  );
};
