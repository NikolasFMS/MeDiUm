import React, { useState } from 'react';
import { X, BookOpen, Compass, Shield, Users, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { Language, translations } from '../utils/i18n';
import { useTheme } from '../utils/themeContext';
import { useModalEffects } from '../hooks/useModalEffects';

interface RulebookModalProps {
  onClose: () => void;
  lang: Language;
}

export const RulebookModal: React.FC<RulebookModalProps> = ({ onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'components' | 'tips' | 'duo'>('rules');
  const t = translations[lang];
  const { themeClasses, themeMode } = useTheme();
  const isLight = themeMode === 'light';

  useModalEffects(true, onClose);

  const handleTabChange = (tab: 'rules' | 'components' | 'tips' | 'duo') => {
    soundManager.playClick();
    setActiveTab(tab);
  };

  const tabClass = (isActive: boolean) =>
    `px-4 py-2.5 text-xs sm:text-sm font-serif border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
      isActive
        ? isLight
          ? 'border-amber-700 text-amber-950 bg-amber-200/70 rounded-t-lg font-bold'
          : 'border-amber-500 text-amber-400 bg-amber-950/35 rounded-t-lg font-bold'
        : isLight
        ? 'border-transparent text-stone-600 hover:text-stone-900 font-medium'
        : 'border-transparent text-stone-400 hover:text-stone-200 font-medium'
    }`;

  return (
    <div role="dialog" aria-modal="true" aria-label={t.rulebookTitle} className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className={`max-w-2xl w-full ${themeClasses.bgPanel} shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative`}>
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between ${isLight ? 'bg-amber-100/60 border-amber-300' : 'bg-stone-950/60 border-amber-900/40'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isLight ? 'bg-amber-200 border-amber-400 text-amber-800' : 'bg-amber-950 border-amber-700/50 text-amber-400'}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-serif font-bold ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>{t.rulebookTitle}</h2>
              <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{t.rulebookSubtitle}</p>
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

        {/* Navigation Tabs */}
        <div className={`flex border-b px-4 pt-2 gap-2 overflow-x-auto ${isLight ? 'bg-amber-50 border-stone-300' : 'bg-stone-950/40 border-stone-800'}`}>
          <button type="button" onClick={() => handleTabChange('rules')} className={tabClass(activeTab === 'rules')}>
            <Compass className="w-4 h-4" />
            <span>{t.tabRules}</span>
          </button>
          <button type="button" onClick={() => handleTabChange('components')} className={tabClass(activeTab === 'components')}>
            <Shield className="w-4 h-4" />
            <span>{t.tabComponents}</span>
          </button>
          <button type="button" onClick={() => handleTabChange('duo')} className={tabClass(activeTab === 'duo')}>
            <Users className="w-4 h-4" />
            <span>{t.tabDuo}</span>
          </button>
          <button type="button" onClick={() => handleTabChange('tips')} className={tabClass(activeTab === 'tips')}>
            <HelpCircle className="w-4 h-4" />
            <span>{t.tabTips}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className={`p-5 sm:p-6 overflow-y-auto space-y-4 text-sm font-sans leading-relaxed ${isLight ? 'text-stone-800' : 'text-stone-300'}`}>
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className={`border rounded-xl p-4 ${isLight ? 'bg-amber-100/60 border-amber-300 text-stone-900' : 'bg-amber-950/30 border-amber-800/40 text-stone-200'}`}>
                <h3 className={`text-base font-serif font-bold mb-2 ${themeClasses.accentText}`}>{t.goalTitle}</h3>
                <p className="text-xs sm:text-sm">{t.goalDesc}</p>
              </div>

              <div>
                <h4 className={`font-serif font-bold text-base mb-1 ${themeClasses.accentText}`}>{t.phase1Title}</h4>
                <p className="text-xs sm:text-sm">{t.phase1Desc}</p>
              </div>

              <div>
                <h4 className={`font-serif font-bold text-base mb-1 ${themeClasses.accentText}`}>{t.phase2Title}</h4>
                <p className="text-xs sm:text-sm">{t.phase2Desc}</p>
              </div>

              <div>
                <h4 className={`font-serif font-bold text-base mb-1 ${themeClasses.accentText}`}>{t.phase3Title}</h4>
                <p className="text-xs sm:text-sm">{t.phase3Desc}</p>
              </div>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="space-y-3">
              <h3 className={`text-base font-serif font-bold mb-2 ${themeClasses.accentText}`}>{t.componentsTitle}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-stone-950/60 border-stone-800 text-stone-300'}`}>
                  <span className={`font-bold text-xs uppercase block mb-1 ${themeClasses.accentText}`}>{t.comp1Title}</span>
                  <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{t.comp1Desc}</p>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-stone-950/60 border-stone-800 text-stone-300'}`}>
                  <span className={`font-bold text-xs uppercase block mb-1 ${themeClasses.accentText}`}>{t.comp2Title}</span>
                  <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{t.comp2Desc}</p>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-stone-950/60 border-stone-800 text-stone-300'}`}>
                  <span className={`font-bold text-xs uppercase block mb-1 ${themeClasses.accentText}`}>{t.comp3Title}</span>
                  <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{t.comp3Desc}</p>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-stone-950/60 border-stone-800 text-stone-300'}`}>
                  <span className={`font-bold text-xs uppercase block mb-1 ${themeClasses.accentText}`}>{t.comp4Title}</span>
                  <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{t.comp4Desc}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'duo' && (
            <div className="space-y-3">
              <h3 className={`text-base font-serif font-bold mb-2 ${themeClasses.accentText}`}>{t.duoTitle}</h3>
              <p className="text-xs sm:text-sm">{t.duoText}</p>
              <div className={`border rounded-xl p-4 text-xs sm:text-sm ${isLight ? 'bg-amber-100/60 border-amber-300 text-amber-950 font-bold' : 'bg-amber-950/30 border-amber-800/40 text-amber-200'}`}>
                {t.duoBox}
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3">
              <h3 className={`text-base font-serif font-bold mb-2 ${themeClasses.accentText}`}>{t.tipsTitle}</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{t.tip1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{t.tip2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{t.tip3}</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${isLight ? 'bg-amber-100/60 border-amber-300' : 'bg-stone-950/60 border-amber-900/40'}`}>
          <button
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
