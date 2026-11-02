import React, { useState, useEffect } from 'react';
import { DashboardId } from './types';
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ProfileModal } from './components/common/ProfileModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Pages & Dashboards
import { HomePage } from './pages/HomePage';
import { ExecutiveSummaryPage } from './pages/ExecutiveSummaryPage';
import { SalesDashboard } from './components/dashboards/SalesDashboard';
import { SupportDashboard } from './components/dashboards/SupportDashboard';
import { HrDashboard } from './components/dashboards/HrDashboard';
import { FinanceDashboard } from './components/dashboards/FinanceDashboard';
import { InventoryDashboard } from './components/dashboards/InventoryDashboard';
import { MarketingDashboard } from './components/dashboards/MarketingDashboard';
import { DataCleaningPage } from './pages/DataCleaningPage';
import { SqlExcelPage } from './pages/SqlExcelPage';
import { ContactPage } from './pages/ContactPage';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<DashboardId>(() => {
    // Read initial tab from URL hash if provided
    const hash = window.location.hash.replace('#', '') as DashboardId;
    const validTabs: DashboardId[] = [
      'home',
      'executive-summary',
      'sales',
      'support',
      'hr',
      'finance',
      'inventory',
      'marketing',
      'cleaning',
      'sql-excel',
      'contact',
    ];
    return validTabs.includes(hash) ? hash : 'home';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync hash with currentTab
  const handleNavigate = (tab: DashboardId) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as DashboardId;
      const validTabs: DashboardId[] = [
        'home',
        'executive-summary',
        'sales',
        'support',
        'hr',
        'finance',
        'inventory',
        'marketing',
        'cleaning',
        'sql-excel',
        'contact',
      ];
      if (validTabs.includes(hash)) {
        setCurrentTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors">
      {/* Navigation Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {currentTab === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentTab === 'executive-summary' && <ExecutiveSummaryPage onNavigate={handleNavigate} />}
        {currentTab === 'sales' && <SalesDashboard />}
        {currentTab === 'support' && <SupportDashboard />}
        {currentTab === 'hr' && <HrDashboard />}
        {currentTab === 'finance' && <FinanceDashboard />}
        {currentTab === 'inventory' && <InventoryDashboard />}
        {currentTab === 'marketing' && <MarketingDashboard />}
        {currentTab === 'cleaning' && <DataCleaningPage />}
        {currentTab === 'sql-excel' && <SqlExcelPage />}
        {currentTab === 'contact' && <ContactPage />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals */}
      <ProfileModal />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </ThemeProvider>
  );
}
