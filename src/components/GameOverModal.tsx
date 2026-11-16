import React, { useEffect } from 'react';
import { GameState } from '../types/game';
import { Skull, Trophy, RotateCcw, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { Language, translations } from '../utils/i18n';
import { useTheme } from '../utils/themeContext';
import { useModalEffects } from '../hooks/useModalEffects';

interface GameOverModalProps {
  state: GameState;
  onRestart: () => void;
  onOpenHistory: () => void;
  lang: Language;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ state, onRestart, onOpenHistory, lang }) => {
  const isVictory = state.winner === 'hunters';
  const isDuo = state.mode === 'duo';
  const t = translations[lang];
  const { themeClasses, themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const targetSealed = state.targetSealedCount || 5;
  const maxLost = isDuo ? 11 - targetSealed : 5;

  useModalEffects(true);

  useEffect(() => {
    if (isVictory) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isVictory]);

  const badgeText = isVictory ? (isDuo ? t.victoryDuo : t.victoryHunters) : isDuo ? t.defeatDuo : t.victoryGhost;
  const titleText = isVictory ? (isDuo ? t.duoWonTitle : t.ghostBanished) : isDuo ? t.duoLostTitle : t.huntersLost;
  const descText = isVictory ? (isDuo ? t.duoVictoryDesc : t.victoryDesc) : isDuo ? t.duoDefeatDesc : t.defeatDesc;

  return (
    <div role="dialog" aria-modal="true" aria-label={badgeText} className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className={`max-w-md w-full ${themeClasses.bgPanel} p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-2 shadow-inner ${
          isVictory
            ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
            : 'bg-red-950 border-red-500 text-red-400'
        }`}>
          {isVictory ? <Trophy className="w-10 h-10 animate-bounce" /> : <Skull className="w-10 h-10" />}
        </div>

        <span className={`inline-block px-3 py-1 border rounded-full text-xs font-serif uppercase tracking-widest mb-2 ${isLight ? 'bg-stone-100 border-stone-300 text-stone-700' : 'bg-stone-950 border-stone-800 text-stone-300'}`}>
          {badgeText}
        </span>

        <h2 className={`text-2xl sm:text-3xl font-serif font-bold mb-3 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
          {titleText}
        </h2>

        <p className={`text-xs sm:text-sm font-sans mb-6 leading-relaxed ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
          {descText}
        </p>

        <div className={`border rounded-2xl p-4 mb-6 space-y-2 text-left ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-950/80 border-stone-800'}`}>
          <div className="flex justify-between items-center text-xs font-serif">
            <span className={isLight ? 'text-stone-600' : 'text-stone-400'}>{t.roundsPlayed}</span>
            <span className={`font-bold ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>{state.currentRound}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-serif">
            <span className={isLight ? 'text-stone-600' : 'text-stone-400'}>{t.sealed}:</span>
            <span className="text-emerald-500 font-bold">{state.sealedCount} / {targetSealed}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-serif">
            <span className={isLight ? 'text-stone-600' : 'text-stone-400'}>{t.lost}:</span>
            <span className="text-red-500 font-bold">{state.lostCount} / {maxLost}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className={`w-full py-4 flex items-center justify-center gap-3 text-lg font-serif transition-all transform active:scale-95 ${themeClasses.buttonPrimary}`}
          >
            <RotateCcw className="w-5 h-5" />
            <span>{t.newGame}</span>
          </button>

          {(state.roundHistory?.length ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenHistory();
              }}
              className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-serif font-bold transition-colors ${
                isLight
                  ? 'bg-white hover:bg-amber-50 border-stone-300 text-stone-800'
                  : 'bg-stone-900/80 hover:bg-stone-800 border-stone-700 text-amber-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{t.roundHistoryTitle} ({state.roundHistory.length})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
