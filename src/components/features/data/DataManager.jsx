"use client";
import React, { useState, useMemo, useEffect } from "react";
import { IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, IconPlus, IconCpu } from "@tabler/icons-react";
import { motion } from "framer-motion";

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

  // Tilt Card Component
  const DataCard = ({ card }) => {
    return (
        <div className="group relative perspective-1000">
            <div className="relative w-full bg-[var(--bg-secondary)] border border-gray-500/10 p-6 rounded-2xl transition-all duration-300 transform group-hover:scale-[1.02] group-hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.15)] group-hover:border-[var(--accent-color)] overflow-hidden">
                
                {/* Glowing Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                {editingId === card.id ? (
                    <div className="flex flex-col gap-3 relative z-10">
                        <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-[var(--bg-primary)] border border-[var(--accent-color)] p-3 rounded-xl text-[var(--text-main)] w-full outline-none font-bold" />
                        <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-[var(--bg-primary)] border border-gray-500/30 p-3 rounded-xl text-[var(--text-main)] text-right w-full outline-none" />
                        <div className="flex gap-2 mt-2">
                            <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-black tracking-widest hover:bg-green-500 transition-colors">SAVE</button>
                            <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-xs font-black tracking-widest hover:bg-gray-500 transition-colors">CANCEL</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-[10px] font-mono font-bold text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-3 py-1 rounded-full border border-[var(--accent-color)]/20 uppercase tracking-wider">
                                {card.category}
                            </span>
                            {isJunior && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    <button onClick={() => startEdit(card)} className="text-gray-400 hover:text-[var(--accent-color)] bg-[var(--bg-primary)] p-2 rounded-lg shadow-sm transition-colors"><IconPencil size={16} /></button>
                                    <button onClick={() => onDelete(card.id)} className="text-gray-400 hover:text-red-500 bg-[var(--bg-primary)] p-2 rounded-lg shadow-sm transition-colors"><IconTrash size={16} /></button>
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight group-hover:text-[var(--accent-color)] transition-colors">{card.russian}</h3>
                            <div className="h-px w-10 bg-gray-500/20 group-hover:w-full group-hover:bg-[var(--accent-color)]/30 transition-all duration-700"></div>
                            <p className="text-base text-[var(--text-muted)] dir-rtl font-medium">{card.arabic}</p>
                        </div>

                        {/* Tech Decoration */}
                        <div className="absolute bottom-3 right-3 flex gap-1 opacity-20">
                            <div className="w-1 h-1 bg-[var(--text-main)] rounded-full"></div>
                            <div className="w-1 h-1 bg-[var(--text-main)] rounded-full"></div>
                            <div className="w-1 h-1 bg-[var(--text-main)] rounded-full"></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="w-full flex flex-col p-2 font-sans min-h-screen">
      
      {/* Hero Header */}
      <div className="relative mb-10 p-8 rounded-3xl bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] border border-gray-500/10 overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-black text-[var(--text-main)] tracking-tighter mb-2">
                  DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-500">VAULT</span>
              </h1>
              <p className="text-[var(--text-muted)] text-sm font-mono uppercase tracking-[0.3em]">
                  Secure Neural Archive • {filteredCards.length} Units
              </p>
          </div>
      </div>

      {/* Admin Quick Add */}
      {isJunior && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-[var(--bg-secondary)] border border-[var(--accent-color)]/30 p-1 rounded-2xl shadow-lg shadow-[var(--accent-color)]/5">
            <div className="flex flex-col md:flex-row gap-2">
                <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder="New Russian Word..." className="flex-1 bg-[var(--bg-primary)] rounded-xl px-4 py-3 outline-none text-[var(--text-main)] placeholder-gray-500/50" />
                <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="Arabic Meaning..." className="flex-1 bg-[var(--bg-primary)] rounded-xl px-4 py-3 outline-none text-[var(--text-main)] placeholder-gray-500/50 text-right" />
                <input value={newCard.category} onChange={e => setNewCard({...newCard, category: e.target.value})} placeholder="Tag" className="w-full md:w-32 bg-[var(--bg-primary)] rounded-xl px-4 py-3 outline-none text-[var(--text-main)] placeholder-gray-500/50" />
                <button onClick={handleAddSubmit} className="bg-[var(--accent-color)] text-white font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-color)]/30"><IconPlus size={20}/> ADD</button>
            </div>
        </motion.div>
      )}

      {/* Search Bar & Filters */}
      <div className="sticky top-0 z-40 py-4 bg-[var(--bg-primary)]/90 backdrop-blur-xl mb-8 -mx-2 px-2 border-b border-gray-500/5 transition-all">
         <div className="flex flex-col md:flex-row gap-4 items-center">
             <div className="relative group w-full md:w-auto flex-1">
                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--accent-color)] transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search the vault..." 
                    className="w-full bg-[var(--bg-secondary)] border border-gray-500/10 rounded-2xl py-3.5 pl-12 pr-4 text-[var(--text-main)] focus:border-[var(--accent-color)]/50 focus:shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)] outline-none font-mono text-sm transition-all" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setFilter(cat)} 
                        className={`px-5 py-2 text-[11px] font-bold uppercase rounded-xl border transition-all whitespace-nowrap tracking-wider
                        ${filter === cat 
                            ? "bg-[var(--text-main)] text-[var(--bg-primary)] border-[var(--text-main)] shadow-lg" 
                            : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-gray-500/10 hover:border-gray-500/30 hover:text-[var(--text-main)]"}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
         </div>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {visibleCards.map((card) => <DataCard key={card.id} card={card} />)}
      </div>

      {visibleCards.length < filteredCards.length && (
            <button 
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="w-full py-5 text-center text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-bold tracking-[0.3em] uppercase bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 rounded-2xl transition-all flex items-center justify-center gap-3 mb-10 border border-gray-500/5 hover:border-gray-500/20"
            >
                Initialize More Data <IconArrowDown size={14} className="animate-bounce"/>
            </button>
      )}
    </div>
  );
}