import {
  Room,
  Artifact,
  HideoutCard,
  ClueCard,
  ExpansionInfo,
  ThematicPack,
  PackConfig,
  GameModifiers,
  GameScenario,
  RoomDifficulty,
} from '../types/game';

export const EXPANSIONS: ExpansionInfo[] = [
  {
    id: 'mansion',
    title: 'Покинутый особняк',
    subtitle: 'Часть I',
    description: 'Мрачные коридоры заброшенного поместья скрывают древнюю тайну и зловещее существо.',
    available: true,
  },
  {
    id: 'secrets',
    title: 'Секреты Советов',
    subtitle: 'Часть III',
    description: 'Раскройте тайны культистов и империалистических шпионов в секретных бункерах.',
    available: false,
  },
  {
    id: 'ancients',
    title: 'Пробуждение Древних',
    subtitle: 'Часть II',
    description: 'Древние проклятия пробуждаются в забытых святилищах. Готовы ли вы встретить неизведанное?',
    available: false,
  },
  {
    id: 'space',
    title: 'Крик в космосе',
    subtitle: 'Часть I. Пустота',
    description: 'Выживайте на дрейфующем космическом корабле в глубоком вакууме.',
    available: false,
  },
];

export const WING_CURSE_PACK_IDS = ['pack-occult', 'pack-forgotten', 'pack-medical', 'pack-grounds'] as const;

export const THEMATIC_PACKS: ThematicPack[] = [
  {
    id: 'pack-base',
    packType: 'full',
    titleRu: 'Базовый особняк (12 комнат)',
    titleEn: 'Base Mansion (12 Rooms)',
    descRu: 'Классические помещения Покинутого особняка и 18 базовых артефактов.',
    descEn: 'Classic rooms of the Abandoned Mansion and 18 base artifacts.',
  },
  {
    id: 'pack-occult',
    packType: 'full',
    titleRu: 'Оккультное крыло',
    titleEn: 'Occult Wing',
    descRu: 'Ритуальный зал, Спиритическая, Башня астролога, Таро, доска Уиджи и мистические слова.',
    descEn: 'Ritual Hall, Seance Room, Astrologer Tower, Tarot, Ouija board and mystical words.',
  },
  {
    id: 'pack-forgotten',
    packType: 'full',
    titleRu: 'Забытое крыло',
    titleEn: 'Forgotten Wing',
    descRu: 'Винный погреб, Котельная, Прачечная, Музыкальная шкатулка и жуткие шорохи.',
    descEn: 'Wine cellar, Boiler room, Laundry, Music box and eerie rustling sounds.',
  },
  {
    id: 'pack-medical',
    packType: 'full',
    titleRu: 'Медицинское крыло',
    titleEn: 'Medical Wing',
    descRu: 'Морг, Операционная, Аптека, Скальпель, Шприц и больничные тайны.',
    descEn: 'Morgue, Operating room, Pharmacy, Scalpel, Syringe and medical secrets.',
  },
  {
    id: 'pack-grounds',
    packType: 'full',
    titleRu: 'Территория поместья',
    titleEn: 'Manor Grounds',
    descRu: 'Склеп, Маяк, Беседка, Лодочный сарай, Лопата могильщика и туманные тропы.',
    descEn: 'Crypt, Lighthouse, Gazebo, Boathouse, Gravedigger shovel and foggy paths.',
  },
  {
    id: 'pack-words-sensations',
    packType: 'words',
    titleRu: 'Шёпот ощущений',
    titleEn: 'Whispers & Sensations',
    descRu: '40 абстрактных слов-ощущений, эмоций и звуков для тонких и неожиданных ассоциаций.',
    descEn: '40 abstract sensations, emotions and sounds for subtle, creative associations.',
  },
  {
    id: 'pack-words-era',
    packType: 'words',
    titleRu: 'Эпоха и винтажный быт',
    titleEn: 'Victorian Relics & Era',
    descRu: '40 атмосферных слов старинного уклада: сургуч, корсет, монокль, бархат и манускрипт.',
    descEn: '40 atmospheric period words: sealing wax, corset, monocle, velvet and manuscript.',
  },
];

