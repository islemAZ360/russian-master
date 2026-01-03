"use client";
import React, { useState, useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { 
  IconCpu, IconSearch, IconDatabase, IconBolt, IconLockOpen, 
  IconArrowRight, IconCategory, IconActivity, IconCode 
} from "@tabler/icons-react";

// --- تأثير النص الرقمي (Decoding Effect) ---
const DecryptLabel = ({ text, active }) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
  const [display, setDisplay] = useState(text);

  React.useEffect(() => {
    if (!active) {
        setDisplay(text);
        return;
    }
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(prev => 
        text.split("").map((letter, index) => {
          if (index < iterations) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      if (iterations >= text.length) clearInterval(interval);
      iterations += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [active, text]);

  return <span className="font-mono tracking-widest">{display}</span>;
};

// --- المكون الفرعي: البطاقة ثلاثية الأبعاد (3D Card) ---
const HighTechCard = ({ category, stats, onClick, index }) => {
  const percentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  
  // فيزياء الحركة
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXVal = e.clientX - rect.left;
    const mouseYVal = e.clientY - rect.top;
    const xPct = mouseXVal / width - 0.5;
    const yPct = mouseYVal / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  // تحديد الألوان
  const themeColor = percentage === 100 ? "text-emerald-400" : percentage > 50 ? "text-cyan-400" : "text-violet-400";
  const glowColor = percentage === 100 ? "shadow-emerald-500/20" : percentage > 50 ? "shadow-cyan-500/20" : "shadow-violet-500/20";
  const borderGradient = percentage === 100 
    ? "from-emerald-500/50 via-emerald-500/10 to-transparent" 
    : percentage > 50 
    ? "from-cyan-500/50 via-cyan-500/10 to-transparent" 
    : "from-violet-500/50 via-violet-500/10 to-transparent";

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`group relative h-[220px] w-full cursor-pointer rounded-[20px] bg-[#050505] perspective-1000 ${glowColor} hover:shadow-2xl transition-shadow duration-500`}
    >
      {/* 1. Border Gradient Container */}
      <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${borderGradient} opacity-30 group-hover:opacity-100 transition-opacity duration-500 p-[1px]`}>
        
        {/* 2. Inner Black Card */}
        <div className="relative h-full w-full rounded-[19px] bg-[#080808] overflow-hidden">
            
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20"></div>
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,255,255,0.02)_50%,transparent)] bg-[length:100%_4px] pointer-events-none"></div>

            {/* Glowing Blob following mouse */}
            <motion.div 
                className="absolute w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none mix-blend-overlay"
                animate={{
                    x: useTransform(mouseX, [-0.5, 0.5], [-100, 100]),
                    y: useTransform(mouseY, [-0.5, 0.5], [-100, 100]),
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 h-full p-6 flex flex-col justify-between" style={{ transform: "translateZ(20px)" }}>
                
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-white/30 tracking-[0.2em] mb-1">
                            SECURE_PROTOCOL_0{index + 1}
                        </span>
                        <h3 className={`text-2xl font-black text-white leading-none tracking-tight group-hover:translate-x-1 transition-transform ${isHovered ? themeColor : 'text-white'}`}>
                            <DecryptLabel text={category} active={isHovered} />
                        </h3>
                    </div>
                    
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <IconCategory size={20} className={isHovered ? themeColor : "text-gray-500"} />
                    </div>
                </div>

                {/* Data Visualization Area */}
                <div className="flex-1 flex items-center py-2">
                    <div className="w-full flex items-end gap-1 h-12 opacity-30">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className={`flex-1 bg-current rounded-sm transition-all duration-500 ${isHovered ? themeColor : 'text-white'}`} style={{ height: `${Math.random() * 100}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* Footer Stats */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 font-mono">DATABASE SIZE</span>
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                <IconDatabase size={14} className={themeColor}/> {stats.total}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className={`text-2xl font-black font-mono ${themeColor}`}>{percentage}%</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className={`h-full ${percentage === 100 ? 'bg-emerald-500' : percentage > 50 ? 'bg-cyan-500' : 'bg-violet-500'} relative`}
                        >
                            <div className="absolute inset-0 bg-white/50 animate-[shimmer_1s_infinite]"></div>
                        </motion.div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- المكون الرئيسي ---
export function CategorySelect({ categories = [], cards = [], activeCategory, onSelect }) {
  const [search, setSearch] = useState("");

  const categoriesWithStats = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    return safeCategories.map(cat => {
      const catCards = cards.filter(c => c.category === cat);
      return {
        name: cat,
        total: catCards.length,
        mastered: catCards.filter(c => c.level >= 5).length,
      };
    });
  }, [categories, cards]);

  const filteredCategories = useMemo(() => {
    return categoriesWithStats.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categoriesWithStats, search]);

  return (
    <div className="w-full h-full flex flex-col font-sans relative p-6 md:p-10 overflow-hidden">
      
      {/* 1. Header Area - تصميم ضخم */}
      <div className="shrink-0 mb-12 relative z-20">
        <div className="flex flex-col xl:flex-row justify-between items-end gap-8">
            <motion.div initial={{opacity:0, x:-50}} animate={{opacity:1, x:0}} transition={{duration:0.8}}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-px w-10 bg-cyan-500"></div>
                    <span className="text-xs font-black tracking-[0.4em] text-cyan-500 uppercase">System Database</span>
                </div>
                <h2 className="text-6xl md:text-7xl font-black text-white leading-none tracking-tighter">
                    DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 animate-pulse">MODULES</span>
                </h2>
                <p className="mt-4 text-white/40 max-w-md font-mono text-sm border-l-2 border-white/10 pl-4">
                    // ACCESS_LEVEL: GRANTED <br/>
                    // SELECT A MEMORY CORE TO BEGIN NEURAL SYNCHRONIZATION.
                </p>
            </motion.div>

            {/* Search Bar - تصميم مستقبلي */}
            <div className="w-full xl:w-96 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-violet-600 rounded-lg blur opacity-20 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-black border border-white/10 rounded-lg p-1 flex items-center">
                    <div className="bg-white/5 p-3 rounded border border-white/5 text-white/50">
                        <IconCode size={20}/>
                    </div>
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SEARCH_QUERY..."
                        className="w-full bg-transparent border-none outline-none text-white px-4 font-mono text-sm placeholder-white/20 uppercase"
                    />
                    <div className="text-[10px] text-white/20 font-mono pr-3 animate-pulse">
                        _
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Grid Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 -mr-4 pr-4">
        {filteredCategories.length === 0 ? (
            <div className="h-96 w-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                <IconActivity size={64} className="text-white/10 mb-4 animate-spin-slow"/>
                <h3 className="text-xl font-bold text-white/30">NO DATA FOUND</h3>
                <p className="text-xs font-mono text-white/20 mt-2">TRY DIFFERENT PARAMETERS</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredCategories.map((cat, index) => (
                        <HighTechCard 
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