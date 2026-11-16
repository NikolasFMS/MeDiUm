import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, HuntProgress, Room } from '../types/game';
import { MANSION_ARTIFACTS, getRoomSide } from '../data/mansionData';
import { ShieldCheck, Skull, Timer, Eye, AlertTriangle, RotateCcw, Play, Pause, Sparkles, Check, CloudFog, Zap } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { haptics } from '../utils/haptics';
import { Language, translations, ROOM_TRANSLATIONS, ARTIFACT_TRANSLATIONS, getClueTranslation } from '../utils/i18n';
import { useTheme } from '../utils/themeContext';
import { useModalEffects } from '../hooks/useModalEffects';
import { ArtifactIcon } from './ArtifactIcon';

interface HuntPhaseProps {
  state: GameState;
  onResolveHunt: (guessedRoomId: string, isCorrect: boolean) => void;
  onUpdateProgress: (progress: HuntProgress) => void;
  lang: Language;
}

const TIMER_DURATION_STORAGE_KEY = 'medium_mansion_timer_duration_v1';
const TIMER_PRESETS = [60, 120, 180] as const;

function getSavedTimerDuration(): number {
  try {
    const val = Number(localStorage.getItem(TIMER_DURATION_STORAGE_KEY));
    if (val === 60 || val === 120 || val === 180) return val;
  } catch {}
  return 120;
}

function computeRemainingSeconds(progress?: HuntProgress | null): number {
  if (!progress) return getSavedTimerDuration();
  if (progress.resultRevealed || !progress.timerRunning) {
    return progress.timerSeconds;
  }
  if (progress.timerEndsAt) {
    return Math.max(0, Math.ceil((progress.timerEndsAt - Date.now()) / 1000));
  }
  if (progress.timerLastTickAt) {
    const elapsed = Math.floor((Date.now() - progress.timerLastTickAt) / 1000);
    return Math.max(0, progress.timerSeconds - elapsed);
  }
  return progress.timerSeconds;
}

