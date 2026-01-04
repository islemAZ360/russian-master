"use client";
import React, { useState, useMemo } from 'react';
import { 
  IconScript, IconPlus, IconTrash, IconPlayerPlay, 
  IconDownload, IconEye, IconCode, IconMovie, 
  IconPhoto, IconChevronRight, IconCheck, IconSettings,
  IconMessages, IconQuestionMark, IconHierarchy
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * محرر السيناريوهات المتطور (Scenario Editor)
 * أداة إدارية لبناء المحتوى التفاعلي مع دعم كامل للغات والاتجاهات
 */

export default function ScenarioEditor() {
  const { t, dir, isRTL } = useLanguage();

  // --- إعدادات العناصر والبيانات المترجمة ---
  const SCENARIO_ELEMENTS = useMemo(() => [
    { type: 'dialogue', icon: <IconMessages size={20}/>, label: t('scenario_element_dialogue') || 'Dialogue', color: '#3B82F6' },
    { type: 'choice', icon: <IconHierarchy size={20}/>, label: t('scenario_element_choice') || 'Choice', color: '#10B981' },
    { type: 'quiz', icon: <IconQuestionMark size={20}/>, label: t('scenario_element_quiz') || 'Quiz', color: '#F59E0B' },
    { type: 'audio', icon: <IconMovie size={20}/>, label: t('notif_type_support') || 'Audio', color: '#8B5CF6' },
    { type: 'image', icon: <IconPhoto size={20}/>, label: t('identity_title') || 'Visual', color: '#EC4899' },
  ], [t]);

  const BACKGROUNDS = [
    { id: 'classroom', name: 'Classroom', url: '/backgrounds/classroom.jpg' },
    { id: 'moscow', name: 'Moscow Center', url: '/backgrounds/moscow.jpg' },
    { id: 'forest', name: 'Russian Forest', url: '/backgrounds/forest.jpg' },
  ];

  // --- حالات الحالة (States) ---
  const [scenes, setScenes] = useState([]);
  const [selectedScene, setSelectedScene] = useState(null);
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [previewMode, setPreviewMode] = useState(false);
  const [title, setTitle] = useState('New_Neural_Scenario');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  // --- العمليات الأساسية (Core Actions) ---

  const addScene = (type) => {
    const newScene = {
      id: Date.now(),
      type,
      title: `${t('archive_group_label')} ${scenes.length + 1}`,
      content: type === 'dialogue' ? { character: 'Teacher', text: '', duration: 3 } : { question: '', options: [{ text: '', next: null }] },
    };
    setScenes([...scenes, newScene]);
    setSelectedScene(newScene.id);
  };

  const updateScene = (id, updates) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteScene = (id) => {
    setScenes(scenes.filter(s => s.id !== id));
    if (selectedScene === id) setSelectedScene(null);
  };

  const exportScenario = () => {
    const data = { title, background, scenes, version: '4.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.json`;
    link.click();
  };

  return (
    <div className="w-full h-full flex bg-[#050505] text-white overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl" dir={dir}>
      
      {/* 1. شريط الأدوات الجانبي (Tools Sidebar) */}
      <aside className={`w-20 border-${isRTL ? 'l' : 'r'} border-white/10 flex flex-col items-center py-8 space-y-6 bg-black/40`}>
        <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-500 mb-4">
            <IconScript size={28} />
        </div>
        {SCENARIO_ELEMENTS.map(el => (
          <button
            key={el.type}
            onClick={() => addScene(el.type)}
            className="p-4 rounded-2xl hover:bg-white/5 transition-all group relative"
            style={{ color: el.color }}
          >
            {el.icon}
            <div className={`absolute ${isRTL ? 'right-full mr-4' : 'left-full ml-4'} top-1/2 -translate-y-1/2 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-all`}>
              {el.label}
            </div>
          </button>
        ))}
      </aside>

      {/* 2. منطقة العمل الرئيسية (Main Workspace) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* هيدر المحرر العلوي */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none text-xl font-black focus:outline-none focus:text-indigo-400 transition-colors uppercase tracking-tighter"
              placeholder="SCENARIO_TITLE"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${previewMode ? 'bg-amber-600 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
            >
              {previewMode ? <IconEye size={16}/> : <IconPlayerPlay size={16}/>}
              {previewMode ? t('admin_overview') : t('live_connect_btn')}
            </button>
            <button
              onClick={exportScenario}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg"
            >
              <IconDownload size={16} /> {t('scenario_export') || 'Export'}
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          {/* قائمة المشاهد (Scenes List) */}
          <div className={`w-72 border-${isRTL ? 'l' : 'r'} border-white/10 p-6 overflow-y-auto custom-scrollbar bg-black/20`}>
            <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{t('archive_header')}</span>
                <span className="bg-white/5 px-2 py-0.5 rounded font-mono text-[9px]">{scenes.length}</span>
            </div>
            
            <div className="space-y-3">
              {scenes.map(scene => (
                <div
                  key={scene.id}
                  onClick={() => setSelectedScene(scene.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border group relative ${
                    selectedScene === scene.id
                      ? 'bg-indigo-600 border-indigo-400 shadow-xl'
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase truncate pr-4">{scene.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteScene(scene.id); }}
                      className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                  <div className="text-[8px] font-mono opacity-40 mt-1 uppercase tracking-widest">{scene.type}</div>
                </div>
              ))}
              {scenes.length === 0 && (
                  <div className="py-10 text-center opacity-20 flex flex-col items-center gap-3 border-2 border-dashed border-white/5 rounded-3xl">
                      <IconScript size={32}/>
                      <span className="text-[9px] font-black uppercase tracking-widest">No_Scenes_Defined</span>
                  </div>
              )}
            </div>
          </div>

          {/* محرر الخصائص (Canvas/Editor) */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-[0.02]">
            {previewMode ? (
              <div className="w-full h-full rounded-3xl border border-white/10 bg-black flex items-center justify-center relative overflow-hidden">
                <div className="text-center z-10">
                  <IconMovie size={64} className="text-indigo-500/50 mx-auto mb-6 animate-pulse" />
                  <h3 className="text-2xl font-black uppercase tracking-widest mb-2">Simulated_Interface</h3>
                  <p className="text-white/30 text-xs font-mono">{t('live_active_desc')}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-black pointer-events-none"></div>
              </div>
            ) : selectedScene ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedScene}
                className="max-w-3xl mx-auto space-y-8"
              >
                {/* واجهة تعديل المشهد بناءً على النوع */}
                {(() => {
                  const scene = scenes.find(s => s.id === selectedScene);
                  return (
                    <div className="bg-[#0c0c0c] border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600/30"></div>
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <IconSettings className="text-indigo-500" size={20}/> 
                            {t('settings_title')}: <span className="text-indigo-400">{scene.type}</span>
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">{t('archive_group_label')}</label>
                                    <input 
                                        value={scene.title}
                                        onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">{t('identity_avatar_label')}</label>
                                    <select className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all">
                                        <option>Dimitri (Teacher)</option>
                                        <option>Sasha (Student)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">{t('chat_type_msg')}</label>
                                <textarea 
                                    className="w-full h-40 bg-black border border-white/10 rounded-3xl p-6 text-sm leading-relaxed focus:border-indigo-500 outline-none transition-all resize-none font-medium"
                                    placeholder="Enter transmission data..."
                                />
                            </div>
                        </div>
                    </div>
                  );
                })()}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <IconHierarchy size={80} className="mb-6"/>
                <h3 className="text-3xl font-black uppercase tracking-[0.3em]">Select_Node_To_Edit</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. لوحة المكتبة والخصائص (Library Sidebar) */}
      {!previewMode && (
          <aside className={`w-80 border-${isRTL ? 'r' : 'l'} border-white/10 p-8 space-y-10 bg-black/40 overflow-y-auto custom-scrollbar`}>
            <div>
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <IconPhoto size={14}/> {t('archive_manage_groups')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    {BACKGROUNDS.map(bg => (
                        <button
                            key={bg.id}
                            onClick={() => setBackground(bg)}
                            className={`aspect-video rounded-xl overflow-hidden border-2 transition-all relative group ${background.id === bg.id ? 'border-indigo-500 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        >
                            <div className="absolute inset-0 bg-indigo-900/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[8px] font-black uppercase tracking-widest text-center px-2">{bg.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <IconCode size={14}/> Node_Generator
                </h4>
                <div className="space-y-3">
                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                        <IconCode size={16}/> Copy_React_JSX
                    </button>
                    <button className="w-full py-4 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                        Validate_Structure
                    </button>
                </div>
            </div>
          </aside>
      )}
    </div>
  );
}