import React from 'react';
import {
  Activity,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Globe,
  RefreshCw,
  Stethoscope,
  BarChart3,
  ShieldCheck
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
  isSyncing
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      {/* Top Offline / Status Banner */}
      <div
        className={`w-full py-1 px-4 text-xs font-medium flex items-center justify-between transition-colors duration-200 ${
          isOffline
            ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-b border-amber-500/20'
            : 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-b border-teal-500/20'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOffline ? 'bg-amber-400' : 'bg-teal-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOffline ? 'bg-amber-500' : 'bg-teal-500'
                }`}
              />
            </span>
            <span>{isOffline ? t.offlineStatus : t.onlineStatus}</span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500 text-[10px]">
              • SIH PS26004
            </span>
          </div>

          <div className="flex items-center gap-3">
            {pendingSyncCount > 0 && (
              <button
                onClick={onSyncClick}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 transition-colors text-[11px] font-semibold"
                title="Click to sync locally stored screening records"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`}
                />
                <span>
                  {pendingSyncCount} {t.pendingSync} • {t.syncNow}
                </span>
              </button>
            )}

            <button
              onClick={onToggleOffline}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline decoration-dotted cursor-pointer"
              title="Toggle simulated offline field environment"
            >
              {isOffline ? (
                <>
                  <Wifi className="w-3 h-3 text-teal-500" />
                  <span>Go Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-500" />
                  <span>Simulate Field Offline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3.5 group cursor-pointer select-none">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/25 ring-1 ring-white/30 dark:ring-teal-400/20 group-hover:scale-105 transition-transform duration-300">
              <Activity className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-50 font-sans">
                ArthroScan <span className="bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-300 bg-clip-text text-transparent font-black">NER</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 tracking-wide shadow-xs">
                AI OA-Triage
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 tracking-normal hidden sm:block">
              North Eastern Region Early Osteoarthritis Detection Platform
            </p>
          </div>
        </div>

        {/* Portal Role Tabs - Pill Slider Style */}
        <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs backdrop-blur-sm">
          <button
            onClick={() => onRoleChange('field_worker')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
              currentRole === 'field_worker'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm font-bold ring-1 ring-slate-200/80 dark:ring-slate-700/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium hover:bg-white/40 dark:hover:bg-slate-700/40'
            }`}
          >
            <div className={`p-1 rounded-lg ${currentRole === 'field_worker' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline">{t.portalField}</span>
            <span className="md:hidden">Field Worker</span>
          </button>
          <button
            onClick={() => onRoleChange('medical_officer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
              currentRole === 'medical_officer'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm font-bold ring-1 ring-slate-200/80 dark:ring-slate-700/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium hover:bg-white/40 dark:hover:bg-slate-700/40'
            }`}
          >
            <div className={`p-1 rounded-lg ${currentRole === 'medical_officer' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline">{t.portalAdmin}</span>
            <span className="md:hidden">Analytics & MO</span>
          </button>
        </div>

        {/* Utilities: Language & Theme */}
        <div className="flex items-center gap-2.5">
          {/* Vernacular Language Selector */}
          <div className="relative flex items-center group">
            <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors absolute left-2.5 pointer-events-none" />
            <select
              value={language}
              onChange={e => onLanguageChange(e.target.value as LanguageCode)}
              aria-label="Select NER Language"
              className="pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500/50 shadow-xs cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/70 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
