import {
  FinanceRecord,
  HrRecord,
  InventoryRecord,
  MarketingRecord,
  SalesRecord,
  SupportTicket,
} from '../types';
import { SeededRandom } from '../utils/seededRandom';

// Module-level caches so datasets are generated once deterministically
let cachedSales: SalesRecord[] | null = null;
let cachedSupport: SupportTicket[] | null = null;
let cachedHr: HrRecord[] | null = null;
let cachedFinance: FinanceRecord[] | null = null;
let cachedInventory: InventoryRecord[] | null = null;
let cachedMarketing: MarketingRecord[] | null = null;

// Helper to format ISO date string
function toIsoDate(year: number, month: number, day: number): string {
  const m = month < 10 ? `0${month}` : `${month}`;
  const d = day < 10 ? `0${day}` : `${day}`;
  return `${year}-${m}-${d}`;
}

// 1. SALES DATASET (~550 records over 24 months: 2024-01 to 2025-12)
export function generateSalesData(): SalesRecord[] {
  if (cachedSales) return cachedSales;

  const rng = new SeededRandom(101);
  const records: SalesRecord[] = [];

  const regions: SalesRecord['region'][] = ['North', 'South', 'East', 'West'];
  const repsByRegion: Record<SalesRecord['region'], string[]> = {
    North: ['Rajesh Kumar', 'Deepak Verma', 'Neha Joshi'],
    South: ['Karthik Raman', 'Ananya Iyer', 'Suresh Babu'],
    East: ['Subhash Das', 'Pooja Banerjee', 'Rohan Sen'],
    West: ['Priya Sharma', 'Amit Patel', 'Sneha Rao'],
  };

  const productCatalog: {
    category: SalesRecord['product_category'];
    products: { name: string; basePrice: number }[];
  }[] = [
    {
      category: 'Electronics',
      products: [
        { name: '4K Pro Display Monitor', basePrice: 28500 },
        { name: 'Wireless Ergonomic Headset', basePrice: 4200 },
        { name: 'Thunderbolt 4 Docking Station', basePrice: 14500 },
        { name: 'Smart Video Conference Cam', basePrice: 19800 },
      ],
    },
    {
      category: 'Office Supplies',
      products: [
        { name: 'Executive Acoustic Desk Partition', basePrice: 6500 },
        { name: 'Premium Heavy Duty Shredder', basePrice: 9200 },
        { name: 'Ergonomic Footrest & Mat', basePrice: 2400 },
        { name: 'Digital Whiteboard Stylus Kit', basePrice: 3800 },
      ],
    },
    {
      category: 'Furniture',
      products: [
        { name: 'AeroMesh High-Back Ergonomic Chair', basePrice: 18500 },
        { name: 'Motorized Dual-Motor Standing Desk', basePrice: 34000 },
        { name: 'Modular Soundproof Work Pod', basePrice: 85000 },
        { name: 'Under-Desk Mobile File Pedestal', basePrice: 7200 },
      ],
    },
    {
      category: 'Software Licenses',
      products: [
        { name: 'BI Enterprise Annual Seat', basePrice: 45000 },
        { name: 'Cloud Security Compliance Suite', basePrice: 62000 },
        { name: 'Automated ETL Workflow Builder', basePrice: 38000 },
        { name: 'Team Productivity Analytics Pack', basePrice: 24000 },
      ],
    },
    {
      category: 'Hardware',
      products: [
        { name: 'Enterprise SSD Raid Enclosure', basePrice: 48000 },
        { name: 'Edge Gateway IoT Hub', basePrice: 29000 },
        { name: 'Rackmount Power Distribution Unit', basePrice: 16500 },
        { name: 'Gigabit Managed Layer 3 Switch', basePrice: 32500 },
      ],
    },
  ];

  let orderSeq = 1001;

  for (let year = 2024; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      // Seasonal factor: Diwali/Q4 surge in Oct/Nov/Dec (month 10-12)
      let seasonMultiplier = 1.0;
      if (month === 10 || month === 11) seasonMultiplier = 1.45;
      if (month === 12) seasonMultiplier = 1.3;
      if (month === 3) seasonMultiplier = 1.25; // Fiscal year end push in India

      // YoY trend: 2025 is ~15% higher than 2024
      const yearFactor = year === 2025 ? 1.18 : 1.0;

      // 20 to 26 transactions per month
      const count = Math.round(rng.nextInt(20, 26) * (seasonMultiplier * 0.8 + 0.2));

      for (let i = 0; i < count; i++) {
        const day = rng.nextInt(1, 28);
        const region = rng.choice(regions);
        const rep = rng.choice(repsByRegion[region]);
        const catObj = rng.choice(productCatalog);
        const prodObj = rng.choice(catObj.products);

        // Outlier detection: 3% of orders are giant enterprise bulk orders
        const isOutlier = rng.next() < 0.035;
        const units = isOutlier ? rng.nextInt(25, 60) : rng.nextInt(1, 12);
        
        // Price with minor random variance +/- 4%
        const unit_price = Math.round(prodObj.basePrice * (1 + rng.nextFloat(-0.04, 0.04, 3)));
        
        // Discount
        const discount_pct = rng.weightedChoice([0, 5, 8, 10, 15, 20], [30, 25, 20, 15, 7, 3]);
        const gross = units * unit_price;
        const revenue = Math.round(gross * (1 - discount_pct / 100));

        // Target assigned to rep for this deal
        // West region consistently has higher targets and high performance
        const targetMultiplier = region === 'West' ? 0.92 : 1.04;
        const target = Math.round(revenue * targetMultiplier * (1 + rng.nextFloat(-0.15, 0.15, 2)));

        records.push({
          order_id: `SO-${year}-${orderSeq++}`,
          date: toIsoDate(year, month, day),
          month: `${year}-${month < 10 ? '0' + month : month}`,
          region,
          sales_rep: rep,
          product_category: catObj.category,
          product: prodObj.name,
          units,
          unit_price,
          revenue,
          discount_pct,
          target,
          achieved_target: revenue >= target,
        });
      }
    }
  }

  // Sort by date ascending
  records.sort((a, b) => a.date.localeCompare(b.date));
  cachedSales = records;
  return records;
}

