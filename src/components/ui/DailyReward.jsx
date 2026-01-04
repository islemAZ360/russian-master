"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconBox, IconGift, IconBolt, IconX, IconPackage } from '@tabler/icons-react';
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
// تم إصلاح المسار هنا باستخدام @ لضمان عمل الـ Build في Vercel
import { db } from '@/lib/firebase'; 
import confetti from "canvas-confetti";
import { useLanguage } from '@/hooks/useLanguage';

/**
 * مكون المكافأة اليومية (Daily Reward)
 * تم إصلاحه ليعمل مع نظام الترجمة الشامل ومسارات Firebase الصحيحة
 */
export default function DailyReward({ user, onClose }) {
  const { t, dir } = useLanguage();
  const [step, setStep] = useState('loading'); // loading, hidden, dropping, ready, opening, reward
  const [rewardAmount, setRewardAmount] = useState(0);

  // 1. التحقق من أحقية المستخدم للمكافأة اليومية
  useEffect(() => {
    const checkDailyStatus = async () => {
        if (!user) return;
        try {
            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);
            
            if (snap.exists()) {
                const data = snap.data();
                const today = new Date().toDateString();
                
                // تحويل Firebase Timestamp إلى تاريخ JavaScript للمقارنة
                let lastClaimDate = null;
                if (data.lastDailyClaim) {
                    lastClaimDate = data.lastDailyClaim.toDate().toDateString();
                }

                if (lastClaimDate !== today) {
                    // المستخدم لم يستلم مكافأة اليوم -> تفعيل الأنيميشن
                    setTimeout(() => setStep('dropping'), 1500);
                } else {
                    // استلم بالفعل -> إغفاء المكون
                    setStep('hidden');
                    onClose();
                }
            }
        } catch (error) {
            console.error("Neural Reward Sync Failed:", error);
            setStep('hidden');
        }
    };
    checkDailyStatus();
  }, [user, onClose]);

  // 2. وظيفة فتح الصندوق وتوزيع الجائزة
  const openBox = async () => {
      setStep('opening');
      
      // توليد جائزة عشوائية بين 100 و 300 XP
      const amount = Math.floor(Math.random() * 200) + 100;
      setRewardAmount(amount);

      try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          const currentXP = snap.data()?.xp || 0;

          // تحديث قاعدة البيانات بالـ XP الجديد وتاريخ الاستلام
          await updateDoc(userRef, {
              xp: currentXP + amount,
              lastDailyClaim: serverTimestamp()
          });

          // تشغيل احتفالية النجاح
          setTimeout(() => {
              setStep('reward');
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#06b6d4', '#a855f7', '#ffffff']
              });
          }, 1000);

      } catch (error) {
          console.error("Reward Processing Error:", error);
          alert("Connection Lost. Reward stored in buffer.");
          onClose();
      }
  };

  if (step === 'hidden' || step === 'loading') return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden" dir={dir}>
        <div className="relative w-full max-w-md flex flex-col items-center justify-center">
            
            <AnimatePresence mode="wait">
                {/* المرحلة الأولى: سقوط الصندوق */}
                {step === 'dropping' && (
                    <motion.div 
                        key="drop"
                        initial={{ y: -1000, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onAnimationComplete={() => setStep('ready')}
                        transition={{ type: "spring", bounce: 0.4, duration: 1.5 }}
                        className="cursor-pointer"
                    >
                        <div className="w-48 h-48 bg-gradient-to-b from-cyan-900/40 to-black border-4 border-cyan-500 rounded-[2.5rem] shadow-[0_0_80px_rgba(6,182,212,0.4)] flex items-center justify-center animate-bounce relative">
                            <IconPackage size={100} className="text-white opacity-80" stroke={1.5} />
                        </div>
                    </motion.div>
                )}

                {/* المرحلة الثانية: جاهز للفتح */}
                {step === 'ready' && (
                    <motion.div
                        key="ready"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <motion.button 
                            onClick={openBox}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-52 h-52 bg-gradient-to-b from-cyan-800 to-black border-4 border-cyan-400 rounded-[3rem] shadow-[0_0_100px_rgba(6,182,212,0.5)] flex items-center justify-center animate-pulse relative group"
                        >
                            <div className="absolute inset-0 bg-cyan-400/10 group-hover:bg-cyan-400/20 transition-colors rounded-[3rem]"></div>
                            <IconBox size={110} className="text-white drop-shadow-2xl" stroke={1.5} />
                        </motion.button>
                        
                        <div className="text-center">
                            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic">SUPPLY_DROP</h2>
                            <p className="text-cyan-400 text-xs tracking-[0.4em] font-mono uppercase opacity-70">Daily resources detected</p>
                        </div>
                        
                        <button 
                            onClick={openBox} 
                            className="px-12 py-4 bg-white text-black font-black rounded-2xl shadow-xl hover:bg-cyan-400 transition-all uppercase tracking-widest text-xs"
                        >
                            {t('btn_start')}
                        </button>
                    </motion.div>
                )}

                {/* المرحلة الثالثة: أنيميشن الفتح */}
                {step === 'opening' && (
                    <motion.div 
                        key="opening"
                        animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-48 h-48 bg-white rounded-[2.5rem] shadow-[0_0_120px_#fff] flex items-center justify-center relative z-20"
                    >
                        <IconGift size={100} className="text-black" stroke={1.5} />
                    </motion.div>
                )}

                {/* المرحلة الرابعة: عرض الجائزة المستلمة */}
                {step === 'reward' && (
                    <motion.div 
                        key="reward"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="bg-[#050505] border-2 border-cyan-500/40 p-10 md:p-14 rounded-[3rem] text-center shadow-[0_0_100px_rgba(6,182,212,0.3)] flex flex-col items-center gap-6 relative overflow-hidden w-full max-w-sm"
                    >
                        {/* خطوط تجميلية خلفية */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>

                        <div className="w-28 h-28 bg-yellow-500/10 rounded-full flex items-center justify-center mb-2 border border-yellow-500/20 shadow-inner">
                            <IconBolt size={72} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                        </div>
                        
                        <div>
                            <h2 className="text-cyan-500/40 text-[10px] font-black tracking-[0.4em] uppercase mb-3">Syncing Data...</h2>
                            <h1 className="text-8xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                +{rewardAmount}
                            </h1>
                            <span className="text-yellow-400 font-black text-xl tracking-[0.2em] uppercase">{t('profile_exp')}</span>
                        </div>

                        <button 
                            onClick={onClose} 
                            className="mt-6 w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 group tracking-widest text-xs uppercase"
                        >
                            ACCEPT_RESOURCES <IconX size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}