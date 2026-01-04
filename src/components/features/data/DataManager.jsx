"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, 
  IconPlus, IconCategory, IconSparkles, IconSettings, IconX, IconCheck, IconFolder, IconDeviceFloppy
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage"; // استدعاء هوك اللغة

// --- 1. مكون البطاقة (MemoryNode) ---
// تم تصميمه ليكون خفيفاً وسريعاً باستخدام React.memo
const MemoryNode = React.memo(({ 
    card, index, isJunior, 
    editingId, editForm, 
    startEdit, saveEdit, cancelEdit, onDelete, setEditForm, 
    categories 
}) => {
    
    // دالة لتحديث المدخلات أثناء التعديل
    const handleChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "50px" }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }}
            className="group relative h-full w-full"
        >
            <div className="relative h-full w-full bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-cyan-500/30">
                
                {/* تأثير خلفية خفيف */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-300"></div>
                
                <div className="relative z-10 p-5 flex flex-col h-full justify-between min-h-[200px]">
                    
                    {/* --- وضع التعديل (Edit Mode) --- */}
                    {editingId === card.id ? (
                        <div className="flex flex-col gap-3 h-full justify-center animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest text-center mb-2">EDITING DATA</div>
                            
                            <input 
                                value={editForm.russian} 
                                onChange={(e) => handleChange('russian', e.target.value)} 
                                className="bg-black/50 border border-cyan-500 rounded-lg p-2 text-center text-lg font-bold text-white outline-none focus:shadow-[0_0_10px_rgba(6,182,212,0.3)]" 
                                placeholder="Russian" 
                            />
                            <input 
                                value={editForm.arabic} 
                                onChange={(e) => handleChange('arabic', e.target.value)} 
                                className="bg-black/50 border border-white/20 rounded-lg p-2 text-center text-sm text-white outline-none focus:border-cyan-500" 
                                placeholder="Arabic" 
                                dir="auto"
                            />
                            
                            <div className="relative">
                                <input 
                                    list={`cat-list-${card.id}`}
                                    value={editForm.category} 
                                    onChange={(e) => handleChange('category', e.target.value)} 
                                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-[10px] text-center font-mono text-white/70 outline-none focus:border-cyan-500" 
                                    placeholder="Category" 
                                />
                                <datalist id={`cat-list-${card.id}`}>
                                    {categories.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>

                            <div className="flex gap-2 mt-2">
                                <button onClick={saveEdit} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-1"><IconCheck size={14}/> SAVE</button>
                                <button onClick={cancelEdit} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1"><IconX size={14}/> CANCEL</button>
                            </div>
                        </div>
                    ) : (
                        /* --- وضع العرض (View Mode) --- */
                        <>
                            <div className="flex justify-between items-start">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20">
                                    <IconCategory size={10} /> {card.category}
                                </span>
                                
                                {isJunior && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                        <button onClick={() => startEdit(card)} className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500 hover:text-white text-gray-400 transition-colors"><IconPencil size={14}/></button>
                                        <button onClick={() => onDelete(card.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500 hover:text-white text-gray-400 transition-colors"><IconTrash size={14}/></button>
                                    </div>
                                )}
                            </div>

                            <div className="py-6 text-center relative flex-1 flex flex-col justify-center">
                                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors duration-300 drop-shadow-md">
                                    {card.russian}
                                </h3>
                            </div>

                            <div className="mt-auto pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                    <IconSparkles size={14} className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <p className="text-sm text-gray-400 group-hover:text-white dir-rtl font-bold transition-colors" dir="auto">
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
    // Custom comparison for performance
    return prev.card === next.card && 
           prev.editingId === next.editingId && 
           prev.editForm === next.editForm &&
           prev.categories === next.categories && 
           prev.index === next.index;
});

MemoryNode.displayName = "MemoryNode";

// --- 2. المكون الرئيسي (DataManager) ---
export function DataManager({ onAdd, onDelete, onUpdate, cards = [], isJunior }) {
  const { t, dir } = useLanguage();
  
  // States
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [displayLimit, setDisplayLimit] = useState(20);
  
  // New Card State
  const [newCard, setNewCard] = useState({ russian: "", arabic: "", category: "" });
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ russian: "", arabic: "", category: "" });

  // Category Manager State
  const [showCatManager, setShowCatManager] = useState(false);
  const [editingCatName, setEditingCatName] = useState(null);
  const [newCatNameInput, setNewCatNameInput] = useState("");

  // Derived State (Memoized)
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

  // Reset pagination on search/filter
  useEffect(() => { setDisplayLimit(20); }, [search, filter]);

  // --- Handlers (الوظائف الكاملة) ---

  const handleAddSubmit = () => {
      if(newCard.russian && newCard.arabic && newCard.category) {
          onAdd(newCard);
          setNewCard({ russian: "", arabic: "", category: "" });
          setIsNewCategoryMode(false);
      } else {
          alert("Please fill in all fields.");
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

  // وظيفة إعادة تسمية المجموعة
  const handleRenameCategory = (oldName) => {
      if (!newCatNameInput.trim() || newCatNameInput === oldName) {
          setEditingCatName(null);
          return;
      }
      // تحديث كل البطاقات التي تحمل الاسم القديم
      const cardsToUpdate = cards.filter(c => c.category === oldName);
      cardsToUpdate.forEach(card => {
          onUpdate(card.id, { ...card, category: newCatNameInput });
      });
      setEditingCatName(null);
      setNewCatNameInput("");
  };

  // وظيفة حذف مجموعة كاملة
  const handleDeleteCategory = (catName) => {
      if (!confirm(`WARNING: Delete group "${catName}" and ALL its words permanently?`)) return;
      const cardsToDelete = cards.filter(c => c.category === catName);
      cardsToDelete.forEach(card => onDelete(card.id));
  };

  const visibleCards = filteredCards.slice(0, displayLimit);

  // --- 3. نافذة إدارة المجموعات (Category Manager Modal) ---
  const CategoryManagerModal = () => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111] border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <IconSettings className="text-cyan-500"/> {t('archive_manage_groups')}
                  </h3>
                  <button onClick={() => setShowCatManager(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><IconX/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                  {categories.filter(c => c !== "All" && c !== "Uncategorized").map(cat => (
                      <div key={cat} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-colors group">
                          {editingCatName === cat ? (
                              <div className="flex-1 flex gap-2 animate-in fade-in">
                                  <input 
                                    autoFocus 
                                    defaultValue={cat} 
                                    onChange={(e) => setNewCatNameInput(e.target.value)} 
                                    className="flex-1 bg-black border border-cyan-500 rounded-lg px-3 text-sm text-white outline-none"
                                  />
                                  <button onClick={() => handleRenameCategory(cat)} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-500"><IconCheck size={16}/></button>
                                  <button onClick={() => setEditingCatName(null)} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"><IconX size={16}/></button>
                              </div>
                          ) : (
                              <>
                                  <div className="flex items-center gap-3">
                                      <div className="p-2 bg-cyan-900/20 rounded-lg text-cyan-400"><IconFolder size={18}/></div>
                                      <span className="font-bold text-white text-sm">{cat}</span>
                                      <span className="text-[10px] bg-black px-2 py-0.5 rounded text-gray-500 border border-white/5 font-mono">
                                          {cards.filter(c => c.category === cat).length} ITEMS
                                      </span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => { setEditingCatName(cat); setNewCatNameInput(cat); }} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"><IconPencil size={16}/></button>
                                      <button onClick={() => handleDeleteCategory(cat)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><IconTrash size={16}/></button>
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
    <div className="w-full flex flex-col p-4 md:p-8 font-sans min-h-screen" dir={dir}>
      
      {/* 4. الهيدر (Header) */}
      <div className="flex flex-col items-center justify-center mb-10 text-center relative">
          <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-[0.4em] text-cyan-500 uppercase mb-2 block">{t('archive_header')}</span>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
                  {t('modules_title_2')}
              </h1>
              <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                      <IconDatabase size={14}/> <span>{filteredCards.length} {t('archive_items')}</span>
                  </div>
                  {isJunior && (
                      <button 
                        onClick={() => setShowCatManager(true)} 
                        className="flex items-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-full hover:bg-cyan-500 hover:text-white transition-all border border-cyan-500/20"
                      >
                          <IconSettings size={14}/> {t('archive_manage_groups')}
                      </button>
                  )}
              </div>
          </div>
      </div>

      {/* 5. شريط التحكم العائم (Floating Command Center) */}
      <div className="sticky top-4 z-40 mb-8 flex justify-center">
         <div className="w-full max-w-4xl bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 pl-6 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
             
             {/* البحث */}
             <div className="flex-1 flex items-center gap-3 w-full">
                <IconSearch className="text-gray-500" size={20} />
                <input 
                    type="text" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    placeholder={t('archive_search_placeholder')} 
                    className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm font-medium h-10 uppercase font-mono"
                />
             </div>

             {/* نظام الإضافة (للأدمن فقط) */}
             {isJunior && (
                 <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-2 pr-0 md:pr-2 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
                     <div className="flex w-full md:w-auto gap-2">
                         <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder="Rus" className="flex-1 md:w-24 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white focus:border-cyan-500 transition-colors" />
                         <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder="Ara" className="flex-1 md:w-24 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white text-right focus:border-cyan-500 transition-colors" />
                     </div>
                     <div className="flex w-full md:w-auto gap-2">
                        {isNewCategoryMode ? (
                            <div className="flex items-center gap-1 flex-1">
                                <input 
                                    autoFocus 
                                    value={newCard.category} 
                                    onChange={e => setNewCard({...newCard, category: e.target.value})} 
                                    placeholder="New Group" 
                                    className="flex-1 bg-black border border-cyan-500 rounded-lg px-3 py-2 text-xs outline-none text-white" 
                                />
                                <button onClick={() => setIsNewCategoryMode(false)} className="text-gray-500 hover:text-red-500"><IconX size={14}/></button>
                            </div>
                        ) : (
                            <select 
                                value={newCard.category} 
                                onChange={(e) => { 
                                    if (e.target.value === 'NEW_CAT_TRIGGER') setIsNewCategoryMode(true); 
                                    else setNewCard({...newCard, category: e.target.value}); 
                                }} 
                                className="flex-1 md:w-auto bg-black border border-white/10 rounded-lg px-3 py-2 text-xs outline-none text-white cursor-pointer hover:border-white/30"
                            >
                                <option value="" disabled>Group</option>
                                {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="NEW_CAT_TRIGGER" className="font-bold text-cyan-500">+ NEW</option>
                            </select>
                        )}
                        <button onClick={handleAddSubmit} className="h-9 w-9 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center justify-center shadow-lg transition-all border border-cyan-400/50">
                            <IconPlus size={20}/>
                        </button>
                     </div>
                 </div>
             )}
         </div>
      </div>

      {/* 6. فلاتر التصنيف (Filter Pills) */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)} 
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 border 
                ${filter === cat 
                    ? "bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                    : "bg-white/5 text-gray-400 border-transparent hover:border-white/20 hover:text-white"}`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* 7. الشبكة (Grid) */}
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
                    categories={categories.filter(c => c !== "All")}
                />
            ))}
      </div>

      {/* 8. زر تحميل المزيد */}
      {visibleCards.length < filteredCards.length && (
            <div className="flex justify-center pb-10">
                <button 
                    onClick={() => setDisplayLimit(prev => prev + 20)}
                    className="group flex flex-col items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors"
                >
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">{t('archive_load_more')}</span>
                    <div className="p-3 rounded-full bg-white/5 border border-white/10 shadow-lg group-hover:scale-110 transition-transform group-hover:border-cyan-500/30">
                        <IconArrowDown size={20} className="animate-bounce"/>
                    </div>
                </button>
            </div>
      )}

      {showCatManager && <CategoryManagerModal />}
    </div>
  );
}