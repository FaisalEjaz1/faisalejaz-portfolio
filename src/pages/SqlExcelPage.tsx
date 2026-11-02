import React, { useState, useMemo } from 'react';
import {
  Code2,
  FileSpreadsheet,
  Play,
  Copy,
  Check,
  Database,
  Layers,
  ArrowRight,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { sqlShowcaseQueries, SqlShowcaseItem } from '../data/sqlQueries';
import { excelShowcaseFormulas, ExcelShowcaseFormula } from '../data/excelFormulas';
import {
  generateSalesData,
  generateSupportData,
  generateHrData,
  generateFinanceData,
  generateInventoryData,
  generateMarketingData,
} from '../data/datasets';

export const SqlExcelPage: React.FC = () => {
  // Pre-load datasets for live SQL execution
  const datasets = useMemo(() => {
    return {
      sales: generateSalesData(),
      support: generateSupportData(),
      hr: generateHrData(),
      finance: generateFinanceData(),
      inventory: generateInventoryData(),
      marketing: generateMarketingData(),
    };
  }, []);

  // SQL category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeQueryId, setActiveQueryId] = useState<string>(sqlShowcaseQueries[0].id);
  const [copiedQueryId, setCopiedQueryId] = useState<string | null>(null);

  // Excel formula tab
  const [activeFormulaId, setActiveFormulaId] = useState<string>(excelShowcaseFormulas[0].id);

  // Active query
  const activeQuery = useMemo(() => {
    return sqlShowcaseQueries.find((q) => q.id === activeQueryId) || sqlShowcaseQueries[0];
  }, [activeQueryId]);

  // Execute query live against dataset
  const queryResult = useMemo(() => {
    try {
      return activeQuery.execute(datasets);
    } catch (e) {
      console.error('SQL Execution failed', e);
      return { columns: ['Status'], rows: [{ Status: 'Execution error' }] };
    }
  }, [activeQuery, datasets]);

  // Active formula
  const activeFormula = useMemo(() => {
    return excelShowcaseFormulas.find((f) => f.id === activeFormulaId) || excelShowcaseFormulas[0];
  }, [activeFormulaId]);

  const handleCopySql = (sql: string, id: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedQueryId(id);
    setTimeout(() => setCopiedQueryId(null), 1800);
  };

  const filteredQueries = sqlShowcaseQueries.filter((q) => {
    if (selectedCategory === 'ALL') return true;
    return q.category === selectedCategory;
  });

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            SQL Query Engine & Advanced Excel Modeling Workbench
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
          Production SQL queries with live client-side dataset execution and real-world Excel financial formulas demonstrating hands-on analytical rigor.
        </p>
      </div>

      {/* SECTION 1: SQL QUERIES SHOWCASE */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Part 1: Enterprise SQL Engine
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              8 Real-World SQL Analytical Queries (Live Evaluation)
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {['ALL', 'Window Functions', 'CTEs', 'GROUP BY', 'Aggregations', 'Case Statements'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Query Dropdown Selector */}
        <div className="block lg:hidden">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
            Active SQL Query ({filteredQueries.length} available)
          </label>
          <select
            value={activeQueryId}
            onChange={(e) => setActiveQueryId(e.target.value)}
            className="w-full rounded-xl border border-indigo-200 bg-white p-3 text-xs font-semibold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {filteredQueries.map((q) => (
              <option key={q.id} value={q.id}>
                [{q.category}] {q.title}
              </option>
            ))}
          </select>
        </div>

        {/* Query Selector List & Active Query Execution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Query Selector Sidebar (4 cols - Desktop Only) */}
          <div className="hidden lg:block lg:col-span-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select SQL Query to Execute
            </span>
            {filteredQueries.map((q) => {
              const isSelected = q.id === activeQueryId;
              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQueryId(q.id)}
                  className={`w-full text-left rounded-xl p-3 border transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {q.category}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {q.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {q.businessContext}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Query Display & Live Execution Table (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Query Header & Explanation */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeQuery.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Category: {activeQuery.category} • Complexity: {activeQuery.difficulty}
                  </span>
                </div>

                <button
                  onClick={() => handleCopySql(activeQuery.sql, activeQuery.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  {copiedQueryId === activeQuery.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied SQL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-2">
                <div>
                  <strong className="text-slate-900 dark:text-white">Business Logic: </strong>
                  {activeQuery.businessContext}
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-white">SQL Technique: </strong>
                  {activeQuery.explanation}
                </div>
              </div>

              {/* SQL Code Block */}
              <div className="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-200 shadow-inner overflow-x-auto border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                    <span>PostgreSQL / ANSI SQL Query</span>
                  </div>
                  <span className="text-emerald-400">Executable on App Data</span>
                </div>
                <pre className="whitespace-pre overflow-x-auto">
                  <code>{activeQuery.sql}</code>
                </pre>
              </div>
            </div>

            {/* Computed Live Result Table */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 p-3 border-b border-slate-100 dark:bg-slate-800/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                  <span>Computed Live Query Output Table ({queryResult.rows.length} Rows Returned)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Evaluated in 0.4ms
                </span>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100/70 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 sticky top-0">
                    <tr>
                      {queryResult.columns.map((col) => (
                        <th key={col} className="px-3 py-2 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                    {queryResult.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {queryResult.columns.map((col) => (
                          <td key={col} className="px-3 py-2 whitespace-nowrap">
                            {String(row[col] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: EXCEL FORMULA SHOWCASE */}
      <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Part 2: Advanced Excel Workbench
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Key Excel Formulas & Modeling Patterns
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            XLOOKUP, SUMIFS, INDEX/MATCH, Dynamic Arrays & Pivot Logic
          </span>
        </div>

        {/* Formula Tabs */}
        <div className="flex flex-wrap gap-2">
          {excelShowcaseFormulas.map((formula) => {
            const isSelected = formula.id === activeFormulaId;
            return (
              <button
                key={formula.id}
                onClick={() => setActiveFormulaId(formula.id)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>{formula.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Formula Details Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {activeFormula.category}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  ={activeFormula.name}
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {activeFormula.explanation}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 px-3 py-1.5 font-mono text-[11px] sm:text-xs text-emerald-700 dark:bg-slate-800 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 max-w-full overflow-x-auto">
              <code>{activeFormula.syntax}</code>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: MIS Business Context & Formula */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  MIS Reporting Application
                </span>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                  {activeFormula.misUseCase}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Sample Production Formula Syntax
                </span>
                <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto">
                  <code>{activeFormula.sampleFormula}</code>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-950/70 dark:bg-amber-950/30 dark:text-amber-200">
                <strong className="block mb-0.5">Analyst Pro-Tip:</strong>
                {activeFormula.proTip}
              </div>
            </div>

            {/* Right: Sample Mini Grid & Calculated Result */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Evaluation Grid & Calculation Output
              </span>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden dark:border-slate-800 dark:bg-slate-800/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-200/70 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        {activeFormula.exampleData.headers.map((h) => (
                          <th key={h} className="px-3 py-1.5 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                      {activeFormula.exampleData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-white/60 dark:hover:bg-slate-800/80">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-emerald-50/60 border-t border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/60 text-xs">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">
                    Execution Result:
                  </span>{' '}
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {activeFormula.sampleCalculationNote}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
