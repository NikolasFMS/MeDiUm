import React, { createContext, useContext } from 'react';

export type ThemeMode = 'dark' | 'light';
export type UiStyle = 'atmospheric' | 'minimalist' | 'classic';

export interface ThemeClasses {
  bgApp: string;
  bgPanel: string;
  bgCard: string;
  borderMain: string;
  accentText: string;
  buttonPrimary: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  uiStyle: UiStyle;
  themeClasses: ThemeClasses;
}

export function getThemeClasses(themeMode: ThemeMode, uiStyle: UiStyle): ThemeClasses {
  const isLight = themeMode === 'light';

  if (uiStyle === 'minimalist') {
    return {
      bgApp: isLight
        ? 'bg-stone-100 text-stone-900 font-sans'
        : 'bg-stone-950 text-stone-100 font-sans tracking-[0.005em]',
      bgPanel: isLight
        ? 'bg-white border border-stone-300 shadow-sm rounded-2xl'
        : 'bg-stone-900 border border-stone-800 shadow-lg rounded-2xl',
      bgCard: isLight
        ? 'bg-stone-50 border border-stone-200 rounded-xl'
        : 'bg-stone-950 border border-stone-800 rounded-xl',
      borderMain: isLight ? 'border-stone-300' : 'border-stone-800',
      accentText: isLight ? 'text-amber-700 font-semibold' : 'text-amber-400 font-semibold',
      buttonPrimary: isLight
        ? 'bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow-sm'
        : 'bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl shadow-sm font-semibold',
    };
  } else if (uiStyle === 'classic') {
    return {
      bgApp: isLight
        ? 'bg-[#f6efe2] text-stone-900 font-serif'
        : 'bg-[#12100e] text-stone-100 font-serif tracking-[0.01em]',
      bgPanel: isLight
        ? 'bg-[#fcf7ed] border-2 border-amber-700/60 shadow-md rounded-2xl'
        : 'bg-[#1c1815] border-2 border-amber-800/70 shadow-lg rounded-2xl',
      bgCard: isLight
        ? 'bg-[#f8f1e3] border border-amber-600/50 rounded-xl'
        : 'bg-[#161310] border border-amber-900/70 rounded-xl',
      borderMain: isLight ? 'border-amber-700/60' : 'border-amber-800/70',
      accentText: isLight ? 'text-amber-900 font-bold' : 'text-amber-300 font-bold',
      buttonPrimary: isLight
        ? 'bg-amber-800 hover:bg-amber-700 text-amber-50 rounded-xl border border-amber-700 shadow'
        : 'bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl border border-amber-400/60 shadow',
    };
  } else {
    // atmospheric (gothic)
    return {
      bgApp: isLight
        ? 'bg-gradient-to-b from-stone-100 via-amber-50/70 to-stone-100 text-stone-900 font-serif'
        : 'bg-[radial-gradient(ellipse_at_top,_#1c1714_0%,_#0c0a09_60%,_#09090b_100%)] text-stone-100 font-serif tracking-[0.01em]',
      bgPanel: isLight
        ? 'bg-white/95 border border-amber-600/70 shadow-xl rounded-3xl'
        : 'bg-stone-900/95 border border-amber-800/70 shadow-2xl rounded-3xl',
      bgCard: isLight
        ? 'bg-amber-50/80 border border-amber-500/70 rounded-2xl shadow-inner'
        : 'bg-stone-950/90 border border-amber-900/60 rounded-2xl shadow-inner',
      borderMain: isLight ? 'border-amber-600/70' : 'border-amber-800/70',
      accentText: isLight ? 'text-amber-800 font-bold' : 'text-amber-300 font-bold',
      buttonPrimary: isLight
        ? 'bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl shadow-lg border border-amber-600'
        : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 rounded-2xl shadow-xl border border-amber-400/50',
    };
  }
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  uiStyle: 'atmospheric',
  themeClasses: getThemeClasses('dark', 'atmospheric'),
});

export const useTheme = () => useContext(ThemeContext);
export { ThemeContext };
