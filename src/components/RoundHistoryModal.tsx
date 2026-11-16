import React from 'react';
import { X, History, ShieldCheck, Skull, Sparkles } from 'lucide-react';
import { GameState } from '../types/game';
import { MANSION_ARTIFACTS, getRoomSide } from '../data/mansionData';
import { Language, translations, ROOM_TRANSLATIONS, ARTIFACT_TRANSLATIONS, getClueTranslation } from '../utils/i18n';
import { useTheme } from '../utils/themeContext';
import { soundManager } from '../utils/audio';
import { useModalEffects } from '../hooks/useModalEffects';
import { ArtifactIcon } from './ArtifactIcon';

interface RoundHistoryModalProps {
  state: GameState;
  onClose: () => void;
  lang: Language;
}

export const RoundHistoryModal: React.FC<RoundHistoryModalProps> = ({ state, onClose, lang }) => {
  const t = translations[lang];
  const { themeClasses, themeMode } = useTheme();
  const isLight = themeMode === 'light';

  useModalEffects(true, onClose);

  const getRoomDisplay = (roomId: string) => {
    const room = state.rooms.find((r) => r.id === roomId);
    const side = room ? getRoomSide(room, state.difficulty) : state.difficulty;
    const roomTrans = ROOM_TRANSLATIONS[roomId]?.[lang]?.[side];
    const name = roomTrans || (room ? (side === 'silver' ? room.nameSilver : room.nameGold) : roomId);
    const artifact = room ? MANSION_ARTIFACTS.find((a) => a.id === room.artifactId) : null;
    const artifactName = room ? (ARTIFACT_TRANSLATIONS[room.artifactId]?.[lang] || artifact?.name) : '';
    return { name, artifact, artifactName };
  };

  const entries = [...(state.roundHistory ?? [])].reverse();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.roundHistoryTitle}
      className="fixed inset-0 z-[55] bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
    >
      <div className={`max-w-xl w-full ${themeClasses.bgPanel} shadow-2xl flex flex-col max-h-[88vh] overflow-hidden relative`}>
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${isLight ? 'bg-amber-100/60 border-amber-300' : 'bg-stone-950/60 border-amber-900/40'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isLight ? 'bg-amber-200 border-amber-400 text-amber-800' : 'bg-amber-950 border-amber-700/50 text-amber-400'}`}>
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                {t.roundHistoryTitle}
              </h2>
              <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                {t.roundsPlayed} {state.roundHistory?.length ?? 0}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label={t.close}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border ${isLight ? 'bg-stone-200 hover:bg-stone-300 text-stone-700 border-stone-300' : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {entries.length === 0 ? (
            <p className={`text-sm font-sans text-center py-8 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
              {t.roundHistoryEmpty}
            </p>
          ) : (
            entries.map((entry) => {
              const target = getRoomDisplay(entry.targetRoomId);
              const guessed = getRoomDisplay(entry.guessedRoomId);
              const extraIds = new Set(
                entry.extraClues && entry.extraClues.length > 0
                  ? entry.extraClues.map((c) => c.id)
                  : entry.extraClue
                  ? [entry.extraClue.id]
                  : []
              );

              return (
                <div
                  key={entry.round}
                  className={`p-3.5 rounded-2xl border space-y-2.5 ${
                    entry.isCorrect
                      ? isLight
                        ? 'bg-emerald-50/80 border-emerald-300'
                        : 'bg-emerald-950/25 border-emerald-800/60'
                      : isLight
                      ? 'bg-red-50/80 border-red-300'
                      : 'bg-red-950/25 border-red-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-serif font-bold uppercase tracking-wider ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                      {t.round} {entry.round}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-serif font-bold px-2 py-0.5 rounded-md border ${
                        entry.isCorrect
                          ? isLight
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                            : 'bg-emerald-950 border-emerald-600 text-emerald-300'
                          : isLight
                          ? 'bg-red-100 border-red-400 text-red-900'
                          : 'bg-red-950 border-red-700 text-red-300'
                      }`}
                    >
                      {entry.isCorrect ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{t.sealed}</span>
                        </>
                      ) : (
                        <>
                          <Skull className="w-3.5 h-3.5" />
                          <span>{t.lost}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Clues on table */}
                  <div>
                    <div className={`text-[11px] font-serif mb-1.5 flex items-center gap-1 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      <Sparkles className="w-3 h-3" />
                      <span>{t.cluesShownLabel}:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.revealedClues.map((clue) => {
                        const isExtra = extraIds.has(clue.id);
                        return (
                          <span
                            key={clue.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-serif font-bold ${
                              isExtra
                                ? isLight
                                  ? 'bg-purple-100 border-purple-400 text-purple-950'
                                  : 'bg-purple-950/70 border-purple-600/70 text-purple-200'
                                : isLight
                                ? 'bg-amber-100 border-amber-400 text-amber-950'
                                : 'bg-amber-950/60 border-amber-700/60 text-amber-200'
                            }`}
                          >
                            <span>{getClueTranslation(clue, lang)}</span>
                            <span className="text-[9px] uppercase opacity-75 font-sans">
                              ({isExtra ? (state.mode === 'duo' ? t.spiritCardTag : t.ghostCardTag) : t.mediumCardsTag})
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hideout vs Guess */}
                  <div className={`pt-2 border-t text-xs font-sans space-y-1 ${isLight ? 'border-stone-200/80 text-stone-700' : 'border-stone-800/80 text-stone-300'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="opacity-75">{t.secretWas}</span>
                      <span className={`font-serif font-bold inline-flex items-center gap-1.5 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                        {target.artifact && <ArtifactIcon artifactId={target.artifact.id} className="w-3.5 h-3.5 opacity-80" />}
                        <span>{target.name}</span>
                      </span>
                    </div>
                    {!entry.isCorrect && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="opacity-75">{t.hunterPicked}</span>
                        <span className={`font-serif font-bold inline-flex items-center gap-1.5 ${isLight ? 'text-red-800' : 'text-red-300'}`}>
                          {guessed.artifact && <ArtifactIcon artifactId={guessed.artifact.id} className="w-3.5 h-3.5 opacity-80" />}
                          <span>{guessed.name}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={`p-3.5 sm:p-4 border-t flex justify-end ${isLight ? 'bg-amber-100/60 border-amber-300' : 'bg-stone-950/60 border-amber-900/40'}`}>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className={`px-6 py-2.5 font-serif font-bold rounded-xl shadow-md transition-all ${themeClasses.buttonPrimary}`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
