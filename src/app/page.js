"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  IconHome, IconCpu, IconDatabase, IconTrophy, IconSettings, 
  IconShield, IconMessageCircle, IconDeviceGamepad, IconBroadcast, 
  IconLifebuoy, IconUsers, IconChartBar, IconPencil, IconSchool
} from '@tabler/icons-react';

// استيراد الهوكس
import { useAuth } from '@/hooks/useAuth';
import { useUI } from '@/hooks/useUI';
import { useStudySystem } from '@/hooks/useStudySystem';
import { useAudio } from '@/hooks/useAudio';
import { useLanguage } from '@/hooks/useLanguage';

// استيراد المكونات الأساسية
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from "firebase/firestore";
import ViewManager from '@/components/views/ViewManager';
import { FloatingDock } from '@/components/ui/floating-dock';
import NotificationCenter from '@/components/ui/NotificationCenter';
import IntroSequence from '@/components/ui/IntroSequence';
import CyberLayout from '@/components/layout/CyberLayout';
import SupportModal from '@/components/features/support/SupportModal';
import { AuthScreen } from '@/components/features/auth/AuthScreen';

// استيراد الألعاب المنبثقة
import TimeTraveler from '@/components/features/games/TimeTraveler';
import GravityProtocol from '@/components/features/games/GravityProtocol';
import MagneticField from '@/components/features/games/MagneticField';
import WordScale from '@/components/features/games/WordScale';

// شاشة تحميل بسيطة
const LoadingFallback = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
    <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <div className="text-[10px] font-black font-mono tracking-[0.4em] animate-pulse uppercase">System_Loading...</div>
  </div>
);

