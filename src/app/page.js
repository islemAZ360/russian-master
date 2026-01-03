"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  IconHome, IconCpu, IconDatabase, IconTrophy, IconSettings, 
  IconShield, IconMessageCircle, IconDeviceGamepad, IconBroadcast, IconLifebuoy 
} from '@tabler/icons-react';

import { useAuth } from '@/hooks/useAuth';
import { useUI } from '@/hooks/useUI';
import { useSettings } from '@/hooks/useSettings';
import { useStudySystem } from '@/hooks/useStudySystem';
import { useAudio } from '@/hooks/useAudio';
import { useLanguage } from '@/hooks/useLanguage'; // إضافة هوك اللغة

import { db } from '@/lib/firebase';
import { doc, onSnapshot } from "firebase/firestore";

import ViewManager from '@/components/views/ViewManager';
import { FloatingDock } from '@/components/ui/floating-dock';
import NotificationCenter from '@/components/ui/NotificationCenter';
import IntroSequence from '@/components/ui/IntroSequence';
import CyberLayout from '@/components/layout/CyberLayout';

import SupportModal from '@/components/features/support/SupportModal';
import { AuthScreen } from '@/components/features/auth/AuthScreen';

// استيراد الألعاب
import TimeTraveler from '@/components/features/games/TimeTraveler';
import GravityProtocol from '@/components/features/games/GravityProtocol';
import MagneticField from '@/components/features/games/MagneticField';
import WordScale from '@/components/features/games/WordScale';

const LoadingFallback = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
    <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <div className="text-xs font-mono tracking-widest animate-pulse">SYSTEM LOADING...</div>
  </div>
);

export default function Page() {
  // استدعاء الهوكس
  const { user, loading, isAdmin, isJunior, isBanned } = useAuth();
  const { currentView, setCurrentView, showSupport, setShowSupport, activeOverlayGame, setActiveOverlayGame } = useUI();
  const { settings } = useSettings();
  const { t, dir } = useLanguage(); // استدعاء الترجمة والاتجاه
  
  // الحالة المحلية
  const [showIntro, setShowIntro] = useState(true);
  const [broadcast, setBroadcast] = useState(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });
  
  const { cards, currentCard, stats, handleSwipe, resetProgress, addCard, deleteCard, updateCard, isBanned: studyBanned } = useStudySystem(user);
  const { speak, playSFX } = useAudio();

  // مراقبة رسائل البث من المدير
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "system", "broadcast"), (d) => {
        setBroadcast(d.exists() && d.data().active ? d.data().message : null);
    });
    return () => unsub();
  }, [user]);

  // حساب التصنيفات
  const categories = useMemo(() => 
    cards ? [...new Set(cards.map(c => c.category || "General"))] : [], 
    [cards]
  );

  // روابط التنقل (مترجمة)
  const navLinks = useMemo(() => {
    const iconClass = "w-full text-white/80 group-hover:text-purple-400 transition-colors";
    
    // استخدام t() لترجمة العناوين
    const links = [
      { title: t('nav_home'), icon: <IconHome className={iconClass} />, onClick: () => setCurrentView('home') },
      { title: t('nav_games'), icon: <IconDeviceGamepad className="w-full text-green-400" />, onClick: () => setCurrentView('games') },
      { title: t('nav_live'), icon: <IconBroadcast className="w-full text-red-400" />, onClick: () => setCurrentView('live') },
      { title: t('nav_chat'), icon: <IconMessageCircle className="w-full text-blue-400" />, onClick: () => setCurrentView('chat') },
      { title: t('nav_study'), icon: <IconCpu className="w-full text-purple-400" />, onClick: () => setCurrentView('category') },
      { title: t('nav_archive'), icon: <IconDatabase className="w-full text-teal-400" />, onClick: () => setCurrentView('data') }, 
      { title: t('nav_rank'), icon: <IconTrophy className="w-full text-yellow-400" />, onClick: () => setCurrentView('leaderboard') },
      { title: t('nav_settings'), icon: <IconSettings className="w-full text-gray-400" />, onClick: () => setCurrentView('settings') },
    ];
    
    if (isJunior) links.push({ title: t('nav_admin'), icon: <IconShield className="w-full text-red-600" />, onClick: () => setCurrentView('admin_panel') });
    if (!isAdmin) links.push({ title: "Support", icon: <IconLifebuoy className="w-full text-orange-500" />, onClick: () => setShowSupport(true) });
    
    return links;
  }, [isJunior, isAdmin, setCurrentView, setShowSupport, t]); // أضفنا t للاعتماديات

  // حالات التحميل والحظر
  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;
  if (loading) return <LoadingFallback />;
  if (isBanned || studyBanned) return <div className="h-screen flex items-center justify-center bg-black text-red-600 font-bold font-mono tracking-widest text-xl">ACCESS REVOKED</div>;
  if (!user) return <AuthScreen onLoginSuccess={() => {}} />;

  const isAdminMode = isAdmin && currentView === 'admin_panel';

  return (
    <CyberLayout>
      {/* تطبيق اتجاه النص (RTL/LTR) على الحاوية الداخلية */}
      <div className="relative h-full w-full" dir={dir}>
        
        <NotificationCenter />
        
        {/* الألعاب المنبثقة */}
        {!isAdminMode && (
            <AnimatePresence>
              {activeOverlayGame === 'time_traveler' && <TimeTraveler onClose={() => setActiveOverlayGame(null)} />}
              {activeOverlayGame === 'gravity' && <GravityProtocol onClose={() => setActiveOverlayGame(null)} />}
              {activeOverlayGame === 'magnet' && <MagneticField onClose={() => setActiveOverlayGame(null)} />}
              {activeOverlayGame === 'scale' && <WordScale onClose={() => setActiveOverlayGame(null)} />}
            </AnimatePresence>
        )}
        
        {showSupport && <SupportModal user={user} onClose={() => setShowSupport(false)} />}
        
        {/* شريط البث العاجل */}
        <AnimatePresence>
          {broadcast && (
              <motion.div 
                initial={{ y: -100, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: -100, opacity: 0 }} 
                className="fixed top-0 left-0 w-full bg-red-600/90 backdrop-blur-md text-white text-center py-3 z-[100] font-bold shadow-[0_0_30px_rgba(220,38,38,0.5)] border-b border-red-400"
              >
                  🚨 TRANSMISSION: {broadcast}
              </motion.div>
          )}
        </AnimatePresence>

        {/* مدير العرض الرئيسي */}
        <div className="relative z-10 flex flex-col items-center justify-start h-full w-full pt-6 md:pt-0">
             <ViewManager 
                  cards={cards} 
                  currentCard={currentCard} 
                  sessionStats={sessionStats} 
                  setSessionStats={setSessionStats} 
                  handleSwipe={handleSwipe} 
                  playSFX={playSFX} 
                  speak={speak} 
                  addCard={addCard} 
                  deleteCard={deleteCard} 
                  updateCard={updateCard} 
                  resetProgress={resetProgress}
                  stats={stats} 
                  categories={categories} 
             />
        </div>

        {/* شريط التنقل السفلي - تم رفع z-index ليكون فوق الفيديو */}
        {!isAdminMode && (
            <div className="fixed bottom-6 left-0 w-full z-[60] flex justify-center pointer-events-none">
                <motion.div 
                  initial={{ y: 100, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="pointer-events-auto"
                >
                    <FloatingDock items={navLinks} />
                </motion.div>
            </div>
        )}
      </div>
    </CyberLayout>
  );
}