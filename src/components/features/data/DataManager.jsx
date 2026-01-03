"use client";
import React, { useState, useMemo, useEffect } from "react";
import { IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown } from "@tabler/icons-react";

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
    // إزالة h-full لتسمح للصفحة بالتمدد والسكرول من الخارج
    <div className="w-full flex flex-col p-4 md:p-6">
      
      {/* Header & Add Section */}
      <div className="flex flex-col gap-4 mb-4 bg-black/20 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <IconDatabase size={28} className="text-[var(--accent-color)]" />
            <h1 className="text-xl md:text-2xl font-black text-white">NEURAL ARCHIVE <span className="text-xs text-white/30 ml-2">({filteredCards.length} ITEMS)</span></h1>
        </div>

        {isJunior && (
            <div className="flex flex-col md:flex-row gap-3">
                <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder="Russian Word..." className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[var(--accent-color)]" />
                <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="Translation" className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[var(--accent-color)] dir-rtl"/>
                <input value={newCard.category} onChange={e => setNewCard({...newCard, category: e.target.value})} placeholder="Category" className="w-full md:w-32 bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[var(--accent-color)]"/>
                <button onClick={handleAddSubmit} className="bg-[var(--accent-color)] hover:opacity-90 text-white font-bold px-6 py-3 rounded-xl transition-all">ADD</button>
            </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 mb-6">
         <div className="relative group">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
            <input type="text" placeholder="SEARCH DATABASE..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:bg-white/10 outline-none font-mono text-sm backdrop-blur-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1 text-[10px] font-bold uppercase rounded-full border transition-all whitespace-nowrap ${filter === cat ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white" : "bg-transparent text-[var(--accent-color)] border-[var(--accent-color)]/30"}`}>
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-10">
            {visibleCards.map((card) => (
                <div key={card.id} className="group relative bg-black/20 border border-white/5 p-4 rounded-xl hover:border-[var(--accent-color)]/30 transition-all backdrop-blur-sm">
                    {editingId === card.id ? (
                        <div className="flex flex-col gap-2 relative z-10">
                            <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-black/50 border border-[var(--accent-color)] p-2 rounded text-white" />
                            <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-black/50 border border-emerald-500 p-2 rounded text-white text-right" />
                            <div className="flex gap-2 mt-2">
                                <button onClick={saveEdit} className="flex-1 bg-emerald-600 text-white py-1 rounded text-xs">SAVE</button>
                                <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-700 text-white py-1 rounded text-xs">CANCEL</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-[var(--accent-color)] font-mono uppercase truncate max-w-[70%]">{card.category}</span>
                                {isJunior && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(card)} className="text-blue-400 hover:bg-blue-900/30 p-1 rounded"><IconPencil size={14} /></button>
                                        <button onClick={() => onDelete(card.id)} className="text-red-400 hover:bg-red-900/30 p-1 rounded"><IconTrash size={14} /></button>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-0.5">{card.russian}</h3>
                            <p className="text-sm text-gray-400 dir-rtl font-cairo">{card.arabic}</p>
                        </>
                    )}
                </div>
            ))}
      </div>

      {visibleCards.length < filteredCards.length && (
            <button 
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="w-full py-4 text-center text-[var(--accent-color)] text-xs font-bold tracking-widest hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center gap-2 mb-10"
            >
                LOAD MORE DATA <IconArrowDown size={16} className="animate-bounce"/>
            </button>
      )}
    </div>
  );
}