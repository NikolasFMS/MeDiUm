import React from 'react';
import { GameState } from '../types/game';
import { MANSION_ARTIFACTS, getRoomSide } from '../data/mansionData';
import { ROOM_TRANSLATIONS, ARTIFACT_TRANSLATIONS, Language, translations } from '../utils/i18n';
import { ShieldCheck, Skull, Eye, History, CloudFog, Flame, Zap, Wand2, Shuffle } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { useTheme } from '../utils/themeContext';
import { ArtifactIcon } from './ArtifactIcon';

interface GameBoardProps {
  state: GameState;
  onAdvancePhase: () => void;
  onOpenRules: () => void;
  onOpenHistory: () => void;
  lang: Language;
}

export const GameBoard: React.FC<GameBoardProps> = ({ state, onAdvancePhase, onOpenHistory, lang }) => {
  const activeRooms = state.rooms.slice(0, 10);
  const t = translations[lang];
  const { themeClasses, themeMode, uiStyle } = useTheme();
  const isLight = themeMode === 'light';

  const targetSealed = state.targetSealedCount || 5;
  const maxLost = state.mode === 'duo' ? 11 - targetSealed : 5;
  const hasHistory = (state.roundHistory?.length ?? 0) > 0;
  const isMixed = Boolean(state.modifiers?.mixedDifficulty);
  const activeWingIds = state.activeWingIds ?? [];
  const enableWingCurses = Boolean(state.modifiers?.enableWingCurses);

  const getActiveCardClass = () => {
    if (uiStyle === 'classic') {
      return isLight
        ? 'border-amber-800/35 bg-[#fdf9f0] text-stone-900'
        : 'border-amber-900/50 bg-[#161310] text-stone-100';
    }
    return isLight
      ? 'border-stone-300 bg-white text-stone-900'
      : 'border-stone-700/80 bg-stone-950/85 text-stone-100';
  };

  const cardRadius = uiStyle === 'atmospheric' ? 'rounded-xl' : 'rounded-lg';

  const activeBadges: { key: string; label: string; tone: 'amber' | 'purple' | 'red' }[] = [];
  if (enableWingCurses) {
    if (activeWingIds.includes('pack-occult')) {
      activeBadges.push({ key: 'occult', label: t.wingCurseOccultTitle, tone: 'purple' });
    }
    if (activeWingIds.includes('pack-forgotten')) {
      activeBadges.push({ key: 'forgotten', label: t.wingCurseForgottenTitle, tone: 'amber' });
    }
    if (activeWingIds.includes('pack-medical')) {
      activeBadges.push({
        key: 'medical',
        label: state.medicalFeverPending ? t.feverBadge : t.wingCurseMedicalTitle,
        tone: state.medicalFeverPending ? 'red' : 'amber',
      });
    }
    if (activeWingIds.includes('pack-grounds') && state.foggedRoomId) {
      activeBadges.push({ key: 'grounds', label: t.wingCurseGroundsTitle, tone: 'purple' });
    }
  }
  if (state.modifiers?.mediumInsightEnabled && !state.mediumInsightUsed) {
    activeBadges.push({ key: 'insight', label: t.activateInsight, tone: 'amber' });
  }
  if (state.mode === 'standard' && state.modifiers?.ghostIllusionEnabled && !state.ghostIllusionUsed) {
    activeBadges.push({ key: 'illusion', label: t.ghostIllusionLabel.split(' (')[0], tone: 'purple' });
  }
  if (state.modifiers?.blitzTimer) {
    activeBadges.push({ key: 'blitz', label: t.blitzBadge, tone: 'red' });
  }

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-2.5 sm:space-y-3 pb-20 animate-fadeIn">
      {/* Top Status Bar with progress tracks */}
      <div className={`${themeClasses.bgPanel} px-3 py-2.5 sm:p-4 shadow-lg space-y-2`}>
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-serif">
            <span className={`uppercase tracking-widest ${themeClasses.accentText}`}>
              {t.round} <span className="tabular-nums">{state.currentRound}</span>
            </span>
            <span aria-hidden="true" className={isLight ? 'text-stone-400' : 'text-stone-600'}>·</span>
            <span className={isLight ? 'text-stone-700 font-medium' : 'text-stone-300 font-medium'}>
              {isMixed ? t.mixedDifficultyShort : state.difficulty === 'silver' ? t.silver : t.gold}
            </span>
          </div>

          {/* Visual Progress Trackers */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sealed Track */}
            <div className="flex items-center gap-1.5" title={t.sealed}>
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="flex items-center gap-1">
                {Array.from({ length: targetSealed }).map((_, idx) => {
                  const filled = idx < state.sealedCount;
                  return (
                    <span
                      key={idx}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border transition-colors ${
                        filled
                          ? 'bg-emerald-500 border-emerald-400 shadow-sm'
                          : isLight
                          ? 'bg-stone-200 border-stone-300'
                          : 'bg-stone-900 border-stone-700'
                      }`}
                    />
                  );
                })}
              </div>
              <span className={`text-xs font-mono font-bold tabular-nums ml-0.5 ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                {state.sealedCount}/{targetSealed}
              </span>
            </div>

            {/* Lost Track */}
            <div className="flex items-center gap-1.5" title={t.lost}>
              <Skull className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex items-center gap-1">
                {Array.from({ length: maxLost }).map((_, idx) => {
                  const filled = idx < state.lostCount;
                  return (
                    <span
                      key={idx}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border transition-colors ${
                        filled
                          ? 'bg-red-500 border-red-400 shadow-sm'
                          : isLight
                          ? 'bg-stone-200 border-stone-300'
                          : 'bg-stone-900 border-stone-700'
                      }`}
                    />
                  );
                })}
              </div>
              <span className={`text-xs font-mono font-bold tabular-nums ml-0.5 ${isLight ? 'text-red-800' : 'text-red-300'}`}>
                {state.lostCount}/{maxLost}
              </span>
            </div>
          </div>
        </div>

        {/* Active Modifiers & Wing Curses Strip */}
        {activeBadges.length > 0 && (
          <div className={`pt-2 border-t flex flex-wrap items-center gap-1.5 ${isLight ? 'border-stone-200' : 'border-stone-800/80'}`}>
            {activeBadges.map((b) => (
              <span
                key={b.key}
                className={`inline-flex items-center gap-1 text-[10px] font-serif font-semibold px-2 py-0.5 rounded-md border ${
                  b.tone === 'red'
                    ? isLight
                      ? 'bg-red-100 border-red-300 text-red-900'
                      : 'bg-red-950/60 border-red-700/70 text-red-200'
                    : b.tone === 'purple'
                    ? isLight
                      ? 'bg-purple-100 border-purple-300 text-purple-900'
                      : 'bg-purple-950/60 border-purple-700/70 text-purple-200'
                    : isLight
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-amber-950/50 border-amber-800/60 text-amber-200'
                }`}
              >
                {b.key === 'blitz' ? (
                  <Zap className="w-2.5 h-2.5" />
                ) : b.key === 'illusion' ? (
                  <Wand2 className="w-2.5 h-2.5" />
                ) : b.key === 'grounds' ? (
                  <CloudFog className="w-2.5 h-2.5" />
                ) : (
                  <Flame className="w-2.5 h-2.5" />
                )}
                <span>{b.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Round Event Banner (Poltergeist / Fever / Fog Cleared) */}
      {state.roundEventBanner && (
        <div
          className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-serif shadow-md animate-fadeIn ${
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
          <div>
            {state.roundEventBanner.type === 'poltergeist' && (
              <span>
                {t.poltergeistAlert}{' '}
                <strong>
                  {(lang === 'ru'
                    ? state.roundEventBanner.roomNamesRu
                    : state.roundEventBanner.roomNamesEn)?.join(' ↔ ')}
                </strong>
              </span>
            )}
            {state.roundEventBanner.type === 'fever' && <span>{t.feverAlert}</span>}
            {state.roundEventBanner.type === 'fog_cleared' && <span>{t.fogClearedAlert}</span>}
          </div>
        </div>
      )}

      {/* 10 Rooms Grid — Compact Unified Cards */}
      <div className={`${themeClasses.bgPanel} p-2 sm:p-4 shadow-xl`}>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {activeRooms.map((room, index) => {
            const side = getRoomSide(room, state.difficulty);
            const artifact = MANSION_ARTIFACTS.find((a) => a.id === room.artifactId);
            const roomData = ROOM_TRANSLATIONS[room.id];
            const roomName = roomData
              ? roomData[lang][side]
              : side === 'silver'
              ? room.nameSilver
              : room.nameGold;
            const artifactName = ARTIFACT_TRANSLATIONS[room.artifactId]?.[lang] || artifact?.name;
            const isSealed = room.status === 'sealed';
            const isLost = room.status === 'lost';
            const isFogged = room.status === 'active' && state.foggedRoomId === room.id;

            const statusSurfaceClass = isSealed
              ? isLight
                ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950'
                : 'border-emerald-600/80 bg-emerald-950/35 text-emerald-50'
              : isLost
              ? isLight
                ? 'border-red-500/70 bg-red-50/80 text-red-950 opacity-70'
                : 'border-red-800/70 bg-red-950/30 text-stone-300 opacity-65'
              : getActiveCardClass();

            const dividerClass = isSealed
              ? isLight
                ? 'border-emerald-200'
                : 'border-emerald-800/60'
              : isLost
              ? isLight
                ? 'border-red-200'
                : 'border-red-900/50'
              : isLight
              ? 'border-stone-200'
              : 'border-stone-800/90';

            return (
              <div
                key={room.id}
                className={`min-w-0 overflow-hidden p-2 sm:p-2.5 border transition-colors flex flex-col justify-between gap-1.5 shadow-sm ${cardRadius} ${statusSurfaceClass}`}
              >
                <div className="flex items-start justify-between gap-1.5 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-[12px] sm:text-[13px] font-serif font-bold uppercase leading-[1.2] tracking-tight break-words [overflow-wrap:anywhere] ${
                        isLost ? 'line-through decoration-red-500/70' : ''
                      }`}
                    >
                      {roomName}
                    </h4>
                    {isMixed && !isLost && !isSealed && (
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
                  {isSealed ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-label={t.sealed} />
                  ) : isLost ? (
                    <Skull className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-label={t.lost} />
                  ) : (
                    <span className="text-[10px] font-mono tabular-nums opacity-45 shrink-0 leading-none pt-0.5">
                      {index + 1}
                    </span>
                  )}
                </div>

                <div className={`pt-1.5 border-t flex items-center justify-between gap-1 ${dividerClass}`}>
                  {isFogged ? (
                    <div className={`flex items-center gap-1.5 min-w-0 ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>
                      <CloudFog className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-sans font-medium italic truncate">
                        {t.fogHiddenArtifact}
                      </span>
                    </div>
                  ) : artifact ? (
                    <div
                      className={`flex items-center gap-1.5 min-w-0 ${
                        isLost ? 'line-through opacity-75' : ''
                      }`}
                    >
                      <ArtifactIcon
                        artifactId={artifact.id}
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSealed
                            ? isLight
                              ? 'text-emerald-700'
                              : 'text-emerald-400'
                            : isLost
                            ? isLight
                              ? 'text-red-700'
                              : 'text-red-400'
                            : isLight
                            ? 'text-amber-700'
                            : 'text-amber-400/90'
                        }`}
                      />
                      <span
                        className={`text-xs font-sans font-medium leading-tight ${
                          isSealed
                            ? isLight
                              ? 'text-emerald-900'
                              : 'text-emerald-200'
                            : isLost
                            ? isLight
                              ? 'text-red-900'
                              : 'text-stone-400'
                            : isLight
                            ? 'text-stone-700'
                            : 'text-stone-300'
                        }`}
                      >
                        {artifactName}
                      </span>
                    </div>
                  ) : (
                    <span />
                  )}

                  {isSealed && (
                    <span className={`text-[9px] font-serif font-bold uppercase shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      {t.sealed}
                    </span>
                  )}
                  {isLost && (
                    <span className={`text-[9px] font-serif font-bold uppercase shrink-0 ${isLight ? 'text-red-700' : 'text-red-400'}`}>
                      {t.lost}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-0.5">
        {hasHistory && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenHistory();
            }}
            className={`w-full sm:w-auto px-5 py-3.5 rounded-2xl border flex items-center justify-center gap-2 text-sm font-serif font-bold transition-colors ${
              isLight
                ? 'bg-white hover:bg-amber-50 border-stone-300 text-stone-800'
                : 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-amber-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t.roundHistoryTitle} ({state.roundHistory.length})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onAdvancePhase();
          }}
          className={`w-full sm:w-auto sm:px-8 py-3.5 flex items-center justify-center gap-2.5 text-base font-serif transition-all transform active:scale-95 ${themeClasses.buttonPrimary}`}
        >
          <Eye className="w-5 h-5" />
          <span>{t.startVision} ({t.round} {state.currentRound})</span>
        </button>
      </div>
    </div>
  );
};
