export type GameVersion = 'mansion' | 'secrets' | 'ancients' | 'space';

export interface ExpansionInfo {
  id: GameVersion;
  title: string;
  subtitle: string;
  description: string;
  available: boolean;
}

export type GameMode = 'standard' | 'duo';
export type RoomDifficulty = 'silver' | 'gold';
export type GamePhase = 'setup' | 'vision' | 'hunt' | 'respite' | 'gameover';
export type VisionStep = 'medium_privacy' | 'medium_select' | 'ghost_privacy' | 'ghost_add';

export interface HuntProgress {
  selectedRoomId: string | null;
  timerSeconds: number;
  timerRunning: boolean;
  timerLastTickAt: number | null;
  timerEndsAt?: number | null;
  resultRevealed: boolean;
  lastResultCorrect: boolean | null;
}

export interface Room {
  id: string;
  packId: string;
  nameSilver: string;
  nameGold: string;
  status: 'active' | 'sealed' | 'lost';
  artifactId: string;
  side?: RoomDifficulty;
}

export interface Artifact {
  id: string;
  packId: string;
  name: string;
  symbol: string;
}

export interface HideoutCard {
  id: string;
  roomId: string;
}

export interface ClueCard {
  id: string;
  packId: string;
  word: string;
}

export interface ThematicPack {
  id: string;
  packType: 'full' | 'words';
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
}

export interface PackConfig {
  selectedPackIds: string[];
  selectedWordPackIds: string[];
  disabledRoomIds: string[];
  disabledArtifactIds: string[];
  guaranteedPackIds?: string[];
}

export interface GameModifiers {
  enableWingCurses: boolean;
  mixedDifficulty: boolean;
  ghostIllusionEnabled: boolean;
  mediumInsightEnabled: boolean;
  blitzTimer: boolean;
}

export interface GameScenario {
  id: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  difficulty: RoomDifficulty;
  packConfig: PackConfig;
  modifiers: GameModifiers;
}

export interface RoundEventBanner {
  type: 'poltergeist' | 'fever' | 'fog_cleared';
  roomNamesRu?: [string, string];
  roomNamesEn?: [string, string];
}

export interface RoundHistoryEntry {
  round: number;
  mediumClues: ClueCard[];
  extraClue: ClueCard | null;
  extraClues?: ClueCard[];
  revealedClues: ClueCard[];
  targetRoomId: string;
  guessedRoomId: string;
  isCorrect: boolean;
}

export interface GameState {
  version: GameVersion;
  mode: GameMode;
  difficulty: RoomDifficulty;
  targetSealedCount: number;
  currentRound: number;
  rooms: Room[];
  artifacts: Artifact[];
  hideoutCards: HideoutCard[];
  deckClues: ClueCard[];
  discardClues: ClueCard[];
  mediumHand: ClueCard[];
  ghostHand: ClueCard[];
  currentHideout: HideoutCard | null;
  chosenClues: ClueCard[];
  revealedClues: ClueCard[];
  duoSpiritClue?: ClueCard | null;
  visionStep?: VisionStep;
  ghostChosenClue?: ClueCard | null;
  ghostChosenClues?: ClueCard[];
  ghostIllusionActive?: boolean;
  huntProgress?: HuntProgress | null;
  roundHistory: RoundHistoryEntry[];
  sealedCount: number;
  lostCount: number;
  winner: 'hunters' | 'ghost' | 'duo_lost' | null;
  phase: GamePhase;
  packConfig: PackConfig;
  modifiers: GameModifiers;
  activeWingIds: string[];
  occultTranceUsed?: boolean;
  mediumInsightUsed?: boolean;
  ghostIllusionUsed?: boolean;
  medicalFeverPending?: boolean;
  foggedRoomId?: string | null;
  roundEventBanner?: RoundEventBanner | null;
}
