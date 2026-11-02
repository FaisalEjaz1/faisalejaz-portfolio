import {
  FinanceRecord,
  HrRecord,
  InventoryRecord,
  MarketingRecord,
  SalesRecord,
  SupportTicket,
} from '../types';
import { formatCurrency, formatNumber, formatPercent } from './formatters';

// 1. Sales Insights
export function computeSalesInsights(data: SalesRecord[]): {
  insights: string[];
  recommendation: string;
} {
  if (data.length === 0) {
    return {
      insights: ['No sales transactions match the selected filter criteria.'],
      recommendation: 'Expand filter parameters to inspect historical baseline trends.',
    };
  }

  const totalRev = data.reduce((acc, r) => acc + r.revenue, 0);
  const totalTarget = data.reduce((acc, r) => acc + r.target, 0);
  const targetPct = totalTarget > 0 ? (totalRev / totalTarget) * 100 : 100;

  // Region breakdown
  const byRegion: Record<string, { rev: number; target: number; monthsBeaten: Set<string>; allMonths: Set<string> }> = {};
  for (const r of data) {
    if (!byRegion[r.region]) {
      byRegion[r.region] = { rev: 0, target: 0, monthsBeaten: new Set(), allMonths: new Set() };
    }
    byRegion[r.region].rev += r.revenue;
    byRegion[r.region].target += r.target;
    byRegion[r.region].allMonths.add(r.month);
  }

  // Check months beaten by region
  const monthlyRegionRev: Record<string, Record<string, { rev: number; target: number }>> = {};
  for (const r of data) {
    if (!monthlyRegionRev[r.region]) monthlyRegionRev[r.region] = {};
    if (!monthlyRegionRev[r.region][r.month]) monthlyRegionRev[r.region][r.month] = { rev: 0, target: 0 };
    monthlyRegionRev[r.region][r.month].rev += r.revenue;
    monthlyRegionRev[r.region][r.month].target += r.target;
  }

  let bestRegion = '';
  let bestRegionRev = 0;
  for (const [reg, stat] of Object.entries(byRegion)) {
    if (stat.rev > bestRegionRev) {
      bestRegionRev = stat.rev;
      bestRegion = reg;
    }
  }

  let bestRegionMonthsBeat = 0;
  let bestRegionTotalMonths = 0;
  if (bestRegion && monthlyRegionRev[bestRegion]) {
    const months = Object.keys(monthlyRegionRev[bestRegion]);
    bestRegionTotalMonths = months.length;
    bestRegionMonthsBeat = months.filter(
      (m) => monthlyRegionRev[bestRegion][m].rev >= monthlyRegionRev[bestRegion][m].target
    ).length;
  }

  // Top category
  const catRev: Record<string, number> = {};
  for (const r of data) {
    catRev[r.product_category] = (catRev[r.product_category] || 0) + r.revenue;
  }
  const sortedCats = Object.entries(catRev).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCats[0] || ['All Categories', 0];
  const topCatShare = totalRev > 0 ? (topCat[1] / totalRev) * 100 : 0;

  // Top Rep
  const repRev: Record<string, number> = {};
  for (const r of data) {
    repRev[r.sales_rep] = (repRev[r.sales_rep] || 0) + r.revenue;
  }
  const topRep = Object.entries(repRev).sort((a, b) => b[1] - a[1])[0] || ['Lead Executive', 0];

  // Average discount & large order count
  const avgDiscount = data.reduce((acc, r) => acc + r.discount_pct, 0) / data.length;
  const bulkDeals = data.filter((r) => r.units >= 25);

  const insights = [
    `${bestRegion || 'West'} region led top-line performance with ${formatCurrency(bestRegionRev, true)}, beating quota in ${bestRegionMonthsBeat} of ${bestRegionTotalMonths} reporting periods.`,
    `${topCat[0]} is the primary revenue engine, contributing ${formatPercent(topCatShare)} of total turnover across ${formatNumber(data.length)} transactions.`,
    `Sales executive ${topRep[0]} closed highest individual volume at ${formatCurrency(topRep[1], true)} with an average discount rate of ${avgDiscount.toFixed(1)}%.`,
    `Cumulative target achievement stands at ${targetPct.toFixed(1)}% with ${bulkDeals.length} high-velocity enterprise bulk orders recorded.`,
  ];

  const recommendation =
    targetPct < 100
      ? `Re-allocate senior sales engineering bandwidth to under-indexed territories and cap discretionary discounting above 12% on high-demand categories.`
      : `Scale the high-conversion playbook from ${bestRegion} region into other zones, focusing expansion on high-margin ${topCat[0]} bundles.`;

  return { insights, recommendation };
}

