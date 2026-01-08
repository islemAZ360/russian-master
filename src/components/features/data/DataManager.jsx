"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, 
  IconPlus, IconCategory, IconSettings, IconX, IconCheck, IconFolder, 
  IconLock, IconEye, IconCpu, IconServer
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * دالة مساعدة لترجمة أسماء المجموعات
 */
const getCatTranslation = (catName, t) => {
    if (!catName) return t('cat_uncategorized');
    if (catName === 'All') return t('cat_all');
    if (catName === 'General') return t('cat_general');
    const key = `cat_${catName.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`;
    const translated = t(key);
    return translated === key ? catName : translated;
};

// --- 1. مكون بطاقة الذاكرة الفردية (MemoryNode) ---
const MemoryNode = React.memo(({ 
    card, index, canEdit, 
    editingId, editForm, 
    startEdit, saveEdit, cancelEdit, onDelete, setEditForm, 
    categories, t 
}) => {
    
    const handleChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    // تحديد ما إذا كانت البطاقة "نظام" (لا يمكن حذفها بسهولة) أو "مخصصة"
    // (في هذا التصميم نفترض أن البطاقات القابلة للتعديل هي فقط التي يملكها المستخدم)
    const isSystemCard = !card.id || card.id.toString().length < 5; // افتراض بسيط للتمييز

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group relative h-full w-full"
        >
            <div className={`relative h-full w-full bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] group-hover:-translate-y-1`}>
                
                {/* خلفية متوهجة خفيفة */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <div className="relative z-10 p-6 flex flex-col h-full justify-between min-h-[220px]">
                    
                    {editingId === card.id ? (
                        /* وضع التعديل (Edit Mode) */
                        <div className="flex flex-col gap-3 h-full justify-center animate-in fade-in zoom-in-95">
                            <input 
                                value={editForm.russian} 
                                onChange={(e) => handleChange('russian', e.target.value)} 
                                className="bg-black/50 border border-cyan-500 rounded-xl p-3 text-center text-white outline-none font-bold text-sm" 
                                placeholder="Russian" 
                            />
                            <input 
                                value={editForm.arabic} 
                                onChange={(e) => handleChange('arabic', e.target.value)} 
                                className="bg-black/50 border border-white/20 rounded-xl p-3 text-center text-white outline-none font-bold text-sm" 
                                placeholder="Arabic" 
                                dir="auto"
                            />
                            <select 
                                value={editForm.category} 
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-xl p-2 text-[10px] font-black text-cyan-500 outline-none uppercase"
                            >
                                {categories.filter(c => c !== "All").map(c => (
                                    <option key={c} value={c}>{getCatTranslation(c, t)}</option>
                                ))}
                            </select>
                            <div className="flex gap-2 mt-2">
                                <button onClick={saveEdit} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-black text-xs shadow-lg transition-colors"><IconCheck size={18} className="mx-auto"/></button>
                                <button onClick={cancelEdit} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-xl font-black text-xs transition-colors"><IconX size={18} className="mx-auto"/></button>
                            </div>
                        </div>
                    ) : (
                        /* وضع العرض (View Mode) */
                        <>
                            <div className="flex justify-between items-start">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-cyan-400 text-[9px] font-black uppercase tracking-widest border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                                    <IconCategory size={12} /> {getCatTranslation(card.category, t)}
                                </span>
                                
                                {canEdit ? (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 translate-x-2 group-hover:translate-x-0">
                                        <button onClick={() => startEdit(card)} className="p-2 rounded-xl bg-white/5 hover:bg-indigo-600 text-gray-400 hover:text-white transition-colors border border-white/10"><IconPencil size={14}/></button>
                                        <button onClick={() => onDelete(card.id)} className="p-2 rounded-xl bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white transition-colors border border-white/10"><IconTrash size={14}/></button>
                                    </div>
                                ) : (
                                    <div className="opacity-20 text-white" title="System Protected">
                                        <IconLock size={14} />
                                    </div>
                                )}
                            </div>

                            <div className="py-6 text-center flex-1 flex flex-col justify-center relative">
                                <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight select-text drop-shadow-md">
                                    {card.russian}
                                </h3>
                                {/* زخرفة خلفية للنص */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-cyan-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-end">
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                                    ID: {card.id?.toString().substring(0,4) || "SYS"}
                                </span>
                                <p className="text-sm text-white/40 group-hover:text-white text-right font-bold transition-colors select-text" dir="auto">
                                    {card.arabic}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
});
MemoryNode.displayName = "MemoryNode";

// --- 2. المكون الرئيسي (DataManager) ---
export function DataManager({ onAdd, onDelete, onUpdate, cards = [] }) {
  const { t, dir } = useLanguage();
  
  const canEdit = !!(onAdd && onDelete && onUpdate);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [displayLimit, setDisplayLimit] = useState(20);
  
  const [newCard, setNewCard] = useState({ russian: "", arabic: "", category: "" });
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ russian: "", arabic: "", category: "" });

  const [showCatManager, setShowCatManager] = useState(false);
  const [editingCatName, setEditingCatName] = useState(null);
  const [newCatNameInput, setNewCatNameInput] = useState("");

  const categories = useMemo(() => {
    const cats = new Set(cards.map(c => c.category || "General"));
    return ["All", ...Array.from(cats).sort()];
  }, [cards]);

  const filteredCards = useMemo(() => {
      const s = search.toLowerCase();
      return cards.filter(c => {
        const matchesSearch = !search || (c.russian || "").toLowerCase().includes(s) || (c.arabic || "").includes(search);
        const matchesFilter = filter === "All" || (c.category || "Uncategorized") === filter;
        return matchesSearch && matchesFilter;
      });
  }, [cards, search, filter]);

  useEffect(() => { setDisplayLimit(20); }, [search, filter]);

  // --- العمليات ---

  const handleAddSubmit = () => {
      if(newCard.russian && newCard.arabic && newCard.category && canEdit) {
          onAdd(newCard);
          setNewCard({ russian: "", arabic: "", category: "" });
          setIsNewCategoryMode(false);
      }
  };

  const startEdit = useCallback((card) => { 
      if (!canEdit) return;
      setEditingId(card.id); 
      setEditForm({ russian: card.russian, arabic: card.arabic, category: card.category });
  }, [canEdit]);

  const saveEdit = useCallback(() => { 
      if (editingId && editForm.russian && editForm.arabic && canEdit) {
          onUpdate(editingId, editForm); 
          setEditingId(null); 
      }
  }, [editingId, editForm, onUpdate, canEdit]);

  const handleRenameCategory = (oldName) => {
      if (!canEdit) return;
      if (!newCatNameInput.trim() || newCatNameInput === oldName) {
          setEditingCatName(null); return;
      }
      const cardsToUpdate = cards.filter(c => c.category === oldName);
      cardsToUpdate.forEach(card => {
          onUpdate(card.id, { ...card, category: newCatNameInput });
      });
      setEditingCatName(null);
  };

  const handleDeleteCategory = (catName) => {
      if (!canEdit) return;
      if (!confirm(`WARNING: Delete group "${catName}" and ALL its records?`)) return;
      const cardsToDelete = cards.filter(c => c.category === catName);
      cardsToDelete.forEach(card => onDelete(card.id));
  };

  // --- Modal ---
  const CategoryManagerModal = () => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-[#0c0c0c] border border-white/10 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                  <h3 className="text-2xl font-black text-white flex items-center gap-3">
                      <IconSettings className="text-cyan-500" size={28}/> {t('archive_manage_groups')}
                  </h3>
                  <button onClick={() => setShowCatManager(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                    <IconX size={24}/>
                  </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                  {categories.filter(c => c !== "All").map(cat => (
                      <div key={cat} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all group">
                          {editingCatName === cat ? (
                              <div className="flex-1 flex gap-2 animate-in fade-in">
                                  <input autoFocus defaultValue={cat} onChange={(e) => setNewCatNameInput(e.target.value)} className="flex-1 bg-black border border-cyan-500 rounded-xl px-4 text-sm text-white outline-none" />
                                  <button onClick={() => handleRenameCategory(cat)} className="p-2 bg-green-600 text-white rounded-xl"><IconCheck size={18}/></button>
                                  <button onClick={() => setEditingCatName(null)} className="p-2 bg-zinc-700 text-white rounded-xl"><IconX size={18}/></button>
                              </div>
                          ) : (
                              <>
                                  <div className="flex items-center gap-4">
                                      <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><IconFolder size={20}/></div>
                                      <div>
                                          <span className="font-black text-white text-base block tracking-tight">{getCatTranslation(cat, t)}</span>
                                          <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                                            {cards.filter(c => c.category === cat).length} {t('archive_items')}
                                          </span>
                                      </div>
                                  </div>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                      <button onClick={() => { setEditingCatName(cat); setNewCatNameInput(cat); }} className="p-2 hover:bg-cyan-600 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/10"><IconPencil size={18}/></button>
                                      <button onClick={() => handleDeleteCategory(cat)} className="p-2 hover:bg-red-600 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/10"><IconTrash size={18}/></button>
                                  </div>
                              </>
                          )}
                      </div>
                  ))}
              </div>
          </motion.div>
      </div>
  );

  return (
    <div className="w-full flex flex-col p-4 md:p-10 font-sans min-h-screen" dir={dir}>
      
      {/* 1. Header */}
      <div className="flex flex-col items-center justify-center mb-12 text-center animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
               <IconServer size={12} /> {canEdit ? "WRITE ACCESS GRANTED" : "READ ONLY MODE"}
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 uppercase drop-shadow-2xl">
              {t('nav_archive')}
          </h1>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 bg-[#0a0a0a] px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md uppercase tracking-widest shadow-lg">
                  <IconDatabase size={16} className="text-cyan-500"/> <span>{filteredCards.length} {t('archive_items')}</span>
              </div>
              {canEdit ? (
                  <button 
                    onClick={() => setShowCatManager(true)} 
                    className="flex items-center gap-2 text-[10px] font-black text-white bg-indigo-600 px-6 py-3 rounded-2xl hover:bg-indigo-500 transition-all border border-indigo-400/20 uppercase tracking-widest shadow-lg shadow-indigo-900/20"
                  >
                      <IconSettings size={14}/> {t('archive_manage_groups')}
                  </button>
              ) : (
                  <div className="flex items-center gap-2 text-[10px] font-black text-white/30 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 uppercase tracking-widest cursor-not-allowed">
                      <IconEye size={14}/> Viewer Mode
                  </div>
              )}
          </div>
      </div>

      {/* 2. Control Bar */}
      <div className="sticky top-6 z-40 mb-12 flex justify-center">
         <div className="w-full max-w-6xl bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col md:flex-row gap-5 items-center">
             
             <div className="flex-1 flex items-center gap-4 w-full px-4 group">
                <IconSearch className="text-gray-500 group-focus-within:text-cyan-500 transition-colors" size={22} />
                <input 
                    type="text" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    placeholder={t('archive_search_placeholder')} 
                    className="flex-1 bg-transparent text-white outline-none text-sm font-black h-12 uppercase font-mono tracking-wider placeholder:text-gray-700"
                />
             </div>

             {canEdit && (
                 <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-5">
                     <div className="flex w-full md:w-auto gap-3">
                         <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder={t('archive_rus_ph')} className="flex-1 md:w-32 bg-black/50 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold text-white focus:border-cyan-500 transition-all outline-none" />
                         <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder={t('archive_ara_ph')} className="flex-1 md:w-32 bg-black/50 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold text-white text-right focus:border-cyan-500 transition-all outline-none" />
                     </div>
                     <div className="flex w-full md:w-auto gap-3">
                        {isNewCategoryMode ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input autoFocus value={newCard.category} onChange={e => setNewCard({...newCard, category: e.target.value})} placeholder={t('archive_new_group_ph')} className="flex-1 bg-black/50 border border-cyan-500 rounded-2xl px-4 py-3 text-xs font-black text-white outline-none" />
                                <button onClick={() => setIsNewCategoryMode(false)} className="text-red-500 hover:scale-110 transition-transform"><IconX size={20}/></button>
                            </div>
                        ) : (
                            <select 
                                value={newCard.category} 
                                onChange={(e) => { if (e.target.value === 'NEW') setIsNewCategoryMode(true); else setNewCard({...newCard, category: e.target.value}); }} 
                                className="flex-1 md:w-40 bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-[10px] font-black uppercase text-white outline-none cursor-pointer hover:border-white/30 transition-colors"
                            >
                                <option value="" disabled>{t('archive_group_label')}</option>
                                {categories.filter(c => c !== "All").map(c => (
                                    <option key={c} value={c}>{getCatTranslation(c, t)}</option>
                                ))}
                                <option value="NEW" className="text-cyan-500 font-black">{t('archive_new_group')}</option>
                            </select>
                        )}
                        <button onClick={handleAddSubmit} className="h-12 w-12 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-cyan-900/20 active:scale-95">
                            <IconPlus size={24}/>
                        </button>
                     </div>
                 </div>
             )}
         </div>
      </div>

      {/* 3. Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 animate-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto">
          {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => { setFilter(cat); setDisplayLimit(20); }} 
                className={`px-5 py-2 text-[9px] font-black uppercase rounded-xl transition-all border tracking-widest
                ${filter === cat 
                    ? "bg-cyan-950 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                    : "bg-[#0a0a0a] text-gray-500 border-white/5 hover:border-white/20 hover:text-white"}`}
              >
                  {getCatTranslation(cat, t)}
              </button>
          ))}
      </div>

      {/* 4. Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32 w-full max-w-7xl mx-auto">
            {filteredCards.slice(0, displayLimit).map((card, index) => (
                <MemoryNode 
                    key={card.id || index} card={card} index={index} 
                    canEdit={canEdit}
                    editingId={editingId} editForm={editForm} startEdit={startEdit}
                    saveEdit={saveEdit} cancelEdit={() => setEditingId(null)}
                    onDelete={onDelete} setEditForm={setEditForm} t={t}
                    categories={categories}
                />
            ))}
      </div>

      {/* 5. Load More */}
      {displayLimit < filteredCards.length && (
            <div className="flex flex-col items-center justify-center pb-32">
                <button onClick={() => setDisplayLimit(p => p + 20)} className="group flex flex-col items-center gap-4 text-gray-600 hover:text-cyan-400 transition-all">
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase">{t('archive_load_more')}</span>
                    <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:scale-110 transition-all shadow-xl">
                        <IconArrowDown size={32} className="animate-bounce"/>
                    </div>
                </button>
            </div>
      )}

      <AnimatePresence>
          {showCatManager && canEdit && <CategoryManagerModal />}
      </AnimatePresence>
    </div>
  );
}