// --- ARTIFACTS ---
export const ALL_ARTIFACTS: Artifact[] = [
  // Base pack (18)
  { id: 'art-1', packId: 'pack-base', name: 'Камин', symbol: 'КАМИН' },
  { id: 'art-2', packId: 'pack-base', name: 'Бензопила', symbol: 'БЕНЗОПИЛА' },
  { id: 'art-3', packId: 'pack-base', name: 'Кресло-качалка', symbol: 'КРЕСЛО-КАЧАЛКА' },
  { id: 'art-4', packId: 'pack-base', name: 'Зеркало', symbol: 'ЗЕРКАЛО' },
  { id: 'art-5', packId: 'pack-base', name: 'Фортепиано', symbol: 'ФОРТЕПИАНО' },
  { id: 'art-6', packId: 'pack-base', name: 'Игрушки', symbol: 'ИГРУШКИ' },
  { id: 'art-7', packId: 'pack-base', name: 'Полароид', symbol: 'ПОЛАРОИД' },
  { id: 'art-8', packId: 'pack-base', name: 'Гобелен', symbol: 'ГОБЕЛЕН' },
  { id: 'art-9', packId: 'pack-base', name: 'Доспехи', symbol: 'ДОСПЕХИ' },
  { id: 'art-10', packId: 'pack-base', name: 'Сундук', symbol: 'СУНДУК' },
  { id: 'art-11', packId: 'pack-base', name: 'Часы', symbol: 'ЧАСЫ' },
  { id: 'art-12', packId: 'pack-base', name: 'Патефон', symbol: 'ПАТЕФОН' },
  { id: 'art-13', packId: 'pack-base', name: 'Омела', symbol: 'ОМЕЛА' },
  { id: 'art-14', packId: 'pack-base', name: 'Фолиант', symbol: 'ФОЛИАНТ' },
  { id: 'art-15', packId: 'pack-base', name: 'Скелет', symbol: 'СКЕЛЕТ' },
  { id: 'art-16', packId: 'pack-base', name: 'Канделябр', symbol: 'КАНДЕЛЯБР' },
  { id: 'art-17', packId: 'pack-base', name: 'Тыква', symbol: 'ТЫКВА' },
  { id: 'art-18', packId: 'pack-base', name: 'Ружьё', symbol: 'РУЖЬЁ' },

  // Occult Wing (6)
  { id: 'art-occ-1', packId: 'pack-occult', name: 'Доска Уиджи', symbol: 'ДОСКА УИДЖИ' },
  { id: 'art-occ-2', packId: 'pack-occult', name: 'Колода Таро', symbol: 'КОЛОДА ТАРО' },
  { id: 'art-occ-3', packId: 'pack-occult', name: 'Хрустальный шар', symbol: 'ХРУСТАЛЬНЫЙ ШАР' },
  { id: 'art-occ-4', packId: 'pack-occult', name: 'Ритуальный кинжал', symbol: 'РИТУАЛЬНЫЙ КИНЖАЛ' },
  { id: 'art-occ-5', packId: 'pack-occult', name: 'Кукла вуду', symbol: 'КУКЛА ВУДУ' },
  { id: 'art-occ-6', packId: 'pack-occult', name: 'Черный гримуар', symbol: 'ЧЕРНЫЙ ГРИМУАР' },

  // Forgotten Wing (6)
  { id: 'art-for-1', packId: 'pack-forgotten', name: 'Музыкальная шкатулка', symbol: 'МУЗЫКАЛЬНАЯ ШКАТУЛКА' },
  { id: 'art-for-2', packId: 'pack-forgotten', name: 'Связка ржавых ключей', symbol: 'СВЯЗКА КЛЮЧЕЙ' },
  { id: 'art-for-3', packId: 'pack-forgotten', name: 'Керосиновая лампа', symbol: 'КЕРОСИНОВАЯ ЛАМПА' },
  { id: 'art-for-4', packId: 'pack-forgotten', name: 'Дубовая бочка', symbol: 'ДУБОВАЯ БОЧКА' },
  { id: 'art-for-5', packId: 'pack-forgotten', name: 'Старый манекен', symbol: 'СТАРЫЙ МАНЕКЕН' },
  { id: 'art-for-6', packId: 'pack-forgotten', name: 'Треснувшая кукла', symbol: 'ТРЕСНУВШАЯ КУКЛА' },

  // Medical Wing (6)
  { id: 'art-med-1', packId: 'pack-medical', name: 'Скальпель', symbol: 'СКАЛЬПЕЛЬ' },
  { id: 'art-med-2', packId: 'pack-medical', name: 'Шприц с сывороткой', symbol: 'ШПРИЦ' },
  { id: 'art-med-3', packId: 'pack-medical', name: 'Банка с образцом', symbol: 'БАНКА С ОБРАЗЦОМ' },
  { id: 'art-med-4', packId: 'pack-medical', name: 'Инвалидное кресло', symbol: 'ИНВАЛИДНОЕ КРЕСЛО' },
  { id: 'art-med-5', packId: 'pack-medical', name: 'Стетоскоп', symbol: 'СТЕТОСКОП' },
  { id: 'art-med-6', packId: 'pack-medical', name: 'Карта пациента', symbol: 'КАРТА ПАЦИЕНТА' },

  // Manor Grounds (6)
  { id: 'art-gr-1', packId: 'pack-grounds', name: 'Лопата могильщика', symbol: 'ЛОПАТА' },
  { id: 'art-gr-2', packId: 'pack-grounds', name: 'Морской компас', symbol: 'МОРСКОЙ КОМПАС' },
  { id: 'art-gr-3', packId: 'pack-grounds', name: 'Клетка ворона', symbol: 'КЛЕТКА ВОРОНА' },
  { id: 'art-gr-4', packId: 'pack-grounds', name: 'Кованый фонарь', symbol: 'КОВАНЫЙ ФОНАРЬ' },
  { id: 'art-gr-5', packId: 'pack-grounds', name: 'Солнечные часы', symbol: 'СОЛНЕЧНЫЕ ЧАСЫ' },
  { id: 'art-gr-6', packId: 'pack-grounds', name: 'Старое весло', symbol: 'СТАРОЕ ВЕСЛО' },
];

