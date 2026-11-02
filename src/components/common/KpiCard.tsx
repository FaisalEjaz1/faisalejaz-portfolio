import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  changePct?: number;
  comparisonText?: string;
  isPositiveGood?: boolean; // default true
  icon?: React.ReactNode;
  subtext?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  changePct,
  comparisonText = 'vs previous period',
  isPositiveGood = true,
  icon,
  subtext,
}) => {
  const hasChange = changePct !== undefined && !isNaN(changePct);
  const isZero = hasChange && Math.abs(changePct) < 0.05;
  const isGood = hasChange && (isPositiveGood ? changePct > 0 : changePct < 0);
  const isBad = hasChange && (isPositiveGood ? changePct < 0 : changePct > 0);

  return (
    <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 lg:p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 min-w-0">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] sm:text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400 block truncate" title={title}>
            {title}
          </span>
          <div className="mt-1 text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans truncate" title={String(value)}>
            {value}
          </div>
        </div>
        {icon && (
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 sm:mt-3 flex items-center flex-wrap gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 min-w-0">
        {hasChange && (
          <div
            className={`inline-flex items-center gap-0.5 sm:gap-1 rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold shrink-0 ${
              isZero
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                : isGood
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
            }`}
          >
            {isZero ? (
              <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            ) : changePct > 0 ? (
              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            )}
            <span>
              {changePct > 0 ? `+${changePct.toFixed(1)}%` : `${changePct.toFixed(1)}%`}
            </span>
          </div>
        )}

        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {comparisonText}
        </span>

        {subtext && (
          <span className="w-full text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 truncate">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
