import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Eye, ShieldAlert, KeyRound } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { haptics } from '../utils/haptics';
import { Language, translations } from '../utils/i18n';
import { useTheme } from '../utils/themeContext';
import { useModalEffects } from '../hooks/useModalEffects';

interface PrivacyScreenProps {
  targetRoleName: string;
  onUnlocked: () => void;
  description?: string;
  lang: Language;
}

const HOLD_DURATION_MS = 700;

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({
  targetRoleName,
  onUnlocked,
  description,
  lang,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showEarlyHint, setShowEarlyHint] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const t = translations[lang];
  const { themeClasses, themeMode } = useTheme();
  const isLight = themeMode === 'light';

  useModalEffects(!unlocked);

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAnimation();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, [stopAnimation]);

  const completeUnlock = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    stopAnimation();
    setIsHolding(false);
    setHoldProgress(100);
    soundManager.playClick(true);
    haptics.unlock();
    setUnlocked(true);
    timeoutRef.current = setTimeout(() => {
      onUnlocked();
    }, 150);
  }, [onUnlocked, stopAnimation]);

  const startHold = useCallback(() => {
    if (completedRef.current || holdStartRef.current !== null) return;
    setShowEarlyHint(false);
    setIsHolding(true);
    haptics.tap();
    holdStartRef.current = performance.now();

    const tick = (now: number) => {
      if (holdStartRef.current === null || completedRef.current) return;
      const elapsed = now - holdStartRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        completeUnlock();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [completeUnlock]);

  const cancelHold = useCallback(() => {
    if (completedRef.current || holdStartRef.current === null) return;
    const elapsed = performance.now() - holdStartRef.current;
    holdStartRef.current = null;
    stopAnimation();
    setIsHolding(false);
    setHoldProgress(0);

    if (elapsed < HOLD_DURATION_MS) {
      setShowEarlyHint(true);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = setTimeout(() => {
        setShowEarlyHint(false);
      }, 2200);
    }
  }, [stopAnimation]);

  if (unlocked) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={t.privacyTitle} className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-stone-100 animate-fadeIn">
      <div className={`max-w-md w-full ${themeClasses.bgPanel} p-8 shadow-2xl text-center relative overflow-hidden`}>
        <div className={`absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 ${isLight ? 'border-amber-600' : 'border-amber-500'}`}></div>
        <div className={`absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 ${isLight ? 'border-amber-600' : 'border-amber-500'}`}></div>
        <div className={`absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 ${isLight ? 'border-amber-600' : 'border-amber-500'}`}></div>
        <div className={`absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 ${isLight ? 'border-amber-600' : 'border-amber-500'}`}></div>

        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border ${isLight ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-amber-950/80 border-amber-700/50 text-amber-400'}`}>
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div className={`inline-block px-3 py-1 border rounded-full text-xs font-serif uppercase tracking-widest mb-3 ${isLight ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-amber-900/40 border-amber-700/40 text-amber-300'}`}>
          {t.privacyTitle}
        </div>

        <h2 className={`text-2xl font-serif mb-2 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
          {t.privacyScreenFor} <span className={themeClasses.accentText}>{targetRoleName}</span>
        </h2>

        <p className={`text-sm mb-6 leading-relaxed font-sans ${isLight ? 'text-stone-700' : 'text-stone-400'}`}>
          {description || t.privacyPass}
        </p>

        <button
          type="button"
          onPointerDown={(e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            e.currentTarget.setPointerCapture?.(e.pointerId);
            startHold();
          }}
          onPointerUp={cancelHold}
          onPointerCancel={cancelHold}
          onLostPointerCapture={cancelHold}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
              e.preventDefault();
              startHold();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              cancelHold();
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
          className={`relative w-full py-4 px-4 flex items-center justify-center gap-3 transition-transform text-base sm:text-lg font-serif overflow-hidden touch-none select-none cursor-pointer ${
            isHolding ? 'scale-[0.98]' : ''
          } ${themeClasses.buttonPrimary}`}
        >
          <span
            aria-hidden="true"
            className={`absolute inset-y-0 left-0 pointer-events-none transition-none ${
              isLight ? 'bg-stone-950/20' : 'bg-white/25'
            }`}
            style={{ width: `${holdProgress}%` }}
          />
          <KeyRound className="w-5 h-5 relative z-10 shrink-0" />
          <span className="relative z-10">
            {isHolding ? t.privacyHolding : `${t.privacyIAm} ${targetRoleName}, ${t.privacyButton}`}
          </span>
        </button>

        <p
          className={`mt-3 text-xs font-sans min-h-[18px] transition-colors ${
            showEarlyHint
              ? isLight
                ? 'text-amber-700 font-semibold'
                : 'text-amber-300 font-semibold'
              : isLight
              ? 'text-stone-600'
              : 'text-stone-400'
          }`}
        >
          {showEarlyHint ? t.privacyHoldReleaseHint : t.privacyHoldHint}
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500 font-serif">
          <Eye className="w-4 h-4" />
          <span>{t.privacyLookAway}</span>
        </div>
      </div>
    </div>
  );
};
