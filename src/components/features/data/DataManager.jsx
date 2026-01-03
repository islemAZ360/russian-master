"use client";
import React, { useState, useMemo, useEffect } from "react";
import { 
  IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, 
  IconPlus, IconCategory, IconSparkles, IconSettings, IconX, IconCheck, IconFolderPlus
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export function DataManager({ onAdd, onDelete, onUpdate, cards = [], isJunior }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [displayLimit, setDisplayLimit] = useState(20);
  
  // States for Adding
  const [newCard, setNewCard] = useState({ russian: "", arabic: "", category: "" });
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);

  // States for Editing Items
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ russian: "", arabic: "", category: "" });

  // States for Category Management
  const [showCatManager, setShowCatManager] = useState(false);
  const [editingCatName, setEditingCatName] = useState(null);
  const [newCatNameInput, setNewCatNameInput] = useState("");

  // Extract Categories
  const categories = useMemo(() => {
    const cats = new Set(cards.map(c => c.category || "General"));
    return ["All", ...Array.from(cats).sort()];
  }, [cards]);

  // Filter Logic
  const filteredCards = useMemo(() => {
      return cards.filter(c => {
        const matchesSearch = (c.russian || "").toLowerCase().includes(search.toLowerCase()) || (c.arabic || "").includes(search);
        const matchesFilter = filter === "All" || (c.category || "Uncategorized") === filter;
        return matchesSearch && matchesFilter;
      });
  }, [cards, search, filter]);

  useEffect(() => { setDisplayLimit(20); }, [search, filter]);

  // --- Handlers ---

  const handleAddSubmit = () => {
      if(newCard.russian && newCard.arabic && newCard.category) {
          onAdd(newCard);
          setNewCard({ russian: "", arabic: "", category: "" }); // Reset but keep category? No, reset all for fresh start
          setIsNewCategoryMode(false);
      }
  };

  const startEdit = (card) => { 
      setEditingId(card.id); 
      setEditForm({ russian: card.russian, arabic: card.arabic, category: card.category });
  };

  const saveEdit = () => { 
      onUpdate(editingId, editForm); 
      setEditingId(null); 
  };

  // Category Management Handlers
  const handleRenameCategory = (oldName) => {
      if (!newCatNameInput.trim() || newCatNameInput === oldName) {
          setEditingCatName(null);
          return;
      }
      // Find all cards with old category name and update them
      const cardsToUpdate = cards.filter(c => c.category === oldName);
      cardsToUpdate.forEach(card => {
          onUpdate(card.id, { ...card, category: newCatNameInput });
      });
      setEditingCatName(null);
      setNewCatNameInput("");
  };

  const handleDeleteCategory = (catName) => {
      if (!confirm(`WARNING: This will delete the group "${catName}" and ALL ${cards.filter(c => c.category === catName).length} words inside it. Are you sure?`)) return;
      
      const cardsToDelete = cards.filter(c => c.category === catName);
      cardsToDelete.forEach(card => {
          onDelete(card.id);
      });
  };

  const visibleCards = filteredCards.slice(0, displayLimit);

  // --- Components ---

  const MemoryNode = ({ card, index }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.03, duration: 0.4 }}
            className="group relative h-full"
        >
            <div className="relative h-full w-full bg-white/5 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--accent-color)]/20 hover:-translate-y-2 border border-white/5 group-hover:border-[var(--accent-color)]/30">
                
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                    
                    {/* EDIT MODE */}
                    {editingId === card.id ? (
                        <div className="flex flex-col gap-3 h-full justify-center">
                            <div className="text-xs font-bold text-[var(--accent-color)] uppercase tracking-widest text-center mb-1">Editing Node</div>
                            
                            <input value={editForm.russian} onChange={(e) => setEditForm({...editForm, russian: e.target.value})} className="bg-black/10 dark:bg-white/10 rounded-xl p-3 text-center font-bold text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--accent-color)]" placeholder="Russian" />
                            <input value={editForm.arabic} onChange={(e) => setEditForm({...editForm, arabic: e.target.value})} className="bg-black/10 dark:bg-white/10 rounded-xl p-3 text-center text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--accent-color)]" placeholder="Arabic" />
                            
                            {/* Category Edit inside Card */}
                            <div className="relative">
                                <input value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="w-full bg-black/10 dark:bg-white/10 rounded-xl p-2 text-xs text-center font-mono text-[var(--text-muted)] outline-none focus:ring-1 focus:ring-[var(--accent-color)]" placeholder="Category" />
                            </div>

                            <div className="flex gap-2 mt-2">
                                <button onClick={saveEdit} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-bold text-xs transition-all shadow-lg">Save</button>
                                <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-[var(--text-main)] py-2 rounded-xl font-bold text-xs transition-all">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        /* VIEW MODE */
                        <>
                            <div className="flex justify-between items-start">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-[var(--accent-color)]/20">
                                    <IconCategory size={12} /> {card.category}
                                </span>
                                
                                {isJunior && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                        <button onClick={() => startEdit(card)} className="p-2 rounded-full bg-white/10 hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-muted)] transition-colors"><IconPencil size={14}/></button>
                                        <button onClick={() => onDelete(card.id)} className="p-2 rounded-full bg-white/10 hover:bg-red-500 hover:text-white text-[var(--text-muted)] transition-colors"><IconTrash size={14}/></button>
                                    </div>
                                )}
                            </div>

                            <div className="py-6 text-center relative">
                                <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-main)] to-[var(--text-muted)] group-hover:to-[var(--accent-color)] transition-all duration-500">
                                    {card.russian}
                                </h3>
                            </div>

                            <div className="mt-auto">
                                <div className="w-8 h-1 bg-[var(--accent-color)]/20 rounded-full mb-3 mx-auto group-hover:w-2/3 group-hover:bg-[var(--accent-color)] transition-all duration-500"></div>
                                <div className="flex justify-between items-end">
                                    <IconSparkles size={16} className="text-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <p className="text-base text-[var(--text-muted)] group-hover:text-[var(--text-main)] dir-rtl font-bold transition-colors">
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

  // --- Category Manager Modal ---
  const CategoryManagerModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-[var(--bg-secondary)] border border-[var(--text-muted)]/20 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-[var(--text-main)] flex items-center gap-2"><IconSettings className="text-[var(--accent-color)]"/> Manage Groups</h3>
                  <button onClick={() => setShowCatManager(false)} className="p-2 hover:bg-white/10 rounded-full text-[var(--text-muted)]"><IconX/></button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3 pr-2">
                  {categories.filter(c => c !== "All" && c !== "Uncategorized").map(cat => (
                      <div key={cat} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-xl border border-white/5 group hover:border-[var(--accent-color)]/30 transition-colors">
                          {editingCatName === cat ? (
                              <div className="flex-1 flex gap-2 mr-2">
                                  <input 
                                    autoFocus
                                    defaultValue={cat} 
                                    onChange={(e) => setNewCatNameInput(e.target.value)}
                                    className="flex-1 bg-black/20 rounded-lg px-3 text-sm text-[var(--text-main)] outline-none border border-[var(--accent-color)]"
                                  />
                                  <button onClick={() => handleRenameCategory(cat)} className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white"><IconCheck size={16}/></button>
                                  <button onClick={() => setEditingCatName(null)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"><IconX size={16}/></button>
                              </div>
                          ) : (
                              <>
                                  <div className="flex items-center gap-3">
                                      <IconCategory size={18} className="text-[var(--text-muted)]"/>
                                      <span className="font-bold text-[var(--text-main)]">{cat}</span>
                                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-[var(--text-muted)]">{cards.filter(c => c.category === cat).length} words</span>
                                  </div>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => { setEditingCatName(cat); setNewCatNameInput(cat); }} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg"><IconPencil size={16}/></button>
                                      <button onClick={() => handleDeleteCategory(cat)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg"><IconTrash size={16}/></button>
                                  </div>
                              </>
                          )}
                      </div>
                  ))}
                  {categories.length <= 2 && <div className="text-center text-[var(--text-muted)] py-4 text-sm">No custom groups found. Add words to create groups.</div>}
              </div>
          </div>
      </div>
  );

  return (
    <div className="w-full flex flex-col p-4 md:p-8 font-sans min-h-screen">
      
      {/* 1. Luxurious Header */}
      <div className="flex flex-col items-center justify-center mb-10 text-center relative">
          <div className="absolute inset-0 bg-[var(--accent-color)]/20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-[0.4em] text-[var(--accent-color)] uppercase mb-2 block">System V.5</span>
              <h1 className="text-5xl md:text-7xl font-black text-[var(--text-main)] tracking-tighter mb-4">
                  Archive
              </h1>
              <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--bg-secondary)]/50 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                      <IconDatabase size={14}/> <span>{filteredCards.length} Units</span>
                  </div>
                  {isJunior && (
                      <button 
                        onClick={() => setShowCatManager(true)}
                        className="flex items-center gap-2 text-xs font-bold text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-4 py-2 rounded-full hover:bg-[var(--accent-color)] hover:text-white transition-all border border-[var(--accent-color)]/20"
                      >
                          <IconSettings size={14}/> Manage Groups
                      </button>
                  )}
              </div>
          </div>
      </div>

      {/* 2. Floating Command Center (Add & Search) */}
      <div className="sticky top-4 z-40 mb-10 flex flex-col gap-4 items-center">
         
         {/* The Search Capsule */}
         <div className="w-full max-w-4xl bg-[var(--bg-secondary)]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 pl-6 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
             <div className="flex-1 flex items-center gap-3 w-full">
                <IconSearch className="text-[var(--text-muted)]" size={22} />
                <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search database..." 
                    className="flex-1 bg-transparent text-[var(--text-main)] placeholder-[var(--text-muted)]/50 outline-none text-base font-medium h-12"
                />
             </div>

             {/* Smart Add System */}
             {isJunior && (
                 <div className="hidden md:flex items-center gap-2 pr-2 border-l border-white/10 pl-4 py-1">
                     <div className="flex flex-col gap-1">
                         <div className="flex gap-2">
                             <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder="Russian" className="w-24 bg-[var(--bg-primary)]/50 rounded-lg px-3 py-1 text-sm outline-none text-[var(--text-main)] border border-transparent focus:border-[var(--accent-color)] transition-colors" />
                             <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="Arabic" className="w-24 bg-[var(--bg-primary)]/50 rounded-lg px-3 py-1 text-sm outline-none text-[var(--text-main)] text-right border border-transparent focus:border-[var(--accent-color)] transition-colors" />
                         </div>
                         <div className="flex gap-2">
                             {/* Intelligent Category Selector */}
                             {isNewCategoryMode ? (
                                <div className="flex items-center gap-1 flex-1">
                                    <input autoFocus value={newCard.category} onChange={e => setNewCard({...newCard, category: e.target.value})} placeholder="New Group Name" className="flex-1 bg-[var(--bg-primary)]/50 rounded-lg px-3 py-1 text-xs outline-none text-[var(--text-main)] border border-[var(--accent-color)]" />
                                    <button onClick={() => setIsNewCategoryMode(false)} className="text-[var(--text-muted)] hover:text-red-500"><IconX size={14}/></button>
                                </div>
                             ) : (
                                <select 
                                    value={newCard.category} 
                                    onChange={(e) => {
                                        if (e.target.value === 'NEW_CAT_TRIGGER') setIsNewCategoryMode(true);
                                        else setNewCard({...newCard, category: e.target.value});
                                    }}
                                    className="flex-1 bg-[var(--bg-primary)]/50 rounded-lg px-3 py-1 text-xs outline-none text-[var(--text-main)] cursor-pointer"
                                >
                                    <option value="" disabled>Select Group</option>
                                    {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="NEW_CAT_TRIGGER" className="font-bold text-[var(--accent-color)]">+ Create New Group</option>
                                </select>
                             )}
                         </div>
                     </div>
                     <button onClick={handleAddSubmit} className="h-10 w-10 bg-[var(--accent-color)] text-white rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-[var(--accent-color)]/40 transition-all ml-2">
                         <IconPlus size={20}/>
                     </button>
                 </div>
             )}
         </div>

         {/* Mobile Add Trigger (if needed) - Keeping it minimal for now */}
      </div>

      {/* 3. Filter Pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)} 
                className={`px-5 py-2 text-xs font-bold rounded-full transition-all duration-300 border
                ${filter === cat 
                    ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30 scale-105" 
                    : "bg-transparent border-[var(--text-muted)]/20 text-[var(--text-muted)] hover:border-[var(--accent-color)] hover:text-[var(--text-main)]"}`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* 4. Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="popLayout">
                {visibleCards.map((card, index) => (
                    <MemoryNode key={card.id} card={card} index={index} />
                ))}
            </AnimatePresence>
      </div>

      {/* 5. Load More */}
      {visibleCards.length < filteredCards.length && (
            <div className="flex justify-center pb-10">
                <button 
                    onClick={() => setDisplayLimit(prev => prev + 20)}
                    className="group flex flex-col items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
                >
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">Load More Data</span>
                    <div className="p-3 rounded-full bg-[var(--bg-secondary)] border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                        <IconArrowDown size={20} className="animate-bounce"/>
                    </div>
                </button>
            </div>
      )}

      {/* Category Manager Modal Overlay */}
      {showCatManager && <CategoryManagerModal />}
    </div>
  );
}