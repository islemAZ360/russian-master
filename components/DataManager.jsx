"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconTrash, IconPencil, IconSearch, IconDatabase } from "@tabler/icons-react";

export function DataManager({ onAdd, onDelete, onUpdate, cards, isJunior }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  
  const [newCard, setNewCard] = useState({ russian: "", arabic: "", category: "General" });

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

  const handleAddSubmit = () => {
      if(newCard.russian && newCard.arabic) {
          onAdd(newCard);
          setNewCard({ russian: "", arabic: "", category: "General" });
      }
  };

  const startEdit = (card) => { setEditingId(card.id); setEditRus(card.russian); setEditAra(card.arabic); };
  const saveEdit = () => { onUpdate(editingId, editRus, editAra); setEditingId(null); };

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col p-4 md:p-6 overflow-hidden relative">
      
      {/* Header & Add Section */}
      <div className="flex flex-col gap-4 mb-4 shrink-0 z-10 bg-[#0a0a0a]/90 p-4 md:p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <IconDatabase size={28} className="text-cyan-500" />
            <h1 className="text-xl md:text-2xl font-black text-white">NEURAL ARCHIVE</h1>
        </div>

        {/* Input Form - تم حذف زر الذكاء الاصطناعي */}
        {isJunior && (
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <input 
                        value={newCard.russian} 
                        onChange={e => setNewCard({...newCard, russian: e.target.value})}
                        placeholder="Russian Word..." 
                        className="w-full bg-black border border-white/20 p-3 rounded-xl text-white outline-none focus:border-cyan-500"
                    />
                </div>
                <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="Translation" className="flex-1 bg-black border border-white/20 p-3 rounded-xl text-white outline-none focus:border-cyan-500 dir-rtl"/>
                <input value={newCard.category} onChange={e => setNewCard({...newCard, category: e.target.value})} placeholder="Category" className="w-full md:w-32 bg-black border border-white/20 p-3 rounded-xl text-white outline-none focus:border-cyan-500"/>
                <button onClick={handleAddSubmit} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all">ADD</button>
            </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 mb-2 shrink-0 z-10">
         <div className="relative group">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
            <input type="text" placeholder="SCAN DATABASE..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:bg-white/10 outline-none font-mono text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1 text-[10px] font-bold uppercase rounded-full border transition-all whitespace-nowrap ${filter === cat ? "bg-cyan-600 border-cyan-500 text-white" : "bg-transparent text-cyan-500 border-cyan-500/30"}`}>
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
                {filteredCards.map((card, i) => (
                    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={card.id} className="group relative bg-[#0f0f0f] border border-white/5 p-5 rounded-2xl hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        {editingId === card.id ? (
                            <div className="flex flex-col gap-2 relative z-10">
                                <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-black border border-cyan-500 p-2 rounded text-white" />
                                <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-black border border-emerald-500 p-2 rounded text-white text-right" />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={saveEdit} className="flex-1 bg-emerald-600 text-white py-1 rounded text-xs">SAVE</button>
                                    <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-700 text-white py-1 rounded text-xs">CANCEL</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-cyan-400 font-mono uppercase truncate max-w-[70%]">{card.category}</span>
                                    {isJunior && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(card)} className="text-blue-400 hover:bg-blue-900/30 p-1 rounded"><IconPencil size={16} /></button>
                                            <button onClick={() => onDelete(card.id)} className="text-red-400 hover:bg-red-900/30 p-1 rounded"><IconTrash size={16} /></button>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{card.russian}</h3>
                                <p className="text-md text-gray-400 dir-rtl font-cairo">{card.arabic}</p>
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