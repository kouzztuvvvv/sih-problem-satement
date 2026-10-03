import React, { useState, useMemo } from 'react';
import {
  Users,
  Activity,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  RefreshCw,
  Download,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  PieChart
} from 'lucide-react';
import { NERState, ScreeningResult, RiskLevel } from '../types';
import {
  exportScreeningsAsCSV,
  exportScreeningsAsJSON,
  resetDemoScreenings,
  getReturningPatientsSummary,
  ReturningPatientSummary
} from '../utils/storage';
import { PainProgressionChart } from './PainProgressionChart';
import { AdminQuickStats } from './AdminQuickStats';
import { AdminFilterBar, DatePreset } from './AdminFilterBar';

interface AdminAnalyticsProps {
  screenings: ScreeningResult[];
  onSync: () => void;
  isSyncing: boolean;
  onViewRecord: (record: ScreeningResult) => void;
  onRefreshData: () => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  screenings,
  onSync,
  isSyncing,
  onViewRecord,
  onRefreshData
}) => {
  // Multi-parameter Search & Filter State
  const [patientSearch, setPatientSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleResetAllFilters = () => {
    setPatientSearch('');
    setLocationSearch('');
    setSelectedStateFilter('all');
    setSelectedDistrictFilter('all');
    setSelectedRiskFilter('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
  };

  // Returning Patients for Longitudinal Pain Severity Tracking
  const returningPatients = getReturningPatientsSummary(screenings);
  const [selectedPatientKey, setSelectedPatientKey] = useState<string>(() => {
    return returningPatients.length > 0 ? returningPatients[0].primaryKey : '';
  });

  const activeReturningPatient =
    returningPatients.find(p => p.primaryKey === selectedPatientKey) ||
    returningPatients[0] ||
    null;

  // Metrics computation
  const totalScreened = screenings.length;
  const highRiskCount = screenings.filter(s => s.riskLevel === 'HIGH').length;
  const modRiskCount = screenings.filter(s => s.riskLevel === 'MODERATE').length;
  const lowRiskCount = screenings.filter(s => s.riskLevel === 'LOW').length;
  const pendingSyncCount = screenings.filter(s => s.syncStatus === 'pending').length;

  const highPct = totalScreened ? Math.round((highRiskCount / totalScreened) * 100) : 0;
  const modPct = totalScreened ? Math.round((modRiskCount / totalScreened) * 100) : 0;
  const lowPct = totalScreened ? Math.round((lowRiskCount / totalScreened) * 100) : 0;

  // State prevalence calculation
  const nerStates: NERState[] = [
    'Assam',
    'Meghalaya',
    'Manipur',
    'Mizoram',
    'Nagaland',
    'Tripura',
    'Arunachal Pradesh',
    'Sikkim'
  ];

  const stateStats = nerStates.map(state => {
    const records = screenings.filter(s => s.patient.state === state);
    const count = records.length;
    const high = records.filter(s => s.riskLevel === 'HIGH').length;
    const mod = records.filter(s => s.riskLevel === 'MODERATE').length;
    const avgScore = count
      ? Math.round(records.reduce((acc, curr) => acc + curr.compositeRiskScore, 0) / count)
      : 0;
    return { state, count, high, mod, avgScore };
  });

  // Top Risk Factors
  const factorMap: Record<string, number> = {};
  screenings.forEach(s => {
    s.primaryFactors.forEach(f => {
      factorMap[f] = (factorMap[f] || 0) + 1;
    });
  });

  const sortedFactors = Object.entries(factorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Filtered Registry List by Patient Name, Location (State/District/Village), Dates, and Risk
  const filteredList = useMemo(() => {
    return screenings.filter(item => {
      // 1. Patient Name / ABHA / Token Search
      if (patientSearch.trim()) {
        const q = patientSearch.toLowerCase().trim();
        const nameMatch = item.patient.fullName.toLowerCase().includes(q);
        const abhaMatch = item.patient.abhaId ? item.patient.abhaId.toLowerCase().includes(q) : false;
        const refMatch = item.referralId.toLowerCase().includes(q);
        if (!nameMatch && !abhaMatch && !refMatch) return false;
      }

      // 2. Location (State & District & Village / Locality)
      if (selectedStateFilter !== 'all' && item.patient.state !== selectedStateFilter) {
        return false;
      }
      if (selectedDistrictFilter !== 'all' && item.patient.district !== selectedDistrictFilter) {
        return false;
      }
      if (locationSearch.trim()) {
        const loc = locationSearch.toLowerCase().trim();
        const distMatch = item.patient.district.toLowerCase().includes(loc);
        const villageMatch = item.patient.village ? item.patient.village.toLowerCase().includes(loc) : false;
        const stateMatch = item.patient.state.toLowerCase().includes(loc);
        if (!distMatch && !villageMatch && !stateMatch) return false;
      }

      // 3. Clinical Risk Level
      if (selectedRiskFilter !== 'all' && item.riskLevel !== selectedRiskFilter) {
        return false;
      }

      // 4. Date Range
      if (startDate || endDate) {
        const itemTime = new Date(item.timestamp).getTime();
        if (startDate) {
          const startTime = new Date(startDate).setHours(0, 0, 0, 0);
          if (itemTime < startTime) return false;
        }
        if (endDate) {
          const endTime = new Date(endDate).setHours(23, 59, 59, 999);
          if (itemTime > endTime) return false;
        }
      }

      return true;
    });
  }, [
    screenings,
    patientSearch,
    selectedStateFilter,
    selectedDistrictFilter,
    locationSearch,
    selectedRiskFilter,
    startDate,
    endDate
  ]);

  const handleDownloadCSV = () => {
    const csv = exportScreeningsAsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ArthroScan_NER_Registry_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const json = exportScreeningsAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ArthroScan_NER_Export_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset local cache with diverse sample screenings across all 8 NER states?')) {
      resetDemoScreenings();
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Local Queue Management & Sync */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Medical Officer & Epidemiological Surveillance
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
              NER Command Dashboard
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time population surveillance, district-level osteoarthritis heatmap, and offline field sync.
          </p>
        </div>

        {/* Sync & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing || pendingSyncCount === 0}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              pendingSyncCount > 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing ? 'Transmitting...' : `Sync Offline Queue (${pendingSyncCount})`}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={handleResetSampleData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            title="Reset with 8-State Demo Records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Stats Summary Row (Recharts: Weekly Screenings Throughput & Regional Pain Levels) */}
      <AdminQuickStats screenings={screenings} />

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Screened */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Screened
            </span>
            <Users className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {totalScreened}
          </div>
          <div className="mt-2 text-[11px] text-teal-600 dark:text-teal-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Across 8 North Eastern States</span>
          </div>
        </div>

        {/* High Risk (Red) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
              High Risk (Referrals)
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 font-mono">
            {highRiskCount}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">({highPct}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Automated tele-consultation queue
          </div>
        </div>

        {/* Moderate Risk (Amber) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              Moderate Risk
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2 font-mono">
            {modRiskCount}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">({modPct}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            3-month physiotherapy monitoring
          </div>
        </div>

        {/* Low Risk (Green) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
              Low Risk
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {lowRiskCount}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">({lowPct}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Preventive lifestyle guidance
          </div>
        </div>
      </div>

      {/* State-wise Heatmap / Prevalence Chart & Top Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: State Prevalence Matrix */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                State-wise Prevalence & Risk Distribution across NER
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Incidence rates across mountain, tea plantation, and hill valley agro-ecological zones.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">8 NER States</span>
          </div>

          {/* Clean Responsive Bar Chart Layout */}
          <div className="mt-5 space-y-3.5">
            {stateStats.map(item => {
              const total = item.count;
              const hPct = total ? (item.high / total) * 100 : 0;
              const mPct = total ? (item.mod / total) * 100 : 0;
              const lPct = 100 - hPct - mPct;

              return (
                <div key={item.state} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.state}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {item.count} screened • Avg Score: <span className="font-bold text-slate-700 dark:text-slate-300">{item.avgScore}</span>
                    </span>
                  </div>

                  {/* Segmented Risk Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                    {total > 0 ? (
                      <>
                        <div
                          style={{ width: `${hPct}%` }}
                          title={`High Risk: ${item.high}`}
                          className="h-full bg-rose-500 transition-all duration-300"
                        />
                        <div
                          style={{ width: `${mPct}%` }}
                          title={`Moderate Risk: ${item.mod}`}
                          className="h-full bg-amber-500 transition-all duration-300"
                        />
                        <div
                          style={{ width: `${lPct}%` }}
                          title="Low Risk"
                          className="h-full bg-emerald-500 transition-all duration-300"
                        />
                      </>
                    ) : (
                      <div className="h-full w-full bg-slate-200 dark:bg-slate-700 opacity-50" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>High Risk</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Moderate Risk</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Low Risk</span>
              </span>
            </div>
            <span>Updated in real-time</span>
          </div>
        </div>

        {/* Right: Top Identified Risk Factors */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Activity className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Top Identified Risk Drivers
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {sortedFactors.map(([factor, freq], idx) => (
                <div key={factor} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {idx + 1}. {factor}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {freq} ({totalScreened ? Math.round((freq / totalScreened) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{
                        width: `${totalScreened ? Math.round((freq / totalScreened) * 100) : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 bg-teal-50/60 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900/30 text-[11px] text-teal-900 dark:text-teal-200">
            <span className="font-bold">Epidemiological Finding:</span> Chronic hillside farming combined with traditional headloading basket transport (Namlo) is the single highest contributor to early cartilage deterioration in NER populations under 55.
          </div>
        </div>
      </div>

      {/* Longitudinal Osteoarthritis Pain Progression Surveillance (Recharts Trend Line) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Activity className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Longitudinal Patient Progression Tracking (Pain Severity Trends)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                Recharts Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Monitors returning patients' historical Pain Severity (0-10) across follow-up visits to detect accelerated cartilage degeneration or therapeutic response.
            </p>
          </div>

          {/* Returning Patient Selector */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-500 font-medium shrink-0">
              Returning Cohort:
            </span>
            <select
              value={activeReturningPatient?.primaryKey || ''}
              onChange={e => setSelectedPatientKey(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-xs"
            >
              {returningPatients.map(p => (
                <option key={p.primaryKey} value={p.primaryKey}>
                  {p.patient.fullName} ({p.patient.state}) — {p.visitCount} visits ({p.deltaPain >= 0 ? `+${p.deltaPain}` : p.deltaPain} pts)
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeReturningPatient ? (
          <div>
            {/* Active Patient Details Banner */}
            <div className="mb-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center">
                  {activeReturningPatient.patient.fullName.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    {activeReturningPatient.patient.fullName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {activeReturningPatient.patient.age}y • {activeReturningPatient.patient.gender} • {activeReturningPatient.patient.vocation}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">ABHA ID</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    {activeReturningPatient.patient.abhaId || 'N/A'}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Total Screenings</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeReturningPatient.visitCount} Visits
                  </span>
                </div>
              </div>
            </div>

            {/* Recharts Trend Line Component */}
            <PainProgressionChart
              history={activeReturningPatient.history}
              patientName={activeReturningPatient.patient.fullName}
              showMultiMetrics={true}
            />
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No returning patients with multi-visit history currently in the registry.
          </div>
        )}
      </div>

      {/* Search and Multi-Parameter Filter Bar (Date Range, Location, Patient Name, Risk) */}
      <AdminFilterBar
        patientSearch={patientSearch}
        onPatientSearchChange={setPatientSearch}
        locationSearch={locationSearch}
        onLocationSearchChange={setLocationSearch}
        selectedState={selectedStateFilter}
        onStateChange={setSelectedStateFilter}
        selectedDistrict={selectedDistrictFilter}
        onDistrictChange={setSelectedDistrictFilter}
        selectedRisk={selectedRiskFilter}
        onRiskChange={setSelectedRiskFilter}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onResetFilters={handleResetAllFilters}
        totalCount={totalScreened}
        filteredCount={filteredList.length}
      />

      {/* Registry Table & Filter Controls */}
      <div className="bg-[#FCFAF2] dark:bg-slate-900 rounded-2xl border border-[#E5DFD0] dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DFD0] dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-[#2B2519] dark:text-slate-100">
              Screening Registry & Patient Audit Queue
            </h3>
            <p className="text-xs text-[#736B59] dark:text-slate-400">
              Showing {filteredList.length} of {totalScreened} records matching search criteria
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 rounded-lg border border-[#DDD5BF] dark:border-slate-700 bg-[#FAF7EE] dark:bg-slate-800 hover:bg-[#ECE5D3] dark:hover:bg-slate-700 text-[#473F30] dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Export currently filtered results as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Filtered ({filteredList.length})</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-[#332D22] dark:text-slate-300">
            <thead className="text-[10px] uppercase font-bold text-[#736B59] dark:text-slate-400 bg-[#F3EFE3] dark:bg-slate-800/60 border-y border-[#E5DFD0] dark:border-slate-800">
              <tr>
                <th className="py-3 px-3">Referral Token</th>
                <th className="py-3 px-3">Patient Details</th>
                <th className="py-3 px-3">Location & Vocation</th>
                <th className="py-3 px-3">Kinetics & WOMAC</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Sync Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD0] dark:divide-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#736B59] dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-9 h-9 rounded-full bg-[#ECE5D3] dark:bg-slate-800 flex items-center justify-center text-[#736B59] dark:text-slate-400">
                        <Filter className="w-4 h-4" />
                      </div>
                      <p className="font-bold text-sm text-[#2B2519] dark:text-slate-100">
                        No screenings match your filters
                      </p>
                      <p className="text-[11px] text-[#736B59] dark:text-slate-400 text-center">
                        Try clearing location or date boundaries, or searching for a different patient name or ABHA ID.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetAllFilters}
                        className="mt-1 px-3 py-1.5 rounded-lg bg-[#ECE5D3] hover:bg-[#E4DBC5] text-[#2B2519] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold border border-[#DDD5BF] dark:border-slate-700 cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map(record => (
                  <tr
                    key={record.id}
                    className="hover:bg-[#F3EFE3]/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-[#2B2519] dark:text-slate-100">
                      <div>{record.referralId}</div>
                      <div className="text-[10px] text-[#736B59] dark:text-slate-400">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-[#2B2519] dark:text-slate-100">
                        {record.patient.fullName}
                      </div>
                      <div className="text-[11px] text-[#736B59] dark:text-slate-400">
                        {record.patient.age}y • {record.patient.gender} • ABHA: {record.patient.abhaId || '—'}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#332D22] dark:text-slate-200">
                        {record.patient.district}, {record.patient.state}
                      </div>
                      <div className="text-[10px] text-[#736B59] dark:text-slate-400 truncate max-w-[180px]">
                        {record.patient.vocation}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div>
                        WOMAC: <span className="font-bold">{record.womacScore}</span>
                      </div>
                      <div className="text-[10px] text-[#736B59] dark:text-slate-400">
                        Asym: {record.kinetics.gait.asymmetryIndex.toFixed(1)}% | Chair: {record.kinetics.chairStand.completedReps}r
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          record.riskLevel === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                            : record.riskLevel === 'MODERATE'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {record.riskLevel} ({record.compositeRiskScore})
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          record.syncStatus === 'synced'
                            ? 'text-teal-700 dark:text-teal-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            record.syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {record.syncStatus === 'synced' ? 'Synced' : 'Local Queue'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onViewRecord(record)}
                        className="px-2.5 py-1 rounded-lg bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#2B2519] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {filteredList.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching screening records found for your search/filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
