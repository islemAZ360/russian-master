"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconVolume, 
  IconLogout, 
  IconTrash, 
  IconUser, 
  IconShield, 
  IconSettings, // تأكدنا من استيراد الأيقونة هنا
  IconCheck
} from '@tabler/icons-react';
import { useStudySystem } from '../hooks/useStudySystem';
import { auth } from '../lib/firebase';

// قائمة الصور الرمزية المتاحة
const AVATARS = ["👤", "🤖", "👽", "👾", "💀", "🐱", "🦉", "⚡", "🔥", "💎", "🐉", "🚀"];

export default function SettingsView({ onLogout, resetProgress }) {
  // استخدام الهوك للوصول لبيانات المستخدم وتحديثها
  // نمرر auth.currentUser لتجنب الأخطاء إذا لم يتم تمرير user كـ prop
  const { setAvatar, stats } = useStudySystem(auth.currentUser);
  
  // حالة محلية للصوت (للعرض فقط إذا لم يكن هناك هوك إعدادات عام)
  const [soundEnabled, setSoundEnabled] = useState(true); 

  const handleSoundToggle = () => {
      setSoundEnabled(!soundEnabled);
      // هنا يمكنك إضافة منطق حفظ الإعداد في LocalStorage مستقبلاً
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans text-white pb-32 overflow-y-auto custom-scrollbar">
      
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        {/* --- HEADER --- */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-white/10 pb-6"
        >
            <h2 className="text-4xl font-black tracking-widest flex items-center gap-3 text-white">
                <IconSettings size={40} className="text-cyan-500 animate-[spin_10s_linear_infinite]"/>
                SYSTEM CONFIG
            </h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-2 ml-14">
                Neural Interface Customization
            </p>
        </motion.div>

        {/* --- AVATAR SELECTION --- */}
        <section className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-400">
                <IconUser/> OPERATIVE IDENTITY
            </h3>
            
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {AVATARS.map((avi, index) => {
                    const isSelected = stats?.avatar === avi;
                    return (
                        <motion.button 
                            key={index} 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAvatar(avi)}
                            className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all relative ${
                                isSelected 
                                ? 'bg-cyan-600/20 border-2 border-cyan-500 shadow-[0_0_15px_#06b6d4]' 
                                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30'
                            }`}
                        >
                            {avi}
                            {isSelected && (
                                <div className="absolute -top-2 -right-2 bg-cyan-500 rounded-full p-0.5 text-black">
                                    <IconCheck size={12} stroke={4} />
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </section>

        {/* --- SYSTEM CONTROLS --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Audio Settings */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-purple-400">
                        <IconVolume/> AUDIO FEED
                    </h3>
                    <p className="text-white/40 text-xs">Enable synthetic voice & interface sounds.</p>
                </div>
                <div className="mt-6 flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                    <span className={`text-sm font-mono font-bold ${soundEnabled ? "text-emerald-500" : "text-gray-500"}`}>
                        {soundEnabled ? "ONLINE" : "MUTED"}
                    </span>
                    <button 
                        onClick={handleSoundToggle}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                            soundEnabled ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-gray-700'
                        }`}
                    >
                        <motion.div 
                            layout
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            initial={false}
                            animate={{ left: soundEnabled ? "1.75rem" : "0.25rem" }}
                        />
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-950/10 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                    <IconTrash size={100} />
                </div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-red-500">
                    <IconShield/> DANGER ZONE
                </h3>
                <p className="text-red-400/50 text-xs mb-6">
                    Actions here are irreversible. Tread carefully.
                </p>
                
                <button 
                    onClick={resetProgress}
                    className="w-full py-3 bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all group"
                >
                    <IconTrash size={16} className="group-hover:rotate-12 transition-transform"/> WIPE ALL DATA
                </button>
            </div>
        </section>

        {/* --- LOGOUT --- */}
        <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="w-full py-5 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 rounded-2xl font-black tracking-widest flex items-center justify-center gap-3 transition-all group mt-4"
        >
            <IconLogout className="group-hover:-translate-x-1 text-cyan-500 transition-transform"/> 
            DISCONNECT FROM NEURAL NET
        </motion.button>

        <div className="text-center text-white/10 text-[10px] font-mono pt-4">
            RUSSIAN_MASTER_OS // V.10.2.4 // SECURE
        </div>

      </div>
    </div>
  );
}