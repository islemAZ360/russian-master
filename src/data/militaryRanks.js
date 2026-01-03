export const MILITARY_RANKS = [
  {
    id: 'recruit',
    name: 'RECRUIT',
    title: 'متدرب',
    titleRu: 'Новобранец',
    xp: 0,
    icon: '🪖',
    color: '#808080',
    perks: [],
    abilities: [],
    description: 'المبتدئ في عالم اللغة الروسية',
    unlockMessage: 'مرحباً بك في الجيش الروسي!'
  },
  {
    id: 'private',
    name: 'PRIVATE',
    title: 'جندي',
    titleRu: 'Рядовой',
    xp: 500,
    icon: '🎖️',
    color: '#00FF00',
    perks: ['إضافة 10 بطاقات يومياً', 'بطاقات أساسية'],
    abilities: ['سرعة تعلم +10%'],
    description: 'لقد أتقنت الأساسيات',
    unlockMessage: 'تهانينا! أنت الآن جندي في الجيش الروسي'
  },
  {
    id: 'corporal',
    name: 'CORPORAL',
    title: 'عريف',
    titleRu: 'Ефрейтор',
    xp: 1500,
    icon: '⭐',
    color: '#4CAF50',
    perks: ['ألعاب حصرية', 'دردشات خاصة'],
    abilities: ['سرعة تعلم +15%', 'مكافآت يومية مضاعفة'],
    description: 'قائد فريق صغير',
    unlockMessage: 'ترقية إلى عريف! قيادة الفريق تبدأ الآن'
  },
  {
    id: 'sergeant',
    name: 'SERGEANT',
    title: 'رقيب',
    titleRu: 'Сержант',
    xp: 3500,
    icon: '🎗️',
    color: '#2196F3',
    perks: ['بطاقات ذهبية', 'إمكانية إنشاء مجموعات'],
    abilities: ['سرعة تعلم +20%', 'تجربة جماعية +25%'],
    description: 'مدرب ومشرف على المتدربين',
    unlockMessage: 'أنت الآن رقيب! دورك تدريب الجدد'
  },
  {
    id: 'lieutenant',
    name: 'LIEUTENANT',
    title: 'ملازم',
    titleRu: 'Лейтенант',
    xp: 7500,
    icon: '⚔️',
    color: '#9C27B0',
    perks: ['صلاحيات مراقبة', 'تصميم رتبة مخصصة'],
    abilities: ['سرعة تعلم +30%', 'مكافآت المجموعة +50%'],
    description: 'ضابط صف مع صلاحيات تخطيط',
    unlockMessage: 'ترقية إلى ملازم! ابدأ في التخطيط للعمليات'
  },
  {
    id: 'captain',
    name: 'CAPTAIN',
    title: 'نقيب',
    titleRu: 'Капитан',
    xp: 15000,
    icon: '🎖️',
    color: '#FF9800',
    perks: ['غرف قيادة', 'إطلاق بث عالمي'],
    abilities: ['سرعة تعلم +40%', 'جميع المكافآت مضاعفة'],
    description: 'قائد وحدة مستقلة',
    unlockMessage: 'نقيب الجيش! قيادة الوحدة بين يديك'
  },
  {
    id: 'major',
    name: 'MAJOR',
    title: 'رائد',
    titleRu: 'Майор',
    xp: 30000,
    icon: '🏅',
    color: '#FF5722',
    perks: ['صلاحيات شبه إدارية', 'تحليل إحصائي متقدم'],
    abilities: ['سرعة تعلم +50%', 'تأثير المجموعة +75%'],
    description: 'ضابط كبير في الاستخبارات',
    unlockMessage: 'رائد المخابرات! المعلومات سر قوتك'
  },
  {
    id: 'colonel',
    name: 'COLONEL',
    title: 'عقيد',
    titleRu: 'Полковник',
    xp: 60000,
    icon: '👑',
    color: '#F44336',
    perks: ['كل الصلاحيات', 'تمثال في الصالة'],
    abilities: ['سرعة تعلم +60%', 'جميع المكافآت ×3'],
    description: 'قادة الألوية والفرق',
    unlockMessage: 'عقيد الجيش! القيادة العليا تنتظرك'
  },
  {
    id: 'general',
    name: 'GENERAL',
    title: 'لواء',
    titleRu: 'Генерал',
    xp: 120000,
    icon: '🦅',
    color: '#E91E63',
    perks: ['نظام رتبة مخصصة', 'إدارة المحتوى'],
    abilities: ['سرعة تعلم +75%', 'تأثير عالمي'],
    description: 'قائد الجيش بأكمله',
    unlockMessage: 'اللواء الأعلى! الجيش تحت قيادتك'
  },
  {
    id: 'marshal',
    name: 'MARSHAL',
    title: 'مشير',
    titleRu: 'Маршал',
    xp: 250000,
    icon: '🔥',
    color: '#FFEB3B',
    perks: ['أسطوري', 'نصب تذكاري'],
    abilities: ['سرعة تعلم +100%', 'أسطورة حية'],
    description: 'أسطورة الجيش الروسي',
    unlockMessage: 'المشير الأسطوري! اسمك في تاريخ الجيش'
  },
  {
    id: 'supreme_commander',
    name: 'SUPREME COMMANDER',
    title: 'القائد الأعلى',
    titleRu: 'Верховный Главнокомандующий',
    xp: 500000,
    icon: '👁️',
    color: '#FFFFFF',
    perks: ['إلهي', 'تخليد الاسم'],
    abilities: ['قوة لا متناهية', 'سيطرة مطلقة'],
    description: 'إمبراطور اللغة الروسية',
    unlockMessage: 'القائد الأعلى! أنت الآن أسطورة خالدة'
  }
];

