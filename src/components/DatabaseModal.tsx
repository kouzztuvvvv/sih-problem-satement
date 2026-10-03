import React, { useState, useEffect } from 'react';
import {
  Database,
  X,
  Search,
  Download,
  Trash2,
  UserCheck,
  Calendar,
  MapPin,
  Activity,
  FileText,
  Clock,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ScreeningResult, PatientDemographics } from '../types';
import {
  fetchDatabaseScreenings,
  fetchDatabaseStats,
  deleteScreeningFromDatabase,
  DatabaseStats
} from '../utils/databaseApi';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPatient?: (patient: PatientDemographics) => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  onLoadPatient
}) => {
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ScreeningResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [records, st] = await Promise.all([
        fetchDatabaseScreenings(),
        fetchDatabaseStats()
      ]);
      setScreenings(records);
      setStats(st);
      if (records.length > 0 && !selectedRecord) {
        setSelectedRecord(records[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = screenings.filter(s => {
    const q = searchQuery.toLowerCase();
    const name = s.patient?.fullName?.toLowerCase() || '';
    const abha = s.patient?.abhaId?.toLowerCase() || '';
    const state = s.patient?.state?.toLowerCase() || '';
    const district = s.patient?.district?.toLowerCase() || '';
    const refId = s.referralId?.toLowerCase() || '';
    return name.includes(q) || abha.includes(q) || state.includes(q) || district.includes(q) || refId.includes(q);
  });

  const handleDelete = async (id: string) => {
    await deleteScreeningFromDatabase(id);
    setDeleteConfirmId(null);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
    loadData();
  };

  const handleCopyAbha = (abha: string) => {
    navigator.clipboard?.writeText(abha);
    setCopiedId(abha);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF7EE] dark:bg-slate-900 rounded-2xl border border-[#E5DFD0] dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-[#332D22] dark:text-slate-100">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#E5DFD0] dark:border-slate-800 flex items-center justify-between bg-[#FCFAF2] dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#ECE5D3] dark:bg-slate-800 text-[#473F30] dark:text-teal-400 flex items-center justify-center border border-[#DDD5BF] dark:border-slate-700 shadow-xs">
              <Database className="w-4 h-4 text-amber-600 dark:text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#2B2519] dark:text-slate-100">
                  ArthroScan Persistent Database
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Server Connected
                </span>
              </div>
              <p className="text-[11px] text-[#736B59] dark:text-slate-400">
                {stats?.totalScreenings || screenings.length} total records saved • {stats?.totalPatients || '—'} registered patients
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-lg bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#473F30] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700 cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a
              href="/api/database/export"
              download="arthroscan_database_backup.json"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#473F30] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700 transition-colors"
              title="Download complete database as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#ECE5D3] hover:bg-[#E4DBC5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#473F30] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="p-3 border-b border-[#E5DFD0] dark:border-slate-800 bg-[#FCFAF2] dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#736B59] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search database by patient name, ABHA ID, village, state, or referral ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-[#F3EFE3] dark:bg-slate-800 border border-[#DDD5BF] dark:border-slate-700 text-[#332D22] dark:text-slate-100 placeholder-[#8C8372] focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            />
          </div>
        </div>

        {/* Main Content: Split List and Details */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left: Records List */}
          <div className="md:col-span-5 border-r border-[#E5DFD0] dark:border-slate-800 overflow-y-auto p-2 space-y-1.5 max-h-[55vh] md:max-h-none">
            {loading && screenings.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#736B59] dark:text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                Loading database records...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#736B59] dark:text-slate-400">
                No matching records found in database.
              </div>
            ) : (
              filtered.map(rec => {
                const isSelected = selectedRecord?.id === rec.id;
                const risk = rec.riskLevel || 'LOW';

                return (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => setSelectedRecord(rec)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ECE5D3] dark:bg-slate-800 border-[#DDD5BF] dark:border-slate-700 shadow-xs'
                        : 'bg-[#FCFAF2] dark:bg-slate-900/60 border-[#E5DFD0] dark:border-slate-800 hover:bg-[#F3EFE3] dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-[#2B2519] dark:text-slate-100 truncate">
                        {rec.patient?.fullName || 'Anonymous Patient'}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                          risk === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                            : risk === 'MODERATE'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {risk}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#736B59] dark:text-slate-400">
                      <span>{rec.patient?.age}y • {rec.patient?.gender}</span>
                      <span>•</span>
                      <span className="truncate">{rec.patient?.state}</span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-[#8C8372] dark:text-slate-500 mt-1.5 pt-1 border-t border-[#E5DFD0]/60 dark:border-slate-800/60">
                      <span>Ref: {rec.referralId || rec.id}</span>
                      <span>{new Date(rec.timestamp).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Record Details Inspector */}
          <div className="md:col-span-7 overflow-y-auto p-4 sm:p-5 bg-[#FCFAF2] dark:bg-slate-900/70">
            {selectedRecord ? (
              <div className="space-y-4">
                {/* Actions & Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E5DFD0] dark:border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-[#2B2519] dark:text-slate-100">
                      {selectedRecord.patient?.fullName}
                    </h4>
                    <p className="text-xs text-[#736B59] dark:text-slate-400 mt-0.5">
                      {selectedRecord.patient?.vocation} • {selectedRecord.patient?.district}, {selectedRecord.patient?.state}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onLoadPatient && (
                      <button
                        type="button"
                        onClick={() => {
                          onLoadPatient(selectedRecord.patient);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#ECE5D3] hover:bg-[#E4DBC5] text-[#2B2519] dark:bg-teal-500/20 dark:text-teal-300 dark:hover:bg-teal-500/30 border border-[#DDD5BF] dark:border-teal-500/30 cursor-pointer"
                        title="Load this patient into active screening form"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Load Patient
                      </button>
                    )}

                    {deleteConfirmId === selectedRecord.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(selectedRecord.id)}
                          className="px-2 py-1 text-[11px] font-bold rounded bg-rose-600 text-white cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-[11px] rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(selectedRecord.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 cursor-pointer"
                        title="Delete from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Patient Information Card */}
                <div className="p-3.5 rounded-xl bg-[#F3EFE3] dark:bg-slate-800/80 border border-[#DDD5BF] dark:border-slate-700 space-y-2 text-xs">
                  <div className="font-semibold text-[#2B2519] dark:text-slate-100 flex items-center justify-between">
                    <span>Patient Profile Details</span>
                    {selectedRecord.patient?.abhaId && (
                      <button
                        type="button"
                        onClick={() => handleCopyAbha(selectedRecord.patient?.abhaId || '')}
                        className="text-[10px] text-amber-800 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {copiedId === selectedRecord.patient.abhaId ? 'Copied ✓' : `ABHA: ${selectedRecord.patient.abhaId}`}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#736B59] dark:text-slate-400">Age / Gender:</span>{' '}
                      <span className="font-medium text-[#2B2519] dark:text-slate-200">
                        {selectedRecord.patient?.age}y / {selectedRecord.patient?.gender}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#736B59] dark:text-slate-400">Village:</span>{' '}
                      <span className="font-medium text-[#2B2519] dark:text-slate-200">
                        {selectedRecord.patient?.village || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#736B59] dark:text-slate-400">Phone:</span>{' '}
                      <span className="font-medium text-[#2B2519] dark:text-slate-200">
                        {selectedRecord.patient?.phoneNumber || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#736B59] dark:text-slate-400">Primary Language:</span>{' '}
                      <span className="font-medium uppercase text-[#2B2519] dark:text-slate-200">
                        {selectedRecord.patient?.primaryLanguage || 'English'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#F3EFE3] dark:bg-slate-800/80 border border-[#DDD5BF] dark:border-slate-700 text-center">
                    <span className="text-[10px] uppercase font-bold text-[#736B59] dark:text-slate-400 block">
                      WOMAC
                    </span>
                    <span className="text-base font-bold font-mono text-[#2B2519] dark:text-slate-100">
                      {selectedRecord.womacScore}/96
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F3EFE3] dark:bg-slate-800/80 border border-[#DDD5BF] dark:border-slate-700 text-center">
                    <span className="text-[10px] uppercase font-bold text-[#736B59] dark:text-slate-400 block">
                      Kinetic Deficit
                    </span>
                    <span className="text-base font-bold font-mono text-[#2B2519] dark:text-slate-100">
                      {selectedRecord.kineticDeficitScore}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F3EFE3] dark:bg-slate-800/80 border border-[#DDD5BF] dark:border-slate-700 text-center">
                    <span className="text-[10px] uppercase font-bold text-[#736B59] dark:text-slate-400 block">
                      Composite Risk
                    </span>
                    <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                      {selectedRecord.compositeRiskScore}%
                    </span>
                  </div>
                </div>

                {/* Biomechanical and Symptoms Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F3EFE3] dark:bg-slate-800/60 border border-[#DDD5BF] dark:border-slate-700 space-y-1">
                    <span className="font-semibold text-[11px] text-[#2B2519] dark:text-slate-200 block">
                      Kinetics
                    </span>
                    <p className="text-[11px] text-[#554D3D] dark:text-slate-300">
                      • Chair Stand: {selectedRecord.kinetics?.chairStand?.completedReps || 0} reps ({selectedRecord.kinetics?.chairStand?.avgFlexionAngle || 0}°)
                    </p>
                    <p className="text-[11px] text-[#554D3D] dark:text-slate-300">
                      • Gait Asymmetry: {selectedRecord.kinetics?.gait?.asymmetryIndex || 0}%
                    </p>
                    <p className="text-[11px] text-[#554D3D] dark:text-slate-300">
                      • Max Flexion ROM: {selectedRecord.kinetics?.rom?.maxFlexionAngle || 0}°
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F3EFE3] dark:bg-slate-800/60 border border-[#DDD5BF] dark:border-slate-700 space-y-1">
                    <span className="font-semibold text-[11px] text-[#2B2519] dark:text-slate-200 block">
                      Symptoms
                    </span>
                    <p className="text-[11px] text-[#554D3D] dark:text-slate-300">
                      • Pain Severity: {selectedRecord.symptoms?.painSeverity || 0} / 10
                    </p>
                    <p className="text-[11px] text-[#554D3D] dark:text-slate-300">
                      • Morning Stiffness: {selectedRecord.symptoms?.morningStiffnessMin || 0} mins
                    </p>
                    <p className="text-[11px] text-[#554D3D] dark:text-slate-300">
                      • Slope Difficulty: Level {selectedRecord.symptoms?.terrainDifficulty || 0} / 4
                    </p>
                  </div>
                </div>

                {/* Clinical Recommendations */}
                {selectedRecord.clinicalRecommendations && selectedRecord.clinicalRecommendations.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#F3EFE3] dark:bg-slate-800/60 border border-[#DDD5BF] dark:border-slate-700">
                    <span className="font-semibold text-[11px] text-[#2B2519] dark:text-slate-200 block mb-1">
                      Clinical Recommendations
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#554D3D] dark:text-slate-300">
                      {selectedRecord.clinicalRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#736B59] dark:text-slate-400">
                Select a database record from the left list to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
