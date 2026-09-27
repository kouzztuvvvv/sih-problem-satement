import React from 'react';
import {
  HeartPulse,
  Clock,
  Mountain,
  AlertCircle,
  Package,
  ThermometerSnowflake,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { LanguageCode, SymptomAssessmentData } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { calculateWOMACScore } from '../utils/scoring';

interface SymptomAssessmentProps {
  data: SymptomAssessmentData;
  onChange: (updated: SymptomAssessmentData) => void;
  onNext: () => void;
  onBack: () => void;
  language: LanguageCode;
}

export const SymptomAssessment: React.FC<SymptomAssessmentProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  language
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const womacScore = calculateWOMACScore(data);

  const painFaces = [
    { score: 0, emoji: '😀', label: 'No Pain' },
    { score: 2, emoji: '🙂', label: 'Mild Aching' },
    { score: 4, emoji: '😐', label: 'Moderate Discomfort' },
    { score: 6, emoji: '🙁', label: 'Troublesome Pain' },
    { score: 8, emoji: '😣', label: 'Severe Throbbing' },
    { score: 10, emoji: '😭', label: 'Unbearable Pain' }
  ];

  const currentFace = painFaces.reduce((prev, curr) =>
    Math.abs(curr.score - data.painSeverity) < Math.abs(prev.score - data.painSeverity) ? curr : prev
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm transition-colors duration-200">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t.step3}: Digital Symptom & Pain Assessment
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Validated Western Ontario and McMaster Universities (WOMAC) Index tailored for hilly terrain.
          </p>
        </div>

        {/* Live WOMAC Score Indicator */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Calculated WOMAC Score
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-mono font-bold ${
                  womacScore > 65
                    ? 'text-rose-500'
                    : womacScore > 35
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }`}
              >
                {womacScore}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <HeartPulse className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Questionnaire Form */}
      <div className="space-y-8 mt-6">
        {/* Question 1: Visual Pain Scale with Faces */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/70 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>{t.painScale} (Wong-Baker FACES® Scale)</span>
            </label>
            <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-lg">{currentFace.emoji}</span>
              <span className="text-slate-700 dark:text-slate-200">
                Level {data.painSeverity} — {currentFace.label}
              </span>
            </div>
          </div>

          <div className="px-2 pt-2">
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={data.painSeverity}
              onChange={e => onChange({ ...data, painSeverity: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-400"
            />
          </div>

          <div className="grid grid-cols-6 gap-1 mt-4 text-center">
            {painFaces.map(item => (
              <button
                key={item.score}
                type="button"
                onClick={() => onChange({ ...data, painSeverity: item.score })}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  Math.abs(data.painSeverity - item.score) <= 1
                    ? 'bg-white dark:bg-slate-800 shadow-sm border border-teal-500/40'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className="text-2xl">{item.emoji}</div>
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">
                  {item.score}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Morning Stiffness Duration */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/70 dark:border-slate-800">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs flex items-center justify-center font-bold">
              2
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{t.stiffness}</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            How long does morning joint stiffness persist after waking up from sleep?
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { min: 5, label: '< 10 mins', desc: 'Typical / Normal' },
              { min: 20, label: '10 - 30 mins', desc: 'Mild Joint Inflexibility' },
              { min: 45, label: '30 - 60 mins', desc: 'ACR OA Diagnostic Threshold' },
              { min: 75, label: '> 60 mins', desc: 'Severe Chronic Stiffness' }
            ].map(item => (
              <button
                key={item.min}
                type="button"
                onClick={() => onChange({ ...data, morningStiffnessMin: item.min })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  (item.min === 5 && data.morningStiffnessMin < 10) ||
                  (item.min === 20 && data.morningStiffnessMin >= 10 && data.morningStiffnessMin <= 30) ||
                  (item.min === 45 && data.morningStiffnessMin > 30 && data.morningStiffnessMin <= 60) ||
                  (item.min === 75 && data.morningStiffnessMin > 60)
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs">{item.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: Difficulty Walking on Hilly Slopes / Stairs */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/70 dark:border-slate-800">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs flex items-center justify-center font-bold">
              3
            </span>
            <Mountain className="w-4 h-4 text-slate-400" />
            <span>{t.terrainDifficulty}</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            In North East topography, downhill descent causes 3.5x higher patellofemoral compression forces.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { val: 0, label: '0: None', desc: 'No difficulty' },
              { val: 1, label: '1: Mild', desc: 'Noticeable twinges' },
              { val: 2, label: '2: Moderate', desc: 'Needs occasional rest' },
              { val: 3, label: '3: Severe', desc: 'Needs walking stick' },
              { val: 4, label: '4: Extreme', desc: 'Unable to climb hill' }
            ].map(item => (
              <button
                key={item.val}
                type="button"
                onClick={() => onChange({ ...data, terrainDifficulty: item.val })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  data.terrainDifficulty === item.val
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-semibold">{item.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question 4: NER Environmental & History Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Prior Injury */}
          <div
            onClick={() => onChange({ ...data, jointTraumaHistory: !data.jointTraumaHistory })}
            className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              data.jointTraumaHistory
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                data.jointTraumaHistory ? 'bg-amber-500 text-white' : 'border border-slate-300 dark:border-slate-600'
              }`}
            >
              {data.jointTraumaHistory && <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {t.traumaHistory}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Any previous fracture, ligament tear, or fall on hillside rocks.
              </span>
            </div>
          </div>

          {/* Heavy Headloading */}
          <div
            onClick={() => onChange({ ...data, carryingHeavyLoadDaily: !data.carryingHeavyLoadDaily })}
            className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              data.carryingHeavyLoadDaily
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                data.carryingHeavyLoadDaily ? 'bg-amber-500 text-white' : 'border border-slate-300 dark:border-slate-600'
              }`}
            >
              {data.carryingHeavyLoadDaily && <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Daily Heavy Load Carrying (&gt;15kg)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Regular use of traditional forehead tumpline (Namlo) or woven bamboo basket (Khoi).
              </span>
            </div>
          </div>

          {/* Joint Swelling */}
          <div
            onClick={() => onChange({ ...data, jointSwelling: !data.jointSwelling })}
            className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              data.jointSwelling
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                data.jointSwelling ? 'bg-amber-500 text-white' : 'border border-slate-300 dark:border-slate-600'
              }`}
            >
              {data.jointSwelling && <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Joint Swelling or Fluid Effusion
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Visible enlargement or warm puffy sensation around patella.
              </span>
            </div>
          </div>

          {/* Damp / Cold Weather Sensitivity */}
          <div
            onClick={() => onChange({ ...data, weatherSensitivity: !data.weatherSensitivity })}
            className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              data.weatherSensitivity
                ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                data.weatherSensitivity ? 'bg-teal-500 text-white' : 'border border-slate-300 dark:border-slate-600'
              }`}
            >
              {data.weatherSensitivity && <CheckCircle className="w-3.5 h-3.5" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Monsoon Dampness & Winter Cold Aches
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Barometric drop and winter fog worsens joint stiffness.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AI Kinetics</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm shadow-teal-600/20 active:scale-95 transition-all"
        >
          <span>Calculate Risk & Generate Triage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
