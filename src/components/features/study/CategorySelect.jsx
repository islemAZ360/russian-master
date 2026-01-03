"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconCpu, IconSearch, IconDatabase, IconChartBar, 
  IconLock, IconLockOpen, IconArrowRight, IconCategory 
} from "@tabler/icons-react";

// --- مكون البطاقة الذكية (Module Card) ---
const ModuleCard = React.memo(({ category, stats, onClick, index }) => {
  const isLocked = stats.total === 0;
  const percentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      disabled={isLocked}
      className={`group relative w-full text-left overflow-hidden rounded-2xl border transition-all duration-300
        ${isLocked 
          ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' 
          : 'bg-[#0f0f0f]/80 border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/10 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]'
        }
      `}
    >
      {/* Background Tech Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="p-5 relative z-10 flex flex-col h-full justify-between min-h-[140px]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-xl border ${isLocked ? 'bg-white/5 border-white/5' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
            <IconCategory size={22} />
          </div>
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-white/5">
            MOD-{index + 1 < 10 ? `0${index + 1}` : index + 1}
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-cyan-400 transition-colors">
            {category}
          </h3>
          
          <div className="flex items-center gap-3 text-xs text-white/40 font-mono mb-3">
            <span className="flex items-center gap-1"><IconDatabase size={12}/> {stats.total} UNITS</span>
            <span className="flex items-center gap-1"><IconChartBar size={12}/> {percentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${percentage === 100 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
            />
          </div>
        </div>

        {/* Hover Action */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
           <IconArrowRight className="text-cyan-400" size={20} />
        </div>
      </div>
    </motion.button>
  );
});

ModuleCard.displayName = "ModuleCard";

// --- المكون الرئيسي ---
export function CategorySelect({ categories = [], cards = [], activeCategory, onSelect }) {
  const [search, setSearch] = useState("");

  // 1. حساب الإحصائيات لكل قسم (Memoized للأداء)
  const categoriesWithStats = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    
    return safeCategories.map(cat => {
      const catCards = cards.filter(c => c.category === cat);
      const total = catCards.length;
      const mastered = catCards.filter(c => c.level >= 5).length;
      return {
        name: cat,
        total,
        mastered,
        isNew: total > 0 && mastered === 0
      };
    });
  }, [categories, cards]);

  // 2. الفلترة
  const filteredCategories = useMemo(() => {
    return categoriesWithStats.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categoriesWithStats, search]);

  return (
    <div className="w-full h-full flex flex-col font-sans relative">
      
      {/* HEADER SECTION */}
      <div className="shrink-0 pt-2 pb-6 px-1 z-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div>
                <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="flex items-center gap-3 mb-2">
                    <IconCpu className="text-cyan-500 animate-pulse" size={28} />
                    <span className="text-xs font-bold text-cyan-500 tracking-[0.3em] uppercase bg-cyan-950/30 border border-cyan-500/20 px-3 py-1 rounded-full">System Modules</span>
                </motion.div>
                <h2 className="text-4xl font-black text-white tracking-tighter">
                    NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">ARCHIVE</span>
                </h2>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-72 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30 group-focus-within:text-cyan-400 transition-colors">
                    <IconSearch size={18} />
                </div>
                <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="SEARCH MODULES..."
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all font-mono uppercase"
                />
            </div>
        </div>

        {/* Stats Overview */}
        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-xs text-white/60 whitespace-nowrap">
                TOTAL MODULES: <span className="text-white font-bold">{categoriesWithStats.length}</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 whitespace-nowrap">
                COMPLETED: <span className="font-bold">{categoriesWithStats.filter(c => c.total > 0 && c.mastered === c.total).length}</span>
            </div>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 pr-2">
        {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-white/20">
                <IconSearch size={48} className="mb-4 opacity-50"/>
                <p className="font-mono text-sm">NO DATA FOUND</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredCategories.map((cat, index) => (
                        <ModuleCard 
                            key={cat.name} 
                            category={cat.name} 
                            stats={{ total: cat.total, mastered: cat.mastered }}
                            index={index}
                            onClick={() => onSelect(cat.name)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        )}
      </div>
    </div>
  );
}