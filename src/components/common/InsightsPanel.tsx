import React from 'react';
import { Lightbulb, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface InsightsPanelProps {
  insights: string[];
  recommendation: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  recommendation,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* Auto-Generated Key Insights (2 cols on lg) */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Automated MIS Key Insights
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Plain-English business findings computed live from the active data slice
            </p>
          </div>
        </div>

        <ul className="space-y-2.5 mt-4">
          {insights.map((sentence, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <span className="leading-relaxed font-medium">{sentence}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actionable Recommendation Box (1 col on lg) */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-slate-50 p-5 shadow-xs dark:border-indigo-950 dark:from-indigo-950/40 dark:to-slate-900 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
            <Lightbulb className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
            Analyst Recommendation
          </h4>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
          {recommendation}
        </p>
        <div className="mt-4 pt-3 border-t border-indigo-200/50 dark:border-indigo-900/50 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
          <span>Action Priority: High</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
};
