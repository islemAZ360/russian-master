"use client";
import React, { useState } from "react";
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
  IconUser, IconArrowRight, IconShieldCheck, IconAlertTriangle, IconTerminal2 
} from "@tabler/icons-react";
import { useLanguage } from "@/hooks/useLanguage";

export const AuthScreen = ({ onLoginSuccess }) => {
  const { t, dir } = useLanguage();
  
  // --- حالات التحكم ---
  const [step, setStep] = useState(1); // 1: المصادقة، 2: الاسم الرمزي
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- البيانات ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  // الاحتفاظ بكائن المستخدم المؤقت لإكمال التسجيل
  const [tempUser, setTempUser] = useState(null);

  /**
   * إنشاء سجل المستخدم في قاعدة البيانات
   */
  const finalizeProfile = async (userObj, chosenName) => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", userObj.uid);
      
      const profileData = {
        email: userObj.email,
        displayName: chosenName,
        role: 'user', // الرتبة الافتراضية
        xp: 0,
        streak: 0,
        isBanned: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        photoURL: userObj.photoURL || "/avatars/avatar1.png"
      };

      await setDoc(userRef, profileData);
      
      // تحديث الاسم في Firebase Auth أيضاً
      await updateProfile(userObj, { displayName: chosenName });
      
      onLoginSuccess(userObj);
    } catch (err) {
      console.error(err);
      setError("Critical Error: Database handshake failed.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * تسجيل الدخول عبر البريد
   */
  const handleEmailAuth = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (isSignUp) {
      // في حالة التسجيل الجديد، ننتقل لخطوة الاسم أولاً
      if (password.length < 6) {
          setError("Password must be at least 6 chars.");
          return;
      }
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // تحديث وقت الدخول
      await setDoc(doc(db, "users", res.user.uid), { lastLogin: serverTimestamp() }, { merge: true });
      onLoginSuccess(res.user);
    } catch (err) {
      setError("Access Denied: Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * تسجيل الدخول عبر جوجل
   */
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, "users", res.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // مستخدم جديد -> طلب الاسم الرمزي
        setTempUser(res.user);
        setUsername(res.user.displayName || ""); 
        setStep(2);
        setIsSignUp(true);
      } else {
        // مستخدم موجود -> دخول
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
   * إكمال التسجيل (بعد اختيار الاسم)
   */
  const executeSignUp = async () => {
    if (!username.trim()) {
        setError(t('auth_error_name'));
        return;
    }
    setLoading(true);
    try {
      if (tempUser) {
        // حالة جوجل
        await finalizeProfile(tempUser, username);
      } else {
        // حالة البريد
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await finalizeProfile(res.user, username);
      }
    } catch (err) {
      setError(err.message);
      setStep(1); // العودة للخلف عند الخطأ
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#030014] relative overflow-hidden font-sans text-white" dir={dir}>
       
       {/* الخلفية */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
       <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
       <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none"></div>

       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-md p-8 md:p-10 bg-white/[0.03] border border-white/10 rounded-[3rem] backdrop-blur-xl shadow-2xl relative z-10 mx-4"
       >
          {/* الشعار والعنوان */}
          <div className="text-center mb-10">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-tr from-cyan-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-900/30 rotate-3 hover:rotate-0 transition-transform duration-500"
            >
                <IconShieldCheck size={40} className="text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter">
                {t('auth_welcome')}
            </h1>
            <div className="flex items-center justify-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
                <IconTerminal2 size={12} />
                <span>{step === 1 ? "Secure Login Protocol" : "Identity Creation"}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
                /* === الخطوة 1: تسجيل الدخول / إنشاء الحساب === */
                <motion.div 
                    key="step-creds"
                    initial={{ x: -20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="space-y-5">
                        <button 
                            onClick={handleGoogleAuth} 
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest"
                        >
                            <IconBrandGoogle size={20} /> Google Access
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-white/20 text-[9px] font-black tracking-widest uppercase">OR ENCRYPTED MAIL</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-1">
                                <div className="relative group">
                                    <IconMail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors"/>
                                    <input 
                                        type="email" required value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500/50 outline-none transition-all font-medium text-sm placeholder:text-white/20" 
                                        placeholder={t('auth_email_label')}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="relative group">
                                    <IconLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors"/>
                                    <input 
                                        type="password" required value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-purple-500/50 outline-none transition-all font-medium text-sm placeholder:text-white/20" 
                                        placeholder={t('auth_pass_label')}
                                    />
                                </div>
                            </div>
                            
                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-shake font-bold">
                                    <IconAlertTriangle size={18} className="shrink-0" />
                                    {error}
                                </div>
                            )}
                            
                            <button 
                                disabled={loading} 
                                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-2xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center active:scale-[0.98] uppercase text-xs tracking-widest"
                            >
                                {loading ? <IconLoader className="animate-spin" size={20}/> : (isSignUp ? t('auth_btn_next') : "INITIALIZE SESSION")}
                            </button>
                        </form>
                    </div>
                </motion.div>
            ) : (
                /* === الخطوة 2: اختيار الاسم الرمزي (مهمة للتوظيف) === */
                <motion.div 
                    key="step-name"
                    initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="space-y-6">
                        <div className="p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl text-cyan-400 text-xs leading-relaxed flex items-start gap-4">
                            <IconUser size={24} className="shrink-0 text-cyan-500"/>
                            <div>
                                <span className="font-black block mb-1 uppercase tracking-tighter">OPERATIVE ID REQUIRED</span>
                                Select a unique codename for squad identification. This will be visible to your commander.
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase ml-4 tracking-widest">{t('auth_name_label')}</label>
                            <input 
                                autoFocus
                                required
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className="w-full bg-black/40 border border-cyan-500/50 rounded-2xl py-5 px-6 text-white focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] outline-none transition-all text-xl font-black text-center tracking-tight placeholder:text-white/10"
                                placeholder="CODENAME..."
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
                            className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest"
                        >
                            {loading ? <IconLoader className="animate-spin" size={20}/> : <>{t('auth_btn_finish')} <IconArrowRight size={18}/></>}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => { setStep(1); setTempUser(null); setError(null); }} 
                            className="w-full text-white/20 text-[10px] uppercase font-black tracking-[0.3em] hover:text-white transition-colors"
                        >
                            &lt;&lt; BACK
                        </button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setStep(1); setError(null); }} 
                className="text-white/40 text-xs hover:text-white transition-colors font-mono uppercase tracking-widest"
              >
                  {isSignUp ? "Have an account? Log In" : "New Operative? Join Now"}
              </button>
          </div>
       </motion.div>

       <div className="absolute bottom-8 text-white/10 font-black tracking-[1em] text-[10px] uppercase pointer-events-none select-none">
           Neural Interface V.5.0
       </div>
    </div>
  );
};