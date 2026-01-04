"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconCpu, IconSearch, IconDatabase, IconArrowRight, IconVersions, IconHash
} from "@tabler/icons-react";
import { useSettings } from "@/context/SettingsContext";
import { useLanguage } from "@/hooks/useLanguage";

// مكون الزوايا التقنية
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

const DataModuleCard = React.memo(({ category, stats, onClick, index, isDark, t }) => {
  const percentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  const isMastered = percentage === 100;
  
  // دالة لتحويل اسم المجموعة لمفتاح ترجمة (مثلاً: General -> cat_general)
  const getCatKey = (name) => `cat_${name.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`;

  const theme = isMastered 
    ? { text: "text-emerald-500", bg: "bg-emerald-500", border: isDark ? "border-emerald-500/30" : "border-emerald-500/50" }
    : percentage > 50 
    ? { text: "text-cyan-500", bg: "bg-cyan-500", border: isDark ? "border-cyan-500/30" : "border-cyan-500/50" }
    : { text: "text-violet-500", bg: "bg-violet-500", border: isDark ? "border-violet-500/30" : "border-violet-500/50" };

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`group relative w-full h-[160px] text-left p-5 ${isDark ? 'bg-[#09090b] border-white/5' : 'bg-white border-black/5 shadow-sm'} border rounded-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
    >
      <TechCorners color={theme.border} />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/5 ${theme.text}`}><IconVersions size={22} /></div>
            <div>
              <span className="block text-[9px] opacity-40 font-mono tracking-widest uppercase">SEQ_ID: {index + 1}</span>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} leading-none mt-1`}>
                {t(getCatKey(category))}
              </h3>
            </div>
          </div>
          <div className={`text-xs font-mono font-bold px-2 py-1 rounded bg-white/5 ${theme.text}`}>{percentage}%</div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] opacity-40 font-mono uppercase mb-1">
            <span className="flex items-center gap-1"><IconDatabase size={10}/> {stats.total}</span>
            <span>{isMastered ? "COMPLETED" : "IN PROGRESS"}</span>
          </div>
          <SegmentedProgress percent={percentage} color={theme.bg} emptyColor="bg-white/5" />
        </div>
      </div>
    </motion.button>
  );
});
DataModuleCard.displayName = "DataModuleCard";

export function CategorySelect({ categories = [], cards = [], activeCategory, onSelect }) {
  const [search, setSearch] = useState("");
  const { isDark } = useSettings();
  const { t, dir } = useLanguage();

  const filteredCategories = useMemo(() => {
    return categories.map(cat => {
      const catCards = cards.filter(c => c.category === cat);
      return {
        name: cat,
        total: catCards.length,
        mastered: catCards.filter(c => c.level >= 5).length,
      };
    }).filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, cards, search]);

  return (
    <div className="w-full h-full flex flex-col px-4 md:px-8 pt-4 pb-0" dir={dir}>
      <div className="shrink-0 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <motion.div initial={{opacity:0, x: -20}} animate={{opacity:1, x:0}}>
                <h2 className={`text-5xl md:text-6xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-emerald-600'}`}>
                    {t('modules_title_1')} <span className="opacity-20">{t('modules_title_2')}</span>
                </h2>
                <div className="flex items-center gap-3 mt-2 text-cyan-500/60 font-mono text-xs">
                    <IconCpu size={14}/>
                    <span>{t('modules_system_ready')}</span>
                    <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
                    <span>{filteredCategories.length} {t('modules_available')}</span>
                </div>
            </motion.div>

            <div className="w-full md:w-80 relative">
                <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"/>
                <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('modules_search_placeholder')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500 transition-all font-mono text-sm uppercase"
                />
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
        {filteredCategories.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center opacity-20">
                <IconHash size={64} className="mb-4"/>
                <p className="font-mono text-sm tracking-widest">{t('modules_no_data')}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                <AnimatePresence mode="popLayout">
                    {filteredCategories.map((cat, index) => (
                        <DataModuleCard 
                            key={cat.name} 
                            category={cat.name} 
                            stats={{ total: cat.total, mastered: cat.mastered }}
                            index={index}
                            onClick={() => onSelect(cat.name)}
                            isDark={isDark}
                            t={t}
                        />
                    ))}
                </AnimatePresence>
            </div>
        )}
      </div>
    </div>
  );
}