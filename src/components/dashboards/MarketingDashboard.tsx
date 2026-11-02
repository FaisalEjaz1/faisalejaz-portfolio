import React, { useState, useMemo } from 'react';
import {
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
  Target,
  DollarSign,
  TrendingUp,
  MousePointer,
  Users,
  Award,
} from 'lucide-react';
import { MarketingRecord, PmoDetails } from '../../types';
import { generateMarketingData } from '../../data/datasets';
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
import { computeMarketingInsights } from '../../utils/insights';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

const pmoCase: PmoDetails = {
  problem:
    'Siloed ad networks (Google Ads, Meta, LinkedIn) led to duplicated lead counts, mismatched conversion values, and ungrounded CAC claims across growth team reviews.',
  method:
    'Created a unified marketing attribution data model in SQL with first-touch and last-touch attribution weighting, automated weekly CSV imports via Power Query, and built a full-funnel conversion dashboard in Power BI.',
  outcome:
    'Demonstrated that Paid Search and Referral delivered 4.2x higher ROAS than Display, enabling the leadership team to reallocate $420,000 of marketing budget with a net 28% increase in closed conversions.',
  toolsUsed: ['Excel', 'Power Query', 'SQL Window Functions', 'Power BI Marketing', 'Google Ads API'],
};

export const MarketingDashboard: React.FC = () => {
  const allData = useMemo(() => generateMarketingData(), []);

  const [dateRange, setDateRange] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [crossFilter, setCrossFilter] = useState<{ type: 'channel'; value: string } | null>(null);

  const filteredData = useMemo(() => {
    return allData.filter((c) => {
      // Date filter
      if (dateRange === '2025' && !c.month.startsWith('2025')) return false;
      if (dateRange === '2024' && !c.month.startsWith('2024')) return false;
      if (dateRange === 'LAST_6M' && c.month < '2025-07') return false;

      // Channel filter
      const effectiveChannel = crossFilter?.type === 'channel' ? crossFilter.value : channelFilter;
      if (effectiveChannel !== 'ALL' && c.channel !== effectiveChannel) return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          c.campaign_id.toLowerCase().includes(q) ||
          c.campaign_name.toLowerCase().includes(q) ||
          c.channel.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allData, dateRange, channelFilter, searchTerm, crossFilter]);

  const { insights, recommendation } = useMemo(
    () => computeMarketingInsights(filteredData),
    [filteredData]
  );

  // KPIs
  const kpiMetrics = useMemo(() => {
    const totalSpend = filteredData.reduce((acc, c) => acc + c.spend, 0);
    const totalRevenue = filteredData.reduce((acc, c) => acc + c.revenue, 0);
    const totalImpressions = filteredData.reduce((acc, c) => acc + c.impressions, 0);
    const totalClicks = filteredData.reduce((acc, c) => acc + c.clicks, 0);
    const totalLeads = filteredData.reduce((acc, c) => acc + c.leads, 0);
    const totalConversions = filteredData.reduce((acc, c) => acc + c.conversions, 0);

    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const blendedCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const leadToCustomer = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

    return {
      totalSpend,
      totalRevenue,
      roas,
      cpa,
      cpl,
      blendedCtr,
      totalLeads,
      totalConversions,
      leadToCustomer,
      totalImpressions,
      totalClicks,
    };
  }, [filteredData]);

  // Chart 1: Funnel from Impressions -> Clicks -> Leads -> Conversions
  const funnelData = useMemo(() => {
    const imp = kpiMetrics.totalImpressions;
    const clicks = kpiMetrics.totalClicks;
    const leads = kpiMetrics.totalLeads;
    const conv = kpiMetrics.totalConversions;

    return [
      {
        stage: '1. Impressions',
        count: imp,
        formatted: formatNumber(imp, true),
        conversionRate: '100% Top of Funnel',
        fill: '#818cf8',
      },
      {
        stage: '2. Clicks',
        count: clicks,
        formatted: formatNumber(clicks, true),
        conversionRate: `${imp > 0 ? ((clicks / imp) * 100).toFixed(2) : 0}% CTR`,
        fill: '#6366f1',
      },
      {
        stage: '3. Qualified Leads',
        count: leads,
        formatted: formatNumber(leads),
        conversionRate: `${clicks > 0 ? ((leads / clicks) * 100).toFixed(1) : 0}% Click-to-Lead`,
        fill: '#4f46e5',
      },
      {
        stage: '4. Closed Sales',
        count: conv,
        formatted: formatNumber(conv),
        conversionRate: `${leads > 0 ? ((conv / leads) * 100).toFixed(1) : 0}% Lead-to-Close`,
        fill: '#10b981',
      },
    ];
  }, [kpiMetrics]);

  // Chart 2: ROAS Multiplier by Channel (Bar) - Click to filter
  const channelRoasData = useMemo(() => {
    const map: Record<string, { channel: string; spend: number; revenue: number }> = {};
    for (const c of filteredData) {
      if (!map[c.channel]) map[c.channel] = { channel: c.channel, spend: 0, revenue: 0 };
      map[c.channel].spend += c.spend;
      map[c.channel].revenue += c.revenue;
    }
    return Object.values(map)
      .map((ch) => ({
        channel: ch.channel,
        roasMultiplier: ch.spend > 0 ? parseFloat((ch.revenue / ch.spend).toFixed(2)) : 0,
        spend: ch.spend,
        revenue: ch.revenue,
      }))
      .sort((a, b) => b.roasMultiplier - a.roasMultiplier);
  }, [filteredData]);

  // Chart 3: Spend Allocation by Channel (Donut) - Click to filter
  const channelSpendData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of filteredData) {
      map[c.channel] = (map[c.channel] || 0) + c.spend;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Chart 4: Monthly Spend vs Revenue Growth (Area/Line)
  const monthlyTrendData = useMemo(() => {
    const map: Record<string, { month: string; spend: number; revenue: number }> = {};
    for (const c of filteredData) {
      if (!map[c.month]) map[c.month] = { month: c.month, spend: 0, revenue: 0 };
      map[c.month].spend += c.spend;
      map[c.month].revenue += c.revenue;
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const handleResetFilters = () => {
    setDateRange('ALL');
    setChannelFilter('ALL');
    setSearchTerm('');
    setCrossFilter(null);
  };

  const hasActiveFilters =
    dateRange !== 'ALL' ||
    channelFilter !== 'ALL' ||
    searchTerm !== '' ||
    crossFilter !== null;

  const tableColumns: ColumnDef<MarketingRecord>[] = [
    { key: 'campaign_id', header: 'Campaign ID' },
    { key: 'campaign_name', header: 'Campaign Name' },
    { key: 'channel', header: 'Channel' },
    { key: 'start_date', header: 'Start Date', render: (r) => formatDate(r.start_date) },
    { key: 'spend', header: 'Ad Spend', align: 'right', render: (r) => formatCurrency(r.spend) },
    { key: 'clicks', header: 'Clicks', align: 'right', render: (r) => formatNumber(r.clicks) },
    { key: 'ctr', header: 'CTR', align: 'right', render: (r) => `${r.ctr}%` },
    { key: 'leads', header: 'Leads', align: 'right', render: (r) => formatNumber(r.leads) },
    { key: 'conversions', header: 'Conversions', align: 'right', render: (r) => formatNumber(r.conversions) },
    { key: 'revenue', header: 'Attributed Rev', align: 'right', render: (r) => <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(r.revenue)}</span> },
    {
      key: 'roas',
      header: 'ROAS',
      align: 'right',
      render: (r) => (
        <span
          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${
            r.roas >= 3.0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400'
          }`}
        >
          {r.roas}x
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Marketing Acquisition Funnel & ROAS Intelligence
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Multi-channel growth attribution tracking campaign spend, full impression-to-sale funnel stages, CPA efficiency, and Return on Ad Spend (ROAS).
        </p>
      </div>

      <FilterBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        primaryFilterName="Channel"
        primaryValue={crossFilter?.type === 'channel' ? crossFilter.value : channelFilter}
        onPrimaryChange={(val) => {
          setCrossFilter(null);
          setChannelFilter(val);
        }}
        primaryOptions={[
          { label: 'Search', value: 'Search' },
          { label: 'Social', value: 'Social' },
          { label: 'Email', value: 'Email' },
          { label: 'Display', value: 'Display' },
          { label: 'Referral', value: 'Referral' },
        ]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeCrossFilter={crossFilter ? `CHANNEL: ${crossFilter.value}` : null}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalCount={allData.length}
        filteredCount={filteredData.length}
      />

      {/* KPI Cards (5 KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Total Attributed Revenue"
          value={formatCurrency(kpiMetrics.totalRevenue, true)}
          changePct={16.2}
          comparisonText="growth trajectory"
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
          subtext="Closed sales pipeline"
        />
        <KpiCard
          title="Blended ROAS Multiplier"
          value={`${kpiMetrics.roas.toFixed(2)}x`}
          changePct={kpiMetrics.roas >= 3 ? 8.4 : -3.2}
          comparisonText="target >= 3.0x"
          icon={<TrendingUp className="h-4 w-4 text-indigo-600" />}
          subtext="Revenue / Spend"
        />
        <KpiCard
          title="Total Marketing Spend"
          value={formatCurrency(kpiMetrics.totalSpend, true)}
          changePct={5.2}
          comparisonText="budget deployment"
          icon={<Target className="h-4 w-4 text-sky-600" />}
          subtext="Across 5 digital channels"
        />
        <KpiCard
          title="Cost Per Acquisition (CPA)"
          value={formatCurrency(kpiMetrics.cpa)}
          changePct={-7.8}
          isPositiveGood={false}
          comparisonText="lower acquisition cost"
          icon={<Award className="h-4 w-4 text-purple-600" />}
          subtext={`CPL: ${formatCurrency(kpiMetrics.cpl)}`}
        />
        <KpiCard
          title="Closed Sales Conversions"
          value={formatNumber(kpiMetrics.totalConversions)}
          changePct={12.9}
          comparisonText="lead-to-close"
          icon={<Users className="h-4 w-4 text-amber-600" />}
          subtext={`${formatNumber(kpiMetrics.totalLeads)} leads generated`}
        />
      </div>

      <InsightsPanel insights={insights} recommendation={recommendation} />
      <PmoCard pmo={pmoCase} dashboardTitle="Marketing Attribution & ROAS" />

      {/* 4 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Funnel from Impressions to Conversions */}
        <ChartCard
          title="End-to-End Acquisition Funnel Progression"
          subtitle="Stage-by-stage drop-off from top-of-funnel impression reach to closed revenue conversions"
        >
          <div className="space-y-3 py-2">
            {funnelData.map((stage, idx) => {
              // Calculate relative width percentage for visual funnel taper
              const widthPct = idx === 0 ? 100 : idx === 1 ? 76 : idx === 2 ? 52 : 36;
              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{stage.stage}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      <strong>{stage.formatted}</strong> ({stage.conversionRate})
                    </span>
                  </div>
                  <div className="h-6 w-full rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all duration-500 flex items-center px-2 text-[10px] text-white font-semibold"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: stage.fill,
                      }}
                    >
                      {stage.formatted}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Chart 2: ROAS Multiplier by Channel (Bar) - Click to filter */}
        <ChartCard
          title="ROAS Multiplier by Channel (Click Bar to Filter)"
          subtitle="Search and Referral channels yield superior returns per ad dollar spent"
          activeFilterBadge={crossFilter?.type === 'channel' ? crossFilter.value : null}
          onClearFilter={() => setCrossFilter(null)}
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={channelRoasData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setCrossFilter({ type: 'channel', value: e.activePayload[0].payload.channel });
                }
              }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `${v}x`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip formatter={(val: any) => [`${val}x`, 'ROAS Multiplier']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="roasMultiplier" name="ROAS (x)" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Spend Allocation by Channel (Donut) - Click to filter */}
        <ChartCard
          title="Capital Deployment by Channel (Click to Filter)"
          subtitle="Portfolio budget distribution across acquisition sources"
          activeFilterBadge={crossFilter?.type === 'channel' ? crossFilter.value : null}
          onClearFilter={() => setCrossFilter(null)}
        >
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={channelSpendData}
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
                {channelSpendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any) => formatCurrency(Number(val))} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Monthly Spend vs Revenue Growth (Area/Line) */}
        <ChartCard
          title="Monthly Ad Spend vs. Attributed Revenue Run-Rate"
          subtitle="24-month marketing growth velocity curve demonstrating margin expansion"
        >
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="mktRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(val: any, name: any) => [formatCurrency(Number(val)), name === 'revenue' ? 'Revenue' : 'Ad Spend']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#mktRevGrad)" />
              <Line type="monotone" dataKey="spend" name="Ad Spend" stroke="#6366f1" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        data={filteredData}
        columns={tableColumns}
        title="Marketing Campaign Performance Ledger"
        subtitle="Campaign-level metrics showing cost per lead (CPL), CPA, and realized revenue return"
        exportFilename="marketing_campaigns_dataset"
        defaultSortKey="revenue"
        defaultSortDirection="desc"
      />
    </div>
  );
};
