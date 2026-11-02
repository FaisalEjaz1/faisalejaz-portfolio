import React from 'react';
import { Filter, RotateCcw, Calendar, Search } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  dateRange: string;
  onDateRangeChange: (val: string) => void;
  dateOptions?: FilterOption[];

  primaryFilterName: string;
  primaryValue: string;
  onPrimaryChange: (val: string) => void;
  primaryOptions: FilterOption[];

  secondaryFilterName?: string;
  secondaryValue?: string;
  onSecondaryChange?: (val: string) => void;
  secondaryOptions?: FilterOption[];

  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;

  activeCrossFilter?: string | null;
  onResetFilters: () => void;
  hasActiveFilters: boolean;

  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  dateRange,
  onDateRangeChange,
  dateOptions = [
    { label: 'All Dates (24 Mos)', value: 'ALL' },
    { label: 'Year 2025', value: '2025' },
    { label: 'Year 2024', value: '2024' },
    { label: 'Last 6 Months', value: 'LAST_6M' },
  ],
  primaryFilterName,
  primaryValue,
  onPrimaryChange,
  primaryOptions,
  secondaryFilterName,
  secondaryValue,
  onSecondaryChange,
  secondaryOptions,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search records by keyword...',
  activeCrossFilter,
  onResetFilters,
  hasActiveFilters,
  totalCount,
  filteredCount,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 flex-1">
          {/* Date Range Selector */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Time Horizon
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={dateRange}
                onChange={(e) => onDateRangeChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {dateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary Filter */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {primaryFilterName}
            </label>
            <select
              value={primaryValue}
              onChange={(e) => onPrimaryChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">
                All {primaryFilterName.endsWith('y') ? `${primaryFilterName.slice(0, -1)}ies` : `${primaryFilterName}s`}
              </option>
              {primaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Secondary Filter (Optional) */}
          {secondaryFilterName && secondaryOptions && onSecondaryChange && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {secondaryFilterName}
              </label>
              <select
                value={secondaryValue || 'ALL'}
                onChange={(e) => onSecondaryChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">
                  All {secondaryFilterName.endsWith('y') ? `${secondaryFilterName.slice(0, -1)}ies` : `${secondaryFilterName}s`}
                </option>
                {secondaryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Table Search input */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Search Table
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Action & Metric Stats */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredCount}</span> of {totalCount} records
            </span>
            <div className="text-[10px] text-slate-400">
              {filteredCount === totalCount ? '100% data shown' : `${Math.round((filteredCount / totalCount) * 100)}% matched`}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {activeCrossFilter && (
        <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-indigo-50/80 px-3 py-1.5 text-xs text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
          <Filter className="h-3.5 w-3.5 shrink-0" />
          <span>
            Active interactive cross-filter applied from chart: <strong>{activeCrossFilter}</strong>. All KPIs, visualizations and data rows below are synchronized.
          </span>
          <button
            onClick={onResetFilters}
            className="ml-auto underline font-semibold hover:text-indigo-900 dark:hover:text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