// 2. SUPPORT TICKETS DATASET (~520 records)
// Key pattern: In Jul-Aug 2025, Billing category experiences massive volume spike & SLA dip due to payment migration
export function generateSupportData(): SupportTicket[] {
  if (cachedSupport) return cachedSupport;

  const rng = new SeededRandom(202);
  const records: SupportTicket[] = [];

  const agentsByTeam: Record<SupportTicket['team'], string[]> = {
    'Tier 1': ['Rahul Sharma', 'Sunita Rao', 'Kavita Nair', 'Manish Gupta'],
    'Tier 2': ['Arjun Mehta', 'Farhan Akhtar', 'Divya Balan'],
    'Escalations': ['Siddharth Roy', 'Meera Krishnan'],
    'Billing Operations': ['Aakash Saxena', 'Pooja Hegde', 'Naveen Reddy'],
  };

  const categories: SupportTicket['category'][] = ['Billing', 'Login', 'Delivery', 'Product', 'Other'];
  const channels: SupportTicket['channel'][] = ['Email', 'Chat', 'Phone'];

  let ticketSeq = 10001;

  for (let year = 2024; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      const isIncidentWindow = year === 2025 && (month === 7 || month === 8);
      const ticketCount = isIncidentWindow ? rng.nextInt(38, 48) : rng.nextInt(18, 24);

      for (let i = 0; i < ticketCount; i++) {
        const day = rng.nextInt(1, 28);
        const dateStr = toIsoDate(year, month, day);
        const monthStr = `${year}-${month < 10 ? '0' + month : month}`;

        // Category selection: heavily skewed to Billing in Jul-Aug 2025
        let category: SupportTicket['category'];
        if (isIncidentWindow) {
          category = rng.weightedChoice(categories, [65, 10, 10, 10, 5]);
        } else {
          category = rng.weightedChoice(categories, [20, 28, 22, 20, 10]);
        }

        let team: SupportTicket['team'] = 'Tier 1';
        if (category === 'Billing') team = 'Billing Operations';
        else if (category === 'Product') team = rng.choice(['Tier 2', 'Tier 1']);
        else if (category === 'Login') team = 'Tier 1';

        const agent = rng.choice(agentsByTeam[team]);
        const channel = rng.choice(channels);

        const priority: SupportTicket['priority'] = rng.weightedChoice(
          ['Low', 'Medium', 'High', 'Urgent'],
          category === 'Billing' ? [10, 25, 45, 20] : [30, 45, 20, 5]
        );

        // First response hours
        let first_response_hrs = rng.nextFloat(0.4, 4.2, 1);
        let resolution_hrs = rng.nextFloat(2.5, 36.0, 1);

        // If Billing during incident window, dramatic latency increase
        if (isIncidentWindow && category === 'Billing') {
          first_response_hrs = rng.nextFloat(3.5, 14.0, 1);
          resolution_hrs = rng.nextFloat(28.0, 84.0, 1);
        }

        // SLA threshold: standard is 24 hrs for Medium/High, 4 hrs for Urgent
        let sla_met = true;
        if (priority === 'Urgent') {
          sla_met = resolution_hrs <= 6.0;
        } else if (priority === 'High') {
          sla_met = resolution_hrs <= 16.0;
        } else {
          sla_met = resolution_hrs <= 28.0;
        }

        // Force dip in SLA for billing during incident
        if (isIncidentWindow && category === 'Billing') {
          sla_met = rng.bool(0.42); // 58% SLA failure
        }

        // CSAT rating 1 to 5
        let csat = sla_met ? rng.weightedChoice([3, 4, 5], [15, 40, 45]) : rng.weightedChoice([1, 2, 3], [50, 35, 15]);
        if (isIncidentWindow && category === 'Billing') {
          csat = rng.weightedChoice([1, 2, 3, 4], [45, 35, 15, 5]);
        }

        records.push({
          ticket_id: `TCK-${ticketSeq++}`,
          created_date: dateStr,
          month: monthStr,
          category,
          priority,
          agent,
          team,
          channel,
          first_response_hrs,
          resolution_hrs,
          sla_met,
          csat,
        });
      }
    }
  }

  records.sort((a, b) => a.created_date.localeCompare(b.created_date));
  cachedSupport = records;
  return records;
}