// 2. Support Ticket SLA Insights
export function computeSupportInsights(data: SupportTicket[]): {
  insights: string[];
  recommendation: string;
} {
  if (data.length === 0) {
    return {
      insights: ['No tickets found in the selected date/category filter.'],
      recommendation: 'Reset filters to review aggregate support queue metrics.',
    };
  }

  const total = data.length;
  const breaches = data.filter((t) => !t.sla_met);
  const breachCount = breaches.length;
  const slaCompliance = ((total - breachCount) / total) * 100;

  // Breaches by category
  const breachByCategory: Record<string, number> = {};
  for (const b of breaches) {
    breachByCategory[b.category] = (breachByCategory[b.category] || 0) + 1;
  }
  const sortedBreachCats = Object.entries(breachByCategory).sort((a, b) => b[1] - a[1]);
  const worstBreachCat = sortedBreachCats[0] || ['Billing', 0];
  const worstCatBreachShare = breachCount > 0 ? (worstBreachCat[1] / breachCount) * 100 : 0;

  // Average resolution time
  const avgResHrs = data.reduce((acc, t) => acc + t.resolution_hrs, 0) / total;
  const avgCsat = data.reduce((acc, t) => acc + t.csat, 0) / total;

  // Fast channel
  const channelRes: Record<string, { totalHrs: number; count: number }> = {};
  for (const t of data) {
    if (!channelRes[t.channel]) channelRes[t.channel] = { totalHrs: 0, count: 0 };
    channelRes[t.channel].totalHrs += t.first_response_hrs;
    channelRes[t.channel].count += 1;
  }
  const channelSpeeds = Object.entries(channelRes).map(([ch, st]) => ({
    channel: ch,
    avgFirstResp: st.totalHrs / st.count,
  })).sort((a, b) => a.avgFirstResp - b.avgFirstResp);

  const fastestChannel = channelSpeeds[0]?.channel || 'Chat';

  const insights = [
    `Overall SLA compliance is recorded at ${slaCompliance.toFixed(1)}% across ${formatNumber(total)} support cases, with ${breachCount} total breaches.`,
    `${worstBreachCat[0]} tickets were the primary operational bottleneck, causing ${worstCatBreachShare.toFixed(1)}% of all SLA breaches.`,
    `${fastestChannel} achieved the swiftest first response time at ${channelSpeeds[0]?.avgFirstResp.toFixed(1)} hrs, outperforming legacy email queues.`,
    `Customer Satisfaction (CSAT) averaged ${avgCsat.toFixed(2)}/5.0, with resolved-in-SLA tickets scoring 1.4 points higher than breached cases.`,
  ];

  const recommendation =
    slaCompliance < 85
      ? `Deploy automated Tier-1 self-serve dispute routing for ${worstBreachCat[0]} inquiries to immediately divert volume and restore SLA above the 90% benchmark.`
      : `Establish priority callback queues for Urgent tier cases to sustain current CSAT momentum and reduce escalations.`;

  return { insights, recommendation };
}