// --- ROOMS ---
export const ALL_ROOMS: Room[] = [
  // Base pack (12 rooms)
  { id: 'room-1', packId: 'pack-base', nameSilver: 'ПОДВАЛ', nameGold: 'ТЕМНИЦА', status: 'active', artifactId: '' },
  { id: 'room-2', packId: 'pack-base', nameSilver: 'СПАЛЬНЯ', nameGold: 'КЛАССНАЯ', status: 'active', artifactId: '' },
  { id: 'room-3', packId: 'pack-base', nameSilver: 'КОРИДОР', nameGold: 'САД', status: 'active', artifactId: '' },
  { id: 'room-4', packId: 'pack-base', nameSilver: 'ОРАНЖЕРЕЯ', nameGold: 'АЛЛЕЯ', status: 'active', artifactId: '' },
  { id: 'room-5', packId: 'pack-base', nameSilver: 'ГОСТИНАЯ', nameGold: 'ПАРАДНАЯ', status: 'active', artifactId: '' },
  { id: 'room-6', packId: 'pack-base', nameSilver: 'ЗАДНИЙ ДВОР', nameGold: 'ТАЙНАЯ КОМНАТА', status: 'active', artifactId: '' },
  { id: 'room-7', packId: 'pack-base', nameSilver: 'МАСТЕРСКАЯ', nameGold: 'ЛАБОРАТОРИЯ', status: 'active', artifactId: '' },
  { id: 'room-8', packId: 'pack-base', nameSilver: 'ЧАСОВНЯ', nameGold: 'БИБЛИОТЕКА', status: 'active', artifactId: '' },
  { id: 'room-9', packId: 'pack-base', nameSilver: 'ЧЕРДАК', nameGold: 'КАБИНЕТ', status: 'active', artifactId: '' },
  { id: 'room-10', packId: 'pack-base', nameSilver: 'БАССЕЙН', nameGold: 'ВАННАЯ', status: 'active', artifactId: '' },
  { id: 'room-11', packId: 'pack-base', nameSilver: 'СТОЛОВАЯ', nameGold: 'КУХНЯ', status: 'active', artifactId: '' },
  { id: 'room-12', packId: 'pack-base', nameSilver: 'КЕЛЬЯ', nameGold: 'ДЕТСКАЯ', status: 'active', artifactId: '' },

  // Occult Wing (4 rooms)
  { id: 'room-occ-1', packId: 'pack-occult', nameSilver: 'РИТУАЛЬНЫЙ ЗАЛ', nameGold: 'КУНСТКАМЕРА', status: 'active', artifactId: '' },
  { id: 'room-occ-2', packId: 'pack-occult', nameSilver: 'СПИРИТИЧЕСКАЯ', nameGold: 'АРХИВ', status: 'active', artifactId: '' },
  { id: 'room-occ-3', packId: 'pack-occult', nameSilver: 'БАШНЯ АСТРОЛОГА', nameGold: 'КОЛОКОЛЬНЯ', status: 'active', artifactId: '' },
  { id: 'room-occ-4', packId: 'pack-occult', nameSilver: 'ТАЙНОЕ СВЯТИЛИЩЕ', nameGold: 'КАТАКОМБЫ', status: 'active', artifactId: '' },

  // Forgotten Wing (4 rooms)
  { id: 'room-for-1', packId: 'pack-forgotten', nameSilver: 'ВИННЫЙ ПОГРЕБ', nameGold: 'ОРУЖЕЙНАЯ', status: 'active', artifactId: '' },
  { id: 'room-for-2', packId: 'pack-forgotten', nameSilver: 'КОТЕЛЬНАЯ', nameGold: 'ШАХТА ЛИФТА', status: 'active', artifactId: '' },
  { id: 'room-for-3', packId: 'pack-forgotten', nameSilver: 'ПРАЧЕЧНАЯ', nameGold: 'ШВЕЙНАЯ', status: 'active', artifactId: '' },
  { id: 'room-for-4', packId: 'pack-forgotten', nameSilver: 'КОМНАТА ПРИСЛУГИ', nameGold: 'ЧЕРНЫЙ ХОД', status: 'active', artifactId: '' },

  // Medical Wing (4 rooms)
  { id: 'room-med-1', packId: 'pack-medical', nameSilver: 'МОРГ', nameGold: 'РЕГИСТРАТУРА', status: 'active', artifactId: '' },
  { id: 'room-med-2', packId: 'pack-medical', nameSilver: 'ОПЕРАЦИОННАЯ', nameGold: 'РЕНТГЕН-КАБИНЕТ', status: 'active', artifactId: '' },
  { id: 'room-med-3', packId: 'pack-medical', nameSilver: 'АПТЕКА', nameGold: 'АЛХИМИЧЕСКАЯ', status: 'active', artifactId: '' },
  { id: 'room-med-4', packId: 'pack-medical', nameSilver: 'ИЗОЛЯТОР', nameGold: 'КАБИНЕТ ГЛАВВРАЧА', status: 'active', artifactId: '' },

  // Manor Grounds (4 rooms)
  { id: 'room-gr-1', packId: 'pack-grounds', nameSilver: 'СКЛЕП', nameGold: 'ЛАБИРИНТ', status: 'active', artifactId: '' },
  { id: 'room-gr-2', packId: 'pack-grounds', nameSilver: 'МАЯК', nameGold: 'МЕЛЬНИЦА', status: 'active', artifactId: '' },
  { id: 'room-gr-3', packId: 'pack-grounds', nameSilver: 'БЕСЕДКА', nameGold: 'СТАРЫЙ КОЛОДЕЦ', status: 'active', artifactId: '' },
  { id: 'room-gr-4', packId: 'pack-grounds', nameSilver: 'ЛОДОЧНЫЙ САРАЙ', nameGold: 'КОНЮШНЯ', status: 'active', artifactId: '' },
];

