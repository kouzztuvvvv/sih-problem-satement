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
import { LiveVoiceConsultant } from './components/LiveVoiceConsultant';
import { SearchGroundingModal } from './components/SearchGroundingModal';
import { DatabaseModal } from './components/DatabaseModal';
import { TRANSLATIONS } from './utils/translations';
import { computeCompositeScreening } from './utils/scoring';
import {
  saveScreeningToDatabase,
  fetchDatabaseScreenings
} from './utils/databaseApi';
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
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Database
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
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.classList.add('dark');
      body?.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      localStorage.setItem('arthroscan_theme', 'dark');
    } else {
      root.classList.remove('dark');
      body?.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
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

  // Live Voice API (gemini-3.8-live) Modal State
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [liveVoiceContext, setLiveVoiceContext] = useState<string>('');

  // Google Search Grounding (gemini-3.5-flash) Modal State
  const [isSearchGroundingOpen, setIsSearchGroundingOpen] = useState(false);
  const [searchGroundingQuery, setSearchGroundingQuery] = useState<string>('');
  const [searchGroundingContext, setSearchGroundingContext] = useState<string>('');

  // Database Modal State
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);

  // Sync server database on initial load
  useEffect(() => {
    fetchDatabaseScreenings()
      .then(records => {
        if (records && records.length > 0) {
          setScreeningsList(records);
        }
      })
      .catch(e => console.warn('Could not sync initial db screenings:', e));
  }, []);

  const handleOpenLiveVoice = (context?: string) => {
    setLiveVoiceContext(
      context ||
        `Current patient: ${patientData.fullName || 'Screening in progress'}, ${patientData.age}y, ${patientData.gender} from ${patientData.district}, ${patientData.state}. Vocation: ${patientData.vocation}.`
    );
    setIsLiveVoiceOpen(true);
  };

  const handleOpenSearchGrounding = (defaultQ?: string, context?: string) => {
    setSearchGroundingQuery(
      defaultQ ||
        'Latest ICMR guidelines for early knee osteoarthritis screening and diagnosis in rural India'
    );
    setSearchGroundingContext(
      context ||
        `Patient: ${patientData.fullName || 'Anonymous'}, ${patientData.age}y ${patientData.gender}, ${patientData.state}. Vocation: ${patientData.vocation}.`
    );
    setIsSearchGroundingOpen(true);
  };

  // Touch Swipe Support for mobile and tablets
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    // Detect horizontal swipe (at least 45px distance and horizontal direction)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        // Swiped Left -> go to Next Step
        handleStepForward();
      } else {
        // Swiped Right -> go to Previous Step
        handleStepBack();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const handleStepForward = () => {
    if (activeStep === 3) {
      handleCalculateAndTriage();
    } else if (activeStep < 5) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleLoadPatientFromDatabase = (pat: PatientDemographics) => {
    setPatientData(pat);
    setActiveStep(1);
  };

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

  // Transition from Step 3 to Step 4 (Compute and Save Screening to Database)
  const handleCalculateAndTriage = async () => {
    const result = computeCompositeScreening(patientData, kineticData, symptomData);
    saveScreening(result, isOffline);
    try {
      await saveScreeningToDatabase(result);
    } catch (e) {
      console.warn('Could not auto-save to database:', e);
    }
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
    <div className="min-h-screen bg-[#FAF7EE] dark:bg-[#0B1120] text-[#332D22] dark:text-[#E2E8F0] flex flex-col font-sans transition-colors duration-200">
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
        onOpenLiveVoice={() => handleOpenLiveVoice()}
        onOpenSearchGrounding={() => handleOpenSearchGrounding()}
        onOpenDatabase={() => setIsDatabaseOpen(true)}
      />

      {/* Main Content Area with Touch-Swipe gesture accessibility */}
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 select-none-touch"
      >
        {/* Role 1: Field Healthcare Worker Portal */}
        {currentRole === 'field_worker' && (
          <div className="space-y-6">
            {/* Field Stepper Bar - Plain, Aligned, Toggleable with Left/Right arrows & Swipeable */}
            <div className="bg-[#FCFAF2] dark:bg-slate-900/90 rounded-2xl border border-[#E5DFD0] dark:border-slate-800/80 p-2 sm:p-2.5 shadow-xs backdrop-blur-md">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Left Toggle Button (<) */}
                <button
                  type="button"
                  onClick={handleStepBack}
                  disabled={activeStep <= 1}
                  aria-label="Previous step"
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                    activeStep > 1
                      ? 'bg-[#ECE5D3] hover:bg-[#E4DBC5] text-[#2B2519] border-[#DDD5BF] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-2xs'
                      : 'bg-[#F5F1E5]/40 text-[#9C9381]/50 border-transparent dark:bg-slate-800/20 dark:text-slate-600 cursor-not-allowed'
                  }`}
                  title="Toggle to previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Steps Horizontal Track */}
                <div className="flex-1 overflow-x-auto scroll-smooth touch-pan-x flex items-center justify-between min-w-0 px-1">
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
                          className={`group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer shrink-0 ${
                            isActive
                              ? 'bg-[#ECE5D3] dark:bg-slate-800 text-[#2B2519] dark:text-slate-100 font-bold border border-[#DDD5BF] dark:border-slate-700 shadow-xs'
                              : isCompleted
                              ? 'text-[#486356] dark:text-emerald-400 font-semibold hover:bg-[#F3EFE3] dark:hover:bg-slate-800/50'
                              : 'text-[#847B6A] hover:text-[#332D22] dark:text-slate-500 dark:hover:text-slate-300 hover:bg-[#F3EFE3] dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div
                            className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center text-xs font-bold transition-transform duration-200 group-hover:scale-105 ${
                              isActive
                                ? 'bg-[#383124] text-white dark:bg-teal-500 dark:text-slate-950 shadow-xs'
                                : isCompleted
                                ? 'bg-[#E0DAC6] text-[#3A3325] dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-[#EFE8D6] dark:bg-slate-800 text-[#847B6A] dark:text-slate-500'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="text-left">
                            <span
                              className={`text-[9px] uppercase tracking-wider font-bold block leading-none ${
                                isActive
                                  ? 'text-[#5E5442] dark:text-teal-400'
                                  : isCompleted
                                  ? 'text-[#486356] dark:text-emerald-400'
                                  : 'text-[#847B6A] dark:text-slate-500'
                              }`}
                            >
                              Step 0{st.number}
                            </span>
                            <span className="text-[11px] font-semibold leading-tight block mt-0.5 whitespace-nowrap">
                              {st.label}
                            </span>
                          </div>
                        </button>

                        {idx < steps.length - 1 && (
                          <div className="flex-1 px-1 sm:px-1.5 flex items-center min-w-4 sm:min-w-6">
                            <div
                              className={`w-full h-0.5 rounded-full transition-all duration-300 ${
                                activeStep > idx + 1
                                  ? 'bg-[#9C927D] dark:bg-teal-500/60'
                                  : 'bg-[#E5DFD0] dark:bg-slate-800'
                              }`}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Toggle Button (>) */}
                <button
                  type="button"
                  onClick={handleStepForward}
                  disabled={activeStep >= 5}
                  aria-label="Next step"
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                    activeStep < 5
                      ? 'bg-[#ECE5D3] hover:bg-[#E4DBC5] text-[#2B2519] border-[#DDD5BF] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-2xs'
                      : 'bg-[#F5F1E5]/40 text-[#9C9381]/50 border-transparent dark:bg-slate-800/20 dark:text-slate-600 cursor-not-allowed'
                  }`}
                  title="Toggle to next step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Swipe Hint and Toggle Helper Bar */}
              <div className="flex sm:hidden items-center justify-between pt-1.5 mt-1.5 border-t border-[#E5DFD0]/60 dark:border-slate-800/60 text-[10px] text-[#736B59] dark:text-slate-400 px-1">
                <span>← Swipe left/right or tap &lt; &gt; to toggle</span>
                <span className="font-semibold text-[#2B2519] dark:text-slate-200">
                  Step {activeStep} of 5
                </span>
              </div>
            </div>

            {/* Stepper Views */}
            {activeStep === 1 && (
              <PatientOnboarding
                data={patientData}
                onChange={setPatientData}
                onNext={() => setActiveStep(2)}
                language={language}
                onOpenDatabase={() => setIsDatabaseOpen(true)}
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
                onOpenLiveVoice={(ctx) => handleOpenLiveVoice(ctx)}
                onOpenSearchGrounding={(q, ctx) => handleOpenSearchGrounding(q, ctx)}
                onOpenDatabase={() => setIsDatabaseOpen(true)}
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

      {/* Real-time Voice Consultation Modal (Gemini 3.8 Live API) */}
      <LiveVoiceConsultant
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        patientContext={liveVoiceContext}
      />

      {/* Grounded Clinical Research Modal (Gemini 3.5 Flash + Google Search) */}
      <SearchGroundingModal
        isOpen={isSearchGroundingOpen}
        onClose={() => setIsSearchGroundingOpen(false)}
        defaultQuery={searchGroundingQuery}
        patientContext={searchGroundingContext}
      />

      {/* Persistent Server Database Explorer Modal */}
      <DatabaseModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
        onLoadPatient={handleLoadPatientFromDatabase}
      />

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
