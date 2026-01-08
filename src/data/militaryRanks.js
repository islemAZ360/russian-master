// بيانات الرتب العسكرية للنظام
export const MILITARY_RANKS = [
  {
    id: 'recruit',
    name: 'RECRUIT',
    title: 'مجنّد',
    xp: 0,
    icon: '🪖',
    color: '#808080'
  },
  {
    id: 'private',
    name: 'PRIVATE',
    title: 'جندي',
    xp: 500,
    icon: '🎖️',
    color: '#00FF00'
  },
  {
    id: 'corporal',
    name: 'CORPORAL',
    title: 'عريف',
    xp: 1500,
    icon: '⭐',
    color: '#4CAF50'
  },
  {
    id: 'sergeant',
    name: 'SERGEANT',
    title: 'رقيب',
    xp: 3500,
    icon: '🎗️',
    color: '#2196F3'
  },
  {
    id: 'lieutenant',
    name: 'LIEUTENANT',
    title: 'ملازم',
    xp: 7500,
    icon: '⚔️',
    color: '#9C27B0'
  },
  {
    id: 'captain',
    name: 'CAPTAIN',
    title: 'نقيب',
    xp: 15000,
    icon: '🦅',
    color: '#FF9800'
  },
  {
    id: 'major',
    name: 'MAJOR',
    title: 'رائد',
    xp: 30000,
    icon: '🏅',
    color: '#FF5722'
  },
  {
    id: 'colonel',
    name: 'COLONEL',
    title: 'عقيد',
    xp: 60000,
    icon: '👑',
    color: '#F44336'
  },
  {
    id: 'general',
    name: 'GENERAL',
    title: 'لواء',
    xp: 120000,
    icon: '🌟',
    color: '#E91E63'
  },
  {
    id: 'legend',
    name: 'LEGEND',
    title: 'أسطورة',
    xp: 250000,
    icon: '🔥',
    color: '#FFEB3B'
  },
  {
    id: 'cybergod',
    name: 'CYBER GOD',
    title: 'إله سيبراني',
    xp: 500000,
    icon: '👁️',
    color: '#FFFFFF'
  }
];

// دالة مساعدة لجلب الرتبة الحالية بناءً على الـ XP
export const getCurrentRank = (xp) => {
  // نستخدم reduce للعثور على أعلى رتبة حققها المستخدم بناءً على نقاطه
  return MILITARY_RANKS.reduce((current, rank) => 
    xp >= rank.xp ? rank : current
  , MILITARY_RANKS[0]);
};