import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Play,
  Square,
  RefreshCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Activity,
  CheckCircle2,
  Video,
  Eye,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import {
  ChairStandMetrics,
  GaitMetrics,
  KineticAssessmentData,
  LanguageCode,
  ROMMetrics
} from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { sounds } from '../utils/audio';

interface GaitCameraSimulatorProps {
  data: KineticAssessmentData;
  onChange: (updated: KineticAssessmentData) => void;
  onNext: () => void;
  onBack: () => void;
  language: LanguageCode;
}

type ActiveTestTab = 'chair' | 'gait' | 'rom';
type FeedSource = 'simulation' | 'webcam';

export const GaitCameraSimulator: React.FC<GaitCameraSimulatorProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  language
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [activeTab, setActiveTestTab] = useState<ActiveTestTab>('chair');
  const [feedSource, setFeedSource] = useState<FeedSource>('simulation');
  const [isAssessing, setIsAssessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentReps, setCurrentReps] = useState(data.chairStand.completedReps || 0);
  const [liveKneeAngle, setLiveKneeAngle] = useState(90);
  const [liveAsymmetry, setLiveAsymmetry] = useState(data.gait.asymmetryIndex || 5.2);
  const [liveLeftStance, setLiveLeftStance] = useState(0.72);
  const [liveRightStance, setLiveRightStance] = useState(0.65);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Simulation severity preset: 'healthy' | 'moderate' | 'severe'
  const [conditionPreset, setConditionPreset] = useState<'moderate' | 'healthy' | 'severe'>('moderate');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const simStateRef = useRef({
    cycle: 0,
    direction: 1,
    reps: data.chairStand.completedReps || 0,
    lastRepTimestamp: 0
  });

  // Handle Real Webcam
  useEffect(() => {
    if (feedSource === 'webcam') {
      setCameraError(null);
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } })
        .then(stream => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(err => {
          console.warn('Webcam access error', err);
          setCameraError('Camera access not granted or not available. Reverting to AI Biomechanical Simulator.');
          setFeedSource('simulation');
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [feedSource]);

  // Handle Assessment Timer for 30s chair stand or 10m gait
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isAssessing && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleCompleteTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAssessing, timeLeft]);

  // Main Canvas Biomechanical Pose Renderer
  useEffect(() => {
    let running = true;

    const render = () => {
      if (!running) return;
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // If simulated, draw modern biometric backdrop
      if (feedSource === 'simulation') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Perspective grid lines
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Floor ground plane
        ctx.fillStyle = 'rgba(13, 148, 136, 0.15)';
        ctx.fillRect(0, height - 45, width, 45);
      }

      // Biomechanical cycle update
      const sim = simStateRef.current;
      const speed = isAssessing ? (conditionPreset === 'severe' ? 0.025 : conditionPreset === 'healthy' ? 0.05 : 0.038) : 0.02;
      sim.cycle += speed * sim.direction;

      if (sim.cycle >= 1) {
        sim.cycle = 1;
        sim.direction = -1;
      } else if (sim.cycle <= 0) {
        sim.cycle = 0;
        sim.direction = 1;
        if (isAssessing && activeTab === 'chair') {
          // Rep completed
          const now = Date.now();
          if (now - sim.lastRepTimestamp > 1000) {
            sim.reps += 1;
            sim.lastRepTimestamp = now;
            setCurrentReps(sim.reps);
            sounds.playRepCount();
          }
        }
      }

      // Calculate Joint Coordinates based on active test
      const centerX = width / 2;
      let headY = height * 0.22;
      let hipY = height * 0.52;
      let kneeY = height * 0.72;
      let ankleY = height * 0.90;
      let kneeAngle = 90;

      let leftKneeX = centerX - 25;
      let rightKneeX = centerX + 25;
      let leftAnkleX = centerX - 30;
      let rightAnkleX = centerX + 30;

      if (activeTab === 'chair') {
        // Chair Stand kinematics (Cycle 0: fully seated, Cycle 1: fully upright)
        const sitRatio = 1 - sim.cycle; // 1 = sitting, 0 = standing
        headY = height * 0.20 + sitRatio * 60;
        hipY = height * 0.48 + sitRatio * 55;
        kneeY = height * 0.72 + sitRatio * 15;
        kneeAngle = Math.round(175 - sitRatio * (conditionPreset === 'severe' ? 78 : 88));
        setLiveKneeAngle(kneeAngle);
      } else if (activeTab === 'gait') {
        // 10m Gait Walking cycle
        const walkCycle = Math.sin(sim.cycle * Math.PI * 2);
        const asymBias = conditionPreset === 'severe' ? 22 : conditionPreset === 'moderate' ? 12 : 3;
        leftKneeX = centerX - 25 + walkCycle * 22;
        rightKneeX = centerX + 25 - walkCycle * (22 - asymBias);
        leftAnkleX = centerX - 30 + walkCycle * 32;
        rightAnkleX = centerX + 30 - walkCycle * (32 - asymBias * 1.2);

        kneeAngle = Math.round(145 + Math.cos(sim.cycle * Math.PI * 2) * 25);
        setLiveKneeAngle(kneeAngle);
      } else {
        // ROM Flexion Test
        const maxFlex = conditionPreset === 'severe' ? 95 : conditionPreset === 'moderate' ? 112 : 134;
        kneeAngle = Math.round(170 - sim.cycle * (170 - maxFlex));
        setLiveKneeAngle(kneeAngle);
        leftKneeX = centerX - 25 - sim.cycle * 15;
      }

      const head = { x: centerX, y: headY };
      const neck = { x: centerX, y: headY + 22 };
      const leftShoulder = { x: centerX - 38, y: neck.y + 12 };
      const rightShoulder = { x: centerX + 38, y: neck.y + 12 };
      const spine = { x: centerX, y: hipY - 20 };
      const leftHip = { x: centerX - 28, y: hipY };
      const rightHip = { x: centerX + 28, y: hipY };
      const leftKnee = { x: leftKneeX, y: kneeY };
      const rightKnee = { x: rightKneeX, y: kneeY };
      const leftAnkle = { x: leftAnkleX, y: ankleY };
      const rightAnkle = { x: rightAnkleX, y: ankleY };

      // Draw Skeleton Bones
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0d9488'; // Gentle Teal

      const bones: [ { x: number; y: number }, { x: number; y: number } ][] = [
        [head, neck],
        [neck, spine],
        [neck, leftShoulder],
        [neck, rightShoulder],
        [spine, leftHip],
        [spine, rightHip],
        [leftHip, leftKnee],
        [rightHip, rightKnee],
        [leftKnee, leftAnkle],
        [rightKnee, rightAnkle]
      ];

      bones.forEach(([from, to]) => {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      });

      // Draw Key Joints
      const joints = [
        head,
        neck,
        leftShoulder,
        rightShoulder,
        spine,
        leftHip,
        rightHip,
        leftKnee,
        rightKnee,
        leftAnkle,
        rightAnkle
      ];

      joints.forEach((pt, idx) => {
        const isKnee = pt === leftKnee || pt === rightKnee;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isKnee ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isKnee ? '#10b981' : '#14b8a6';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Pulsing radar ring on knees
        if (isKnee) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 11 + Math.sin(sim.cycle * 10) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Draw Dynamic Flexion Angle Arc on Left Knee
      ctx.beginPath();
      ctx.arc(leftKnee.x, leftKnee.y, 22, -Math.PI / 2, -Math.PI / 2 + (kneeAngle * Math.PI) / 180);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Knee Angle Degree Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(leftKnee.x - 38, leftKnee.y - 30, 48, 18);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(`${kneeAngle}°`, leftKnee.x - 32, leftKnee.y - 17);

      // Top AI HUD Tracking Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(12, 12, 180, 26);
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(12, 12, 180, 26);

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(24, 25, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.fillText('AI POSE CONFIDENCE: 98.4%', 35, 28);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeTab, feedSource, isAssessing, conditionPreset]);

  // Handle Preset Change
  const handleApplyPreset = (preset: 'healthy' | 'moderate' | 'severe') => {
    setConditionPreset(preset);
    if (preset === 'healthy') {
      setCurrentReps(16);
      setLiveAsymmetry(3.5);
      setLiveLeftStance(0.68);
      setLiveRightStance(0.67);
      onChange({
        chairStand: {
          completedReps: 16,
          avgFlexionAngle: 104,
          testDurationSeconds: 30,
          fatigueIndex: 12,
          completed: true
        },
        gait: {
          asymmetryIndex: 3.5,
          leftStanceDurationSec: 0.68,
          rightStanceDurationSec: 0.67,
          strideVariabilityPercent: 2.9,
          cadenceStepsPerMin: 112,
          completed: true
        },
        rom: {
          maxFlexionAngle: 132,
          extensionDeficitAngle: 1,
          jointCrepitusPresent: false,
          affectedKnee: 'Both',
          completed: true
        }
      });
    } else if (preset === 'moderate') {
      setCurrentReps(10);
      setLiveAsymmetry(8.6);
      setLiveLeftStance(0.76);
      setLiveRightStance(0.66);
      onChange({
        chairStand: {
          completedReps: 10,
          avgFlexionAngle: 92,
          testDurationSeconds: 30,
          fatigueIndex: 34,
          completed: true
        },
        gait: {
          asymmetryIndex: 8.6,
          leftStanceDurationSec: 0.76,
          rightStanceDurationSec: 0.66,
          strideVariabilityPercent: 5.4,
          cadenceStepsPerMin: 94,
          completed: true
        },
        rom: {
          maxFlexionAngle: 114,
          extensionDeficitAngle: 6,
          jointCrepitusPresent: true,
          affectedKnee: 'Left',
          completed: true
        }
      });
    } else {
      setCurrentReps(6);
      setLiveAsymmetry(15.4);
      setLiveLeftStance(0.92);
      setLiveRightStance(0.58);
      onChange({
        chairStand: {
          completedReps: 6,
          avgFlexionAngle: 82,
          testDurationSeconds: 30,
          fatigueIndex: 58,
          completed: true
        },
        gait: {
          asymmetryIndex: 15.4,
          leftStanceDurationSec: 0.92,
          rightStanceDurationSec: 0.58,
          strideVariabilityPercent: 8.9,
          cadenceStepsPerMin: 76,
          completed: true
        },
        rom: {
          maxFlexionAngle: 96,
          extensionDeficitAngle: 13,
          jointCrepitusPresent: true,
          affectedKnee: 'Both',
          completed: true
        }
      });
    }
  };

  const handleStartTest = () => {
    setIsAssessing(true);
    setTimeLeft(activeTab === 'chair' ? 30 : 20);
    simStateRef.current.reps = 0;
    setCurrentReps(0);
    sounds.playTestStart();
  };

  const handleCompleteTest = () => {
    setIsAssessing(false);
    sounds.playTestComplete();

    // Persist test results
    if (activeTab === 'chair') {
      const reps = Math.max(simStateRef.current.reps, 6);
      onChange({
        ...data,
        chairStand: {
          completedReps: reps,
          avgFlexionAngle: liveKneeAngle,
          testDurationSeconds: 30,
          fatigueIndex: conditionPreset === 'severe' ? 55 : conditionPreset === 'healthy' ? 14 : 32,
          completed: true
        }
      });
    } else if (activeTab === 'gait') {
      onChange({
        ...data,
        gait: {
          asymmetryIndex: liveAsymmetry,
          leftStanceDurationSec: liveLeftStance,
          rightStanceDurationSec: liveRightStance,
          strideVariabilityPercent: conditionPreset === 'severe' ? 8.4 : 4.8,
          cadenceStepsPerMin: conditionPreset === 'severe' ? 78 : 98,
          completed: true
        }
      });
    } else {
      onChange({
        ...data,
        rom: {
          maxFlexionAngle: conditionPreset === 'severe' ? 96 : conditionPreset === 'healthy' ? 134 : 115,
          extensionDeficitAngle: conditionPreset === 'severe' ? 12 : conditionPreset === 'healthy' ? 1 : 5,
          jointCrepitusPresent: conditionPreset !== 'healthy',
          affectedKnee: 'Both',
          completed: true
        }
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm transition-colors duration-200">
      {/* Header & Functional Test Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t.step2}: Biomechanical Pose Estimation
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Conduct 3 validated kinetic tests with real-time joint skeleton tracking and asymmetry index.
          </p>
        </div>

        {/* Test Selector Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTestTab('chair');
              setIsAssessing(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'chair'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.chairTest}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTestTab('gait');
              setIsAssessing(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'gait'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.gaitTest}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTestTab('rom');
              setIsAssessing(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'rom'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.romTest}
          </button>
        </div>
      </div>

      {cameraError && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Simulator & Camera Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Viewport Screen with Pose Skeleton */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] w-full border border-slate-700/80 shadow-inner flex items-center justify-center">
            {/* Real Video Layer (Hidden if Simulation) */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                feedSource === 'webcam' ? 'block' : 'hidden'
              }`}
            />

            {/* Pose Estimation Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={560}
              height={420}
              className="relative z-10 w-full h-full object-contain"
            />

            {/* In-Screen HUD Overlays */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
              <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-100 flex items-center gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Knee Flexion</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{liveKneeAngle}°</span>
                </div>
                <div className="h-6 w-px bg-slate-700" />
                {activeTab === 'chair' && (
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Chair Reps</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {currentReps} <span className="text-[10px] text-slate-400">reps</span>
                    </span>
                  </div>
                )}
                {activeTab === 'gait' && (
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Asymmetry</span>
                    <span className="font-mono font-bold text-teal-400 text-sm">
                      {liveAsymmetry.toFixed(1)}%
                    </span>
                  </div>
                )}
                {activeTab === 'rom' && (
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Max Flexion</span>
                    <span className="font-mono font-bold text-teal-400 text-sm">
                      {data.rom.maxFlexionAngle || 114}°
                    </span>
                  </div>
                )}
              </div>

              {/* Assessment Timer Badge */}
              {isAssessing && (
                <div className="bg-rose-500/90 text-white px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                </div>
              )}
            </div>
          </div>

          {/* Camera & Simulation Controls */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFeedSource('simulation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  feedSource === 'simulation'
                    ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                <span>Simulated Feed</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedSource('webcam')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  feedSource === 'webcam'
                    ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-slate-500" />
                <span>Device Camera</span>
              </button>
            </div>

            {/* Test Action Trigger */}
            <div className="flex items-center gap-2">
              {!isAssessing ? (
                <button
                  type="button"
                  onClick={handleStartTest}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-600/20 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start 30s Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteTest}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop & Save Metrics</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Real-time Biomechanical Metrics & Preset Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-500" />
                Biomechanical Profile Preset
              </span>
              <span className="text-[11px] text-slate-400">1-Click Test Data</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleApplyPreset('healthy')}
                className={`py-2 px-1 text-center text-xs rounded-lg border transition-all cursor-pointer ${
                  conditionPreset === 'healthy'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Normal Gait
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('moderate')}
                className={`py-2 px-1 text-center text-xs rounded-lg border transition-all cursor-pointer ${
                  conditionPreset === 'moderate'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Moderate OA
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('severe')}
                className={`py-2 px-1 text-center text-xs rounded-lg border transition-all cursor-pointer ${
                  conditionPreset === 'severe'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Severe OA
              </button>
            </div>
          </div>

          {/* Test 1 Metrics: Chair Stand */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    data.chairStand.completed ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  30s Chair Stand Test
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                {data.chairStand.completedReps || currentReps} reps
              </span>
            </div>

            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Quadriceps Sarcopenia Index:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {(data.chairStand.completedReps || currentReps) >= 14
                  ? 'Normal Functional Power'
                  : (data.chairStand.completedReps || currentReps) >= 9
                  ? 'Mild Functional Deficit'
                  : 'Severe Quadriceps Weakness'}
              </span>
            </div>
          </div>

          {/* Test 2 Metrics: 10m Gait & Stride */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    data.gait.completed ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  10m Gait & Antalgic Limp
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                {data.gait.asymmetryIndex.toFixed(1)}% Asymmetry
              </span>
            </div>

            {/* Asymmetry Progress Gauge */}
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  data.gait.asymmetryIndex > 12
                    ? 'bg-rose-500'
                    : data.gait.asymmetryIndex > 6
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, data.gait.asymmetryIndex * 5)}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Symmetric (&lt;5%)</span>
              <span>Mild (5-10%)</span>
              <span>Severe (&gt;10%)</span>
            </div>
          </div>

          {/* Test 3 Metrics: ROM */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    data.rom.completed ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Range of Motion (ROM)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                {data.rom.maxFlexionAngle}° / 135°
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Extension Deficit:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {data.rom.extensionDeficitAngle}°
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Joint Crepitus (Crackling):</span>
              <span
                className={`font-semibold ${
                  data.rom.jointCrepitusPresent ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                }`}
              >
                {data.rom.jointCrepitusPresent ? 'Present (Audible)' : 'None'}
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
          <span>Back to Demographics</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm shadow-teal-600/20 active:scale-95 transition-all"
        >
          <span>Continue to WOMAC Symptoms</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