// 3. HR ATTRITION DATASET (~420 employees)
// Pattern: Customer Support & Sales experience elevated attrition, heavily clustered under 6 months tenure
export function generateHrData(): HrRecord[] {
  if (cachedHr) return cachedHr;

  const rng = new SeededRandom(303);
  const records: HrRecord[] = [];

  const departments: HrRecord['department'][] = [
    'Engineering',
    'Sales',
    'Marketing',
    'Customer Support',
    'HR & Ops',
    'Finance',
  ];

  const levels: HrRecord['job_level'][] = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager'];
  const locations: HrRecord['location'][] = ['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Remote'];
  const exitReasons: NonNullable<HrRecord['exit_reason']>[] = [
    'Better Opportunity',
    'Compensation',
    'Work-Life Balance',
    'Relocation',
    'Management',
  ];

  for (let i = 1; i <= 420; i++) {
    const dept = rng.weightedChoice(departments, [25, 25, 15, 20, 8, 7]);
    const job_level = rng.weightedChoice(levels, [35, 35, 18, 8, 4]);
    const location = rng.choice(locations);
    const gender = rng.weightedChoice<HrRecord['gender']>(['Male', 'Female', 'Non-Binary'], [52, 45, 3]);

    // Salary band based on level
    let salary_band: HrRecord['salary_band'] = 'Entry';
    if (job_level === 'Junior') salary_band = 'Entry';
    else if (job_level === 'Mid') salary_band = 'Mid-Tier';
    else if (job_level === 'Senior' || job_level === 'Lead') salary_band = 'Senior';
    else salary_band = 'Executive';

    // Random hire date between 2022-01 and 2025-06
    const hireYear = rng.nextInt(2022, 2025);
    const hireMonth = rng.nextInt(1, 12);
    const hireDay = rng.nextInt(1, 28);
    const hire_date = toIsoDate(hireYear, hireMonth, hireDay);

    // Attrition probability: Customer Support is highest (~34%), Sales (~26%), Eng (~14%), Finance (~8%)
    let churnProbability = 0.15;
    if (dept === 'Customer Support') churnProbability = 0.35;
    if (dept === 'Sales') churnProbability = 0.28;
    if (dept === 'Finance') churnProbability = 0.09;

    const hasExited = rng.bool(churnProbability);

    let exit_date: string | null = null;
    let exit_reason: HrRecord['exit_reason'] = null;
    let tenure_months = 0;

    if (hasExited) {
      // Prompt requirement: "attrition higher in one department and concentrated in the first 6 months"
      if (dept === 'Customer Support' || dept === 'Sales') {
        // 60% chance tenure is 1 to 6 months
        if (rng.bool(0.62)) {
          tenure_months = rng.nextInt(1, 6);
        } else {
          tenure_months = rng.nextInt(7, 24);
        }
      } else {
        tenure_months = rng.nextInt(4, 34);
      }

      exit_reason = rng.choice(exitReasons);
      const exitD = new Date(hire_date);
      exitD.setMonth(exitD.getMonth() + tenure_months);
      exit_date = exitD.toISOString().slice(0, 10);
    } else {
      // Active employee tenure measured up to late 2025
      const refDate = new Date('2025-12-31');
      const hireD = new Date(hire_date);
      const diffMonths = Math.max(1, Math.round((refDate.getTime() - hireD.getTime()) / (1000 * 60 * 60 * 24 * 30.4)));
      tenure_months = diffMonths;
    }

    records.push({
      employee_id: `EMP-${1000 + i}`,
      department: dept,
      job_level,
      hire_date,
      exit_date,
      is_active: !hasExited,
      exit_reason,
      tenure_months,
      salary_band,
      gender,
      location,
    });
  }

  records.sort((a, b) => a.hire_date.localeCompare(b.hire_date));
  cachedHr = records;
  return records;
}

