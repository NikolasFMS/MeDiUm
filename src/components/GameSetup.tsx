import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Sparkles,
  Play,
  Layers,
  Target,
  Shuffle,
  Flame,
  Zap,
  Wand2,
  Eye,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import {
  GameMode,
  RoomDifficulty,
  GameVersion,
  PackConfig,
  GameModifiers,
  GameScenario,
} from '../types/game';
import {
  EXPANSIONS,
  GAME_SCENARIOS,
  DEFAULT_MODIFIERS,
  ALL_CLUES,
} from '../data/mansionData';
import { soundManager } from '../utils/audio';
import { haptics } from '../utils/haptics';
import { Language, translations, EXPANSION_TRANSLATIONS } from '../utils/i18n';
import { PackSelectionModal } from './PackSelectionModal';
import { PWAInstallButton } from './PWAInstallButton';
import { useTheme } from '../utils/themeContext';

interface GameSetupProps {
  currentVersion: GameVersion;
  onSelectVersion: (version: GameVersion) => void;
  onStartGame: (
    mode: GameMode,
    difficulty: RoomDifficulty,
    targetSealedCount: number,
    modifiers: GameModifiers
  ) => void;
  lang: Language;
  packConfig: PackConfig;
  onUpdatePackConfig: (config: PackConfig) => void;
}

const DUO_TARGETS = [5, 6, 7] as const;

const arraysEqualAsSets = (a: string[] = [], b: string[] = []) => {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((item) => setA.has(item));
};

const matchesScenario = (
  scenario: GameScenario,
  difficulty: RoomDifficulty,
  packConfig: PackConfig,
  modifiers: GameModifiers
) => {
  if (scenario.modifiers.mixedDifficulty !== modifiers.mixedDifficulty) return false;
  if (!modifiers.mixedDifficulty && scenario.difficulty !== difficulty) return false;
  if (
    scenario.modifiers.enableWingCurses !== modifiers.enableWingCurses ||
    scenario.modifiers.ghostIllusionEnabled !== modifiers.ghostIllusionEnabled ||
    scenario.modifiers.mediumInsightEnabled !== modifiers.mediumInsightEnabled ||
    scenario.modifiers.blitzTimer !== modifiers.blitzTimer
  ) {
    return false;
  }
  const wordIds =
    packConfig.selectedWordPackIds && packConfig.selectedWordPackIds.length > 0
      ? packConfig.selectedWordPackIds
      : packConfig.selectedPackIds;
  return (
    arraysEqualAsSets(scenario.packConfig.selectedPackIds, packConfig.selectedPackIds) &&
    arraysEqualAsSets(scenario.packConfig.selectedWordPackIds, wordIds) &&
    arraysEqualAsSets(scenario.packConfig.guaranteedPackIds ?? [], packConfig.guaranteedPackIds ?? []) &&
    packConfig.disabledRoomIds.length === 0 &&
    packConfig.disabledArtifactIds.length === 0
  );
};

