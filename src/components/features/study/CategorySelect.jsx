"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconCpu, IconSearch, IconDatabase, IconBolt, 
  IconArrowRight, IconVersions, IconHash
} from "@tabler/icons-react";
import { useSettings } from "@/context/SettingsContext";
import { useLanguage } from "@/hooks/useLanguage"; // استدعاء الهوك

// ... (TechCorners, SegmentedProgress, DataModuleCard components remain the same, just paste them here)
// تأكد من نسخ المكونات الفرعية TechCorners و SegmentedProgress و DataModuleCard من الإجابة السابقة
// سأضع هنا التعديل على المكون الرئيسي CategorySelect فقط للاختصار، لكن يجب أن يكون الملف كاملاً

// ... (افترض وجود المكونات الفرعية هنا) ...
const TechCorners = ({ color }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 ${color} rounded-tl-sm`}></div>
    <div className={`absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 ${color} rounded-tr-sm`}></div>
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 ${color} rounded-bl-sm`}></div>
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 ${color} rounded-br-sm`}></div>
  </>
);

const SegmentedProgress = ({ percent, color, emptyColor }) => {
  const segments = 10;
  const activeSegments = Math.ceil((percent / 100) * segments);
  return (
    <div className="flex gap-1 h-1.5 w-full mt-4">
      {[...Array(segments)].map((_, i) => (
        <div key={i} className={`flex-1 rounded-sm ${i < activeSegments ? color : emptyColor}`}/>
      ))}
    </div>
  );
};

const DataModuleCard = React.memo(({ category, stats, onClick, index, isDark }) => {
  const percentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  const isMastered = percentage === 100;
  const theme = isMastered 
    ? { text: "text-emerald-500", bg: "bg-emerald-500", border: isDark ? "border-emerald-500/30" : "border-emerald-500/50", glow: "group-hover:shadow-emerald-900/20" }
    : percentage > 50 
    ? { text: "text-cyan-500", bg: "bg-cyan-500", border: isDark ? "border-cyan-500/30" : "border-cyan-500/50", glow: "group-hover:shadow-cyan-900/20" }
    : { text: "text-violet-500", bg: "bg-violet-500", border: isDark ? "border-violet-500/30" : "border-violet-500/50", glow: "group-hover:shadow-violet-900/20" };

  const cardBg = isDark ? "bg-[#09090b]" : "bg-white/80 backdrop-blur-md shadow-sm";
  const cardBorder = isDark ? "border-white/5" : "border-black/5";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const subTextColor = isDark ? "text-white/40" : "text-gray-500";
  const emptyBarColor = isDark ? "bg-white/5" : "bg-black/10";

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={onClick}
      className={`group relative w-full h-[160px] text-left p-5 ${cardBg} ${cardBorder} border rounded-xl hover:border-opacity-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${theme.glow} overflow-hidden`}
    >
      <TechCorners color={theme.border} />
      <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} opacity-5 blur-[60px] group-hover:opacity-15 transition-opacity duration-500`}></div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'} ${theme.text}`}><IconVersions size={22} /></div>
            <div>
              <span className={`block text-[9px] ${subTextColor} font-mono tracking-widest uppercase`}>SEQ_ID: {index + 1}</span>
              <h3 className={`text-lg font-bold ${textColor} leading-none mt-1`}>{category}</h3>
            </div>
          </div>
          <div className={`text-xs font-mono font-bold px-2 py-1 rounded ${isDark ? 'bg-white/5' : 'bg-black/5'} ${theme.text}`}>{percentage}%</div>
        </div>
        <div>
          <div className={`flex justify-between text-[10px] ${subTextColor} font-mono uppercase mb-1`}>
            <span className="flex items-center gap-1"><IconDatabase size={10}/> {stats.total}</span>
            <span>{isMastered ? "COMPLETED" : "IN PROGRESS"}</span>
          </div>
          <SegmentedProgress percent={percentage} color={theme.bg} emptyColor={emptyBarColor} />
        </div>
        <div className={`absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0`}>
            <IconArrowRight size={14} className={theme.text} />
        </div>
      </div>
    </motion.button>
  );
});
DataModuleCard.displayName = "DataModuleCard";

