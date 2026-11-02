import React, { useEffect, useState } from 'react';
import {
  Search,
  X,
  TrendingUp,
  Headphones,
  Users,
  DollarSign,
  Package,
  Target,
  Sparkles,
  Code2,
  Mail,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { DashboardId } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tab: DashboardId) => void;
}

interface SearchItem {
  id: DashboardId;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchItems: SearchItem[] = [
    {
      id: 'executive-summary',
      title: 'Executive Summary KPI Rollup',
      category: 'Overview',
      description: 'Unified cross-functional cockpit combining top KPIs from all 6 operational departments.',
      icon: <Target className="h-4 w-4 text-indigo-500" />,
      tags: ['executive', 'rollup', 'cross-functional', 'c-suite', 'kpi'],
    },
    {
      id: 'sales',
      title: 'Sales Performance Dashboard',
      category: 'Commercial',
      description: '24-month revenue trends, regional quota attainment, sales rep leaderboards, discount analysis.',
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
      tags: ['sales', 'revenue', 'quota', 'region', 'discounts', 'reps'],
    },
    {
      id: 'support',
      title: 'Customer Support SLA & CSAT',
      category: 'Operations',
      description: 'Ticket volume analytics, first response times, SLA breach attribution, and channel CSAT ratings.',
      icon: <Headphones className="h-4 w-4 text-sky-500" />,
      tags: ['support', 'sla', 'tickets', 'csat', 'billing dip', 'turnaround'],
    },
    {
      id: 'hr',
      title: 'HR Headcount & Attrition Cockpit',
      category: 'Human Capital',
      description: 'Tenure cohort analysis, department turnover rates, exit drivers, and salary band distribution.',
      icon: <Users className="h-4 w-4 text-purple-500" />,
      tags: ['hr', 'attrition', 'turnover', 'tenure', 'headcount', 'exit reason'],
    },
    {
      id: 'finance',
      title: 'Finance Budget vs Actual Variance',
      category: 'Financial Planning',
      description: 'Departmental budget reconciliation, variance tracking, overspending cost centers, and vendor spend.',
      icon: <DollarSign className="h-4 w-4 text-amber-500" />,
      tags: ['finance', 'budget', 'actual', 'variance', 'overspend', 'ledger'],
    },
    {
      id: 'inventory',
      title: 'Inventory & Logistics Control',
      category: 'Supply Chain',
      description: 'Warehouse stock balance, SKU reorder point alerts, vendor lead time, and on-time delivery.',
      icon: <Package className="h-4 w-4 text-rose-500" />,
      tags: ['inventory', 'stock', 'warehouse', 'reorder', 'sku', 'logistics', 'otd'],
    },
    {
      id: 'marketing',
      title: 'Marketing Acquisition Funnel & ROAS',
      category: 'Growth',
      description: 'End-to-end conversion funnel, impression-to-sale velocity, CAC/CPA, and ROAS multipliers.',
      icon: <Target className="h-4 w-4 text-pink-500" />,
      tags: ['marketing', 'campaigns', 'roas', 'cpa', 'cpl', 'funnel', 'ctr'],
    },
    {
      id: 'cleaning',
      title: 'Data Cleaning & Transformation Engine',
      category: 'Showcase',
      description: 'Interactive demonstration of Power Query and SQL data sanitation, deduplication, and parsing.',
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
      tags: ['cleaning', 'power query', 'duplicates', 'messy data', 'dates', 'nulls'],
    },
    {
      id: 'sql-excel',
      title: 'SQL & Advanced Excel Showcase',
      category: 'Technical',
      description: '8 real-world CTE and window function queries with live output tables plus Excel formula models.',
      icon: <Code2 className="h-4 w-4 text-indigo-500" />,
      tags: ['sql', 'excel', 'window functions', 'xlookup', 'cte', 'dense_rank', 'pivot'],
    },
    {
      id: 'contact',
      title: 'Candidate Profile & Resume',
      category: 'Career',
      description: 'Direct contact info for Faisal Ejaz, inquiry form, and resume download preview.',
      icon: <Mail className="h-4 w-4 text-blue-500" />,
      tags: ['contact', 'email', 'phone', 'resume', 'hire', 'faisal'],
    },
  ];

  const filtered = searchItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (isOpen) {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filtered[selectedIndex]) {
            onSelect(filtered[selectedIndex].id);
            onClose();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, onSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dashboards, SQL queries, Excel formulas, metrics..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching dashboards or reports found for "{query}".
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200'
                      : 'hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isSelected
                        ? 'bg-white shadow-sm dark:bg-slate-800'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-opacity ${
                      isSelected ? 'opacity-100 text-indigo-600 dark:text-indigo-400' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-mono dark:border-slate-700 dark:bg-slate-800">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-mono dark:border-slate-700 dark:bg-slate-800">
                ↵
              </kbd>{' '}
              Open
            </span>
            <span>
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-mono dark:border-slate-700 dark:bg-slate-800">
                esc
              </kbd>{' '}
              Close
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Faisal Ejaz MIS Portfolio</span>
        </div>
      </div>
    </div>
  );
};
