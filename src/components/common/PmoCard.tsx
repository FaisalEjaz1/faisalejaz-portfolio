import React from 'react';
import { Target, Wrench, Award, Layers } from 'lucide-react';
import { PmoDetails } from '../../types';

interface PmoCardProps {
  pmo: PmoDetails;
  dashboardTitle: string;
}

export const PmoCard: React.FC<PmoCardProps> = ({ pmo, dashboardTitle }) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Project Architecture & Delivery Case Study
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Structured PMO reporting methodology: Problem, Method & Measurable Outcome
            </p>
          </div>
        </div>

        {/* Tools Used Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Tools:</span>
          {pmo.toolsUsed.map((tool) => (
            <span
              key={tool}
              className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Problem */}
        <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3.5 dark:border-rose-950/40 dark:bg-rose-950/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-1.5">
            <Target className="h-3.5 w-3.5" />
            <span>1. Problem</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
            {pmo.problem}
          </p>
        </div>

        {/* Method */}
        <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3.5 dark:border-sky-950/40 dark:bg-sky-950/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider mb-1.5">
            <Wrench className="h-3.5 w-3.5" />
            <span>2. Method</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
            {pmo.method}
          </p>
        </div>

        {/* Outcome */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 dark:border-emerald-950/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
            <Award className="h-3.5 w-3.5" />
            <span>3. Business Outcome</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
            {pmo.outcome}
          </p>
        </div>
      </div>
    </div>
  );
};
