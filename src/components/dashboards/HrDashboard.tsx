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
  Users,
  UserMinus,
  TrendingDown,
  Clock,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { HrRecord, PmoDetails } from '../../types';
import { generateHrData } from '../../data/datasets';
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
import { computeHrInsights } from '../../utils/insights';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#64748b'];

const pmoCase: PmoDetails = {
  problem:
    'High annualized attrition was eroding operational margins and onboarding budgets, but HR leadership lacked quantifiable visibility into whether separations were driven by salary uncompetitiveness or early onboarding dropouts.',
  method:
    'Normalized fragmented Darwinbox HRIS dump files into an automated Power Query pipeline, created SQL survival cohort buckets by tenure month, and built interactive Power BI attrition risk heatmaps.',
  outcome:
    'Pinpointed that 61% of customer support departures occurred within 90-180 days, leading to an overhauled 60-day ramp program that decreased early-career turnover by 24% over the following two quarters.',
  toolsUsed: ['Excel', 'Power Query', 'PostgreSQL', 'Power BI', 'Survival Analysis'],
};

export const HrDashboard: React.FC = () => {
  const allData = useMemo(() => generateHrData(), []);

  const [dateRange, setDateRange] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [crossFilter, setCrossFilter] = useState<{ type: 'department' | 'reason'; value: string } | null>(null);

  const filteredData = useMemo(() => {
    return allData.filter((e) => {
      // Date filter (by hire date)
      if (dateRange === '2025' && !e.hire_date.startsWith('2025')) return false;
      if (dateRange === '2024' && !e.hire_date.startsWith('2024')) return false;

      // Department filter
      const effectiveDept = crossFilter?.type === 'department' ? crossFilter.value : departmentFilter;
      if (effectiveDept !== 'ALL' && e.department !== effectiveDept) return false;

      // Job level filter
      if (levelFilter !== 'ALL' && e.job_level !== levelFilter) return false;

      // Cross filter by exit reason
      if (crossFilter?.type === 'reason' && e.exit_reason !== crossFilter.value) return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          e.employee_id.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          (e.exit_reason && e.exit_reason.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [allData, dateRange, departmentFilter, levelFilter, searchTerm, crossFilter]);

  const { insights, recommendation } = useMemo(
    () => computeHrInsights(filteredData),
    [filteredData]
  );

  // KPIs
  const kpiMetrics = useMemo(() => {
    const total = filteredData.length;
    const active = filteredData.filter((e) => e.is_active).length;
    const exits = filteredData.filter((e) => !e.is_active);
    const exitCount = exits.length;
    const attritionRate = total > 0 ? (exitCount / total) * 100 : 0;
    const earlyExits = exits.filter((e) => e.tenure_months <= 6).length;
    const earlyExitPct = exitCount > 0 ? (earlyExits / exitCount) * 100 : 0;
    const avgTenure = total > 0 ? filteredData.reduce((acc, e) => acc + e.tenure_months, 0) / total : 0;

    return {
      total,
      active,
      exitCount,
      attritionRate,
      earlyExits,
      earlyExitPct,
      avgTenure,
    };
  }, [filteredData]);

  // Chart 1: Attrition Rate by Department (Bar) - Click to filter
  const departmentAttrition = useMemo(() => {
    const map: Record<string, { department: string; active: number; exits: number; total: number }> = {};
    for (const e of filteredData) {
      if (!map[e.department]) map[e.department] = { department: e.department, active: 0, exits: 0, total: 0 };
      map[e.department].total += 1;
      if (e.is_active) map[e.department].active += 1;
      else map[e.department].exits += 1;
    }
    return Object.values(map)
      .map((d) => ({
        department: d.department,
        attritionRatePct: parseFloat(((d.exits / d.total) * 100).toFixed(1)),
        headcount: d.total,
        exits: d.exits,
      }))
      .sort((a, b) => b.attritionRatePct - a.attritionRatePct);
  }, [filteredData]);

  // Chart 2: Tenure Distribution of Exits (<6mo, 6-12mo, 12-24mo, >24mo)
  const tenureCohortData = useMemo(() => {
    const exits = filteredData.filter((e) => !e.is_active);
    const buckets: Record<string, number> = {
      '0-6 Months': 0,
      '7-12 Months': 0,
      '1-2 Years': 0,
      '2+ Years': 0,
    };
    for (const e of exits) {
      if (e.tenure_months <= 6) buckets['0-6 Months'] += 1;
      else if (e.tenure_months <= 12) buckets['7-12 Months'] += 1;
      else if (e.tenure_months <= 24) buckets['1-2 Years'] += 1;
      else buckets['2+ Years'] += 1;
    }
    return Object.entries(buckets).map(([bracket, count]) => ({ bracket, count }));
  }, [filteredData]);

  // Chart 3: Primary Exit Reasons (Donut) - Click to filter
  const exitReasonData = useMemo(() => {
    const exits = filteredData.filter((e) => !e.is_active && e.exit_reason);
    const map: Record<string, number> = {};
    for (const e of exits) {
      if (e.exit_reason) map[e.exit_reason] = (map[e.exit_reason] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Chart 4: Department Headcount by Job Level (Stacked Bar)
  const jobLevelData = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const e of filteredData) {
      if (!map[e.department]) {
        map[e.department] = { Junior: 0, Mid: 0, Senior: 0, Lead: 0, Manager: 0 };
      }
      map[e.department][e.job_level] = (map[e.department][e.job_level] || 0) + 1;
    }
    return Object.entries(map).map(([dept, counts]) => ({
      department: dept,
      ...counts,
    }));
  }, [filteredData]);

  const handleResetFilters = () => {
    setDateRange('ALL');
    setDepartmentFilter('ALL');
    setLevelFilter('ALL');
    setSearchTerm('');
    setCrossFilter(null);
  };

  const hasActiveFilters =
    dateRange !== 'ALL' ||
    departmentFilter !== 'ALL' ||
    levelFilter !== 'ALL' ||
    searchTerm !== '' ||
    crossFilter !== null;

  const tableColumns: ColumnDef<HrRecord>[] = [
    { key: 'employee_id', header: 'Emp ID' },
    { key: 'department', header: 'Department' },
    { key: 'job_level', header: 'Job Level' },
    { key: 'location', header: 'Location' },
    { key: 'hire_date', header: 'Hire Date', render: (r) => formatDate(r.hire_date) },
    {
      key: 'is_active',
      header: 'Employment Status',
      align: 'center',
      render: (r) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            r.is_active
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400'
          }`}
        >
          {r.is_active ? 'Active' : 'Departed'}
        </span>
      ),
    },
    {
      key: 'tenure_months',
      header: 'Tenure',
      align: 'right',
      render: (r) => `${r.tenure_months} mos`,
    },
    {
      key: 'exit_reason',
      header: 'Exit Reason',
      render: (r) => r.exit_reason || <span className="text-slate-400 italic">Active Staff</span>,
    },
    { key: 'salary_band', header: 'Salary Band' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            HR Workforce Analytics & Attrition Cockpit
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Human capital telemetry tracking organizational headcount, department turnover rates, early-tenure exit concentrations, and voluntary departure drivers.
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
          { label: 'Engineering', value: 'Engineering' },
          { label: 'Sales', value: 'Sales' },
          { label: 'Marketing', value: 'Marketing' },
          { label: 'Customer Support', value: 'Customer Support' },
          { label: 'HR & Ops', value: 'HR & Ops' },
          { label: 'Finance', value: 'Finance' },
        ]}
        secondaryFilterName="Job Level"
        secondaryValue={levelFilter}
        onSecondaryChange={setLevelFilter}
        secondaryOptions={[
          { label: 'Junior', value: 'Junior' },
          { label: 'Mid', value: 'Mid' },
          { label: 'Senior', value: 'Senior' },
          { label: 'Lead', value: 'Lead' },
          { label: 'Manager', value: 'Manager' },
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
          title="Active Headcount"
          value={formatNumber(kpiMetrics.active)}
          changePct={5.6}
          comparisonText="net workforce growth"
          icon={<Users className="h-4 w-4 text-indigo-600" />}
          subtext={`Total tracked: ${kpiMetrics.total}`}
        />
        <KpiCard
          title="Overall Attrition Rate"
          value={formatPercent(kpiMetrics.attritionRate)}
          changePct={-2.1}
          isPositiveGood={false}
          comparisonText="vs industry benchmark (18%)"
          icon={<TrendingDown className="h-4 w-4 text-rose-600" />}
          subtext={`${kpiMetrics.exitCount} total departures`}
        />
        <KpiCard
          title="Early Attrition (<6 Mo)"
          value={formatPercent(kpiMetrics.earlyExitPct)}
          changePct={-4.5}
          isPositiveGood={false}
          comparisonText="onboarding dropouts"
          icon={<AlertCircle className="h-4 w-4 text-amber-600" />}
          subtext={`${kpiMetrics.earlyExits} exits <= 6 months`}
        />
        <KpiCard
          title="Average Tenure"
          value={`${kpiMetrics.avgTenure.toFixed(1)} mos`}
          changePct={3.8}
          comparisonText="retention stability"
          icon={<Clock className="h-4 w-4 text-sky-600" />}
          subtext="Org median: 16 months"
        />
        <KpiCard
          title="Total Departures"
          value={formatNumber(kpiMetrics.exitCount)}
          changePct={-1.8}
          isPositiveGood={false}
          comparisonText="voluntary exits"
          icon={<UserMinus className="h-4 w-4 text-purple-600" />}
          subtext="Exit interview logged"
        />
      </div>

      <InsightsPanel insights={insights} recommendation={recommendation} />
      <PmoCard pmo={pmoCase} dashboardTitle="HR Workforce Analytics" />

      {/* 4 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Attrition Rate by Department (Bar) - Click to filter */}
        <ChartCard
          title="Attrition Rate by Department (Click Bar to Filter)"
          subtitle="Customer Support and Sales register the steepest turnover percentages"
          activeFilterBadge={crossFilter?.type === 'department' ? crossFilter.value : null}
          onClearFilter={() => setCrossFilter(null)}
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={departmentAttrition}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setCrossFilter({ type: 'department', value: e.activePayload[0].payload.department });
                }
              }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Attrition Rate']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="attritionRatePct" name="Attrition Rate %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Tenure Distribution of Exits (Area/Bar) */}
        <ChartCard
          title="Tenure Distribution of Departures"
          subtitle="Turnover is heavily concentrated in the critical first 6 months of employment"
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={tenureCohortData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="bracket" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(val: any) => [`${val} departures`, 'Exits']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="count" name="Departures" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Voluntary Exit Reasons (Donut) - Click slice to filter */}
        <ChartCard
          title="Primary Voluntary Exit Reasons (Click Slice to Filter)"
          subtitle="Declared departure drivers collected from formal exit interviews"
          activeFilterBadge={crossFilter?.type === 'reason' ? crossFilter.value : null}
          onClearFilter={() => setCrossFilter(null)}
        >
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={exitReasonData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                onClick={(entry) => {
                  if (entry && entry.name) {
                    setCrossFilter({ type: 'reason', value: entry.name });
                  }
                }}
                className="cursor-pointer"
              >
                {exitReasonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val} employees`, 'Exits']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Department Headcount by Job Level (Stacked Bar) */}
        <ChartCard
          title="Staffing Distribution by Seniority Level"
          subtitle="Departmental pyramid balance across Junior through Management tiers"
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={jobLevelData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Junior" stackId="a" fill="#93c5fd" />
              <Bar dataKey="Mid" stackId="a" fill="#60a5fa" />
              <Bar dataKey="Senior" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Lead" stackId="a" fill="#1d4ed8" />
              <Bar dataKey="Manager" stackId="a" fill="#1e3a8a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        data={filteredData}
        columns={tableColumns}
        title="Human Resources Employee Roster"
        subtitle="Individual personnel records with tenure history and departure details"
        exportFilename="hr_workforce_dataset"
        defaultSortKey="hire_date"
        defaultSortDirection="desc"
      />
    </div>
  );
};
