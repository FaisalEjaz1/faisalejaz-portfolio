import React from 'react';
import { Mail, Phone, Linkedin, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { DashboardId } from '../../types';

interface FooterProps {
  onNavigate: (tab: DashboardId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { profile } = useProfile();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Candidate identity & disclaimer */}
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {profile.name}
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {profile.title}
              </span>
            </div>
            {/* Required footer note */}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Dashboards use illustrative sample data created to demonstrate reporting skills.
            </p>
          </div>

          {/* Quick contact channels */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{profile.email}</span>
            </a>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              <span>{profile.phone}</span>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => onNavigate('contact')}
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              View Full Profile & Resume →
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
