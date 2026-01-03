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
  IconLogout, IconCheck, IconCamera, IconUser, IconDeviceFloppy
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

// قائمة الأفاتارات الجاهزة
const AVATARS = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
  '/avatars/avatar6.png',
];

export default function SettingsView() {
  const { user, logout, userData } = useAuth();
  const { settings, updateSettings } = useSettings();
  
  const [displayName, setDisplayName] = useState(user?.displayName || userData?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || userData?.photoURL || "/avatars/avatar1.png");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // دالة الحفظ
  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
        // تحديث Auth
        await updateProfile(user, { displayName, photoURL });
        // تحديث Firestore
        await updateDoc(doc(db, "users", user.uid), { displayName, photoURL });
        alert("تم تحديث الملف الشخصي بنجاح!");
    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء الحفظ");
    } finally {
        setLoading(false);
    }
  };

  // رفع صورة خاصة
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

  const ThemeButton = ({ value, icon: Icon, label }) => {
    const isActive = settings.theme === value;
    return (
        <button
            onClick={() => updateSettings('theme', value)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group w-full
            ${isActive 
                ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? "text-indigo-400" : "text-gray-500"} />
                <span className="text-sm font-bold">{label}</span>
            </div>
            {isActive && <IconCheck size={18} className="text-indigo-400" />}
        </button>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 pb-40 font-sans bg-transparent">
      
      <div className="mb-10 text-center">
          <h2 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-lg mb-2">
              IDENTITY CONFIG
          </h2>
      </div>

      <div className="space-y-8">
          
          {/* 1. قسم الملف الشخصي (تمت إعادته) */}
          <section className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
              {/* الصورة */}
              <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/30 shadow-lg">
                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                  >
                      <IconCamera className="text-white" />
                  </button>
                  <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} accept="image/*" />
              </div>

              {/* البيانات */}
              <div className="flex-1 w-full space-y-4">
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Display Name</label>
                      <div className="relative">
                          <input 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 outline-none transition-colors"
                            placeholder="Enter your codename..."
                          />
                          <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                      </div>
                  </div>

                  {/* شبكة الأفاتار */}
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-2">Select Avatar</label>
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                          {AVATARS.map((avi, i) => (
                              <button 
                                key={i} 
                                onClick={() => setPhotoURL(avi)}
                                className={`w-10 h-10 rounded-full border-2 overflow-hidden shrink-0 transition-all ${photoURL === avi ? 'border-indigo-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                              >
                                  <img src={avi} className="w-full h-full object-cover" />
                              </button>
                          ))}
                      </div>
                  </div>

                  <button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                      {loading ? "Saving..." : <><IconDeviceFloppy size={16}/> Save Changes</>}
                  </button>
              </div>
          </section>

          {/* 2. قسم المظهر (بدون خلفية مظللة كما طلبت) */}
          <section>
              <div className="flex items-center gap-2 mb-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                  <IconDeviceDesktop size={16} /> Interface
              </div>
              <div className="flex flex-col gap-3">
                  <ThemeButton value="dark" icon={IconMoon} label="Cyber Dark" />
                  <ThemeButton value="light" icon={IconSun} label="Pro Light" />
                  <ThemeButton value="system" icon={IconDeviceDesktop} label="Auto Sync" />
              </div>
          </section>

          {/* 3. زر الخروج */}
          <section className="pt-4">
              <button 
                onClick={logout} 
                className="w-full py-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider group"
              >
                  <IconLogout size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                  Terminate Session
              </button>
          </section>

      </div>
    </div>
  );
}