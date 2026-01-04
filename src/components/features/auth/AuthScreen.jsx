"use client";
import React, { useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { IconMail, IconLock, IconLoader, IconBrandGoogle, IconUser, IconArrowRight } from "@tabler/icons-react";
import { useLanguage } from "@/hooks/useLanguage";

export const AuthScreen = ({ onLoginSuccess }) => {
  const { t, dir } = useLanguage();
  
  // States
  const [step, setStep] = useState(1); // 1: Login/SignChoice, 2: Name Entry (for new users)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const saveUserProfile = async (user, finalName) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const initialRole = user.email.toLowerCase() === 'islamaz@bomba.com' ? 'master' : 'user';
        await setDoc(userRef, {
            email: user.email,
            displayName: finalName || user.displayName || "Agent",
            role: initialRole,
            xp: 0,
            streak: 0,
            isBanned: false,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        });
    } else {
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);

    // إذا كان تسجيل جديد ولم يدخل اسم بعد، نطلب الاسم
    if (isSignUp && step === 1) {
        setStep(2);
        return;
    }

    setLoading(true);
    try {
      let res;
      if (isSignUp) {
        if (!username.trim()) throw new Error(t('auth_error_name'));
        res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: username });
        await saveUserProfile(res.user, username);
      } else {
        res = await signInWithEmailAndPassword(auth, email, password);
        await saveUserProfile(res.user);
      }
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message.replace("Firebase:", "").trim());
      if (isSignUp) setStep(1); // العودة للخلف في حال الخطأ
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      setLoading(true);
      try {
          const res = await signInWithPopup(auth, googleProvider);
          const userRef = doc(db, "users", res.user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
              // إذا كان مستخدم جوجل جديد، نأخذه لخطوة اختيار الاسم
              setStep(2);
              setIsSignUp(true);
              setLoading(false);
          } else {
              await saveUserProfile(res.user);
              onLoginSuccess(res.user);
          }
      } catch (err) {
          setError(err.message);
          setLoading(false);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#030014] relative overflow-hidden font-sans" dir={dir}>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

       <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10"
       >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">{t('auth_welcome')}</h1>
            <p className="text-white/40 text-sm font-mono">
                {step === 1 ? t('auth_step_creds') : t('auth_step_name')}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
                <motion.div key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
                    <div className="space-y-4">
                        <button onClick={handleGoogleLogin} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                            <IconBrandGoogle size={20} /> Google
                        </button>

                        <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-white/10"></div><span className="flex-shrink-0 mx-4 text-white/30 text-xs">OR EMAIL</span><div className="flex-grow border-t border-white/10"></div></div>

                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-purple-400 uppercase ml-1">{t('auth_email_label')}</label>
                                <div className="relative">
                                    <IconMail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"/>
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-cyan-400 uppercase ml-1">{t('auth_pass_label')}</label>
                                <div className="relative">
                                    <IconLock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"/>
                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition-all" />
                                </div>
                            </div>
                            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">{error}</div>}
                            
                            <button disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
                                {loading ? <IconLoader className="animate-spin" /> : (isSignUp ? t('auth_btn_next') : "Sign In")}
                            </button>
                        </form>
                    </div>
                </motion.div>
            ) : (
                <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 text-xs leading-relaxed">
                            <IconUser size={16} className="mb-2"/>
                            {t('auth_step_name')}: This name will be your unique identifier across the neural network.
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-cyan-400 uppercase ml-1">{t('auth_name_label')}</label>
                            <input 
                                autoFocus
                                required
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl py-4 px-4 text-white focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] outline-none transition-all text-lg font-bold"
                                placeholder={t('auth_name_placeholder')}
                            />
                        </div>
                        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">{error}</div>}
                        <button disabled={loading || !username} className="w-full py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-900/40">
                            {loading ? <IconLoader className="animate-spin" /> : <>{t('auth_btn_finish')} <IconArrowRight size={18}/></>}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full text-white/30 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors">Back to credentials</button>
                    </form>
                </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
              <button onClick={() => { setIsSignUp(!isSignUp); setStep(1); }} className="text-white/40 text-xs hover:text-white underline decoration-white/20 underline-offset-4">
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
          </div>
       </motion.div>
    </div>
  );
};