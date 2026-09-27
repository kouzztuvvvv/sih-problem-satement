import React from 'react';
import {
  Printer,
  X,
  Activity,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  QrCode,
  Download
} from 'lucide-react';
import { ScreeningResult } from '../types';

interface PrintableReportProps {
  screening: ScreeningResult;
  onClose: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ screening, onClose }) => {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const isHigh = screening.riskLevel === 'HIGH';
  const isMod = screening.riskLevel === 'MODERATE';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print p-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Printable Clinical Referral Slip & Patient Audit Summary
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="printable-card overflow-y-auto p-8 bg-white text-slate-900 text-xs font-sans print:p-0">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm uppercase tracking-wider text-teal-800">
                  NATIONAL HEALTH MISSION • NORTH EASTERN REGION
                </span>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                ArthroScan NER — Early Osteoarthritis Screening & Referral Slip
              </h1>
              <p className="text-[10px] text-slate-600">
                Department of Health & Family Welfare • SIH PS26004 Biomechanical AI Surveillance
              </p>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="p-1 border border-slate-300 rounded bg-slate-50">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <span className="font-mono text-[9px] text-slate-500 mt-1">
                {screening.referralId}
              </span>
            </div>
          </div>

          {/* Referral Metadata Bar */}
          <div className="grid grid-cols-4 gap-2 py-3 bg-slate-50 border-b border-slate-200 text-[11px] my-3 px-3 rounded">
            <div>
              <span className="text-slate-500 block text-[9px]">REFERRAL TOKEN:</span>
              <span className="font-mono font-bold text-slate-900">{screening.referralId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">SCREENING DATE:</span>
              <span className="font-bold text-slate-900">
                {new Date(screening.timestamp).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">ABHA HEALTH ID:</span>
              <span className="font-mono font-bold text-teal-800">
                {screening.patient.abhaId || 'N/A (Field Generated)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">SCREENING HEALTH WORKER:</span>
              <span className="font-bold text-slate-900 truncate block">
                {screening.ashaWorkerName}
              </span>
            </div>
          </div>

          {/* Patient Details */}
          <div className="border border-slate-200 rounded-lg p-3 my-3">
            <h2 className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
              Section 1: Patient Demographic & Geotagged Vocation
            </h2>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block">Full Name:</span>
                <span className="font-bold">{screening.patient.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Age / Gender:</span>
                <span className="font-bold">
                  {screening.patient.age} Years • {screening.patient.gender}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Phone:</span>
                <span className="font-mono">{screening.patient.phoneNumber || 'Local Field Record'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">District / State:</span>
                <span className="font-semibold">
                  {screening.patient.district}, {screening.patient.state}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Village / Locality:</span>
                <span>{screening.patient.village || 'Field Sub-centre'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Terrain Vocation:</span>
                <span className="font-semibold">{screening.patient.vocation}</span>
              </div>
            </div>
          </div>

          {/* Clinical Findings & Biometrics */}
          <div className="grid grid-cols-2 gap-3 my-3">
            {/* Left: Kinetic Tests */}
            <div className="border border-slate-200 rounded-lg p-3">
              <h2 className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                Section 2: AI Kinetic & Gait Analysis
              </h2>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">30s Chair Stand Test:</span>
                  <span className="font-bold font-mono">
                    {screening.kinetics.chairStand.completedReps} Repetitions
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Gait Asymmetry Index:</span>
                  <span className="font-bold font-mono">
                    {screening.kinetics.gait.asymmetryIndex.toFixed(1)}% (Ref: &lt;5%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Stance Duration (L vs R):</span>
                  <span className="font-mono">
                    {screening.kinetics.gait.leftStanceDurationSec}s / {screening.kinetics.gait.rightStanceDurationSec}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Active Knee Flexion:</span>
                  <span className="font-bold font-mono">
                    {screening.kinetics.rom.maxFlexionAngle}° / 135°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Extension Deficit / Contracture:</span>
                  <span className="font-mono">{screening.kinetics.rom.extensionDeficitAngle}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Audible Crepitus:</span>
                  <span className="font-semibold">
                    {screening.kinetics.rom.jointCrepitusPresent ? 'Present (+)' : 'Absent (-)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: WOMAC & Symptom Scores */}
            <div className="border border-slate-200 rounded-lg p-3">
              <h2 className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                Section 3: Symptom (WOMAC) Index
              </h2>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Pain Severity (Wong-Baker):</span>
                  <span className="font-bold font-mono">{screening.symptoms.painSeverity} / 10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Morning Stiffness Duration:</span>
                  <span className="font-bold font-mono">
                    {screening.symptoms.morningStiffnessMin} Minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Hilly Slope Difficulty:</span>
                  <span className="font-semibold">Grade {screening.symptoms.terrainDifficulty} / 4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Prior Joint Trauma:</span>
                  <span className="font-semibold">
                    {screening.symptoms.jointTraumaHistory ? 'Yes (Reported)' : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total WOMAC Index:</span>
                  <span className="font-bold font-mono text-teal-800">
                    {screening.womacScore} / 100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kinetic Deficit Index:</span>
                  <span className="font-bold font-mono">{screening.kineticDeficitScore} / 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Triage Decision Banner */}
          <div
            className={`p-3 rounded-lg border my-3 ${
              isHigh
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : isMod
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  TRIAGE CLASSIFICATION RESULT
                </span>
                <span className="text-sm font-black">
                  {screening.riskLevel === 'HIGH'
                    ? 'HIGH OSTEOARTHRITIS RISK — URGENT ORTHOPAEDIC REFERRAL'
                    : screening.riskLevel === 'MODERATE'
                    ? 'MODERATE OA RISK — TARGETED PHYSIOTHERAPY & MONITORING'
                    : 'LOW OA RISK — PREVENTIVE CARE & LIFESTYLE'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] block">COMPOSITE SCORE</span>
                <span className="text-base font-extrabold font-mono">
                  {screening.compositeRiskScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Directives & Designated Tertiary Medical College */}
          <div className="border border-slate-200 rounded-lg p-3 my-3">
            <h2 className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-1.5">
              Section 4: Designated Referral Center & Orthopaedic Orders
            </h2>
            <div className="text-[11px] mb-2 font-semibold text-slate-900">
              Assigned Apex Center:{' '}
              <span className="text-teal-900 font-bold">{screening.referralCenter}</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[10px] text-slate-700">
              {screening.clinicalRecommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* Official Sign-off & Hospital Stamp */}
          <div className="grid grid-cols-3 gap-6 pt-6 mt-6 border-t border-slate-300 text-[10px] text-slate-600">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1" />
              <span>Screening Field Officer / ASHA Signature</span>
            </div>
            <div className="text-center">
              <div className="h-10 border border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400 uppercase tracking-widest font-mono mb-1">
                [ OFFICIAL HEALTH SUB-CENTRE SEAL ]
              </div>
              <span>Digital Verification Stamp</span>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-400 mb-1" />
              <span>Attending Orthopaedic Medical Officer</span>
            </div>
          </div>

          {/* Confidentiality Notice */}
          <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-400 text-center">
            Generated via ArthroScan NER Biomechanical Surveillance Suite (SIH PS26004). Tele-consultation queue active under eSanjeevani integration.
          </div>
        </div>
      </div>
    </div>
  );
};
