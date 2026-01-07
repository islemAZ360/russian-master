"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext'; 
import { useLanguage } from '@/hooks/useLanguage';
import { updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, deleteField, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { 
  IconMoon, IconSun, IconDeviceDesktop, 
  IconLogout, IconCheck, IconCamera, IconUser, IconDeviceFloppy,
  IconWorld, IconPalette, IconSettings, IconSchool, IconMessage,
  IconUnlink, IconShieldCheck, IconAlertTriangle
} from '@tabler/icons-react';

// قائمة الأفاتارات الافتراضية
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

export default function SettingsView() {
  const { user, logout, userData, isTeacher, isStudent } = useAuth();
  const { settings, updateSettings, isDark } = useSettings();
  const { t, dir, lang } = useLanguage(); 
  
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  // حقول خاصة للأستاذ
  const [subject, setSubject] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  // حقول خاصة للطالب
  const [teacherName, setTeacherName] = useState("");

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // تحديث البيانات المحلية
  useEffect(() => {
    if (user || userData) {
      setDisplayName(userData?.displayName || user?.displayName || "");
      setPhotoURL(userData?.photoURL || user?.photoURL || "/avatars/avatar1.png");
      
      if (isTeacher) {
          setSubject(userData?.subject || "");
          setContactInfo(userData?.contactInfo || "");
      }

      // جلب اسم الأستاذ إذا كان المستخدم طالباً
      if (isStudent && userData?.teacherId) {
          const fetchTeacher = async () => {
              try {
                  const teacherSnap = await getDoc(doc(db, "users", userData.teacherId));
                  if (teacherSnap.exists()) {
                      setTeacherName(teacherSnap.data().displayName);
                  }
              } catch (e) { console.error("Error fetching teacher:", e); }
          };
          fetchTeacher();
      }
    }
  }, [user, userData, isTeacher, isStudent]);

  // --- 1. حفظ الملف الشخصي ---
  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
        await updateProfile(user, { displayName, photoURL });
        
        const updateData = { 
            displayName, 
            photoURL,
            updatedAt: new Date().toISOString()
        };

        if (isTeacher) {
            updateData.subject = subject;
            updateData.contactInfo = contactInfo;
        }

        await updateDoc(doc(db, "users", user.uid), updateData);
        alert(t('alert_saved'));
    } catch (error) {
        console.error(error);
        alert(t('alert_error'));
    } finally {
        setLoading(false);
    }
  };

  // --- 2. رفع صورة ---
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
        alert("Upload Failed");
    } finally { 
        setLoading(false); 
    }
  };

  // --- 3. مغادرة الفصل (للطلاب) ---
  const handleLeaveClass = async () => {
      if (!confirm("WARNING: Are you sure you want to leave your current squad? You will lose access to teacher's content.")) return;
      
      setLoading(true);
      try {
          const oldTeacherId = userData.teacherId;

          // تحديث مستند المستخدم (حذف التبعية)
          await updateDoc(doc(db, "users", user.uid), {
              role: 'user', // العودة لرتبة مستخدم عادي
              teacherId: deleteField()
          });

          // إشعار الأستاذ
          if (oldTeacherId) {
              await addDoc(collection(db, "notifications"), {
                  userId: oldTeacherId,
                  target: 'teacher',
                  type: "info",
                  title: "OPERATIVE DEPARTURE",
                  message: `${user.displayName || "Student"} has left your squad.`,
                  createdAt: serverTimestamp(),
                  read: false
              });
          }

          alert("You have left the squad.");
          window.location.reload();

      } catch (error) {
          console.error(error);
          alert("Operation Failed.");
      } finally {
          setLoading(false);
      }
  };

  const OptionButton = ({ isActive, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 w-full
        ${isActive 
            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
            : `border-white/5 ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-black/5 hover:bg-black/10 text-gray-600'}`}`}
    >
        {Icon && <Icon size={20} />}
        <span className="text-sm font-black uppercase tracking-widest">{label}</span>
        {isActive && <IconCheck size={18} className="ml-auto animate-in zoom-in" />}
    </button>
  );

  const LangCard = ({ isActive, onClick, title, sub, flag }) => (
    <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 w-full
        ${isActive 
            ? 'border-emerald-500 bg-emerald-500/10 shadow-xl' 
            : 'border-white/5 bg-white/5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
    >
        <span className="text-3xl mb-2">{flag}</span>
        <span className={`text-sm font-black ${isActive ? 'text-emerald-500' : 'text-white'}`}>{title}</span>
        <span className="text-[9px] font-mono opacity-50 mt-1 uppercase">{sub}</span>
        {isActive && <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1"><IconCheck size={12} className="text-black"/></div>}
    </button>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-10 font-sans pb-40 animate-in fade-in duration-700" dir={dir}>
      
      {/* Header */}
      <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
              <IconSettings className="text-cyan-500" size={32} />
              <h2 className={`text-4xl md:text-6xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {t('settings_title')}
              </h2>
          </div>
          <p className="text-[10px] font-black font-mono tracking-[0.3em] opacity-40 uppercase">
              // {t('settings_subtitle')}
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* === Column 1: Identity & Role === */}
          <section className={`rounded-[2.5rem] border p-8 backdrop-blur-2xl ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.02] border-black/10'}`}>
              <div className="flex items-center gap-3 mb-10">
                  <IconUser className="text-cyan-500" size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tighter">{t('identity_title')}</h3>
              </div>

              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-10">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-500/20 shadow-2xl relative z-10 transition-transform group-hover:scale-105">
                          <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconCamera className="text-white" size={32}/>
                      </div>
                      <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} accept="image/*" />
                  </div>
              </div>

              <div className="space-y-8">
                  {/* Name Input */}
                  <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 block opacity-40">{t('identity_name_label')}</label>
                      <input 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={`w-full rounded-2xl py-4 px-6 outline-none border transition-all font-bold text-lg ${isDark ? 'bg-black/40 border-white/10 text-white focus:border-cyan-500' : 'bg-white border-black/10 text-black focus:border-cyan-600'}`}
                        placeholder={t('identity_name_placeholder')}
                      />
                  </div>

                  {/* --- Teacher Fields --- */}
                  {isTeacher && (
                      <div className="space-y-6 p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-3xl animate-in slide-in-from-top-2">
                          <div className="flex items-center gap-2 mb-2 text-cyan-500">
                              <IconSchool size={18}/>
                              <span className="text-xs font-black uppercase tracking-widest">Teacher Profile</span>
                          </div>
                          <div>
                              <label className="text-[9px] font-black uppercase tracking-widest mb-2 block opacity-60">Subject / Course</label>
                              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-cyan-500 transition-all" placeholder="e.g. Russian Language Level 1" />
                          </div>
                          <div>
                              <label className="text-[9px] font-black uppercase tracking-widest mb-2 block opacity-60">Contact Info</label>
                              <textarea value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-cyan-500 transition-all h-24 resize-none" placeholder="Contact details..." />
                          </div>
                      </div>
                  )}

                  {/* --- Student Fields (Leaving Squad) --- */}
                  {isStudent && (
                      <div className="space-y-6 p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl animate-in slide-in-from-top-2">
                          <div className="flex justify-between items-start">
                              <div>
                                  <div className="flex items-center gap-2 mb-1 text-purple-400">
                                      <IconShieldCheck size={18}/>
                                      <span className="text-xs font-black uppercase tracking-widest">Active Squad</span>
                                  </div>
                                  <p className="text-[10px] text-white/40 font-mono">Commander: <span className="text-white font-bold">{teacherName || "Loading..."}</span></p>
                              </div>
                              <button 
                                onClick={handleLeaveClass}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                              >
                                  <IconUnlink size={14}/> Leave
                              </button>
                          </div>
                      </div>
                  )}

                  {/* Avatar Preset Grid */}
                  <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 block opacity-40">{t('identity_avatar_label')}</label>
                      <div className="grid grid-cols-6 gap-3">
                          {AVATARS.map((avi, i) => (
                              <button 
                                key={i} 
                                onClick={() => setPhotoURL(avi)}
                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-90 ${photoURL === avi ? 'border-cyan-500 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                              >
                                  <img src={avi} className="w-full h-full object-cover" />
                              </button>
                          ))}
                      </div>
                  </div>

                  <button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-sm"
                  >
                      {loading ? t('identity_saving') : <><IconDeviceFloppy size={22}/> {t('identity_save_btn')}</>}
                  </button>
              </div>
          </section>

          {/* === Column 2: System Settings === */}
          <div className="space-y-8">
              
              {/* Language */}
              <section className={`rounded-[2.5rem] border p-8 backdrop-blur-2xl ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.02] border-black/10'}`}>
                  <div className="flex items-center gap-3 mb-8">
                      <IconWorld className="text-emerald-500" size={24} />
                      <h3 className="text-xl font-black uppercase tracking-tighter">{t('system_lang_title')}</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                      {SYSTEM_LANGUAGES.map((langItem) => (
                          <LangCard 
                              key={langItem.code}
                              title={langItem.code.toUpperCase()}
                              sub={langItem.label}
                              flag={langItem.flag}
                              isActive={settings.systemLanguage === langItem.code}
                              onClick={() => updateSettings('systemLanguage', langItem.code)}
                          />
                      ))}
                  </div>
              </section>

              {/* Theme */}
              <section className={`rounded-[2.5rem] border p-8 backdrop-blur-2xl ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.02] border-black/10'}`}>
                  <div className="flex items-center gap-3 mb-8">
                      <IconPalette className="text-purple-500" size={24} />
                      <h3 className="text-xl font-black uppercase tracking-tighter">{t('theme_title')}</h3>
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

              {/* Logout */}
              <button 
                onClick={logout} 
                className="w-full py-5 bg-red-900/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs group"
              >
                  <IconLogout size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                  {t('logout_btn')}
              </button>

          </div>
      </div>
    </div>
  );
}