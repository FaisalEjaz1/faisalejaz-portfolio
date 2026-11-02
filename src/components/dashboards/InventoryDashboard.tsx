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
} from 'recharts';
import {
  Package,
  AlertTriangle,
  Truck,
  Clock,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { InventoryRecord, PmoDetails } from '../../types';
import { generateInventoryData } from '../../data/datasets';
import { KpiCard } from '../common/KpiCard';
import { ChartCard } from '../common/ChartCard';
import { FilterBar } from '../common/FilterBar';
import { InsightsPanel } from '../common/InsightsPanel';
import { PmoCard } from '../common/PmoCard';
import { DataTable, ColumnDef } from '../common/DataTable';
import {
  formatNumber,
  formatPercent,
} from '../../utils/formatters';
import { computeInventoryInsights } from '../../utils/insights';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

const pmoCase: PmoDetails = {
  problem:
    'Manual stock tallying across 5 regional warehouses caused recurring phantom stockouts, emergency freight air-shipping premiums, and unmonitored supplier lead-time slippage.',
  method:
    'Consolidated warehouse WMS databases into SQL via Power Query, engineered dynamic reorder point models accounting for lead-time variance, and built an automated stock replenishment alert system in Power BI.',
  outcome:
    'Prevented critical stockouts across 42 high-demand SKUs, elevated on-time delivery from 81% to 89.2%, and reduced expedited freight costs by ₹19.5 Lakhs annually.',
  toolsUsed: ['Excel', 'Power Query', 'SQL Stored Procedures', 'Power BI Logistics', 'WMS Data Feeds'],
};

export const InventoryDashboard: React.FC = () => {
  const allData = useMemo(() => generateInventoryData(), []);

  const [dateRange, setDateRange] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [crossFilter, setCrossFilter] = useState<{ type: 'warehouse' | 'category'; value: string } | null>(null);

  const filteredData = useMemo(() => {
    return allData.filter((i) => {
      // Warehouse filter
      const effectiveWh = crossFilter?.type === 'warehouse' ? crossFilter.value : warehouseFilter;
      if (effectiveWh !== 'ALL' && i.warehouse !== effectiveWh) return false;

      // Category filter
      const effectiveCat = crossFilter?.type === 'category' ? crossFilter.value : categoryFilter;
      if (effectiveCat !== 'ALL' && i.category !== effectiveCat) return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          i.sku.toLowerCase().includes(q) ||
          i.product_name.toLowerCase().includes(q) ||
          i.warehouse.toLowerCase().includes(q) ||
          i.delivery_city.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allData, warehouseFilter, categoryFilter, searchTerm, crossFilter]);

  const { insights, recommendation } = useMemo(
    () => computeInventoryInsights(filteredData),
    [filteredData]
  );

  // KPIs
  const kpiMetrics = useMemo(() => {
    const totalSkus = filteredData.length;
    const critical = filteredData.filter((i) => i.is_below_reorder).length;
    const criticalPct = totalSkus > 0 ? (critical / totalSkus) * 100 : 0;
    const totalUnits = filteredData.reduce((acc, i) => acc + i.closing_stock, 0);
    const onTimeCount = filteredData.filter((i) => i.on_time_delivery).length;
    const onTimeRate = totalSkus > 0 ? (onTimeCount / totalSkus) * 100 : 0;
    const avgLeadTime = totalSkus > 0 ? filteredData.reduce((acc, i) => acc + i.lead_time_days, 0) / totalSkus : 0;

    return {
      totalSkus,
      critical,
      criticalPct,
      totalUnits,
      onTimeRate,
      avgLeadTime,
    };
  }, [filteredData]);

  // Chart 1: Stock Level vs Reorder Level by Warehouse (Bar) - Click to filter
  const warehouseData = useMemo(() => {
    const map: Record<string, { warehouse: string; closingStock: number; criticalCount: number; total: number }> = {};
    for (const i of filteredData) {
      if (!map[i.warehouse]) {
        map[i.warehouse] = { warehouse: i.warehouse, closingStock: 0, criticalCount: 0, total: 0 };
      }
      map[i.warehouse].closingStock += i.closing_stock;
      map[i.warehouse].total += 1;
      if (i.is_below_reorder) map[i.warehouse].criticalCount += 1;
    }
    return Object.values(map).sort((a, b) => b.closingStock - a.closingStock);
  }, [filteredData]);

  // Chart 2: Category Volume Share (Donut) - Click to filter
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of filteredData) {
      map[i.category] = (map[i.category] || 0) + i.closing_stock;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Chart 3: Average Lead Time Days by Category (Bar)
  const leadTimeByCategory = useMemo(() => {
    const map: Record<string, { totalDays: number; count: number }> = {};
    for (const i of filteredData) {
      if (!map[i.category]) map[i.category] = { totalDays: 0, count: 0 };
      map[i.category].totalDays += i.lead_time_days;
      map[i.category].count += 1;
    }
    return Object.entries(map).map(([cat, s]) => ({
      category: cat,
      avgLeadDays: parseFloat((s.totalDays / s.count).toFixed(1)),
    }));
  }, [filteredData]);

  // Chart 4: On-Time Delivery vs Delays by Warehouse (Stacked Bar)
  const deliveryStatusByWh = useMemo(() => {
    const map: Record<string, { onTime: number; delayed: number }> = {};
    for (const i of filteredData) {
      if (!map[i.warehouse]) map[i.warehouse] = { onTime: 0, delayed: 0 };
      if (i.on_time_delivery) map[i.warehouse].onTime += 1;
      else map[i.warehouse].delayed += 1;
    }
    return Object.entries(map).map(([wh, s]) => ({
      warehouse: wh.replace(' Hub', '').replace(' Central', '').replace(' North', '').replace(' South', '').replace(' East', ''),
      'On-Time': s.onTime,
      Delayed: s.delayed,
    }));
  }, [filteredData]);

  const handleResetFilters = () => {
    setDateRange('ALL');
    setWarehouseFilter('ALL');
    setCategoryFilter('ALL');
    setSearchTerm('');
    setCrossFilter(null);
  };

  const hasActiveFilters =
    warehouseFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    searchTerm !== '' ||
    crossFilter !== null;

  const tableColumns: ColumnDef<InventoryRecord>[] = [
    { key: 'sku', header: 'SKU Code' },
    { key: 'product_name', header: 'Product Description' },
    { key: 'category', header: 'Category' },
    { key: 'warehouse', header: 'Warehouse Facility' },
    { key: 'closing_stock', header: 'Closing Stock', align: 'right', render: (r) => formatNumber(r.closing_stock) },
    { key: 'reorder_level', header: 'Reorder Level', align: 'right', render: (r) => formatNumber(r.reorder_level) },
    {
      key: 'is_below_reorder',
      header: 'Reorder Alert',
      align: 'center',
      render: (r) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
            r.is_below_reorder
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
          }`}
        >
          {r.is_below_reorder ? 'REORDER REQUIRED' : 'SAFE'}
        </span>
      ),
    },
    { key: 'lead_time_days', header: 'Lead Time', align: 'right', render: (r) => `${r.lead_time_days} days` },
    {
      key: 'on_time_delivery',
      header: 'OTD Status',
      align: 'center',
      render: (r) => (
        <span className={r.on_time_delivery ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-semibold'}>
          {r.on_time_delivery ? 'On-Time' : 'Delayed'}
        </span>
      ),
    },
    { key: 'delivery_city', header: 'Dest. City' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">📦</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Inventory & Logistics Operations Control
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Multi-facility warehouse inventory telemetry tracking SKU stockout deficits, reorder triggers, supplier lead times, and logistics on-time delivery (OTD).
        </p>
      </div>

      <FilterBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        dateOptions={[{ label: 'Real-Time Snapshot', value: 'ALL' }]}
        primaryFilterName="Warehouse"
        primaryValue={crossFilter?.type === 'warehouse' ? crossFilter.value : warehouseFilter}
        onPrimaryChange={(val) => {
          setCrossFilter(null);
          setWarehouseFilter(val);
        }}
        primaryOptions={[
          { label: 'Mumbai Central', value: 'Mumbai Central' },
          { label: 'Delhi North', value: 'Delhi North' },
          { label: 'Bengaluru South', value: 'Bengaluru South' },
          { label: 'Kolkata East', value: 'Kolkata East' },
          { label: 'Ahmedabad Hub', value: 'Ahmedabad Hub' },
        ]}
        secondaryFilterName="Category"
        secondaryValue={crossFilter?.type === 'category' ? crossFilter.value : categoryFilter}
        onSecondaryChange={(val) => {
          setCrossFilter(null);
          setCategoryFilter(val);
        }}
        secondaryOptions={[
          { label: 'Electronics', value: 'Electronics' },
          { label: 'Fast Moving', value: 'Fast Moving' },
          { label: 'Packaging', value: 'Packaging' },
          { label: 'Apparel', value: 'Apparel' },
          { label: 'Industrial', value: 'Industrial' },
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
          title="Monitored Active SKUs"
          value={formatNumber(kpiMetrics.totalSkus)}
          changePct={6.2}
          comparisonText="catalog expansion"
          icon={<Package className="h-4 w-4 text-sky-600" />}
          subtext="Across 5 central hubs"
        />
        <KpiCard
          title="Critical Reorder Alerts"
          value={formatNumber(kpiMetrics.critical)}
          changePct={-14.3}
          isPositiveGood={false}
          comparisonText="stockout vulnerability"
          icon={<AlertTriangle className="h-4 w-4 text-rose-600" />}
          subtext={`${kpiMetrics.criticalPct.toFixed(1)}% of inventory below safety`}
        />
        <KpiCard
          title="Aggregate Stock Units"
          value={formatNumber(kpiMetrics.totalUnits)}
          changePct={3.8}
          comparisonText="on-hand physical stock"
          icon={<Layers className="h-4 w-4 text-indigo-600" />}
          subtext="Finished goods buffer"
        />
        <KpiCard
          title="On-Time Delivery (OTD)"
          value={formatPercent(kpiMetrics.onTimeRate)}
          changePct={4.1}
          comparisonText="SLA target >= 88%"
          icon={<Truck className="h-4 w-4 text-emerald-600" />}
          subtext="National linehaul carriers"
        />
        <KpiCard
          title="Average Vendor Lead Time"
          value={`${kpiMetrics.avgLeadTime.toFixed(1)} days`}
          changePct={-2.4}
          isPositiveGood={false}
          comparisonText="procurement cycle"
          icon={<Clock className="h-4 w-4 text-purple-600" />}
          subtext="PO placement to dock"
        />
      </div>

      <InsightsPanel insights={insights} recommendation={recommendation} />
      <PmoCard pmo={pmoCase} dashboardTitle="Inventory & Logistics Control" />

      {/* 4 Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Stock Level by Warehouse (Bar) - Click to filter */}
        <ChartCard
          title="Physical Stock Units by Warehouse (Click Bar to Filter)"
          subtitle="Stock distribution and warehouse balance across national fulfillment centers"
          activeFilterBadge={crossFilter?.type === 'warehouse' ? crossFilter.value : null}
          onClearFilter={() => setCrossFilter(null)}
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={warehouseData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setCrossFilter({ type: 'warehouse', value: e.activePayload[0].payload.warehouse });
                }
              }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="warehouse" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip formatter={(val: any) => [`${formatNumber(Number(val))} units`, 'Stock Units']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="closingStock" name="On-Hand Units" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Inventory Volume Share by Category (Donut) - Click to filter */}
        <ChartCard
          title="Inventory Volume by Category (Click Slice to Filter)"
          subtitle="Product line physical footprint in warehouse racking"
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
              <Tooltip formatter={(val: any) => [`${formatNumber(Number(val))} units`, 'Stock']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Vendor Lead Time by Category (Bar) */}
        <ChartCard
          title="Average Supplier Lead Time by Product Category"
          subtitle="Days required from PO issuance to physical warehouse receiving dock"
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={leadTimeByCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `${v}d`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip formatter={(val: any) => [`${val} days`, 'Avg Lead Time']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="avgLeadDays" name="Lead Time (Days)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: On-Time Delivery vs Delays (Stacked Bar) */}
        <ChartCard
          title="Logistics On-Time Delivery (OTD) by Hub"
          subtitle="Tracking dispatch punctuality across major regional delivery hubs"
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={deliveryStatusByWh} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="warehouse" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="On-Time" stackId="a" fill="#10b981" />
              <Bar dataKey="Delayed" stackId="a" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        data={filteredData}
        columns={tableColumns}
        title="Warehouse Inventory & Logistics Ledger"
        subtitle="SKU-level stock positions, safety reorder thresholds, and carrier delivery records"
        exportFilename="inventory_logistics_dataset"
        defaultSortKey="is_below_reorder"
        defaultSortDirection="desc"
      />
    </div>
  );
};