// --- CLUE CARDS ---
export const ALL_CLUES: ClueCard[] = [
  // Base 87 clues
  { id: 'c-1', packId: 'pack-base', word: 'Книга' },
  { id: 'c-2', packId: 'pack-base', word: 'Встреча' },
  { id: 'c-3', packId: 'pack-base', word: 'Спички' },
  { id: 'c-4', packId: 'pack-base', word: 'Дым' },
  { id: 'c-5', packId: 'pack-base', word: 'Перемещение' },
  { id: 'c-6', packId: 'pack-base', word: 'Эмоции' },
  { id: 'c-7', packId: 'pack-base', word: 'Чертёж' },
  { id: 'c-8', packId: 'pack-base', word: 'Свежесть' },
  { id: 'c-9', packId: 'pack-base', word: 'Цилиндр' },
  { id: 'c-10', packId: 'pack-base', word: 'Звуки' },
  { id: 'c-11', packId: 'pack-base', word: 'Разговор' },
  { id: 'c-12', packId: 'pack-base', word: 'Шланг' },
  { id: 'c-13', packId: 'pack-base', word: 'Халат' },
  { id: 'c-14', packId: 'pack-base', word: 'Свет' },
  { id: 'c-15', packId: 'pack-base', word: 'Бюст' },
  { id: 'c-16', packId: 'pack-base', word: 'Кости' },
  { id: 'c-17', packId: 'pack-base', word: 'Громкий' },
  { id: 'c-18', packId: 'pack-base', word: 'Монстр' },
  { id: 'c-19', packId: 'pack-base', word: 'Отопление' },
  { id: 'c-20', packId: 'pack-base', word: 'Усталость' },
  { id: 'c-21', packId: 'pack-base', word: 'Рождество' },
  { id: 'c-22', packId: 'pack-base', word: 'Вода' },
  { id: 'c-23', packId: 'pack-base', word: 'Фонарь' },
  { id: 'c-24', packId: 'pack-base', word: 'Серебро' },
  { id: 'c-25', packId: 'pack-base', word: 'Сырость' },
  { id: 'c-26', packId: 'pack-base', word: 'Крючок' },
  { id: 'c-27', packId: 'pack-base', word: 'Утка' },
  { id: 'c-28', packId: 'pack-base', word: 'Блеск' },
  { id: 'c-29', packId: 'pack-base', word: 'Щелчок' },
  { id: 'c-30', packId: 'pack-base', word: 'Тайна' },
  { id: 'c-31', packId: 'pack-base', word: 'Лестница' },
  { id: 'c-32', packId: 'pack-base', word: 'Знания' },
  { id: 'c-33', packId: 'pack-base', word: 'Отдых' },
  { id: 'c-34', packId: 'pack-base', word: 'Тишина' },
  { id: 'c-35', packId: 'pack-base', word: 'Предохранитель' },
  { id: 'c-36', packId: 'pack-base', word: 'Треск' },
  { id: 'c-37', packId: 'pack-base', word: 'Вечеринка' },
  { id: 'c-38', packId: 'pack-base', word: 'Утечка' },
  { id: 'c-39', packId: 'pack-base', word: 'Игла' },
  { id: 'c-40', packId: 'pack-base', word: 'Зелень' },
  { id: 'c-41', packId: 'pack-base', word: 'Перо' },
  { id: 'c-42', packId: 'pack-base', word: 'Чай' },
  { id: 'c-43', packId: 'pack-base', word: 'Ночь' },
  { id: 'c-44', packId: 'pack-base', word: 'Дневник' },
  { id: 'c-45', packId: 'pack-base', word: 'Тапочки' },
  { id: 'c-46', packId: 'pack-base', word: 'Дрова' },
  { id: 'c-47', packId: 'pack-base', word: 'Воспоминания' },
  { id: 'c-48', packId: 'pack-base', word: 'Течение' },
  { id: 'c-49', packId: 'pack-base', word: 'Тепло' },
  { id: 'c-50', packId: 'pack-base', word: 'Качели' },
  { id: 'c-51', packId: 'pack-base', word: 'Проход' },
  { id: 'c-52', packId: 'pack-base', word: 'Телескоп' },
  { id: 'c-53', packId: 'pack-base', word: 'Кофе' },
  { id: 'c-54', packId: 'pack-base', word: 'Ноты' },
  { id: 'c-55', packId: 'pack-base', word: 'Свеча' },
  { id: 'c-56', packId: 'pack-base', word: 'Цвет' },
  { id: 'c-57', packId: 'pack-base', word: 'Концентрация' },
  { id: 'c-58', packId: 'pack-base', word: 'Старость' },
  { id: 'c-59', packId: 'pack-base', word: 'Полотенце' },
  { id: 'c-60', packId: 'pack-base', word: 'Шкафчик' },
  { id: 'c-61', packId: 'pack-base', word: 'Дремота' },
  { id: 'c-62', packId: 'pack-base', word: 'Одежда' },
  { id: 'c-63', packId: 'pack-base', word: 'Безопасность' },
  { id: 'c-64', packId: 'pack-base', word: 'Лопатка' },
  { id: 'c-65', packId: 'pack-base', word: 'Лист' },
  { id: 'c-66', packId: 'pack-base', word: 'Смесь' },
  { id: 'c-67', packId: 'pack-base', word: 'Платье' },
  { id: 'c-68', packId: 'pack-base', word: 'Телефон' },
  { id: 'c-69', packId: 'pack-base', word: 'Грязь' },
  { id: 'c-70', packId: 'pack-base', word: 'Трубка' },
  { id: 'c-71', packId: 'pack-base', word: 'Ужин' },
  { id: 'c-72', packId: 'pack-base', word: 'Решётка' },
  { id: 'c-73', packId: 'pack-base', word: 'Узор' },
  { id: 'c-74', packId: 'pack-base', word: 'Клетка' },
  { id: 'c-75', packId: 'pack-base', word: 'Стеллаж' },
  { id: 'c-76', packId: 'pack-base', word: 'Беготня' },
  { id: 'c-77', packId: 'pack-base', word: 'Инструкция' },
  { id: 'c-78', packId: 'pack-base', word: 'Просветление' },
  { id: 'c-79', packId: 'pack-base', word: 'Сапоги' },
  { id: 'c-80', packId: 'pack-base', word: 'Рецепт' },
  { id: 'c-81', packId: 'pack-base', word: 'Припасы' },
  { id: 'c-82', packId: 'pack-base', word: 'Фарфор' },
  { id: 'c-83', packId: 'pack-base', word: 'Крышка' },
  { id: 'c-84', packId: 'pack-base', word: 'Сказки' },
  { id: 'c-85', packId: 'pack-base', word: 'Горшок' },
  { id: 'c-86', packId: 'pack-base', word: 'Карандаши' },
  { id: 'c-87', packId: 'pack-base', word: 'Плед' },

  // Occult Wing words (20)
  { id: 'c-occ-1', packId: 'pack-occult', word: 'Ритуал' },
  { id: 'c-occ-2', packId: 'pack-occult', word: 'Предсказание' },
  { id: 'c-occ-3', packId: 'pack-occult', word: 'Астрал' },
  { id: 'c-occ-4', packId: 'pack-occult', word: 'Пентаграмма' },
  { id: 'c-occ-5', packId: 'pack-occult', word: 'Маятник' },
  { id: 'c-occ-6', packId: 'pack-occult', word: 'Заклинание' },
  { id: 'c-occ-7', packId: 'pack-occult', word: 'Проклятие' },
  { id: 'c-occ-8', packId: 'pack-occult', word: 'Руны' },
  { id: 'c-occ-9', packId: 'pack-occult', word: 'Затмение' },
  { id: 'c-occ-10', packId: 'pack-occult', word: 'Медитация' },
  { id: 'c-occ-11', packId: 'pack-occult', word: 'Транс' },
  { id: 'c-occ-12', packId: 'pack-occult', word: 'Судьба' },
  { id: 'c-occ-13', packId: 'pack-occult', word: 'Тень' },
  { id: 'c-occ-14', packId: 'pack-occult', word: 'Шёпот' },
  { id: 'c-occ-15', packId: 'pack-occult', word: 'Воск' },
  { id: 'c-occ-16', packId: 'pack-occult', word: 'Отражение' },
  { id: 'c-occ-17', packId: 'pack-occult', word: 'Колокол' },
  { id: 'c-occ-18', packId: 'pack-occult', word: 'Печать' },
  { id: 'c-occ-19', packId: 'pack-occult', word: 'Видение' },
  { id: 'c-occ-20', packId: 'pack-occult', word: 'Загадка' },

  // Forgotten Wing words (20)
  { id: 'c-for-1', packId: 'pack-forgotten', word: 'Плесень' },
  { id: 'c-for-2', packId: 'pack-forgotten', word: 'Паутина' },
  { id: 'c-for-3', packId: 'pack-forgotten', word: 'Скрип' },
  { id: 'c-for-4', packId: 'pack-forgotten', word: 'Ржавчина' },
  { id: 'c-for-5', packId: 'pack-forgotten', word: 'Мелодия' },
  { id: 'c-for-6', packId: 'pack-forgotten', word: 'Пар' },
  { id: 'c-for-7', packId: 'pack-forgotten', word: 'Уголь' },
  { id: 'c-for-8', packId: 'pack-forgotten', word: 'Забытье' },
  { id: 'c-for-9', packId: 'pack-forgotten', word: 'Пыльца' },
  { id: 'c-for-10', packId: 'pack-forgotten', word: 'Сквозняк' },
  { id: 'c-for-11', packId: 'pack-forgotten', word: 'Шкатулка' },
  { id: 'c-for-12', packId: 'pack-forgotten', word: 'Электричество' },
  { id: 'c-for-13', packId: 'pack-forgotten', word: 'Пыль' },
  { id: 'c-for-14', packId: 'pack-forgotten', word: 'Ключ' },
  { id: 'c-for-15', packId: 'pack-forgotten', word: 'Металл' },
  { id: 'c-for-16', packId: 'pack-forgotten', word: 'Ткань' },
  { id: 'c-for-17', packId: 'pack-forgotten', word: 'Ступени' },
  { id: 'c-for-18', packId: 'pack-forgotten', word: 'Механизм' },
  { id: 'c-for-19', packId: 'pack-forgotten', word: 'Масло' },
  { id: 'c-for-20', packId: 'pack-forgotten', word: 'Замок' },

  // Medical Wing words (20)
  { id: 'c-med-1', packId: 'pack-medical', word: 'Диагноз' },
  { id: 'c-med-2', packId: 'pack-medical', word: 'Пульс' },
  { id: 'c-med-3', packId: 'pack-medical', word: 'Бинт' },
  { id: 'c-med-4', packId: 'pack-medical', word: 'Лихорадка' },
  { id: 'c-med-5', packId: 'pack-medical', word: 'Шрам' },
  { id: 'c-med-6', packId: 'pack-medical', word: 'Наркоз' },
  { id: 'c-med-7', packId: 'pack-medical', word: 'Хлорка' },
  { id: 'c-med-8', packId: 'pack-medical', word: 'Безумие' },
  { id: 'c-med-9', packId: 'pack-medical', word: 'Прививка' },
  { id: 'c-med-10', packId: 'pack-medical', word: 'Рентген' },
  { id: 'c-med-11', packId: 'pack-medical', word: 'Микстура' },
  { id: 'c-med-12', packId: 'pack-medical', word: 'Пациент' },
  { id: 'c-med-13', packId: 'pack-medical', word: 'Стекло' },
  { id: 'c-med-14', packId: 'pack-medical', word: 'Спирт' },
  { id: 'c-med-15', packId: 'pack-medical', word: 'Холод' },
  { id: 'c-med-16', packId: 'pack-medical', word: 'Журнал' },
  { id: 'c-med-17', packId: 'pack-medical', word: 'Перчатки' },
  { id: 'c-med-18', packId: 'pack-medical', word: 'Лампа' },
  { id: 'c-med-19', packId: 'pack-medical', word: 'Яд' },
  { id: 'c-med-20', packId: 'pack-medical', word: 'Травы' },

  // Manor Grounds words (20)
  { id: 'c-gr-1', packId: 'pack-grounds', word: 'Надгробие' },
  { id: 'c-gr-2', packId: 'pack-grounds', word: 'Прилив' },
  { id: 'c-gr-3', packId: 'pack-grounds', word: 'Камень' },
  { id: 'c-gr-4', packId: 'pack-grounds', word: 'Болото' },
  { id: 'c-gr-5', packId: 'pack-grounds', word: 'Тростник' },
  { id: 'c-gr-6', packId: 'pack-grounds', word: 'Ограда' },
  { id: 'c-gr-7', packId: 'pack-grounds', word: 'Ворон' },
  { id: 'c-gr-8', packId: 'pack-grounds', word: 'Земля' },
  { id: 'c-gr-9', packId: 'pack-grounds', word: 'Тропа' },
  { id: 'c-gr-10', packId: 'pack-grounds', word: 'Мост' },
  { id: 'c-gr-11', packId: 'pack-grounds', word: 'Луч' },
  { id: 'c-gr-12', packId: 'pack-grounds', word: 'Буря' },
  { id: 'c-gr-13', packId: 'pack-grounds', word: 'Туман' },
  { id: 'c-gr-14', packId: 'pack-grounds', word: 'Ветер' },
  { id: 'c-gr-15', packId: 'pack-grounds', word: 'Колесо' },
  { id: 'c-gr-16', packId: 'pack-grounds', word: 'Подкова' },
  { id: 'c-gr-17', packId: 'pack-grounds', word: 'Мох' },
  { id: 'c-gr-18', packId: 'pack-grounds', word: 'Верёвка' },
  { id: 'c-gr-19', packId: 'pack-grounds', word: 'Плющ' },
  { id: 'c-gr-20', packId: 'pack-grounds', word: 'Волна' },

  // Word Pack: Whispers & Sensations (40)
  { id: 'c-ws-1', packId: 'pack-words-sensations', word: 'Тревога' },
  { id: 'c-ws-2', packId: 'pack-words-sensations', word: 'Эхо' },
  { id: 'c-ws-3', packId: 'pack-words-sensations', word: 'Озноб' },
  { id: 'c-ws-4', packId: 'pack-words-sensations', word: 'Мерцание' },
  { id: 'c-ws-5', packId: 'pack-words-sensations', word: 'Тоска' },
  { id: 'c-ws-6', packId: 'pack-words-sensations', word: 'Удушье' },
  { id: 'c-ws-7', packId: 'pack-words-sensations', word: 'Вспышка' },
  { id: 'c-ws-8', packId: 'pack-words-sensations', word: 'Шок' },
  { id: 'c-ws-9', packId: 'pack-words-sensations', word: 'Предчувствие' },
  { id: 'c-ws-10', packId: 'pack-words-sensations', word: 'Дрожь' },
  { id: 'c-ws-11', packId: 'pack-words-sensations', word: 'Пустота' },
  { id: 'c-ws-12', packId: 'pack-words-sensations', word: 'Сумрак' },
  { id: 'c-ws-13', packId: 'pack-words-sensations', word: 'Напряжение' },
  { id: 'c-ws-14', packId: 'pack-words-sensations', word: 'Молчание' },
  { id: 'c-ws-15', packId: 'pack-words-sensations', word: 'Меланхолия' },
  { id: 'c-ws-16', packId: 'pack-words-sensations', word: 'Восторг' },
  { id: 'c-ws-17', packId: 'pack-words-sensations', word: 'Ужас' },
  { id: 'c-ws-18', packId: 'pack-words-sensations', word: 'Смущение' },
  { id: 'c-ws-19', packId: 'pack-words-sensations', word: 'Интрига' },
  { id: 'c-ws-20', packId: 'pack-words-sensations', word: 'Гармония' },
  { id: 'c-ws-21', packId: 'pack-words-sensations', word: 'Паника' },
  { id: 'c-ws-22', packId: 'pack-words-sensations', word: 'Спокойствие' },
  { id: 'c-ws-23', packId: 'pack-words-sensations', word: 'Головокружение' },
  { id: 'c-ws-24', packId: 'pack-words-sensations', word: 'Отчаяние' },
  { id: 'c-ws-25', packId: 'pack-words-sensations', word: 'Надежда' },
  { id: 'c-ws-26', packId: 'pack-words-sensations', word: 'Соблазн' },
  { id: 'c-ws-27', packId: 'pack-words-sensations', word: 'Гнев' },
  { id: 'c-ws-28', packId: 'pack-words-sensations', word: 'Блаженство' },
  { id: 'c-ws-29', packId: 'pack-words-sensations', word: 'Бред' },
  { id: 'c-ws-30', packId: 'pack-words-sensations', word: 'Озарение' },
  { id: 'c-ws-31', packId: 'pack-words-sensations', word: 'Предзнаменование' },
  { id: 'c-ws-32', packId: 'pack-words-sensations', word: 'Духота' },
  { id: 'c-ws-33', packId: 'pack-words-sensations', word: 'Прохлада' },
  { id: 'c-ws-34', packId: 'pack-words-sensations', word: 'Вибрация' },
  { id: 'c-ws-35', packId: 'pack-words-sensations', word: 'Гул' },
  { id: 'c-ws-36', packId: 'pack-words-sensations', word: 'Вздох' },
  { id: 'c-ws-37', packId: 'pack-words-sensations', word: 'Шорох' },
  { id: 'c-ws-38', packId: 'pack-words-sensations', word: 'Трепет' },
  { id: 'c-ws-39', packId: 'pack-words-sensations', word: 'Смятение' },
  { id: 'c-ws-40', packId: 'pack-words-sensations', word: 'Невесомость' },

  // Word Pack: Victorian Relics & Era (40)
  { id: 'c-we-1', packId: 'pack-words-era', word: 'Сургуч' },
  { id: 'c-we-2', packId: 'pack-words-era', word: 'Корсет' },
  { id: 'c-we-3', packId: 'pack-words-era', word: 'Монокль' },
  { id: 'c-we-4', packId: 'pack-words-era', word: 'Бархат' },
  { id: 'c-we-5', packId: 'pack-words-era', word: 'Пергамент' },
  { id: 'c-we-6', packId: 'pack-words-era', word: 'Порох' },
  { id: 'c-we-7', packId: 'pack-words-era', word: 'Хрусталь' },
  { id: 'c-we-8', packId: 'pack-words-era', word: 'Карета' },
  { id: 'c-we-9', packId: 'pack-words-era', word: 'Трость' },
  { id: 'c-we-10', packId: 'pack-words-era', word: 'Бронза' },
  { id: 'c-we-11', packId: 'pack-words-era', word: 'Плюш' },
  { id: 'c-we-12', packId: 'pack-words-era', word: 'Кружево' },
  { id: 'c-we-13', packId: 'pack-words-era', word: 'Письмо' },
  { id: 'c-we-14', packId: 'pack-words-era', word: 'Телеграмма' },
  { id: 'c-we-15', packId: 'pack-words-era', word: 'Чернила' },
  { id: 'c-we-16', packId: 'pack-words-era', word: 'Медальон' },
  { id: 'c-we-17', packId: 'pack-words-era', word: 'Гравюра' },
  { id: 'c-we-18', packId: 'pack-words-era', word: 'Вуаль' },
  { id: 'c-we-19', packId: 'pack-words-era', word: 'Пенсне' },
  { id: 'c-we-20', packId: 'pack-words-era', word: 'Шпилька' },
  { id: 'c-we-21', packId: 'pack-words-era', word: 'Фрак' },
  { id: 'c-we-22', packId: 'pack-words-era', word: 'Перстень' },
  { id: 'c-we-23', packId: 'pack-words-era', word: 'Маска' },
  { id: 'c-we-24', packId: 'pack-words-era', word: 'Сейф' },
  { id: 'c-we-25', packId: 'pack-words-era', word: 'Занавес' },
  { id: 'c-we-26', packId: 'pack-words-era', word: 'Свиток' },
  { id: 'c-we-27', packId: 'pack-words-era', word: 'Склянка' },
  { id: 'c-we-28', packId: 'pack-words-era', word: 'Эликсир' },
  { id: 'c-we-29', packId: 'pack-words-era', word: 'Короб' },
  { id: 'c-we-30', packId: 'pack-words-era', word: 'Подсвечник' },
  { id: 'c-we-31', packId: 'pack-words-era', word: 'Брошь' },
  { id: 'c-we-32', packId: 'pack-words-era', word: 'Багаж' },
  { id: 'c-we-33', packId: 'pack-words-era', word: 'Чемодан' },
  { id: 'c-we-34', packId: 'pack-words-era', word: 'Шляпа' },
  { id: 'c-we-35', packId: 'pack-words-era', word: 'Манускрипт' },
  { id: 'c-we-36', packId: 'pack-words-era', word: 'Флигель' },
  { id: 'c-we-37', packId: 'pack-words-era', word: 'Антиквариат' },
  { id: 'c-we-38', packId: 'pack-words-era', word: 'Фартук' },
  { id: 'c-we-39', packId: 'pack-words-era', word: 'Пуговица' },
  { id: 'c-we-40', packId: 'pack-words-era', word: 'Шпага' },
];

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const DEFAULT_PACK_CONFIG: PackConfig = {
  selectedPackIds: ['pack-base'],
  selectedWordPackIds: ['pack-base'],
  disabledRoomIds: [],
  disabledArtifactIds: [],
  guaranteedPackIds: [],
};

