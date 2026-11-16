import React, { useState } from 'react';
import { GameState, ClueCard, HideoutCard, VisionStep } from '../types/game';
import { MANSION_ARTIFACTS, getRoomSide, shuffleArray } from '../data/mansionData';
import { PrivacyScreen } from './PrivacyScreen';
import {
  Eye,
  EyeOff,
  Ghost,
  Shuffle,
  ArrowRight,
  Map,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Skull,
  Sparkles,
  RefreshCw,
  Wand2,
  CloudFog,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { haptics } from '../utils/haptics';
import { Language, translations, ROOM_TRANSLATIONS, ARTIFACT_TRANSLATIONS, getClueTranslation } from '../utils/i18n';
import { useTheme } from '../utils/themeContext';
import { ArtifactIcon } from './ArtifactIcon';

interface VisionPhaseProps {
  state: GameState;
  onCompleteVision: (
    chosenClues: ClueCard[],
    revealedClues: ClueCard[],
    hideout: HideoutCard,
    extraClues: ClueCard[],
    usedIllusion?: boolean
  ) => void;
  onUpdateProgress: (updates: {
    visionStep?: VisionStep;
    chosenClues?: ClueCard[];
    ghostChosenClue?: ClueCard | null;
    ghostChosenClues?: ClueCard[];
    ghostIllusionActive?: boolean;
  }) => void;
  onReplenishHands?: () => void;
  onMediumInsight?: () => void;
  onOccultTrance?: (discardIds: string[]) => void;
  lang: Language;
}

export const VisionPhase: React.FC<VisionPhaseProps> = ({
  state,
  onCompleteVision,
  onUpdateProgress,
  onReplenishHands,
  onMediumInsight,
  onOccultTrance,
  lang,
}) => {
  const [warning, setWarning] = useState<string | null>(null);
  const [showMansionPlan, setShowMansionPlan] = useState(false);

  const step: VisionStep = state.visionStep ?? 'medium_privacy';
  const selectedClues = state.chosenClues;
  const ghostIllusionActive = Boolean(state.ghostIllusionActive);
  const ghostChosenList: ClueCard[] =
    state.ghostChosenClues && state.ghostChosenClues.length > 0
      ? state.ghostChosenClues
      : state.ghostChosenClue
      ? [state.ghostChosenClue]
      : [];

  const t = translations[lang];
  const { themeClasses, themeMode, uiStyle } = useTheme();
  const isLight = themeMode === 'light';

  const activeRoomsList = state.rooms.filter((r) => r.status === 'active');
  const activeRoomIds = new Set(activeRoomsList.map((r) => r.id));
  const currentHideout =
    state.currentHideout || state.hideoutCards.find((h) => activeRoomIds.has(h.roomId)) || state.hideoutCards[0];
  const targetRoom = state.rooms.find((r) => r.id === currentHideout?.roomId);
  const targetArtifact = targetRoom ? MANSION_ARTIFACTS.find((a) => a.id === targetRoom.artifactId) : null;
  const targetSide = targetRoom ? getRoomSide(targetRoom, state.difficulty) : state.difficulty;

  const roomData = targetRoom ? ROOM_TRANSLATIONS[targetRoom.id] : null;
  const roomName = roomData
    ? roomData[lang][targetSide]
    : targetRoom
    ? targetSide === 'silver'
      ? targetRoom.nameSilver
      : targetRoom.nameGold
    : '';
  const artifactName = targetRoom
    ? ARTIFACT_TRANSLATIONS[targetRoom.artifactId]?.[lang] || targetArtifact?.name
    : '';

  const canUseInsight = Boolean(
    state.modifiers?.mediumInsightEnabled && !state.mediumInsightUsed && onMediumInsight
  );
  const canUseTrance = Boolean(
    state.modifiers?.enableWingCurses &&
      state.activeWingIds?.includes('pack-occult') &&
      !state.occultTranceUsed &&
      onOccultTrance
  );
  const canUseIllusion = Boolean(
    state.mode === 'standard' &&
      state.modifiers?.ghostIllusionEnabled &&
      !state.ghostIllusionUsed &&
      state.ghostHand.length >= 2
  );

  const renderMansionPlanPanel = () => (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          setShowMansionPlan((prev) => !prev);
        }}
        className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-serif font-bold transition-colors ${
          isLight
            ? 'bg-stone-100 hover:bg-stone-200/80 border-stone-300 text-stone-800'
            : 'bg-stone-950/70 hover:bg-stone-900 border-stone-800 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <Map className={`w-4 h-4 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
          <span>
            {t.showMansionPlan} ({activeRoomsList.length} {t.activeRoomsCountLabel})
          </span>
        </div>
        {showMansionPlan ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showMansionPlan && (
        <div
          className={`mt-2 p-2 rounded-2xl border grid grid-cols-2 sm:grid-cols-5 gap-2 animate-fadeIn ${
            isLight ? 'bg-stone-100/80 border-stone-300' : 'bg-stone-950/80 border-stone-800'
          }`}
        >
          {state.rooms.slice(0, 10).map((room) => {
            const side = getRoomSide(room, state.difficulty);
            const rData = ROOM_TRANSLATIONS[room.id];
            const rName = rData ? rData[lang][side] : (side === 'silver' ? room.nameSilver : room.nameGold);
            const art = MANSION_ARTIFACTS.find((a) => a.id === room.artifactId);
            const artName = ARTIFACT_TRANSLATIONS[room.artifactId]?.[lang] || art?.name;
            const isTarget = room.id === targetRoom?.id;
            const isSealed = room.status === 'sealed';
            const isLost = room.status === 'lost';
            const isFogged = room.status === 'active' && state.foggedRoomId === room.id;

            const cardClass = isTarget
              ? isLight
                ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-500/50 text-stone-900'
                : 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/50 text-amber-50'
              : isSealed
              ? isLight
                ? 'bg-emerald-50 border-emerald-500/70 text-emerald-950 opacity-75'
                : 'bg-emerald-950/30 border-emerald-700/70 text-emerald-100 opacity-70'
              : isLost
              ? isLight
                ? 'bg-red-50 border-red-400/70 text-red-950 opacity-60'
                : 'bg-red-950/25 border-red-800/70 text-stone-400 opacity-55'
              : isLight
              ? 'bg-white border-stone-300 text-stone-900'
              : 'bg-stone-900/90 border-stone-700/80 text-stone-100';

            return (
              <div
                key={room.id}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all ${cardClass}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={`text-[11px] sm:text-xs font-serif font-bold leading-tight uppercase ${isLost ? 'line-through' : ''}`}>
                    {rName}
                  </span>
                  {isTarget && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-serif font-bold uppercase shrink-0">
                      {t.targetBadge}
                    </span>
                  )}
                  {!isTarget && isSealed && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  {!isTarget && isLost && <Skull className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                </div>
                {art && (
                  <div className={`pt-1 border-t flex items-center justify-between gap-1 ${isLight ? 'border-stone-200' : 'border-stone-800'}`}>
                    <div className="flex items-center gap-1 min-w-0">
                      <ArtifactIcon artifactId={art.id} className="w-3 h-3 shrink-0 opacity-80" />
                      <span className={`text-[11px] font-sans leading-tight truncate ${isLost ? 'line-through' : ''} ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                        {artName}
                      </span>
                    </div>
                    {isFogged && (
                      <span title={t.wingCurseGroundsTitle}>
                        <CloudFog className="w-3 h-3 text-sky-400 shrink-0" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const handleToggleClue = (card: ClueCard) => {
    soundManager.playClick(true);
    haptics.select();
    setWarning(null);
    const nextClues = selectedClues.some((c) => c.id === card.id)
      ? selectedClues.filter((c) => c.id !== card.id)
      : [...selectedClues, card];
    onUpdateProgress({ chosenClues: nextClues });
  };

  const handleToggleGhostCard = (card: ClueCard) => {
    soundManager.playClick(true);
    haptics.select();
    setWarning(null);
    if (!ghostIllusionActive) {
      onUpdateProgress({ ghostChosenClues: [card] });
      return;
    }
    const exists = ghostChosenList.some((c) => c.id === card.id);
    if (exists) {
      onUpdateProgress({
        ghostChosenClues: ghostChosenList.filter((c) => c.id !== card.id),
      });
    } else if (ghostChosenList.length < 2) {
      onUpdateProgress({
        ghostChosenClues: [...ghostChosenList, card],
      });
    } else {
      onUpdateProgress({
        ghostChosenClues: [ghostChosenList[1], card],
      });
    }
  };

  const handleToggleIllusion = () => {
    soundManager.playClick();
    haptics.select();
    const nextActive = !ghostIllusionActive;
    onUpdateProgress({
      ghostIllusionActive: nextActive,
      ghostChosenClues: nextActive ? ghostChosenList.slice(0, 2) : ghostChosenList.slice(0, 1),
    });
  };

  const handleFinishMedium = () => {
    if (selectedClues.length === 0) {
      setWarning(t.mediumSelectWarning);
      return;
    }
    soundManager.playClick();
    setWarning(null);
    if (state.mode === 'duo') {
      const discardFallback =
        state.discardClues && state.discardClues.length > 0
          ? shuffleArray(state.discardClues)[0]
          : undefined;
      const randomCard = state.deckClues[0] ?? discardFallback ?? null;
      const extraClues = randomCard ? [randomCard] : [];
      const allChosen = [...selectedClues, ...extraClues];
      const shuffled = shuffleArray(allChosen);
      onCompleteVision(selectedClues, shuffled, currentHideout, extraClues, false);
    } else {
      onUpdateProgress({ visionStep: 'ghost_privacy' });
    }
  };

  const requiredGhostCount = state.ghostHand.length === 0 ? 0 : ghostIllusionActive ? 2 : 1;
  const ghostReady =
    state.ghostHand.length === 0 || ghostChosenList.length === requiredGhostCount;

  const handleFinishGhost = () => {
    if (!ghostReady) {
      setWarning(t.ghostSelectWarning);
      return;
    }
    soundManager.playClick();
    setWarning(null);
    const allChosen = [...selectedClues, ...ghostChosenList];
    const shuffled = shuffleArray(allChosen);
    onCompleteVision(
      selectedClues,
      shuffled,
      currentHideout,
      ghostChosenList,
      ghostIllusionActive && ghostChosenList.length === 2
    );
  };

  if (step === 'medium_privacy') {
    return (
      <PrivacyScreen
        targetRoleName={t.mediumRole}
        description={t.mediumPrivacyDesc}
        lang={lang}
        onUnlocked={() => onUpdateProgress({ visionStep: 'medium_select' })}
      />
    );
  }

  if (step === 'ghost_privacy') {
    return (
      <PrivacyScreen
        targetRoleName={t.ghostRole}
        description={t.ghostPrivacyDesc}
        lang={lang}
        onUnlocked={() => onUpdateProgress({ visionStep: 'ghost_add' })}
      />
    );
  }

  const ghostActionRadius = uiStyle === 'atmospheric' ? 'rounded-2xl' : 'rounded-xl';

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-3 pb-28 animate-fadeIn">
      {/* Step 2: Medium Selection */}
      {step === 'medium_select' && (
        <>
          <div className={`${themeClasses.bgPanel} p-4 sm:p-6 shadow-2xl relative`}>
            <div className="flex items-center justify-between mb-3 border-b border-amber-900/40 pb-3">
              <div>
                <span className={`text-xs uppercase font-serif tracking-widest ${themeClasses.accentText}`}>{t.visionPhase} • 1</span>
                <h2 className={`text-lg sm:text-xl font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>{t.visionStep1}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateProgress({ visionStep: 'medium_privacy' });
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-serif flex items-center gap-1.5 transition-colors ${
                    isLight
                      ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                      : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
                  }`}
                  title={t.hideScreen}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{t.hideScreen}</span>
                </button>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isLight ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-amber-950 border-amber-700/50 text-amber-300'}`}>
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className={`border-2 rounded-2xl p-3.5 sm:p-4 mb-3 text-center shadow-inner relative overflow-hidden ${isLight ? 'bg-amber-50 border-amber-500/60' : 'bg-amber-950/40 border-amber-700/60'}`}>
              <div className="absolute top-2 right-2 opacity-20">
                <Eye className="w-9 h-9" />
              </div>
              <span className={`text-[11px] uppercase font-serif tracking-widest block mb-1 ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                {t.mediumSecretTitle}
              </span>
              <h3 className={`text-xl sm:text-2xl font-serif font-bold tracking-wider mb-1 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                {roomName}
              </h3>
              {targetArtifact && (
                <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border mb-1.5 ${isLight ? 'bg-white text-stone-800 border-amber-300' : 'bg-stone-950/70 text-amber-200 border-amber-800/60'}`}>
                  <ArtifactIcon artifactId={targetArtifact.id} className="w-3.5 h-3.5" />
                  <span className="font-serif">{artifactName}</span>
                  {targetRoom && state.foggedRoomId === targetRoom.id && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-sky-400 ml-1">
                      <CloudFog className="w-3 h-3" />
                    </span>
                  )}
                </div>
              )}
              <p className={`text-xs font-sans ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                {t.mediumPrompt}
              </p>
            </div>

            {renderMansionPlanPanel()}

            {/* Special Medium Powers (Insight / Occult Trance) */}
            {(canUseInsight || canUseTrance) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {canUseInsight && (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      haptics.select();
                      onMediumInsight?.();
                    }}
                    className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl border text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isLight
                        ? 'bg-amber-100 hover:bg-amber-200 border-amber-500 text-amber-950'
                        : 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/70 text-amber-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.activateInsight}</span>
                  </button>
                )}

                {canUseTrance && (
                  <button
                    type="button"
                    disabled={selectedClues.length === 0 || selectedClues.length > 3}
                    onClick={() => {
                      soundManager.playClick();
                      haptics.select();
                      onOccultTrance?.(selectedClues.map((c) => c.id));
                    }}
                    title={t.trancePromptHint}
                    className={`flex-1 min-w-[180px] py-2 px-3 rounded-xl border text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedClues.length >= 1 && selectedClues.length <= 3
                        ? isLight
                          ? 'bg-purple-100 hover:bg-purple-200 border-purple-500 text-purple-950 cursor-pointer'
                          : 'bg-purple-950/80 hover:bg-purple-900 border-purple-500/70 text-purple-200 cursor-pointer'
                        : isLight
                        ? 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed'
                        : 'bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {t.activateTrance} ({Math.min(3, selectedClues.length)}/3)
                    </span>
                  </button>
                )}
              </div>
            )}

            <div>
              <h4 className={`text-xs font-serif uppercase tracking-wider mb-2 ${themeClasses.accentText}`}>
                {t.mediumHand} ({state.mediumHand.length}):
              </h4>
              {state.mediumHand.length === 0 ? (
                <div className={`border rounded-2xl p-4 text-center space-y-3 ${isLight ? 'bg-amber-50 border-amber-300 text-stone-700' : 'bg-stone-950/70 border-amber-800/50 text-stone-300'}`}>
                  <p className="text-xs font-sans">{t.emptyHandNotice}</p>
                  {onReplenishHands && (
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onReplenishHands();
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-serif font-bold transition-all ${themeClasses.buttonPrimary}`}
                    >
                      {t.drawEmergencyCards}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {state.mediumHand.map((card) => {
                    const isSelected = selectedClues.some((c) => c.id === card.id);
                    return (
                      <button
                        key={card.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleToggleClue(card)}
                        className={`p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between items-center text-center shadow-md ${
                          isSelected
                            ? isLight
                              ? 'bg-amber-200 border-amber-600 text-amber-950 scale-[1.02] ring-2 ring-amber-500'
                              : 'bg-amber-900/80 border-amber-400 text-amber-100 scale-[1.02] ring-2 ring-amber-500/50'
                            : isLight
                            ? 'bg-white border-stone-300 text-stone-800 hover:border-amber-500'
                            : 'bg-stone-950/70 border-stone-800 text-stone-200 hover:border-amber-700/50'
                        }`}
                      >
                        <span className={`text-[10px] font-serif mb-0.5 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{t.clueLabel}</span>
                        <span className="text-sm sm:text-base font-serif font-bold">{getClueTranslation(card, lang)}</span>
                        {isSelected && (
                          <span className="mt-1 w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {canUseTrance && (
              <p className={`text-[11px] font-sans mt-2.5 ${isLight ? 'text-purple-800/80' : 'text-purple-300/80'}`}>
                {t.trancePromptHint}
              </p>
            )}

            {warning && <p className="text-xs text-red-500 text-center mt-3 font-serif">{warning}</p>}
          </div>

          {/* Sticky Bottom Action Bar for Medium */}
          <div className="sticky bottom-3 z-30 safe-bottom">
            <div className={`p-2.5 rounded-2xl border backdrop-blur-md shadow-2xl space-y-2 ${isLight ? 'bg-amber-50/95 border-amber-300' : 'bg-stone-950/95 border-amber-900/50'}`}>
              {selectedClues.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <span className={`text-[10px] font-serif uppercase shrink-0 ${themeClasses.accentText}`}>
                    {t.selectedCountLabel}:
                  </span>
                  {selectedClues.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggleClue(c)}
                      className={`px-2 py-0.5 rounded-lg border text-xs font-serif font-bold shrink-0 ${
                        isLight ? 'bg-amber-100 border-amber-400 text-amber-950' : 'bg-amber-950 border-amber-700 text-amber-200'
                      }`}
                    >
                      {getClueTranslation(c, lang)} ×
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleFinishMedium}
                disabled={selectedClues.length === 0}
                className={`w-full py-3.5 rounded-2xl font-bold font-serif shadow-xl flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all ${
                  selectedClues.length > 0
                    ? themeClasses.buttonPrimary
                    : isLight
                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed border border-stone-300'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                }`}
              >
                <span>
                  {state.mode === 'duo' ? t.revealInDuo : t.passToGhost} ({selectedClues.length})
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 4: Ghost Add Card */}
      {step === 'ghost_add' && (
        <>
          <div className={`${themeClasses.bgPanel} p-4 sm:p-6 shadow-2xl relative`}>
            <div className="flex items-center justify-between mb-3 border-b border-purple-900/40 pb-3">
              <div>
                <span className={`text-xs uppercase font-serif tracking-widest ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>{t.visionPhase} • 2</span>
                <h2 className={`text-lg sm:text-xl font-serif font-bold ${isLight ? 'text-stone-900' : 'text-purple-100'}`}>{t.ghostStep2}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateProgress({ visionStep: 'ghost_privacy' });
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-serif flex items-center gap-1.5 transition-colors ${
                    isLight
                      ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                      : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
                  }`}
                  title={t.hideScreen}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{t.hideScreen}</span>
                </button>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isLight ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-purple-950 border-purple-700/50 text-purple-300'}`}>
                  <Ghost className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className={`border rounded-2xl p-3 mb-3 text-center ${isLight ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-purple-950/30 border-purple-700/50 text-purple-200'}`}>
              <span className="text-[10px] uppercase font-serif tracking-widest block mb-0.5">
                {t.ghostSecretTitle}
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className={`text-base font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>{roomName}</span>
                {targetArtifact && (
                  <span className={`inline-flex items-center gap-1 text-xs ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                    (<ArtifactIcon artifactId={targetArtifact.id} className="w-3.5 h-3.5" /> {artifactName})
                  </span>
                )}
              </div>
            </div>

            {renderMansionPlanPanel()}

            <div className={`border rounded-2xl p-3 mb-3 ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-950/70 border-stone-800'}`}>
              <span className={`text-xs uppercase font-serif tracking-wider block mb-1.5 ${themeClasses.accentText}`}>
                {t.mediumSummary} ({selectedClues.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedClues.map((c) => (
                  <span key={c.id} className={`px-2.5 py-1 border rounded-xl font-serif text-xs sm:text-sm font-bold ${isLight ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-amber-950/60 border-amber-800 text-amber-200'}`}>
                    {getClueTranslation(c, lang)}
                  </span>
                ))}
              </div>
            </div>

            {/* Ghost Illusion Power */}
            {canUseIllusion && (
              <button
                type="button"
                aria-pressed={ghostIllusionActive}
                onClick={handleToggleIllusion}
                className={`w-full mb-3 py-2.5 px-3 rounded-xl border text-xs font-serif font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  ghostIllusionActive
                    ? isLight
                      ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                      : 'bg-purple-700 text-white border-purple-400 shadow-md'
                    : isLight
                    ? 'bg-purple-100 hover:bg-purple-200 border-purple-400 text-purple-900'
                    : 'bg-purple-950/70 hover:bg-purple-900 border-purple-600/70 text-purple-200'
                }`}
              >
                <Wand2 className="w-4 h-4 shrink-0" />
                <span>
                  {t.activateIllusion} {ghostIllusionActive ? `(${ghostChosenList.length}/2)` : ''}
                </span>
              </button>
            )}

            <div>
              <h4 className={`text-xs font-serif uppercase tracking-wider mb-2 ${isLight ? 'text-purple-800' : 'text-purple-400'}`}>
                {ghostIllusionActive ? t.ghostHandPromptIllusion : t.ghostHandPrompt}
              </h4>
              {state.ghostHand.length === 0 ? (
                <div className={`border rounded-2xl p-4 text-center space-y-3 ${isLight ? 'bg-purple-50 border-purple-300 text-stone-700' : 'bg-stone-950/70 border-purple-800/50 text-stone-300'}`}>
                  <p className="text-xs font-sans">{t.ghostEmptyHandNotice}</p>
                  {onReplenishHands && (state.deckClues.length > 0 || (state.discardClues?.length ?? 0) > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onReplenishHands();
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-serif font-bold bg-purple-700 hover:bg-purple-600 text-white transition-all"
                    >
                      {t.drawEmergencyCards}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {state.ghostHand.map((card) => {
                    const isChosen = ghostChosenList.some((c) => c.id === card.id);
                    return (
                      <button
                        key={card.id}
                        type="button"
                        aria-pressed={isChosen}
                        onClick={() => handleToggleGhostCard(card)}
                        className={`p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between items-center text-center shadow-md ${
                          isChosen
                            ? isLight
                              ? 'bg-purple-200 border-purple-600 text-purple-950 scale-[1.02] ring-2 ring-purple-500'
                              : 'bg-purple-900/80 border-purple-400 text-purple-100 scale-[1.02] ring-2 ring-purple-500/50'
                            : isLight
                            ? 'bg-white border-stone-300 text-stone-800 hover:border-purple-500'
                            : 'bg-stone-950/70 border-stone-800 text-stone-200 hover:border-purple-700/50'
                        }`}
                      >
                        <span className={`text-[10px] font-serif mb-0.5 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{t.ghostHandLabel}</span>
                        <span className="text-sm sm:text-base font-serif font-bold">{getClueTranslation(card, lang)}</span>
                        {isChosen && (
                          <span className="mt-1 w-5 h-5 rounded-full bg-purple-500 text-stone-950 flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {warning && <p className="text-xs text-red-500 text-center mt-3 font-serif">{warning}</p>}
          </div>

          {/* Sticky Bottom Action Bar for Ghost */}
          <div className="sticky bottom-3 z-30 safe-bottom">
            <button
              type="button"
              onClick={handleFinishGhost}
              disabled={!ghostReady}
              className={`w-full py-3.5 ${ghostActionRadius} font-bold font-serif shadow-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all ${
                ghostReady
                  ? uiStyle === 'minimalist'
                    ? isLight
                      ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-md'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                    : 'bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white border border-purple-400/50 active:scale-95'
                  : isLight
                  ? 'bg-stone-200 text-stone-500 cursor-not-allowed border border-stone-300'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
              }`}
            >
              <Shuffle className="w-5 h-5" />
              <span>{state.ghostHand.length === 0 ? t.proceedWithoutDecoy : t.shuffleAndReveal}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
