"use client";
import React, { useState, useMemo, useEffect } from "react";
import { IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, IconPlus, IconFileText } from "@tabler/icons-react";

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
    <div className="w-full flex flex-col p-2 font-sans">
      
      {/* Header Area */}
      <div className="mb-8">
          <h1 className="text-4xl font-black text-[var(--text-main)] mb-2 flex items-center gap-3">
              <IconDatabase size={36} className="text-[var(--accent-color)]"/> NEURAL ARCHIVE
          </h1>
          <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest pl-1">
              Database Access: Granted • {filteredCards.length} Records
          </p>
      </div>

      {/* Add New (Admin Only) */}
      {isJunior && (
        <div className="mb-8 p-6 bg-[var(--bg-secondary)] border border-gray-500/20 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
                <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder="Russian Term..." className="flex-1 bg-transparent border border-gray-500/30 p-3 rounded-xl outline-none focus:border-[var(--accent-color)] text-[var(--text-main)]" />
                <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="Arabic Translation..." className="flex-1 bg-transparent border border-gray-500/30 p-3 rounded-xl outline-none focus:border-[var(--accent-color)] text-[var(--text-main)] dir-rtl" />
                <input value={newCard.category} onChange={e => setNewCard({...newCard, category: e.target.value})} placeholder="Category" className="w-full md:w-40 bg-transparent border border-gray-500/30 p-3 rounded-xl outline-none focus:border-[var(--accent-color)] text-[var(--text-main)]" />
                <button onClick={handleAddSubmit} className="bg-[var(--accent-color)] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"><IconPlus size={18}/> ADD</button>
            </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="sticky top-0 z-20 py-4 bg-[var(--bg-primary)]/80 backdrop-blur-md mb-6 -mx-2 px-2 border-b border-gray-500/10">
         <div className="relative group mb-4">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--accent-color)] transition-colors" size={20} />
            <input type="text" placeholder="QUERY DATABASE..." className="w-full bg-[var(--bg-secondary)] border border-gray-500/20 rounded-xl py-3 pl-12 pr-4 text-[var(--text-main)] focus:border-[var(--accent-color)] outline-none font-mono text-sm transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 text-[11px] font-bold uppercase rounded-lg border transition-all whitespace-nowrap ${filter === cat ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white" : "bg-[var(--bg-secondary)] text-gray-500 border-gray-500/20 hover:border-gray-500/50"}`}>
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Grid List - Professional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
            {visibleCards.map((card) => (
                <div key={card.id} className="group relative bg-[var(--bg-secondary)] border border-gray-500/10 p-5 rounded-xl hover:border-[var(--accent-color)]/50 hover:shadow-lg transition-all duration-300">
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-2 bg-gray-500/20 group-hover:bg-[var(--accent-color)] transition-colors"></div>
                    </div>

                    {editingId === card.id ? (
                        <div className="flex flex-col gap-3 relative z-10">
                            <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-transparent border border-[var(--accent-color)] p-2 rounded text-[var(--text-main)] w-full" />
                            <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-transparent border border-gray-500 p-2 rounded text-[var(--text-main)] text-right w-full" />
                            <div className="flex gap-2 mt-1">
                                <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-1.5 rounded text-xs font-bold">SAVE</button>
                                <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-600 text-white py-1.5 rounded text-xs font-bold">CANCEL</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <IconFileText size={16} className="text-gray-400 group-hover:text-[var(--accent-color)] transition-colors"/>
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{card.category}</span>
                                </div>
                                {isJunior && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(card)} className="text-blue-400 hover:bg-blue-500/10 p-1.5 rounded"><IconPencil size={16} /></button>
                                        <button onClick={() => onDelete(card.id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded"><IconTrash size={16} /></button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">{card.russian}</h3>
                                <div className="h-px w-8 bg-gray-500/20 group-hover:w-full group-hover:bg-[var(--accent-color)]/30 transition-all duration-500 my-2"></div>
                                <p className="text-sm text-gray-500 dir-rtl font-medium">{card.arabic}</p>
                            </div>
                        </>
                    )}
                </div>
            ))}
      </div>

      {visibleCards.length < filteredCards.length && (
            <button 
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="w-full py-4 text-center text-[var(--accent-color)] text-xs font-bold tracking-widest hover:bg-[var(--bg-secondary)] rounded-xl transition-colors flex items-center justify-center gap-2 mb-10 border border-transparent hover:border-[var(--accent-color)]/20"
            >
                LOAD MORE DATA <IconArrowDown size={16} className="animate-bounce"/>
            </button>
      )}
    </div>
  );
}