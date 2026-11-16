import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language, translations } from '../utils/i18n';
import { useTheme } from '../utils/themeContext';
import { soundManager } from '../utils/audio';
import { useModalEffects } from '../hooks/useModalEffects';

interface PWAInstallButtonProps {
  lang: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const t = translations[lang];
  const { themeClasses, themeMode } = useTheme();
  const isLight = themeMode === 'light';

  useModalEffects(showIOSGuide, () => setShowIOSGuide(false));

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          install();
        }}
        className={`w-full p-3 rounded-xl border flex items-center justify-between text-sm font-serif transition-colors ${
          isLight
            ? 'bg-amber-100/80 border-amber-400 hover:bg-amber-200/80 text-amber-950'
            : 'bg-amber-950/60 border-amber-700/70 hover:bg-amber-900/60 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Download className="w-4 h-4 shrink-0" />
          <span>{t.installApp}</span>
        </div>
        <span className={`text-[11px] px-2 py-0.5 rounded border font-bold uppercase ${
          isLight ? 'bg-white border-amber-300 text-amber-900' : 'bg-stone-900 border-amber-700 text-amber-300'
        }`}>
          PWA
        </span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setShowIOSGuide(true);
          }}
          className={`w-full p-3 rounded-xl border flex items-center justify-between text-sm font-serif transition-colors ${
            isLight
              ? 'bg-stone-50 border-stone-300 hover:border-amber-600 text-stone-800'
              : 'bg-stone-950/60 border-stone-800 hover:border-amber-700/60 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>{t.installOnIOS}</span>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded border font-bold uppercase ${
            isLight ? 'bg-white border-stone-300 text-stone-700' : 'bg-stone-900 border-stone-700 text-stone-300'
          }`}>
            iOS
          </span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.iosInstallTitle}
            className="fixed inset-0 z-[60] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          >
            <div className={`w-full max-w-sm ${themeClasses.bgPanel} p-6 shadow-2xl space-y-4`}>
              <div className="flex items-center justify-between">
                <h4 className={`text-base font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                  {t.iosInstallTitle}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label={t.close}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isLight ? 'bg-stone-200 text-stone-700' : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className={`text-xs sm:text-sm font-sans space-y-2 list-decimal list-inside ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                <li>{t.iosInstallStep1}</li>
                <li>{t.iosInstallStep2}</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className={`w-full py-2.5 text-sm font-serif font-bold ${themeClasses.buttonPrimary}`}
              >
                {t.close}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