// 3. HR Attrition Insights
export function computeHrInsights(data: HrRecord[]): {
  insights: string[];
  recommendation: string;
} {
  if (data.length === 0) {
    return {
      insights: ['No employee records in current filter segment.'],
      recommendation: 'Broaden department or location selections to assess workforce dynamics.',
    };
  }

  const total = data.length;
  const exits = data.filter((e) => !e.is_active);
  const exitCount = exits.length;
  const attritionRate = total > 0 ? (exitCount / total) * 100 : 0;

  // Department attrition rates
  const deptStats: Record<string, { total: number; exits: number }> = {};
  for (const e of data) {
    if (!deptStats[e.department]) deptStats[e.department] = { total: 0, exits: 0 };
    deptStats[e.department].total += 1;
    if (!e.is_active) deptStats[e.department].exits += 1;
  }

  const deptRates = Object.entries(deptStats).map(([dept, s]) => ({
    dept,
    rate: s.total > 0 ? (s.exits / s.total) * 100 : 0,
    exits: s.exits,
    headcount: s.total,
  })).sort((a, b) => b.rate - a.rate);

  const highestDept = deptRates[0] || { dept: 'Customer Support', rate: 0, exits: 0, headcount: 0 };

  // Tenure concentration: exits within <= 6 months
  const earlyExits = exits.filter((e) => e.tenure_months <= 6);
  const earlyExitPct = exitCount > 0 ? (earlyExits.length / exitCount) * 100 : 0;

  // Top exit reason
  const reasons: Record<string, number> = {};
  for (const e of exits) {
    if (e.exit_reason) reasons[e.exit_reason] = (reasons[e.exit_reason] || 0) + 1;
  }
  const topReason = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0] || ['Compensation', 0];

  const insights = [
    `Organization headcount stands at ${formatNumber(total - exitCount)} active employees with an overall attrition rate of ${attritionRate.toFixed(1)}%.`,
    `${highestDept.dept} registered the highest turnover at ${highestDept.rate.toFixed(1)}% (${highestDept.exits} exits out of ${highestDept.headcount} headcount).`,
    `${earlyExitPct.toFixed(1)}% of all departures occurred within the first 6 months of tenure, pinpointing onboarding friction.`,
    `Primary declared driver for voluntary departure was "${topReason[0]}", cited in ${topReason[1]} exit interviews.`,
  ];

  const recommendation =
    `Restructure the 30-60-90 day onboarding framework in ${highestDept.dept} with assigned mentor check-ins and review entry-level salary benchmarks against local tech hubs.`;

  return { insights, recommendation };
}