export default function Page() {
  // 1. استدعاء كافة الهوكس اللازمة
  const { user, loading, isAdmin, isTeacher, isStudent, isBanned } = useAuth();
  const { 
    currentView, setCurrentView, 
    showSupport, setShowSupport, 
    activeOverlayGame, setActiveOverlayGame 
  } = useUI();
  const { t, dir, isLoaded } = useLanguage();
  const { speak, playSFX } = useAudio();
  
  // 2. إدارة حالة نظام الدراسة (SRS Engine)
  const { 
    cards, currentCard, stats, handleSwipe, 
    resetProgress, addCard, deleteCard, updateCard, 
    isBanned: studyBanned 
  } = useStudySystem(user);
  
  // 3. حالات الصفحة المحلية
  const [showIntro, setShowIntro] = useState(true);
  const [broadcast, setBroadcast] = useState(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });
  const [forceLoad, setForceLoad] = useState(false);

  // مؤقت أمان لفرض إخفاء شاشة التحميل إذا تأخرت البيانات
  useEffect(() => {
    const timer = setTimeout(() => setForceLoad(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // 4. مراقبة رسائل البث الإدارية (Global Broadcast)
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "system", "broadcast"), (d) => {
        setBroadcast(d.exists() && d.data().active ? d.data().message : null);
    });
    return () => unsub();
  }, [user]);

  // 5. حساب التصنيفات المتوفرة
  const categories = useMemo(() => 
    cards ? ["All", ...new Set(cards.map(c => c.category || "General").filter(c => c !== "All"))] : ["All"], 
    [cards]
  );

  // 6. بناء روابط التنقل (Floating Dock) بناءً على الرتبة
  const navLinks = useMemo(() => {
    const iconClass = "w-full transition-all duration-300";
    let links = [];

    // --- أ. واجهة الأستاذ (Teacher Interface) ---
    // يرى أدوات الإدارة بدلاً من الألعاب والدراسة
    if (isTeacher && !isAdmin) {
      links = [
        { 
            title: t('nav_create_db') || "Content", 
            icon: <IconPencil className={`${iconClass} text-emerald-400`} />, 
            onClick: () => setCurrentView('teacher_db') 
        },
        { 
            title: t('nav_students') || "Students", 
            icon: <IconUsers className={`${iconClass} text-cyan-400`} />, 
            onClick: () => setCurrentView('teacher_students') 
        },
        { 
            title: t('nav_progress') || "Stats", 
            icon: <IconChartBar className={`${iconClass} text-yellow-400`} />, 
            onClick: () => setCurrentView('teacher_progress') 
        },
        { 
            title: t('nav_chat') || "Squad", 
            icon: <IconMessageCircle className={`${iconClass} text-blue-400`} />, 
            onClick: () => setCurrentView('chat') 
        },
        { 
            title: t('nav_live') || "Live", 
            icon: <IconBroadcast className={`${iconClass} text-red-500`} />, 
            onClick: () => setCurrentView('live') 
        },
        { 
            title: t('nav_settings') || "Config", 
            icon: <IconSettings className={`${iconClass} text-zinc-400`} />, 
            onClick: () => setCurrentView('settings') 
        },
      ];
    } 
    // --- ب. واجهة الطالب (Student Interface) ---
    // يرى الدراسة والألعاب والترتيب
    else if (isStudent) {
      links = [
        { title: t('nav_home'), icon: <IconHome className={`${iconClass} text-white/70`} />, onClick: () => setCurrentView('home') },
        { title: t('nav_study') || "Mission", icon: <IconCpu className={`${iconClass} text-purple-400`} />, onClick: () => setCurrentView('category') },
        { title: t('nav_games'), icon: <IconDeviceGamepad className={`${iconClass} text-emerald-400`} />, onClick: () => setCurrentView('games') },
        { title: t('nav_chat') || "Squad", icon: <IconMessageCircle className={`${iconClass} text-cyan-400`} />, onClick: () => setCurrentView('chat') },
        { title: t('nav_live') || "Uplink", icon: <IconSchool className={`${iconClass} text-red-500`} />, onClick: () => setCurrentView('live') },
        { title: t('nav_rewards') || "Rank", icon: <IconTrophy className={`${iconClass} text-yellow-400`} />, onClick: () => setCurrentView('leaderboard') },
        { title: t('nav_settings') || "Config", icon: <IconSettings className={`${iconClass} text-zinc-400`} />, onClick: () => setCurrentView('settings') },
      ];
    }
    // --- ج. واجهة المستخدم العادي + الأدمن (Default / Admin) ---
    else {
      links = [
        { title: t('nav_home'), icon: <IconHome className={`${iconClass} text-white/70`} />, onClick: () => setCurrentView('home') },
        { title: t('nav_games'), icon: <IconDeviceGamepad className={`${iconClass} text-emerald-400`} />, onClick: () => setCurrentView('games') },
        { title: t('nav_live'), icon: <IconBroadcast className={`${iconClass} text-red-500`} />, onClick: () => setCurrentView('live') },
        { title: t('nav_chat'), icon: <IconMessageCircle className={`${iconClass} text-cyan-400`} />, onClick: () => setCurrentView('chat') },
        { title: t('nav_study'), icon: <IconCpu className={`${iconClass} text-purple-400`} />, onClick: () => setCurrentView('category') },
        { title: t('nav_archive'), icon: <IconDatabase className={`${iconClass} text-amber-500`} />, onClick: () => setCurrentView('data') }, 
        { title: t('nav_rank'), icon: <IconTrophy className={`${iconClass} text-yellow-400`} />, onClick: () => setCurrentView('leaderboard') },
        { title: t('nav_settings'), icon: <IconSettings className={`${iconClass} text-zinc-400`} />, onClick: () => setCurrentView('settings') },
      ];

      // إضافة زر الأدمن فقط للأدمن
      if (isAdmin) {
        links.push({ title: t('nav_admin'), icon: <IconShield className={`${iconClass} text-red-600`} />, onClick: () => setCurrentView('admin_panel') });
      } else {
        // المستخدم العادي يرى زر الدعم بدلاً من الأدمن
        links.push({ title: t('nav_support'), icon: <IconLifebuoy className={`${iconClass} text-orange-500`} />, onClick: () => setShowSupport(true) });
      }
    }
    
    return links;
  }, [isTeacher, isStudent, isAdmin, setCurrentView, setShowSupport, t]);

  // 7. معالجة حالات التحميل والأمن
  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;
  if ((loading || !isLoaded) && !forceLoad) return <LoadingFallback />;
  
  // شاشة الحظر
  if (isBanned || studyBanned) {
      return (
        <div className="h-screen flex items-center justify-center bg-black text-red-600 font-black font-mono tracking-[0.5em] text-2xl uppercase flex-col gap-4 text-center p-4">
          <IconShield size={64} className="animate-pulse"/>
          <div>NEURAL LINK TERMINATED</div>
          <div className="text-xs text-red-800">Access Revoked by Administration</div>
        </div>
      );
  }
  
  if (!user) return <AuthScreen onLoginSuccess={() => {}} />;

  // إخفاء الشريط السفلي في وضع الأدمن الكامل لتوفير مساحة
  const isAdminMode = isAdmin && currentView === 'admin_panel';

  return (
    <CyberLayout>
      <div className="relative h-full w-full" dir={dir}>
        
        {/* مركز الإشعارات (يظهر في كل الصفحات) */}
        <NotificationCenter />
        
        {/* نافذة الدعم المنبثقة */}
        <AnimatePresence>
            {showSupport && <SupportModal user={user} onClose={() => setShowSupport(false)} />}
        </AnimatePresence>

        {/* الألعاب المنبثقة (Overlay Games) */}
        {!isAdminMode && (
            <AnimatePresence>
              {activeOverlayGame === 'time_traveler' && <TimeTraveler onClose={() => setActiveOverlayGame(null)} />}
              {activeOverlayGame === 'gravity' && <GravityProtocol onClose={() => setActiveOverlayGame(null)} />}
              {activeOverlayGame === 'magnet' && <MagneticField onClose={() => setActiveOverlayGame(null)} />}
              {activeOverlayGame === 'scale' && <WordScale onClose={() => setActiveOverlayGame(null)} />}
            </AnimatePresence>
        )}
        
        {/* شريط البث العاجل (Admin Broadcast) */}
        <AnimatePresence>
          {broadcast && (
              <motion.div 
                initial={{ y: -100, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: -100, opacity: 0 }} 
                className="fixed top-0 left-0 w-full bg-red-600/90 backdrop-blur-xl text-white text-center py-4 z-[100] font-black shadow-[0_10px_40px_rgba(220,38,38,0.5)] border-b border-red-400/30 text-xs tracking-widest uppercase"
              >
                  🚨 High_Priority_Signal: {broadcast}
              </motion.div>
          )}
        </AnimatePresence>

        {/* منطقة المحتوى المتغير (Views) */}
        <div className="relative z-10 flex flex-col items-center justify-start h-full w-full pt-4 md:pt-0">
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

        {/* الشريط السفلي العائم (Floating Dock) */}
        {!isAdminMode && (
            <div className="fixed bottom-8 left-0 w-full z-[60] flex justify-center pointer-events-none">
                <motion.div 
                  initial={{ y: 100, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
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