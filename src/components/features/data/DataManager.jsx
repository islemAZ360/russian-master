"use client";
import React, { useState, useMemo, useEffect } from "react";
import { 
  IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, 
  IconPlus, IconCategory, IconLanguage, IconSparkles 
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export function DataManager({ onAdd, onDelete, onUpdate, cards = [], isJunior }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [displayLimit, setDisplayLimit] = useState(20);
  const [newCard, setNewCard] = useState({ russian: "", arabic: "", category: "General" });
  const [editingId, setEditingId] = useState(null);
  const [editRus, setEditRus] = useState("");
  const [editAra, setEditAra] = useState("");

  const categories = useMemo(() => ["All", ...new Set(cards.map(c => c.category || "Uncategorized"))], [cards]);

  const filteredCards = useMemo(() => {
      return cards.filter(c => {
        const matchesSearch = (c.russian || "").toLowerCase().includes(search.toLowerCase()) || (c.arabic || "").includes(search);
        const matchesFilter = filter === "All" || (c.category || "Uncategorized") === filter;
        return matchesSearch && matchesFilter;
      });
  }, [cards, search, filter]);

  useEffect(() => { setDisplayLimit(20); }, [search, filter]);

  const handleAddSubmit = () => {
      if(newCard.russian && newCard.arabic) {
          onAdd(newCard);
          setNewCard({ russian: "", arabic: "", category: "General" });
      }
  };

  const startEdit = (card) => { setEditingId(card.id); setEditRus(card.russian); setEditAra(card.arabic); };
  const saveEdit = () => { onUpdate(editingId, editRus, editAra); setEditingId(null); };

  const visibleCards = filteredCards.slice(0, displayLimit);

  // --- تصميم البطاقة الجديد: Liquid Memory Node ---
  const MemoryNode = ({ card, index }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.4, ease: "easeOut" }}
            className="group relative h-full"
        >
            {/* الخلفية الأساسية: زجاجية بالكامل وبدون حدود */}
            <div className="relative h-full w-full bg-white/5 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--accent-color)]/20 hover:-translate-y-2">
                
                {/* طبقة لونية خلفية ناعمة جداً تظهر عند التحويم */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* دائرة زخرفية في الخلفية */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[var(--accent-color)]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[var(--accent-color)]/20 transition-colors duration-500"></div>

                <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                    
                    {/* وضع التعديل */}
                    {editingId === card.id ? (
                        <div className="flex flex-col gap-4 h-full justify-center">
                            <div className="text-xs font-bold text-[var(--accent-color)] uppercase tracking-widest text-center mb-2">Editing Node</div>
                            <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-black/5 dark:bg-white/10 rounded-xl p-4 text-center text-xl font-bold text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all" />
                            <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-black/5 dark:bg-white/10 rounded-xl p-3 text-center text-lg text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all" />
                            <div className="flex gap-2 mt-2">
                                <button onClick={saveEdit} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/30 transition-all">Save</button>
                                <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-500/20 text-[var(--text-main)] py-3 rounded-xl font-bold hover:bg-gray-500/40 transition-all">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        /* وضع العرض - التصميم الجديد */
                        <>
                            {/* Header: Category Badge */}
                            <div className="flex justify-between items-start">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                                    <IconCategory size={12} /> {card.category}
                                </span>
                                
                                {isJunior && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                        <button onClick={() => startEdit(card)} className="p-2 rounded-full bg-white/10 hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-muted)] transition-colors"><IconPencil size={14}/></button>
                                        <button onClick={() => onDelete(card.id)} className="p-2 rounded-full bg-white/10 hover:bg-red-500 hover:text-white text-[var(--text-muted)] transition-colors"><IconTrash size={14}/></button>
                                    </div>
                                )}
                            </div>

                            {/* Main Content: Russian Word */}
                            <div className="py-6 text-center relative">
                                <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-main)] to-[var(--text-muted)] group-hover:to-[var(--accent-color)] transition-all duration-500">
                                    {card.russian}
                                </h3>
                            </div>

                            {/* Footer: Arabic & Icon */}
                            <div className="mt-auto">
                                <div className="w-12 h-1 bg-[var(--accent-color)]/20 rounded-full mb-4 mx-auto group-hover:w-full group-hover:bg-[var(--accent-color)] transition-all duration-500"></div>
                                <div className="flex justify-between items-end">
                                    <IconSparkles size={18} className="text-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <p className="text-lg text-[var(--text-muted)] group-hover:text-[var(--text-main)] dir-rtl font-bold transition-colors">
                                        {card.arabic}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
  };

  return (
    <div className="w-full flex flex-col p-4 md:p-8 font-sans min-h-screen">
      
      {/* 1. Luxurious Header */}
      <div className="flex flex-col items-center justify-center mb-12 text-center relative">
          <div className="absolute inset-0 bg-[var(--accent-color)]/20 blur-[100px] rounded-full pointer-events-none"></div>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10">
              <span className="text-[10px] font-bold tracking-[0.4em] text-[var(--accent-color)] uppercase mb-2 block">Knowledge Base</span>
              <h1 className="text-5xl md:text-7xl font-black text-[var(--text-main)] tracking-tighter mb-4">
                  Archive
              </h1>
              <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] bg-[var(--bg-secondary)]/50 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md">
                  <span>{filteredCards.length} Items</span>
                  <span className="w-1 h-4 bg-gray-500/30"></span>
                  <span>{categories.length - 1} Topics</span>
              </div>
          </motion.div>
      </div>

      {/* 2. Floating Search Bar (Glass Capsule) */}
      <div className="sticky top-4 z-40 mb-10 flex justify-center">
         <div className="w-full max-w-4xl bg-[var(--bg-secondary)]/80 dark:bg-[#111]/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 pl-6 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
             <div className="flex-1 flex items-center gap-3 w-full">
                <IconSearch className="text-[var(--text-muted)]" size={20} />
                <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for words..." 
                    className="flex-1 bg-transparent text-[var(--text-main)] placeholder-[var(--text-muted)]/50 outline-none text-base font-medium h-10"
                />
             </div>

             {/* Admin Quick Add */}
             {isJunior && (
                 <div className="hidden md:flex items-center gap-2 pr-2 border-l border-white/10 pl-4">
                     <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder="Rus" className="w-20 bg-transparent outline-none text-sm text-[var(--text-main)]" />
                     <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="Ara" className="w-20 bg-transparent outline-none text-sm text-[var(--text-main)] text-right" />
                     <button onClick={handleAddSubmit} className="bg-[var(--accent-color)] text-white w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"><IconPlus size={16}/></button>
                 </div>
             )}
         </div>
      </div>

      {/* 3. Filter Pills (Minimal) */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)} 
                className={`px-5 py-2 text-xs font-bold rounded-full transition-all duration-300
                ${filter === cat 
                    ? "bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30 scale-105" 
                    : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--text-main)] hover:text-[var(--bg-primary)]"}`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* 4. The Liquid Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="popLayout">
                {visibleCards.map((card, index) => (
                    <MemoryNode key={card.id} card={card} index={index} />
                ))}
            </AnimatePresence>
      </div>

      {/* 5. Load More (Elegant) */}
      {visibleCards.length < filteredCards.length && (
            <div className="flex justify-center pb-10">
                <button 
                    onClick={() => setDisplayLimit(prev => prev + 20)}
                    className="group flex flex-col items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
                >
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">Discover More</span>
                    <div className="p-3 rounded-full bg-[var(--bg-secondary)] border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                        <IconArrowDown size={20} className="animate-bounce"/>
                    </div>
                </button>
            </div>
      )}
    </div>
  );
}