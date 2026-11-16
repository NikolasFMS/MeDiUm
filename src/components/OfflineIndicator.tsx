import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { Language, translations } from '../utils/i18n';

interface OfflineIndicatorProps {
  lang: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isOnline = useOnlineStatus();
  const t = translations[lang];

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-3 left-3 z-40 flex items-center gap-2 rounded-xl bg-amber-700/95 border border-amber-500/70 px-3 py-1.5 text-xs font-serif font-medium text-white shadow-lg backdrop-blur-sm"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>{t.offlineMode}</span>
    </div>
  );
};