export const GameSetup: React.FC<GameSetupProps> = ({
  currentVersion,
  onSelectVersion,
  onStartGame,
  lang,
  packConfig,
  onUpdatePackConfig,
}) => {
  const [step, setStep] = useState<'version' | 'parameters'>('version');
  const [mode, setMode] = useState<GameMode>('standard');
  const [difficulty, setDifficulty] = useState<RoomDifficulty>('silver');
  const [duoTarget, setDuoTarget] = useState<number>(5);
  const [modifiers, setModifiers] = useState<GameModifiers>(DEFAULT_MODIFIERS);
  const [showModifiers, setShowModifiers] = useState<boolean>(false);
  const [showPackModal, setShowPackModal] = useState(false);

  const t = translations[lang];
  const { themeClasses, themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const activeWordPackIds =
    packConfig.selectedWordPackIds && packConfig.selectedWordPackIds.length > 0
      ? packConfig.selectedWordPackIds
      : packConfig.selectedPackIds;
  const activeWordCount = ALL_CLUES.filter((c) => activeWordPackIds.includes(c.packId)).length;

  const activeScenario = GAME_SCENARIOS.find((s) =>
    matchesScenario(s, difficulty, packConfig, modifiers)
  );

  const activeModifierCount = [
    modifiers.enableWingCurses,
    modifiers.mediumInsightEnabled,
    mode === 'standard' && modifiers.ghostIllusionEnabled,
    modifiers.blitzTimer,
  ].filter(Boolean).length;

  const handleSavePacksAndScenario = (
    nextConfig: PackConfig,
    scenarioSettings?: { difficulty: RoomDifficulty; modifiers: GameModifiers }
  ) => {
    onUpdatePackConfig(nextConfig);
    if (scenarioSettings) {
      setDifficulty(scenarioSettings.difficulty);
      setModifiers(scenarioSettings.modifiers);
      if (
        scenarioSettings.modifiers.enableWingCurses ||
        scenarioSettings.modifiers.ghostIllusionEnabled ||
        scenarioSettings.modifiers.mediumInsightEnabled ||
        scenarioSettings.modifiers.blitzTimer
      ) {
        setShowModifiers(true);
      }
    }
  };

  const handleToggleModifier = (key: keyof GameModifiers) => {
    soundManager.playClick(true);
    haptics.select();
    setModifiers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStart = () => {
    soundManager.playClick();
    const effectiveModifiers: GameModifiers =
      mode === 'duo' ? { ...modifiers, ghostIllusionEnabled: false } : modifiers;
    onStartGame(mode, difficulty, mode === 'duo' ? duoTarget : 5, effectiveModifiers);
  };

  const currentExpTitle =
    EXPANSION_TRANSLATIONS[currentVersion]?.[lang]?.title ||
    EXPANSIONS.find((e) => e.id === currentVersion)?.title;

  return (
    <>
      <div className="flex flex-col items-center justify-start sm:justify-center sm:min-h-[82dvh] px-3 py-4 sm:p-6 gap-4 animate-fadeIn">
        <div className={`max-w-xl w-full ${themeClasses.bgPanel} p-4 sm:p-8 shadow-2xl relative overflow-hidden`}>
          <div className={`absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 ${isLight ? 'border-amber-600' : 'border-amber-500'}`}></div>
          <div className={`absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 ${isLight ? 'border-amber-600' : 'border-amber-500'}`}></div>
          <div className={`absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 ${isLight ? 'border-amber-600' : 'border-amber-500'}`}></div>
          <div className={`absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 ${isLight ? 'border-amber-600' : 'border-amber-500'}`}></div>

          {step === 'version' ? (
            <div>
              <div className="text-center mb-5">
                <span className={`inline-block px-3 py-1 border rounded-full text-xs font-serif uppercase tracking-widest mb-2 ${isLight ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-amber-950 border-amber-800 text-amber-300'}`}>
                  {t.seriesBadge}
                </span>
                <h2 className={`text-2xl sm:text-3xl font-serif font-bold mb-1 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                  {t.selectVersion}
                </h2>
                <p className={`text-xs font-sans ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                  {t.selectSeriesPart}
                </p>
              </div>

              <div className="space-y-3 mb-4">
                {EXPANSIONS.filter((e) => e.available).map((exp) => {
                  const expText = EXPANSION_TRANSLATIONS[exp.id]?.[lang];
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onSelectVersion(exp.id);
                        setStep('parameters');
                      }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                        currentVersion === exp.id
                          ? isLight
                            ? 'bg-amber-100 border-amber-600 shadow-lg ring-2 ring-amber-600/40'
                            : 'bg-amber-950/90 border-amber-500 shadow-lg ring-2 ring-amber-500/40'
                          : isLight
                          ? 'bg-white border-stone-300 hover:border-amber-600/80'
                          : 'bg-stone-950/70 border-stone-800 hover:border-amber-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 w-full">
                        <span className={`text-xs uppercase font-serif tracking-widest font-bold ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                          {expText?.subtitle || exp.subtitle}
                        </span>
                        <span className={`text-[11px] font-serif font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                          {t.available}
                        </span>
                      </div>
                      <h3 className={`text-lg font-serif font-bold mb-1 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                        {expText?.title || exp.title}
                      </h3>
                      <p className={`text-xs font-sans leading-relaxed ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                        {expText?.desc || exp.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {EXPANSIONS.some((e) => !e.available) && (
                <div className={`pt-3 border-t ${isLight ? 'border-stone-200' : 'border-stone-800/80'}`}>
                  <p className="text-[11px] font-serif uppercase tracking-wider mb-2 text-stone-500">
                    {t.upcomingExpansions}
                  </p>
                  <div className="space-y-2">
                    {EXPANSIONS.filter((e) => !e.available).map((exp) => {
                      const expText = EXPANSION_TRANSLATIONS[exp.id]?.[lang];
                      return (
                        <div
                          key={exp.id}
                          className={`px-3.5 py-2.5 rounded-xl border opacity-70 ${
                            isLight ? 'bg-stone-100/80 border-stone-200' : 'bg-stone-950/40 border-stone-800/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-sm font-serif font-bold ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                              {expText?.title || exp.title}
                            </h4>
                            <span className="text-[10px] font-serif shrink-0 text-stone-500">
                              {expText?.subtitle || exp.subtitle}
                            </span>
                          </div>
                          <p className="text-[11px] font-sans mt-0.5 line-clamp-1 text-stone-500">
                            {expText?.desc || exp.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <span className={`inline-block px-3 py-1 border rounded-full text-xs font-serif uppercase tracking-widest mb-2 ${isLight ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-amber-950 border-amber-800 text-amber-300'}`}>
                  {currentExpTitle}
                </span>
                <h2 className={`text-2xl font-serif font-bold mb-1 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                  {t.setupPartyTitle}
                </h2>
                <p className={`text-xs font-sans ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                  {t.setupPartySubtitle}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {/* Game Mode Selection */}
                <div>
                  <label className={`block text-xs font-serif uppercase tracking-wider mb-2 ${themeClasses.accentText}`}>
                    {t.gameMode}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      aria-pressed={mode === 'standard'}
                      onClick={() => {
                        soundManager.playClick();
                        setMode('standard');
                      }}
                      className={`min-w-0 overflow-hidden p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        mode === 'standard'
                          ? isLight
                            ? 'bg-amber-100 border-amber-600 shadow-md ring-1 ring-amber-600'
                            : 'bg-amber-950/80 border-amber-500 shadow-md ring-1 ring-amber-500'
                          : isLight
                          ? 'bg-white border-stone-300 hover:border-stone-400'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 sm:gap-2 min-w-0 font-serif font-bold text-xs sm:text-sm mb-1 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                        <Users className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                        <span className="min-w-0 break-words leading-tight">{t.standard}</span>
                      </div>
                      <p className={`text-[11px] leading-tight break-words ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{t.standardDesc}</p>
                    </button>

                    <button
                      type="button"
                      aria-pressed={mode === 'duo'}
                      onClick={() => {
                        soundManager.playClick();
                        setMode('duo');
                      }}
                      className={`min-w-0 overflow-hidden p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        mode === 'duo'
                          ? isLight
                            ? 'bg-amber-100 border-amber-600 shadow-md ring-1 ring-amber-600'
                            : 'bg-amber-950/80 border-amber-500 shadow-md ring-1 ring-amber-500'
                          : isLight
                          ? 'bg-white border-stone-300 hover:border-stone-400'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 sm:gap-2 min-w-0 font-serif font-bold text-xs sm:text-sm mb-1 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                        <UserCheck className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                        <span className="min-w-0 break-words leading-tight">{t.duo}</span>
                      </div>
                      <p className={`text-[11px] leading-tight break-words ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{t.duoDesc}</p>
                    </button>
                  </div>
                </div>

                {/* Duo Target Win Rooms Selector */}
                {mode === 'duo' && (
                  <div className={`p-3.5 rounded-2xl border animate-fadeIn ${isLight ? 'bg-amber-50/80 border-amber-300' : 'bg-stone-950/60 border-amber-900/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className={`w-4 h-4 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                      <span className={`text-xs font-serif uppercase tracking-wider ${themeClasses.accentText}`}>
                        {t.duoTargetTitle}
                      </span>
                    </div>
                    <p className={`text-[11px] font-sans mb-2.5 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      {t.duoTargetDesc}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {DUO_TARGETS.map((count) => {
                        const isSelected = duoTarget === count;
                        return (
                          <button
                            key={count}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              soundManager.playClick(true);
                              setDuoTarget(count);
                            }}
                            className={`min-w-0 overflow-hidden py-2 px-1.5 sm:px-2 rounded-xl border text-[11px] sm:text-xs font-serif font-bold leading-tight transition-all cursor-pointer ${
                              isSelected
                                ? isLight
                                  ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                                  : 'bg-amber-600 text-stone-950 border-amber-400 shadow-sm'
                                : isLight
                                ? 'bg-white text-stone-700 border-stone-300 hover:border-amber-500'
                                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-700'
                            }`}
                          >
                            {count} {t.duoTargetRooms}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Room Side / Difficulty (Silver, Gold, or Mixed 5+5) */}
                <div>
                  <label className={`block text-xs font-serif uppercase tracking-wider mb-2 ${themeClasses.accentText}`}>
                    {t.roomDifficulty}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      aria-pressed={!modifiers.mixedDifficulty && difficulty === 'silver'}
                      onClick={() => {
                        soundManager.playClick();
                        setDifficulty('silver');
                        setModifiers((prev) => ({ ...prev, mixedDifficulty: false }));
                      }}
                      className={`min-w-0 w-full overflow-hidden p-3 rounded-2xl border text-left transition-all cursor-pointer flex sm:block items-center justify-between gap-2 ${
                        !modifiers.mixedDifficulty && difficulty === 'silver'
                          ? isLight
                            ? 'bg-amber-100 border-amber-600 shadow-md ring-1 ring-amber-600'
                            : 'bg-amber-950/80 border-amber-500 shadow-md ring-1 ring-amber-500'
                          : isLight
                          ? 'bg-white border-stone-300 hover:border-stone-400'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 min-w-0 font-serif font-bold text-xs sm:text-sm sm:mb-0.5 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                        <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-stone-700' : 'text-stone-300'}`} />
                        <span className="min-w-0 break-words leading-tight">{t.silver}</span>
                      </div>
                      <p className={`text-[10px] sm:text-[11px] leading-tight break-words shrink-0 sm:shrink ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{t.silverDesc}</p>
                    </button>

                    <button
                      type="button"
                      aria-pressed={!modifiers.mixedDifficulty && difficulty === 'gold'}
                      onClick={() => {
                        soundManager.playClick();
                        setDifficulty('gold');
                        setModifiers((prev) => ({ ...prev, mixedDifficulty: false }));
                      }}
                      className={`min-w-0 w-full overflow-hidden p-3 rounded-2xl border text-left transition-all cursor-pointer flex sm:block items-center justify-between gap-2 ${
                        !modifiers.mixedDifficulty && difficulty === 'gold'
                          ? isLight
                            ? 'bg-amber-100 border-amber-600 shadow-md ring-1 ring-amber-600'
                            : 'bg-amber-950/80 border-amber-500 shadow-md ring-1 ring-amber-500'
                          : isLight
                          ? 'bg-white border-stone-300 hover:border-stone-400'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 min-w-0 font-serif font-bold text-xs sm:text-sm sm:mb-0.5 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                        <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                        <span className="min-w-0 break-words leading-tight">{t.gold}</span>
                      </div>
                      <p className={`text-[10px] sm:text-[11px] leading-tight break-words shrink-0 sm:shrink ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{t.goldDesc}</p>
                    </button>

                    <button
                      type="button"
                      aria-pressed={modifiers.mixedDifficulty}
                      onClick={() => {
                        soundManager.playClick();
                        setModifiers((prev) => ({ ...prev, mixedDifficulty: true }));
                      }}
                      className={`min-w-0 w-full overflow-hidden p-3 rounded-2xl border text-left transition-all cursor-pointer flex sm:block items-center justify-between gap-2 ${
                        modifiers.mixedDifficulty
                          ? isLight
                            ? 'bg-amber-100 border-amber-600 shadow-md ring-1 ring-amber-600'
                            : 'bg-amber-950/80 border-amber-500 shadow-md ring-1 ring-amber-500'
                          : isLight
                          ? 'bg-white border-stone-300 hover:border-stone-400'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 min-w-0 font-serif font-bold text-xs sm:text-sm sm:mb-0.5 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                        <Shuffle className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
                        <span className="min-w-0 break-words leading-tight">{t.mixedDifficultyShort}</span>
                      </div>
                      <p className={`text-[10px] sm:text-[11px] leading-tight break-words shrink-0 sm:shrink ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>5 + 5</p>
                    </button>
                  </div>
                </div>

                {/* Scenarios, Packs & Word Decks Selection Button */}
                <div>
                  <label className={`block text-xs font-serif uppercase tracking-wider mb-2 ${themeClasses.accentText}`}>
                    {t.packsButton}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setShowPackModal(true);
                    }}
                    className={`w-full overflow-hidden p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm font-serif transition-colors shadow-md cursor-pointer ${isLight ? 'bg-white border-stone-300 text-stone-900 hover:border-amber-600' : 'bg-stone-950/60 border-stone-800 text-stone-200 hover:border-amber-700/60'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                      <Layers className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                      <div className="min-w-0 text-left flex-1">
                        <span className="block leading-snug break-words">{t.packsButton}</span>
                        {activeScenario && (
                          <span className={`text-[11px] font-sans block break-words ${isLight ? 'text-amber-800' : 'text-amber-300/90'}`}>
                            {lang === 'ru' ? activeScenario.titleRu : activeScenario.titleEn}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 tabular-nums">
                      <span className={`text-xs px-2 py-0.5 rounded-lg border font-bold ${isLight ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-amber-950 border-amber-700 text-amber-200'}`}>
                        {t.packsLabel} {packConfig.selectedPackIds.length}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-lg border font-bold ${isLight ? 'bg-purple-100 border-purple-300 text-purple-900' : 'bg-purple-950/80 border-purple-700 text-purple-200'}`}>
                        {t.wordsDeckLabel} {activeWordCount}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Wing Curses & Modifiers Accordion */}
                <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white/90 border-stone-300' : 'bg-stone-950/50 border-stone-800'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setShowModifiers((prev) => !prev);
                    }}
                    className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Flame className={`w-4 h-4 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                      <span className={`text-xs font-serif uppercase tracking-wider font-bold ${themeClasses.accentText}`}>
                        {t.modifiersTitle}
                      </span>
                      {activeModifierCount > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                          isLight ? 'bg-amber-600 text-white' : 'bg-amber-500 text-stone-950'
                        }`}>
                          {activeModifierCount}
                        </span>
                      )}
                    </div>
                    {showModifiers ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </button>

                  {showModifiers && (
                    <div className={`px-3.5 pb-3.5 pt-1 space-y-2 border-t animate-fadeIn ${isLight ? 'border-stone-200' : 'border-stone-800/80'}`}>
                      {[
                        {
                          key: 'enableWingCurses' as const,
                          icon: Flame,
                          label: t.wingCursesLabel,
                          desc: t.wingCursesDesc,
                          disabled: false,
                        },
                        {
                          key: 'mediumInsightEnabled' as const,
                          icon: Eye,
                          label: t.mediumInsightLabel,
                          desc: t.mediumInsightDesc,
                          disabled: false,
                        },
                        {
                          key: 'ghostIllusionEnabled' as const,
                          icon: Wand2,
                          label: t.ghostIllusionLabel,
                          desc: t.ghostIllusionDesc,
                          disabled: mode === 'duo',
                        },
                        {
                          key: 'blitzTimer' as const,
                          icon: Zap,
                          label: t.blitzTimerLabel,
                          desc: t.blitzTimerDesc,
                          disabled: false,
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        const active = !item.disabled && modifiers[item.key];
                        return (
                          <button
                            key={item.key}
                            type="button"
                            disabled={item.disabled}
                            aria-pressed={active}
                            onClick={() => {
                              if (!item.disabled) handleToggleModifier(item.key);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                              item.disabled
                                ? 'opacity-40 cursor-not-allowed border-stone-800/40'
                                : active
                                ? isLight
                                  ? 'bg-amber-50 border-amber-500 cursor-pointer'
                                  : 'bg-amber-950/40 border-amber-600/70 cursor-pointer'
                                : isLight
                                ? 'bg-stone-50 border-stone-200 hover:border-stone-300 cursor-pointer'
                                : 'bg-stone-900/50 border-stone-800 hover:border-stone-700 cursor-pointer'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 ${
                                active
                                  ? 'bg-amber-600 border-amber-400 text-white'
                                  : isLight
                                  ? 'border-stone-400 bg-white'
                                  : 'border-stone-700 bg-stone-950'
                              }`}
                            >
                              {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`text-xs font-serif font-bold flex items-center gap-1.5 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? (isLight ? 'text-amber-700' : 'text-amber-400') : 'text-stone-400'}`} />
                                <span>{item.label}</span>
                              </div>
                              <p className={`text-[11px] leading-snug mt-0.5 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setStep('version');
                  }}
                  className={`px-4 sm:px-5 py-3.5 font-serif font-bold rounded-2xl transition-colors border text-sm shrink-0 cursor-pointer ${isLight ? 'bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300' : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'}`}
                >
                  {t.back}
                </button>
                <button
                  type="button"
                  onClick={handleStart}
                  className={`flex-1 min-w-0 overflow-hidden px-3 py-3.5 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base font-serif transition-all transform active:scale-95 cursor-pointer ${themeClasses.buttonPrimary}`}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                  <span className="truncate">{t.startInvestigation}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-xl w-full pb-4">
          <PWAInstallButton lang={lang} />
        </div>
      </div>

      {showPackModal && (
        <PackSelectionModal
          packConfig={packConfig}
          difficulty={difficulty}
          modifiers={modifiers}
          onSave={handleSavePacksAndScenario}
          onClose={() => setShowPackModal(false)}
          lang={lang}
        />
      )}
    </>
  );
};
