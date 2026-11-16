import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  BookOpen,
  Home,
  Settings,
  Trash2,
  Globe,
  AlertTriangle,
  Moon,
  Sun,
  Palette,
  Vibrate,
  History,
  ShieldCheck,
  Skull,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { haptics } from '../utils/haptics';
import { GameVersion, GameState } from '../types/game';
import { EXPANSIONS } from '../data/mansionData';
import { Language, translations, EXPANSION_TRANSLATIONS } from '../utils/i18n';
import { useTheme } from '../utils/themeContext';
import { useModalEffects } from '../hooks/useModalEffects';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentVersion: GameVersion;
  showHomeButton: boolean;
  gameState: GameState | null;
  onOpenRules: () => void;
  onOpenHistory: () => void;
  onGoHome: () => void;
  onClearCache: () => void;
  lang: Language;
  onToggleLang: () => void;
  themeMode: 'dark' | 'light';
  onUpdateThemeMode: (mode: 'dark' | 'light') => void;
  uiStyle: 'atmospheric' | 'minimalist' | 'classic';
  onUpdateUiStyle: (style: 'atmospheric' | 'minimalist' | 'classic') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentVersion,
  showHomeButton,
  gameState,
  onOpenRules,
  onOpenHistory,
  onGoHome,
  onClearCache,
  lang,
  onToggleLang,
  themeMode,
  onUpdateThemeMode,
  uiStyle,
  onUpdateUiStyle,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [isAmbientOn, setIsAmbientOn] = useState(soundManager.isAmbientActive());
  const [isHapticsOn, setIsHapticsOn] = useState(haptics.isEnabled());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHomeConfirmModal, setShowHomeConfirmModal] = useState(false);
  const [showCacheConfirmModal, setShowCacheConfirmModal] = useState(false);

  const t = translations[lang];
  const { themeClasses } = useTheme();
  const isLight = themeMode === 'light';
  const currentExp = EXPANSIONS.find((e) => e.id === currentVersion) || EXPANSIONS[0];
  const currentExpTitle = EXPANSION_TRANSLATIONS[currentExp.id]?.[lang]?.title || currentExp.title;

  useEffect(() => {
    return soundManager.onAmbientChange((playing) => {
      setIsAmbientOn(playing);
    });
  }, []);

  useModalEffects(showSettingsModal, () => setShowSettingsModal(false));
  useModalEffects(showHomeConfirmModal, () => setShowHomeConfirmModal(false));
  useModalEffects(showCacheConfirmModal, () => setShowCacheConfirmModal(false));

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleAmbient = () => {
    soundManager.playClick();
    soundManager.toggleAmbient();
  };

  const handleToggleHaptics = () => {
    const enabled = haptics.toggle();
    setIsHapticsOn(enabled);
    soundManager.playClick(true);
  };

  const targetSealed = gameState?.targetSealedCount || 5;
  const maxAllowedLost = gameState?.mode === 'duo' ? 11 - targetSealed : 5;
  const hasHistory = (gameState?.roundHistory?.length ?? 0) > 0;

  return (
    <>
      <header
        className={`backdrop-blur-md border-b px-3 sm:px-4 py-2.5 sm:py-3 sticky top-0 z-40 flex items-center justify-between gap-2 shadow-lg safe-top ${
          isLight
            ? 'bg-amber-50/90 border-amber-300/80 text-stone-900'
            : 'bg-stone-950/90 border-amber-900/40 text-amber-100'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showHomeButton && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowHomeConfirmModal(true);
              }}
              className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl border flex items-center justify-center transition-colors shadow-inner ${
                isLight
                  ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
                  : 'bg-amber-950/60 border-amber-800/60 text-amber-200 hover:bg-amber-900/60'
              }`}
              title={t.homeConfirmTitle}
              aria-label={t.homeConfirmTitle}
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className={`text-sm sm:text-base font-serif font-bold tracking-wide shrink-0 ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
              {t.appName}
            </h1>
            {gameState ? (
              <div
                className={`flex items-center gap-2 text-[11px] font-mono px-2 py-0.5 rounded-lg border truncate ${
                  isLight ? 'bg-amber-100/90 border-amber-300 text-stone-800' : 'bg-stone-900/90 border-amber-800/50 text-amber-200'
                }`}
              >
                <span className="font-serif font-bold">R{gameState.currentRound}</span>
                <span className="inline-flex items-center gap-0.5 text-emerald-500 font-bold tabular-nums">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {gameState.sealedCount}/{targetSealed}
                </span>
                <span className="inline-flex items-center gap-0.5 text-red-500 font-bold tabular-nums">
                  <Skull className="w-3.5 h-3.5" />
                  {gameState.lostCount}/{maxAllowedLost}
                </span>
              </div>
            ) : (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-serif uppercase border truncate ${
                  isLight
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-amber-900/50 text-amber-300 border-amber-700/40'
                }`}
              >
                {currentExpTitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {gameState && hasHistory && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenHistory();
              }}
              className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition-colors flex items-center justify-center gap-1.5 shadow-md text-xs font-serif font-bold ${
                isLight
                  ? 'bg-amber-100 border-amber-300 hover:border-amber-500 text-amber-900'
                  : 'bg-amber-950/80 border-amber-700/60 hover:border-amber-500 text-amber-200'
              }`}
              title={t.roundHistoryTitle}
              aria-label={t.roundHistoryTitle}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">{t.roundHistoryButton}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setShowSettingsModal(true);
            }}
            className={`p-2 sm:p-2.5 rounded-xl border transition-colors flex items-center justify-center shadow-md ${
              isLight
                ? 'bg-amber-100 border-amber-300 hover:border-amber-500 text-amber-900'
                : 'bg-amber-950/80 border-amber-700/60 hover:border-amber-500 text-amber-200'
            }`}
            title={t.settings}
            aria-label={t.settings}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Home Confirmation Modal */}
      {showHomeConfirmModal && (
        <div role="dialog" aria-modal="true" aria-label={t.homeConfirmTitle} className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className={`max-w-md w-full ${themeClasses.bgPanel} p-6 shadow-2xl text-center relative space-y-4`}>
            <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto ${
              isLight ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-amber-950 border-amber-700 text-amber-400'
            }`}>
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className={`text-xl font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>{t.homeConfirmTitle}</h3>
            <p className={`text-xs sm:text-sm font-sans leading-relaxed ${isLight ? 'text-stone-600' : 'text-stone-300'}`}>
              {t.homeConfirmText}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowHomeConfirmModal(false);
                }}
                className={`flex-1 py-3 font-serif font-bold rounded-xl transition-colors border text-sm ${
                  isLight ? 'bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300' : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                }`}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowHomeConfirmModal(false);
                  onGoHome();
                }}
                className={`flex-1 py-3 font-serif font-bold rounded-xl transition-colors shadow-md text-sm ${themeClasses.buttonPrimary}`}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cache Clear Confirmation Modal */}
      {showCacheConfirmModal && (
        <div role="dialog" aria-modal="true" aria-label={t.clearCache} className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className={`max-w-md w-full ${themeClasses.bgPanel} border-red-800/60 p-6 shadow-2xl text-center relative space-y-4`}>
            <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto ${
              isLight ? 'bg-red-100 border-red-300 text-red-700' : 'bg-red-950 border-red-700 text-red-400'
            }`}>
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className={`text-xl font-serif font-bold ${isLight ? 'text-red-900' : 'text-red-100'}`}>{t.clearCache}</h3>
            <p className={`text-xs sm:text-sm font-sans leading-relaxed ${isLight ? 'text-stone-600' : 'text-stone-300'}`}>
              {t.cachePrompt}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowCacheConfirmModal(false);
                }}
                className={`flex-1 py-3 font-serif font-bold rounded-xl transition-colors border text-sm ${
                  isLight ? 'bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300' : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                }`}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowCacheConfirmModal(false);
                  onClearCache();
                }}
                className="flex-1 py-3 bg-red-700 hover:bg-red-600 text-white font-serif font-bold rounded-xl transition-colors shadow-md text-sm"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Settings Modal */}
      {showSettingsModal && (
        <div role="dialog" aria-modal="true" aria-label={t.settings} className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className={`max-w-md w-full ${themeClasses.bgPanel} p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-stone-300' : 'border-amber-900/40'}`}>
              <div className="flex items-center gap-2">
                <Settings className={`w-5 h-5 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                <h3 className={`text-lg font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>{t.settings}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowSettingsModal(false);
                }}
                aria-label={t.close}
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${isLight ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onToggleLang();
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-sm font-serif transition-colors ${
                  isLight
                    ? 'bg-stone-50 border-stone-300 hover:border-amber-600 text-stone-800'
                    : 'bg-stone-950/60 border-stone-800 hover:border-amber-700/60 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4" />
                  <span>{t.language}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold uppercase ${
                  isLight
                    ? 'bg-amber-100 border-amber-400 text-amber-900'
                    : 'bg-amber-950 border-amber-700 text-amber-200'
                }`}>
                  {lang === 'ru' ? 'Русский (RU)' : 'English (EN)'}
                </span>
              </button>

              {/* Design Settings: Dark / Light Mode */}
              <div>
                <label className={`block text-xs font-serif uppercase tracking-wider mb-2 flex items-center gap-2 ${themeClasses.accentText}`}>
                  <Palette className="w-3.5 h-3.5" />
                  <span>{t.designSettings}</span>
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onUpdateThemeMode('dark');
                    }}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-serif font-bold transition-all ${
                      themeMode === 'dark'
                        ? isLight
                          ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-sm ring-1 ring-amber-600'
                          : 'bg-amber-900/80 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500'
                        : isLight
                        ? 'bg-stone-50 border-stone-300 text-stone-600 hover:text-stone-900'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{t.darkMode}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onUpdateThemeMode('light');
                    }}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-serif font-bold transition-all ${
                      themeMode === 'light'
                        ? isLight
                          ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-sm ring-1 ring-amber-600'
                          : 'bg-amber-900/80 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500'
                        : isLight
                        ? 'bg-stone-50 border-stone-300 text-stone-600 hover:text-stone-900'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>{t.lightMode}</span>
                  </button>
                </div>

                {/* UI Style variants */}
                <div className="space-y-1.5">
                  <div className={`text-[11px] font-serif uppercase tracking-wider mb-1 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    {t.uiStyle}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['atmospheric', 'minimalist', 'classic'] as const).map((styleKey) => {
                      const label =
                        styleKey === 'atmospheric'
                          ? t.styleAtmospheric
                          : styleKey === 'minimalist'
                          ? t.styleMinimalist
                          : t.styleClassic;
                      const isActive = uiStyle === styleKey;
                      return (
                        <button
                          key={styleKey}
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            onUpdateUiStyle(styleKey);
                          }}
                          className={`py-2 px-2 rounded-lg border text-[11px] font-serif font-bold transition-all truncate ${
                            isActive
                              ? isLight
                                ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-sm'
                                : 'bg-amber-950 border-amber-500 text-amber-200 shadow-sm'
                              : isLight
                              ? 'bg-stone-50 border-stone-300 text-stone-600 hover:text-stone-900'
                              : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rules button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowSettingsModal(false);
                  onOpenRules();
                }}
                className={`w-full p-3 rounded-xl border flex items-center gap-2.5 text-sm font-serif transition-colors ${
                  isLight
                    ? 'bg-stone-50 border-stone-300 hover:border-amber-600 text-stone-800'
                    : 'bg-stone-950/60 border-stone-800 hover:border-amber-700/60 text-amber-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.rules}</span>
              </button>

              {/* Ambient Music Toggle */}
              <button
                type="button"
                onClick={handleToggleAmbient}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-sm font-serif transition-colors ${
                  isLight
                    ? 'bg-stone-50 border-stone-300 hover:border-amber-600 text-stone-800'
                    : 'bg-stone-950/60 border-stone-800 hover:border-amber-700/60 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Music className="w-4 h-4" />
                  <span>{t.ambientSound}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-white border-stone-300 text-stone-700'
                    : 'bg-stone-900 border-stone-800 text-stone-300'
                }`}>
                  {isAmbientOn ? t.on : t.off}
                </span>
              </button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={handleToggleMute}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-sm font-serif transition-colors ${
                  isLight
                    ? 'bg-stone-50 border-stone-300 hover:border-amber-600 text-stone-800'
                    : 'bg-stone-950/60 border-stone-800 hover:border-amber-700/60 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4" />}
                  <span>{t.soundEffects}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-white border-stone-300 text-stone-700'
                    : 'bg-stone-900 border-stone-800 text-stone-300'
                }`}>
                  {isMuted ? t.off : t.on}
                </span>
              </button>

              {/* Haptic Feedback Toggle */}
              <button
                type="button"
                onClick={handleToggleHaptics}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-sm font-serif transition-colors ${
                  isLight
                    ? 'bg-stone-50 border-stone-300 hover:border-amber-600 text-stone-800'
                    : 'bg-stone-950/60 border-stone-800 hover:border-amber-700/60 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Vibrate className={`w-4 h-4 ${!isHapticsOn ? 'text-stone-500' : ''}`} />
                  <span>{t.hapticFeedback}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-white border-stone-300 text-stone-700'
                    : 'bg-stone-900 border-stone-800 text-stone-300'
                }`}>
                  {isHapticsOn ? t.on : t.off}
                </span>
              </button>

              <PWAInstallButton lang={lang} />
            </div>

            {/* Clear Cache Button */}
            <div className={`pt-3 border-t ${isLight ? 'border-stone-300' : 'border-amber-900/40'}`}>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowSettingsModal(false);
                  setShowCacheConfirmModal(true);
                }}
                className={`w-full py-3 px-4 border font-serif text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-inner ${
                  isLight
                    ? 'bg-red-50 hover:bg-red-100 border-red-300 text-red-800'
                    : 'bg-red-950/60 hover:bg-red-900/60 border-red-800/80 text-red-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.clearCache}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
