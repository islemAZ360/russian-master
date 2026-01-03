"use client";
import React, { useState, useMemo, useEffect } from "react";
import { IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, IconPlus } from "@tabler/icons-react";

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

  return (
    <div className="w-full flex flex-col p-4 md:p-6 font-sans">
      
      {/* Header & Add Section */}
      <div className="flex flex-col gap-6 mb-8 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="p-3 bg-[var(--accent-color)] rounded-xl text-white shadow-lg shadow-[var(--accent-color)]/20">
                <IconDatabase size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight">NEURAL ARCHIVE</h1>
                <p className="text-xs text-white/50 font-mono uppercase tracking-widest">{filteredCards.length} DATA ENTRIES FOUND</p>
            </div>
        </div>

        {isJunior && (
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <input 
                    value={newCard.russian} 
                    onChange={e => setNewCard({...newCard, russian: e.target.value})} 
                    placeholder="Russian Word..." 
                    className="flex-1 bg-black/20 border border-white/10 p-4 rounded-xl text-white placeholder-white/30 outline-none focus:border-[var(--accent-color)] focus:bg-black/40 transition-all" 
                />
                <input 
                    value={newCard.arabic} 
                    onChange={e => setNewCard({...newCard, arabic: e.target.value})} 
                    placeholder="Translation" 
                    className="flex-1 bg-black/20 border border-white/10 p-4 rounded-xl text-white placeholder-white/30 outline-none focus:border-[var(--accent-color)] focus:bg-black/40 transition-all dir-rtl"
                />
                <input 
                    value={newCard.category} 
                    onChange={e => setNewCard({...newCard, category: e.target.value})} 
                    placeholder="Category" 
                    className="w-full md:w-40 bg-black/20 border border-white/10 p-4 rounded-xl text-white placeholder-white/30 outline-none focus:border-[var(--accent-color)] focus:bg-black/40 transition-all"
                />
                <button 
                    onClick={handleAddSubmit} 
                    className="bg-[var(--accent-color)] hover:opacity-90 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <IconPlus size={20} /> ADD
                </button>
            </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 mb-8">
         <div className="relative group w-full">
            <IconSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[var(--accent-color)] transition-colors" size={22} />
            <input 
                type="text" 
                placeholder="SEARCH DATABASE..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:bg-white/10 focus:border-[var(--accent-color)]/50 outline-none font-mono text-sm backdrop-blur-sm transition-all" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
            />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setFilter(cat)} 
                    className={`px-5 py-2 text-[11px] font-bold uppercase rounded-full border transition-all whitespace-nowrap tracking-wider
                    ${filter === cat 
                        ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-lg" 
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
            {visibleCards.map((card) => (
                <div key={card.id} className="group relative bg-white/5 border border-white/5 hover:border-[var(--accent-color)]/30 p-5 rounded-2xl transition-all hover:bg-white/10 backdrop-blur-sm hover:-translate-y-1 hover:shadow-xl">
                    {editingId === card.id ? (
                        <div className="flex flex-col gap-3 relative z-10">
                            <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-black/50 border border-[var(--accent-color)] p-3 rounded-lg text-white outline-none" />
                            <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-black/50 border border-emerald-500 p-3 rounded-lg text-white text-right outline-none" />
                            <div className="flex gap-2 mt-2">
                                <button onClick={saveEdit} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold transition-colors">SAVE</button>
                                <button onClick={() => setEditingId(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-xs font-bold transition-colors">CANCEL</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 px-3 py-1 rounded-full text-[var(--accent-color)] font-mono uppercase font-bold tracking-wider truncate max-w-[70%]">
                                    {card.category}
                                </span>
                                {isJunior && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(card)} className="text-white/50 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"><IconPencil size={16} /></button>
                                        <button onClick={() => onDelete(card.id)} className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"><IconTrash size={16} /></button>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{card.russian}</h3>
                            <p className="text-sm text-white/60 dir-rtl font-medium">{card.arabic}</p>
                        </>
                    )}
                </div>
            ))}
      </div>

      {visibleCards.length < filteredCards.length && (
            <button 
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="w-full py-4 text-center text-[var(--accent-color)] text-xs font-bold tracking-[0.2em] hover:bg-[var(--accent-color)]/10 rounded-xl transition-colors flex items-center justify-center gap-2 mb-10 border border-transparent hover:border-[var(--accent-color)]/20"
            >
                LOAD MORE DATA <IconArrowDown size={16} className="animate-bounce"/>
            </button>
      )}
    </div>
  );
}