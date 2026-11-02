export interface RawMessyRow {
  id: string;
  order_id: string;
  customer_name: string;
  region: string;
  order_date: string;
  category: string;
  revenue: string;
  payment_status: string;
  hasIssues: {
    whitespace?: boolean;
    casing?: boolean;
    dateFormat?: boolean;
    missing?: boolean;
    duplicate?: boolean;
  };
}

export interface CleanedRow {
  id: string;
  order_id: string;
  customer_name: string;
  region: string;
  order_date: string;
  category: string;
  revenue: number;
  payment_status: string;
}

export interface CleaningStepInfo {
  stepNumber: number;
  name: string;
  description: string;
  toolUsed: string; // e.g., "Power Query: Text.Trim", "SQL: TRIM()", "Excel: TRIM"
  affectedCount: number;
}

export interface CleaningRunResult {
  initialRows: RawMessyRow[];
  finalRows: CleanedRow[];
  steps: CleaningStepInfo[];
  stats: {
    initialCount: number;
    cleanedCount: number;
    duplicatesRemoved: number;
    whitespacesTrimmed: number;
    casingsNormalized: number;
    datesStandardized: number;
    blanksImputed: number;
  };
}

export function generateMessyData(): RawMessyRow[] {
  return [
    {
      id: '1',
      order_id: 'ORD-901',
      customer_name: '   Tata Consultancy Services   ',
      region: 'west',
      order_date: '14/04/2025',
      category: 'eLeCtRoNiCs',
      revenue: '₹ 85,000.00',
      payment_status: 'PAID',
      hasIssues: { whitespace: true, casing: true, dateFormat: true },
    },
    {
      id: '2',
      order_id: 'ORD-902',
      customer_name: 'Infosys Ltd',
      region: 'South',
      order_date: '2025-04-15',
      category: 'Software Licenses',
      revenue: '142000',
      payment_status: 'Paid',
      hasIssues: {},
    },
    {
      id: '3',
      order_id: 'ORD-903',
      customer_name: 'Wipro Enterprises  ',
      region: '', // missing
      order_date: 'Apr 16, 2025',
      category: 'FURNITURE',
      revenue: '68500/-',
      payment_status: 'PENDING',
      hasIssues: { whitespace: true, missing: true, dateFormat: true, casing: true },
    },
    {
      id: '4',
      order_id: 'ORD-904',
      customer_name: '  reliance industries ',
      region: 'west',
      order_date: '2025.04.18',
      category: 'hardware',
      revenue: '230000',
      payment_status: 'Paid',
      hasIssues: { whitespace: true, casing: true, dateFormat: true },
    },
    {
      id: '5',
      order_id: 'ORD-905',
      customer_name: 'HDFC Bank Corporate',
      region: 'North',
      order_date: '19-04-2025',
      category: 'Office Supplies',
      revenue: '₹45,200',
      payment_status: '', // missing
      hasIssues: { dateFormat: true, missing: true },
    },
    {
      id: '6',
      order_id: 'ORD-906',
      customer_name: 'Bharti Airtel Ltd',
      region: 'North',
      order_date: '2025-04-20',
      category: 'Electronics',
      revenue: '112000',
      payment_status: 'Paid',
      hasIssues: {},
    },
    {
      id: '7', // DUPLICATE OF ORD-906
      order_id: 'ORD-906',
      customer_name: 'Bharti Airtel Ltd',
      region: 'North',
      order_date: '2025-04-20',
      category: 'Electronics',
      revenue: '112000',
      payment_status: 'Paid',
      hasIssues: { duplicate: true },
    },
    {
      id: '8',
      order_id: 'ORD-907',
      customer_name: 'mahindra & mahindra',
      region: 'West',
      order_date: '21/04/2025',
      category: 'HARDWARE',
      revenue: '175000.00',
      payment_status: 'Paid',
      hasIssues: { casing: true, dateFormat: true },
    },
    {
      id: '9',
      order_id: 'ORD-908',
      customer_name: '  Larsen & Toubro ',
      region: 'West',
      order_date: '2025-04-22',
      category: 'Software Licenses',
      revenue: '₹ 310,000',
      payment_status: 'Pending',
      hasIssues: { whitespace: true },
    },
    {
      id: '10',
      order_id: 'ORD-909',
      customer_name: 'ITC Infotech',
      region: 'east',
      order_date: '23-04-2025',
      category: '', // missing category
      revenue: '54000',
      payment_status: 'Paid',
      hasIssues: { casing: true, dateFormat: true, missing: true },
    },
    {
      id: '11',
      order_id: 'ORD-910',
      customer_name: 'Titan Company',
      region: 'South',
      order_date: '2025/04/25',
      category: 'oFfIcE sUpPlIeS',
      revenue: '38900/-',
      payment_status: 'Paid',
      hasIssues: { dateFormat: true, casing: true },
    },
    {
      id: '12', // DUPLICATE OF ORD-902
      order_id: 'ORD-902',
      customer_name: 'Infosys Ltd',
      region: 'South',
      order_date: '2025-04-15',
      category: 'Software Licenses',
      revenue: '142000',
      payment_status: 'Paid',
      hasIssues: { duplicate: true },
    },
    {
      id: '13',
      order_id: 'ORD-911',
      customer_name: '  Zomato Media  ',
      region: 'North',
      order_date: '26 Apr 2025',
      category: 'Electronics',
      revenue: '89400',
      payment_status: 'paid',
      hasIssues: { whitespace: true, dateFormat: true, casing: true },
    },
    {
      id: '14',
      order_id: 'ORD-912',
      customer_name: 'Swiggy Bundl Tech',
      region: 'south',
      order_date: '2025-04-27',
      category: 'Furniture',
      revenue: '₹ 125,000',
      payment_status: 'Paid',
      hasIssues: { casing: true },
    },
    {
      id: '15',
      order_id: 'ORD-913',
      customer_name: 'Sun Pharma Ltd',
      region: 'West',
      order_date: '28/04/2025',
      category: 'Hardware',
      revenue: '₹ 94500',
      payment_status: 'Pending',
      hasIssues: { dateFormat: true },
    },
    {
      id: '16', // DUPLICATE OF ORD-913
      order_id: 'ORD-913',
      customer_name: 'Sun Pharma Ltd',
      region: 'West',
      order_date: '28/04/2025',
      category: 'Hardware',
      revenue: '₹ 94500',
      payment_status: 'Pending',
      hasIssues: { duplicate: true },
    },
    {
      id: '17',
      order_id: 'ORD-914',
      customer_name: '  Adani Enterprises ',
      region: '', // missing
      order_date: '2025-04-30',
      category: 'Software Licenses',
      revenue: '210000',
      payment_status: 'Paid',
      hasIssues: { whitespace: true, missing: true },
    },
    {
      id: '18',
      order_id: 'ORD-915',
      customer_name: 'Bajaj Finance',
      region: 'west',
      order_date: 'May 01, 2025',
      category: 'office supplies',
      revenue: '67200/-',
      payment_status: 'PAID',
      hasIssues: { casing: true, dateFormat: true },
    },
  ];
}

