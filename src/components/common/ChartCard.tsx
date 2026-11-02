import React from 'react';
import { Filter, X } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  activeFilterBadge?: string | null;
  onClearFilter?: () => void;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  activeFilterBadge,
  onClearFilter,
  children,
  className = '',
  action,
}) => {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            {activeFilterBadge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                <Filter className="h-3 w-3" />
                Filtered: {activeFilterBadge}
                {onClearFilter && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearFilter();
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    aria-label={`Clear filter for ${activeFilterBadge}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="relative flex-1 min-h-[260px] w-full" aria-label={`Chart showing ${title}`}>
        {children}
      </div>
    </div>
  );
};
