"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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

import { db } from '@/lib/firebase';
import { doc, onSnapshot } from "firebase/firestore";

import ViewManager from '@/components/views/ViewManager';
import { FloatingDock } from '@/components/ui/floating-dock';
import NotificationCenter from '@/components/ui/NotificationCenter';
import IntroSequence from '@/components/ui/IntroSequence';
import CyberLayout from '@/components/layout/CyberLayout'; // استيراد اللي اوت الجديد

import SupportModal from '@/components/features/support/SupportModal';
import { AuthScreen } from '@/components/features/auth/AuthScreen';

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
  const { user, loading, isAdmin, isJunior, isBanned } = useAuth();
  const { currentView, setCurrentView, showSupport, setShowSupport, activeOverlayGame, setActiveOverlayGame } = useUI();
  const { settings } = useSettings();
  
  const [showIntro, setShowIntro] = useState(true);
  const [broadcast, setBroadcast] = useState(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });
  
  const { cards, currentCard, stats, handleSwipe, resetProgress, addCard, deleteCard, updateCard, isBanned: studyBanned } = useStudySystem(user);
  const { speak, playSFX } = useAudio();

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "system", "broadcast"), (d) => {
        setBroadcast(d.exists() && d.data().active ? d.data().message : null);
    });
    return () => unsub();
  }, [user]);

  const categories = useMemo(() => 
    cards ? [...new Set(cards.map(c => c.category || "General"))] : [], 
    [cards]
  );

  const navLinks = useMemo(() => {
    const iconClass = "w-full text-white/80 group-hover:text-purple-400 transition-colors";
    const links = [
      { title: "Base", icon: <IconHome className={iconClass} />, onClick: () => setCurrentView('home') },
      { title: "Arcade", icon: <IconDeviceGamepad className="w-full text-green-400" />, onClick: () => setCurrentView('games') },
      { title: "Live", icon: <IconBroadcast className="w-full text-red-400" />, onClick: () => setCurrentView('live') },
      { title: "Comms", icon: <IconMessageCircle className="w-full text-blue-400" />, onClick: () => setCurrentView('chat') },
      { title: "Missions", icon: <IconCpu className="w-full text-purple-400" />, onClick: () => setCurrentView('category') },
      { title: "Archive", icon: <IconDatabase className="w-full text-teal-400" />, onClick: () => setCurrentView('data') }, 
      { title: "ID", icon: <IconTrophy className="w-full text-yellow-400" />, onClick: () => setCurrentView('leaderboard') },
      { title: "Config", icon: <IconSettings className="w-full text-gray-400" />, onClick: () => setCurrentView('settings') },
    ];
    
    if (isJunior) links.push({ title: "CONTROL", icon: <IconShield className="w-full text-red-600" />, onClick: () => setCurrentView('admin_panel') });
    if (!isAdmin) links.push({ title: "Support", icon: <IconLifebuoy className="w-full text-orange-500" />, onClick: () => setShowSupport(true) });
    
    return links;
  }, [isJunior, isAdmin, setCurrentView, setShowSupport]);

  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;
  if (loading) return <LoadingFallback />;
  if (isBanned || studyBanned) return <div className="h-screen flex items-center justify-center bg-black text-red-600 font-bold font-mono tracking-widest text-xl">ACCESS REVOKED</div>;
  if (!user) return <AuthScreen onLoginSuccess={() => {}} />;

  const isAdminMode = isAdmin && currentView === 'admin_panel';

  return (
    // استخدام CyberLayout كحاوية رئيسية
    <CyberLayout>
      <NotificationCenter />
      
      {!isAdminMode && (
          <AnimatePresence>
            {activeOverlayGame === 'time_traveler' && <TimeTraveler onClose={() => setActiveOverlayGame(null)} />}
            {activeOverlayGame === 'gravity' && <GravityProtocol onClose={() => setActiveOverlayGame(null)} />}
            {activeOverlayGame === 'magnet' && <MagneticField onClose={() => setActiveOverlayGame(null)} />}
            {activeOverlayGame === 'scale' && <WordScale onClose={() => setActiveOverlayGame(null)} />}
          </AnimatePresence>
      )}
      
      {showSupport && <SupportModal user={user} onClose={() => setShowSupport(false)} />}
      
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

      {!isAdminMode && (
          <div className="fixed bottom-6 left-0 w-full z-50 flex justify-center pointer-events-none">
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
    </CyberLayout>
  );
}