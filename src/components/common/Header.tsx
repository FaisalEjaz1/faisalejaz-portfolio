import React, { useState } from 'react';
import {
  BarChart3,
  Search,
  Sun,
  Moon,
  UserCheck,
  Menu,
  X,
  ChevronDown,
  Layers,
  Sparkles,
  Database,
  Code2,
  Mail,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useTheme } from '../../context/ThemeContext';
import { DashboardId } from '../../types';

interface HeaderProps {
  currentTab: DashboardId;
  onNavigate: (tab: DashboardId) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenSearch,
}) => {
  const { profile, setIsEditModalOpen } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDashboardsOpen, setIsDashboardsOpen] = useState(false);

  const dashboards = [
    { id: 'sales', label: 'Sales Performance', icon: '📈' },
    { id: 'support', label: 'Support SLA & CSAT', icon: '🎧' },
    { id: 'hr', label: 'HR & Attrition', icon: '👥' },
    { id: 'finance', label: 'Finance Budget vs Actual', icon: '💰' },
    { id: 'inventory', label: 'Inventory & Logistics', icon: '📦' },
    { id: 'marketing', label: 'Marketing Campaigns', icon: '🎯' },
  ] as const;

  const isCurrentDashboard = dashboards.some((d) => d.id === currentTab);

  const handleNav = (tab: DashboardId) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
    setIsDashboardsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 min-w-0"
            aria-label="Go to Home"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-slate-900 dark:text-white text-sm sm:text-base truncate">
                  {profile.name}
                </span>
                <span className="hidden xs:inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
                  Verified MIS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[130px] sm:max-w-none">
                {profile.title}
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => handleNav('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              currentTab === 'home'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Home className="h-4 w-4" />
            Home
          </button>

          <button
            onClick={() => handleNav('executive-summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              currentTab === 'executive-summary'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            Executive Summary
          </button>

          {/* Dashboards Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDashboardsOpen(!isDashboardsOpen)}
              onBlur={() => setTimeout(() => setIsDashboardsOpen(false), 200)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                isCurrentDashboard
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
              aria-expanded={isDashboardsOpen}
            >
              <span>Dashboards (6)</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isDashboardsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDashboardsOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Interactive Dashboards
                </div>
                {dashboards.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleNav(d.id as DashboardId)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      currentTab === d.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base">{d.icon}</span>
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleNav('cleaning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              currentTab === 'cleaning'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            Data Cleaning
          </button>

          <button
            onClick={() => handleNav('sql-excel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              currentTab === 'sql-excel'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Code2 className="h-4 w-4" />
            SQL & Excel
          </button>

          <button
            onClick={() => handleNav('contact')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              currentTab === 'contact'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Mail className="h-4 w-4" />
            Contact
          </button>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Search dashboards and queries (Cmd+K)"
            aria-label="Search"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </button>

          {/* Edit Profile Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors"
            title="Edit Candidate Profile"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with Backdrop */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-40 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden max-h-[calc(100vh-4.5rem)] overflow-y-auto shadow-2xl">
            <div className="flex flex-col gap-1 text-sm font-medium">
              <button
                onClick={() => handleNav('home')}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  currentTab === 'home'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="h-4 w-4" />
                Home / Overview
              </button>
              <button
                onClick={() => handleNav('executive-summary')}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  currentTab === 'executive-summary'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="h-4 w-4" />
                Executive Summary
              </button>

              <div className="pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Interactive Dashboards
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {dashboards.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleNav(d.id as DashboardId)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                      currentTab === d.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm">{d.icon}</span>
                    <span className="truncate">{d.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Technical Showcases
              </div>
              <button
                onClick={() => handleNav('cleaning')}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  currentTab === 'cleaning'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                Data Cleaning Engine
              </button>
              <button
                onClick={() => handleNav('sql-excel')}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  currentTab === 'sql-excel'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Code2 className="h-4 w-4" />
                SQL & Excel Showcase
              </button>
              <button
                onClick={() => handleNav('contact')}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  currentTab === 'contact'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Mail className="h-4 w-4" />
                Contact Faisal
              </button>

              <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500"
                >
                  <UserCheck className="h-4 w-4" />
                  Edit Candidate Profile
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
