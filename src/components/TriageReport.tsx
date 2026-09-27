import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Printer,
  Share2,
  Calendar,
  MapPin,
  Activity,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  QrCode,
  Download,
  BookOpen
} from 'lucide-react';
import { LanguageCode, ScreeningResult } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface TriageReportProps {
  screening: ScreeningResult;
  onOpenPrintModal: () => void;
  onViewGuidance: () => void;
  onStartNew: () => void;
  language: LanguageCode;
}

export const TriageReport: React.FC<TriageReportProps> = ({
  screening,
  onOpenPrintModal,
  onViewGuidance,
  onStartNew,
  language
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    if (screening.riskLevel === 'LOW') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [screening.riskLevel]);

  const isLow = screening.riskLevel === 'LOW';
  const isMod = screening.riskLevel === 'MODERATE';
  const isHigh = screening.riskLevel === 'HIGH';

  return (
    <div className="space-y-6">
      {/* Primary Triage Alert Card */}
      <div
        className={`rounded-2xl border p-6 md:p-8 transition-all ${
          isHigh
            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
            : isMod
            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
            : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isHigh
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : isMod
                  ? 'bg-amber-500 text-white shadow-amber-500/30'
                  : 'bg-emerald-500 text-white shadow-emerald-500/30'
              }`}
            >
              {isHigh ? (
                <ShieldAlert className="w-8 h-8" />
              ) : isMod ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <ShieldCheck className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isHigh
                      ? 'bg-rose-500/20 text-rose-800 dark:text-rose-200'
                      : isMod
                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200'
                      : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  {isHigh ? t.riskHigh : isMod ? t.riskMod : t.riskLow}
                </span>

                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Token: {screening.referralId}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                Composite OA Risk Score: {screening.compositeRiskScore} / 100
              </h1>

              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isHigh
                  ? 'Marked biomechanical deficit with clinical osteoarthritis symptoms. Fast-track tele-consultation and orthopaedic referral slip have been generated.'
                  : isMod
                  ? 'Early onset degenerative cartilage signs with moderate gait asymmetry. Recommended for targeted isometric physiotherapy and 3-month community monitoring.'
                  : 'Normal biomechanical alignment with minimal joint discomfort. Recommended for lifestyle preservation, load distribution training, and annual review.'}
              </p>
            </div>
          </div>

          {/* Quick Print & Action Buttons */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t.downloadSlip}</span>
            </button>

            <button
              type="button"
              onClick={onViewGuidance}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20 cursor-pointer transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Vernacular Care Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Summary & Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Patient Bio */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Patient Bio
            </h3>
          </div>

          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Name:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {screening.patient.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Age / Gender:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {screening.patient.age} yrs • {screening.patient.gender}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Location:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                {screening.patient.district}, {screening.patient.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vocation:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[160px]">
                {screening.patient.vocation}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ABHA ID:</span>
              <span className="font-mono text-teal-600 dark:text-teal-400">
                {screening.patient.abhaId || 'Not Linked'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Biomechanical Gait Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Activity className="w-4 h-4 text-teal-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Biomechanical Findings
            </h3>
          </div>

          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Chair Stand (30s):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {screening.kinetics.chairStand.completedReps} reps
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gait Asymmetry:</span>
              <span
                className={`font-mono font-bold ${
                  screening.kinetics.gait.asymmetryIndex > 10
                    ? 'text-rose-500'
                    : screening.kinetics.gait.asymmetryIndex > 5
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }`}
              >
                {screening.kinetics.gait.asymmetryIndex.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Max Knee Flexion:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {screening.kinetics.rom.maxFlexionAngle}° / 135°
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Joint Crepitus:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {screening.kinetics.rom.jointCrepitusPresent ? 'Detected' : 'Absent'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Kinetic Deficit:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {screening.kineticDeficitScore} / 100
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Referral Ticket & Tertiary Center */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Referral Center
                </h3>
              </div>
              <QrCode className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned Apex Tertiary Hospital:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 leading-snug block mt-0.5">
                  {screening.referralCenter}
                </span>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 block text-[10px]">Screening Officer / Center:</span>
                <span className="text-slate-700 dark:text-slate-300 block font-medium">
                  {screening.ashaWorkerName}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">ABDM Sync:</span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              {screening.syncStatus === 'synced' ? 'Cloud Synced' : 'Queued Locally'}
            </span>
          </div>
        </div>
      </div>

      {/* Key Risk Factors Identified & Recommended Clinical Pathways */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
          Identified Clinical Risk Factors & Automated Care Pathways
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Factors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Primary Identified Contributors
            </h4>
            <ul className="space-y-2">
              {screening.primaryFactors.map((factor, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actionable Clinical Directives */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Clinical Action Directives
            </h4>
            <ul className="space-y-2">
              {screening.clinicalRecommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-teal-50/50 dark:bg-teal-950/20 p-2.5 rounded-xl border border-teal-100 dark:border-teal-900/40"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={onStartNew}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
        >
          Screen Next Patient
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenPrintModal}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Print Official Referral Slip</span>
          </button>

          <button
            type="button"
            onClick={onViewGuidance}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20 cursor-pointer transition-all active:scale-95"
          >
            <span>Proceed to Care Guides</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
