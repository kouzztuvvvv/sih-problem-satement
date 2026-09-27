import React from 'react';
import {
  User,
  Calendar,
  MapPin,
  Briefcase,
  CreditCard,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  LanguageCode,
  NERState,
  NER_STATES_AND_DISTRICTS,
  NER_VOCATIONS,
  PatientDemographics
} from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface PatientOnboardingProps {
  data: PatientDemographics;
  onChange: (updated: PatientDemographics) => void;
  onNext: () => void;
  language: LanguageCode;
}

export const PatientOnboarding: React.FC<PatientOnboardingProps> = ({
  data,
  onChange,
  onNext,
  language
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const states = Object.keys(NER_STATES_AND_DISTRICTS) as NERState[];
  const districts = NER_STATES_AND_DISTRICTS[data.state] || [];

  const handleStateChange = (newState: NERState) => {
    const newDistricts = NER_STATES_AND_DISTRICTS[newState];
    onChange({
      ...data,
      state: newState,
      district: newDistricts[0] || ''
    });
  };

  const handlePresetSelect = (presetType: 'elderly_hill_farmer' | 'tea_worker' | 'young_active') => {
    if (presetType === 'elderly_hill_farmer') {
      onChange({
        fullName: 'Bamonlang Kharbangar',
        age: 58,
        gender: 'Female',
        state: 'Meghalaya',
        district: 'East Khasi Hills (Shillong)',
        village: 'Mawkdok Village, Sohra Sub-Division',
        vocation: 'Hillside Farming & Terrace Cultivation',
        abhaId: '91-4829-1049-5821',
        phoneNumber: '+91 98620 44102',
        primaryLanguage: 'kha'
      });
    } else if (presetType === 'tea_worker') {
      onChange({
        fullName: 'Hiren Borgohain',
        age: 49,
        gender: 'Male',
        state: 'Assam',
        district: 'Dibrugarh',
        village: 'Barbaruah Tea Estate Line #4',
        vocation: 'Tea Garden Labor & Leaf Plucking',
        abhaId: '91-3091-8842-1940',
        phoneNumber: '+91 94350 28911',
        primaryLanguage: 'as'
      });
    } else {
      onChange({
        fullName: 'Keviletuo Angami',
        age: 38,
        gender: 'Male',
        state: 'Nagaland',
        district: 'Kohima',
        village: 'Khonoma Green Village',
        vocation: 'Hillside Farming & Terrace Cultivation',
        abhaId: '91-5520-9183-4412',
        phoneNumber: '+91 97740 55198',
        primaryLanguage: 'nag'
      });
    }
  };

  const generateDemoABHA = () => {
    const p1 = Math.floor(10 + Math.random() * 89);
    const p2 = Math.floor(1000 + Math.random() * 8999);
    const p3 = Math.floor(1000 + Math.random() * 8999);
    const p4 = Math.floor(1000 + Math.random() * 8999);
    onChange({
      ...data,
      abhaId: `${p1}-${p2}-${p3}-${p4}`
    });
  };

  const isFormValid =
    data.fullName.trim().length >= 2 &&
    data.age >= 18 &&
    data.age <= 110 &&
    data.state &&
    data.district;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm transition-colors duration-200">
      {/* Header & Quick Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t.step1}: Patient Demographics & NER Context
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Capture patient baseline, North East geographic region, and terrain-specific vocation.
          </p>
        </div>

        {/* 1-Click Demo Profiles for Rapid Testing */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-500" />
            Quick Test Profile:
          </span>
          <button
            type="button"
            onClick={() => handlePresetSelect('elderly_hill_farmer')}
            className="px-2.5 py-1 text-xs rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
          >
            Khasi Hillside Farmer (58y)
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('tea_worker')}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Assam Tea Worker (49y)
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('young_active')}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Nagaland Terrace Farmer (38y)
          </button>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {t.patientName} *
          </label>
          <input
            type="text"
            required
            value={data.fullName}
            onChange={e => onChange({ ...data, fullName: e.target.value })}
            placeholder="e.g. Bamonlang Kharbangar"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {t.age} *
          </label>
          <input
            type="number"
            min={18}
            max={110}
            required
            value={data.age || ''}
            onChange={e => onChange({ ...data, age: parseInt(e.target.value) || 0 })}
            placeholder="e.g. 58"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.gender} *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Female', 'Male', 'Other'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ ...data, gender: g })}
                className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  data.gender === g
                    ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {g === 'Female' ? t.female : g === 'Male' ? t.male : t.other}
              </button>
            ))}
          </div>
        </div>

        {/* State (NER States) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            North Eastern State *
          </label>
          <select
            value={data.state}
            onChange={e => handleStateChange(e.target.value as NERState)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer"
          >
            {states.map(st => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            District *
          </label>
          <select
            value={data.district}
            onChange={e => onChange({ ...data, district: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer"
          >
            {districts.map(dist => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* Village / Locality */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Village / Sub-Division / Cluster
          </label>
          <input
            type="text"
            value={data.village}
            onChange={e => onChange({ ...data, village: e.target.value })}
            placeholder="e.g. Mawkdok Village, Cherra Sub-Division"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Vocation / Physical Activity */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            {t.vocation} *
          </label>
          <select
            value={data.vocation}
            onChange={e => onChange({ ...data, vocation: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer"
          >
            {NER_VOCATIONS.map(voc => (
              <option key={voc} value={voc}>
                {voc}
              </option>
            ))}
          </select>
        </div>

        {/* ABHA Health ID */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              {t.abhaId}
            </label>
            <button
              type="button"
              onClick={generateDemoABHA}
              className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Generate ID
            </button>
          </div>
          <input
            type="text"
            value={data.abhaId || ''}
            onChange={e => onChange({ ...data, abhaId: e.target.value })}
            placeholder="14-digit ABHA (e.g. 91-4829-1049-5821)"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Field worker notes & Next CTA */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Complies with Ayushman Bharat Digital Mission (ABDM) field guidelines</span>
        </div>

        <button
          type="button"
          disabled={!isFormValid}
          onClick={onNext}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
            isFormValid
              ? 'bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-teal-600/20'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <span>Continue to AI Kinetic & Gait Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