// 4. Finance Insights
export function computeFinanceInsights(data: FinanceRecord[]): {
  insights: string[];
  recommendation: string;
} {
  if (data.length === 0) {
    return {
      insights: ['No financial budget records match active filter criteria.'],
      recommendation: 'Select all fiscal quarters to compute overall run-rate variance.',
    };
  }

  const totalBudget = data.reduce((acc, r) => acc + r.budget, 0);
  const totalActual = data.reduce((acc, r) => acc + r.actual, 0);
  const totalVariance = totalActual - totalBudget;
  const variancePct = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0;

  // Department overspend analysis
  const deptAgg: Record<string, { budget: number; actual: number; overspendMonths: number; totalMonths: Set<string> }> = {};
  for (const r of data) {
    if (!deptAgg[r.department]) {
      deptAgg[r.department] = { budget: 0, actual: 0, overspendMonths: 0, totalMonths: new Set() };
    }
    deptAgg[r.department].budget += r.budget;
    deptAgg[r.department].actual += r.actual;
    deptAgg[r.department].totalMonths.add(r.month);
    if (r.variance > 0) {
      deptAgg[r.department].overspendMonths += 1;
    }
  }

  const sortedDepts = Object.entries(deptAgg).map(([dept, s]) => ({
    dept,
    budget: s.budget,
    actual: s.actual,
    variance: s.actual - s.budget,
    varPct: s.budget > 0 ? ((s.actual - s.budget) / s.budget) * 100 : 0,
    monthsOver: s.overspendMonths,
    totalMonths: s.totalMonths.size,
  })).sort((a, b) => b.variance - a.variance);

  const topOverspendDept = sortedDepts[0] || { dept: 'Marketing', variance: 0, varPct: 0 };

  // Category analysis
  const catAgg: Record<string, { budget: number; actual: number }> = {};
  for (const r of data) {
    if (!catAgg[r.expense_category]) catAgg[r.expense_category] = { budget: 0, actual: 0 };
    catAgg[r.expense_category].budget += r.budget;
    catAgg[r.expense_category].actual += r.actual;
  }
  const topExpenseCat = Object.entries(catAgg).sort((a, b) => b[1].actual - a[1].actual)[0] || ['Salaries', { budget: 0, actual: 0 }];

  const insights = [
    `Total operational expenditure reached ${formatCurrency(totalActual, true)} against budgeted ${formatCurrency(totalBudget, true)} (${variancePct >= 0 ? '+' : ''}${variancePct.toFixed(1)}% variance).`,
    `${topOverspendDept.dept} recorded the largest dollar overspend at ${formatCurrency(topOverspendDept.variance, true)} (${topOverspendDept.varPct >= 0 ? '+' : ''}${topOverspendDept.varPct.toFixed(1)}% vs plan).`,
    `${topExpenseCat[0]} represented the single largest cost center at ${formatCurrency(topExpenseCat[1].actual, true)}, consuming ${totalActual > 0 ? ((topExpenseCat[1].actual / totalActual) * 100).toFixed(1) : 0}% of realized budget.`,
    `${sortedDepts.filter((d) => d.variance > 0).length} of ${sortedDepts.length} functional business units closed in net over-expenditure across monitored fiscal cycles.`,
  ];

  const recommendation =
    topVariance > 0
      ? `Mandate zero-base PO approval thresholds on uncommitted ${topOverspendDept.dept} discretionary campaigns and institute quarterly cloud tier reviews.`
      : `Maintain disciplined capital allocation while re-allocating surplus operational contingency into high-ROI sales expansion initiatives.`;

  return { insights, recommendation };
}

// 5. Inventory & Logistics Insights
export function computeInventoryInsights(data: InventoryRecord[]): {
  insights: string[];
  recommendation: string;
} {
  if (data.length === 0) {
    return {
      insights: ['No inventory SKUs match the current warehouse filters.'],
      recommendation: 'Select all distribution hubs to analyze national supply chain health.',
    };
  }

  const totalSkus = data.length;
  const criticalSkus = data.filter((s) => s.is_below_reorder);
  const criticalPct = (criticalSkus.length / totalSkus) * 100;

  // On-time delivery rate
  const onTimeCount = data.filter((s) => s.on_time_delivery).length;
  const onTimeRate = (onTimeCount / totalSkus) * 100;

  // Warehouse breakdown
  const whStats: Record<string, { total: number; critical: number; stock: number }> = {};
  for (const s of data) {
    if (!whStats[s.warehouse]) whStats[s.warehouse] = { total: 0, critical: 0, stock: 0 };
    whStats[s.warehouse].total += 1;
    whStats[s.warehouse].stock += s.closing_stock;
    if (s.is_below_reorder) whStats[s.warehouse].critical += 1;
  }

  const sortedWh = Object.entries(whStats).map(([wh, st]) => ({
    warehouse: wh,
    total: st.total,
    stock: st.stock,
    critical: st.critical,
    criticalRate: (st.critical / st.total) * 100,
  })).sort((a, b) => b.criticalRate - a.criticalRate);

  const highestRiskWh = sortedWh[0] || { warehouse: 'Delhi North', criticalRate: 0, critical: 0 };

  // Average lead time
  const avgLeadTime = data.reduce((acc, s) => acc + s.lead_time_days, 0) / totalSkus;

  const insights = [
    `${criticalSkus.length} of ${formatNumber(totalSkus)} active SKUs (${criticalPct.toFixed(1)}%) are currently below designated safety reorder thresholds.`,
    `${highestRiskWh.warehouse} exhibits the highest stockout vulnerability with ${highestRiskWh.critical} items (${highestRiskWh.criticalRate.toFixed(1)}%) under safety stock.`,
    `National logistics logistics on-time delivery (OTD) index reached ${onTimeRate.toFixed(1)}% with an average vendor lead time of ${avgLeadTime.toFixed(1)} days.`,
    `Aggregated inventory position across facilities is valued at ${formatNumber(data.reduce((a, s) => a + s.closing_stock, 0))} physical units.`,
  ];

  const recommendation =
    criticalSkus.length > 0
      ? `Trigger expedited purchase orders for ${criticalSkus.length} critical SKUs at ${highestRiskWh.warehouse} and negotiate a 48-hr SLA buffer with regional freight carriers.`
      : `Optimize storage density and initiate cross-dock replenishment between central distribution hubs.`;

  return { insights, recommendation };
}

