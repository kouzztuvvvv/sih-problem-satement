import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Activity,
  HeartPulse,
  Info
} from 'lucide-react';
import { ScreeningResult } from '../types';

interface PainProgressionChartProps {
  history: ScreeningResult[];
  patientName?: string;
  showMultiMetrics?: boolean;
}

export const PainProgressionChart: React.FC<PainProgressionChartProps> = ({
  history,
  patientName,
  showMultiMetrics = true,
}) => {
  const [includeCompositeScore, setIncludeCompositeScore] = useState(true);

  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400">
        No historical screening records found for this patient.
      </div>
    );
  }

  // Sort ascending by date
  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const baseline = sorted[0];
  const latest = sorted[sorted.length - 1];
  const baselinePain = baseline.symptoms.painSeverity;
  const latestPain = latest.symptoms.painSeverity;
  const deltaPain = latestPain - baselinePain;
  const isReturning = sorted.length >= 2;

  // Format data for Recharts
  const chartData = sorted.map((visit, index) => {
    const d = new Date(visit.timestamp);
    const formattedDate = d.toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    });
    const fullDate = d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const isBaseline = index === 0;
    const isCurrent = index === sorted.length - 1;

    let milestoneLabel = `Visit ${index + 1}`;
    if (isBaseline) milestoneLabel = 'Baseline';
    else if (isCurrent && sorted.length > 1) milestoneLabel = 'Latest';

    return {
      visitNumber: index + 1,
      milestoneLabel,
      displayDate: formattedDate,
      fullDate,
      painSeverity: visit.symptoms.painSeverity,
      compositeRiskScore: Math.round(visit.compositeRiskScore / 10), // Normalized to 0-10 scale for visual overlay
      rawCompositeScore: visit.compositeRiskScore,
      womacScore: visit.womacScore,
      morningStiffness: visit.symptoms.morningStiffnessMin,
      asymmetryIndex: visit.kinetics.gait.asymmetryIndex,
      chairStandReps: visit.kinetics.chairStand.completedReps,
      riskLevel: visit.riskLevel,
      referralId: visit.referralId,
    };
  });

  // Clinical trajectory categorization
  let trajectoryStatus: {
    label: string;
    description: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  };

  if (!isReturning) {
    trajectoryStatus = {
      label: 'Initial Baseline Established',
      description: 'Single screening on record. Schedule a follow-up visit in 3 months to monitor OA trajectory.',
      color: 'text-slate-700 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-slate-800/80',
      border: 'border-slate-200 dark:border-slate-700',
      icon: <Calendar className="w-4 h-4 text-teal-500" />,
    };
  } else if (deltaPain >= 2) {
    trajectoryStatus = {
      label: 'Progressive Cartilage Wear & Deterioration',
      description: `Pain Severity increased by +${deltaPain} points since baseline (${baselinePain}/10 → ${latestPain}/10). Recommended for urgent secondary orthopaedic referral and load offloading.`,
      color: 'text-rose-700 dark:text-rose-300',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-900/60',
      icon: <TrendingUp className="w-4 h-4 text-rose-500" />,
    };
  } else if (deltaPain <= -2) {
    trajectoryStatus = {
      label: 'Positive Therapeutic Recovery / Relief',
      description: `Pain Severity improved by ${Math.abs(deltaPain)} points (${baselinePain}/10 → ${latestPain}/10). Positive response to vernacular ergonomics, switchback gait, and quad strengthening.`,
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-900/60',
      icon: <TrendingDown className="w-4 h-4 text-emerald-500" />,
    };
  } else {
    trajectoryStatus = {
      label: 'Clinically Stable OA Progression',
      description: `Pain Severity has remained stable within ±1 point (${baselinePain}/10 → ${latestPain}/10). Continue conservative joint maintenance and periodic community monitoring.`,
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-900/60',
      icon: <Minus className="w-4 h-4 text-amber-500" />,
    };
  }

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-slate-100 p-3.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 border-b border-slate-700 pb-1.5 font-bold">
            <span className="text-teal-400">{data.milestoneLabel} ({data.displayDate})</span>
            <span className="font-mono text-[10px] text-slate-400">{data.fullDate}</span>
          </div>

          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-300">Pain Severity:</span>
              <span className="font-mono font-bold text-rose-400">{data.painSeverity} / 10</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-300">Composite OA Score:</span>
              <span className="font-mono font-bold text-amber-400">{data.rawCompositeScore} / 100 ({data.riskLevel})</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-300">WOMAC Stiffness:</span>
              <span className="font-mono text-slate-300">{data.morningStiffness} min</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-300">Gait Asymmetry:</span>
              <span className="font-mono text-slate-300">{data.asymmetryIndex.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Top Progression KPIs Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* KPI 1: Baseline vs Latest Pain */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
            Pain Severity Evolution
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {baselinePain}
            </span>
            <span className="text-xs text-slate-400">→</span>
            <span
              className={`text-2xl font-black font-mono ${
                latestPain >= 7
                  ? 'text-rose-600 dark:text-rose-400'
                  : latestPain >= 4
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {latestPain} / 10
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>Delta:</span>
            <span
              className={`font-mono font-bold ${
                deltaPain > 0 ? 'text-rose-600' : deltaPain < 0 ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {deltaPain > 0 ? `+${deltaPain}` : deltaPain} pts
            </span>
            <span>across {sorted.length} visit{sorted.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* KPI 2: Clinical Trajectory */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs sm:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Long-Term Trajectory Assessment
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold font-mono">
                {chartData[0]?.displayDate} — {chartData[chartData.length - 1]?.displayDate}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {trajectoryStatus.icon}
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {trajectoryStatus.label}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {trajectoryStatus.description}
          </p>
        </div>
      </div>

      {/* Main Recharts Line Chart Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Historical Pain Severity Progression Trend Line
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Visualizes VAS Pain Severity (0 to 10 scale) monitored over sequential clinical screenings.
            </p>
          </div>

          {showMultiMetrics && (
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCompositeScore}
                  onChange={(e) => setIncludeCompositeScore(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer w-3.5 h-3.5"
                />
                <span>Overlay Composite Risk (Normalized 0-10)</span>
              </label>
            </div>
          )}
        </div>

        {/* Recharts Container */}
        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 30, left: -5, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />

              <XAxis
                dataKey="milestoneLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />

              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                label={{
                  value: 'Pain Severity (0-10)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 10 },
                }}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px' }} />

              {/* Reference Threshold Lines */}
              <ReferenceLine
                y={7}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{
                  value: 'Severe (≥7)',
                  position: 'insideTopRight',
                  fill: '#f43f5e',
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={4}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: 'Moderate (≥4)',
                  position: 'insideTopRight',
                  fill: '#f59e0b',
                  fontSize: 10,
                }}
              />

              {/* Primary Line: Pain Severity */}
              <Line
                type="monotone"
                dataKey="painSeverity"
                name="Pain Severity (0-10)"
                stroke="#f43f5e"
                strokeWidth={3.5}
                dot={{ r: 6, fill: '#f43f5e', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8, stroke: '#f43f5e', strokeWidth: 3, fill: '#ffffff' }}
              />

              {/* Secondary Line: Composite OA Score (Normalized / 10) */}
              {includeCompositeScore && (
                <Line
                  type="monotone"
                  dataKey="compositeRiskScore"
                  name="Composite OA Score (Normalized)"
                  stroke="#0d9488"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#0d9488', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend / Footnote Guide */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Pain Severity (Visual Analogue Scale 0-10)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-dashed border-teal-600 bg-teal-500/20" />
              <span>Composite Clinical Risk (/10)</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Info className="w-3.5 h-3.5" />
            <span>Monitors longitudinal degeneration & therapeutic efficacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