export const DEFAULT_MODIFIERS: GameModifiers = {
  enableWingCurses: false,
  mixedDifficulty: false,
  ghostIllusionEnabled: false,
  mediumInsightEnabled: false,
  blitzTimer: false,
};

export const GAME_SCENARIOS: GameScenario[] = [
  {
    id: 'classic',
    titleRu: 'Классический сеанс',
    titleEn: 'Classic Seance',
    descRu: 'Базовый особняк и классические слова по оригинальным правилам без усложнений.',
    descEn: 'Base mansion and original clue deck following standard rules.',
    difficulty: 'silver',
    packConfig: {
      selectedPackIds: ['pack-base'],
      selectedWordPackIds: ['pack-base'],
      disabledRoomIds: [],
      disabledArtifactIds: [],
      guaranteedPackIds: [],
    },
    modifiers: {
      enableWingCurses: false,
      mixedDifficulty: false,
      ghostIllusionEnabled: false,
      mediumInsightEnabled: false,
      blitzTimer: false,
    },
  },
  {
    id: 'clinic',
    titleRu: 'Лечебница доктора Блэка',
    titleEn: 'Dr. Black’s Clinic',
    descRu: 'Медицинское и Забытое крылья на столе, проклятия крыльев (Лихорадка и Полтергейст) и ощущения.',
    descEn: 'Medical & Forgotten wings guaranteed on table, Wing Curses active, plus Sensations deck.',
    difficulty: 'silver',
    packConfig: {
      selectedPackIds: ['pack-base', 'pack-medical', 'pack-forgotten'],
      selectedWordPackIds: ['pack-base', 'pack-medical', 'pack-forgotten', 'pack-words-sensations'],
      disabledRoomIds: [],
      disabledArtifactIds: [],
      guaranteedPackIds: ['pack-medical', 'pack-forgotten'],
    },
    modifiers: {
      enableWingCurses: true,
      mixedDifficulty: true,
      ghostIllusionEnabled: false,
      mediumInsightEnabled: true,
      blitzTimer: false,
    },
  },
  {
    id: 'spiritism',
    titleRu: 'Ночь спиритизма',
    titleEn: 'Night of Spiritism',
    descRu: 'Оккультное крыло и винтажная лексика. Транс Медиума, Озарение и Морок Призрака.',
    descEn: 'Occult Wing & Victorian Relics vocabulary with Trance, Insight, and Ghost Illusion.',
    difficulty: 'gold',
    packConfig: {
      selectedPackIds: ['pack-base', 'pack-occult'],
      selectedWordPackIds: ['pack-base', 'pack-occult', 'pack-words-era', 'pack-words-sensations'],
      disabledRoomIds: [],
      disabledArtifactIds: [],
      guaranteedPackIds: ['pack-occult'],
    },
    modifiers: {
      enableWingCurses: true,
      mixedDifficulty: false,
      ghostIllusionEnabled: true,
      mediumInsightEnabled: true,
      blitzTimer: false,
    },
  },
  {
    id: 'nightmare',
    titleRu: 'Кошмар особняка (Хардкор)',
    titleEn: 'Mansion Nightmare (Hardcore)',
    descRu: 'Все крылья, золотая сторона, проклятия крыльев, Морок Призрака и Блиц-таймер.',
    descEn: 'All wings, gold rooms, Wing Curses, Ghost Illusion, and Blitz countdown timer.',
    difficulty: 'gold',
    packConfig: {
      selectedPackIds: ['pack-base', 'pack-occult', 'pack-forgotten', 'pack-medical', 'pack-grounds'],
      selectedWordPackIds: [
        'pack-base',
        'pack-occult',
        'pack-forgotten',
        'pack-medical',
        'pack-grounds',
        'pack-words-sensations',
        'pack-words-era',
      ],
      disabledRoomIds: [],
      disabledArtifactIds: [],
      guaranteedPackIds: ['pack-occult', 'pack-medical', 'pack-grounds'],
    },
    modifiers: {
      enableWingCurses: true,
      mixedDifficulty: false,
      ghostIllusionEnabled: true,
      mediumInsightEnabled: false,
      blitzTimer: true,
    },
  },
];

