"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, 
  IconPlus, IconCategory, IconSparkles, IconSettings, IconX, IconCheck
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

// --- مكون البطاقة (MemoryNode) ---
const MemoryNode = React.memo(({ card, index, isJunior, editingId, editForm, startEdit, saveEdit, cancelEdit, onDelete, setEditForm, categories }) => {
    // التعامل مع تغيير القيم في حقول التعديل
    const handleChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
            className="relative h-full w-full"
        >
            <div className="group relative h-full w-full bg-white/5 dark:bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[var(--accent-color)]/10 hover:-translate-y-1 hover:border-[var(--accent-color)]/30">
                
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 p-6 flex flex-col h-full justify-between min-h-[220px]">
                    
                    {/* وضع التعديل */}
                    {editingId === card.id ? (
                        <div className="flex flex-col gap-3 h-full justify-center">
                            <div className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest text-center">Editing</div>
                            
                            <input 
                                value={editForm.russian} 
                                onChange={(e) => handleChange('russian', e.target.value)} 
                                className="bg-black/10 dark:bg-white/10 rounded-xl p-2 text-center font-bold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--accent-color)] text-sm" 
                                placeholder="Russian" 
                            />
                            <input 
                                value={editForm.arabic} 
                                onChange={(e) => handleChange('arabic', e.target.value)} 
                                className="bg-black/10 dark:bg-white/10 rounded-xl p-2 text-center text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--accent-color)] text-sm" 
                                placeholder="Arabic" 
                            />
                            
                            {/* قائمة منسدلة لتغيير المجموعة */}
                            <div className="relative">
                                <input 
                                    list="category-options"
                                    value={editForm.category} 
                                    onChange={(e) => handleChange('category', e.target.value)} 
                                    className="w-full bg-black/10 dark:bg-white/10 rounded-xl p-2 text-[10px] text-center font-mono text-[var(--text-muted)] outline-none focus:ring-1 focus:ring-[var(--accent-color)]" 
                                    placeholder="Category" 
                                />
                                <datalist id="category-options">
                                    {categories.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>

                            <div className="flex gap-2 mt-1">
                                <button onClick={saveEdit} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-bold text-xs transition-all">Save</button>
                                <button onClick={cancelEdit} className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-[var(--text-main)] py-2 rounded-xl font-bold text-xs transition-all">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        /* وضع العرض */
                        <>
                            <div className="flex justify-between items-start">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-bold uppercase tracking-wider border border-[var(--accent-color)]/20">
                                    <IconCategory size={10} /> {card.category}
                                </span>
                                
                                {isJunior && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <button onClick={() => startEdit(card)} className="p-1.5 rounded-full bg-white/10 hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-muted)] transition-colors"><IconPencil size={14}/></button>
                                        <button onClick={() => onDelete(card.id)} className="p-1.5 rounded-full bg-white/10 hover:bg-red-500 hover:text-white text-[var(--text-muted)] transition-colors"><IconTrash size={14}/></button>
                                    </div>
                                )}
                            </div>

                            <div className="py-4 text-center">
                                <h3 className="text-2xl font-black text-[var(--text-main)] group-hover:text-[var(--accent-color)] transition-colors duration-300 leading-tight">
                                    {card.russian}
                                </h3>
                            </div>

                            <div className="mt-auto">
                                <div className="w-8 h-0.5 bg-[var(--accent-color)]/20 rounded-full mb-3 mx-auto group-hover:w-1/2 group-hover:bg-[var(--accent-color)] transition-all duration-500"></div>
                                <div className="flex justify-between items-end">
                                    <IconSparkles size={14} className="text-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <p className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text-main)] dir-rtl font-bold transition-colors">
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
}, (prev, next) => {
    return prev.card === next.card && 
           prev.editingId === next.editingId && 
           prev.editForm === next.editForm &&
           prev.categories === next.categories && // التأكد من تحديث الفئات
           prev.index === next.index;
});

MemoryNode.displayName = "MemoryNode";

// --- المكون الرئيسي ---
export function DataManager({ onAdd, onDelete, onUpdate, cards = [], isJunior }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [displayLimit, setDisplayLimit] = useState(20);
  
  // States for Adding
  const [newCard, setNewCard] = useState({ russian: "", arabic: "", category: "" });
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);

  // States for Editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ russian: "", arabic: "", category: "" });

  // States for Category Manager
  const [showCatManager, setShowCatManager] = useState(false);
  const [editingCatName, setEditingCatName] = useState(null);
  const [newCatNameInput, setNewCatNameInput] = useState("");

  const categories = useMemo(() => {
    const cats = new Set(cards.map(c => c.category || "General"));
    return ["All", ...Array.from(cats).sort()];
  }, [cards]);

  const filteredCards = useMemo(() => {
      const lowerSearch = search.toLowerCase();
      return cards.filter(c => {
        const matchesSearch = !search || (c.russian || "").toLowerCase().includes(lowerSearch) || (c.arabic || "").includes(search);
        const matchesFilter = filter === "All" || (c.category || "Uncategorized") === filter;
        return matchesSearch && matchesFilter;
      });
  }, [cards, search, filter]);

  useEffect(() => { setDisplayLimit(20); }, [search, filter]);

  // --- Handlers (تم إصلاحها) ---

  const handleAddSubmit = () => {
      if(newCard.russian && newCard.arabic && newCard.category) {
          // استدعاء دالة الإضافة من الـ props
          onAdd(newCard); 
          // إعادة تعيين الحقول
          setNewCard({ russian: "", arabic: "", category: "" });
          setIsNewCategoryMode(false);
      } else {
          alert("Please fill in all fields (Russian, Arabic, and Category)");
      }
  };

  const startEdit = useCallback((card) => { 
      setEditingId(card.id); 
      setEditForm({ russian: card.russian, arabic: card.arabic, category: card.category });
  }, []);

  const saveEdit = useCallback(() => { 
      if (editingId && editForm.russian && editForm.arabic) {
          onUpdate(editingId, editForm); 
          setEditingId(null); 
      }
  }, [editingId, editForm, onUpdate]);

  const cancelEdit = useCallback(() => {
      setEditingId(null);
  }, []);

  // Category Management Handlers
  const handleRenameCategory = (oldName) => {
      if (!newCatNameInput.trim() || newCatNameInput === oldName) {
          setEditingCatName(null);
          return;
      }
      const cardsToUpdate = cards.filter(c => c.category === oldName);
      cardsToUpdate.forEach(card => {
          onUpdate(card.id, { ...card, category: newCatNameInput });
      });
      setEditingCatName(null);
      setNewCatNameInput("");
  };

  const handleDeleteCategory = (catName) => {
      if (!confirm(`Delete group "${catName}" and ALL its words?`)) return;
      const cardsToDelete = cards.filter(c => c.category === catName);
      cardsToDelete.forEach(card => onDelete(card.id));
  };

  const visibleCards = filteredCards.slice(0, displayLimit);

  // --- Category Manager Modal ---
  const CategoryManagerModal = () => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
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
                                  <input autoFocus defaultValue={cat} onChange={(e) => setNewCatNameInput(e.target.value)} className="flex-1 bg-black/20 rounded-lg px-3 text-sm text-[var(--text-main)] outline-none border border-[var(--accent-color)]"/>
                                  <button onClick={() => handleRenameCategory(cat)} className="p-2 bg-green-500/20 text-green-500 rounded-lg"><IconCheck size={16}/></button>
                                  <button onClick={() => setEditingCatName(null)} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><IconX size={16}/></button>
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
              </div>
          </div>
      </div>
  );

  return (
    <div className="w-full flex flex-col p-4 md:p-8 font-sans min-h-screen">
      
      {/* 1. Header */}
      <div className="flex flex-col items-center justify-center mb-8 text-center relative">
          <div className="absolute inset-0 bg-[var(--accent-color)]/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-[0.4em] text-[var(--accent-color)] uppercase mb-2 block">Knowledge Base</span>
              <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter mb-4">Archive</h1>
              <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--bg-secondary)]/50 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                      <IconDatabase size={14}/> <span>{filteredCards.length} Units</span>
                  </div>
                  {isJunior && (
                      <button onClick={() => setShowCatManager(true)} className="flex items-center gap-2 text-xs font-bold text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-4 py-2 rounded-full hover:bg-[var(--accent-color)] hover:text-white transition-all border border-[var(--accent-color)]/20">
                          <IconSettings size={14}/> Groups
                      </button>
                  )}
              </div>
          </div>
      </div>

      {/* 2. Floating Command Center (تم إصلاح نظام الإضافة) */}
      <div className="sticky top-4 z-40 mb-8 flex justify-center">
         <div className="w-full max-w-4xl bg-[var(--bg-secondary)]/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 pl-6 shadow-xl flex flex-col md:flex-row gap-4 items-center">
             <div className="flex-1 flex items-center gap-3 w-full">
                <IconSearch className="text-[var(--text-muted)]" size={20} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent text-[var(--text-main)] placeholder-[var(--text-muted)]/50 outline-none text-base font-medium h-10"/>
             </div>
             {isJunior && (
                 <div className="hidden md:flex items-center gap-2 pr-2 border-l border-white/10 pl-4 py-1">
                     <div className="flex flex-col gap-1">
                         <div className="flex gap-2">
                             <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder="Rus" className="w-24 bg-[var(--bg-primary)]/50 rounded-lg px-3 py-1 text-sm outline-none text-[var(--text-main)] border border-transparent focus:border-[var(--accent-color)] transition-colors" />
                             <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="Ara" className="w-24 bg-[var(--bg-primary)]/50 rounded-lg px-3 py-1 text-sm outline-none text-[var(--text-main)] text-right border border-transparent focus:border-[var(--accent-color)] transition-colors" />
                         </div>
                         <div className="flex gap-2">
                             {/* Intelligent Category Selector */}
                             {isNewCategoryMode ? (
                                <div className="flex items-center gap-1 flex-1">
                                    <input 
                                        autoFocus 
                                        value={newCard.category} 
                                        onChange={e => setNewCard({...newCard, category: e.target.value})} 
                                        placeholder="New Group Name" 
                                        className="flex-1 bg-[var(--bg-primary)]/50 rounded-lg px-3 py-1 text-xs outline-none text-[var(--text-main)] border border-[var(--accent-color)]" 
                                    />
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
      </div>

      {/* 3. Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${filter === cat ? "bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--text-main)] hover:text-[var(--bg-primary)]"}`}>
                  {cat}
              </button>
          ))}
      </div>

      {/* 4. The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 w-full max-w-7xl mx-auto">
            {visibleCards.map((card, index) => (
                <MemoryNode 
                    key={card.id} 
                    card={card} 
                    index={index}
                    isJunior={isJunior}
                    editingId={editingId}
                    editForm={editForm}
                    startEdit={startEdit}
                    saveEdit={saveEdit}
                    cancelEdit={cancelEdit}
                    onDelete={onDelete}
                    setEditForm={setEditForm}
                    categories={categories.filter(c => c !== "All")} // Pass categories for dropdown
                />
            ))}
      </div>

      {visibleCards.length < filteredCards.length && (
            <div className="flex justify-center pb-10">
                <button onClick={() => setDisplayLimit(prev => prev + 20)} className="group flex flex-col items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">Load More</span>
                    <div className="p-3 rounded-full bg-[var(--bg-secondary)] border border-white/10 shadow-lg group-hover:scale-110 transition-transform"><IconArrowDown size={20} className="animate-bounce"/></div>
                </button>
            </div>
      )}

      {showCatManager && <CategoryManagerModal />}
    </div>
  );
}