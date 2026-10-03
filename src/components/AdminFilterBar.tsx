import React from 'react';
import {
  Search,
  User,
  MapPin,
  Calendar,
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { NERState, NER_STATES_AND_DISTRICTS } from '../types';

export type DatePreset = 'all' | '7days' | '30days' | '90days' | 'custom';

interface AdminFilterBarProps {
  patientSearch: string;
  onPatientSearchChange: (val: string) => void;
  locationSearch: string;
  onLocationSearchChange: (val: string) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  selectedRisk: string;
  onRiskChange: (risk: string) => void;
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

const NER_STATES: NERState[] = [
  'Assam',
  'Meghalaya',
  'Manipur',
  'Mizoram',
  'Nagaland',
  'Tripura',
  'Arunachal Pradesh',
  'Sikkim'
];

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
  patientSearch,
  onPatientSearchChange,
  locationSearch,
  onLocationSearchChange,
  selectedState,
  onStateChange,
  selectedDistrict,
  onDistrictChange,
  selectedRisk,
  onRiskChange,
  datePreset,
  onDatePresetChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onResetFilters,
  totalCount,
  filteredCount
}) => {
  // Available districts for currently selected state
  const availableDistricts = selectedState !== 'all' && selectedState in NER_STATES_AND_DISTRICTS
    ? NER_STATES_AND_DISTRICTS[selectedState as NERState]
    : [];

  // Check if any filter is actively applied
  const hasActiveFilters =
    Boolean(patientSearch.trim()) ||
    Boolean(locationSearch.trim()) ||
    selectedState !== 'all' ||
    selectedDistrict !== 'all' ||
    selectedRisk !== 'all' ||
    datePreset !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate);

  const handlePresetSelect = (preset: DatePreset) => {
    onDatePresetChange(preset);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (preset === 'all') {
      onStartDateChange('');
      onEndDateChange('');
    } else if (preset === '7days') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      onStartDateChange(past7.toISOString().slice(0, 10));
      onEndDateChange(todayStr);
    } else if (preset === '30days') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      onStartDateChange(past30.toISOString().slice(0, 10));
      onEndDateChange(todayStr);
    } else if (preset === '90days') {
      const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      onStartDateChange(past90.toISOString().slice(0, 10));
      onEndDateChange(todayStr);
    }
  };

  return (
    <div className="bg-[#FCFAF2] dark:bg-slate-900 rounded-2xl border border-[#E5DFD0] dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5 transition-colors">
      {/* Title & Quick Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5DFD0] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#ECE5D3] dark:bg-slate-800 text-[#473F30] dark:text-teal-400 flex items-center justify-center border border-[#DDD5BF] dark:border-slate-700 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#2B2519] dark:text-slate-100">
              Search & Multi-Parameter Filter Bar
            </h3>
            <p className="text-[11px] text-[#736B59] dark:text-slate-400">
              Filter records by patient demographics, geographic location, dates, or clinical risk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#554D3D] dark:text-slate-300">
            Showing <span className="font-mono font-bold text-[#2B2519] dark:text-slate-100">{filteredCount}</span> of <span className="font-mono">{totalCount}</span>
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              title="Reset all search filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Primary Search (Patient Name & Location) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Patient Name / Token Search */}
        <div className="md:col-span-5 relative">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8372] dark:text-slate-400 block mb-1">
            Patient Name / ABHA ID / Token
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-[#8C8372] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={patientSearch}
              onChange={e => onPatientSearchChange(e.target.value)}
              placeholder="Search by patient name (e.g. Bamonlang, Saikia)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-[#FAF7EE] dark:bg-slate-800 border border-[#DDD5BF] dark:border-slate-700 text-[#332D22] dark:text-slate-100 placeholder-[#8C8372] focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            />
            {patientSearch && (
              <button
                type="button"
                onClick={() => onPatientSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Location: State Selector */}
        <div className="md:col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8372] dark:text-slate-400 block mb-1">
            State (Location)
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-[#8C8372] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedState}
              onChange={e => {
                onStateChange(e.target.value);
                onDistrictChange('all');
              }}
              className="w-full pl-8 pr-7 py-2 rounded-xl text-xs bg-[#FAF7EE] dark:bg-slate-800 border border-[#DDD5BF] dark:border-slate-700 text-[#332D22] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer appearance-none"
            >
              <option value="all">All 8 NER States</option>
              {NER_STATES.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8C8372] dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Location: District Selector or Text Search */}
        <div className="md:col-span-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8372] dark:text-slate-400 block mb-1">
            District / Village / Locality
          </label>
          {availableDistricts.length > 0 ? (
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-[#8C8372] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedDistrict}
                onChange={e => onDistrictChange(e.target.value)}
                className="w-full pl-8 pr-7 py-2 rounded-xl text-xs bg-[#FAF7EE] dark:bg-slate-800 border border-[#DDD5BF] dark:border-slate-700 text-[#332D22] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer appearance-none"
              >
                <option value="all">All Districts in {selectedState}</option>
                {availableDistricts.map(dist => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C8372] dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ) : (
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-[#8C8372] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={locationSearch}
                onChange={e => onLocationSearchChange(e.target.value)}
                placeholder="District, village, e.g. Shillong, Jorhat..."
                className="w-full pl-8 pr-8 py-2 rounded-xl text-xs bg-[#FAF7EE] dark:bg-slate-800 border border-[#DDD5BF] dark:border-slate-700 text-[#332D22] dark:text-slate-100 placeholder-[#8C8372] focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              />
              {locationSearch && (
                <button
                  type="button"
                  onClick={() => onLocationSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Date Range & Risk Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
        {/* Date Range Presets */}
        <div className="md:col-span-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8372] dark:text-slate-400 block mb-1">
            Date Range Filter
          </label>
          <div className="flex items-center gap-1 bg-[#FAF7EE] dark:bg-slate-800 p-1 rounded-xl border border-[#DDD5BF] dark:border-slate-700 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All Time' },
                { id: '7days', label: '7 Days' },
                { id: '30days', label: '30 Days' },
                { id: 'custom', label: 'Custom' }
              ] as const
            ).map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePresetSelect(opt.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                  datePreset === opt.id
                    ? 'bg-[#ECE5D3] dark:bg-slate-700 text-[#2B2519] dark:text-slate-100 font-bold shadow-2xs border border-[#DDD5BF] dark:border-slate-600'
                    : 'text-[#736B59] dark:text-slate-400 hover:text-[#2B2519] dark:hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Start / End Date Pickers */}
        <div className="md:col-span-5 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8372] dark:text-slate-400 block mb-1">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="w-3 h-3 text-[#8C8372] dark:text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  onStartDateChange(e.target.value);
                  onDatePresetChange('custom');
                }}
                className="w-full pl-7 pr-2 py-1.5 rounded-xl text-xs bg-[#FAF7EE] dark:bg-slate-800 border border-[#DDD5BF] dark:border-slate-700 text-[#332D22] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8372] dark:text-slate-400 block mb-1">
              End Date
            </label>
            <div className="relative">
              <Calendar className="w-3 h-3 text-[#8C8372] dark:text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  onEndDateChange(e.target.value);
                  onDatePresetChange('custom');
                }}
                className="w-full pl-7 pr-2 py-1.5 rounded-xl text-xs bg-[#FAF7EE] dark:bg-slate-800 border border-[#DDD5BF] dark:border-slate-700 text-[#332D22] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Clinical Risk Filter */}
        <div className="md:col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8372] dark:text-slate-400 block mb-1">
            Clinical Risk Level
          </label>
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-[#8C8372] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedRisk}
              onChange={e => onRiskChange(e.target.value)}
              className="w-full pl-8 pr-7 py-2 rounded-xl text-xs bg-[#FAF7EE] dark:bg-slate-800 border border-[#DDD5BF] dark:border-slate-700 text-[#332D22] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer appearance-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="HIGH">High Risk (🔴)</option>
              <option value="MODERATE">Moderate Risk (🟡)</option>
              <option value="LOW">Low Risk (🟢)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8C8372] dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E5DFD0]/80 dark:border-slate-800/80 text-[11px]">
          <span className="text-[10px] font-bold uppercase text-[#8C8372] dark:text-slate-400 mr-1">
            Active:
          </span>

          {patientSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#ECE5D3] dark:bg-slate-800 text-[#2B2519] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700">
              <span>Patient: "{patientSearch}"</span>
              <button
                type="button"
                onClick={() => onPatientSearchChange('')}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedState !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#ECE5D3] dark:bg-slate-800 text-[#2B2519] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700">
              <span>State: {selectedState}</span>
              <button
                type="button"
                onClick={() => {
                  onStateChange('all');
                  onDistrictChange('all');
                }}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedDistrict !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#ECE5D3] dark:bg-slate-800 text-[#2B2519] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700">
              <span>District: {selectedDistrict}</span>
              <button
                type="button"
                onClick={() => onDistrictChange('all')}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {locationSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#ECE5D3] dark:bg-slate-800 text-[#2B2519] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700">
              <span>Loc: "{locationSearch}"</span>
              <button
                type="button"
                onClick={() => onLocationSearchChange('')}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(startDate || endDate) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#ECE5D3] dark:bg-slate-800 text-[#2B2519] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700">
              <span>Dates: {startDate || '...'} to {endDate || 'Today'}</span>
              <button
                type="button"
                onClick={() => {
                  onStartDateChange('');
                  onEndDateChange('');
                  onDatePresetChange('all');
                }}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedRisk !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#ECE5D3] dark:bg-slate-800 text-[#2B2519] dark:text-slate-200 border border-[#DDD5BF] dark:border-slate-700">
              <span>Risk: {selectedRisk}</span>
              <button
                type="button"
                onClick={() => onRiskChange('all')}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