export const MANSION_ROOMS = ALL_ROOMS;
export const MANSION_ARTIFACTS = ALL_ARTIFACTS;
export const INITIAL_CLUES = ALL_CLUES;

export function getRoomSide(room: Pick<Room, 'side'>, fallbackDifficulty: RoomDifficulty): RoomDifficulty {
  return room.side ?? fallbackDifficulty;
}

export function selectRoomsForBoard(availableRooms: Room[], guaranteedPackIds?: string[]): Room[] {
  const guaranteedSet = new Set(guaranteedPackIds ?? []);
  if (guaranteedSet.size === 0) {
    return shuffleArray(availableRooms).slice(0, 10);
  }

  const prioritized: Room[] = [];
  const prioritizedIds = new Set<string>();

  for (const packId of guaranteedSet) {
    const fromPack = shuffleArray(availableRooms.filter((r) => r.packId === packId));
    // Guarantee up to 4 rooms per prioritized pack while leaving room for up to 10 total
    for (const room of fromPack) {
      if (prioritized.length < 10 && !prioritizedIds.has(room.id)) {
        prioritized.push(room);
        prioritizedIds.add(room.id);
      }
    }
  }

  const remainingSlots = Math.max(0, 10 - prioritized.length);
  const filler = shuffleArray(availableRooms.filter((r) => !prioritizedIds.has(r.id))).slice(0, remainingSlots);
  return shuffleArray([...prioritized, ...filler]);
}

export function getFilteredGameData(config: PackConfig) {
  const activePacks = new Set(config.selectedPackIds);
  const wordPacks = new Set(
    config.selectedWordPackIds && config.selectedWordPackIds.length > 0
      ? config.selectedWordPackIds
      : config.selectedPackIds
  );
  const rooms = ALL_ROOMS.filter((r) => activePacks.has(r.packId) && !config.disabledRoomIds.includes(r.id));
  const artifacts = ALL_ARTIFACTS.filter(
    (a) => activePacks.has(a.packId) && !config.disabledArtifactIds.includes(a.id)
  );
  const clues = ALL_CLUES.filter((c) => wordPacks.has(c.packId));
  const hideouts: HideoutCard[] = rooms.map((r) => ({
    id: `hideout-${r.id}`,
    roomId: r.id,
  }));
  return { rooms, artifacts, hideouts, clues };
}
