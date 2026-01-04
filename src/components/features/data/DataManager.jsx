"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  IconTrash, IconPencil, IconSearch, IconDatabase, IconArrowDown, 
  IconPlus, IconCategory, IconSettings, IconX, IconCheck, IconFolder
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * دالة مساعدة لترجمة أسماء المجموعات القادمة من قاعدة البيانات
 * تحول النص "Daily Life" إلى مفتاح الترجمة "cat_daily_life"
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
    card, index, isJunior, editingId, editForm, 
    startEdit, saveEdit, cancelEdit, onDelete, setEditForm, t 
}) => {
    return (
        <motion.div layout initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group relative h-full w-full">
            <div className="relative h-full w-full bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden transition-all hover:border-cyan-500/30">
                <div className="relative z-10 p-6 flex flex-col h-full justify-between min-h-[200px]">
                    {editingId === card.id ? (
                        <div className="flex flex-col gap-3 h-full justify-center animate-in zoom-in-95">
                            <input value={editForm.russian} onChange={(e) => setEditForm(p=>({...p, russian:e.target.value}))} className="bg-black border border-cyan-500 rounded-xl p-2 text-center text-white outline-none" placeholder="Russian" />
                            <input value={editForm.arabic} onChange={(e) => setEditForm(p=>({...p, arabic:e.target.value}))} className="bg-black border border-white/20 rounded-xl p-2 text-center text-white outline-none" placeholder="Arabic" dir="auto"/>
                            <div className="flex gap-2">
                                <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-xs"><IconCheck size={14}/></button>
                                <button onClick={cancelEdit} className="flex-1 bg-zinc-800 text-white py-2 rounded-lg font-bold text-xs"><IconX size={14}/></button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/30 text-cyan-400 text-[10px] font-black uppercase tracking-wider border border-cyan-500/20">
                                    <IconCategory size={10} /> {getCatTranslation(card.category, t)}
                                </span>
                                {isJunior && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(card)} className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500 text-gray-400"><IconPencil size={14}/></button>
                                        <button onClick={() => onDelete(card.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500 text-gray-400"><IconTrash size={14}/></button>
                                    </div>
                                )}
                            </div>
                            <div className="py-6 text-center flex-1 flex flex-col justify-center">
                                <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">{card.russian}</h3>
                            </div>
                            <div className="mt-auto pt-4 border-t border-white/5">
                                <p className="text-sm text-gray-400 group-hover:text-white text-right font-bold" dir="auto">{card.arabic}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

// --- 2. المكون الرئيسي للأرشيف (DataManager) ---
export function DataManager({ onAdd, onDelete, onUpdate, cards = [], isJunior }) {
  const { t, dir } = useLanguage();
  
  // حالات البحث والفلترة والتحميل
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [displayLimit, setDisplayLimit] = useState(20);
  
  // حالة الإضافة والتعديل
  const [newCard, setNewCard] = useState({ russian: "", arabic: "", category: "" });
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ russian: "", arabic: "", category: "" });

  // حالة مدير المجموعات
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

  const handleAddSubmit = () => {
      if(newCard.russian && newCard.arabic && newCard.category) {
          onAdd(newCard);
          setNewCard({ russian: "", arabic: "", category: "" });
          setIsNewCategoryMode(false);
      }
  };

  const startEdit = useCallback((card) => { 
      setEditingId(card.id); setEditForm({ russian: card.russian, arabic: card.arabic, category: card.category });
  }, []);

  const saveEdit = useCallback(() => { 
      if (editingId) { onUpdate(editingId, editForm); setEditingId(null); }
  }, [editingId, editForm, onUpdate]);

  // إدارة المجموعات جماعياً (الحفاظ على الميزة السابقة)
  const handleRenameCategory = (oldName) => {
      if (!newCatNameInput.trim() || newCatNameInput === oldName) {
          setEditingCatName(null); return;
      }
      const cardsToUpdate = cards.filter(c => c.category === oldName);
      cardsToUpdate.forEach(card => onUpdate(card.id, { ...card, category: newCatNameInput }));
      setEditingCatName(null);
  };

  const handleDeleteCategory = (catName) => {
      if (!confirm(`Warning: Delete all items in "${catName}"?`)) return;
      cards.filter(c => c.category === catName).forEach(card => onDelete(card.id));
  };

  // --- واجهة مدير المجموعات ---
  const CategoryManagerModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
        <motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-[#111] border border-white/10 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <IconSettings className="text-cyan-500" size={28}/> {t('archive_manage_groups')}
                </h3>
                <button onClick={() => setShowCatManager(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"><IconX size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {categories.filter(c => c !== "All").map(cat => (
                    <div key={cat} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all group">
                        {editingCatName === cat ? (
                            <div className="flex-1 flex gap-2">
                                <input autoFocus defaultValue={cat} onChange={(e) => setNewCatNameInput(e.target.value)} className="flex-1 bg-black border border-cyan-500 rounded-xl px-4 text-sm text-white outline-none" />
                                <button onClick={() => handleRenameCategory(cat)} className="p-2 bg-green-600 text-white rounded-xl"><IconCheck/></button>
                                <button onClick={() => setEditingCatName(null)} className="p-2 bg-zinc-700 text-white rounded-xl"><IconX/></button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><IconFolder size={20}/></div>
                                    <div>
                                        <span className="font-black text-white text-base block">{getCatTranslation(cat, t)}</span>
                                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{cards.filter(c => c.category === cat).length} {t('archive_items')}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setEditingCatName(cat); setNewCatNameInput(cat); }} className="p-2 hover:bg-cyan-600 rounded-xl text-gray-400 hover:text-white transition-colors"><IconPencil size={18}/></button>
                                    <button onClick={() => handleDeleteCategory(cat)} className="p-2 hover:bg-red-600 rounded-xl text-gray-400 hover:text-white transition-colors"><IconTrash size={18}/></button>
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
    <div className="w-full flex flex-col p-4 md:p-8 font-sans min-h-screen" dir={dir}>
      
      {/* هيدر الصفحة المترجم */}
      <div className="flex flex-col items-center justify-center mb-10 text-center animate-in fade-in duration-700">
          <span className="text-[10px] font-black tracking-[0.4em] text-cyan-500 uppercase mb-2">{t('archive_header')}</span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">{t('nav_archive')}</h1>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                  <IconDatabase size={14}/> <span>{filteredCards.length} {t('archive_items')}</span>
              </div>
              {isJunior && (
                  <button onClick={() => setShowCatManager(true)} className="flex items-center gap-2 text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 hover:bg-cyan-500 hover:text-white transition-all">
                      <IconSettings size={14}/> {t('archive_manage_groups')}
                  </button>
              )}
          </div>
      </div>

      {/* شريط التحكم العائم - تم إصلاح النصوص المفقودة هنا */}
      <div className="sticky top-4 z-40 mb-8 flex justify-center">
         <div className="w-full max-w-6xl bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
             <div className="flex-1 flex items-center gap-3 w-full px-3">
                <IconSearch className="text-gray-500" size={20} />
                <input 
                    type="text" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    placeholder={t('archive_search_placeholder')} 
                    className="flex-1 bg-transparent text-white outline-none text-sm font-bold h-10 uppercase font-mono"
                />
             </div>

             {isJunior && (
                 <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
                     <div className="flex w-full md:w-auto gap-2">
                         {/* ترجمة نصوص Rus و Ara */}
                         <input value={newCard.russian} onChange={e => setNewCard({...newCard, russian: e.target.value})} placeholder={t('archive_rus_ph')} className="flex-1 md:w-28 bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500" />
                         <input value={newCard.arabic} onChange={e => setNewCard({...newCard, arabic: e.target.value})} placeholder={t('archive_ara_ph')} className="flex-1 md:w-28 bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white text-right focus:border-cyan-500" />
                     </div>
                     <div className="flex w-full md:w-auto gap-2">
                        {isNewCategoryMode ? (
                            <div className="flex items-center gap-1 flex-1">
                                <input autoFocus value={newCard.category} onChange={e => setNewCard({...newCard, category: e.target.value})} placeholder={t('archive_new_group_ph')} className="flex-1 bg-black border border-cyan-500 rounded-xl px-3 py-2 text-xs text-white" />
                                <button onClick={() => setIsNewCategoryMode(false)} className="text-gray-500"><IconX size={16}/></button>
                            </div>
                        ) : (
                            <select 
                                value={newCard.category} 
                                onChange={(e) => { if (e.target.value === 'NEW') setIsNewCategoryMode(true); else setNewCard({...newCard, category: e.target.value}); }} 
                                className="flex-1 md:w-32 bg-black border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-white outline-none cursor-pointer"
                            >
                                <option value="" disabled>{t('archive_group_label')}</option>
                                {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{getCatTranslation(c, t)}</option>)}
                                <option value="NEW" className="text-cyan-500 font-bold">{t('archive_new_group')}</option>
                            </select>
                        )}
                        <button onClick={handleAddSubmit} className="h-10 w-10 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl flex items-center justify-center transition-all shadow-xl">
                            <IconPlus size={22}/>
                        </button>
                     </div>
                 </div>
             )}
         </div>
      </div>

      {/* فلاتر التصنيف المترجمة */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => { setFilter(cat); setDisplayLimit(20); }} 
                className={`px-5 py-2 text-[10px] font-black uppercase rounded-full transition-all border 
                ${filter === cat 
                    ? "bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/20" 
                    : "bg-white/5 text-gray-500 border-transparent hover:border-white/10 hover:text-white"}`}
              >
                  {getCatTranslation(cat, t)}
              </button>
          ))}
      </div>

      {/* شبكة البيانات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 w-full max-w-7xl mx-auto">
            {filteredCards.slice(0, displayLimit).map((card, index) => (
                <MemoryNode 
                    key={card.id} card={card} index={index} isJunior={isJunior}
                    editingId={editingId} editForm={editForm} startEdit={startEdit}
                    saveEdit={saveEdit} cancelEdit={() => setEditingId(null)}
                    onDelete={onDelete} setEditForm={setEditForm} t={t}
                />
            ))}
      </div>

      {/* تحميل المزيد */}
      {displayLimit < filteredCards.length && (
            <div className="flex justify-center pb-20">
                <button onClick={() => setDisplayLimit(p => p + 20)} className="group flex flex-col items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors">
                    <span className="text-[10px] font-black tracking-widest uppercase">{t('archive_load_more')}</span>
                    <IconArrowDown size={24} className="animate-bounce"/>
                </button>
            </div>
      )}

      {showCatManager && <CategoryManagerModal />}
    </div>
  );
}