export const HuntPhase: React.FC<HuntPhaseProps> = ({ state, onResolveHunt, onUpdateProgress, lang }) => {
  const saved = state.huntProgress;
  const defaultDuration = state.modifiers?.blitzTimer
    ? Math.max(30, 60 - state.lostCount * 10)
    : getSavedTimerDuration();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(saved?.selectedRoomId ?? null);
  const [timerDuration, setTimerDuration] = useState<number>(defaultDuration);
  const [timerSeconds, setTimerSeconds] = useState<number>(() =>
    saved ? computeRemainingSeconds(saved) : defaultDuration
  );
  const [timerRunning, setTimerRunning] = useState<boolean>(
    saved ? (saved.resultRevealed ? false : saved.timerRunning && computeRemainingSeconds(saved) > 0) : true
  );
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(saved?.resultRevealed ?? false);
  const [lastResultCorrect, setLastResultCorrect] = useState<boolean | null>(saved?.lastResultCorrect ?? null);

  const timerEndsAtRef = useRef<number | null>(
    saved && saved.timerRunning && !saved.resultRevealed
      ? saved.timerEndsAt ?? Date.now() + computeRemainingSeconds(saved) * 1000
      : !saved
      ? Date.now() + getSavedTimerDuration() * 1000
      : null
  );
  const prevSecondsRef = useRef<number>(timerSeconds);
  const onUpdateProgressRef = useRef(onUpdateProgress);
  onUpdateProgressRef.current = onUpdateProgress;

  const t = translations[lang];
  const { themeClasses, themeMode } = useTheme();
  const isLight = themeMode === 'light';

  useModalEffects(showConfirmModal, () => setShowConfirmModal(false));
  useModalEffects(showResultModal);

  const activeRooms = state.rooms.filter((r) => r.status === 'active');
  const currentHideout = state.currentHideout;
  const targetRoom = state.rooms.find((r) => r.id === currentHideout?.roomId);

  const persistProgress = useCallback(
    (overrides: Partial<HuntProgress>) => {
      const nextRunning = overrides.timerRunning ?? timerRunning;
      const nextSeconds = overrides.timerSeconds ?? timerSeconds;
      const nextEndsAt =
        overrides.timerEndsAt !== undefined
          ? overrides.timerEndsAt
          : nextRunning
          ? timerEndsAtRef.current ?? Date.now() + nextSeconds * 1000
          : null;

      onUpdateProgressRef.current({
        selectedRoomId: overrides.selectedRoomId !== undefined ? overrides.selectedRoomId : selectedRoomId,
        timerSeconds: nextSeconds,
        timerRunning: nextRunning,
        timerLastTickAt: nextRunning ? Date.now() : null,
        timerEndsAt: nextEndsAt,
        resultRevealed: overrides.resultRevealed ?? showResultModal,
        lastResultCorrect: overrides.lastResultCorrect !== undefined ? overrides.lastResultCorrect : lastResultCorrect,
      });
    },
    [timerRunning, timerSeconds, selectedRoomId, showResultModal, lastResultCorrect]
  );

  // Sync timer accurately against target end timestamp (handles backgrounding / screen lock)
  useEffect(() => {
    if (!timerRunning || showResultModal) return;

    if (!timerEndsAtRef.current) {
      timerEndsAtRef.current = Date.now() + timerSeconds * 1000;
    }

    const syncNow = () => {
      if (!timerEndsAtRef.current) return;
      const nextRemaining = Math.max(0, Math.ceil((timerEndsAtRef.current - Date.now()) / 1000));
      setTimerSeconds((prev) => (prev !== nextRemaining ? nextRemaining : prev));
    };

    syncNow();
    const interval = setInterval(syncNow, 250);
    const handleResume = () => {
      if (document.visibilityState === 'visible') syncNow();
    };
    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('focus', syncNow);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('focus', syncNow);
    };
  }, [timerRunning, showResultModal]);

  // Detect live expiration from >0 to 0, stop timer, play chime, and persist
  useEffect(() => {
    const wasPositive = prevSecondsRef.current > 0;
    prevSecondsRef.current = timerSeconds;

    if (timerSeconds === 0 && timerRunning && !showResultModal) {
      timerEndsAtRef.current = null;
      setTimerRunning(false);
      if (wasPositive) {
        soundManager.playTimerEndSound();
      }
      persistProgress({
        timerSeconds: 0,
        timerRunning: false,
        timerEndsAt: null,
      });
    }
  }, [timerSeconds, timerRunning, showResultModal, persistProgress]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const getRoomName = (room: Room) => {
    const side = getRoomSide(room, state.difficulty);
    const fallback = side === 'silver' ? room.nameSilver : room.nameGold;
    return ROOM_TRANSLATIONS[room.id]?.[lang]?.[side] || fallback;
  };

  const handleSelectRoom = (roomId: string) => {
    soundManager.playClick(true);
    haptics.select();
    setSelectedRoomId(roomId);
    persistProgress({ selectedRoomId: roomId });
  };

  const handleToggleTimer = () => {
    soundManager.playClick();
    if (timerSeconds === 0) {
      const endsAt = Date.now() + timerDuration * 1000;
      timerEndsAtRef.current = endsAt;
      setTimerSeconds(timerDuration);
      setTimerRunning(true);
      persistProgress({ timerSeconds: timerDuration, timerRunning: true, timerEndsAt: endsAt });
      return;
    }
    const nextRunning = !timerRunning;
    if (nextRunning) {
      const endsAt = Date.now() + timerSeconds * 1000;
      timerEndsAtRef.current = endsAt;
      setTimerRunning(true);
      persistProgress({ timerRunning: true, timerEndsAt: endsAt });
    } else {
      const remaining = timerEndsAtRef.current
        ? Math.max(0, Math.ceil((timerEndsAtRef.current - Date.now()) / 1000))
        : timerSeconds;
      timerEndsAtRef.current = null;
      setTimerSeconds(remaining);
      setTimerRunning(false);
      persistProgress({ timerSeconds: remaining, timerRunning: false, timerEndsAt: null });
    }
  };

  const handleResetTimer = () => {
    soundManager.playClick();
    timerEndsAtRef.current = null;
    setTimerSeconds(timerDuration);
    setTimerRunning(false);
    persistProgress({ timerSeconds: timerDuration, timerRunning: false, timerEndsAt: null });
  };

  const handleSelectDuration = (seconds: number) => {
    soundManager.playClick();
    setTimerDuration(seconds);
    try {
      localStorage.setItem(TIMER_DURATION_STORAGE_KEY, String(seconds));
    } catch {}
    // Preserve running/paused state instead of auto-starting a paused timer
    const shouldRun = timerRunning && !showResultModal;
    const endsAt = shouldRun ? Date.now() + seconds * 1000 : null;
    timerEndsAtRef.current = endsAt;
    setTimerSeconds(seconds);
    persistProgress({ timerSeconds: seconds, timerRunning: shouldRun, timerEndsAt: endsAt });
  };

  const handleRequestConfirmGuess = () => {
    if (!selectedRoomId || !targetRoom) return;
    soundManager.playClick();
    setShowConfirmModal(true);
  };

  const handleConfirmGuess = () => {
    if (!selectedRoomId || !targetRoom) return;
    setShowConfirmModal(false);
    const isCorrect = selectedRoomId === targetRoom.id;
    setLastResultCorrect(isCorrect);
    setShowResultModal(true);
    timerEndsAtRef.current = null;
    setTimerRunning(false);

    persistProgress({
      selectedRoomId,
      timerRunning: false,
      timerEndsAt: null,
      resultRevealed: true,
      lastResultCorrect: isCorrect,
    });

    if (isCorrect) {
      soundManager.playSealSound();
    } else {
      soundManager.playLossSound();
    }
  };

  const handleFinishResolution = () => {
    if (selectedRoomId && lastResultCorrect !== null) {
      soundManager.playClick();
      onResolveHunt(selectedRoomId, lastResultCorrect);
    }
  };

  const targetRoomName = targetRoom ? getRoomName(targetRoom) : '';

  const pickedRoom = selectedRoomId ? state.rooms.find((r) => r.id === selectedRoomId) : null;
  const pickedRoomName = pickedRoom ? getRoomName(pickedRoom) : '';
  const pickedIsFogged = Boolean(pickedRoom && state.foggedRoomId === pickedRoom.id);
  const pickedArtifact = pickedRoom && !pickedIsFogged ? MANSION_ARTIFACTS.find((a) => a.id === pickedRoom.artifactId) : null;
  const pickedArtifactName = pickedRoom && !pickedIsFogged ? ARTIFACT_TRANSLATIONS[pickedRoom.artifactId]?.[lang] || pickedArtifact?.name : '';

  const getRoomCardStyle = (isSelected: boolean) => {
    if (isSelected) {
      return isLight
        ? 'bg-amber-100 border-amber-600 text-amber-950 ring-2 ring-amber-500/50 shadow-md'
        : 'bg-amber-950/70 border-amber-400 text-amber-50 ring-2 ring-amber-400/40 shadow-md';
    }
    return isLight
      ? 'bg-white border-stone-300 text-stone-900 hover:border-amber-500'
      : 'bg-stone-950/85 border-stone-700/80 text-stone-100 hover:border-amber-500/70';
  };

  const isTimeUp = timerSeconds === 0;
  const isLowTime = timerSeconds > 0 && timerSeconds < 30;

  return (
    <>
      <div className="max-w-3xl mx-auto p-2.5 sm:p-4 space-y-3 pb-24 animate-fadeIn">
        {/* Top Timer & Phase Header */}
        <div className={`${themeClasses.bgPanel} p-3.5 sm:p-5 shadow-xl`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="text-center sm:text-left">
              <span className={`text-xs uppercase font-serif tracking-widest ${themeClasses.accentText}`}>{t.huntPhase}</span>
              <h2 className={`text-lg sm:text-2xl font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>{t.hunterDiscussion}</h2>
            </div>

            {/* Discussion Timer */}
            <div
              className={`w-full sm:w-auto flex flex-col gap-1.5 px-3 py-2 rounded-2xl border transition-colors ${
                isTimeUp
                  ? isLight
                    ? 'bg-red-100 border-red-400'
                    : 'bg-red-950/50 border-red-700/80'
                  : isLight
                  ? 'bg-amber-100/90 border-amber-300'
                  : 'bg-stone-950/80 border-stone-800'
              }`}
            >
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="flex items-center gap-2">
                  <Timer
                    className={`w-5 h-5 shrink-0 ${
                      isTimeUp
                        ? 'text-red-500 animate-pulse'
                        : isLowTime
                        ? 'text-red-500 animate-bounce'
                        : isLight
                        ? 'text-amber-700'
                        : 'text-amber-400'
                    }`}
                  />
                  <div className="leading-tight">
                    <span className={`text-[10px] uppercase font-serif tracking-wider block ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      {t.discussionTimer}
                    </span>
                    {isTimeUp ? (
                      <span className="text-sm sm:text-base font-serif font-bold text-red-500 uppercase tracking-wide">
                        {t.timesUp}
                      </span>
                    ) : (
                      <span className={`text-lg font-mono font-bold tabular-nums ${isLowTime ? 'text-red-500' : isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                        {formatTime(timerSeconds)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleTimer}
                    className={`px-2.5 py-1.5 text-xs font-serif font-bold rounded-lg border flex items-center gap-1 transition-colors ${
                      isLight
                        ? 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                    }`}
                  >
                    {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{timerRunning ? t.pause : t.start}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isLight
                        ? 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                    }`}
                    title={t.resetTimer}
                    aria-label={t.resetTimer}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Duration Presets or Blitz Indicator */}
              {state.modifiers?.blitzTimer ? (
                <div className="flex items-center justify-end gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-serif font-bold border ${
                    isLight ? 'bg-red-100 border-red-300 text-red-900' : 'bg-red-950/70 border-red-700/70 text-red-200'
                  }`}>
                    <Zap className="w-3 h-3" />
                    <span>{t.blitzBadge}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-1.5">
                  {TIMER_PRESETS.map((preset) => {
                    const isActive = timerDuration === preset;
                    const mins = preset / 60;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleSelectDuration(preset)}
                        className={`flex-1 sm:flex-initial px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border transition-colors ${
                          isActive
                            ? isLight
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-amber-700 text-stone-950 border-amber-500'
                            : isLight
                            ? 'bg-white/70 text-stone-700 border-stone-300 hover:border-amber-500'
                            : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                        }`}
                      >
                        {mins}{t.minutesShort}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Revealed Clues Bar (always visible while scrolling the 10 rooms) */}
        <div className="sticky top-[56px] sm:top-[62px] z-20">
          <div className={`p-2.5 sm:p-3 rounded-2xl border backdrop-blur-md shadow-lg ${
            isLight
              ? 'bg-amber-50/95 border-amber-400/80'
              : 'bg-stone-950/95 border-amber-700/60'
          }`}>
            <div className={`text-[10px] font-serif uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${themeClasses.accentText}`}>
              <Sparkles className="w-3 h-3" />
              <span>{t.tableClues} ({state.revealedClues.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {state.revealedClues.map((card) => (
                <div
                  key={card.id}
                  className={`px-3 py-1.5 border rounded-xl text-center shadow-sm ${
                    isLight
                      ? 'bg-white border-amber-400 text-stone-900'
                      : 'bg-gradient-to-br from-amber-950/85 via-stone-900 to-stone-950 border-amber-600/60 text-amber-100'
                  }`}
                >
                  <span className="text-sm sm:text-base font-serif font-bold tracking-wide">
                    «{getClueTranslation(card, lang)}»
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prompt + Room Selection Grid */}
        <div className={`${themeClasses.bgPanel} p-3.5 sm:p-5 shadow-2xl space-y-3`}>
          <div className={`border rounded-2xl p-2.5 sm:p-3 text-xs flex items-start gap-2 ${isLight ? 'bg-amber-100/70 border-amber-300 text-stone-800' : 'bg-amber-950/40 border-amber-800/60 text-stone-300'}`}>
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>{t.hunterPrompt}</p>
          </div>

          <div>
            <h3 className={`text-xs font-serif uppercase tracking-widest mb-2 ${themeClasses.accentText}`}>
              {t.selectRoomPrompt}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {activeRooms.map((room) => {
                const side = getRoomSide(room, state.difficulty);
                const roomName = getRoomName(room);
                const isFogged = state.foggedRoomId === room.id;
                const artifact = MANSION_ARTIFACTS.find((a) => a.id === room.artifactId);
                const artifactName = ARTIFACT_TRANSLATIONS[room.artifactId]?.[lang] || artifact?.name;
                const isSelected = selectedRoomId === room.id;

                return (
                  <button
                    key={room.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleSelectRoom(room.id)}
                    className={`min-w-0 overflow-hidden p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-1.5 text-left shadow-sm ${getRoomCardStyle(isSelected)}`}
                  >
                    <div className="flex items-start justify-between gap-1.5 w-full min-w-0">
                      <div className="min-w-0 flex-1">
                        <span className="text-[12px] sm:text-[13px] font-serif font-bold uppercase leading-[1.2] tracking-tight block break-words [overflow-wrap:anywhere]">
                          {roomName}
                        </span>
                        {state.modifiers?.mixedDifficulty && (
                          <span
                            className={`inline-block text-[9px] font-sans font-semibold mt-0.5 ${
                              side === 'gold'
                                ? isLight
                                  ? 'text-amber-700'
                                  : 'text-amber-400/90'
                                : isLight
                                ? 'text-stone-500'
                                : 'text-stone-400'
                            }`}
                          >
                            {side === 'gold' ? t.goldShort : t.silverShort}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {isFogged ? (
                      <div
                        className={`pt-1.5 border-t w-full flex items-center gap-1.5 ${
                          isSelected
                            ? isLight
                              ? 'border-amber-300'
                              : 'border-amber-700/60'
                            : isLight
                            ? 'border-stone-200'
                            : 'border-stone-800/90'
                        }`}
                      >
                        <CloudFog className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-sky-700' : 'text-sky-400'}`} />
                        <span className={`text-xs font-sans font-medium italic truncate ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>
                          {t.fogHiddenArtifact}
                        </span>
                      </div>
                    ) : artifact ? (
                      <div
                        className={`pt-1.5 border-t w-full flex items-center gap-1.5 ${
                          isSelected
                            ? isLight
                              ? 'border-amber-300'
                              : 'border-amber-700/60'
                            : isLight
                            ? 'border-stone-200'
                            : 'border-stone-800/90'
                        }`}
                      >
                        <ArtifactIcon
                          artifactId={artifact.id}
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected
                              ? isLight
                                ? 'text-amber-800'
                                : 'text-amber-300'
                              : isLight
                              ? 'text-amber-700'
                              : 'text-amber-400/90'
                          }`}
                        />
                        <span
                          className={`text-xs font-sans font-medium leading-tight ${
                            isSelected
                              ? isLight
                                ? 'text-amber-950'
                                : 'text-amber-100'
                              : isLight
                              ? 'text-stone-700'
                              : 'text-stone-300'
                          }`}
                        >
                          {artifactName}
                        </span>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Compact Confirm Action Bar */}
        <div className="sticky bottom-3 z-30 safe-bottom">
          <button
            type="button"
            onClick={handleRequestConfirmGuess}
            disabled={!selectedRoomId}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold font-serif shadow-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all ${
              selectedRoomId
                ? themeClasses.buttonPrimary
                : isLight
                ? 'bg-stone-200/95 text-stone-500 cursor-not-allowed border border-stone-300'
                : 'bg-stone-900/95 text-stone-500 cursor-not-allowed border border-stone-700'
            }`}
          >
            <Eye className="w-5 h-5 shrink-0" />
            <span className="truncate">
              {selectedRoomId ? `${t.confirmGuess}: ${pickedRoomName}` : t.confirmGuess}
            </span>
          </button>
        </div>
      </div>

      {/* Misclick Protection Confirmation Modal */}
      {showConfirmModal && pickedRoom && (
        <div role="dialog" aria-modal="true" aria-label={t.confirmHuntTitle} className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className={`max-w-md w-full ${themeClasses.bgPanel} p-6 shadow-2xl text-center space-y-4`}>
            <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto ${
              isLight ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-amber-950 border-amber-700 text-amber-400'
            }`}>
              <Eye className="w-7 h-7" />
            </div>
            <h3 className={`text-xl font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
              {t.confirmHuntTitle}
            </h3>
            <div className={`border rounded-2xl p-3.5 ${isLight ? 'bg-amber-50 border-amber-300' : 'bg-stone-950/80 border-amber-800/60'}`}>
              <div className={`text-lg font-serif font-bold uppercase ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                {pickedRoomName}
              </div>
              {pickedArtifact && (
                <div className={`inline-flex items-center gap-1.5 text-xs mt-1 ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                  <ArtifactIcon artifactId={pickedArtifact.id} className="w-3.5 h-3.5" />
                  <span>{pickedArtifactName}</span>
                </div>
              )}
            </div>
            <p className={`text-xs sm:text-sm font-sans ${isLight ? 'text-stone-600' : 'text-stone-300'}`}>
              {t.confirmHuntText}
            </p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowConfirmModal(false);
                }}
                className={`flex-1 py-3 font-serif font-bold rounded-xl transition-colors border text-sm ${
                  isLight ? 'bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300' : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                }`}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmGuess}
                className={`flex-1 py-3 font-serif font-bold rounded-xl transition-colors shadow-md text-sm ${themeClasses.buttonPrimary}`}
              >
                {t.confirmHuntProceed}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Reveal Modal */}
      {showResultModal && targetRoom && (
        <div role="dialog" aria-modal="true" aria-label={t.checkHideoutBadge} className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className={`max-w-md w-full ${themeClasses.bgPanel} p-6 sm:p-8 shadow-2xl text-center relative`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${
              lastResultCorrect
                ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                : 'bg-red-950 border-red-500 text-red-400'
            }`}>
              {lastResultCorrect ? <ShieldCheck className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
            </div>

            <span className={`inline-block text-xs font-serif uppercase tracking-widest mb-2 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
              {t.checkHideoutBadge}
            </span>

            <h3 className={`text-2xl font-serif font-bold mb-2 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
              {lastResultCorrect ? t.correctGuess : t.wrongGuess}
            </h3>

            <div className={`border rounded-2xl p-4 my-4 space-y-2 ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-950/80 border-stone-800'}`}>
              <div>
                <span className={`text-xs font-serif block mb-0.5 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{t.secretWas}</span>
                <span className={`text-xl font-serif font-bold ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                  {targetRoomName}
                </span>
              </div>
              {!lastResultCorrect && pickedRoomName && (
                <div className={`pt-2 border-t text-xs font-serif ${isLight ? 'border-stone-200 text-stone-600' : 'border-stone-800 text-stone-400'}`}>
                  <span>{t.hunterPicked} </span>
                  <span className={isLight ? 'text-red-700 font-bold' : 'text-red-400 font-bold'}>{pickedRoomName}</span>
                </div>
              )}
              {state.mode === 'duo' && state.duoSpiritClue && (
                <div className={`pt-2 border-t text-xs font-sans ${isLight ? 'border-stone-200 text-stone-600' : 'border-stone-800 text-stone-400'}`}>
                  <span className="block mb-1">{t.duoSpiritCardLabel}:</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-lg border font-serif font-bold ${
                    isLight ? 'bg-purple-100 border-purple-300 text-purple-900' : 'bg-purple-950/70 border-purple-700 text-purple-200'
                  }`}>
                    «{getClueTranslation(state.duoSpiritClue, lang)}»
                  </span>
                </div>
              )}
            </div>

            <p className={`text-xs sm:text-sm mb-6 ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
              {lastResultCorrect ? t.sealedResult : t.lostResult}
            </p>

            <button
              type="button"
              onClick={handleFinishResolution}
              className={`w-full py-3.5 rounded-2xl font-serif font-bold text-white shadow-lg transition-all ${
                lastResultCorrect
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400'
                  : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
              }`}
            >
              {t.continue}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
