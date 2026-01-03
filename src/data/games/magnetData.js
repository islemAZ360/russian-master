export const MAGNET_DATA = [
  // --- Root: ВОД (الماء) ---
  {
    id: 1,
    root: "ВОД (Water)",
    words: [
      { text: "Вода", type: "related", trans: "ماء" },
      { text: "Подводный", type: "related", trans: "تحت مائي" },
      { text: "Водопад", type: "related", trans: "شلال" },
      { text: "Наводнение", type: "related", trans: "فيضان" },
      { text: "Водяной", type: "related", trans: "مائي" },
      // Noise words (كلمات مخادعة)
      { text: "Водитель", type: "noise", trans: "سائق (جذر مختلف)" },
      { text: "Водить", type: "noise", trans: "يقود" },
      { text: "Завод", type: "noise", trans: "مصنع" },
      { text: "Свобода", type: "noise", trans: "حرية" }
    ]
  },
  // --- Root: ХОД (المشي/الحركة) ---
  {
    id: 2,
    root: "ХОД (Move)",
    words: [
      { text: "Выход", type: "related", trans: "خروج" },
      { text: "Вход", type: "related", trans: "دخول" },
      { text: "Пешеход", type: "related", trans: "مشاة" },
      { text: "Поход", type: "related", trans: "نزهة/رحلة" },
      { text: "Уходить", type: "related", trans: "يغادر" },
      // Noise
      { text: "Холод", type: "noise", trans: "برد" },
      { text: "Хор", type: "noise", trans: "جوقة" },
      { text: "Находить", type: "related", trans: "يجد (مجازي)" }, // tricky but related to 'walking upon'
      { text: "Сахар", type: "noise", trans: "سكر" }
    ]
  },
  // --- Root: ПИС (الكتابة) ---
  {
    id: 3,
    root: "ПИС (Write)",
    words: [
      { text: "Писатель", type: "related", trans: "كاتب" },
      { text: "Письмо", type: "related", trans: "رسالة" },
      { text: "Запись", type: "related", trans: "تسجيل" },
      { text: "Подпись", type: "related", trans: "توقيع" },
      { text: "Списывать", type: "related", trans: "يغش/ينسخ" },
      // Noise
      { text: "Писк", type: "noise", trans: "صليل/صرير" },
      { text: "Пистолет", type: "noise", trans: "مسدس" },
      { text: "Список", type: "related", trans: "قائمة (أصلها مكتوب)" } // Tricky, usually accepted
    ]
  },
  // --- Root: РЕЗ (القطع) ---
  {
    id: 4,
    root: "РЕЗ (Cut)",
    words: [
      { text: "Резать", type: "related", trans: "يقطع" },
      { text: "Отрезок", type: "related", trans: "قطعة/جزء" },
      { text: "Резкий", type: "related", trans: "حاد/قاطع" },
      { text: "Вырез", type: "related", trans: "قصة (رقبة)" },
      // Noise
      { text: "Резина", type: "noise", trans: "مطاط" },
      { text: "Резерв", type: "noise", trans: "احتياطي" },
      { text: "Трезвый", type: "noise", trans: "صاحي (غير سكران)" }
    ]
  },
  // --- Root: ЛЕТ (الطيران) ---
  {
    id: 5,
    root: "ЛЕТ (Fly)",
    words: [
      { text: "Самолет", type: "related", trans: "طائرة" },
      { text: "Летчик", type: "related", trans: "طيار" },
      { text: "Полет", type: "related", trans: "رحلة طيران" },
      { text: "Вертолет", type: "related", trans: "هليكوبتر" },
      // Noise
      { text: "Лето", type: "noise", trans: "صيف" },
      { text: "Котлета", type: "noise", trans: "كفتة" },
      { text: "Билет", type: "noise", trans: "تذكرة" }
    ]
  }
];