export function CategorySelect({ categories = [], cards = [], activeCategory, onSelect }) {
  const [search, setSearch] = useState("");
  const { isDark } = useSettings();
  const { t, dir } = useLanguage(); // استخدام الترجمة

  const filteredCategories = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    const withStats = safeCategories.map(cat => {
      const catCards = cards.filter(c => c.category === cat);
      return {
        name: cat,
        total: catCards.length,
        mastered: catCards.filter(c => c.level >= 5).length,
      };
    });
    return withStats.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, cards, search]);

  const titleColor = isDark ? "text-white" : "text-emerald-600";
  const subtitleColor = isDark ? "text-white/20" : "text-emerald-600/50";
  const searchBg = isDark ? "bg-[#09090b]" : "bg-white border-black/10 shadow-sm";
  const searchBorder = isDark ? "border-white/10" : "border-black/5";
  const searchPlaceholder = isDark ? "placeholder-white/20" : "placeholder-gray-400";
  const searchInputColor = isDark ? "text-white" : "text-gray-900";
  const emptyStateColor = isDark ? "text-white/30" : "text-gray-400";

  return (
    <div className="w-full h-full flex flex-col font-sans relative px-4 md:px-8 pt-4 pb-0" dir={dir}>
      
      <div className="shrink-0 mb-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <motion.div 
                initial={{opacity:0, x: dir === 'rtl' ? 20 : -20}} 
                animate={{opacity:1, x:0}} 
                className="relative"
            >
                <div className={`absolute ${dir === 'rtl' ? '-right-6' : '-left-6'} top-2 w-1 h-12 bg-cyan-500 hidden md:block`}></div>
                
                <h2 className={`text-5xl md:text-6xl font-black tracking-tighter leading-none ${titleColor}`}>
                    {t('modules_title_1')} <span className={subtitleColor}>{t('modules_title_2')}</span>
                </h2>
                
                <div className="flex items-center gap-3 mt-2 text-cyan-500/60 font-mono text-xs">
                    <IconCpu size={14}/>
                    <span>{t('modules_system_ready')}</span>
                    <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
                    <span>{filteredCategories.length} {t('modules_available')}</span>
                </div>
            </motion.div>

            <div className="w-full md:w-80 group">
                <div className={`relative flex items-center ${searchBg} ${searchBorder} border-b-2 group-focus-within:border-cyan-500 transition-colors py-3 px-2 rounded-t-lg`}>
                    <IconSearch size={20} className={`${isDark ? 'text-white/30' : 'text-gray-400'} ${dir === 'rtl' ? 'ml-3' : 'mr-3'} group-focus-within:text-cyan-500 transition-colors`}/>
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('modules_search_placeholder')}
                        className={`w-full bg-transparent border-none outline-none ${searchInputColor} text-sm font-mono ${searchPlaceholder} uppercase`}
                    />
                    <div className={`text-[10px] ${isDark ? 'text-white/20 bg-white/5' : 'text-gray-500 bg-gray-200'} px-1.5 py-0.5 rounded ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`}>{t('modules_esc')}</div>
                </div>
            </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar pb-32 ${dir === 'rtl' ? '-ml-3 pl-3' : '-mr-3 pr-3'}`}>
        {filteredCategories.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center opacity-50">
                <IconHash size={64} className={`mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`}/>
                <p className={`font-mono text-sm tracking-widest ${emptyStateColor}`}>{t('modules_no_data')}</p>
            </div>
        ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                <AnimatePresence mode="popLayout">
                    {filteredCategories.map((cat, index) => (
                        <DataModuleCard 
                            key={cat.name} 
                            category={cat.name} 
                            stats={{ total: cat.total, mastered: cat.mastered }}
                            index={index}
                            onClick={() => onSelect(cat.name)}
                            isDark={isDark}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>
        )}
      </div>
    </div>
  );
}