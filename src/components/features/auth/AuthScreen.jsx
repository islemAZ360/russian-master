"use client";
import React, { useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { IconMail, IconLock, IconLoader, IconBrandGoogle } from "@tabler/icons-react";

export const AuthScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const saveUserProfile = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const initialRole = user.email.toLowerCase() === 'islamaz@bomba.com' ? 'master' : 'user';
        await setDoc(userRef, {
            email: user.email,
            role: initialRole,
            xp: 0,
            streak: 0,
            isBanned: false,
            createdAt: new Date().toISOString(),
            lastLogin: serverTimestamp()
        });
    } else {
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (isSignUp) {
        res = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        res = await signInWithEmailAndPassword(auth, email, password);
      }
      await saveUserProfile(res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message.replace("Firebase:", "").trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      setLoading(true);
      try {
          const res = await signInWithPopup(auth, googleProvider);
          await saveUserProfile(res.user);
          onLoginSuccess(res.user);
      } catch (err) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#030014] relative overflow-hidden font-sans">
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

       <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10"
       >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2">WELCOME</h1>
            <p className="text-white/40 text-sm">Login to sync your progress</p>
          </div>

          <div className="space-y-4">
            <button 
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
                <IconBrandGoogle size={20} /> Continue with Google
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-white/30 text-xs">OR EMAIL</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-purple-400 uppercase ml-1">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-purple-500 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-cyan-400 uppercase ml-1">Password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-cyan-500 outline-none" />
                </div>
                {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">{error}</div>}
                
                <button disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    {loading ? <IconLoader className="animate-spin" /> : (isSignUp ? "Sign Up" : "Sign In")}
                </button>
            </form>
          </div>

          <div className="mt-6 text-center">
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-white/40 text-xs hover:text-white underline decoration-white/20 underline-offset-4">
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
          </div>
       </motion.div>
    </div>
  );
};