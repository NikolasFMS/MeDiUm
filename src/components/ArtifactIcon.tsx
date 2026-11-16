import React from 'react';
import {
  Flame,
  Axe,
  Armchair,
  FlipHorizontal2,
  Piano,
  Blocks,
  Camera,
  Frame,
  Shield,
  Archive,
  Clock,
  Disc3,
  Leaf,
  BookOpen,
  Skull,
  FlameKindling,
  Sprout,
  Crosshair,
  Ghost,
  Dices,
  Sparkles,
  Sword,
  Drama,
  BookMarked,
  Music,
  KeyRound,
  Lamp,
  Barrel,
  Shirt,
  Crown,
  Scissors,
  Syringe,
  FlaskConical,
  Accessibility,
  Stethoscope,
  ClipboardList,
  Shovel,
  Compass,
  Feather,
  LampDesk,
  Hourglass,
  Anchor,
  Gem,
} from 'lucide-react';

interface ArtifactIconProps {
  artifactId: string;
  className?: string;
}

const ARTIFACT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // Base pack (18 unique icons)
  'art-1': Flame, // Камин
  'art-2': Axe, // Бензопила / топор
  'art-3': Armchair, // Кресло-качалка
  'art-4': FlipHorizontal2, // Зеркало
  'art-5': Piano, // Фортепиано
  'art-6': Blocks, // Игрушки
  'art-7': Camera, // Полароид
  'art-8': Frame, // Гобелен
  'art-9': Shield, // Доспехи
  'art-10': Archive, // Сундук
  'art-11': Clock, // Часы
  'art-12': Disc3, // Патефон
  'art-13': Leaf, // Омела
  'art-14': BookOpen, // Фолиант
  'art-15': Skull, // Скелет
  'art-16': FlameKindling, // Канделябр
  'art-17': Sprout, // Тыква
  'art-18': Crosshair, // Ружьё

  // Occult Wing (6 unique icons)
  'art-occ-1': Ghost, // Доска Уиджи
  'art-occ-2': Dices, // Колода Таро
  'art-occ-3': Sparkles, // Хрустальный шар
  'art-occ-4': Sword, // Ритуальный кинжал
  'art-occ-5': Drama, // Кукла вуду
  'art-occ-6': BookMarked, // Черный гримуар

  // Forgotten Wing (6 unique icons)
  'art-for-1': Music, // Музыкальная шкатулка
  'art-for-2': KeyRound, // Связка ржавых ключей
  'art-for-3': Lamp, // Керосиновая лампа
  'art-for-4': Barrel, // Дубовая бочка
  'art-for-5': Shirt, // Старый манекен
  'art-for-6': Crown, // Треснувшая кукла

  // Medical Wing (6 unique icons)
  'art-med-1': Scissors, // Скальпель
  'art-med-2': Syringe, // Шприц с сывороткой
  'art-med-3': FlaskConical, // Банка с образцом
  'art-med-4': Accessibility, // Инвалидное кресло
  'art-med-5': Stethoscope, // Стетоскоп
  'art-med-6': ClipboardList, // Карта пациента

  // Manor Grounds (6 unique icons)
  'art-gr-1': Shovel, // Лопата могильщика
  'art-gr-2': Compass, // Морской компас
  'art-gr-3': Feather, // Клетка ворона
  'art-gr-4': LampDesk, // Кованый фонарь
  'art-gr-5': Hourglass, // Солнечные часы
  'art-gr-6': Anchor, // Старое весло
};

export const ArtifactIcon: React.FC<ArtifactIconProps> = ({ artifactId, className = 'w-4 h-4' }) => {
  const Icon = ARTIFACT_ICON_MAP[artifactId] || Gem;
  return <Icon className={className} aria-hidden="true" />;
};
