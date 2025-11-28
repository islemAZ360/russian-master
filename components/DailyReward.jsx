"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconBox, IconGift, IconBolt, IconX } from '@tabler/icons-react';
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from '../lib/firebase';
import confetti from "canvas-confetti";

export default function DailyReward({ user, onClose }) {
  const [step, setStep] = useState('loading'); // loading, hidden, dropping, ready, opening, reward
  const [rewardAmount, setRewardAmount] = useState(0);

  useEffect(() => {
    const checkDaily = async () => {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        
        if (snap.exists()) {
            const data = snap.data();
            // التحقق من التاريخ
            let lastClaimDate = null;
            if (data.lastDailyClaim) {
                // التعامل مع Timestamp الخاص بـ Firebase
                lastClaimDate = data.lastDailyClaim.toDate().toDateString();
            }
            
            const today = new Date().toDateString();

            if (lastClaimDate !== today) {
                // لم يستلم اليوم -> ابدأ الإسقاط
                setTimeout(() => setStep('dropping'), 1000);
            } else {
                // استلم بالفعل -> أغلق بصمت
                setStep('hidden');
                onClose();
            }
        }
    };
    checkDaily();
  }, [user]);

  const openBox = async () => {
      setStep('opening');
      const amount = Math.floor(Math.random() * 200) + 50; // XP عشوائي
      setRewardAmount(amount);

      // تحديث قاعدة البيانات
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const currentXP = snap.data().xp || 0;

      await updateDoc(userRef, {
          xp: currentXP + amount,
          lastDailyClaim: new Date() // حفظ تاريخ اليوم
      });

      // تشغيل الاحتفال
      setTimeout(() => {
          setStep('reward');
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#a855f7', '#ffffff']
          });
      }, 1000);
  };

  if (step === 'hidden' || step === 'loading') return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="relative w-full max-w-md flex flex-col items-center justify-center">
            
            <AnimatePresence mode="wait">
                {step === 'dropping' && (
                    <motion.div 
                        key="drop"
                        initial={{ y: -800, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onAnimationComplete={() => setStep('ready')}
                        transition={{ type: "spring", bounce: 0.4, duration: 1.2 }}
                        className="cursor-pointer"
                    >
                        <div className="w-48 h-48 bg-gradient-to-b from-cyan-900 to-black border-4 border-cyan-500 rounded-3xl shadow-[0_0_80px_#06b6d4] flex items-center justify-center animate-bounce relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <IconBox size={100} className="text-white relative z-10" stroke={1.5} />
                        </div>
                    </motion.div>
                )}

                {step === 'ready' && (
                    <motion.div
                        key="ready"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <motion.button 
                            onClick={openBox}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-48 h-48 bg-gradient-to-b from-cyan-800 to-black border-4 border-cyan-400 rounded-3xl shadow-[0_0_60px_#06b6d4] flex items-center justify-center animate-pulse relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-cyan-400/20 group-hover:bg-cyan-400/40 transition-colors"></div>
                            <IconBox size={100} className="text-white drop-shadow-lg" stroke={1.5} />
                        </motion.button>
                        
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-white mb-1">SUPPLY DROP</h2>
                            <p className="text-cyan-400 text-xs tracking-[0.3em] uppercase">Daily Resources Available</p>
                        </div>
                        
                        <button onClick={openBox} className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all">
                            OPEN CONTAINER
                        </button>
                    </motion.div>
                )}

                {step === 'opening' && (
                    <motion.div 
                        key="opening"
                        animate={{ rotate: [0, -5, 5, -5, 5, 0], scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                        className="w-48 h-48 bg-white border-4 border-cyan-500 rounded-3xl shadow-[0_0_100px_#ffffff] flex items-center justify-center relative z-20"
                    >
                        <IconGift size={100} className="text-black" stroke={1.5} />
                    </motion.div>
                )}

                {step === 'reward' && (
                    <motion.div 
                        key="reward"
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="bg-[#0a0a0a] border-2 border-cyan-500 p-8 md:p-12 rounded-[2rem] text-center shadow-[0_0_100px_#06b6d4] flex flex-col items-center gap-4 relative overflow-hidden w-full max-w-sm mx-4"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 blur-[50px] rounded-full"></div>

                        <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mb-2 animate-pulse">
                            <IconBolt size={64} className="text-yellow-400 fill-yellow-400" />
                        </div>
                        
                        <div>
                            <h2 className="text-cyan-500/50 text-xs font-bold tracking-[0.3em] uppercase mb-2">Resource Acquired</h2>
                            <h1 className="text-7xl font-black text-white drop-shadow-xl">
                                +{rewardAmount}
                            </h1>
                            <span className="text-yellow-400 font-bold text-xl tracking-widest">XP CREDITS</span>
                        </div>

                        <button onClick={onClose} className="mt-8 w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group">
                            ACCEPT TRANSMISSION <IconX size={18} className="opacity-50 group-hover:opacity-100" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}