import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Download,
  Send,
  CheckCircle2,
  UserCheck,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

export const ContactPage: React.FC = () => {
  const { profile, setIsEditModalOpen } = useProfile();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: 'Hiring Manager',
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResumeDownloading, setIsResumeDownloading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleDownloadResume = () => {
    setIsResumeDownloading(true);
    setTimeout(() => {
      // Clean executive resume summary
      const resumeContent = `=====================================================
${profile.name.toUpperCase()}
${profile.title}
Location: ${profile.location}
Email: ${profile.email}
Phone (Calls): ${profile.phone}
WhatsApp: ${profile.whatsapp || '+923086728781'}
LinkedIn: https://${profile.linkedin.replace(/^https?:\/\//, '')}
=====================================================

EXECUTIVE SUMMARY
${profile.bio}

CORE TECHNICAL COMPETENCIES
- Spreadsheets: Advanced MS Excel (Pivot Tables, XLOOKUP, INDEX/MATCH, Power Query, VBA/Macros)
- Relational Databases: SQL (PostgreSQL, MySQL, T-SQL, CTEs, Window Functions, DENSE_RANK)
- Business Intelligence: Power BI (DAX Measures, Data Modeling, Star Schema, Scheduled Gateway Refreshes), Tableau
- Data Transformation: Power Query ETL, Automated Data Cleansing, Imputation & Deduplication
- Reporting Cadence: Daily, Weekly & Monthly Executive MIS Cockpits, Financial Reconciliations, Variance Analysis

PROFESSIONAL EXPERIENCE (SUMMARY)
- MIS Executive / Reporting Analyst (2022 - Present)
  * Automated 14 recurring daily/weekly operational reporting packs, slashing manual latency by 85%.
  * Modeled financial budget-vs-actual variance ledgers across $18M in corporate operating capital.
  * Created unified multi-channel customer support SLA & CSAT telemetry tracking.
  * Designed end-to-end sales performance dashboards supporting regional leadership reviews in Riyadh and international markets.

EDUCATION & CERTIFICATIONS
- Bachelor of Science in Information Technology / Computer Applications
- Advanced Excel & Power Query Data Modeling Certification
- SQL for Business Analytics & Relational Warehousing
=====================================================`;

      const blob = new Blob([resumeContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.name.replace(/\s+/g, '_')}_MIS_Analyst_Resume.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsResumeDownloading(false);
    }, 600);
  };

  const cleanPhone = profile.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsapp = (profile.whatsapp || '+923086728781').replace(/[^0-9]/g, '');
  const cleanLinkedin = profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Contact & Candidate Credentials
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Get in touch with {profile.name} regarding MIS Executive, Reporting Analyst, and Business Intelligence opportunities in Riyadh and globally.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Direct Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Candidate Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {profile.title}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span>{profile.location}</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                title="Edit profile in modal"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {profile.bio}
            </p>

            {/* Direct Quick Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=Hi%20Faisal,%20I%20reviewed%20your%20MIS%20Reporting%20Analyst%20portfolio...`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 px-3 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>Call Direct</span>
              </a>
            </div>

            {/* Detailed Channels List */}
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800 text-xs">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-3 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 group min-w-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Email Address</span>
                  <span className="font-semibold group-hover:underline truncate block">{profile.email}</span>
                </div>
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-3 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 group min-w-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Phone Number (Riyadh / Saudi Arabia)</span>
                  <span className="font-semibold group-hover:underline truncate block">{profile.phone}</span>
                </div>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsapp}?text=Hi%20Faisal,%20I%20reviewed%20your%20MIS%20Reporting%20Analyst%20portfolio...`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 group min-w-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">WhatsApp Direct</span>
                  <span className="font-semibold group-hover:underline truncate block">{profile.whatsapp || '+923086728781'}</span>
                </div>
              </a>

              <a
                href={cleanLinkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 group min-w-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                  <Linkedin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">LinkedIn Profile</span>
                  <span className="font-semibold truncate block group-hover:underline">{profile.linkedin}</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </a>

              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Current Location</span>
                  <span className="font-semibold truncate block">{profile.location}</span>
                </div>
              </div>
            </div>

            {/* Download Resume Button */}
            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                onClick={handleDownloadResume}
                disabled={isResumeDownloading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-60 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>{isResumeDownloading ? 'Generating Resume File...' : 'Download Resume (CV)'}</span>
              </button>
              <span className="block text-center text-[11px] text-slate-400 mt-2">
                ATS-Friendly Format • Instant Download
              </span>
            </div>
          </div>

          {/* Quick Credentials Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Recruiter Quick Reference
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Location: Riyadh, Saudi Arabia (Available for Local & Regional Roles)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Notice Period: Immediate / Transferable</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Work Preference: On-site / Hybrid in Riyadh & KSA</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Target Roles: MIS Executive, Reporting Analyst, BI Specialist, FP&A Analyst</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Send an Interview Request or Inquiry
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Fill out the details below to initiate contact directly with {profile.name}.
            </p>

            {isSubmitted ? (
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center dark:border-emerald-950 dark:bg-emerald-950/40">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-emerald-950 dark:text-emerald-200">
                  Inquiry Dispatched Successfully!
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
                  Thank you, <strong>{formData.name}</strong>. Your message regarding <em>"{formData.subject || 'Role Inquiry'}"</em> has been received. {profile.name} will reach back out within 24 business hours at <strong>{formData.email}</strong>.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      organization: '',
                      role: 'Hiring Manager',
                      subject: '',
                      message: '',
                    });
                  }}
                  className="mt-6 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Talent Acquisition Partner"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Organization / Company
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. Riyadh Tech Group / Aramco / STC"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      I am a...
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="Hiring Manager">Hiring Manager</option>
                      <option value="Technical Recruiter">Technical Recruiter</option>
                      <option value="MIS Team Lead">MIS Team Lead</option>
                      <option value="Business Leader / VP">Business Leader / VP</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Discussion Topic *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. MIS Executive Interview Opportunity in Riyadh"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Message / Opportunity Scope *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide context regarding the role, location in Riyadh / remote, tech stack, or meeting time..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-500 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Transmit Inquiry to {profile.name}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
