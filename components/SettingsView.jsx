"use client";
import React, { useState } from 'react';
import { 
  IconVolume, IconVolumeOff, IconEye, IconUser, IconDatabase, 
  IconShield, IconLogout, IconDownload, IconTrash, IconCpu, IconLanguage 
} from '@tabler/icons-react';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsView({ user, onLogout, resetProgress }) {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'عام', icon: IconCpu },
    { id: 'display', label: 'العرض', icon: IconEye },
    { id: 'account', label: 'الحساب', icon: IconUser },
    { id: 'data', label: 'البيانات', icon: IconDatabase },
  ];

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user: user.email, progress: "exported_data_here" }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "nexus_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans text-white overflow-hidden relative">
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
        
        <h2 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight">
          NEXUS CONFIGURATION
        </h2>

        <div className="flex flex-col md:flex-row gap-6 h-full">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id 
                  ? 'bg-gradient-to-r from-purple-900/50 to-transparent border-r-2 border-purple-500 text-white' 
                  : 'hover:bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                <tab.icon size={20} />
                <span className="font-bold text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 glass-panel rounded-3xl p-6 overflow-y-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {activeTab === 'general' && (
                  <>
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2"><IconVolume/> الصوت واللغة</h3>
                    <ToggleCard 
                      title="المؤثرات الصوتية" 
                      desc="أصوات النظام والتفاعلات"
                      checked={settings.soundEffects} 
                      onChange={(v) => updateSettings('soundEffects', v)} 
                    />
                    <ToggleCard 
                      title="المساعد الصوتي" 
                      desc="نطق الكلمات الروسية تلقائياً"
                      checked={settings.speech} 
                      onChange={(v) => updateSettings('speech', v)} 
                    />
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex justify-between items-center">
                        <div>
                            <div className="font-bold">مستوى الصعوبة</div>
                            <div className="text-xs text-white/40">يحدد سرعة ظهور البطاقات</div>
                        </div>
                        <select 
                            value={settings.difficulty}
                            onChange={(e) => updateSettings('difficulty', e.target.value)}
                            className="bg-black border border-white/20 rounded px-3 py-1 outline-none focus:border-cyan-500"
                        >
                            <option value="easy">Easy (مبتدئ)</option>
                            <option value="normal">Normal (متوسط)</option>
                            <option value="hard">Hard (متقدم)</option>
                        </select>
                    </div>
                  </>
                )}

                {activeTab === 'display' && (
                  <>
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2"><IconEye/> المظهر</h3>
                    <ToggleCard 
                      title="وضع الأداء العالي" 
                      desc="تقليل الجرافيك للأجهزة الضعيفة"
                      checked={!settings.visualEffects} 
                      onChange={(v) => updateSettings('visualEffects', !v)} 
                    />
                    <ToggleCard 
                      title="الخلفية المتحركة" 
                      desc="تفعيل تأثير المطر الرقمي"
                      checked={settings.particles ?? true} 
                      onChange={(v) => updateSettings('particles', v)} 
                    />
                  </>
                )}

                {activeTab === 'account' && (
                  <>
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2"><IconShield/> الأمان والحساب</h3>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-4">
                        <div className="text-sm text-white/50 mb-1">البريد الإلكتروني</div>
                        <div className="font-mono text-lg">{user?.email}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-4">
                        <div className="text-sm text-white/50 mb-1">معرف المستخدم (UID)</div>
                        <div className="font-mono text-xs text-white/70">{user?.uid}</div>
                    </div>
                    <button onClick={onLogout} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <IconLogout size={20} /> تسجيل الخروج
                    </button>
                  </>
                )}

                {activeTab === 'data' && (
                  <>
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2"><IconDatabase/> إدارة البيانات</h3>
                    <button onClick={exportData} className="w-full py-4 mb-3 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 rounded-xl flex items-center justify-between px-6 transition-all group">
                        <div className="text-left">
                            <div className="font-bold group-hover:text-white transition-colors">تصدير النسخة الاحتياطية</div>
                            <div className="text-xs text-white/40">احفظ تقدمك في ملف JSON</div>
                        </div>
                        <IconDownload />
                    </button>
                    
                    <button onClick={resetProgress} className="w-full py-4 bg-red-900/10 hover:bg-red-900/30 text-red-400 border border-red-500/30 rounded-xl flex items-center justify-between px-6 transition-all group">
                        <div className="text-left">
                            <div className="font-bold group-hover:text-red-200 transition-colors">تصفير التقدم</div>
                            <div className="text-xs text-red-400/50">تحذير: لا يمكن التراجع عن هذا</div>
                        </div>
                        <IconTrash />
                    </button>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

const ToggleCard = ({ title, desc, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all">
        <div>
            <div className="font-bold text-white">{title}</div>
            <div className="text-xs text-white/40">{desc}</div>
        </div>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${checked ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-gray-800'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);