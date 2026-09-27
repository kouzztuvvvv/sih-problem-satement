import React, { useState } from 'react';
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
  resetDemoScreenings
} from '../utils/storage';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');

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

  // Filtered Registry List
  const filteredList = screenings.filter(item => {
    const matchesSearch =
      item.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.referralId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.patient.abhaId && item.patient.abhaId.includes(searchTerm));

    const matchesState = selectedStateFilter === 'all' || item.patient.state === selectedStateFilter;
    const matchesRisk = selectedRiskFilter === 'all' || item.riskLevel === selectedRiskFilter;

    return matchesSearch && matchesState && matchesRisk;
  });

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

      {/* Registry Table & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Screening Registry & Patient Audit Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredList.length} of {totalScreened} records
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search patient, ABHA, token..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-48 sm:w-56"
              />
            </div>

            {/* State Filter */}
            <select
              value={selectedStateFilter}
              onChange={e => setSelectedStateFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All States</option>
              {nerStates.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Risk Filter */}
            <select
              value={selectedRiskFilter}
              onChange={e => setSelectedRiskFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="HIGH">High Risk Only</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200/80 dark:border-slate-800">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.map(record => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                    <div>{record.referralId}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {record.patient.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {record.patient.age}y • {record.patient.gender} • ABHA: {record.patient.abhaId || '—'}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {record.patient.district}, {record.patient.state}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      {record.patient.vocation}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <div>
                      WOMAC: <span className="font-bold">{record.womacScore}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
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
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          record.syncStatus === 'synced' ? 'bg-teal-500' : 'bg-amber-500'
                        }`}
                      />
                      {record.syncStatus === 'synced' ? 'Synced' : 'Local Queue'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onViewRecord(record)}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
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
