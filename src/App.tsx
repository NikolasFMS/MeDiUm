import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  GameVersion,
  GameMode,
  RoomDifficulty,
  ClueCard,
  HideoutCard,
  PackConfig,
  VisionStep,
  HuntProgress,
  RoundHistoryEntry,
  GameModifiers,
  RoundEventBanner,
} from './types/game';
import {
  DEFAULT_PACK_CONFIG,
  DEFAULT_MODIFIERS,
  WING_CURSE_PACK_IDS,
  getFilteredGameData,
  selectRoomsForBoard,
  getRoomSide,
  shuffleArray,
} from './data/mansionData';
import { drawClueCards } from './utils/deck';
import { Header } from './components/Header';
import { GameSetup } from './components/GameSetup';
import { GameBoard } from './components/GameBoard';
import { VisionPhase } from './components/VisionPhase';
import { HuntPhase } from './components/HuntPhase';
import { RespitePhase } from './components/RespitePhase';
import { GameOverModal } from './components/GameOverModal';
import { RulebookModal } from './components/RulebookModal';
import { RoundHistoryModal } from './components/RoundHistoryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Language, ROOM_TRANSLATIONS } from './utils/i18n';
import { ThemeContext, getThemeClasses } from './utils/themeContext';

const STORAGE_KEY = 'medium_mansion_game_state_v1';
const LANG_STORAGE_KEY = 'medium_mansion_lang_v1';
const PACK_CONFIG_STORAGE_KEY = 'medium_mansion_pack_config_v1';

const migrateArtifactId = (id: string) =>
  id.startsWith('pack-gr-') ? id.replace('pack-gr-', 'art-gr-') : id;

