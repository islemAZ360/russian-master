"use client";
import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext'; 
import { useLanguage } from '@/hooks/useLanguage';
import { updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { 
  IconMoon, IconSun, IconDeviceDesktop, 
  IconLogout, IconCheck, IconCamera, IconUser, IconDeviceFloppy,
  IconWorld, IconVocabulary
} from '@tabler/icons-react';

// قائمة الأفاتارات الجاهزة
const AVATARS = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
  '/avatars/avatar6.png',
];

// لغات النظام
const SYSTEM_LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

// لغات البطاقات (مستقبلاً)
const CARD_LANGUAGES = [
  { code: 'ar', label: 'Arabic', sub: 'العربية' },
  { code: 'en', label: 'English', sub: 'الإنجليزية' },
];

export default function SettingsView() {
  // استدعاء الهوكس (Contexts)
  const { user, logout, userData } = useAuth();
  const { settings, updateSettings, isDark } = useSettings();
  const { t, dir } = useLanguage(); 
  
  // الحالة المحلية (Local State)
  const [displayName, setDisplayName] = useState(user?.displayName || userData?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || userData?.photoURL || "/avatars/avatar1.png");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // --- دالة حفظ الملف الشخصي ---
  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
        // تحديث في Authentication
        await updateProfile(user, { displayName, photoURL });
        // تحديث في قاعدة البيانات Firestore
        await updateDoc(doc(db, "users", user.uid), { displayName, photoURL });
        alert(t('alert_saved'));
    } catch (error) {
        console.error(error);
        alert(t('alert_error'));
    } finally {
        setLoading(false);
    }
  };

  // --- دالة رفع الصورة الخاصة ---
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
        alert("فشل رفع الصورة");
    } finally { 
        setLoading(false); 
    }
  };

  // --- مكون فرعي: زر الخيارات (للثيم ولغة البطاقات) ---
  const OptionButton = ({ isActive, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 w-full
        ${isActive 
            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
            : `border-transparent ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}`}
    >
        {Icon && <Icon size={20} />}
        <span className="text-sm font-bold">{label}</span>
        {isActive && <IconCheck size={16} className="ml-auto" />}
    </button>
  );

  // --- مكون فرعي: زر اللغة الكبير ---
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
    </button>
  );

  // متغيرات الألوان حسب الثيم
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subTextColor = isDark ? "text-white/40" : "text-gray-500";
  const sectionBg = isDark ? "bg-[#0a0a0a]/80 border-white/10" : "bg-white/80 border-black/5 shadow-xl";

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 font-sans pb-32" dir={dir}>
      
      {/* العنوان الرئيسي */}
      <div className="mb-10">
          <h2 className={`text-4xl font-black tracking-tighter ${textColor}`}>
              {t('settings_title')}
          </h2>
          <p className={`text-sm font-mono mt-2 ${subTextColor}`}>// {t('settings_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* === القسم الأول: الهوية (Identity) === */}
          <section className={`rounded-3xl border p-6 md:p-8 backdrop-blur-xl ${sectionBg}`}>
              <div className="flex items-center gap-3 mb-6">
                  <IconUser className="text-cyan-500" size={24} />
                  <h3 className={`text-xl font-bold ${textColor}`}>{t('identity_title')}</h3>
              </div>

              {/* صورة البروفايل */}
              <div className="flex flex-col items-center mb-8">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${isDark ? 'border-[#1a1a1a]' : 'border-gray-100'} shadow-2xl relative z-10`}>
                          <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      {/* تأثيرات بصرية */}
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconCamera className="text-white" size={32}/>
                      </div>
                      <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} accept="image/*" />
                  </div>
                  <p className={`text-xs mt-3 font-mono ${subTextColor}`}>{t('identity_upload')}</p>
              </div>

              <div className="space-y-6">
                  {/* حقل الاسم */}
                  <div>
                      <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${subTextColor}`}>{t('identity_name_label')}</label>
                      <div className="relative">
                          <input 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            className={`w-full rounded-xl py-3 px-10 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold ${isDark ? 'bg-black/50 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                            placeholder={t('identity_name_placeholder')}
                          />
                          <IconUser className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} size={18}/>
                      </div>
                  </div>

                  {/* اختيار الأفاتار */}
                  <div>
                      <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ${subTextColor}`}>{t('identity_avatar_label')}</label>
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

                  {/* زر الحفظ */}
                  <button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                      {loading ? t('identity_saving') : <><IconDeviceFloppy size={20}/> {t('identity_save_btn')}</>}
                  </button>
              </div>
          </section>

          {/* === القسم الثاني: النظام (System) === */}
          <div className="space-y-6">
              
              {/* إعدادات اللغة (Localization) */}
              <section className={`rounded-3xl border p-6 md:p-8 backdrop-blur-xl ${sectionBg}`}>
                  <div className="flex items-center gap-3 mb-6">
                      <IconWorld className="text-emerald-500" size={24} />
                      <h3 className={`text-xl font-bold ${textColor}`}>{t('system_lang_title')}</h3>
                  </div>

                  {/* لغة النظام */}
                  <div className="mb-6">
                      <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ${subTextColor}`}>{t('lang_system_label')}</label>
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

                  {/* لغة البطاقات (تجريبي) */}
                  <div>
                      <div className="flex justify-between items-center mb-3">
                          <label className={`text-xs font-bold uppercase tracking-wider block ${subTextColor}`}>{t('lang_target_label')}</label>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-mono">SOON</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 opacity-70">
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

              {/* إعدادات المظهر (Theme) */}
              <section className={`rounded-3xl border p-6 md:p-8 backdrop-blur-xl ${sectionBg}`}>
                  <div className="flex items-center gap-3 mb-6">
                      <IconDeviceDesktop className="text-purple-500" size={24} />
                      <h3 className={`text-xl font-bold ${textColor}`}>{t('theme_title')}</h3>
                  </div>
                  <div className="space-y-3">
                      <OptionButton 
                          icon={IconMoon} 
                          label={t('theme_dark')} 
                          isActive={settings.theme === 'dark'} 
                          onClick={() => updateSettings('theme', 'dark')} 
                      />
                      <OptionButton 
                          icon={IconSun} 
                          label={t('theme_light')} 
                          isActive={settings.theme === 'light'} 
                          onClick={() => updateSettings('theme', 'light')} 
                      />
                      <OptionButton 
                          icon={IconDeviceDesktop} 
                          label={t('theme_auto')} 
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
                  {t('logout_btn')}
              </button>

          </div>
      </div>
    </div>
  );
}