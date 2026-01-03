"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconCpu, IconSearch, IconDatabase, IconBolt, 
  IconArrowRight, IconVersions, IconHash, IconActivity,
  IconBarcode, IconWifi, IconServer
} from "@tabler/icons-react";

// --- تأثير النص المشفر (Static Decorator) ---
const TechDecor = () => (
  <div className="flex justify-between items-center opacity-30 text-[8px] font-mono mb-2 select-none">
    <span>HEX_{Math.floor(Math.random()*999)}</span>
    <div className="flex gap-1">
      <div className="w-1 h-1 bg-current rounded-full"></div>
      <div className="w-1 h-1 bg-current rounded-full"></div>
      <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
    </div>
  </div>
);

// --- البطاقة السينمائية (Cinematic Card) ---
const DataModuleCard = React.memo(({ category, stats, onClick, index }) => {
  const percentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  const isMastered = percentage === 100;
  
  // تحديد الثيم اللوني (Neon Palettes)
  const theme = isMastered 
    ? { 
        main: "text-emerald-400", 
        glow: "shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]", 
        border: "border-emerald-500/30",
        bg: "from-emerald-950/50 to-black",
        bar: "bg-emerald-500"
      }
    : percentage > 50 
    ? { 
        main: "text-cyan-400", 
        glow: "shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]", 
        border: "border-cyan-500/30",
        bg: "from-cyan-950/50 to-black",
        bar: "bg-cyan-500"
      }
    : { 
        main: "text-violet-400", 
        glow: "shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]", 
        border: "border-violet-500/30",
        bg: "from-violet-950/50 to-black",
        bar: "bg-violet-500"
      };

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={onClick}
      className={`
        group relative w-full h-[200px] text-left overflow-hidden 
        rounded-2xl border bg-gradient-to-br ${theme.bg} ${theme.border}
        hover:border-opacity-100 transition-all duration-300 ${theme.glow}
        backdrop-blur-md
      `}
    >
      {/* 1. Scanner Effect (The Shine) */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite] skew-x-12 z-0"></div>
      
      {/* 2. Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="relative z-10 p-6 flex flex-col h-full justify-between">
        
        {/* Top: Header & ID */}
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className={`
                    w-10 h-10 rounded-lg bg-black/50 border border-white/10 
                    flex items-center justify-center ${theme.main} 
                    group-hover:scale-110 transition-transform
                `}>
                    {isMastered ? <IconBolt size={20} /> : <IconCpu size={20} />}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white leading-none tracking-tight group-hover:text-white transition-colors">
                        {category}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 ${theme.main}`}>
                            ID-{index + 10}
                        </span>
                        {isMastered && <span className="text-[9px] text-emerald-500 font-bold tracking-widest">MASTERED</span>}
                    </div>
                </div>
            </div>
            
            <IconBarcode className="text-white/10 group-hover:text-white/30 transition-colors" size={24} />
        </div>

        {/* Middle: Tech Decorator */}
        <TechDecor />

        {/* Bottom: Stats & Progress */}
        <div className="space-y-3">
            <div className="flex justify-between items-end text-xs font-mono text-white/50">
                <span className="flex items-center gap-1 group-hover:text-white transition-colors">
                    <IconDatabase size={12}/> {stats.total} UNITS
                </span>
                <span className={`${theme.main} font-bold`}>{percentage}%</span>
            </div>

            {/* Advanced Progress Bar */}
            <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${theme.bar} relative`}
                >
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-white/20"></div>
                </motion.div>
            </div>
        </div>

        {/* Hover Arrow */}
        <div className={`absolute bottom-4 right-4 ${theme.main} opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300`}>
            <IconArrowRight size={18} />
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

  return (
    <div className="w-full h-full flex flex-col font-sans relative">
      
      {/* 1. TOP HEADER (HUD Style) */}
      <div className="shrink-0 px-6 pt-6 pb-8 border-b border-white/5 bg-black/20 backdrop-blur-md z-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 max-w-[1920px] mx-auto">
            <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}}>
                <div className="flex items-center gap-2 mb-1 text-cyan-500/80">
                    <IconActivity size={16} className="animate-pulse"/>
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase">System Database V.2</span>
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter">
                    DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">ARCHIVE</span>
                </h2>
            </motion.div>

            {/* Advanced Search */}
            <div className="w-full md:w-96">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-cyan-400 transition-colors">
                        <IconSearch size={18} />
                    </div>
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SEARCH PROTOCOLS..."
                        className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/50 focus:bg-black transition-all font-mono uppercase shadow-inner"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        <span className="text-[10px] text-white/20 border border-white/10 px-1.5 rounded">CTRL+K</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. GRID AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-[1920px] mx-auto">
            {filteredCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 border border-dashed border-white/5 rounded-3xl opacity-50">
                    <IconHash size={64} className="text-white/20 mb-4"/>
                    <p className="font-mono text-sm tracking-widest text-white/40">DATABASE EMPTY</p>
                </div>
            ) : (
                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
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

      {/* 3. SYSTEM FOOTER (Aesthetic) */}
      <div className="shrink-0 h-10 border-t border-white/5 bg-[#050505] flex items-center px-6 justify-between text-[10px] font-mono text-white/30 select-none">
          <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><IconWifi size={12} className="text-emerald-500"/> SYSTEM ONLINE</span>
              <span className="flex items-center gap-1.5"><IconServer size={12}/> {filteredCategories.length} MODULES LOADED</span>
          </div>
          <div className="hidden md:block">
              SECURE CONNECTION :: ENCRYPTED
          </div>
      </div>

    </div>
  );
}