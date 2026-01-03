"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconCpu, IconSearch, IconDatabase, IconBolt, 
  IconArrowRight, IconVersions, IconHash, IconActivity
} from "@tabler/icons-react";

// --- مكون الزوايا التقنية (للتزيين فقط - خفيف جداً) ---
const TechCorners = ({ color = "border-white/20" }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 ${color} rounded-tl-sm transition-colors duration-300`}></div>
    <div className={`absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 ${color} rounded-tr-sm transition-colors duration-300`}></div>
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 ${color} rounded-bl-sm transition-colors duration-300`}></div>
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 ${color} rounded-br-sm transition-colors duration-300`}></div>
  </>
);

// --- شريط التقدم المقطع (Segmented Bar) ---
const SegmentedProgress = ({ percent, color }) => {
  const segments = 10;
  const activeSegments = Math.ceil((percent / 100) * segments);
  
  return (
    <div className="flex gap-1 h-1.5 w-full mt-4">
      {[...Array(segments)].map((_, i) => (
        <div 
          key={i} 
          className={`flex-1 rounded-sm transition-all duration-500 ${
            i < activeSegments ? color : 'bg-white/5'
          }`}
        />
      ))}
    </div>
  );
};

// --- البطاقة الاحترافية ---
const DataModuleCard = React.memo(({ category, stats, onClick, index }) => {
  const percentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  const isMastered = percentage === 100;
  
  // تحديد الثيم اللوني
  const theme = isMastered 
    ? { text: "text-emerald-400", bg: "bg-emerald-500", border: "border-emerald-500/30", glow: "group-hover:shadow-emerald-900/20" }
    : percentage > 50 
    ? { text: "text-cyan-400", bg: "bg-cyan-500", border: "border-cyan-500/30", glow: "group-hover:shadow-cyan-900/20" }
    : { text: "text-violet-400", bg: "bg-violet-500", border: "border-violet-500/30", glow: "group-hover:shadow-violet-900/20" };

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={onClick}
      className={`
        group relative w-full h-[160px] text-left p-5 
        bg-[#09090b] border border-white/5 rounded-xl 
        hover:border-opacity-50 transition-all duration-300 
        hover:-translate-y-1 hover:shadow-2xl ${theme.glow}
        overflow-hidden
      `}
    >
      {/* Tech Corners Effect */}
      <TechCorners color={theme.border} />

      {/* Background Gradient Mesh */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} opacity-5 blur-[60px] group-hover:opacity-15 transition-opacity duration-500`}></div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/5 ${theme.text}`}>
              <IconVersions size={22} />
            </div>
            <div>
              <span className="block text-[9px] text-white/30 font-mono tracking-widest uppercase">
                SEQ_ID: {index + 1}
              </span>
              <h3 className={`text-lg font-bold text-white group-hover:text-white transition-colors leading-none mt-1`}>
                {category}
              </h3>
            </div>
          </div>
          
          {/* Percentage Badge */}
          <div className={`text-xs font-mono font-bold px-2 py-1 rounded bg-white/5 ${theme.text}`}>
            {percentage}%
          </div>
        </div>

        {/* Bottom Section */}
        <div>
          <div className="flex justify-between text-[10px] text-white/40 font-mono uppercase mb-1">
            <span className="flex items-center gap-1"><IconDatabase size={10}/> Capacity: {stats.total}</span>
            <span>{isMastered ? "COMPLETED" : "IN PROGRESS"}</span>
          </div>
          
          {/* Visual Progress */}
          <SegmentedProgress percent={percentage} color={theme.bg} />
        </div>

        {/* Hover Action Indicator */}
        <div className={`
            absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-all duration-300
            translate-y-2 group-hover:translate-y-0
        `}>
            <IconArrowRight size={14} className={theme.text} />
        </div>

      </div>
    </motion.button>
  );
});

DataModuleCard.displayName = "DataModuleCard";

// --- المكون الرئيسي ---
export function CategorySelect({ categories = [], cards = [], activeCategory, onSelect }) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    
    // 1. حساب الإحصائيات
    const withStats = safeCategories.map(cat => {
      const catCards = cards.filter(c => c.category === cat);
      return {
        name: cat,
        total: catCards.length,
        mastered: catCards.filter(c => c.level >= 5).length,
      };
    });

    // 2. الفلترة
    return withStats.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, cards, search]);

  return (
    <div className="w-full h-full flex flex-col font-sans relative px-4 md:px-8 pt-4 pb-0">
      
      {/* HEADER SECTION */}
      <div className="shrink-0 mb-8 space-y-6">
        {/* Title & Decorative Elements */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                className="relative"
            >
                <div className="absolute -left-6 top-2 w-1 h-12 bg-cyan-500 hidden md:block"></div>
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
                    DATA <span className="text-white/20">MODULES</span>
                </h2>
                <div className="flex items-center gap-3 mt-2 text-cyan-500/60 font-mono text-xs">
                    <IconCpu size={14}/>
                    <span>SYSTEM_READY</span>
                    <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
                    <span>{filteredCategories.length} AVAILABLE</span>
                </div>
            </motion.div>

            {/* Futuristic Search Bar */}
            <div className="w-full md:w-80 group">
                <div className="relative flex items-center bg-[#09090b] border-b-2 border-white/10 group-focus-within:border-cyan-500 transition-colors py-3">
                    <IconSearch size={20} className="text-white/30 mr-3 group-focus-within:text-cyan-500 transition-colors"/>
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="FILTER_PROTOCOL..."
                        className="w-full bg-transparent border-none outline-none text-white text-sm font-mono placeholder-white/20 uppercase"
                    />
                    <div className="text-[10px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded ml-2">ESC</div>
                </div>
            </div>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 -mr-3 pr-3">
        {filteredCategories.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center opacity-30">
                <IconHash size={64} className="mb-4"/>
                <p className="font-mono text-sm tracking-widest">NO MATCHING DATA</p>
            </div>
        ) : (
            <motion.div 
                layout 
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
            >
                <AnimatePresence mode="popLayout">
                    {filteredCategories.map((cat, index) => (
                        <DataModuleCard 
                            key={cat.name} 
                            category={cat.name} 
                            stats={{ total: cat.total, mastered: cat.mastered }}
                            index={index}
                            onClick={() => onSelect(cat.name)}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>
        )}
      </div>
    </div>
  );
}