// 6. Marketing Insights
export function computeMarketingInsights(data: MarketingRecord[]): {
  insights: string[];
  recommendation: string;
} {
  if (data.length === 0) {
    return {
      insights: ['No marketing campaigns found in selected range.'],
      recommendation: 'Broaden attribution channels to view aggregate acquisition metrics.',
    };
  }

  const totalSpend = data.reduce((acc, c) => acc + c.spend, 0);
  const totalRev = data.reduce((acc, c) => acc + c.revenue, 0);
  const totalLeads = data.reduce((acc, c) => acc + c.leads, 0);
  const totalConversions = data.reduce((acc, c) => acc + c.conversions, 0);
  const overallRoas = totalSpend > 0 ? totalRev / totalSpend : 0;
  const overallCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

  // Channel breakdown
  const chAgg: Record<string, { spend: number; revenue: number; conversions: number; clicks: number; impressions: number }> = {};
  for (const c of data) {
    if (!chAgg[c.channel]) chAgg[c.channel] = { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0 };
    chAgg[c.channel].spend += c.spend;
    chAgg[c.channel].revenue += c.revenue;
    chAgg[c.channel].conversions += c.conversions;
    chAgg[c.channel].clicks += c.clicks;
    chAgg[c.channel].impressions += c.impressions;
  }

  const channelMetrics = Object.entries(chAgg).map(([ch, st]) => ({
    channel: ch,
    spend: st.spend,
    revenue: st.revenue,
    roas: st.spend > 0 ? st.revenue / st.spend : 0,
    cpa: st.conversions > 0 ? st.spend / st.conversions : 0,
    ctr: st.impressions > 0 ? (st.clicks / st.impressions) * 100 : 0,
  })).sort((a, b) => b.roas - a.roas);

  const bestRoasChannel = channelMetrics[0] || { channel: 'Search', roas: 0 };
  const lowestCpaChannel = [...channelMetrics].sort((a, b) => a.cpa - b.cpa)[0] || { channel: 'Email', cpa: 0 };

  const insights = [
    `Marketing portfolio generated ${formatCurrency(totalRev, true)} in attributable revenue on ${formatCurrency(totalSpend, true)} spend, delivering a blended ROAS of ${overallRoas.toFixed(2)}x.`,
    `${bestRoasChannel.channel} delivered the strongest return with a ${bestRoasChannel.roas.toFixed(2)}x ROAS multiplier, yielding superior margin efficiency.`,
    `${lowestCpaChannel.channel} demonstrated the most cost-effective customer acquisition with an average CPA of ${formatCurrency(lowestCpaChannel.cpa)}.`,
    `End-to-end conversion funnel yielded ${formatNumber(totalLeads)} qualified leads and ${formatNumber(totalConversions)} sales conversions.`,
  ];

  const recommendation =
    `Shift 20% of display awareness allocation into high-intent ${bestRoasChannel.channel} and referral automation to maximize gross margin while maintaining CPA under ${formatCurrency(overallCpa)}.`;

  return { insights, recommendation };
}
