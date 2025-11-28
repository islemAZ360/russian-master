import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconTrash, IconPencil, IconSearch, IconDatabase, IconCpu } from "@tabler/icons-react";

export function DataManager({ onAdd, onDelete, onUpdate, cards }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editRus, setEditRus] = useState("");
  const [editAra, setEditAra] = useState("");

  const categories = ["All", ...new Set(cards.map(c => c.category || "Uncategorized"))];

  const filteredCards = useMemo(() => {
      return cards.filter(c => {
        const matchesSearch = c.russian.toLowerCase().includes(search.toLowerCase()) || c.arabic.includes(search);
        const matchesFilter = filter === "All" || (c.category || "Uncategorized") === filter;
        return matchesSearch && matchesFilter;
      });
  }, [cards, search, filter]);

  // --- دوال التعديل ---
  const startEdit = (card) => { setEditingId(card.id); setEditRus(card.russian); setEditAra(card.arabic); };
  const saveEdit = () => { onUpdate(editingId, editRus, editAra); setEditingId(null); };

  return (
    // التغيير هنا: h-screen لملء الشاشة، و overflow-hidden لمنع تمرير الصفحة بالكامل
    <div className="w-full h-screen flex flex-col p-6 overflow-hidden relative">
      
      {/* Header Fixed */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 shrink-0 z-10">
        <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                <IconDatabase size={40} className="text-cyan-500 animate-pulse" />
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">
                        NEURAL<span className="text-cyan-500">_</span>DATA
                    </h1>
                    {/* إصلاح: عداد الكلمات الإجمالي */}
                    <div className="flex items-center gap-2 text-cyan-400/60 text-xs font-mono tracking-widest mt-1">
                        <IconCpu size={12}/> 
                        <span>TOTAL UNITS: <span className="text-white font-bold text-lg">{cards.length}</span></span>
                        <span>|</span>
                        <span>FILTERED: <span className="text-white font-bold">{filteredCards.length}</span></span>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Search */}
        <div className="w-full md:w-80 mt-4 md:mt-0">
             <div className="relative group">
                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="SCAN DATABASE..." 
                    className="w-full bg-cyan-900/10 border border-cyan-500/30 rounded-none border-l-2 border-r-2 border-t-0 border-b-0 py-3 pl-12 pr-4 text-white focus:bg-cyan-900/20 outline-none transition-all font-mono text-sm"
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
                {/* زخرفة تقنية */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-500/50 group-focus-within:bg-cyan-400 group-focus-within:shadow-[0_0_10px_#06b6d4] transition-all"></div>
            </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 shrink-0 custom-scrollbar z-10">
        {categories.map(cat => (
            <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest border transition-all skew-x-[-10deg] ${
                    filter === cat 
                    ? "bg-cyan-500 text-black border-cyan-500" 
                    : "bg-transparent text-cyan-500 border-cyan-500/30 hover:border-cyan-500 hover:text-white"
                }`}
            >
                <span className="skew-x-[10deg] inline-block">{cat}</span>
            </button>
        ))}
      </div>

      {/* Grid Container - Scrollable Area */}
      {/* التغيير الجوهري: هذا الكونتينر هو الوحيد الذي يقبل التمرير */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
                {filteredCards.map((card, i) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                        key={card.id} 
                        className="group relative bg-black/40 border border-white/5 p-5 hover:border-cyan-500/50 transition-all hover:bg-cyan-900/10"
                    >
                        {/* زوايا تقنية للبطاقة */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {editingId === card.id ? (
                            <div className="flex flex-col gap-2 relative z-10">
                                <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-white/5 border border-cyan-500/50 p-2 text-white outline-none font-bold text-sm" autoFocus />
                                <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-white/5 border border-emerald-500/50 p-2 text-white text-right outline-none font-cairo text-sm" />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={saveEdit} className="flex-1 bg-emerald-500/20 text-emerald-400 py-1 text-[10px] font-bold hover:bg-emerald-500/30">SAVE</button>
                                    <button onClick={() => setEditingId(null)} className="flex-1 bg-white/5 text-white/40 py-1 text-[10px] font-bold hover:bg-white/10">CANCEL</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <span className="text-[9px] font-mono text-cyan-500/40 uppercase truncate max-w-[70%]">
                                        //{card.category || "NULL"}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(card)} className="text-blue-400 hover:text-white transition-colors"><IconPencil size={14} /></button>
                                        <button onClick={() => onDelete(card.id)} className="text-red-400 hover:text-white transition-colors"><IconTrash size={14} /></button>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold text-white mb-1">{card.russian}</h3>
                                    <p className="text-md text-cyan-200/60 dir-rtl font-cairo">{card.arabic}</p>
                                </div>
                            </>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}