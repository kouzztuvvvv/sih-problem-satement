import React, { useState } from 'react';
import {
  Activity,
  Moon,
  Sun,
  Globe,
  RefreshCw,
  Stethoscope,
  BarChart3,
  Mic,
  Search,
  Database,
  Menu,
  X
} from 'lucide-react';
import { ActiveRole, LanguageCode } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../utils/translations';

interface HeaderProps {
  currentRole: ActiveRole;
  onRoleChange: (role: ActiveRole) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  onSyncClick: () => void;
  isSyncing: boolean;
  onOpenLiveVoice: () => void;
  onOpenSearchGrounding: () => void;
  onOpenDatabase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  isDark,
  onToggleTheme,
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  onSyncClick,
  isSyncing,
  onOpenLiveVoice,
  onOpenSearchGrounding,
  onOpenDatabase,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5DFD0] dark:border-slate-800/80 bg-[#FAF7EE]/95 dark:bg-[#0B1120]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 h-11 flex items-center justify-between gap-1.5 sm:gap-2.5">
        {/* Left: Anchored Logo & Brand Name (Permanent, Never Moves) */}
        <div className="flex items-center gap-1.5 shrink-0 select-none">
          <div className="w-6 h-6 rounded-md bg-[#ECE5D3] dark:bg-slate-800 text-[#473F30] dark:text-teal-400 flex items-center justify-center border border-[#DDD5BF] dark:border-slate-700 shadow-xs shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-[11px] sm:text-xs tracking-tight text-[#2B2519] dark:text-slate-100 font-sans whitespace-nowrap">
            ArthroScan
          </span>

          {/* Desktop Online/Sync Indicator */}
          <div className="hidden lg:flex items-center gap-1 pl-1">
            <button
              type="button"
              onClick={onToggleOffline}
              className="h-6 px-2 rounded-md text-[9px] sm:text-[10px] font-medium bg-[#ECE5D3] dark:bg-slate-800/90 hover:bg-[#E4DBC5] dark:hover:bg-slate-700 text-[#554D3D] dark:text-slate-300 border border-[#DDD5BF] dark:border-slate-700 inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Click to toggle simulated offline field environment"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOffline ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <span>{isOffline ? 'Offline' : 'Online'}</span>
            </button>

            {pendingSyncCount > 0 && (
              <button
                type="button"
                onClick={onSyncClick}
                disabled={isSyncing}
                className="h-6 px-1.5 rounded-md text-[9px] font-bold bg-amber-100/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300/70 dark:border-amber-800 inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Sync locally queued records"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{pendingSyncCount}</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Desktop Segmented Role Switcher (Hidden on Mobile/Tablet to Prevent Overflow) */}
        <div className="hidden lg:flex items-center bg-[#ECE5D3] dark:bg-slate-800/80 p-0.5 rounded-md border border-[#DDD5BF] dark:border-slate-700 shadow-xs shrink-0">
          <button
            type="button"
            onClick={() => onRoleChange('field_worker')}
            className={`h-5.5 px-2 rounded text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
              currentRole === 'field_worker'
                ? 'bg-[#FCFAF2] dark:bg-slate-900 text-[#2B2519] dark:text-slate-100 font-semibold shadow-xs border border-[#DDD5BF] dark:border-slate-700'
                : 'text-[#6A614F] dark:text-slate-400 hover:text-[#2B2519] dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Stethoscope className="w-3 h-3 text-[#6A614F] dark:text-slate-400" />
            <span>{t.portalField}</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('medical_officer')}
            className={`h-5.5 px-2 rounded text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
              currentRole === 'medical_officer'
                ? 'bg-[#FCFAF2] dark:bg-slate-900 text-[#2B2519] dark:text-slate-100 font-semibold shadow-xs border border-[#DDD5BF] dark:border-slate-700'
                : 'text-[#6A614F] dark:text-slate-400 hover:text-[#2B2519] dark:hover:text-slate-200 font-medium'
            }`}
          >
            <BarChart3 className="w-3 h-3 text-[#6A614F] dark:text-slate-400" />
            <span>{t.portalAdmin}</span>
          </button>
        </div>

        {/* Right Side: Desktop Actions & Unified Mobile Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Desktop Only Actions */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* Voice AI */}
            <button
              type="button"
              onClick={onOpenLiveVoice}
              className="h-6.5 px-2 rounded-md text-[11px] font-medium bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#473F30] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="Start real-time voice conversation with Gemini 3.8 Live API"
            >
              <Mic className="w-3 h-3 text-[#5A503E] dark:text-teal-400" />
              <span>Voice AI</span>
            </button>

            {/* Research */}
            <button
              type="button"
              onClick={onOpenSearchGrounding}
              className="h-6.5 px-2 rounded-md text-[11px] font-medium bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#473F30] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="Search clinical guidelines grounded with Google Search (gemini-3.5-flash)"
            >
              <Search className="w-3 h-3 text-[#5A503E] dark:text-teal-400" />
              <span>Research</span>
            </button>

            {/* Database */}
            {onOpenDatabase && (
              <button
                type="button"
                onClick={onOpenDatabase}
                className="h-6.5 px-2 rounded-md text-[11px] font-medium bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#473F30] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                title="View and manage persistent database records"
              >
                <Database className="w-3 h-3 text-[#5A503E] dark:text-teal-400" />
                <span>Database</span>
              </button>
            )}

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3 h-3 text-[#706653] dark:text-slate-400 absolute left-1.5 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                aria-label="Select Language"
                className="h-6.5 pl-5 pr-1.5 rounded-md text-[11px] font-medium bg-[#ECE5D3] dark:bg-slate-800 text-[#473F30] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700 focus:outline-none cursor-pointer transition-colors"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Online status indicator on Mobile/Tablet */}
          <button
            type="button"
            onClick={onToggleOffline}
            className="lg:hidden h-6 px-1.5 rounded-md bg-[#ECE5D3] dark:bg-slate-800 border border-[#DDD5BF] dark:border-slate-700 flex items-center gap-1 text-[9px] font-medium text-[#554D3D] dark:text-slate-300"
            title="Toggle offline mode"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOffline ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
          </button>

          {/* Dark / Light Mode Toggle (ALWAYS VISIBLE in this line on mobile, tablet, and desktop) */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle Light and Dark Mode"
            className="h-6 w-6 sm:h-6.5 sm:w-6.5 rounded-md flex items-center justify-center bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#DDD5BF] dark:border-slate-700 text-[#473F30] dark:text-slate-200 transition-colors cursor-pointer shrink-0"
            title={isDark ? 'Switch to Subtle Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#554D3D]" />
            )}
          </button>

          {/* Navigation Button on Mobile / Tablet Layout */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden h-6 sm:h-6.5 px-2 rounded-md flex items-center gap-1 bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#DDD5BF] dark:border-slate-700 text-[#473F30] dark:text-slate-200 text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
            title="Open Navigation & Tools"
          >
            {isMobileMenuOpen ? (
              <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            ) : (
              <Menu className="w-3.5 h-3.5 text-[#473F30] dark:text-slate-200" />
            )}
            <span>Nav</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5DFD0] dark:border-slate-800 bg-[#FCFAF2] dark:bg-[#111B2E] px-3 py-2.5 space-y-2.5 shadow-md animate-in slide-in-from-top-1 duration-150">
          {/* Role Navigation Switcher */}
          <div>
            <span className="text-[9px] uppercase font-bold text-[#736B59] dark:text-slate-400 block mb-1">
              Active Portal
            </span>
            <div className="grid grid-cols-2 gap-1.5 bg-[#ECE5D3] dark:bg-slate-800/80 p-0.5 rounded-lg border border-[#DDD5BF] dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  onRoleChange('field_worker');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-1.5 px-2 rounded-md text-[11px] flex items-center justify-center gap-1.5 font-medium transition-all ${
                  currentRole === 'field_worker'
                    ? 'bg-[#FCFAF2] dark:bg-slate-900 text-[#2B2519] dark:text-slate-100 font-bold shadow-xs border border-[#DDD5BF] dark:border-slate-700'
                    : 'text-[#6A614F] dark:text-slate-400'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{t.portalField}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onRoleChange('medical_officer');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-1.5 px-2 rounded-md text-[11px] flex items-center justify-center gap-1.5 font-medium transition-all ${
                  currentRole === 'medical_officer'
                    ? 'bg-[#FCFAF2] dark:bg-slate-900 text-[#2B2519] dark:text-slate-100 font-bold shadow-xs border border-[#DDD5BF] dark:border-slate-700'
                    : 'text-[#6A614F] dark:text-slate-400'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t.portalAdmin}</span>
              </button>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div>
            <span className="text-[9px] uppercase font-bold text-[#736B59] dark:text-slate-400 block mb-1">
              Clinical AI Tools & Records
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onOpenLiveVoice();
                  setIsMobileMenuOpen(false);
                }}
                className="py-1.5 px-2 rounded-lg bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#DDD5BF] dark:border-slate-700 text-[#2B2519] dark:text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Mic className="w-3 h-3 text-[#5A503E] dark:text-teal-400" />
                <span>Voice AI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenSearchGrounding();
                  setIsMobileMenuOpen(false);
                }}
                className="py-1.5 px-2 rounded-lg bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#DDD5BF] dark:border-slate-700 text-[#2B2519] dark:text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Search className="w-3 h-3 text-[#5A503E] dark:text-teal-400" />
                <span>Research</span>
              </button>

              {onOpenDatabase && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDatabase();
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-1.5 px-2 rounded-lg bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#DDD5BF] dark:border-slate-700 text-[#2B2519] dark:text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Database className="w-3 h-3 text-amber-600 dark:text-teal-400" />
                  <span>Database</span>
                </button>
              )}
            </div>
          </div>

          {/* Language Selector in Drawer */}
          <div className="flex items-center justify-between pt-1 border-t border-[#E5DFD0]/60 dark:border-slate-800/60">
            <span className="text-[10px] text-[#736B59] dark:text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Language:
            </span>
            <select
              value={language}
              onChange={(e) => {
                onLanguageChange(e.target.value as LanguageCode);
                setIsMobileMenuOpen(false);
              }}
              aria-label="Select Language"
              className="h-6 pl-2 pr-1 rounded-md text-[10px] font-medium bg-[#ECE5D3] dark:bg-slate-800 text-[#473F30] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </header>
  );
};
