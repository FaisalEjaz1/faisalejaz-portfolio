export interface ExcelShowcaseFormula {
  id: string;
  name: string;
  syntax: string;
  category: 'Modern Lookup' | 'Conditional Aggregation' | 'Matrix Lookup' | 'Dynamic Arrays' | 'Pivot Logic';
  explanation: string;
  misUseCase: string;
  sampleFormula: string;
  exampleData: {
    headers: string[];
    rows: (string | number)[][];
  };
  sampleCalculationNote: string;
  proTip: string;
}

export const excelShowcaseFormulas: ExcelShowcaseFormula[] = [
  {
    id: 'xlookup',
    name: 'XLOOKUP',
    syntax: '=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])',
    category: 'Modern Lookup',
    explanation: 'Modern successor to VLOOKUP and HLOOKUP. It searches an array or range and returns the matching item from a second array, eliminating column index vulnerabilities and looking up both left and right.',
    misUseCase: 'Mapping master employee codes to salary bands and sales territories across disparate monthly ledger sheets without breaking when columns are re-ordered.',
    sampleFormula: '=XLOOKUP("SO-2025-1042", A2:A100, E2:E100, "Order Not Found", 0)',
    exampleData: {
      headers: ['Order ID (A)', 'Date (B)', 'Region (C)', 'Sales Rep (D)', 'Revenue (E)'],
      rows: [
        ['SO-2025-1040', '2025-04-12', 'West', 'Priya Sharma', '₹1,85,000'],
        ['SO-2025-1041', '2025-04-13', 'North', 'Deepak Verma', '₹92,400'],
        ['SO-2025-1042', '2025-04-14', 'South', 'Karthik Raman', '₹3,45,000'],
        ['SO-2025-1043', '2025-04-14', 'West', 'Amit Patel', '₹1,12,000'],
      ],
    },
    sampleCalculationNote: 'Looking up "SO-2025-1042" in Col A directly retrieves "₹3,45,000" from Col E with 0 risk of column shift errors.',
    proTip: 'Use nested XLOOKUP for a 2-way matrix lookup: =XLOOKUP(Quarter, HeaderRow, XLOOKUP(Dept, DeptCol, DataMatrix)).',
  },
  {
    id: 'sumifs',
    name: 'SUMIFS',
    syntax: '=SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    category: 'Conditional Aggregation',
    explanation: 'Sums cells in a range that meet multiple criteria. Essential for parameterized financial rollups, regional sales aggregations, and filtered KPI card computations.',
    misUseCase: 'Consolidating regional sales MIS by summing revenue where Region="West", Product Category="Electronics", and Order Date >= start of quarter.',
    sampleFormula: '=SUMIFS(F2:F500, C2:C500, "West", D2:D500, "Electronics", B2:B500, ">=2025-04-01")',
    exampleData: {
      headers: ['Order (A)', 'Date (B)', 'Region (C)', 'Category (D)', 'Units (E)', 'Revenue (F)'],
      rows: [
        ['SO-901', '2025-04-02', 'West', 'Electronics', 14, '₹3,99,000'],
        ['SO-902', '2025-04-05', 'North', 'Office Supplies', 8, '₹52,000'],
        ['SO-903', '2025-04-09', 'West', 'Electronics', 22, '₹6,27,000'],
        ['SO-904', '2025-04-11', 'West', 'Hardware', 6, '₹1,74,000'],
      ],
    },
    sampleCalculationNote: 'Filtered sum of West + Electronics rows: ₹3,99,000 + ₹6,27,000 = ₹10,26,000 total revenue.',
    proTip: 'Reference external cell controls (e.g. `">=" & $K$1`) so executives can change threshold dates dynamically.',
  },
  {
    id: 'index-match',
    name: 'INDEX / MATCH',
    syntax: '=INDEX(array, MATCH(lookup_val_row, row_range, 0), MATCH(lookup_val_col, col_range, 0))',
    category: 'Matrix Lookup',
    explanation: 'The classic dual-axis lookup combination. `MATCH` locates relative row and column coordinate positions, which `INDEX` uses to retrieve values from an intersecting grid.',
    misUseCase: 'Retrieving monthly departmental budget figures from a 2-dimensional financial matrix where rows represent Cost Centers and columns represent Fiscal Months.',
    sampleFormula: '=INDEX(B2:M10, MATCH("Engineering", A2:A10, 0), MATCH("Apr 2025", B1:M1, 0))',
    exampleData: {
      headers: ['Department (A)', 'Jan 2025 (B)', 'Feb 2025 (C)', 'Mar 2025 (D)', 'Apr 2025 (E)'],
      rows: [
        ['Marketing', '₹8,50,000', '₹8,90,000', '₹9,20,000', '₹9,45,000'],
        ['Engineering', '₹22,00,000', '₹22,50,000', '₹23,10,000', '₹24,80,000'],
        ['Sales', '₹14,20,000', '₹14,00,000', '₹15,60,000', '₹15,90,000'],
      ],
    },
    sampleCalculationNote: 'MATCH identifies row 2 (Engineering) and column 4 (Apr 2025), extracting the intersection: ₹24,80,000.',
    proTip: 'Use INDEX/MATCH when designing legacy enterprise workbooks where end users might still run Excel 2016 or earlier without XLOOKUP support.',
  },
  {
    id: 'pivot-logic',
    name: 'GETPIVOTDATA & Pivot Model Logic',
    syntax: '=GETPIVOTDATA(data_field, pivot_table, [field1, item1], [field2, item2], ...)',
    category: 'Pivot Logic',
    explanation: 'Safely extracts summary metrics directly from an Excel Pivot Table or Power Pivot Data Model without relying on brittle relative cell coordinates that shift during refreshes.',
    misUseCase: 'Building customized C-suite executive dashboard cards that pull exact sub-totals from an underlying Power Pivot data model during automated weekly refreshes.',
    sampleFormula: '=GETPIVOTDATA("Revenue", $A$3, "Region", "West", "Year", 2025)',
    exampleData: {
      headers: ['Pivot Field', 'Q1 FY25', 'Q2 FY25', 'Q3 FY25', 'Total FY25'],
      rows: [
        ['West Region', '₹34.5 L', '₹38.2 L', '₹42.1 L', '₹114.8 L'],
        ['North Region', '₹28.1 L', '₹29.4 L', '₹31.0 L', '₹88.5 L'],
        ['South Region', '₹31.4 L', '₹33.0 L', '₹35.8 L', '₹100.2 L'],
      ],
    },
    sampleCalculationNote: 'Directly retrieves West Region 2025 aggregate total ₹114.8 L even if new regional rows or quarterly columns are added.',
    proTip: 'Pair GETPIVOTDATA with dynamic cell references for field arguments to make report cards completely interactive.',
  },
  {
    id: 'filter-unique',
    name: 'FILTER & UNIQUE (Dynamic Spill Arrays)',
    syntax: '=FILTER(array, include, [if_empty]) & =UNIQUE(array, [by_col], [exactly_once])',
    category: 'Dynamic Arrays',
    explanation: 'Dynamic array formulas that automatically calculate and spill variable results across adjacent cells without needing manual array dragging (Ctrl+Shift+Enter).',
    misUseCase: 'Auto-extracting a live deduplicated list of delinquent invoices or critical inventory SKUs below safety thresholds directly into an executive briefing view.',
    sampleFormula: '=FILTER(A2:E200, (D2:D200="CRITICAL STOCKOUT") * (C2:C200="Mumbai Central"), "No Critical Stock")',
    exampleData: {
      headers: ['SKU (A)', 'Product (B)', 'Warehouse (C)', 'Stock Status (D)', 'Deficit (E)'],
      rows: [
        ['SKU-ELE-104', 'Barcode Scanner Pro', 'Mumbai Central', 'CRITICAL STOCKOUT', -42],
        ['SKU-FMC-112', 'A4 Copier Paper', 'Delhi North', 'STABLE INVENTORY', 180],
        ['SKU-PAC-145', 'Corrugated Box 5-Ply', 'Mumbai Central', 'CRITICAL STOCKOUT', -115],
      ],
    },
    sampleCalculationNote: 'Instantly filters down to only rows matching Mumbai Central + CRITICAL STOCKOUT and spills results cleanly.',
    proTip: 'Wrap in `=SORT(FILTER(...), 5, -1)` to simultaneously filter and sort high-risk inventory rows in descending deficit order.',
  },
  {
    id: 'countifs-conditional',
    name: 'COUNTIFS & Conditional Thresholds',
    syntax: '=COUNTIFS(criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    category: 'Conditional Aggregation',
    explanation: 'Counts the number of rows meeting one or multiple criteria. Essential for SLA compliance percentages, backlog aging buckets, and headcount tenure audits.',
    misUseCase: 'Calculating Customer Support SLA compliance rate: `=COUNTIFS(StatusRange, "Closed", SlaMetRange, TRUE) / COUNTIF(StatusRange, "Closed")`.',
    sampleFormula: '=COUNTIFS(B2:B300, "Billing", C2:C300, FALSE, D2:D300, ">24")',
    exampleData: {
      headers: ['Ticket ID (A)', 'Category (B)', 'SLA Met (C)', 'Resolution Hrs (D)', 'CSAT (E)'],
      rows: [
        ['TCK-10021', 'Billing', 'FALSE', 38.5, 2],
        ['TCK-10022', 'Login', 'TRUE', 3.2, 5],
        ['TCK-10023', 'Billing', 'FALSE', 44.0, 1],
        ['TCK-10024', 'Billing', 'TRUE', 8.5, 4],
      ],
    },
    sampleCalculationNote: 'Identifies exactly 2 tickets matching Billing category + SLA Breached + Resolution >24 hours.',
    proTip: 'Combine with conditional formatting formulas (`=AND($C2=FALSE, $D2>24)`) to highlight critical exceptions in soft amber.',
  },
];
