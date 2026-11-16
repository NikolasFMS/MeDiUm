import React, { useState } from 'react';
import {
  Layers,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  DoorOpen,
  BookOpen,
  Pin,
  Bookmark,
  Flame,
  Zap,
  Wand2,
  Eye,
  Shuffle,
} from 'lucide-react';
import { PackConfig, RoomDifficulty, GameModifiers, GameScenario } from '../types/game';
import {
  THEMATIC_PACKS,
  ALL_ROOMS,
  ALL_ARTIFACTS,
  ALL_CLUES,
  GAME_SCENARIOS,
} from '../data/mansionData';
import { Language, translations, ROOM_TRANSLATIONS, ARTIFACT_TRANSLATIONS } from '../utils/i18n';
import { soundManager } from '../utils/audio';
import { haptics } from '../utils/haptics';
import { useTheme } from '../utils/themeContext';
import { useModalEffects } from '../hooks/useModalEffects';
import { ArtifactIcon } from './ArtifactIcon';

interface PackSelectionModalProps {
  packConfig: PackConfig;
  difficulty: RoomDifficulty;
  modifiers: GameModifiers;
  onSave: (
    config: PackConfig,
    scenarioSettings?: { difficulty: RoomDifficulty; modifiers: GameModifiers }
  ) => void;
  onClose: () => void;
  lang: Language;
}

const arraysEqualAsSets = (a: string[] = [], b: string[] = []) => {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((item) => setA.has(item));
};

