"use client";
import React, { useState, useMemo, useEffect } from "react";
import { 
  IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, 
  IconPlus, IconBinary, IconCpu, IconActivity, IconFolder, IconHash, IconCode 
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

  // --- مكون البطاقة المتطور (Data Shard V2) ---
  const DataShard = ({ card, index }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group relative h-full w-full"
    >
        {/* الخلفية الرئيسية للبطاقة مع تأثير الزجاج */}
        <div className="relative h-full bg-[var(--bg-secondary)] border border-[var(--text-muted)]/10 p-0 rounded-lg overflow-hidden transition-all duration-300 group-hover:border-[var(--accent-color)]/50 group-hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]">
            
            {/* الشريط العلوي التقني (Header Bar) */}
            <div className="h-8 bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-secondary)] border-b border-[var(--text-muted)]/10 flex items-center justify-between px-3 relative overflow-hidden">
                {/* شريط ملون صغير */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-color)] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <span className="text-[9px] font-mono text-[var(--accent-color)] uppercase tracking-widest flex items-center gap-2 pl-2">
                    <IconHash size={10}/> {card.id.toString().slice(-4)}
                </span>
                
                {/* أيقونات التحكم تظهر فقط للمشرف */}
                {isJunior && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(card)} className="text-[var(--text-muted)] hover:text-[var(--accent-color)]"><IconPencil size={12}/></button>
                        <button onClick={() => onDelete(card.id)} className="text-[var(--text-muted)] hover:text-red-500"><IconTrash size={12}/></button>
                    </div>
                )}
            </div>

            {/* محتوى البطاقة */}
            <div className="p-5 relative">
                {/* زخرفة خلفية خفيفة */}
                <div className="absolute right-2 top-2 opacity-[0.03] pointer-events-none">
                    <IconBinary size={64} />
                </div>

                {editingId === card.id ? (
                    <div className="flex flex-col gap-3 relative z-10 animate-in fade-in">
                        <div className="text-[9px] text-[var(--accent-color)] font-mono uppercase tracking-widest mb-1">:: EDIT SEQUENCE ::</div>
                        <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-[var(--bg-primary)] border border-[var(--accent-color)] p-2 text-[var(--text-main)] font-bold outline-none font-mono text-sm rounded-sm" />
                        <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-[var(--bg-primary)] border border-[var(--text-muted)]/20 p-2 text-[var(--text-main)] text-right outline-none font-mono text-sm rounded-sm" />
                        <div className="flex gap-2 pt-2">
                            <button onClick={saveEdit} className="flex-1 bg-green-500/10 border border-green-500 text-green-500 py-1.5 text-[10px] font-black hover:bg-green-500 hover:text-white transition-all uppercase">Save Data</button>
                            <button onClick={() => setEditingId(null)} className="flex-1 bg-red-500/10 border border-red-500 text-red-500 py-1.5 text-[10px] font-black hover:bg-red-500 hover:text-white transition-all uppercase">Abort</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* التصنيف كـ شارة تقنية */}
                        <div className="mb-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[var(--text-muted)]/5 border border-[var(--text-muted)]/10 text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider group-hover:border-[var(--accent-color)]/30 group-hover:text-[var(--accent-color)] transition-colors">
                                <IconFolder size={10} /> {card.category}
                            </span>
                        </div>

                        {/* الكلمة الروسية */}
                        <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight mb-2 group-hover:text-[var(--accent-color)] transition-colors relative z-10">
                            {card.russian}
                        </h3>

                        {/* خط فاصل متحرك */}
                        <div className="h-px w-10 bg-[var(--text-muted)]/20 my-3 group-hover:w-full group-hover:bg-[var(--accent-color)]/50 transition-all duration-500"></div>

                        {/* الترجمة العربية */}
                        <p className="text-base text-[var(--text-muted)] dir-rtl font-medium group-hover:text-[var(--text-main)] transition-colors">
                            {card.arabic}
                        </p>
                    </>
                )}
            </div>

            {/* الشريط السفلي (Footer Status) */}
            <div className="h-1 w-full bg-[var(--bg-primary)] mt-auto relative">
                <div className="absolute left-0 top-0 bottom-0 bg-[var(--accent-color)] w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
            </div>
        </div>
    </motion.div>
  );

  return (
    <div className="w-full flex flex-col p-4 md:p-6 font-sans min-h-screen">
      
      {/* 1. Futuristic Header */}
      <div className="relative mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <div>
                  <h1 className="text-5xl md:text-7xl font-black text-[var(--text-main)] tracking-tighter leading-[0.9]">
                      DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-600">GRID</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                      <div className="h-1 w-10 bg-[var(--accent-color)]"></div>
                      <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-[0.3em]">
                          Neural Archive System V.4.0
                      </p>
                  </div>
              </div>
              
              {/* Stats Module */}
              <div className="flex gap-4">
                  <div className="text-right">
                      <div className="text-3xl font-black text-[var(--text-main)]">{filteredCards.length}</div>
                      <div className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Entries Loaded</div>
                  </div>
                  <div className="w-px h-10 bg-[var(--text-muted)]/20"></div>
                  <div className="text-right">
                      <div className="text-3xl font-black text-[var(--text-main)]">{categories.length - 1}</div>
                      <div className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Vectors</div>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. Command Interface (Sticky) */}
      <div className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-y border-[var(--text-muted)]/10 py-4 mb-8 -mx-4 px-6 md:px-8 shadow-2xl transition-all">
         <div className="flex flex-col lg:flex-row gap-4">
             
             {/* Search Terminal */}
             <div className="relative flex-1 group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <span className="text-[var(--accent-color)] font-mono text-sm animate-pulse">{'>'}</span>
                 </div>
                 <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="INITIATE_SEARCH_PROTOCOL..." 
                    className="w-full bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--text-muted)]/20 rounded-sm py-3.5 pl-10 pr-4 font-mono text-sm focus:border-[var(--accent-color)] focus:shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] outline-none transition-all placeholder:text-[var(--text-muted)]/40"
                 />
                 {/* Corner Accent */}
                 <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--accent-color)] opacity-50"></div>
                 <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--accent-color)] opacity-50"></div>
             </div>

             {/* Admin Input Array */}
             {isJunior && (
                 <div className="flex bg-[var(--bg-secondary)] border border-[var(--text-muted)]/20 rounded-sm p-1 gap-1">
                     <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder="RUS" className="w-24 bg-transparent px-3 text-sm font-mono outline-none text-[var(--text-main)] border-r border-[var(--text-muted)]/10 placeholder:text-[var(--text-muted)]/40" />
                     <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="ARA" className="w-24 bg-transparent px-3 text-sm font-mono outline-none text-[var(--text-main)] text-right border-r border-[var(--text-muted)]/10 placeholder:text-[var(--text-muted)]/40" />
                     <input value={newCard.category} onChange={e => setNewCard({...newCard, category: e.target.value})} placeholder="CAT" className="w-20 bg-transparent px-3 text-sm font-mono outline-none text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40" />
                     <button onClick={handleAddSubmit} className="bg-[var(--accent-color)] text-white px-4 hover:brightness-110 flex items-center justify-center rounded-sm transition-all"><IconPlus size={18}/></button>
                 </div>
             )}
         </div>

         {/* Filter Chips */}
         <div className="flex gap-2 overflow-x-auto pb-1 mt-4 custom-scrollbar">
            {categories.map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setFilter(cat)} 
                    className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-all duration-300 rounded-sm whitespace-nowrap
                    ${filter === cat 
                        ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]" 
                        : "bg-transparent border-[var(--text-muted)]/20 text-[var(--text-muted)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* 3. The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
            <AnimatePresence mode="popLayout">
                {visibleCards.map((card, index) => (
                    <DataShard key={card.id} card={card} index={index} />
                ))}
            </AnimatePresence>
      </div>

      {/* 4. Load More Trigger */}
      {visibleCards.length < filteredCards.length && (
            <button 
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="w-full py-6 text-center text-[var(--text-muted)] hover:text-[var(--accent-color)] text-xs font-mono font-bold tracking-[0.5em] uppercase bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--text-muted)]/10 hover:border-[var(--accent-color)] transition-all flex items-center justify-center gap-3 mb-10 group relative overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-2">Initialize More Data <IconArrowDown size={14} className="animate-bounce"/></span>
                <div className="absolute inset-0 bg-[var(--accent-color)]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
      )}
    </div>
  );
}