// دالة الحصول على الرتبة الحالية
export const getCurrentRank = (xp) => {
  return MILITARY_RANKS.reduce((current, rank) => 
    xp >= rank.xp ? rank : current
  , MILITARY_RANKS[0]);
};

// دالة الحصول على الرتبة التالية
export const getNextRank = (xp) => {
  const currentRank = getCurrentRank(xp);
  const currentIndex = MILITARY_RANKS.indexOf(currentRank);
  return MILITARY_RANKS[currentIndex + 1] || null;
};

// دالة حساب التقدم للرتبة التالية
export const getRankProgress = (xp) => {
  const currentRank = getCurrentRank(xp);
  const nextRank = getNextRank(xp);
  
  if (!nextRank) return 100;
  
  const currentXP = xp - currentRank.xp;
  const neededXP = nextRank.xp - currentRank.xp;
  
  return Math.min(100, Math.round((currentXP / neededXP) * 100));
};

// نظام المكافآت عند الترقية
export const getRankUpRewards = (oldRankId, newRankId) => {
  const rewards = {
    xp: 0,
    cards: [],
    perks: [],
    special: null
  };

  const rankIndex = MILITARY_RANKS.findIndex(r => r.id === newRankId);
  
  // مكافآت XP
  rewards.xp = rankIndex * 500;
  
  // بطاقات حصرية حسب الرتبة
  if (rankIndex >= 2) { // عريف فما فوق
    rewards.cards.push('بطاقة القائد الذهبية');
  }
  if (rankIndex >= 4) { // ملازم فما فوق
    rewards.cards.push('بطاقة الاستراتيجي البلاتينية');
  }
  if (rankIndex >= 6) { // عقيد فما فوق
    rewards.cards.push('بطاقة الأسطورة الماسية');
  }
  
  // مكافآت خاصة
  if (newRankId === 'captain') {
    rewards.special = 'قبعة القيادة الذهبية';
  }
  if (newRankId === 'general') {
    rewards.special = 'سيف القيادة الأسطوري';
  }
  if (newRankId === 'supreme_commander') {
    rewards.special = 'تاج الإمبراطور الروسي';
  }

  return rewards;
};