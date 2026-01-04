"use client";
import React, { useState, useCallback } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconMail, IconLock, IconLoader, IconBrandGoogle, 
  IconUser, IconArrowRight, IconShieldCheck, IconAlertTriangle 
} from "@tabler/icons-react";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * شاشة المصادقة (AuthScreen)
 * تم تطويرها لتشمل خطوة إجبارية لاختيار الاسم الرمزي للمستخدمين الجدد
 */
export const AuthScreen = ({ onLoginSuccess }) => {
  const { t, dir } = useLanguage();
  
  // --- حالات التحكم في الواجهة ---
  const [step, setStep] = useState(1); // 1: الدخول الأساسي، 2: اختيار الاسم الرمزي
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- بيانات المدخلات ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  // حفظ بيانات المستخدم المؤقتة عند التسجيل الجديد لإكمال الخطوة الثانية
  const [tempUser, setTempUser] = useState(null);

  /**
   * إنشاء الملف الشخصي النهائي في Firestore
   */
  const finalizeProfile = async (userObj, chosenName) => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", userObj.uid);
      const initialRole = userObj.email?.toLowerCase() === 'islamaz@bomba.com' ? 'master' : 'user';
      
      const profileData = {
        email: userObj.email,
        displayName: chosenName,
        role: initialRole,
        xp: 0,
        streak: 0,
        isBanned: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        photoURL: userObj.photoURL || "/avatars/avatar1.png"
      };

      await setDoc(userRef, profileData);
      onLoginSuccess(userObj);
    } catch (err) {
      setError("Critical: Failed to establish neural identity.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * معالجة الدخول أو البدء في التسجيل بالبريد
   */
  const handleEmailAuth = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (isSignUp) {
      // إذا كان تسجيل جديد، نطلب منه أولاً الإيميل والباسورد ثم ننتقل لخطوة الاسم
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // تحديث وقت الدخول فقط للمستخدمين الحاليين
      await setDoc(doc(db, "users", res.user.uid), { lastLogin: serverTimestamp() }, { merge: true });
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message.replace("Firebase:", "").trim());
    } finally {
      setLoading(false);
    }
  };

  /**
   * معالجة الدخول عبر جوجل مع فحص "المستخدم الجديد"
   */
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, "users", res.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // مستخدم جوجل جديد -> إيقافه وطلب اسم رمزي
        setTempUser(res.user);
        setUsername(res.user.displayName || ""); // اقتراح اسمه من جوجل
        setStep(2);
        setIsSignUp(true);
      } else {
        // مستخدم مسجل مسبقاً -> دخول فوري
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * تنفيذ عملية التسجيل النهائية (الخطوة 2)
   */
  const executeSignUp = async () => {
    if (!username.trim()) {
        setError(t('auth_error_name'));
        return;
    }
    setLoading(true);
    try {
      if (tempUser) {
        // حالة مستخدم جوجل الجديد
        await finalizeProfile(tempUser, username);
      } else {
        // حالة مستخدم البريد الإلكتروني الجديد
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: username });
        await finalizeProfile(res.user, username);
      }
    } catch (err) {
      setError(err.message);
      setStep(1); // العودة للخلف في حال الفشل
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#030014] relative overflow-hidden font-sans" dir={dir}>
       
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-md p-10 bg-white/[0.03] border border-white/10 rounded-[3rem] backdrop-blur-2xl shadow-2xl relative z-10 mx-4"
       >
          {/* رأس الشاشة */}
          <div className="text-center mb-10">
            <motion.div 
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20"
            >
                <IconShieldCheck size={44} className="text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter tracking-tight">
                {t('auth_welcome')}
            </h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                {step === 1 ? t('auth_step_creds') : t('auth_step_name')}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
                /* المرحلة 1: بيانات الدخول */
                <motion.div 
                    key="step-creds"
                    initial={{ x: -20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    exit={{ x: 20, opacity: 0 }}
                >
                    <div className="space-y-6">
                        <button 
                            onClick={handleGoogleAuth} 
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            <IconBrandGoogle size={22} /> GOOGLE_UPLINK
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-white/20 text-[10px] font-black tracking-widest uppercase">Protocol_Identifier</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-purple-400 uppercase ml-2 tracking-widest">{t('auth_email_label')}</label>
                                <div className="relative group">
                                    <IconMail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-500 transition-colors"/>
                                    <input 
                                        type="email" required value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all font-bold" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-cyan-400 uppercase ml-2 tracking-widest">{t('auth_pass_label')}</label>
                                <div className="relative group">
                                    <IconLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-500 transition-colors"/>
                                    <input 
                                        type="password" required value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all font-bold" 
                                    />
                                </div>
                            </div>
                            
                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-shake">
                                    <IconAlertTriangle size={18} className="shrink-0" />
                                    {error}
                                </div>
                            )}
                            
                            <button 
                                disabled={loading} 
                                className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center shadow-2xl active:scale-[0.98]"
                            >
                                {loading ? <IconLoader className="animate-spin" /> : (isSignUp ? t('auth_btn_next') : "INITIALIZE_SESSION")}
                            </button>
                        </form>
                    </div>
                </motion.div>
            ) : (
                /* المرحلة 2: الاسم الرمزي الإجباري */
                <motion.div 
                    key="step-name"
                    initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    exit={{ x: -20, opacity: 0 }}
                >
                    <div className="space-y-6">
                        <div className="p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl text-cyan-400 text-xs leading-relaxed flex items-start gap-4">
                            <IconUser size={24} className="shrink-0 text-cyan-500"/>
                            <div>
                                <span className="font-black block mb-1 uppercase tracking-tighter">{t('auth_step_name')}</span>
                                Establish your permanent combat codename for the neural network. This cannot be changed easily.
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-cyan-400 uppercase ml-2 tracking-widest">{t('auth_name_label')}</label>
                            <input 
                                autoFocus
                                required
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className="w-full bg-black/40 border border-cyan-500/50 rounded-2xl py-5 px-6 text-white focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] outline-none transition-all text-xl font-black text-center tracking-tight"
                                placeholder={t('auth_name_placeholder')}
                                onKeyDown={(e) => e.key === 'Enter' && executeSignUp()}
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-bold">
                                {error}
                            </div>
                        )}

                        <button 
                            disabled={loading || !username.trim()} 
                            onClick={executeSignUp}
                            className="w-full py-5 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-cyan-900/40 active:scale-[0.98]"
                        >
                            {loading ? <IconLoader className="animate-spin" /> : <>{t('auth_btn_finish')} <IconArrowRight size={22}/></>}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => { setStep(1); setTempUser(null); }} 
                            className="w-full text-white/20 text-[10px] uppercase font-black tracking-[0.3em] hover:text-white transition-colors"
                        >
                            &lt;&lt; BACK_TO_PROTOCOL
                        </button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setStep(1); setError(null); }} 
                className="text-white/30 text-xs hover:text-white transition-colors font-mono uppercase tracking-widest decoration-white/20 underline-offset-8"
              >
                  {isSignUp ? "ALREADY_REGISTERED? SIGN_IN" : "NEW_OPERATIVE? REQUEST_ACCESS"}
              </button>
          </div>
       </motion.div>

       <div className="absolute bottom-10 text-white/5 font-black tracking-[1.5em] text-xs uppercase pointer-events-none select-none">
           Neural Interface System v4.0.2
       </div>
    </div>
  );
};