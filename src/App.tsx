/**
 * ArthroScan NER — Early Detection and Screening Platform for Osteoarthritis (OA)
 * North Eastern Region of India (SIH PS26004)
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveRole,
  KineticAssessmentData,
  LanguageCode,
  PatientDemographics,
  ScreeningResult,
  SymptomAssessmentData
} from './types';
import { Header } from './components/Header';
import { PatientOnboarding } from './components/PatientOnboarding';
import { GaitCameraSimulator } from './components/GaitCameraSimulator';
import { SymptomAssessment } from './components/SymptomAssessment';
import { TriageReport } from './components/TriageReport';
import { PreventiveCare } from './components/PreventiveCare';
import { AdminAnalytics } from './components/AdminAnalytics';
import { PrintableReport } from './components/PrintableReport';
import { TRANSLATIONS } from './utils/translations';
import { computeCompositeScreening } from './utils/scoring';
import {
  getOfflineSimulatedStatus,
  getStoredScreenings,
  saveScreening,
  setOfflineSimulatedStatus,
  syncPendingScreenings
} from './utils/storage';
import {
  User,
  Activity,
  HeartPulse,
  FileCheck,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  WifiOff
} from 'lucide-react';

const DEFAULT_PATIENT: PatientDemographics = {
  fullName: 'Bamonlang Kharbangar',
  age: 58,
  gender: 'Female',
  state: 'Meghalaya',
  district: 'East Khasi Hills (Shillong)',
  village: 'Mawkdok Village',
  vocation: 'Hillside Farming & Terrace Cultivation',
  abhaId: '91-4829-1049-5821',
  phoneNumber: '+91 98620 44102',
  primaryLanguage: 'kha'
};

const DEFAULT_KINETICS: KineticAssessmentData = {
  chairStand: {
    completedReps: 8,
    avgFlexionAngle: 86,
    testDurationSeconds: 30,
    fatigueIndex: 42,
    completed: true
  },
  gait: {
    asymmetryIndex: 12.4,
    leftStanceDurationSec: 0.82,
    rightStanceDurationSec: 0.63,
    strideVariabilityPercent: 7.2,
    cadenceStepsPerMin: 86,
    completed: true
  },
  rom: {
    maxFlexionAngle: 104,
    extensionDeficitAngle: 10,
    jointCrepitusPresent: true,
    affectedKnee: 'Both',
    completed: true
  }
};

const DEFAULT_SYMPTOMS: SymptomAssessmentData = {
  painSeverity: 7,
  morningStiffnessMin: 40,
  terrainDifficulty: 3,
  flatWalkDifficulty: 2,
  jointTraumaHistory: true,
  carryingHeavyLoadDaily: true,
  jointSwelling: true,
  weatherSensitivity: true
};

export default function App() {
  // Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arthroscan_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync theme with document class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('arthroscan_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('arthroscan_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // App Role & Language
  const [currentRole, setCurrentRole] = useState<ActiveRole>('field_worker');
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Offline Simulation State
  const [isOffline, setIsOffline] = useState<boolean>(() => getOfflineSimulatedStatus());

  const handleToggleOffline = () => {
    const next = !isOffline;
    setIsOffline(next);
    setOfflineSimulatedStatus(next);
  };

  // Field Worker Stepper (1 to 5)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Patient Screening Data States
  const [patientData, setPatientData] = useState<PatientDemographics>(DEFAULT_PATIENT);
  const [kineticData, setKineticData] = useState<KineticAssessmentData>(DEFAULT_KINETICS);
  const [symptomData, setSymptomData] = useState<SymptomAssessmentData>(DEFAULT_SYMPTOMS);

  // Computed Screening Result
  const [currentScreening, setCurrentScreening] = useState<ScreeningResult>(() =>
    computeCompositeScreening(DEFAULT_PATIENT, DEFAULT_KINETICS, DEFAULT_SYMPTOMS)
  );

  // Printable Report Modal
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<ScreeningResult | null>(null);

  // Storage and Sync Queue
  const [screeningsList, setScreeningsList] = useState<ScreeningResult[]>(() =>
    getStoredScreenings()
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingCount = screeningsList.filter(s => s.syncStatus === 'pending').length;

  const refreshScreenings = () => {
    setScreeningsList(getStoredScreenings());
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const { updated } = syncPendingScreenings();
      setScreeningsList(updated);
      setIsSyncing(false);
    }, 1200);
  };

  // Transition from Step 3 to Step 4 (Compute and Save Screening)
  const handleCalculateAndTriage = () => {
    const result = computeCompositeScreening(patientData, kineticData, symptomData);
    saveScreening(result, isOffline);
    setCurrentScreening(result);
    refreshScreenings();
    setActiveStep(4);
  };

  // Reset to screen new patient
  const handleStartNewPatient = () => {
    setPatientData({
      fullName: '',
      age: 45,
      gender: 'Female',
      state: 'Meghalaya',
      district: 'East Khasi Hills (Shillong)',
      village: '',
      vocation: 'Hillside Farming & Terrace Cultivation',
      primaryLanguage: language
    });
    setKineticData({
      chairStand: { completedReps: 12, avgFlexionAngle: 96, testDurationSeconds: 30, fatigueIndex: 20, completed: false },
      gait: { asymmetryIndex: 6.2, leftStanceDurationSec: 0.72, rightStanceDurationSec: 0.68, strideVariabilityPercent: 4.2, cadenceStepsPerMin: 100, completed: false },
      rom: { maxFlexionAngle: 120, extensionDeficitAngle: 4, jointCrepitusPresent: false, affectedKnee: 'Both', completed: false }
    });
    setSymptomData({
      painSeverity: 4,
      morningStiffnessMin: 15,
      terrainDifficulty: 2,
      flatWalkDifficulty: 1,
      jointTraumaHistory: false,
      carryingHeavyLoadDaily: true,
      jointSwelling: false,
      weatherSensitivity: true
    });
    setActiveStep(1);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const steps = [
    { number: 1, label: t.step1, icon: User },
    { number: 2, label: t.step2, icon: Activity },
    { number: 3, label: t.step3, icon: HeartPulse },
    { number: 4, label: t.step4, icon: FileCheck },
    { number: 5, label: t.step5, icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#334155] dark:text-[#E2E8F0] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        language={language}
        onLanguageChange={setLanguage}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        pendingSyncCount={pendingCount}
        onSyncClick={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Role 1: Field Healthcare Worker Portal */}
        {currentRole === 'field_worker' && (
          <div className="space-y-6">
            {/* Field Stepper Bar - Elegant Glassmorphic Progress Indicator */}
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 sm:p-4 shadow-xs backdrop-blur-md overflow-x-auto">
              <div className="flex items-center justify-between min-w-[640px] px-1">
                {steps.map((st, idx) => {
                  const Icon = st.icon;
                  const isActive = activeStep === st.number;
                  const isCompleted = activeStep > st.number;

                  return (
                    <React.Fragment key={st.number}>
                      <button
                        type="button"
                        onClick={() => {
                          if (st.number === 4) handleCalculateAndTriage();
                          else setActiveStep(st.number);
                        }}
                        className={`group flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-teal-500/15 to-emerald-500/10 text-teal-800 dark:text-teal-200 font-bold border border-teal-500/30 shadow-xs'
                            : isCompleted
                            ? 'text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-transform duration-200 group-hover:scale-105 ${
                            isActive
                              ? 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-sm shadow-teal-500/30 ring-2 ring-teal-500/20'
                              : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <span
                            className={`text-[9px] uppercase tracking-wider font-extrabold block leading-none ${
                              isActive
                                ? 'text-teal-600 dark:text-teal-400'
                                : isCompleted
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            Step 0{st.number}
                          </span>
                          <span className="text-xs font-semibold leading-tight block mt-0.5">{st.label}</span>
                        </div>
                      </button>

                      {idx < steps.length - 1 && (
                        <div className="flex-1 px-2 flex items-center">
                          <div
                            className={`w-full h-1 rounded-full transition-all duration-300 ${
                              activeStep > idx + 1
                                ? 'bg-gradient-to-r from-teal-500/60 to-emerald-500/60 shadow-xs'
                                : 'bg-slate-200/80 dark:bg-slate-800/80'
                            }`}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Stepper Views */}
            {activeStep === 1 && (
              <PatientOnboarding
                data={patientData}
                onChange={setPatientData}
                onNext={() => setActiveStep(2)}
                language={language}
              />
            )}

            {activeStep === 2 && (
              <GaitCameraSimulator
                data={kineticData}
                onChange={setKineticData}
                onNext={() => setActiveStep(3)}
                onBack={() => setActiveStep(1)}
                language={language}
              />
            )}

            {activeStep === 3 && (
              <SymptomAssessment
                data={symptomData}
                onChange={setSymptomData}
                onNext={handleCalculateAndTriage}
                onBack={() => setActiveStep(2)}
                language={language}
              />
            )}

            {activeStep === 4 && (
              <TriageReport
                screening={currentScreening}
                onOpenPrintModal={() => setSelectedRecordForPrint(currentScreening)}
                onViewGuidance={() => setActiveStep(5)}
                onStartNew={handleStartNewPatient}
                language={language}
              />
            )}

            {activeStep === 5 && (
              <PreventiveCare
                language={language}
                onDone={() => setActiveStep(4)}
              />
            )}
          </div>
        )}

        {/* Role 2: Medical Officer / Admin Analytics View */}
        {currentRole === 'medical_officer' && (
          <AdminAnalytics
            screenings={screeningsList}
            onSync={handleSync}
            isSyncing={isSyncing}
            onViewRecord={rec => setSelectedRecordForPrint(rec)}
            onRefreshData={refreshScreenings}
          />
        )}
      </main>

      {/* Printable Clinical Referral Slip Modal */}
      {selectedRecordForPrint && (
        <PrintableReport
          screening={selectedRecordForPrint}
          onClose={() => setSelectedRecordForPrint(null)}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 no-print transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">ArthroScan NER</span>
            <span>• SIH Problem Statement ID: PS26004</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Assam</span>
            <span>•</span>
            <span>Meghalaya</span>
            <span>•</span>
            <span>Manipur</span>
            <span>•</span>
            <span>Mizoram</span>
            <span>•</span>
            <span>Nagaland</span>
            <span>•</span>
            <span>Tripura</span>
            <span>•</span>
            <span>Arunachal</span>
            <span>•</span>
            <span>Sikkim</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
