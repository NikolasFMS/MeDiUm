import React from 'react';
import { GameState } from '../types/game';
import { ArrowRight, Layers, History, Shuffle, Flame, CloudFog } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { Language, translations } from '../utils/i18n';
import { useTheme } from '../utils/themeContext';

interface RespitePhaseProps {
  state: GameState;
  onCompleteRespite: () => void;
  onOpenHistory: () => void;
  lang: Language;
}

export const RespitePhase: React.FC<RespitePhaseProps> = ({ state, onCompleteRespite, onOpenHistory, lang }) => {
  const t = translations[lang];
  const { themeClasses, themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const targetSealed = state.targetSealedCount || 5;
  const maxLost = state.mode === 'duo' ? 11 - targetSealed : 5;

  return (
    <div className="max-w-xl mx-auto p-4 flex items-center justify-center min-h-[75vh]">
      <div className={`${themeClasses.bgPanel} p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden animate-fadeIn w-full`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border shadow-inner ${isLight ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-amber-950 border-amber-700/60 text-amber-400'}`}>
          <Layers className="w-8 h-8" />
        </div>

        <span className={`inline-block px-3 py-1 border rounded-full text-xs font-serif uppercase tracking-widest mb-2 ${isLight ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-amber-950 border-amber-800 text-amber-300'}`}>
          {t.respitePhase}
        </span>

        <h2 className={`text-2xl font-serif font-bold mb-2 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
          {t.endRound} {state.currentRound}
        </h2>

        <p className={`text-xs sm:text-sm font-sans mb-6 leading-relaxed ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
          {state.mode === 'duo' ? t.respiteDescDuo : t.respiteDesc}
        </p>

        <div className={`border rounded-2xl p-4 mb-6 space-y-2 text-left ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-950/80 border-stone-800'}`}>
          <div className="flex justify-between items-center text-xs font-serif">
            <span className={isLight ? 'text-stone-600' : 'text-stone-400'}>{t.sealed}:</span>
            <span className="text-emerald-500 font-bold">{state.sealedCount} / {targetSealed}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-serif">
            <span className={isLight ? 'text-stone-600' : 'text-stone-400'}>{t.lost}:</span>
            <span className="text-red-500 font-bold">{state.lostCount} / {maxLost}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-serif">
            <span className={isLight ? 'text-stone-600' : 'text-stone-400'}>{t.clueDeckLabel}:</span>
            <span className={`font-bold ${isLight ? 'text-stone-800' : 'text-stone-200'}`}>
              {state.deckClues.length} ({t.discardPileLabel}: {(state.discardClues?.length ?? 0) + state.revealedClues.length})
            </span>
          </div>
          <div className="flex justify-between items-center text-xs font-serif">
            <span className={isLight ? 'text-stone-600' : 'text-stone-400'}>{t.round}:</span>
            <span className={`font-bold ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>{state.currentRound + 1}</span>
          </div>
          {state.deckClues.length < 3 && ((state.discardClues?.length ?? 0) + state.revealedClues.length) > 0 && (
            <p className={`text-[11px] pt-1 border-t font-sans ${isLight ? 'border-stone-200 text-amber-700' : 'border-stone-800 text-amber-400'}`}>
              {t.deckReshuffleNotice}
            </p>
          )}
        </div>

        {state.roundEventBanner && (
          <div
            className={`border rounded-2xl p-3 mb-5 flex items-center gap-2.5 text-left text-xs font-serif ${
              state.roundEventBanner.type === 'fog_cleared'
                ? isLight
                  ? 'bg-sky-50 border-sky-300 text-sky-900'
                  : 'bg-sky-950/40 border-sky-700/60 text-sky-200'
                : state.roundEventBanner.type === 'fever'
                ? isLight
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-red-950/40 border-red-700/60 text-red-200'
                : isLight
                ? 'bg-purple-50 border-purple-300 text-purple-950'
                : 'bg-purple-950/40 border-purple-700/60 text-purple-200'
            }`}
          >
            {state.roundEventBanner.type === 'poltergeist' ? (
              <Shuffle className="w-4 h-4 shrink-0" />
            ) : state.roundEventBanner.type === 'fever' ? (
              <Flame className="w-4 h-4 shrink-0" />
            ) : (
              <CloudFog className="w-4 h-4 shrink-0" />
            )}
            <span>
              {state.roundEventBanner.type === 'poltergeist' && (
                <>
                  {t.poltergeistAlert}{' '}
                  <strong>
                    {(lang === 'ru'
                      ? state.roundEventBanner.roomNamesRu
                      : state.roundEventBanner.roomNamesEn)?.join(' ↔ ')}
                  </strong>
                </>
              )}
              {state.roundEventBanner.type === 'fever' && t.feverAlert}
              {state.roundEventBanner.type === 'fog_cleared' && t.fogClearedAlert}
            </span>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onCompleteRespite();
            }}
            className={`w-full py-4 flex items-center justify-center gap-3 text-lg font-serif transition-all transform active:scale-95 ${themeClasses.buttonPrimary}`}
          >
            <span>{t.nextRound} {state.currentRound + 1}</span>
            <ArrowRight className="w-5 h-5" />
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