export const PackSelectionModal: React.FC<PackSelectionModalProps> = ({
  packConfig,
  difficulty,
  modifiers,
  onSave,
  onClose,
  lang,
}) => {
  const [selectedPacks, setSelectedPacks] = useState<string[]>(packConfig.selectedPackIds);
  const [selectedWordPacks, setSelectedWordPacks] = useState<string[]>(
    packConfig.selectedWordPackIds && packConfig.selectedWordPackIds.length > 0
      ? packConfig.selectedWordPackIds
      : packConfig.selectedPackIds
  );
  const [guaranteedPacks, setGuaranteedPacks] = useState<string[]>(packConfig.guaranteedPackIds ?? []);
  const [disabledRooms, setDisabledRooms] = useState<string[]>(packConfig.disabledRoomIds);
  const [disabledArtifacts, setDisabledArtifacts] = useState<string[]>(packConfig.disabledArtifactIds);
  const [draftDifficulty, setDraftDifficulty] = useState<RoomDifficulty>(difficulty);
  const [draftModifiers, setDraftModifiers] = useState<GameModifiers>(modifiers);
  const [hasAppliedScenario, setHasAppliedScenario] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'packs' | 'words' | 'rooms' | 'artifacts'>('scenarios');

  const t = translations[lang];
  const { themeClasses, themeMode } = useTheme();
  const isLight = themeMode === 'light';

  useModalEffects(true, onClose);

  const fullPacks = THEMATIC_PACKS.filter((p) => p.packType === 'full');
  const wordPacksList = THEMATIC_PACKS.filter((p) => ALL_CLUES.some((c) => c.packId === p.id));

  const isScenarioActive = (scenario: GameScenario) => {
    if (scenario.modifiers.mixedDifficulty !== draftModifiers.mixedDifficulty) return false;
    if (!draftModifiers.mixedDifficulty && scenario.difficulty !== draftDifficulty) return false;
    if (
      scenario.modifiers.enableWingCurses !== draftModifiers.enableWingCurses ||
      scenario.modifiers.ghostIllusionEnabled !== draftModifiers.ghostIllusionEnabled ||
      scenario.modifiers.mediumInsightEnabled !== draftModifiers.mediumInsightEnabled ||
      scenario.modifiers.blitzTimer !== draftModifiers.blitzTimer
    ) {
      return false;
    }
    return (
      arraysEqualAsSets(scenario.packConfig.selectedPackIds, selectedPacks) &&
      arraysEqualAsSets(scenario.packConfig.selectedWordPackIds, selectedWordPacks) &&
      arraysEqualAsSets(scenario.packConfig.guaranteedPackIds ?? [], guaranteedPacks) &&
      disabledRooms.length === 0 &&
      disabledArtifacts.length === 0
    );
  };

  const handleSelectScenario = (scenario: GameScenario) => {
    soundManager.playClick();
    haptics.select();
    setSelectedPacks([...scenario.packConfig.selectedPackIds]);
    setSelectedWordPacks([...scenario.packConfig.selectedWordPackIds]);
    setGuaranteedPacks([...(scenario.packConfig.guaranteedPackIds ?? [])]);
    setDisabledRooms([...scenario.packConfig.disabledRoomIds]);
    setDisabledArtifacts([...scenario.packConfig.disabledArtifactIds]);
    setDraftDifficulty(scenario.difficulty);
    setDraftModifiers({ ...scenario.modifiers });
    setHasAppliedScenario(true);
  };

  const handleTogglePack = (packId: string) => {
    soundManager.playClick(true);
    haptics.select();
    setSelectedPacks((prev) => {
      const exists = prev.includes(packId);
      if (exists) {
        setGuaranteedPacks((gPrev) => gPrev.filter((id) => id !== packId));
        return prev.filter((id) => id !== packId);
      }
      return [...prev, packId];
    });
  };

  const handleToggleGuaranteed = (packId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick(true);
    haptics.select();
    setGuaranteedPacks((prev) =>
      prev.includes(packId) ? prev.filter((id) => id !== packId) : [...prev, packId]
    );
  };

  const handleToggleWordPack = (packId: string) => {
    soundManager.playClick(true);
    haptics.select();
    setSelectedWordPacks((prev) =>
      prev.includes(packId) ? prev.filter((id) => id !== packId) : [...prev, packId]
    );
  };

  const handleSelectAllWords = () => {
    soundManager.playClick();
    haptics.select();
    setSelectedWordPacks(wordPacksList.map((p) => p.id));
  };

  const handleSyncWordsWithRooms = () => {
    soundManager.playClick();
    haptics.select();
    setSelectedWordPacks([...selectedPacks]);
  };

  const handleToggleRoom = (roomId: string) => {
    soundManager.playClick(true);
    haptics.select();
    setDisabledRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleToggleArtifact = (artId: string) => {
    soundManager.playClick(true);
    haptics.select();
    setDisabledArtifacts((prev) =>
      prev.includes(artId) ? prev.filter((id) => id !== artId) : [...prev, artId]
    );
  };

  const activeRoomsCount = ALL_ROOMS.filter(
    (r) => selectedPacks.includes(r.packId) && !disabledRooms.includes(r.id)
  ).length;

  const activeArtifactsCount = ALL_ARTIFACTS.filter(
    (a) => selectedPacks.includes(a.packId) && !disabledArtifacts.includes(a.id)
  ).length;

  const activeWordsCount = ALL_CLUES.filter((c) => selectedWordPacks.includes(c.packId)).length;

  const isValid = activeRoomsCount >= 10 && activeArtifactsCount >= 10 && activeWordsCount >= 25;

  const handleSave = () => {
    if (!isValid) return;
    soundManager.playClick();
    onSave(
      {
        selectedPackIds: selectedPacks,
        selectedWordPackIds: selectedWordPacks,
        disabledRoomIds: disabledRooms,
        disabledArtifactIds: disabledArtifacts,
        guaranteedPackIds: guaranteedPacks.filter((id) => selectedPacks.includes(id)),
      },
      hasAppliedScenario
        ? { difficulty: draftDifficulty, modifiers: draftModifiers }
        : undefined
    );
    onClose();
  };

  const tabClass = (
    tabKey: 'scenarios' | 'packs' | 'words' | 'rooms' | 'artifacts',
    spanClass: string
  ) =>
    `${spanClass} min-w-0 overflow-hidden py-2 px-1 rounded-xl font-serif text-[10px] sm:text-xs font-bold leading-tight transition-all text-center flex items-center justify-center gap-1 ${
      activeTab === tabKey
        ? isLight
          ? 'bg-amber-200 text-amber-950 shadow-md border border-amber-500'
          : 'bg-amber-900/80 text-amber-100 shadow-md border border-amber-600/50'
        : isLight
        ? 'text-stone-600 hover:text-stone-900'
        : 'text-stone-400 hover:text-stone-200'
    }`;

  return (
    <div role="dialog" aria-modal="true" aria-label={t.packsModalTitle} className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className={`max-w-2xl w-full ${themeClasses.bgPanel} p-4 sm:p-6 shadow-2xl relative flex flex-col max-h-[90vh]`}>
        <div className={`flex items-center justify-between border-b pb-3 mb-3.5 ${isLight ? 'border-stone-300' : 'border-amber-900/40'}`}>
          <div className="flex items-center gap-2.5">
            <Layers className={`w-6 h-6 shrink-0 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
            <div>
              <h3 className={`text-lg sm:text-xl font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                {t.packsModalTitle}
              </h3>
              <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{t.packsModalSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label={t.close}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border shrink-0 ${isLight ? 'bg-stone-200 hover:bg-stone-300 text-stone-700 border-stone-300' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border-stone-700'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`grid grid-cols-6 sm:grid-cols-5 gap-1.5 p-1.5 rounded-2xl mb-4 border ${isLight ? 'bg-amber-100/60 border-stone-300' : 'bg-stone-950 border-stone-800'}`}>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('scenarios');
            }}
            className={tabClass('scenarios', 'col-span-3 sm:col-span-1')}
          >
            <Bookmark className="w-3.5 h-3.5 shrink-0" />
            <span>{t.scenariosTab}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('packs');
            }}
            className={tabClass('packs', 'col-span-3 sm:col-span-1')}
          >
            <span>{t.packsShortTab} ({selectedPacks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('words');
            }}
            className={tabClass('words', 'col-span-2 sm:col-span-1')}
          >
            <span>{t.wordsCount} ({activeWordsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('rooms');
            }}
            className={tabClass('rooms', 'col-span-2 sm:col-span-1')}
          >
            <span>{t.roomsCount} ({activeRoomsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('artifacts');
            }}
            className={tabClass('artifacts', 'col-span-2 sm:col-span-1')}
          >
            <span>{t.artifactsTab} ({activeArtifactsCount})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4">
          {activeTab === 'scenarios' && (
            <div className="space-y-3">
              <p className={`text-xs font-sans ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                {t.scenariosSubtitle}
              </p>
              {GAME_SCENARIOS.map((scenario) => {
                const active = isScenarioActive(scenario);
                const scenarioWordCount = ALL_CLUES.filter((c) =>
                  scenario.packConfig.selectedWordPackIds.includes(c.packId)
                ).length;

                return (
                  <button
                    key={scenario.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleSelectScenario(scenario)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      active
                        ? isLight
                          ? 'bg-amber-100/90 border-amber-600 shadow-lg ring-1 ring-amber-600/50'
                          : 'bg-amber-950/60 border-amber-500 shadow-lg ring-1 ring-amber-500/50'
                        : isLight
                        ? 'bg-white border-stone-200 hover:border-amber-400'
                        : 'bg-stone-950/40 border-stone-800 hover:border-amber-700/60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        active
                          ? 'bg-amber-600 border-amber-400 text-white'
                          : isLight
                          ? 'border-stone-400 bg-stone-100'
                          : 'border-stone-700 bg-stone-900'
                      }`}
                    >
                      {active && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm font-serif font-bold mb-0.5 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                        {lang === 'ru' ? scenario.titleRu : scenario.titleEn}
                      </h4>
                      <p className={`text-xs font-sans mb-2.5 leading-relaxed ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                        {lang === 'ru' ? scenario.descRu : scenario.descEn}
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-sans tabular-nums">
                        <span className={`px-2 py-0.5 rounded border inline-flex items-center gap-1 ${isLight ? 'bg-white/80 border-stone-300 text-stone-800' : 'bg-stone-900/80 border-stone-700 text-stone-200'}`}>
                          {scenario.modifiers.mixedDifficulty ? (
                            <>
                              <Shuffle className="w-2.5 h-2.5 text-purple-400" />
                              <span>{t.mixedDifficultyShort}</span>
                            </>
                          ) : (
                            <span>{scenario.difficulty === 'silver' ? t.silver : t.gold}</span>
                          )}
                        </span>
                        <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-white/80 border-stone-300 text-stone-700' : 'bg-stone-900/80 border-stone-700 text-stone-300'}`}>
                          {t.wordsCount}: {scenarioWordCount}
                        </span>
                        {scenario.modifiers.enableWingCurses && (
                          <span className={`px-2 py-0.5 rounded border inline-flex items-center gap-1 ${isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/60 border-amber-700/60 text-amber-200'}`}>
                            <Flame className="w-2.5 h-2.5" />
                            <span>{t.wingCursesLabel.split(' / ')[0]}</span>
                          </span>
                        )}
                        {scenario.modifiers.mediumInsightEnabled && (
                          <span className={`px-2 py-0.5 rounded border inline-flex items-center gap-1 ${isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/60 border-amber-700/60 text-amber-200'}`}>
                            <Eye className="w-2.5 h-2.5" />
                            <span>{t.activateInsight}</span>
                          </span>
                        )}
                        {scenario.modifiers.ghostIllusionEnabled && (
                          <span className={`px-2 py-0.5 rounded border inline-flex items-center gap-1 ${isLight ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-purple-950/60 border-purple-700/60 text-purple-200'}`}>
                            <Wand2 className="w-2.5 h-2.5" />
                            <span>{t.ghostIllusionLabel.split(' (')[0]}</span>
                          </span>
                        )}
                        {scenario.modifiers.blitzTimer && (
                          <span className={`px-2 py-0.5 rounded border inline-flex items-center gap-1 ${isLight ? 'bg-red-50 border-red-300 text-red-900' : 'bg-red-950/60 border-red-700/60 text-red-200'}`}>
                            <Zap className="w-2.5 h-2.5" />
                            <span>{t.blitzBadge}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'packs' && (
            <div className="space-y-3">
              {fullPacks.map((pack) => {
                const isSelected = selectedPacks.includes(pack.id);
                const isGuaranteed = isSelected && guaranteedPacks.includes(pack.id);
                const packRooms = ALL_ROOMS.filter((r) => r.packId === pack.id).length;
                const packArtifacts = ALL_ARTIFACTS.filter((a) => a.packId === pack.id).length;
                const packClues = ALL_CLUES.filter((c) => c.packId === pack.id).length;

                return (
                  <div
                    key={pack.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => handleTogglePack(pack.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTogglePack(pack.id);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-100/90 border-amber-600 shadow-lg ring-1 ring-amber-600/50'
                          : 'bg-amber-950/60 border-amber-500 shadow-lg ring-1 ring-amber-500/50'
                        : isLight
                        ? 'bg-white border-stone-200 hover:border-stone-300 opacity-70'
                        : 'bg-stone-950/40 border-stone-800 hover:border-stone-700 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-amber-600 border-amber-400 text-white'
                          : isLight ? 'border-stone-400 bg-stone-100' : 'border-stone-700 bg-stone-900'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h4 className={`text-sm font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                          {lang === 'ru' ? pack.titleRu : pack.titleEn}
                        </h4>
                        {isSelected && pack.id !== 'pack-base' && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleGuaranteed(pack.id, e)}
                            aria-pressed={isGuaranteed}
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-serif font-bold inline-flex items-center gap-1 shrink-0 transition-colors ${
                              isGuaranteed
                                ? isLight
                                  ? 'bg-amber-600 text-white border-amber-700'
                                  : 'bg-amber-600 text-stone-950 border-amber-400'
                                : isLight
                                ? 'bg-white/80 text-stone-600 border-stone-300 hover:border-amber-500'
                                : 'bg-stone-900 text-stone-400 border-stone-700 hover:border-amber-600'
                            }`}
                          >
                            <Pin className="w-2.5 h-2.5" />
                            <span>{t.guaranteedWingToggle}</span>
                          </button>
                        )}
                      </div>
                      <p className={`text-xs font-sans mb-2 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                        {lang === 'ru' ? pack.descRu : pack.descEn}
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-sans tabular-nums">
                        <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-white/80 border-stone-300 text-stone-700' : 'bg-stone-900/80 border-stone-700 text-stone-300'}`}>
                          {t.roomsCount}: {packRooms}
                        </span>
                        <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-white/80 border-stone-300 text-stone-700' : 'bg-stone-900/80 border-stone-700 text-stone-300'}`}>
                          {t.artifactsCount}: {packArtifacts}
                        </span>
                        <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-white/80 border-stone-300 text-stone-700' : 'bg-stone-900/80 border-stone-700 text-stone-300'}`}>
                          {t.wordsCount}: {packClues}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'words' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllWords}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-serif font-bold transition-colors ${
                    isLight
                      ? 'bg-white hover:bg-amber-50 border-stone-300 text-stone-800'
                      : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-amber-200'
                  }`}
                >
                  {t.selectAllWords} ({ALL_CLUES.length})
                </button>
                <button
                  type="button"
                  onClick={handleSyncWordsWithRooms}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-serif font-bold transition-colors ${
                    isLight
                      ? 'bg-white hover:bg-amber-50 border-stone-300 text-stone-800'
                      : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  {t.syncWordsWithRooms}
                </button>
              </div>

              {wordPacksList.map((pack) => {
                const isSelected = selectedWordPacks.includes(pack.id);
                const packClues = ALL_CLUES.filter((c) => c.packId === pack.id);
                const previewWords = packClues.slice(0, 5).map((c) => c.word).join(', ');
                const isWordOnly = pack.packType === 'words';

                return (
                  <button
                    key={pack.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleToggleWordPack(pack.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-100/90 border-amber-600 shadow-md ring-1 ring-amber-600/40'
                          : 'bg-amber-950/60 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                        : isLight
                        ? 'bg-white border-stone-200 hover:border-stone-300 opacity-70'
                        : 'bg-stone-950/40 border-stone-800 hover:border-stone-700 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-amber-600 border-amber-400 text-white'
                          : isLight ? 'border-stone-400 bg-stone-100' : 'border-stone-700 bg-stone-900'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className={`text-sm font-serif font-bold flex items-center gap-1.5 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                          <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                          <span>{lang === 'ru' ? pack.titleRu : pack.titleEn}</span>
                        </h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isWordOnly && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-serif font-bold ${
                              isLight ? 'bg-purple-100 border-purple-300 text-purple-900' : 'bg-purple-950/70 border-purple-700 text-purple-200'
                            }`}>
                              {t.wordOnlyBadge}
                            </span>
                          )}
                          <span className={`text-[11px] px-2 py-0.5 rounded border font-mono font-bold tabular-nums ${
                            isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-stone-900 border-stone-700 text-stone-200'
                          }`}>
                            +{packClues.length}
                          </span>
                        </div>
                      </div>
                      <p className={`text-xs font-sans mb-1 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                        {lang === 'ru' ? pack.descRu : pack.descEn}
                      </p>
                      <p className={`text-[11px] font-sans italic truncate ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                        {previewWords}…
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_ROOMS.map((room) => {
                const isPackActive = selectedPacks.includes(room.packId);
                const isRoomActive = isPackActive && !disabledRooms.includes(room.id);
                const roomData = ROOM_TRANSLATIONS[room.id];
                const roomNameSilver = roomData ? roomData[lang].silver : room.nameSilver;
                const roomNameGold = roomData ? roomData[lang].gold : room.nameGold;
                const packInfo = THEMATIC_PACKS.find((p) => p.id === room.packId);
                const packLabel = packInfo ? (lang === 'ru' ? packInfo.titleRu : packInfo.titleEn) : room.packId;

                return (
                  <button
                    key={room.id}
                    type="button"
                    disabled={!isPackActive}
                    aria-pressed={isRoomActive}
                    onClick={() => {
                      if (isPackActive) handleToggleRoom(room.id);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                      !isPackActive
                        ? isLight
                          ? 'bg-stone-100 border-stone-200 opacity-45 cursor-not-allowed'
                          : 'bg-stone-950/20 border-stone-900 opacity-40 cursor-not-allowed'
                        : isRoomActive
                        ? isLight ? 'bg-amber-100/80 border-amber-600 cursor-pointer' : 'bg-amber-950/40 border-amber-600/70 cursor-pointer'
                        : isLight ? 'bg-white border-stone-300 opacity-60 cursor-pointer' : 'bg-stone-950/60 border-stone-800 opacity-60 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <DoorOpen className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                      <div className="min-w-0">
                        <div className={`text-xs font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                          <span className={`font-sans text-[10px] font-semibold mr-1 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{t.silverShort}</span>
                          {roomNameSilver}
                        </div>
                        <div className={`text-[11px] font-serif font-semibold ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                          <span className={`font-sans text-[10px] font-semibold mr-1 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{t.goldShort}</span>
                          {roomNameGold}
                        </div>
                        <div className={`text-[10px] truncate mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{packLabel}</div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center text-xs shrink-0 ${
                        isRoomActive
                          ? 'bg-amber-600 border-amber-400 text-white'
                          : isLight ? 'border-stone-400 bg-stone-100' : 'border-stone-700 bg-stone-900'
                      }`}
                    >
                      {isRoomActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'artifacts' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_ARTIFACTS.map((artifact) => {
                const isPackActive = selectedPacks.includes(artifact.packId);
                const isArtActive = isPackActive && !disabledArtifacts.includes(artifact.id);
                const artName = ARTIFACT_TRANSLATIONS[artifact.id]?.[lang] || artifact.name;
                const packInfo = THEMATIC_PACKS.find((p) => p.id === artifact.packId);
                const packLabel = packInfo ? (lang === 'ru' ? packInfo.titleRu : packInfo.titleEn) : artifact.packId;

                return (
                  <button
                    key={artifact.id}
                    type="button"
                    disabled={!isPackActive}
                    aria-pressed={isArtActive}
                    onClick={() => {
                      if (isPackActive) handleToggleArtifact(artifact.id);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                      !isPackActive
                        ? isLight
                          ? 'bg-stone-100 border-stone-200 opacity-45 cursor-not-allowed'
                          : 'bg-stone-950/20 border-stone-900 opacity-40 cursor-not-allowed'
                        : isArtActive
                        ? isLight ? 'bg-amber-100/80 border-amber-600 cursor-pointer' : 'bg-amber-950/40 border-amber-600/70 cursor-pointer'
                        : isLight ? 'bg-white border-stone-300 opacity-60 cursor-pointer' : 'bg-stone-950/60 border-stone-800 opacity-60 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-stone-900 border-amber-800/50 text-amber-300'}`}>
                        <ArtifactIcon artifactId={artifact.id} className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs font-serif font-bold truncate ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>{artName}</div>
                        <div className={`text-[10px] truncate ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{packLabel}</div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center text-xs shrink-0 ${
                        isArtActive
                          ? 'bg-amber-600 border-amber-400 text-white'
                          : isLight ? 'border-stone-400 bg-stone-100' : 'border-stone-700 bg-stone-900'
                      }`}
                    >
                      {isArtActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Validation Warning & Save Button */}
        <div className={`pt-3 border-t space-y-3 ${isLight ? 'border-stone-300' : 'border-amber-900/40'}`}>
          {!isValid && (
            <div className={`flex items-center gap-2 border px-3 py-2 rounded-xl text-xs font-serif ${
              isLight
                ? 'text-red-800 bg-red-100/90 border-red-300'
                : 'text-red-200 bg-red-950/70 border-red-700/80'
            }`}>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t.minWordsWarning}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className={`px-5 py-3 font-serif font-bold rounded-2xl transition-colors border text-sm ${isLight ? 'bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300' : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'}`}
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid}
              className={`flex-1 py-3 font-serif font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm ${
                isValid
                  ? themeClasses.buttonPrimary
                  : isLight
                  ? 'bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed'
                  : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.saveAndApply}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
