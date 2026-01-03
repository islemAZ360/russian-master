"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconCpu, IconSearch, IconDatabase, IconBolt, 
  IconArrowRight, IconCategory, IconTerminal, IconFolders 
} from "@tabler/icons-react";

// --- بطاقة عالية الأداء (CSS-Based) ---
const ModuleCard = React.memo(({ category, stats, onClick, index }) => {
  const percentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  
  // تحديد اللون بناءً على الإنجاز (أخضر للمكتمل، أزرق للباقي)
  const isMastered = percentage === 100;
  const activeColor = isMastered ? "text-emerald-400" : "text-cyan-400";
  const activeBorder = isMastered ? "group-hover:border-emerald-500/50" : "group-hover:border-cyan-500/50";
  const activeGlow = isMastered ? "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]" : "group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.03 }} // تأخير بسيط جداً للدخول
      onClick={onClick}
      className={`
        group relative h-[160px] w-full cursor-pointer 
        rounded-2xl border border-white/5 bg-[#080808] 
        overflow-hidden transition-all duration-300 ease-out
        hover:-translate-y-1 hover:bg-[#0f0f0f] ${activeBorder} ${activeGlow}
      `}
    >
      {/* 1. زخرفة خلفية ثابتة (خفيفة جداً) */}
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        <IconCategory size={80} />
      </div>
      
      {/* 2. خط سفلي مضيء */}
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-white/5`}>
        <div 
            style={{ width: `${percentage}%` }} 
            className={`h-full ${isMastered ? 'bg-emerald-500' : 'bg-cyan-600'} shadow-[0_0_10px_currentColor] transition-all duration-1000`}
        ></div>
      </div>

      <div className="relative z-10 p-5 flex flex-col h-full justify-between">
        
        {/* Header */}
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${activeColor}`}>
                    {isMastered ? <IconBolt size={20}/> : <IconFolders size={20}/>}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Protocol {index + 1 < 10 ? `0${index+1}` : index+1}</span>
                    <h3 className={`text-lg font-bold text-white leading-tight group-hover:translate-x-1 transition-transform ${activeColor}`}>
                        {category}
                    </h3>
                </div>
            </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4 text-xs font-mono text-white/40">
                <span className="flex items-center gap-1 group-hover:text-white transition-colors">
                    <IconDatabase size={14}/> {stats.total}
                </span>
                <span className={`flex items-center gap-1 ${percentage > 0 ? activeColor : ''}`}>
                    {percentage}%
                </span>
            </div>

            {/* Action Button */}
            <div className={`
                w-8 h-8 rounded-full border border-white/10 flex items-center justify-center 
                text-white/50 group-hover:text-black group-hover:bg-white 
                group-hover:border-white transition-all duration-300
            `}>
                <IconArrowRight size={14} className="group-hover:-rotate-45 transition-transform duration-300"/>
            </div>
        </div>
      </div>
    </motion.div>
  );
});

ModuleCard.displayName = "ModuleCard";

// --- المكون الرئيسي ---
export function CategorySelect({ categories = [], cards = [], activeCategory, onSelect }) {
  const [search, setSearch] = useState("");

  // استخدام useMemo للحسابات الثقيلة
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
    <div className="w-full h-full flex flex-col font-sans relative px-4 md:px-8 py-6">
      
      {/* HEADER */}
      <div className="shrink-0 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <div className="flex items-center gap-2 mb-2 text-cyan-500 opacity-80">
                    <IconTerminal size={18} />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">System Database</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                    DATA <span className="text-white/20">MODULES</span>
                </h2>
            </div>

            {/* Search Input - Optimized */}
            <div className="w-full md:w-72">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30 group-focus-within:text-cyan-400 transition-colors">
                        <IconSearch size={18} />
                    </div>
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SEARCH..."
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/50 transition-colors font-mono"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* GRID AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 -mr-2 pr-2">
        {filteredCategories.length === 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/30 font-mono text-sm">NO MODULES FOUND</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {/* إزالة AnimatePresence للشبكة الكبيرة لتحسين الأداء، الحركات تتم عبر CSS */}
                {filteredCategories.map((cat, index) => (
                    <ModuleCard 
                        key={cat.name} 
                        category={cat.name} 
                        stats={{ total: cat.total, mastered: cat.mastered }}
                        index={index}
                        onClick={() => onSelect(cat.name)} 
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}