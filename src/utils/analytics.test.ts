import test from 'node:test';
import assert from 'node:assert/strict';
import { SeededRandom } from './seededRandom';
import { formatCurrency, formatNumber, formatPercent } from './formatters';
import {
  generateSalesData,
  generateSupportData,
  generateHrData,
  generateFinanceData,
  generateInventoryData,
  generateMarketingData,
} from '../data/datasets';
import { generateMessyData, cleanRawRows } from './cleaningEngine';
import { sqlShowcaseQueries } from '../data/sqlQueries';

test('SeededRandom produces identical repeatable sequences', () => {
  const rng1 = new SeededRandom(999);
  const rng2 = new SeededRandom(999);

  const seq1 = [rng1.next(), rng1.nextInt(1, 100), rng1.nextFloat(5, 50)];
  const seq2 = [rng2.next(), rng2.nextInt(1, 100), rng2.nextFloat(5, 50)];

  assert.deepEqual(seq1, seq2);
});

test('Formatters handle numbers, percentages, and US Dollars accurately', () => {
  assert.equal(formatCurrency(125000), '$125,000');
  assert.equal(formatCurrency(1850000, true), '$1.9M');
  assert.equal(formatCurrency(25000000, true), '$25.0M');
  assert.equal(formatNumber(1540), '1,540');
  assert.equal(formatPercent(14.24), '14.2%');
  assert.equal(formatPercent(8.5, true), '+8.5%');
  assert.equal(formatPercent(-4.1, true), '-4.1%');
});

test('Sales dataset contains realistic volume, 24 months, and positive revenue', () => {
  const sales = generateSalesData();
  assert.ok(sales.length >= 350, `Expected >= 350 sales rows, got ${sales.length}`);
  
  const months = new Set(sales.map((s) => s.month));
  assert.ok(months.size >= 24, `Expected at least 24 distinct months, got ${months.size}`);
  
  const totalRev = sales.reduce((acc, s) => acc + s.revenue, 0);
  assert.ok(totalRev > 10000000, 'Total revenue should be substantial');

  // Verify outliers exist
  const highUnits = sales.filter((s) => s.units >= 25);
  assert.ok(highUnits.length > 0, 'Should include high-volume enterprise deal outliers');
});

test('Support dataset exhibits intentional Billing SLA breach dip', () => {
  const support = generateSupportData();
  assert.ok(support.length >= 350, `Expected >= 350 tickets, got ${support.length}`);

  // In Jul-Aug 2025, Billing category volume should surge and SLA compliance dip
  const incidentTickets = support.filter(
    (t) => (t.month === '2025-07' || t.month === '2025-08') && t.category === 'Billing'
  );
  assert.ok(incidentTickets.length > 20, 'Billing tickets should spike during incident period');

  const incidentBreaches = incidentTickets.filter((t) => !t.sla_met);
  const incidentBreachRate = (incidentBreaches.length / incidentTickets.length) * 100;
  assert.ok(incidentBreachRate >= 40, `Incident SLA breach rate should be high (got ${incidentBreachRate}%)`);
});

test('HR dataset reflects attrition concentrated in Customer Support and early tenure', () => {
  const hr = generateHrData();
  assert.ok(hr.length >= 350, `Expected >= 350 HR records, got ${hr.length}`);

  const exits = hr.filter((e) => !e.is_active);
  assert.ok(exits.length > 30, 'Should have sufficient departed employees');

  // Concentration in first 6 months
  const earlyExits = exits.filter((e) => e.tenure_months <= 6);
  assert.ok(earlyExits.length > 0, 'Exits should cluster under 6 months tenure');

  // Customer Support should have elevated turnover
  const csExits = exits.filter((e) => e.department === 'Customer Support');
  assert.ok(csExits.length > 0, 'Customer Support should experience attrition');
});

test('Finance dataset identifies departments with overspending', () => {
  const finance = generateFinanceData();
  assert.ok(finance.length >= 250, `Expected >= 250 finance records, got ${finance.length}`);

  const overspendRows = finance.filter((f) => f.variance > 0);
  assert.ok(overspendRows.length > 50, 'Should contain overspending rows');

  // Marketing overspends consistently
  const mktOver = finance.filter((f) => f.department === 'Marketing' && f.variance > 0);
  assert.ok(mktOver.length > 10, 'Marketing should have frequent overspending months');
});

test('Inventory dataset identifies SKUs below reorder level', () => {
  const inventory = generateInventoryData();
  assert.ok(inventory.length >= 300, `Expected >= 300 SKUs, got ${inventory.length}`);

  const belowReorder = inventory.filter((i) => i.is_below_reorder);
  assert.ok(belowReorder.length > 20, 'Should identify critical SKUs below reorder level');

  // Verify consistency: is_below_reorder true iff closing_stock <= reorder_level
  for (const item of inventory) {
    assert.equal(item.is_below_reorder, item.closing_stock <= item.reorder_level);
  }
});

test('Marketing dataset has consistent funnel metrics and ROAS calculation', () => {
  const marketing = generateMarketingData();
  assert.ok(marketing.length >= 200, `Expected >= 200 marketing campaigns, got ${marketing.length}`);

  for (const m of marketing) {
    assert.ok(m.clicks <= m.impressions, 'Clicks cannot exceed impressions');
    assert.ok(m.leads <= m.clicks, 'Leads cannot exceed clicks');
    assert.ok(m.conversions <= m.leads, 'Conversions cannot exceed leads');
    assert.ok(m.roas >= 0, 'ROAS must be non-negative');
  }
});

test('Data Cleaning engine removes duplicates, fixes whitespace and standardizes formats', () => {
  const raw = generateMessyData();
  const result = cleanRawRows(raw);

  assert.ok(result.stats.duplicatesRemoved > 0, 'Duplicates should be identified and removed');
  assert.ok(result.stats.whitespacesTrimmed > 0, 'Whitespaces should be trimmed');
  assert.ok(result.stats.casingsNormalized > 0, 'Casing should be normalized');
  assert.ok(result.stats.datesStandardized > 0, 'Dates should be converted to ISO format');
  assert.ok(result.stats.blanksImputed > 0, 'Missing values should be imputed');

  // Check that all cleaned rows have valid ISO dates YYYY-MM-DD
  for (const row of result.finalRows) {
    assert.match(row.order_date, /^\d{4}-\d{2}-\d{2}$/, 'Date must be standard ISO format');
    assert.ok(row.customer_name.trim() === row.customer_name, 'No leading/trailing space in name');
    assert.ok(typeof row.revenue === 'number', 'Revenue must be numeric');
    assert.ok(row.region.length > 0, 'Region must not be blank');
  }
});

test('SQL Queries execute and return tabular structures without exceptions', () => {
  const sales = generateSalesData();
  const support = generateSupportData();
  const hr = generateHrData();
  const finance = generateFinanceData();
  const inventory = generateInventoryData();
  const marketing = generateMarketingData();

  for (const q of sqlShowcaseQueries) {
    const res = q.execute({ sales, support, hr, finance, inventory, marketing });
    assert.ok(res.columns.length > 0, `Query ${q.id} should output columns`);
    assert.ok(res.rows.length > 0, `Query ${q.id} should output rows`);
  }
});
