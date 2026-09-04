import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Sparkles, 
  ChevronDown, 
  Award,
  Undo2
} from 'lucide-react';
import { AppSettings, FloatingParticle, Language, Mantra, UserProfile } from '../types';
import { playBeadSound, playMalaBellSound, triggerHaptic } from '../services/audio';
import { recordChant } from '../services/storage';

interface ChantingCounterProps {
  user: UserProfile | null;
  settings: AppSettings;
  mantras: Mantra[];
  todayCount: number;
  todayMala: number;
  totalMantraLifetime?: number;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onChantIncrement: (newTodayCount: number, newTodayMala: number, totalMantra: number) => void;
  onOpenMantraSelector: () => void;
  onOpenSettings: () => void;
}

export const ChantingCounter: React.FC<ChantingCounterProps> = ({
  user,
  settings,
  mantras,
  todayCount,
  todayMala,
  onUpdateSettings,
  onChantIncrement,
  onOpenMantraSelector,
}) => {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [isPressing, setIsPressing] = useState(false);
  const [recentCompletedMala, setRecentCompletedMala] = useState<number | null>(null);

  const nextParticleId = useRef(0);
  const circleRef = useRef<HTMLButtonElement>(null);
  const lastTouchCoord = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 200,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
  });

  const activeMantra = mantras.find((m) => m.id === settings.activeMantraId) || mantras[0];

  // Active deity name in selected script
  const getDeityName = useCallback(
    (lang: Language = settings.language) => {
      if (!activeMantra) return 'Radha';
      return activeMantra.name[lang] || activeMantra.name.en;
    },
    [activeMantra, settings.language]
  );

  // Bead count within the current 108 mala cycle
  const currentMalaBead = todayCount % 108;

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    lastTouchCoord.current = { x: e.clientX, y: e.clientY };
    setIsPressing(true);
  };

  // Handle center circle tap
  const handleTap = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e && 'touches' in e && e.touches.length > 1) return;

    if (settings.hapticEnabled) {
      triggerHaptic('tap');
    }
    if (settings.soundEnabled) {
      playBeadSound();
    }

    // Increment count
    const updated = recordChant(activeMantra.id, 1);
    onChantIncrement(updated.todayCount, updated.todayMala, updated.totalMantraCount);

    // Check for 108 Mala milestone
    const newBead = updated.todayCount % 108;
    if (newBead === 0 && updated.todayCount > 0) {
      if (settings.malaBellEnabled) {
        playMalaBellSound();
      }
      if (settings.hapticEnabled) {
        triggerHaptic('mala');
      }
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#4FAFD1', '#8ED1E8', '#FFFFFF', '#BFE3F0', '#FFFDF7'],
      });
      setRecentCompletedMala(updated.todayMala);
      setTimeout(() => setRecentCompletedMala(null), 4000);
    }

    // Determine exact touch / click coordinates
    let tapX = lastTouchCoord.current.x;
    let tapY = lastTouchCoord.current.y;
    if (e && 'clientX' in e && typeof e.clientX === 'number' && e.clientX > 0) {
      tapX = e.clientX;
      tapY = e.clientY;
    }

    // Spawn floating mantra text: starts at point of touch and goes straight up for 4 seconds
    const text = getDeityName();
    const particleId = ++nextParticleId.current;

    setParticles((prev) => [
      ...prev.slice(-15),
      {
        id: particleId,
        text,
        x: tapX,
        y: tapY,
        angle: 0,
      },
    ]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== particleId));
    }, 4000);
  };

  const handleUndo = () => {
    if (todayCount <= 0) return;
    const updated = recordChant(activeMantra.id, -1);
    onChantIncrement(updated.todayCount, updated.todayMala, updated.totalMantraCount);
    if (settings.hapticEnabled) triggerHaptic('light');
  };

  const handleLanguageChange = (lang: Language) => {
    onUpdateSettings({ language: lang });
    if (settings.hapticEnabled) triggerHaptic('light');
  };

  // Time-of-day greeting (Hari Om / Jay Hari Mauli / Good Morning)
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (settings.language === 'mr') return 'जय हरी माऊली';
    if (settings.language === 'hi') return 'हरि ॐ';
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex-1 flex flex-col justify-between w-full max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-6 select-none relative pb-28">
      {/* Floating particles layer: Pop up from exact point of touch and go straight up for 4 seconds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0.95, scale: 0.85, y: 0, x: 0 }}
              animate={{
                opacity: 0,
                scale: 1.35,
                y: -300, // goes straight vertically up
                x: 0,    // perfectly straight, no drift
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4.0, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                left: p.x,
                top: p.y,
                transform: 'translate(-50%, -50%)',
              }}
              className="font-serif text-3xl sm:text-5xl text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.95)] tracking-wider select-none whitespace-nowrap"
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* HEADER (Immersive UI Style: Greeting + Mantra Pill + Audio Controls + Language Switcher) */}
      <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white z-10">
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-widest opacity-80 mb-0.5 font-medium">
            {getGreeting()}
          </span>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight flex items-center gap-2">
            <span>{user?.name || 'Devotee'}</span>
            <button
              id="mantra-picker-pill"
              onClick={onOpenMantraSelector}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/35 text-xs font-normal tracking-normal transition active:scale-95 cursor-pointer ml-1 text-white"
            >
              <Sparkles className="w-3 h-3 text-[#FFFDF7]" />
              <span>{getDeityName()}</span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio & Haptic Controls */}
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 p-1 rounded-xl">
            <button
              id="toggle-sound-btn"
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              title={settings.soundEnabled ? 'Mute Japa Bead Sound' : 'Enable Bead Sound'}
              className={`p-2 rounded-lg transition cursor-pointer ${
                settings.soundEnabled ? 'bg-white text-[#1E3A4C] shadow-sm' : 'text-white/70 hover:bg-white/15'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              id="toggle-haptic-btn"
              onClick={() => onUpdateSettings({ hapticEnabled: !settings.hapticEnabled })}
              title={settings.hapticEnabled ? 'Haptics Enabled' : 'Haptics Disabled'}
              className={`p-2 rounded-lg transition cursor-pointer ${
                settings.hapticEnabled ? 'bg-white text-[#1E3A4C] shadow-sm' : 'text-white/70 hover:bg-white/15'
              }`}
            >
              <Vibrate className="w-4 h-4" />
            </button>
            {todayCount > 0 && (
              <button
                id="counter-undo-btn"
                onClick={handleUndo}
                title="Undo last bead count"
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Language Switcher (Hindi, Marathi, English) */}
          <div className="flex gap-1 bg-white/20 backdrop-blur-md border border-white/30 p-1 rounded-xl">
            {(
              [
                { code: 'hi', label: 'हिंदी' },
                { code: 'mr', label: 'मराठी' },
                { code: 'en', label: 'English' },
              ] as const
            ).map((lang) => {
              const active = settings.language === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`lang-btn-${lang.code}`}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-[#1E3A4C] shadow-md font-semibold'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA: Centered Circle & Sacred Mantra Display (Pure Devotional Focus) */}
      <main className="flex-1 relative flex flex-col items-center justify-center my-6 sm:my-10 z-10">
        <div className="flex flex-col items-center justify-center relative w-full">
          {/* Active Sacred Deity Name */}
          <div className="text-white flex flex-col items-center mb-6 sm:mb-8 text-center">
            <span className="text-5xl sm:text-7xl font-serif tracking-wide drop-shadow-[0_2px_14px_rgba(30,58,76,0.2)]">
              {getDeityName()}
            </span>
          </div>

          {/* Milestone Banner */}
          <AnimatePresence>
            {recentCompletedMala !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -10 }}
                className="mb-4 px-5 py-2.5 rounded-full bg-[#F8FCFE]/95 backdrop-blur-md border border-[#BFE3F0] text-[#1E3A4C] font-medium text-xs sm:text-sm shadow-xl flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-[#4FAFD1]" />
                <span>
                  {settings.language === 'mr'
                    ? `माळ #${recentCompletedMala} पूर्ण झाली! जय हरी माऊली 🙏`
                    : settings.language === 'hi'
                    ? `माला #${recentCompletedMala} पूर्ण हुई! हरि ॐ 🙏`
                    : `Mala #${recentCompletedMala} Completed! Hari Om 🙏`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Central Interactive Frosted Glass Circle */}
          <div className="relative flex items-center justify-center">
            {/* Ambient halo glow */}
            <div
              className={`absolute inset-0 rounded-full bg-white/30 blur-2xl transition-all duration-300 ${
                isPressing ? 'scale-110 opacity-80' : 'scale-100 opacity-40'
              }`}
            />

            {/* Circular Bead Progress Ring */}
            <svg className="w-80 h-80 sm:w-96 sm:h-96 -rotate-90 pointer-events-none z-10">
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                className="stroke-white/30 fill-transparent"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                className="stroke-white fill-transparent transition-all duration-150"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 170}
                strokeDashoffset={2 * Math.PI * 170 * (1 - currentMalaBead / 108)}
              />
            </svg>

            {/* The Central Circle */}
            <motion.button
              ref={circleRef}
              id="chant-center-circle-button"
              onClick={(e) => handleTap(e)}
              onPointerDown={handlePointerDown}
              onPointerUp={() => setIsPressing(false)}
              onPointerCancel={() => setIsPressing(false)}
              whileTap={{ scale: 0.95 }}
              className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full glass-circle flex flex-col items-center justify-center text-white cursor-pointer select-none transition-transform z-20 focus:outline-none"
            >
              {/* Main Total Count */}
              <span className="text-6xl sm:text-8xl font-light tracking-tighter">
                {todayCount.toLocaleString()}
              </span>

              {/* Minimal Line Divider */}
              <div className="w-24 h-px bg-white/30 my-3 sm:my-4" />

              {/* Mala Count (Localized: माळ / माला / Mala) */}
              <span className="text-lg sm:text-xl font-medium tracking-widest uppercase opacity-85">
                {settings.language === 'mr' ? 'माळ' : settings.language === 'hi' ? 'माला' : 'Mala'}{' '}
                {todayMala < 10 ? `0${todayMala}` : todayMala}
              </span>

              {/* Bead in current Mala (Localized: मणी / मनका / Bead) */}
              <span className="text-xs uppercase tracking-wider text-white/70 mt-1 font-mono">
                {settings.language === 'mr' ? 'मणी' : settings.language === 'hi' ? 'मनका' : 'Bead'}{' '}
                {currentMalaBead} / 108
              </span>
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
};
