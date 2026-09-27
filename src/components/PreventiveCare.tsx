import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Sparkles,
  Mountain,
  Utensils,
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { speakAdvice, stopSpeaking, sounds } from '../utils/audio';

interface PreventiveCareProps {
  language: LanguageCode;
  onDone: () => void;
}

export const PreventiveCare: React.FC<PreventiveCareProps> = ({ language, onDone }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [activeTab, setActiveTab] = useState<'ergonomics' | 'exercises' | 'nutrition'>('ergonomics');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Exercise Timer state
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const exercises = [
    {
      title: 'Seated Isometric Quadriceps Tightening',
      description: 'Tighten the muscle on top of your thigh while pressing the back of your knee firmly downwards into the bench or mat.',
      hold: 'Hold for 10 seconds, repeat 10 times daily',
      target: 'Strengthens patella stabilizer muscles without grinding joint cartilage',
      illustration: '🦵'
    },
    {
      title: 'Straight Leg Raise (Supine SLR)',
      description: 'Lie on your back, bend one knee, and slowly lift the opposite straight leg 6 inches above the floor.',
      hold: 'Hold 5 seconds at the top, lower smoothly',
      target: 'Builds hip flexor & vastus medialis strength for slope climbing',
      illustration: '🧘'
    },
    {
      title: 'Wall Squat with Cushion Support',
      description: 'Stand with your back flat against a wooden pillar or smooth wall. Slowly slide down only 30 degrees (do not go past 45°).',
      hold: 'Hold for 15 seconds, rise slowly',
      target: 'Reinforces eccentric deceleration used during downhill mountain descents',
      illustration: '🧍'
    },
    {
      title: 'Seated Ankle Pumps & Heel Slides',
      description: 'Sit upright, slide your heel slowly back to bend the knee comfortably, then pump your toes up toward your shin.',
      hold: '15 repetitions per leg morning and evening',
      target: 'Promotes synovial fluid circulation and relieves morning joint stiffness',
      illustration: '👟'
    }
  ];

  // Handle Audio Speech Narration
  const handleToggleSpeech = (textToSpeak: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakAdvice(textToSpeak, language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-IN');
      // Auto-toggle off after timeout estimation
      setTimeout(() => setIsSpeaking(false), 12000);
    }
  };

  // Handle Exercise Timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            sounds.playTestComplete();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center">
              5
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t.guidanceTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Culturally tailored guidance for North Eastern agrarian, tea garden, and hilly terrains.
          </p>
        </div>

        {/* Global Read Aloud Audio Toggle */}
        <button
          type="button"
          onClick={() =>
            handleToggleSpeech(
              'Here is preventive knee care advice for North East India. Learn how to protect your joints while walking down hills, do daily strengthening exercises, and consume local calcium rich foods.'
            )
          }
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
            isSpeaking
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/20 animate-pulse'
              : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isSpeaking ? 'Stop Audio Narration' : 'Read Aloud for Elder Patient'}</span>
        </button>
      </div>

      {/* Module Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 mt-6 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ergonomics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ergonomics'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Mountain className="w-4 h-4" />
          <span>1. Hill-Walking & Load Ergonomics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exercises')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'exercises'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>2. Isometric Knee Strengthening</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nutrition')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'nutrition'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>3. NER Bone & Cartilage Nutrition</span>
        </button>
      </div>

      {/* Tab 1: Ergonomics & Hill-Walking Techniques */}
      {activeTab === 'ergonomics' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Technique 1 */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg mb-3">
                ⛰️
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                The "Switchback" Zig-Zag Mountain Descent
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Walking straight down steep hillside gradients forces the knee to absorb 350% of total body weight with each step.
              </p>
              <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs space-y-1.5">
                <div className="font-semibold text-teal-700 dark:text-teal-300">
                  Recommended Technique:
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  • Descend in diagonal zig-zags rather than straight downward lines.
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  • Keep knees slightly flexed (soft knees) instead of locking the joint straight.
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  • Take shorter, rhythmic steps rather than long strides.
                </div>
              </div>
            </div>

            {/* Technique 2: Namlo & Headloading */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg mb-3">
                🧺
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Traditional Forehead Tumpline (Namlo) Offloading
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Carrying heavy firewood or produce via a single forehead strap shifts the center of gravity forward, severely loading the patellofemoral compartment.
              </p>
              <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs space-y-1.5">
                <div className="font-semibold text-amber-700 dark:text-amber-300">
                  Ergonomic Adaptation:
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  • Add dual padded shoulder straps to the basket so weight rests evenly on the pelvis and back.
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  • Split heavy loads (e.g. carry 10kg twice rather than 20kg in a single steep descent).
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  • Always carry a lightweight carved bamboo walking stick in the dominant hand.
                </div>
              </div>
            </div>
          </div>

          {/* Bamboo Walking Stick Offloader */}
          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
              <span className="font-bold">Biomechanical Clinical Note:</span> A simple indigenous bamboo trekking pole reduces bilateral knee compressive loads by up to <span className="font-bold">22% to 28%</span> during rural hillside farming activities, significantly decelerating medial compartment cartilage wear.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Knee Isometric Exercises with Live Interactive Timer */}
      {activeTab === 'exercises' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Exercise List */}
            <div className="lg:col-span-7 space-y-3">
              {exercises.map((ex, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveExerciseIndex(idx);
                    setIsTimerRunning(false);
                    setTimerSeconds(10);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    activeExerciseIndex === idx
                      ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{ex.illustration}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {ex.title}
                        </h4>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                          Exercise #{idx + 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        {ex.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                        <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">
                          {ex.hold}
                        </span>
                        <span>•</span>
                        <span className="text-teal-600 dark:text-teal-400">{ex.target}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Hold Timer */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                  Interactive Practice Timer
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {exercises[activeExerciseIndex]?.title}
                </h4>
              </div>

              {/* Big Circular Countdown Display */}
              <div className="my-6 relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-mono font-extrabold text-teal-600 dark:text-teal-400">
                      {timerSeconds}
                    </span>
                    <span className="text-[10px] block text-slate-400 uppercase">seconds</span>
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 text-white shadow-sm transition-all cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                      : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isTimerRunning ? 'Pause Timer' : 'Start 10s Hold'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(10);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Local NER Nutrition for Bone & Cartilage */}
      {activeTab === 'nutrition' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Shidal / Ngari */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
              <div className="text-2xl mb-2">🐟</div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Traditional Fermented Fish (Shidal / Ngari)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Small fish consumed with edible bones provide exceptional bioavailable calcium and phosphorus, vital for subchondral bone density.
              </p>
              <div className="mt-3 text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                Nutrient: ~800mg Calcium / 100g
              </div>
            </div>

            {/* Black Sesame */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
              <div className="text-2xl mb-2">🌱</div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Indigenous Black Sesame (Teel / Til)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Commonly prepared in Assamese *Til Pitha* and Khasi sesame chutneys. Rich in zinc, copper, and plant calcium to fight joint inflammation.
              </p>
              <div className="mt-3 text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                Nutrient: Rich in Sesamin & Calcium
              </div>
            </div>

            {/* Akhuni / Hawaijar */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
              <div className="text-2xl mb-2">🥣</div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Fermented Soybean (Akhuni / Hawaijar)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Fermentation creates high concentrations of Vitamin K2 (Menaquinone-7), which directs calcium into bones instead of blood vessels.
              </p>
              <div className="mt-3 text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                Nutrient: Natural Vitamin K2 & Peptide Matrix
              </div>
            </div>

            {/* Moringa Leaves */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
              <div className="text-2xl mb-2">🌿</div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Moringa (Sojina / Drumstick) Leaves
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Widely grown in village gardens across NER. Contains 4x the calcium of milk and powerful quercetin flavonoids that soothe stiff joints.
              </p>
              <div className="mt-3 text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                Nutrient: High Calcium & Anti-oxidants
              </div>
            </div>

            {/* Bamboo Shoots */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
              <div className="text-2xl mb-2">🎋</div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Organic Bamboo Shoot Broth (Khorisa / Bastenga)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Packed with organic silica, an essential trace element required for synthesis of collagen and glycosaminoglycans in knee cartilage.
              </p>
              <div className="mt-3 text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                Nutrient: Bio-Silica for Cartilage
              </div>
            </div>

            {/* Sunshine Vitamin D */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
              <div className="text-2xl mb-2">☀️</div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Morning Sunlight Exposure (20 mins)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                During cold foggy NER winters, Vitamin D levels drop sharply. Encourage elderly field workers to get 20 minutes of morning sunlight on arms and legs.
              </p>
              <div className="mt-3 text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                Essential: Synthesizes Vitamin D3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Done & Return */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Evidence-based community osteoarthritis guidelines (ICMR / WHO)</span>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm shadow-teal-600/20 active:scale-95 transition-all"
        >
          <span>Return to Triage Summary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