const migratePackConfig = (config: Partial<PackConfig>): PackConfig => {
  const selectedPackIds = Array.isArray(config.selectedPackIds) && config.selectedPackIds.length > 0
    ? config.selectedPackIds
    : DEFAULT_PACK_CONFIG.selectedPackIds;
  return {
    selectedPackIds,
    selectedWordPackIds:
      Array.isArray(config.selectedWordPackIds) && config.selectedWordPackIds.length > 0
        ? config.selectedWordPackIds
        : selectedPackIds,
    disabledRoomIds: Array.isArray(config.disabledRoomIds) ? config.disabledRoomIds : [],
    disabledArtifactIds: Array.isArray(config.disabledArtifactIds)
      ? config.disabledArtifactIds.map(migrateArtifactId)
      : [],
    guaranteedPackIds: Array.isArray(config.guaranteedPackIds) ? config.guaranteedPackIds : [],
  };
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'ru' || saved === 'en') return saved;
    } catch {}
    return 'ru';
  });

  const [gameState, setGameState] = useState<GameState | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          targetSealedCount: typeof parsed.targetSealedCount === 'number' ? parsed.targetSealedCount : 5,
          roundHistory: Array.isArray(parsed.roundHistory) ? parsed.roundHistory : [],
          discardClues: Array.isArray(parsed.discardClues) ? parsed.discardClues : [],
          modifiers: parsed.modifiers ? { ...DEFAULT_MODIFIERS, ...parsed.modifiers } : DEFAULT_MODIFIERS,
          activeWingIds: Array.isArray(parsed.activeWingIds) ? parsed.activeWingIds : [],
          ghostChosenClues: Array.isArray(parsed.ghostChosenClues)
            ? parsed.ghostChosenClues
            : parsed.ghostChosenClue
            ? [parsed.ghostChosenClue]
            : [],
          rooms: Array.isArray(parsed.rooms)
            ? parsed.rooms.map((r: GameState['rooms'][number]) => ({
                ...r,
                artifactId: r.artifactId ? migrateArtifactId(r.artifactId) : r.artifactId,
              }))
            : [],
          artifacts: Array.isArray(parsed.artifacts)
            ? parsed.artifacts.map((a: GameState['artifacts'][number]) => ({
                ...a,
                id: migrateArtifactId(a.id),
              }))
            : [],
          packConfig: parsed.packConfig ? migratePackConfig(parsed.packConfig) : DEFAULT_PACK_CONFIG,
        };
      }
    } catch {}
    return null;
  });

  const [showRules, setShowRules] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [currentVersion, setCurrentVersion] = useState<GameVersion>(() => gameState?.version ?? 'mansion');
  const gameStateRef = useRef<GameState | null>(gameState);
  const isIntentionalReloadRef = useRef(false);
  const [packConfig, setPackConfig] = useState<PackConfig>(() => {
    try {
      const saved = localStorage.getItem(PACK_CONFIG_STORAGE_KEY);
      if (saved) return migratePackConfig(JSON.parse(saved));
    } catch {}
    return DEFAULT_PACK_CONFIG;
  });

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('medium_mansion_theme_mode_v1');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'dark';
  });

  const [uiStyle, setUiStyle] = useState<'atmospheric' | 'minimalist' | 'classic'>(() => {
    try {
      const saved = localStorage.getItem('medium_mansion_ui_style_v1');
      if (saved === 'atmospheric' || saved === 'minimalist' || saved === 'classic') return saved;
    } catch {}
    return 'atmospheric';
  });

  useEffect(() => {
    try {
      localStorage.setItem(PACK_CONFIG_STORAGE_KEY, JSON.stringify(packConfig));
    } catch {}
  }, [packConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('medium_mansion_theme_mode_v1', themeMode);
    } catch {}
  }, [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem('medium_mansion_ui_style_v1', uiStyle);
    } catch {}
  }, [uiStyle]);

  useEffect(() => {
    gameStateRef.current = gameState;
    try {
      if (gameState) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, [gameState]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  // Flush active game state synchronously before tab suspension/hide and protect against accidental reload
  const isGameActive = gameState !== null && gameState.phase !== 'gameover';
  useEffect(() => {
    const flushGameState = () => {
      try {
        if (gameStateRef.current) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(gameStateRef.current));
        }
      } catch {}
    };

    const handleVisibilityFlush = () => {
      if (document.visibilityState === 'hidden') {
        flushGameState();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      flushGameState();
      if (isGameActive && !isIntentionalReloadRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('pagehide', flushGameState);
    document.addEventListener('visibilitychange', handleVisibilityFlush);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', flushGameState);
      document.removeEventListener('visibilitychange', handleVisibilityFlush);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGameActive]);

  // Wake Lock API only during active game sessions (saves battery on idle setup/gameover screens)
  useEffect(() => {
    if (!isGameActive) return;
    let wakeLock: WakeLockSentinel | null = null;
    let disposed = false;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && !disposed) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch {}
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLock?.release().catch(() => {});
    };
  }, [isGameActive]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ru' ? 'en' : 'ru'));
  };

  const handleStartGame = (
    mode: GameMode,
    difficulty: RoomDifficulty,
    targetSealedCount: number,
    modifiers: GameModifiers
  ) => {
    let effectivePackConfig = packConfig;
    let filtered = getFilteredGameData(effectivePackConfig);

    // Defensive guard if saved packConfig somehow leaves fewer than 10 rooms/artifacts or 25 words
    if (filtered.rooms.length < 10 || filtered.artifacts.length < 10 || filtered.clues.length < 25) {
      effectivePackConfig = DEFAULT_PACK_CONFIG;
      setPackConfig(DEFAULT_PACK_CONFIG);
      filtered = getFilteredGameData(DEFAULT_PACK_CONFIG);
    }

    const { rooms, artifacts, hideouts, clues } = filtered;
    const chosenRooms = selectRoomsForBoard(rooms, effectivePackConfig.guaranteedPackIds);
    const shuffledArtifacts = shuffleArray(artifacts).slice(0, 10);

    const sidesPool: RoomDifficulty[] = modifiers.mixedDifficulty
      ? shuffleArray([
          'silver', 'silver', 'silver', 'silver', 'silver',
          'gold', 'gold', 'gold', 'gold', 'gold',
        ])
      : Array.from({ length: 10 }, () => difficulty);

    const selectedRooms = chosenRooms.map((r, index) => ({
      ...r,
      artifactId: shuffledArtifacts[index].id,
      status: 'active' as const,
      side: sidesPool[index] ?? difficulty,
    }));

    const selectedRoomIds = new Set(selectedRooms.map((r) => r.id));
    const initialHideouts = shuffleArray(hideouts.filter((h) => selectedRoomIds.has(h.roomId)));

    const shuffledClues = shuffleArray(clues);
    const mediumHand = shuffledClues.slice(0, 10);
    const ghostHand = mode === 'standard' ? shuffledClues.slice(10, 15) : [];
    const deckClues = mode === 'standard' ? shuffledClues.slice(15) : shuffledClues.slice(10);

    const normalizedTarget = mode === 'duo' ? Math.min(7, Math.max(5, targetSealedCount)) : 5;

    const wingSet = new Set(WING_CURSE_PACK_IDS as readonly string[]);
    const activeWingIds = Array.from(
      new Set(selectedRooms.map((r) => r.packId).filter((pid) => wingSet.has(pid)))
    );

    const groundsRooms = selectedRooms.filter((r) => r.packId === 'pack-grounds');
    const foggedRoomId =
      modifiers.enableWingCurses && groundsRooms.length > 0
        ? shuffleArray(groundsRooms)[0].id
        : null;

    const newState: GameState = {
      version: currentVersion,
      mode,
      difficulty,
      targetSealedCount: normalizedTarget,
      currentRound: 1,
      rooms: selectedRooms,
      artifacts: shuffledArtifacts,
      hideoutCards: initialHideouts,
      deckClues,
      discardClues: [],
      mediumHand,
      ghostHand,
      currentHideout: null,
      chosenClues: [],
      revealedClues: [],
      duoSpiritClue: null,
      visionStep: 'medium_privacy',
      ghostChosenClue: null,
      ghostChosenClues: [],
      ghostIllusionActive: false,
      huntProgress: null,
      roundHistory: [],
      sealedCount: 0,
      lostCount: 0,
      winner: null,
      phase: 'setup',
      packConfig: effectivePackConfig,
      modifiers,
      activeWingIds,
      occultTranceUsed: false,
      mediumInsightUsed: false,
      ghostIllusionUsed: false,
      medicalFeverPending: false,
      foggedRoomId,
      roundEventBanner: null,
    };
    setGameState(newState);
  };

  const handleGoHome = () => {
    setShowHistory(false);
    setGameState(null);
  };

  const handleResetGame = () => {
    setShowHistory(false);
    setGameState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleClearCache = async () => {
    const appScopeUrl = new URL('./', window.location.href).href;

    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('medium_mansion_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const ownCaches = cacheNames.filter(
          (name) =>
            name.startsWith('medium-mansion-') ||
            name.includes(appScopeUrl)
        );
        await Promise.all(ownCaches.map((name) => caches.delete(name)));
      }
    } catch {}

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('./');
        if (registration && registration.scope === appScopeUrl) {
          await registration.unregister();
        } else {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations
              .filter((reg) => reg.scope === appScopeUrl)
              .map((reg) => reg.unregister())
          );
        }
      }
    } catch {}

    isIntentionalReloadRef.current = true;
    gameStateRef.current = null;
    setShowHistory(false);
    setGameState(null);
    window.location.reload();
  };

  const handleSelectVersion = (version: GameVersion) => {
    setCurrentVersion(version);
  };

  const handleAdvanceToVision = () => {
    if (!gameState) return;
    let currentDeck = [...gameState.deckClues];
    let currentDiscard = [...(gameState.discardClues ?? [])];
    let nextMediumHand = [...gameState.mediumHand];
    let nextGhostHand = [...gameState.ghostHand];

    if (currentDeck.length === 0 && currentDiscard.length > 0) {
      currentDeck = shuffleArray(currentDiscard);
      currentDiscard = [];
    }

    if (nextMediumHand.length === 0) {
      const res = drawClueCards(currentDeck, currentDiscard, 2);
      nextMediumHand = res.drawn;
      currentDeck = res.nextDeck;
      currentDiscard = res.nextDiscard;
    }

    if (gameState.mode === 'standard' && nextGhostHand.length === 0) {
      const res = drawClueCards(currentDeck, currentDiscard, 5);
      nextGhostHand = res.drawn;
      currentDeck = res.nextDeck;
      currentDiscard = res.nextDiscard;
    }

    const activeRoomIds = new Set(gameState.rooms.filter((r) => r.status === 'active').map((r) => r.id));
    const currentHideout =
      gameState.currentHideout ||
      gameState.hideoutCards.find((h) => activeRoomIds.has(h.roomId)) ||
      gameState.hideoutCards[0] ||
      null;

    setGameState({
      ...gameState,
      deckClues: currentDeck,
      discardClues: currentDiscard,
      mediumHand: nextMediumHand,
      ghostHand: nextGhostHand,
      currentHideout,
      chosenClues: [],
      duoSpiritClue: null,
      visionStep: 'medium_privacy',
      ghostChosenClue: null,
      ghostChosenClues: [],
      ghostIllusionActive: false,
      huntProgress: null,
      phase: 'vision',
    });
  };

  const handleReplenishHands = () => {
    if (!gameState) return;
    let currentDeck = [...gameState.deckClues];
    let currentDiscard = [...(gameState.discardClues ?? [])];

    if (currentDeck.length === 0 && currentDiscard.length === 0) {
      const inPlayIds = new Set(
        [
          ...gameState.mediumHand,
          ...gameState.ghostHand,
          ...gameState.chosenClues,
          ...gameState.revealedClues,
        ].map((c) => c.id)
      );
      const { clues } = getFilteredGameData(gameState.packConfig);
      currentDeck = shuffleArray(clues.filter((c) => !inPlayIds.has(c.id)));
    }

    let nextMediumHand = [...gameState.mediumHand];
    if (nextMediumHand.length === 0) {
      const res = drawClueCards(currentDeck, currentDiscard, 2);
      nextMediumHand = res.drawn;
      currentDeck = res.nextDeck;
      currentDiscard = res.nextDiscard;
    }

    let nextGhostHand = [...gameState.ghostHand];
    if (gameState.mode === 'standard' && nextGhostHand.length === 0) {
      const res = drawClueCards(currentDeck, currentDiscard, 5);
      nextGhostHand = res.drawn;
      currentDeck = res.nextDeck;
      currentDiscard = res.nextDiscard;
    }

    setGameState({
      ...gameState,
      deckClues: currentDeck,
      discardClues: currentDiscard,
      mediumHand: nextMediumHand,
      ghostHand: nextGhostHand,
    });
  };

  const handleMediumInsight = () => {
    setGameState((prev) => {
      if (!prev || prev.mediumInsightUsed || !prev.modifiers?.mediumInsightEnabled) return prev;
      const res = drawClueCards(prev.deckClues, prev.discardClues ?? [], 2);
      return {
        ...prev,
        mediumHand: [...prev.mediumHand, ...res.drawn],
        deckClues: res.nextDeck,
        discardClues: res.nextDiscard,
        mediumInsightUsed: true,
      };
    });
  };

  const handleOccultTrance = (discardIds: string[]) => {
    setGameState((prev) => {
      if (
        !prev ||
        prev.occultTranceUsed ||
        !prev.modifiers?.enableWingCurses ||
        !prev.activeWingIds?.includes('pack-occult') ||
        discardIds.length === 0 ||
        discardIds.length > 3
      ) {
        return prev;
      }

      const discardSet = new Set(discardIds);
      const discardedCards = prev.mediumHand.filter((c) => discardSet.has(c.id));
      if (discardedCards.length === 0) return prev;

      const remainingHand = prev.mediumHand.filter((c) => !discardSet.has(c.id));
      let nextDeck = [...prev.deckClues];
      let nextDiscard = [...(prev.discardClues ?? []), ...discardedCards];

      const mediumDraw = drawClueCards(nextDeck, nextDiscard, discardedCards.length);
      const nextMediumHand = [...remainingHand, ...mediumDraw.drawn];
      nextDeck = mediumDraw.nextDeck;
      nextDiscard = mediumDraw.nextDiscard;

      let nextGhostHand = [...prev.ghostHand];
      if (prev.mode === 'standard') {
        const ghostDraw = drawClueCards(nextDeck, nextDiscard, 1);
        nextGhostHand = [...nextGhostHand, ...ghostDraw.drawn];
        nextDeck = ghostDraw.nextDeck;
        nextDiscard = ghostDraw.nextDiscard;
      }

      return {
        ...prev,
        mediumHand: nextMediumHand,
        ghostHand: nextGhostHand,
        deckClues: nextDeck,
        discardClues: nextDiscard,
        chosenClues: [],
        occultTranceUsed: true,
      };
    });
  };

  const handleUpdateVisionProgress = (updates: {
    visionStep?: VisionStep;
    chosenClues?: ClueCard[];
    ghostChosenClue?: ClueCard | null;
    ghostChosenClues?: ClueCard[];
    ghostIllusionActive?: boolean;
  }) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const syncedSingle =
        updates.ghostChosenClues !== undefined
          ? updates.ghostChosenClues[0] ?? null
          : updates.ghostChosenClue !== undefined
          ? updates.ghostChosenClue
          : prev.ghostChosenClue;
      return {
        ...prev,
        ...updates,
        ghostChosenClue: syncedSingle,
      };
    });
  };

  const handleCompleteVision = (
    chosenClues: ClueCard[],
    revealedClues: ClueCard[],
    hideout: HideoutCard,
    extraClues: ClueCard[],
    usedIllusion = false
  ) => {
    if (!gameState) return;
    let initialDuration = 120;
    if (gameState.modifiers?.blitzTimer) {
      initialDuration = Math.max(30, 60 - gameState.lostCount * 10);
    } else {
      try {
        const savedDur = Number(localStorage.getItem('medium_mansion_timer_duration_v1'));
        if (savedDur === 60 || savedDur === 120 || savedDur === 180) {
          initialDuration = savedDur;
        }
      } catch {}
    }

    if (gameState.medicalFeverPending) {
      initialDuration = Math.max(30, initialDuration - 30);
    }

    const now = Date.now();
    setGameState({
      ...gameState,
      chosenClues,
      revealedClues,
      currentHideout: hideout,
      visionStep: undefined,
      ghostChosenClue: gameState.mode === 'standard' ? extraClues[0] ?? null : null,
      ghostChosenClues: gameState.mode === 'standard' ? extraClues : [],
      duoSpiritClue: gameState.mode === 'duo' ? extraClues[0] ?? null : null,
      ghostIllusionUsed: gameState.ghostIllusionUsed || usedIllusion,
      ghostIllusionActive: false,
      medicalFeverPending: false,
      roundEventBanner: null,
      huntProgress: {
        selectedRoomId: null,
        timerSeconds: initialDuration,
        timerRunning: true,
        timerLastTickAt: now,
        timerEndsAt: now + initialDuration * 1000,
        resultRevealed: false,
        lastResultCorrect: null,
      },
      phase: 'hunt',
    });
  };

  const handleUpdateHuntProgress = useCallback((huntProgress: HuntProgress) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        huntProgress,
      };
    });
  }, []);

  const handleResolveHunt = (guessedRoomId: string, isCorrect: boolean) => {
    if (!gameState) return;

    const hideoutRoomId = gameState.currentHideout?.roomId || guessedRoomId;
    const hideoutRoom = gameState.rooms.find((r) => r.id === hideoutRoomId);

    let updatedRooms = gameState.rooms.map((room) => {
      if (room.id === hideoutRoomId) {
        return {
          ...room,
          status: isCorrect ? ('sealed' as const) : ('lost' as const),
        };
      }
      return room;
    });

    const remainingHideouts = gameState.hideoutCards.filter((h) => h.id !== gameState.currentHideout?.id);

    const newSealedCount = isCorrect ? gameState.sealedCount + 1 : gameState.sealedCount;
    const newLostCount = !isCorrect ? gameState.lostCount + 1 : gameState.lostCount;
    const targetSealed = gameState.targetSealedCount || 5;

    let winner: GameState['winner'] = null;
    if (gameState.mode === 'duo') {
      if (newSealedCount >= targetSealed) {
        winner = 'hunters';
      } else {
        const remainingActive = updatedRooms.filter((r) => r.status === 'active').length;
        if (newSealedCount + remainingActive < targetSealed) {
          winner = 'duo_lost';
        }
      }
    } else {
      if (newSealedCount >= 5) winner = 'hunters';
      if (newLostCount >= 5) winner = 'ghost';
    }

    // Resolve Wing Curses when game continues
    let nextMedicalFever = false;
    let nextFoggedRoomId = gameState.foggedRoomId ?? null;
    let nextBanner: RoundEventBanner | null = null;

    if (!winner && gameState.modifiers?.enableWingCurses) {
      const remainingActiveRooms = updatedRooms.filter((r) => r.status === 'active');

      // Medical Wing: Fever reduces next round's Hunt timer by 30s if a medical room is lost
      if (!isCorrect && hideoutRoom?.packId === 'pack-medical') {
        nextMedicalFever = true;
        nextBanner = { type: 'fever' };
      }

      // Forgotten Wing: Poltergeist swaps artifacts between 2 random active rooms on failed Hunt
      if (!isCorrect && gameState.activeWingIds?.includes('pack-forgotten') && remainingActiveRooms.length >= 2) {
        const pair = shuffleArray(remainingActiveRooms).slice(0, 2);
        const [roomA, roomB] = pair;
        updatedRooms = updatedRooms.map((r) => {
          if (r.id === roomA.id) return { ...r, artifactId: roomB.artifactId };
          if (r.id === roomB.id) return { ...r, artifactId: roomA.artifactId };
          return r;
        });

        const sideA = getRoomSide(roomA, gameState.difficulty);
        const sideB = getRoomSide(roomB, gameState.difficulty);
        const nameARu = ROOM_TRANSLATIONS[roomA.id]?.ru[sideA] || (sideA === 'silver' ? roomA.nameSilver : roomA.nameGold);
        const nameBRu = ROOM_TRANSLATIONS[roomB.id]?.ru[sideB] || (sideB === 'silver' ? roomB.nameSilver : roomB.nameGold);
        const nameAEn = ROOM_TRANSLATIONS[roomA.id]?.en[sideA] || (sideA === 'silver' ? roomA.nameSilver : roomA.nameGold);
        const nameBEn = ROOM_TRANSLATIONS[roomB.id]?.en[sideB] || (sideB === 'silver' ? roomB.nameSilver : roomB.nameGold);

        nextBanner = {
          type: 'poltergeist',
          roomNamesRu: [nameARu, nameBRu],
          roomNamesEn: [nameAEn, nameBEn],
        };
      }

      // Grounds Wing: Clear fog after round 3, when <= 5 active rooms remain, or if fogged room resolved
      if (nextFoggedRoomId) {
        const foggedStillActive = updatedRooms.some((r) => r.id === nextFoggedRoomId && r.status === 'active');
        if (!foggedStillActive || gameState.currentRound + 1 >= 4 || remainingActiveRooms.length <= 5) {
          nextFoggedRoomId = null;
          if (!nextBanner && foggedStillActive) {
            nextBanner = { type: 'fog_cleared' };
          }
        }
      }
    }

    const extraCluesList =
      gameState.mode === 'duo'
        ? gameState.duoSpiritClue
          ? [gameState.duoSpiritClue]
          : []
        : gameState.ghostChosenClues && gameState.ghostChosenClues.length > 0
        ? gameState.ghostChosenClues
        : gameState.ghostChosenClue
        ? [gameState.ghostChosenClue]
        : [];

    const historyEntry: RoundHistoryEntry = {
      round: gameState.currentRound,
      mediumClues: gameState.chosenClues,
      extraClue: extraCluesList[0] ?? null,
      extraClues: extraCluesList,
      revealedClues: gameState.revealedClues,
      targetRoomId: hideoutRoomId,
      guessedRoomId,
      isCorrect,
    };

    setGameState({
      ...gameState,
      rooms: updatedRooms,
      hideoutCards: remainingHideouts,
      roundHistory: [...(gameState.roundHistory ?? []), historyEntry],
      sealedCount: newSealedCount,
      lostCount: newLostCount,
      winner,
      huntProgress: null,
      ghostChosenClue: null,
      ghostChosenClues: [],
      ghostIllusionActive: false,
      duoSpiritClue: null,
      medicalFeverPending: nextMedicalFever,
      foggedRoomId: nextFoggedRoomId,
      roundEventBanner: nextBanner,
      phase: winner ? 'gameover' : 'respite',
    });
  };

  const handleCompleteRespite = () => {
    if (!gameState) return;

    const usedIds = new Set(gameState.revealedClues.map((c) => c.id));
    const newMediumHand = gameState.mediumHand.filter((c) => !usedIds.has(c.id));
    const newGhostHand = gameState.ghostHand.filter((c) => !usedIds.has(c.id));

    let currentDeck = gameState.deckClues.filter((c) => !usedIds.has(c.id));
    const cleanedDiscard = (gameState.discardClues ?? []).filter((c) => !usedIds.has(c.id));
    const existingDiscardIds = new Set(cleanedDiscard.map((c) => c.id));
    const newlyDiscarded = gameState.revealedClues.filter((c) => !existingDiscardIds.has(c.id));
    let currentDiscard = [...cleanedDiscard, ...newlyDiscarded];

    const mediumDraw = drawClueCards(currentDeck, currentDiscard, 2);
    const nextMediumHand = [...newMediumHand, ...mediumDraw.drawn];
    currentDeck = mediumDraw.nextDeck;
    currentDiscard = mediumDraw.nextDiscard;

    let nextGhostHand = newGhostHand;
    if (gameState.mode === 'standard') {
      const ghostNeeded = Math.max(0, 5 - newGhostHand.length);
      if (ghostNeeded > 0) {
        const ghostDraw = drawClueCards(currentDeck, currentDiscard, ghostNeeded);
        nextGhostHand = [...newGhostHand, ...ghostDraw.drawn];
        currentDeck = ghostDraw.nextDeck;
        currentDiscard = ghostDraw.nextDiscard;
      }
    }

    setGameState({
      ...gameState,
      currentRound: gameState.currentRound + 1,
      mediumHand: nextMediumHand,
      ghostHand: nextGhostHand,
      deckClues: currentDeck,
      discardClues: currentDiscard,
      chosenClues: [],
      revealedClues: [],
      duoSpiritClue: null,
      currentHideout: null,
      visionStep: undefined,
      ghostChosenClue: null,
      ghostChosenClues: [],
      ghostIllusionActive: false,
      huntProgress: null,
      phase: 'setup',
    });
  };

  const currentThemeClasses = getThemeClasses(themeMode, uiStyle);

  return (
    <ThemeContext.Provider value={{ themeMode, uiStyle, themeClasses: currentThemeClasses }}>
      <div className={`min-h-dvh flex flex-col selection:bg-amber-900 selection:text-amber-100 ${currentThemeClasses.bgApp}`}>
        <Header
          currentVersion={currentVersion}
          showHomeButton={gameState !== null}
          gameState={gameState}
          onOpenRules={() => setShowRules(true)}
          onOpenHistory={() => setShowHistory(true)}
          onGoHome={handleGoHome}
          onClearCache={handleClearCache}
          lang={lang}
          onToggleLang={handleToggleLang}
          themeMode={themeMode}
          onUpdateThemeMode={setThemeMode}
          uiStyle={uiStyle}
          onUpdateUiStyle={setUiStyle}
        />

        <main className="flex-1 safe-bottom">
          {!gameState ? (
            <GameSetup
              currentVersion={currentVersion}
              onSelectVersion={handleSelectVersion}
              onStartGame={handleStartGame}
              lang={lang}
              packConfig={packConfig}
              onUpdatePackConfig={setPackConfig}
            />
          ) : gameState.phase === 'setup' ? (
            <GameBoard
              state={gameState}
              onAdvancePhase={handleAdvanceToVision}
              onOpenRules={() => setShowRules(true)}
              onOpenHistory={() => setShowHistory(true)}
              lang={lang}
            />
          ) : gameState.phase === 'vision' ? (
            <VisionPhase
              state={gameState}
              onCompleteVision={handleCompleteVision}
              onUpdateProgress={handleUpdateVisionProgress}
              onReplenishHands={handleReplenishHands}
              onMediumInsight={handleMediumInsight}
              onOccultTrance={handleOccultTrance}
              lang={lang}
            />
          ) : gameState.phase === 'hunt' ? (
            <HuntPhase
              state={gameState}
              onResolveHunt={handleResolveHunt}
              onUpdateProgress={handleUpdateHuntProgress}
              lang={lang}
            />
          ) : gameState.phase === 'respite' ? (
            <RespitePhase
              state={gameState}
              onCompleteRespite={handleCompleteRespite}
              onOpenHistory={() => setShowHistory(true)}
              lang={lang}
            />
          ) : gameState.phase === 'gameover' ? (
            <>
              <GameBoard
                state={gameState}
                onAdvancePhase={() => {}}
                onOpenRules={() => setShowRules(true)}
                onOpenHistory={() => setShowHistory(true)}
                lang={lang}
              />
              <GameOverModal
                state={gameState}
                onRestart={handleResetGame}
                onOpenHistory={() => setShowHistory(true)}
                lang={lang}
              />
            </>
          ) : null}
        </main>

        {showRules && <RulebookModal onClose={() => setShowRules(false)} lang={lang} />}
        {showHistory && gameState && (
          <RoundHistoryModal state={gameState} onClose={() => setShowHistory(false)} lang={lang} />
        )}
        <OfflineIndicator lang={lang} />
      </div>
    </ThemeContext.Provider>
  );
}
