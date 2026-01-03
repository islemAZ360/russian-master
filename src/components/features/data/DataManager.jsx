"use client";
import React, { useState, useMemo, useEffect } from "react";
import { IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, IconPlus, IconCards, IconLanguage, IconBookmarks } from "@tabler/icons-react";

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

  // Stats for the header
  const totalWords = cards.length;
  const totalCategories = categories.length - 1; // Exclude 'All'

  return (
    <div className="w-full flex flex-col p-4 md:p-6 font-sans">
      
      {/* 1. Header & Stats Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
              <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] tracking-tight mb-2 flex items-center gap-3">
                  <IconDatabase size={40} className="text-[var(--accent-color)]" stroke={2}/>
                  DATA MATRIX
              </h1>
              <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-[0.2em] pl-1">
                  Access Level: {isJunior ? "Editor" : "Viewer"} • System V3.0
              </p>
          </div>
          
          <div className="flex gap-4">
              <div className="bg-[var(--bg-secondary)] border border-gray-500/10 px-6 py-3 rounded-2xl flex flex-col items-center min-w-[100px] shadow-sm">
                  <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Entries</span>
                  <span className="text-2xl font-black text-[var(--text-main)] flex items-center gap-2"><IconCards size={18} className="text-[var(--accent-color)]"/> {totalWords}</span>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-gray-500/10 px-6 py-3 rounded-2xl flex flex-col items-center min-w-[100px] shadow-sm">
                  <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Vectors</span>
                  <span className="text-2xl font-black text-[var(--text-main)] flex items-center gap-2"><IconBookmarks size={18} className="text-purple-500"/> {totalCategories}</span>
              </div>
          </div>
      </div>

      {/* 2. Search & Tools Bar (Sticky Glass) */}
      <div className="sticky top-0 z-30 py-4 bg-[var(--bg-primary)]/80 backdrop-blur-xl mb-6 -mx-4 px-4 border-b border-gray-500/5">
         <div className="flex flex-col md:flex-row gap-4">
             {/* Search Input */}
             <div className="relative group flex-1">
                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--accent-color)] transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search neural database..." 
                    className="w-full bg-[var(--bg-secondary)] border border-gray-500/20 rounded-2xl py-3.5 pl-12 pr-4 text-[var(--text-main)] focus:border-[var(--accent-color)] outline-none font-mono text-sm transition-all shadow-sm" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
            </div>
            
            {/* Quick Add (Mobile/Desktop) */}
            {isJunior && (
                <div className="flex gap-2">
                    <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder="Rus" className="w-24 bg-[var(--bg-secondary)] border border-gray-500/20 rounded-xl px-3 outline-none text-sm" />
                    <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="Ara" className="w-24 bg-[var(--bg-secondary)] border border-gray-500/20 rounded-xl px-3 outline-none text-sm text-right" />
                    <button onClick={handleAddSubmit} className="bg-[var(--accent-color)] text-white w-12 rounded-xl flex items-center justify-center hover:opacity-90 shadow-lg shadow-[var(--accent-color)]/20"><IconPlus/></button>
                </div>
            )}
         </div>

         {/* Categories Scroll */}
         <div className="flex gap-2 overflow-x-auto pb-1 mt-4 custom-scrollbar">
            {categories.map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setFilter(cat)} 
                    className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all whitespace-nowrap tracking-wider
                    ${filter === cat 
                        ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-md shadow-[var(--accent-color)]/20" 
                        : "bg-[var(--bg-secondary)] text-gray-500 border-gray-500/10 hover:border-gray-500/30 hover:text-[var(--text-main)]"}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* 3. Data Grid (Futuristic Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {visibleCards.map((card) => (
                <div key={card.id} className="group relative bg-[var(--bg-secondary)] border border-gray-500/10 p-5 rounded-2xl hover:border-[var(--accent-color)]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none"></div>

                    {editingId === card.id ? (
                        <div className="flex flex-col gap-3 relative z-10 h-full justify-center">
                            <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-[var(--bg-primary)] border border-[var(--accent-color)] p-2 rounded-lg text-[var(--text-main)] w-full text-sm font-bold" />
                            <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-[var(--bg-primary)] border border-gray-500/30 p-2 rounded-lg text-[var(--text-main)] text-right w-full text-sm" />
                            <div className="flex gap-2 mt-2">
                                <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-bold shadow-lg">SAVE</button>
                                <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-600 text-white py-1.5 rounded-lg text-xs font-bold">CANCEL</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[9px] font-mono text-gray-400 bg-gray-500/10 px-2 py-1 rounded border border-gray-500/10 uppercase tracking-wider truncate max-w-[70%]">
                                        {card.category}
                                    </span>
                                    {isJunior && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(card)} className="text-gray-400 hover:text-[var(--accent-color)] p-1 rounded-md hover:bg-[var(--bg-primary)] transition-colors"><IconPencil size={14} /></button>
                                            <button onClick={() => onDelete(card.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-[var(--bg-primary)] transition-colors"><IconTrash size={14} /></button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-[var(--text-main)] leading-tight">{card.russian}</h3>
                                    <div className="w-8 h-0.5 bg-[var(--accent-color)]/30 rounded-full group-hover:w-full transition-all duration-500"></div>
                                    <p className="text-sm text-[var(--text-muted)] dir-rtl font-medium text-right">{card.arabic}</p>
                                </div>
                            </div>
                            
                            {/* Decorative ID */}
                            <div className="mt-4 pt-3 border-t border-gray-500/5 flex justify-between items-center text-[8px] font-mono text-gray-300/50">
                                <span>ID: {card.id.toString().slice(-6)}</span>
                                <IconLanguage size={12} className="opacity-20"/>
                            </div>
                        </>
                    )}
                </div>
            ))}
      </div>

      {visibleCards.length < filteredCards.length && (
            <button 
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="w-full py-4 text-center text-[var(--accent-color)] text-xs font-bold tracking-[0.3em] uppercase hover:bg-[var(--bg-secondary)] rounded-xl transition-colors flex items-center justify-center gap-3 mb-10 border border-transparent hover:border-[var(--accent-color)]/20 shadow-sm"
            >
                Initialize More Data <IconArrowDown size={14} className="animate-bounce"/>
            </button>
      )}
    </div>
  );
}