// 4. FINANCE BUDGET VS ACTUAL DATASET (~360 records over 24 months)
// Pattern: Marketing and Engineering consistently overspend their budgets
export function generateFinanceData(): FinanceRecord[] {
  if (cachedFinance) return cachedFinance;

  const rng = new SeededRandom(404);
  const records: FinanceRecord[] = [];

  const departments: FinanceRecord['department'][] = [
    'Marketing',
    'Engineering',
    'Sales',
    'Operations',
    'Human Resources',
    'IT & Security',
  ];

  const categories: FinanceRecord['expense_category'][] = [
    'Salaries',
    'Marketing',
    'Software',
    'Travel',
    'Operations',
  ];

  const vendorsByCategory: Record<FinanceRecord['expense_category'], string[]> = {
    Salaries: ['Direct Payroll Bank', 'Staffing Solutions Ltd', 'Consulting Partners'],
    Marketing: ['Google Ads India', 'Meta Business', 'LinkedIn Marketing', 'AdAgency Omnicom'],
    Software: ['Amazon Web Services', 'Microsoft Azure', 'Salesforce India', 'Snowflake Data'],
    Travel: ['Corporate Travel Concierge', 'MakeMyTrip Business', 'Taj Group Hotels'],
    Operations: ['CBRE Facility Mgmt', 'BlueDart Express Logistics', 'WeWork Co-Working'],
  };

  let idSeq = 1;

  for (let year = 2024; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${year}-${month < 10 ? '0' + month : month}`;

      for (const dept of departments) {
        // Each department has 2-3 main budget lines each month
        const catSubset = categories.filter((c) => {
          if (dept === 'Marketing' && c === 'Marketing') return true;
          if (dept === 'Engineering' && c === 'Software') return true;
          if (c === 'Salaries') return true;
          return rng.bool(0.4);
        });

        for (const cat of catSubset) {
          let baseBudget = 450000;
          if (cat === 'Salaries') baseBudget = 1800000;
          if (cat === 'Software') baseBudget = 650000;
          if (cat === 'Marketing') baseBudget = 900000;
          if (cat === 'Travel') baseBudget = 220000;
          if (cat === 'Operations') baseBudget = 380000;

          // Department scaling
          if (dept === 'Engineering') baseBudget *= 1.4;
          if (dept === 'Sales') baseBudget *= 1.1;

          // Add slight monthly variance to budget
          const budget = Math.round(baseBudget * (1 + rng.nextFloat(-0.06, 0.06, 2)));

          // Overspending logic:
          // Marketing overspends in 18 of 24 months (+8% to +22%)
          // Engineering overspends on Software/Cloud consistently (+12% to +26%)
          // HR and Operations usually stay under budget (-4% to -10%)
          let variancePct = rng.nextFloat(-8, 8, 1);
          if (dept === 'Marketing') {
            variancePct = rng.nextFloat(4, 22, 1);
          } else if (dept === 'Engineering' && cat === 'Software') {
            variancePct = rng.nextFloat(8, 26, 1);
          } else if (dept === 'Human Resources') {
            variancePct = rng.nextFloat(-14, 2, 1);
          }

          const actual = Math.round(budget * (1 + variancePct / 100));
          const variance = actual - budget;

          records.push({
            id: `FIN-${idSeq++}`,
            month: monthStr,
            department: dept,
            expense_category: cat,
            budget,
            actual,
            variance,
            variance_pct: parseFloat(variancePct.toFixed(1)),
            vendor: rng.choice(vendorsByCategory[cat]),
          });
        }
      }
    }
  }

  cachedFinance = records;
  return records;
}

// 5. INVENTORY & LOGISTICS DATASET (~380 records)
// Pattern: Multi-warehouse SKU balances, flagged reorder points, lead time tracking
export function generateInventoryData(): InventoryRecord[] {
  if (cachedInventory) return cachedInventory;

  const rng = new SeededRandom(505);
  const records: InventoryRecord[] = [];

  const categories: InventoryRecord['category'][] = [
    'Electronics',
    'Fast Moving',
    'Packaging',
    'Apparel',
    'Industrial',
  ];

  const warehouses: InventoryRecord['warehouse'][] = [
    'Mumbai Central',
    'Delhi North',
    'Bengaluru South',
    'Kolkata East',
    'Ahmedabad Hub',
  ];

  const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur'];

  const productsByCategory: Record<InventoryRecord['category'], string[]> = {
    Electronics: ['Barcode Scanner Pro', 'Thermal Receipt Printer', 'IoT Pallet Tracker', 'Handheld Terminal Zebra'],
    'Fast Moving': ['A4 Copier Paper 75GSM', 'Self-Adhesive Labels Roll', 'Laser Toner Black', 'High-Speed Shipping Envelopes'],
    Packaging: ['Corrugated Heavy Box 5-Ply', 'Bubble Wrap Industrial 100M', 'Biodegradable Void Filler', 'Reinforced Strapping Tape'],
    Apparel: ['Safety Reflective Vest High-Vis', 'Steel-Toe Warehouse Boots', 'Anti-Static Grip Gloves', 'Ergonomic Back Support Belt'],
    Industrial: ['Hydraulic Pallet Truck 2.5T', 'Heavy Duty Steel Strapping Kit', 'Industrial Shrink Wrap Machine', 'Dock Leveler Rubber Bumper'],
  };

  let skuSeq = 101;

  for (let i = 0; i < 380; i++) {
    const category = rng.choice(categories);
    const productName = rng.choice(productsByCategory[category]);
    const warehouse = rng.choice(warehouses);
    const sku = `SKU-${category.slice(0, 3).toUpperCase()}-${skuSeq++}`;

    const reorder_level = rng.nextInt(80, 450);
    const lead_time_days = rng.nextInt(3, 21);

    // Opening stock & flow
    const opening_stock = rng.nextInt(120, 1500);
    const received = rng.nextInt(20, 600);
    const dispatched = rng.nextInt(30, 750);
    const closing_stock = Math.max(0, opening_stock + received - dispatched);

    const is_below_reorder = closing_stock <= reorder_level;
    const on_time_delivery = rng.bool(0.88); // 88% overall on-time rate
    const delivery_city = rng.choice(cities);

    records.push({
      sku,
      product_name: productName,
      category,
      warehouse,
      opening_stock,
      received,
      dispatched,
      closing_stock,
      reorder_level,
      lead_time_days,
      on_time_delivery,
      delivery_city,
      is_below_reorder,
    });
  }

  cachedInventory = records;
  return records;
}

// 6. MARKETING CAMPAIGNS DATASET (~320 records)
// Pattern: Multi-channel ROI, complete funnel impressions -> clicks -> leads -> conversions
export function generateMarketingData(): MarketingRecord[] {
  if (cachedMarketing) return cachedMarketing;

  const rng = new SeededRandom(606);
  const records: MarketingRecord[] = [];

  const channels: MarketingRecord['channel'][] = ['Email', 'Social', 'Search', 'Display', 'Referral'];

  const campaignThemes = [
    'Q1 FY25 Growth Kickoff',
    'Mid-Year Cloud Summit',
    'Festive Flash Discount',
    'Enterprise ROI Webinar',
    'Whitepaper Download Promo',
    'Competitor Alternative Campaign',
    'Product Launch V2.0',
    'Retargeting Inactive Accounts',
    'B2B Industry Survey Leadgen',
    'Refer-and-Earn Program',
  ];

  let campSeq = 501;

  for (let year = 2024; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${year}-${month < 10 ? '0' + month : month}`;
      const count = rng.nextInt(12, 16);

      for (let i = 0; i < count; i++) {
        const channel = rng.choice(channels);
        const theme = rng.choice(campaignThemes);
        const day = rng.nextInt(1, 28);
        const start_date = toIsoDate(year, month, day);

        // Budget / spend by channel
        let baseSpend = 35000;
        if (channel === 'Search') baseSpend = 75000;
        if (channel === 'Social') baseSpend = 55000;
        if (channel === 'Display') baseSpend = 42000;
        if (channel === 'Email') baseSpend = 16000;
        if (channel === 'Referral') baseSpend = 24000;

        const spend = Math.round(baseSpend * (1 + rng.nextFloat(-0.25, 0.35, 2)));

        // Funnel generation:
        // Impressions
        const cpm = channel === 'Display' ? rng.nextInt(80, 160) : rng.nextInt(250, 750);
        const impressions = Math.round((spend / cpm) * 1000);

        // Clicks (CTR varies by channel: Search highest ~3.8%, Display lowest ~0.6%)
        let targetCtr = 2.2;
        if (channel === 'Search') targetCtr = rng.nextFloat(3.2, 5.4, 2);
        else if (channel === 'Email') targetCtr = rng.nextFloat(2.8, 4.6, 2);
        else if (channel === 'Social') targetCtr = rng.nextFloat(1.4, 2.8, 2);
        else if (channel === 'Referral') targetCtr = rng.nextFloat(4.0, 7.5, 2);
        else if (channel === 'Display') targetCtr = rng.nextFloat(0.5, 1.2, 2);

        const clicks = Math.max(12, Math.round(impressions * (targetCtr / 100)));
        const ctr = parseFloat(((clicks / impressions) * 100).toFixed(2));

        // Leads (lead capture rate from clicks: ~8% to ~22%)
        const leadRate = rng.nextFloat(0.08, 0.22, 3);
        const leads = Math.max(3, Math.round(clicks * leadRate));
        const cpl = Math.round(spend / leads);

        // Conversions (lead-to-close rate: ~10% to ~25%)
        const convRateRaw = rng.nextFloat(0.10, 0.26, 3);
        const conversions = Math.max(1, Math.round(leads * convRateRaw));
        const conv_rate = parseFloat(((conversions / clicks) * 100).toFixed(2));
        const cpa = Math.round(spend / conversions);

        // Average Order Value / Revenue
        // Search & Referral generate highest revenue per conversion
        let aov = 38000;
        if (channel === 'Search') aov = 62000;
        if (channel === 'Referral') aov = 74000;
        if (channel === 'Social') aov = 32000;
        if (channel === 'Display') aov = 26000;

        const revenue = Math.round(conversions * aov * (1 + rng.nextFloat(-0.15, 0.2, 2)));
        const roas = parseFloat((revenue / spend).toFixed(2));

        records.push({
          campaign_id: `CMP-${campSeq++}`,
          campaign_name: `${theme} [${channel}]`,
          channel,
          start_date,
          month: monthStr,
          spend,
          impressions,
          clicks,
          leads,
          conversions,
          revenue,
          ctr,
          cpl,
          cpa,
          conv_rate,
          roas,
        });
      }
    }
  }

  records.sort((a, b) => a.start_date.localeCompare(b.start_date));
  cachedMarketing = records;
  return records;
}
