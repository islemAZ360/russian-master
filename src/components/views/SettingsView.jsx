"use client";
import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext'; 
import { updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { 
  IconMoon, IconSun, IconDeviceDesktop, 
  IconLogout, IconCheck, IconCamera, IconUser, IconDeviceFloppy,
  IconLanguage, IconVocabulary, IconWorld
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

// قائمة الأفاتارات
const AVATARS = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
  '/avatars/avatar6.png',
];

// لغات النظام المتاحة
const SYSTEM_LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

// لغات البطاقات (مبدئياً)
const CARD_LANGUAGES = [
  { code: 'ar', label: 'Arabic', sub: 'العربية' },
  { code: 'en', label: 'English', sub: 'الإنجليزية' },
];

export default function SettingsView() {
  const { user, logout, userData } = useAuth();
  const { settings, updateSettings, isDark } = useSettings(); // استدعاء الإعدادات وحالة الثيم
  
  const [displayName, setDisplayName] = useState(user?.displayName || userData?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || userData?.photoURL || "/avatars/avatar1.png");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // --- دوال الحفظ والرفع (لم نغير فيها شيئاً) ---
  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
        await updateProfile(user, { displayName, photoURL });
        await updateDoc(doc(db, "users", user.uid), { displayName, photoURL });
        alert("تم تحديث الهوية بنجاح // IDENTITY UPDATED");
    } catch (error) {
        console.error(error);
        alert("فشل التحديث // UPDATE FAILED");
    } finally {
        setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setLoading(true);
    try {
        const storage = getStorage();
        const storageRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setPhotoURL(url);
    } catch (error) {
        console.error("Upload failed", error);
    } finally {
        setLoading(false);
    }
  };

  // --- مكونات مساعدة للتصميم ---
  
  // زر اختيار عادي (للثيم)
  const OptionButton = ({ isActive, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 w-full
        ${isActive 
            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
            : `border-transparent ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}`}
    >
        <Icon size={20} />
        <span className="text-sm font-bold">{label}</span>
        {isActive && <IconCheck size={16} className="ml-auto" />}
    </button>
  );

  // زر اختيار اللغة (كبير ومفصل)
  const LangButton = ({ isActive, onClick, title, sub, flag }) => (
    <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 w-full h-24
        ${isActive 
            ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
            : `border-transparent ${isDark ? 'bg-[#1a1a1a] hover:bg-[#252525]' : 'bg-white shadow-sm hover:bg-gray-50'} opacity-60 hover:opacity-100`}`}
    >
        <span className="text-2xl mb-1">{flag}</span>
        <span className={`text-sm font-bold ${isActive ? 'text-emerald-500' : isDark ? 'text-white' : 'text-gray-800'}`}>{title}</span>
        {sub && <span className="text-[10px] opacity-50">{sub}</span>}
        {isActive && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        )}
    </button>
  );

  // ألوان النصوص بناءً على الثيم
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subTextColor = isDark ? "text-white/40" : "text-gray-500";
  const sectionBg = isDark ? "bg-[#0a0a0a]/80 border-white/10" : "bg-white/80 border-black/5 shadow-xl";

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 font-sans pb-32">
      
      <div className="mb-10">
          <h2 className={`text-4xl font-black tracking-tighter ${textColor}`}>
              SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">CONFIG</span>
          </h2>
          <p className={`text-sm font-mono mt-2 ${subTextColor}`}>// USER_PREFERENCES_MODULE_V4.0</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* === العمود الأول: الهوية (Identity) === */}
          <section className={`rounded-3xl border p-6 md:p-8 backdrop-blur-xl ${sectionBg}`}>
              <div className="flex items-center gap-3 mb-6">
                  <IconUser className="text-cyan-500" size={24} />
                  <h3 className={`text-xl font-bold ${textColor}`}>OPERATIVE IDENTITY</h3>
              </div>

              <div className="flex flex-col items-center mb-8">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${isDark ? 'border-[#1a1a1a]' : 'border-gray-100'} shadow-2xl relative z-10`}>
                          <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      {/* حلقة مضيئة خلف الصورة */}
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconCamera className="text-white" size={32}/>
                      </div>
                      <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} accept="image/*" />
                  </div>
                  <p className={`text-xs mt-3 font-mono ${subTextColor}`}>CLICK TO UPLOAD NEW AVATAR</p>
              </div>

              <div className="space-y-6">
                  <div>
                      <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${subTextColor}`}>Codename (Display Name)</label>
                      <div className="relative">
                          <input 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            className={`w-full rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold ${isDark ? 'bg-black/50 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                            placeholder="ENTER CODENAME..."
                          />
                          <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                      </div>
                  </div>

                  <div>
                      <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ${subTextColor}`}>Select Avatar Protocol</label>
                      <div className="grid grid-cols-6 gap-2">
                          {AVATARS.map((avi, i) => (
                              <button 
                                key={i} 
                                onClick={() => setPhotoURL(avi)}
                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${photoURL === avi ? 'border-cyan-500 scale-110 shadow-lg shadow-cyan-500/20' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                              >
                                  <img src={avi} className="w-full h-full object-cover" />
                              </button>
                          ))}
                      </div>
                  </div>

                  <button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                      {loading ? "PROCESSING..." : <><IconDeviceFloppy size={20}/> SAVE IDENTITY</>}
                  </button>
              </div>
          </section>

          {/* === العمود الثاني: النظام واللغة (System & Language) === */}
          <div className="space-y-6">
              
              {/* 1. إعدادات اللغة (جديد) */}
              <section className={`rounded-3xl border p-6 md:p-8 backdrop-blur-xl ${sectionBg}`}>
                  <div className="flex items-center gap-3 mb-6">
                      <IconWorld className="text-emerald-500" size={24} />
                      <h3 className={`text-xl font-bold ${textColor}`}>LOCALIZATION</h3>
                  </div>

                  {/* لغة النظام */}
                  <div className="mb-6">
                      <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ${subTextColor}`}>System Language</label>
                      <div className="grid grid-cols-3 gap-3">
                          {SYSTEM_LANGUAGES.map((lang) => (
                              <LangButton 
                                  key={lang.code}
                                  title={lang.code.toUpperCase()}
                                  sub={lang.label}
                                  flag={lang.flag}
                                  isActive={settings.systemLanguage === lang.code}
                                  onClick={() => updateSettings('systemLanguage', lang.code)}
                              />
                          ))}
                      </div>
                  </div>

                  {/* لغة البطاقات */}
                  <div>
                      <div className="flex justify-between items-center mb-3">
                          <label className={`text-xs font-bold uppercase tracking-wider block ${subTextColor}`}>Target Language</label>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-mono">EXPERIMENTAL</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          {CARD_LANGUAGES.map((lang) => (
                              <OptionButton 
                                  key={lang.code}
                                  icon={IconVocabulary}
                                  label={lang.label}
                                  isActive={settings.cardLanguage === lang.code}
                                  onClick={() => updateSettings('cardLanguage', lang.code)}
                              />
                          ))}
                      </div>
                  </div>
              </section>

              {/* 2. إعدادات المظهر */}
              <section className={`rounded-3xl border p-6 md:p-8 backdrop-blur-xl ${sectionBg}`}>
                  <div className="flex items-center gap-3 mb-6">
                      <IconDeviceDesktop className="text-purple-500" size={24} />
                      <h3 className={`text-xl font-bold ${textColor}`}>INTERFACE THEME</h3>
                  </div>
                  <div className="space-y-3">
                      <OptionButton 
                          icon={IconMoon} 
                          label="Cyber Dark" 
                          isActive={settings.theme === 'dark'} 
                          onClick={() => updateSettings('theme', 'dark')} 
                      />
                      <OptionButton 
                          icon={IconSun} 
                          label="Pro Light" 
                          isActive={settings.theme === 'light'} 
                          onClick={() => updateSettings('theme', 'light')} 
                      />
                      <OptionButton 
                          icon={IconDeviceDesktop} 
                          label="Auto Sync" 
                          isActive={settings.theme === 'system'} 
                          onClick={() => updateSettings('theme', 'system')} 
                      />
                  </div>
              </section>

              {/* زر الخروج */}
              <button 
                onClick={logout} 
                className={`w-full py-4 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider group
                ${isDark 
                    ? 'border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white' 
                    : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'}`}
              >
                  <IconLogout size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                  TERMINATE SESSION
              </button>

          </div>
      </div>
    </div>
  );
}