// Transform raw messy row into cleaned structured row
export function cleanRawRows(raw: RawMessyRow[]): CleaningRunResult {
  const initialCount = raw.length;
  let whitespacesTrimmed = 0;
  let casingsNormalized = 0;
  let datesStandardized = 0;
  let blanksImputed = 0;

  // Step 1: Whitespace trimming
  const step1 = raw.map((r) => {
    const trimmedName = r.customer_name.trim().replace(/\s+/g, ' ');
    if (trimmedName !== r.customer_name) whitespacesTrimmed++;
    return { ...r, customer_name: trimmedName };
  });

  // Step 2: Casing normalization (Title Case for Names & Categories, Proper region)
  const toTitleCase = (str: string) =>
    str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const step2 = step1.map((r) => {
    let changed = false;
    let category = r.category;
    if (category) {
      const fixedCat = toTitleCase(category);
      if (fixedCat !== category) {
        category = fixedCat;
        changed = true;
      }
    }
    let region = r.region;
    if (region) {
      const fixedReg = toTitleCase(region);
      if (fixedReg !== region) {
        region = fixedReg;
        changed = true;
      }
    }
    let payment = r.payment_status;
    if (payment) {
      const fixedPay = toTitleCase(payment);
      if (fixedPay !== payment) {
        payment = fixedPay;
        changed = true;
      }
    }
    if (changed) casingsNormalized++;
    return { ...r, category, region, payment_status: payment };
  });

  // Step 3: Date standardization to ISO YYYY-MM-DD
  const step3 = step2.map((r) => {
    let dateStr = r.order_date;
    let standardized = dateStr;

    if (dateStr.includes('/')) {
      // e.g. 14/04/2025 or 2025/04/25
      const parts = dateStr.split('/');
      if (parts[0].length === 4) {
        standardized = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        standardized = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      datesStandardized++;
    } else if (dateStr.includes('.')) {
      // 2025.04.18
      const parts = dateStr.split('.');
      standardized = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      datesStandardized++;
    } else if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
      // 19-04-2025
      const parts = dateStr.split('-');
      standardized = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      datesStandardized++;
    } else if (dateStr.includes('Apr') || dateStr.includes('May')) {
      // e.g. 'Apr 16, 2025' or '26 Apr 2025'
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        standardized = parsed.toISOString().slice(0, 10);
        datesStandardized++;
      }
    }

    return { ...r, order_date: standardized };
  });

  // Step 4: Impute Missing Blanks
  const step4 = step3.map((r) => {
    let region = r.region;
    let category = r.category;
    let payment = r.payment_status;

    if (!region) {
      region = 'West'; // Impute default based on headquarters
      blanksImputed++;
    }
    if (!category) {
      category = 'Office Supplies'; // Impute most frequent default
      blanksImputed++;
    }
    if (!payment) {
      payment = 'Paid';
      blanksImputed++;
    }

    return { ...r, region, category, payment_status: payment };
  });

  // Step 5: Clean Numeric Revenue
  const step5 = step4.map((r) => {
    const rawVal = String(r.revenue);
    const cleanedNum = parseFloat(rawVal.replace(/[^0-9.]/g, '')) || 0;
    return {
      ...r,
      cleanRevenue: cleanedNum,
    };
  });

  // Step 6: Deduplicate records by order_id
  const seenOrders = new Set<string>();
  const finalCleanedRows: CleanedRow[] = [];
  let duplicatesRemoved = 0;

  for (const r of step5) {
    if (seenOrders.has(r.order_id)) {
      duplicatesRemoved++;
    } else {
      seenOrders.add(r.order_id);
      finalCleanedRows.push({
        id: r.id,
        order_id: r.order_id,
        customer_name: r.customer_name,
        region: r.region,
        order_date: r.order_date,
        category: r.category,
        revenue: r.cleanRevenue,
        payment_status: r.payment_status,
      });
    }
  }

  const steps: CleaningStepInfo[] = [
    {
      stepNumber: 1,
      name: 'Trim Whitespace & Non-Printing Characters',
      description: 'Stripped leading/trailing spaces and compressed multiple contiguous whitespace in company names.',
      toolUsed: 'Power Query: Text.Trim & Text.Clean | SQL: TRIM() | Excel: =TRIM(CLEAN(A2))',
      affectedCount: whitespacesTrimmed,
    },
    {
      stepNumber: 2,
      name: 'Standardize Text Casing',
      description: 'Converted irregular casing (eLeCtRoNiCs, HARDWARE) into consistent Title Case across Category and Region.',
      toolUsed: 'Power Query: Text.Proper | SQL: INITCAP() | Excel: =PROPER(A2)',
      affectedCount: casingsNormalized,
    },
    {
      stepNumber: 3,
      name: 'Normalize Inconsistent Date Formats',
      description: 'Unified mixed dates (DD/MM/YYYY, YYYY.MM.DD, and textual formats) into standard ISO YYYY-MM-DD.',
      toolUsed: 'Power Query: Date.FromText | SQL: TO_DATE() | Excel: =TEXT(DATEVALUE(), "yyyy-mm-dd")',
      affectedCount: datesStandardized,
    },
    {
      stepNumber: 4,
      name: 'Impute Missing / Blank Values',
      description: 'Detected empty regional fields and omitted payment statuses, filling them via business logic rules.',
      toolUsed: 'Power Query: Table.ReplaceValue | SQL: COALESCE(region, \'West\') | Excel: =IF(ISBLANK(), ...)',
      affectedCount: blanksImputed,
    },
    {
      stepNumber: 5,
      name: 'Deduplicate Redundant Transactions',
      description: 'Identified recurring duplicate Order IDs resulting from multi-system merge syncs and eliminated redundant records.',
      toolUsed: 'Power Query: Table.Distinct | SQL: ROW_NUMBER() OVER(PARTITION BY order_id) = 1 | Excel: Remove Duplicates',
      affectedCount: duplicatesRemoved,
    },
  ];

  return {
    initialRows: raw,
    finalRows: finalCleanedRows,
    steps,
    stats: {
      initialCount,
      cleanedCount: finalCleanedRows.length,
      duplicatesRemoved,
      whitespacesTrimmed,
      casingsNormalized,
      datesStandardized,
      blanksImputed,
    },
  };
}
