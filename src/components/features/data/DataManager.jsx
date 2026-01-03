"use client";
import React, { useState, useMemo, useEffect } from "react";
import { 
  IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, 
  IconPlus, IconBinary, IconCpu, IconActivity, IconFolder 
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

  // --- مكون البطاقة المتطور (Cyber Card) ---
  const CyberCard = ({ card, index }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative h-full"
    >
        <div className="relative h-full bg-[var(--bg-secondary)] border border-[var(--text-muted)]/20 p-6 rounded-sm overflow-hidden transition-all duration-300 hover:border-[var(--accent-color)] hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.15)]">
            
            {/* 1. تأثير الماسح الضوئي (Scanner Effect) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent-color)]/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 pointer-events-none z-0"></div>
            
            {/* 2. زوايا تقنية (Tech Corners) */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* 3. محتوى البطاقة */}
            <div className="relative z-10">
                {editingId === card.id ? (
                    <div className="flex flex-col gap-3">
                        <div className="text-[10px] text-[var(--accent-color)] font-mono uppercase">EDITING MODE_</div>
                        <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-black/10 border border-[var(--accent-color)] p-2 text-[var(--text-main)] font-bold outline-none font-mono" />
                        <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-black/10 border border-[var(--text-muted)]/30 p-2 text-[var(--text-main)] text-right outline-none font-mono" />
                        <div className="flex gap-2 pt-2">
                            <button onClick={saveEdit} className="flex-1 bg-green-600/20 border border-green-500 text-green-500 py-1 text-xs hover:bg-green-600 hover:text-white transition-all">SAVE</button>
                            <button onClick={() => setEditingId(null)} className="flex-1 bg-red-600/20 border border-red-500 text-red-500 py-1 text-xs hover:bg-red-600 hover:text-white transition-all">ABORT</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <IconFolder size={14} className="text-[var(--text-muted)]"/>
                                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider border border-[var(--text-muted)]/20 px-2 py-0.5 rounded-sm">
                                    {card.category.substring(0, 12)}
                                </span>
                            </div>
                            {isJunior && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(card)} className="text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"><IconPencil size={16}/></button>
                                    <button onClick={() => onDelete(card.id)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors"><IconTrash size={16}/></button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight group-hover:text-[var(--accent-color)] transition-colors font-sans">
                                {card.russian}
                            </h3>
                            <div className="w-full h-[1px] bg-gradient-to-r from-[var(--text-muted)]/20 to-transparent my-2"></div>
                            <p className="text-lg text-[var(--text-muted)] dir-rtl font-medium font-sans">
                                {card.arabic}
                            </p>
                        </div>

                        {/* Tech Footer */}
                        <div className="mt-6 flex justify-between items-end opacity-40 group-hover:opacity-100 transition-opacity">
                            <div className="text-[8px] font-mono text-[var(--text-muted)] flex flex-col">
                                <span>ID: {card.id.toString().slice(-4)}</span>
                                <span>SIZE: {card.russian.length}B</span>
                            </div>
                            <IconBinary size={16} className="text-[var(--accent-color)] opacity-50"/>
                        </div>
                    </>
                )}
            </div>
        </div>
    </motion.div>
  );

  return (
    <div className="w-full flex flex-col p-4 font-sans min-h-screen">
      
      {/* 1. HUD Header */}
      <div className="relative mb-10 p-1">
          {/* Decorative Lines */}
          <div className="absolute top-0 left-0 w-20 h-[1px] bg-[var(--accent-color)]"></div>
          <div className="absolute top-0 left-0 h-20 w-[1px] bg-[var(--accent-color)]"></div>
          
          <div className="pl-6 pt-4">
              <div className="flex items-center gap-3 mb-2">
                  <IconCpu className="text-[var(--accent-color)] animate-pulse" size={32} stroke={1.5} />
                  <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter uppercase">
                      Archive <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-600">Core</span>
                  </h1>
              </div>
              <div className="flex gap-6 text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">
                  <span className="flex items-center gap-2"><IconDatabase size={14}/> Total Units: {filteredCards.length}</span>
                  <span className="flex items-center gap-2"><IconActivity size={14}/> Status: Active</span>
              </div>
          </div>
      </div>

      {/* 2. Command Bar (Search & Tools) */}
      <div className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-y border-[var(--text-muted)]/10 py-4 mb-8 -mx-4 px-6 flex flex-col md:flex-row gap-4 items-center shadow-2xl">
         
         {/* Search Input (Terminal Style) */}
         <div className="relative flex-1 w-full group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <span className="text-[var(--accent-color)] font-mono text-lg">{'>'}</span>
             </div>
             <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="INITIATE SEARCH SEQUENCE..." 
                className="w-full bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--text-muted)]/20 rounded-sm py-3 pl-10 pr-4 font-mono text-sm focus:border-[var(--accent-color)] focus:shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)] outline-none transition-all"
             />
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--text-muted)]/50"></div>
         </div>

         {/* Admin Quick Add */}
         {isJunior && (
             <div className="flex gap-0 w-full md:w-auto">
                 <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder="RUS" className="w-20 bg-[var(--bg-secondary)] border border-[var(--text-muted)]/20 border-r-0 px-3 text-sm font-mono outline-none text-[var(--text-main)]" />
                 <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="ARA" className="w-20 bg-[var(--bg-secondary)] border border-[var(--text-muted)]/20 px-3 text-sm font-mono outline-none text-[var(--text-main)] text-right" />
                 <input value={newCard.category} onChange={e => setNewCard({...newCard, category: e.target.value})} placeholder="CAT" className="w-20 bg-[var(--bg-secondary)] border border-[var(--text-muted)]/20 border-l-0 px-3 text-sm font-mono outline-none text-[var(--text-main)]" />
                 <button onClick={handleAddSubmit} className="bg-[var(--accent-color)] text-white px-4 hover:brightness-110"><IconPlus size={18}/></button>
             </div>
         )}
      </div>

      {/* 3. Filter Tabs (Matrix Style) */}
      <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)} 
                className={`px-4 py-1 text-[10px] font-mono uppercase tracking-widest border transition-all duration-300
                ${filter === cat 
                    ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-[0_0_10px_rgba(var(--accent-rgb),0.4)]" 
                    : "bg-transparent border-[var(--text-muted)]/20 text-[var(--text-muted)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"}`}
              >
                  [{cat}]
              </button>
          ))}
      </div>

      {/* 4. The Data Matrix (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            <AnimatePresence>
                {visibleCards.map((card, index) => <CyberCard key={card.id} card={card} index={index} />)}
            </AnimatePresence>
      </div>

      {/* 5. Load More Button */}
      {visibleCards.length < filteredCards.length && (
            <button 
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="w-full py-6 text-center text-[var(--text-muted)] hover:text-[var(--accent-color)] text-xs font-mono font-bold tracking-[0.5em] uppercase bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--text-muted)]/10 hover:border-[var(--accent-color)] transition-all flex items-center justify-center gap-3 mb-10 group"
            >
                <IconArrowDown size={14} className="animate-bounce group-hover:text-[var(--accent-color)]"/> DECRYPT MORE DATA
            </button>
      )}
    </div>
  );
}