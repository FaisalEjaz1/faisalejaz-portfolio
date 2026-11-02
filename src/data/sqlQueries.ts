import {
  FinanceRecord,
  HrRecord,
  InventoryRecord,
  MarketingRecord,
  SalesRecord,
  SupportTicket,
} from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export interface SqlShowcaseItem {
  id: string;
  title: string;
  category: 'Window Functions' | 'CTEs' | 'Joins' | 'GROUP BY' | 'Aggregations' | 'Case Statements';
  difficulty: 'Intermediate' | 'Advanced';
  explanation: string;
  businessContext: string;
  sql: string;
  execute: (data: {
    sales: SalesRecord[];
    support: SupportTicket[];
    hr: HrRecord[];
    finance: FinanceRecord[];
    inventory: InventoryRecord[];
    marketing: MarketingRecord[];
  }) => { columns: string[]; rows: Record<string, any>[] };
}

export const sqlShowcaseQueries: SqlShowcaseItem[] = [
  {
    id: 'query-1',
    title: 'MoM Revenue Growth & Running Cumulative Total via CTE & Window Functions',
    category: 'Window Functions',
    difficulty: 'Advanced',
    businessContext: 'Executives require monthly tracking of revenue acceleration, comparing current month sales against the previous period and maintaining an unbroken fiscal year-to-date running total.',
    explanation: 'Uses a Common Table Expression (CTE) `MonthlySummary` to aggregate raw transactions by calendar month, then applies `LAG()` to compute Month-over-Month growth percentage and `SUM() OVER(ORDER BY ...)` for the cumulative revenue curve.',
    sql: `-- Monthly Revenue Trend, MoM Growth and Cumulative Run-Rate
WITH MonthlySummary AS (
    SELECT 
        DATE_TRUNC('month', date) AS sales_month,
        TO_CHAR(date, 'Mon YYYY') AS month_label,
        SUM(revenue) AS total_revenue,
        COUNT(DISTINCT order_id) AS total_orders,
        ROUND(AVG(discount_pct), 1) AS avg_discount
    FROM sales_orders
    GROUP BY 1, 2
)
SELECT 
    month_label,
    total_orders,
    total_revenue,
    LAG(total_revenue, 1) OVER (ORDER BY sales_month) AS prior_month_rev,
    ROUND(
        ((total_revenue - LAG(total_revenue, 1) OVER (ORDER BY sales_month)) 
        / NULLIF(LAG(total_revenue, 1) OVER (ORDER BY sales_month), 0)) * 100, 
        1
    ) AS mom_growth_pct,
    SUM(total_revenue) OVER (
        ORDER BY sales_month 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_cumulative_revenue
FROM MonthlySummary
ORDER BY sales_month DESC
LIMIT 8;`,
    execute: (data) => {
      // Group sales by month
      const byMonth: Record<string, { label: string; rev: number; orders: Set<string> }> = {};
      for (const r of data.sales) {
        if (!byMonth[r.month]) {
          const [y, m] = r.month.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const label = `${monthNames[parseInt(m, 10) - 1]} ${y}`;
          byMonth[r.month] = { label, rev: 0, orders: new Set() };
        }
        byMonth[r.month].rev += r.revenue;
        byMonth[r.month].orders.add(r.order_id);
      }

      const sortedMonths = Object.keys(byMonth).sort();
      let cumulative = 0;
      const computed: Record<string, any>[] = [];

      for (let i = 0; i < sortedMonths.length; i++) {
        const m = sortedMonths[i];
        const current = byMonth[m];
        cumulative += current.rev;
        const priorRev = i > 0 ? byMonth[sortedMonths[i - 1]].rev : null;
        const momGrowth = priorRev ? ((current.rev - priorRev) / priorRev) * 100 : null;

        computed.push({
          month_label: current.label,
          total_orders: current.orders.size,
          total_revenue: formatCurrency(current.rev, true),
          prior_month_rev: priorRev ? formatCurrency(priorRev, true) : '-',
          mom_growth_pct: momGrowth !== null ? formatPercent(momGrowth, true) : '-',
          running_cumulative_revenue: formatCurrency(cumulative, true),
        });
      }

      return {
        columns: ['month_label', 'total_orders', 'total_revenue', 'prior_month_rev', 'mom_growth_pct', 'running_cumulative_revenue'],
        rows: computed.slice(-8).reverse(),
      };
    },
  },
  {
    id: 'query-2',
    title: 'Top 3 Sales Executives per Region using DENSE_RANK()',
    category: 'Window Functions',
    difficulty: 'Advanced',
    businessContext: 'Commercial sales leadership conducts quarterly appraisals to award incentive tiers to the top 3 reps in each regional division without skipping rank values when ties occur.',
    explanation: 'Calculates total revenue and quota achievement per sales rep, then leverages `DENSE_RANK() OVER (PARTITION BY region ORDER BY total_revenue DESC)` inside a subquery to filter only `rank_in_region <= 3`.',
    sql: `-- Rank Top 3 Performers by Sales Territory
WITH RepPerformance AS (
    SELECT 
        region,
        sales_rep,
        COUNT(order_id) AS deals_closed,
        SUM(revenue) AS total_revenue,
        SUM(target) AS total_target,
        ROUND((SUM(revenue) / NULLIF(SUM(target), 0)) * 100, 1) AS quota_attainment_pct,
        DENSE_RANK() OVER (
            PARTITION BY region 
            ORDER BY SUM(revenue) DESC
        ) AS rep_rank
    FROM sales_orders
    GROUP BY region, sales_rep
)
SELECT 
    region,
    rep_rank,
    sales_rep,
    deals_closed,
    total_revenue,
    quota_attainment_pct
FROM RepPerformance
WHERE rep_rank <= 3
ORDER BY region ASC, rep_rank ASC;`,
    execute: (data) => {
      const repMap: Record<string, { region: string; rep: string; deals: number; rev: number; target: number }> = {};
      for (const s of data.sales) {
        const key = `${s.region}|${s.sales_rep}`;
        if (!repMap[key]) {
          repMap[key] = { region: s.region, rep: s.sales_rep, deals: 0, rev: 0, target: 0 };
        }
        repMap[key].deals += 1;
        repMap[key].rev += s.revenue;
        repMap[key].target += s.target;
      }

      const list = Object.values(repMap);
      const byReg: Record<string, typeof list> = {};
      for (const item of list) {
        if (!byReg[item.region]) byReg[item.region] = [];
        byReg[item.region].push(item);
      }

      const rows: Record<string, any>[] = [];
      for (const [region, reps] of Object.entries(byReg).sort()) {
        reps.sort((a, b) => b.rev - a.rev);
        reps.slice(0, 3).forEach((rep, idx) => {
          rows.push({
            region,
            rep_rank: `#${idx + 1}`,
            sales_rep: rep.rep,
            deals_closed: rep.deals,
            total_revenue: formatCurrency(rep.rev, true),
            quota_attainment_pct: formatPercent(rep.target > 0 ? (rep.rev / rep.target) * 100 : 100),
          });
        });
      }

      return {
        columns: ['region', 'rep_rank', 'sales_rep', 'deals_closed', 'total_revenue', 'quota_attainment_pct'],
        rows,
      };
    },
  },
  {
    id: 'query-3',
    title: 'Customer Support SLA Breach Attribution by Category & Channel',
    category: 'Aggregations',
    difficulty: 'Intermediate',
    businessContext: 'MIS SLA audits uncover why resolution benchmarks fail, identifying which ticket categories generate the highest breach ratio and their corresponding CSAT penalties.',
    explanation: 'Uses conditional aggregation with `CASE WHEN NOT sla_met THEN 1 END` and `COUNT(*)` to isolate breach rates, average turnaround hours, and satisfaction impact across channels.',
    sql: `-- SLA Breach Rate, Resolution Latency & CSAT Impact by Category
SELECT 
    category,
    channel,
    COUNT(*) AS total_tickets,
    SUM(CASE WHEN NOT sla_met THEN 1 ELSE 0 END) AS breached_tickets,
    ROUND(
        (SUM(CASE WHEN NOT sla_met THEN 1.0 ELSE 0.0 END) / COUNT(*)) * 100, 
        1
    ) AS breach_rate_pct,
    ROUND(AVG(resolution_hrs), 1) AS avg_resolution_hours,
    ROUND(AVG(csat), 2) AS avg_csat_score
FROM support_tickets
GROUP BY category, channel
HAVING COUNT(*) >= 15
ORDER BY breached_tickets DESC
LIMIT 8;`,
    execute: (data) => {
      const grouped: Record<string, { cat: string; ch: string; total: number; breached: number; resHours: number; csat: number }> = {};
      for (const t of data.support) {
        const key = `${t.category}|${t.channel}`;
        if (!grouped[key]) {
          grouped[key] = { cat: t.category, ch: t.channel, total: 0, breached: 0, resHours: 0, csat: 0 };
        }
        grouped[key].total += 1;
        if (!t.sla_met) grouped[key].breached += 1;
        grouped[key].resHours += t.resolution_hrs;
        grouped[key].csat += t.csat;
      }

      const rows = Object.values(grouped)
        .filter((g) => g.total >= 15)
        .map((g) => ({
          category: g.cat,
          channel: g.ch,
          total_tickets: g.total,
          breached_tickets: g.breached,
          breach_rate_pct: formatPercent((g.breached / g.total) * 100),
          avg_resolution_hours: `${(g.resHours / g.total).toFixed(1)} hrs`,
          avg_csat_score: `${(g.csat / g.total).toFixed(2)} / 5.0`,
        }))
        .sort((a, b) => b.breached_tickets - a.breached_tickets)
        .slice(0, 8);

      return {
        columns: ['category', 'channel', 'total_tickets', 'breached_tickets', 'breach_rate_pct', 'avg_resolution_hours', 'avg_csat_score'],
        rows,
      };
    },
  },
  {
    id: 'query-4',
    title: 'Departmental Budget Overspending Detection using HAVING & Variance Filtering',
    category: 'GROUP BY',
    difficulty: 'Intermediate',
    businessContext: 'The Chief Financial Officer requires a quarterly exception report isolating departments where realized spending exceeded the approved budget by more than 5%.',
    explanation: 'Aggregates budget and actual ledger entries by department, applies mathematical variance calculations, and enforces a `HAVING` clause to filter out departments that remained within budget tolerance.',
    sql: `-- Identifying Functional Cost Centers Exceeding Budget Thresholds
SELECT 
    department,
    COUNT(DISTINCT month) AS monitored_months,
    SUM(budget) AS total_approved_budget,
    SUM(actual) AS total_realized_expense,
    SUM(actual) - SUM(budget) AS net_variance_amount,
    ROUND(
        ((SUM(actual) - SUM(budget)) / NULLIF(SUM(budget), 0)) * 100, 
        1
    ) AS variance_pct
FROM finance_records
GROUP BY department
HAVING SUM(actual) > SUM(budget)
ORDER BY net_variance_amount DESC;`,
    execute: (data) => {
      const depts: Record<string, { dept: string; months: Set<string>; budget: number; actual: number }> = {};
      for (const f of data.finance) {
        if (!depts[f.department]) {
          depts[f.department] = { dept: f.department, months: new Set(), budget: 0, actual: 0 };
        }
        depts[f.department].months.add(f.month);
        depts[f.department].budget += f.budget;
        depts[f.department].actual += f.actual;
      }

      const rows = Object.values(depts)
        .filter((d) => d.actual > d.budget)
        .map((d) => {
          const varAmt = d.actual - d.budget;
          const varPct = (varAmt / d.budget) * 100;
          return {
            department: d.dept,
            monitored_months: `${d.months.size} mos`,
            total_approved_budget: formatCurrency(d.budget, true),
            total_realized_expense: formatCurrency(d.actual, true),
            net_variance_amount: `+${formatCurrency(varAmt, true)}`,
            variance_pct: formatPercent(varPct, true),
          };
        })
        .sort((a, b) => b.total_realized_expense.localeCompare(a.total_realized_expense));

      return {
        columns: ['department', 'monitored_months', 'total_approved_budget', 'total_realized_expense', 'net_variance_amount', 'variance_pct'],
        rows,
      };
    },
  },
  {
    id: 'query-5',
    title: 'Early Career Attrition Concentration Analysis (<6 Months Tenure)',
    category: 'Case Statements',
    difficulty: 'Intermediate',
    businessContext: 'HR Leaders noticed sudden turnover spikes. This report investigates whether voluntary separations are concentrated within early tenure brackets across distinct salary tiers.',
    explanation: 'Uses `CASE WHEN` to bucket employee tenure into `<6 Months`, `6-12 Months`, and `>12 Months`, then computes the percentage distribution of exits per tenure bracket.',
    sql: `-- Early Attrition Concentration by Department & Job Level
SELECT 
    department,
    job_level,
    COUNT(*) AS total_departures,
    SUM(CASE WHEN tenure_months <= 6 THEN 1 ELSE 0 END) AS under_6mo_exits,
    ROUND(
        (SUM(CASE WHEN tenure_months <= 6 THEN 1.0 ELSE 0.0 END) / COUNT(*)) * 100, 
        1
    ) AS under_6mo_attrition_pct,
    ROUND(AVG(tenure_months), 1) AS avg_tenure_months,
    MODE() WITHIN GROUP (ORDER BY exit_reason) AS primary_exit_reason
FROM hr_records
WHERE exit_date IS NOT NULL
GROUP BY department, job_level
HAVING COUNT(*) >= 5
ORDER BY under_6mo_attrition_pct DESC
LIMIT 8;`,
    execute: (data) => {
      const exits = data.hr.filter((h) => !h.is_active);
      const groups: Record<string, { dept: string; level: string; total: number; under6: number; tenureSum: number; reasons: Record<string, number> }> = {};

      for (const e of exits) {
        const key = `${e.department}|${e.job_level}`;
        if (!groups[key]) {
          groups[key] = { dept: e.department, level: e.job_level, total: 0, under6: 0, tenureSum: 0, reasons: {} };
        }
        groups[key].total += 1;
        if (e.tenure_months <= 6) groups[key].under6 += 1;
        groups[key].tenureSum += e.tenure_months;
        if (e.exit_reason) {
          groups[key].reasons[e.exit_reason] = (groups[key].reasons[e.exit_reason] || 0) + 1;
        }
      }

      const rows = Object.values(groups)
        .filter((g) => g.total >= 4)
        .map((g) => {
          const under6Pct = (g.under6 / g.total) * 100;
          const avgTenure = g.tenureSum / g.total;
          const topReason = Object.entries(g.reasons).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Compensation';
          return {
            department: g.dept,
            job_level: g.level,
            total_departures: g.total,
            under_6mo_exits: g.under6,
            under_6mo_attrition_pct: formatPercent(under6Pct),
            avg_tenure_months: `${avgTenure.toFixed(1)} mos`,
            primary_exit_reason: topReason,
          };
        })
        .sort((a, b) => parseFloat(b.under_6mo_attrition_pct) - parseFloat(a.under_6mo_attrition_pct))
        .slice(0, 8);

      return {
        columns: ['department', 'job_level', 'total_departures', 'under_6mo_exits', 'under_6mo_attrition_pct', 'avg_tenure_months', 'primary_exit_reason'],
        rows,
      };
    },
  },
  {
    id: 'query-6',
    title: 'Critical Inventory Safety Stock & Reorder Alert Prioritization',
    category: 'Case Statements',
    difficulty: 'Intermediate',
    businessContext: 'Supply Chain managers must proactively order inventory before warehouse stockouts disrupt promised customer SLAs, accounting for supplier lead time days.',
    explanation: 'Evaluates inventory stock levels against dynamically calculated reorder thresholds, assigning risk priority tiers (`CRITICAL`, `MONITOR`, `SUFFICIENT`) and sorting by lead-time exposure.',
    sql: `-- Warehouse Safety Stock Depletion & Reorder Urgency Matrix
SELECT 
    sku,
    product_name,
    warehouse,
    closing_stock,
    reorder_level,
    reorder_level - closing_stock AS stock_deficit,
    lead_time_days,
    CASE 
        WHEN closing_stock <= (reorder_level * 0.5) THEN 'CRITICAL STOCKOUT'
        WHEN closing_stock <= reorder_level THEN 'REORDER REQUIRED'
        ELSE 'STABLE INVENTORY'
    END AS stock_health_status
FROM inventory_records
WHERE closing_stock <= reorder_level
ORDER BY stock_deficit DESC, lead_time_days DESC
LIMIT 8;`,
    execute: (data) => {
      const below = data.inventory.filter((i) => i.is_below_reorder);
      const rows = below
        .map((i) => {
          const deficit = i.reorder_level - i.closing_stock;
          let status = 'REORDER REQUIRED';
          if (i.closing_stock <= i.reorder_level * 0.5) status = 'CRITICAL STOCKOUT';
          return {
            sku: i.sku,
            product_name: i.product_name,
            warehouse: i.warehouse,
            closing_stock: formatNumber(i.closing_stock),
            reorder_level: formatNumber(i.reorder_level),
            stock_deficit: `-${formatNumber(deficit)}`,
            lead_time_days: `${i.lead_time_days} days`,
            stock_health_status: status,
          };
        })
        .sort((a, b) => parseInt(b.stock_deficit.replace(/\D/g, ''), 10) - parseInt(a.stock_deficit.replace(/\D/g, ''), 10))
        .slice(0, 8);

      return {
        columns: ['sku', 'product_name', 'warehouse', 'closing_stock', 'reorder_level', 'stock_deficit', 'lead_time_days', 'stock_health_status'],
        rows,
      };
    },
  },
  {
    id: 'query-7',
    title: 'Marketing Channel Acquisition Efficiency & ROAS Multipliers',
    category: 'CTEs',
    difficulty: 'Advanced',
    businessContext: 'Growth marketing MIS reporting assesses end-to-end customer journey metrics from top-of-funnel reach to bottom-of-funnel closed revenue and return on capital.',
    explanation: 'Uses CTEs to calculate blended customer acquisition costs (CPA), lead conversion efficiency, and Return on Ad Spend (ROAS) across paid and organic growth channels.',
    sql: `-- Attribution Funnel: CTR, Cost Per Acquisition and ROAS Multiplier
WITH ChannelAggregates AS (
    SELECT 
        channel,
        SUM(spend) AS total_spend,
        SUM(impressions) AS total_impressions,
        SUM(clicks) AS total_clicks,
        SUM(leads) AS total_leads,
        SUM(conversions) AS total_conversions,
        SUM(revenue) AS total_revenue
    FROM marketing_campaigns
    GROUP BY channel
)
SELECT 
    channel,
    total_spend,
    total_revenue,
    ROUND((total_clicks::NUMERIC / NULLIF(total_impressions, 0)) * 100, 2) AS ctr_pct,
    ROUND(total_spend / NULLIF(total_leads, 0), 0) AS cost_per_lead,
    ROUND(total_spend / NULLIF(total_conversions, 0), 0) AS cost_per_acquisition,
    ROUND(total_revenue / NULLIF(total_spend, 0), 2) AS roas_multiplier
FROM ChannelAggregates
ORDER BY roas_multiplier DESC;`,
    execute: (data) => {
      const chMap: Record<string, { spend: number; imp: number; clicks: number; leads: number; conv: number; rev: number }> = {};
      for (const m of data.marketing) {
        if (!chMap[m.channel]) chMap[m.channel] = { spend: 0, imp: 0, clicks: 0, leads: 0, conv: 0, rev: 0 };
        chMap[m.channel].spend += m.spend;
        chMap[m.channel].imp += m.impressions;
        chMap[m.channel].clicks += m.clicks;
        chMap[m.channel].leads += m.leads;
        chMap[m.channel].conv += m.conversions;
        chMap[m.channel].rev += m.revenue;
      }

      const rows = Object.entries(chMap)
        .map(([channel, s]) => {
          const ctr = s.imp > 0 ? (s.clicks / s.imp) * 100 : 0;
          const cpl = s.leads > 0 ? s.spend / s.leads : 0;
          const cpa = s.conv > 0 ? s.spend / s.conv : 0;
          const roas = s.spend > 0 ? s.rev / s.spend : 0;
          return {
            channel,
            total_spend: formatCurrency(s.spend, true),
            total_revenue: formatCurrency(s.rev, true),
            ctr_pct: `${ctr.toFixed(2)}%`,
            cost_per_lead: formatCurrency(cpl),
            cost_per_acquisition: formatCurrency(cpa),
            roas_multiplier: `${roas.toFixed(2)}x`,
          };
        })
        .sort((a, b) => parseFloat(b.roas_multiplier) - parseFloat(a.roas_multiplier));

      return {
        columns: ['channel', 'total_spend', 'total_revenue', 'ctr_pct', 'cost_per_lead', 'cost_per_acquisition', 'roas_multiplier'],
        rows,
      };
    },
  },
  {
    id: 'query-8',
    title: 'Rolling 3-Month Moving Average of Operational Variance',
    category: 'Window Functions',
    difficulty: 'Advanced',
    businessContext: 'Smooths out erratic single-month invoice timing lumps to uncover chronic underlying variance trends across finance ledgers.',
    explanation: 'Implements `AVG(variance) OVER (PARTITION BY department ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` to generate a rolling quarterly smoothing baseline.',
    sql: `-- Rolling 3-Month Moving Average of Budget Variance
SELECT 
    department,
    month,
    variance AS month_variance,
    ROUND(
        AVG(variance) OVER (
            PARTITION BY department 
            ORDER BY month 
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ), 
        0
    ) AS rolling_3mo_avg_variance
FROM finance_records
WHERE expense_category = 'Software'
ORDER BY department, month DESC
LIMIT 8;`,
    execute: (data) => {
      const filtered = data.finance.filter((f) => f.expense_category === 'Software');
      // Group by dept and month
      const byDept: Record<string, { month: string; variance: number }[]> = {};
      for (const f of filtered) {
        if (!byDept[f.department]) byDept[f.department] = [];
        byDept[f.department].push({ month: f.month, variance: f.variance });
      }

      const rows: Record<string, any>[] = [];
      for (const [dept, list] of Object.entries(byDept)) {
        list.sort((a, b) => a.month.localeCompare(b.month));
        for (let i = 0; i < list.length; i++) {
          const windowStart = Math.max(0, i - 2);
          const windowItems = list.slice(windowStart, i + 1);
          const avgVar = windowItems.reduce((acc, it) => acc + it.variance, 0) / windowItems.length;
          rows.push({
            department: dept,
            month: list[i].month,
            month_variance: formatCurrency(list[i].variance),
            rolling_3mo_avg_variance: formatCurrency(Math.round(avgVar)),
          });
        }
      }

      return {
        columns: ['department', 'month', 'month_variance', 'rolling_3mo_avg_variance'],
        rows: rows.slice(-8).reverse(),
      };
    },
  },
];
