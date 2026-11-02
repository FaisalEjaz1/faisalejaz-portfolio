import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  FileSpreadsheet,
  ArrowRight,
  Database,
  Wrench,
} from 'lucide-react';
import {
  generateMessyData,
  cleanRawRows,
  CleaningStepInfo,
  RawMessyRow,
  CleanedRow,
} from '../utils/cleaningEngine';
import { formatCurrency, formatDate } from '../utils/formatters';

export const DataCleaningPage: React.FC = () => {
  const [initialMessy] = useState<RawMessyRow[]>(() => generateMessyData());
  const [cleaningResult] = useState(() => cleanRawRows(initialMessy));

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCleaningRunning, setIsCleaningRunning] = useState<boolean>(false);
  const [isFullyCleaned, setIsFullyCleaned] = useState<boolean>(false);

  // Trigger step-by-step cleaning animation
  const handleStartCleaning = () => {
    setIsCleaningRunning(true);
    setCurrentStepIndex(1);
    setIsFullyCleaned(false);

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step <= cleaningResult.steps.length) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        setIsCleaningRunning(false);
        setIsFullyCleaned(true);
      }
    }, 700);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsCleaningRunning(false);
    setIsFullyCleaned(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Data Cleaning & Transformation Showcase
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
            Interactive demonstration of enterprise data sanitation: converting chaotic, unformatted ERP extracts with duplicates, nulls, and inconsistent date formats into clean, analysis-ready tables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isFullyCleaned ? (
            <button
              onClick={handleStartCleaning}
              disabled={isCleaningRunning}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
            >
              <Play className="h-4 w-4" />
              <span>{isCleaningRunning ? `Executing Step ${currentStepIndex}/5...` : 'Run Automated Cleaning'}</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset to Messy Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary of Issues Found & Fixed */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sanitation Audit Metrics
            </h3>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              Automated Data Quality Audit Summary
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isFullyCleaned
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400'
            }`}
          >
            {isFullyCleaned ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            <span>{isFullyCleaned ? '100% Data Cleansed' : 'Issues Detected in Ingestion'}</span>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Input Rows</span>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {cleaningResult.stats.initialCount}
            </div>
            <span className="text-[10px] text-slate-400">Raw transactions</span>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 dark:border-rose-950/50 dark:bg-rose-950/30">
            <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Duplicates Removed</span>
            <div className="text-lg font-black text-rose-600 dark:text-rose-400">
              {isFullyCleaned ? cleaningResult.stats.duplicatesRemoved : currentStepIndex >= 5 ? cleaningResult.stats.duplicatesRemoved : 0}
            </div>
            <span className="text-[10px] text-rose-600/80">3 Redundant order keys</span>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-950/50 dark:bg-blue-950/30">
            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase">Dates Standardized</span>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">
              {currentStepIndex >= 3 ? cleaningResult.stats.datesStandardized : 0}
            </div>
            <span className="text-[10px] text-blue-600/80">Unified to ISO YYYY-MM-DD</span>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3 dark:border-purple-950/50 dark:bg-purple-950/30">
            <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 uppercase">Casing Normalized</span>
            <div className="text-lg font-black text-purple-600 dark:text-purple-400">
              {currentStepIndex >= 2 ? cleaningResult.stats.casingsNormalized : 0}
            </div>
            <span className="text-[10px] text-purple-600/80">Converted to Title Case</span>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 dark:border-amber-950/50 dark:bg-amber-950/30">
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Blanks Imputed</span>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">
              {currentStepIndex >= 4 ? cleaningResult.stats.blanksImputed : 0}
            </div>
            <span className="text-[10px] text-amber-600/80">Filled via Mode Rules</span>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-950/50 dark:bg-emerald-950/30">
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Spaces Trimmed</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {currentStepIndex >= 1 ? cleaningResult.stats.whitespacesTrimmed : 0}
            </div>
            <span className="text-[10px] text-emerald-600/80">Leading & trailing stripped</span>
          </div>
        </div>
      </div>

      {/* Step-by-Step Execution Sequence */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Applied Transformation Pipeline
        </h3>

        <div className="space-y-2">
          {cleaningResult.steps.map((st) => {
            const isCompleted = currentStepIndex >= st.stepNumber;
            const isCurrent = currentStepIndex === st.stepNumber;

            return (
              <div
                key={st.stepNumber}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 dark:border-indigo-600'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 opacity-70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isCompleted ? '✓' : st.stepNumber}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {st.name}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {st.description}
                    </p>
                  </div>
                </div>

                <div className="mt-2 sm:mt-0 font-mono text-[10px] text-slate-500 dark:text-slate-400 sm:text-right">
                  <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {st.toolUsed}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side: Messy Raw vs Cleaned Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Messy Raw Data */}
        <div className="rounded-2xl border border-rose-200/80 bg-white dark:border-rose-950/60 dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="bg-rose-50/70 dark:bg-rose-950/40 p-4 border-b border-rose-100 dark:border-rose-900/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                <span>Raw Uncleaned Data (Source ERP Extract)</span>
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                Contains leading spaces, irregular casing, mixed date syntax, null fields, and duplicates
              </p>
            </div>
            <span className="rounded bg-rose-200/60 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
              {initialMessy.length} Rows
            </span>
          </div>

          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2">Order ID</th>
                  <th className="px-3 py-2">Customer Name</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                {initialMessy.map((row) => (
                  <tr
                    key={row.id}
                    className={row.hasIssues.duplicate ? 'bg-rose-50/60 dark:bg-rose-950/30' : ''}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span>{row.order_id}</span>
                        {row.hasIssues.duplicate && (
                          <span className="rounded bg-rose-100 px-1 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            DUP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {row.hasIssues.whitespace ? (
                        <span className="bg-amber-100/70 px-1 py-0.5 rounded dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          "{row.customer_name}"
                        </span>
                      ) : (
                        row.customer_name
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row.region === '' ? (
                        <span className="rounded bg-rose-200 px-1 text-[9px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          [BLANK]
                        </span>
                      ) : (
                        row.region
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-blue-600 dark:text-blue-400">{row.order_date}</span>
                    </td>
                    <td className="px-3 py-2">
                      {row.category === '' ? (
                        <span className="rounded bg-rose-200 px-1 text-[9px] font-bold text-rose-800">
                          [BLANK]
                        </span>
                      ) : row.hasIssues.casing ? (
                        <span className="text-purple-600 dark:text-purple-400 font-bold">{row.category}</span>
                      ) : (
                        row.category
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">{row.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Cleaned Standardized Output */}
        <div className="rounded-2xl border border-emerald-200/80 bg-white dark:border-emerald-950/60 dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>Cleansed & Standardized Output Table</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                Deduplicated, ISO-formatted dates, imputed regions, trimmed text, Title Case
              </p>
            </div>
            <span className="rounded bg-emerald-200/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
              {cleaningResult.finalRows.length} Rows (Pure)
            </span>
          </div>

          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2">Order ID</th>
                  <th className="px-3 py-2">Customer Name</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Date (ISO)</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2 text-right">Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                {cleaningResult.finalRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                    <td className="px-3 py-2 font-mono font-semibold text-slate-900 dark:text-white">
                      {row.order_id}
                    </td>
                    <td className="px-3 py-2 font-medium">{row.customer_name}</td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium dark:bg-slate-800">
                        {row.region}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-emerald-600 dark:text-emerald-400">
                      {row.order_date}
                    </td>
                    <td className="px-3 py-2">{row.category}</td>
                    <td className="px-3 py-2 text-right font-bold font-mono">
                      {formatCurrency(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
