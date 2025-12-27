"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  IconHome, IconCpu, IconDatabase, IconTrophy, IconSettings, 
  IconShield, IconMessageCircle, IconDeviceGamepad, IconBroadcast, IconLifebuoy
} from '@tabler/icons-react';

// Providers
import { AuthProvider, useAuth } from '../context/AuthContext';
import { UIProvider, useUI } from '../context/UIContext';
import { SettingsProvider } from '../context/SettingsContext';

// Components
import ViewManager from '../components/views/ViewManager';
import { FloatingDock } from '../components/ui/floating-dock';
import DigitalRain from '../components/ui/DigitalRain'; 
import IntroSequence from '../components/IntroSequence'; 
import TimeTraveler from '../components/games/TimeTraveler';
import SupportModal from '../components/SupportModal';
import { GridBackground } from '../components/ui/GridBackground'; 
import { CyberHUD } from '../components/ui/CyberHUD';
import { AuthScreen } from '../components/AuthScreen'; 

// Hooks & Libs
import { useStudySystem } from '../hooks/useStudySystem';
import { useAudio } from '../hooks/useAudio';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from "firebase/firestore";

// المكون الرئيسي الذي يعيش داخل الـ Providers
function MainApp() {
  const { user, loading, isAdmin, isJunior } = useAuth();
  const { 
    currentView, setCurrentView, showSupport, setShowSupport, 
    activeOverlayGame, setActiveOverlayGame 
  } = useUI();
  
  const [showIntro, setShowIntro] = useState(true);
  const [broadcast, setBroadcast] = useState(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });
  const containerRef = useRef(null);

  // استخدام الهوك للبيانات
  const { 
    cards, currentCard, stats, handleSwipe, resetProgress, 
    addCard, deleteCard, updateCard, isBanned 
  } = useStudySystem(user);

  const { speak, playSFX } = useAudio();

  // تأثير الماوس
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  // الاستماع للبث
  useEffect(() => {
    const unsubBroad = onSnapshot(doc(db, "system", "broadcast"), (d) => setBroadcast(d.exists() && d.data().active ? d.data().message : null));
    return () => unsubBroad();
  }, []);

  const categories = useMemo(() => {
      if (!cards) return [];
      return [...new Set(cards.map(c => c.category || "General"))];
  }, [cards]);

  // روابط التنقل
  let navLinks = [
    { title: "Base", icon: <IconHome className="w-full text-cyan-400" />, onClick: () => setCurrentView('home') },
    { title: "Arcade", icon: <IconDeviceGamepad className="w-full text-green-500" />, onClick: () => setCurrentView('games') },
    { title: "Live Ops", icon: <IconBroadcast className="w-full text-red-500" />, onClick: () => setCurrentView('live') },
    { title: "Comms", icon: <IconMessageCircle className="w-full text-blue-400" />, onClick: () => setCurrentView('chat') },
    { title: "Missions", icon: <IconCpu className="w-full text-purple-400" />, onClick: () => setCurrentView('category') },
    { title: "Archive", icon: <IconDatabase className="w-full text-emerald-400" />, onClick: () => setCurrentView('data') }, 
    { title: "ID Card", icon: <IconTrophy className="w-full text-yellow-500" />, onClick: () => setCurrentView('leaderboard') },
    { title: "Config", icon: <IconSettings className="w-full text-neutral-400" />, onClick: () => setCurrentView('settings') },
  ];
  
  if (isJunior) navLinks.push({ title: "CONTROL", icon: <IconShield className="w-full text-red-500" />, onClick: () => setCurrentView('admin_panel') });
  if (!isAdmin) navLinks.push({ title: "Support", icon: <IconLifebuoy className="w-full text-orange-500" />, onClick: () => setShowSupport(true) });

  // Renders
  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;
  if (isBanned) return <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-red-500 space-y-6 font-mono"><h1 className="text-6xl font-black">ACCESS DENIED</h1><p className="text-white/50">Your Neural Link has been severed.</p></div>;
  if (loading) return <div className="h-screen bg-black text-cyan-500 flex items-center justify-center font-mono animate-pulse">LOADING NEURAL LINK...</div>;
  if (!user) return <AuthScreen onLoginSuccess={() => {}} />;

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full overflow-hidden font-sans text-neutral-200 bg-black spotlight-bg"
    >
      {/* Backgrounds - تختفي في وضع الأدمن */}
      {!(isAdmin && currentView === 'admin_panel') && (
          <>
            <GridBackground /> 
            <CyberHUD /> 
            <div className="crt-overlay"></div>
            <DigitalRain />
          </>
      )}
      
      {/* Modals & Overlays */}
      {activeOverlayGame === 'time_traveler' && <TimeTraveler onClose={() => setActiveOverlayGame(null)} />}
      {showSupport && <SupportModal user={user} onClose={() => setShowSupport(false)} />}
      
      <AnimatePresence>
        {broadcast && (
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="fixed top-0 w-full bg-red-900/90 text-white text-center py-3 z-[100] font-bold shadow-[0_0_20px_#ff0000]">
                {broadcast}
            </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex flex-col items-center justify-start h-full w-full pt-10 md:pt-0">
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
              stats={stats}
              categories={categories}
              resetProgress={resetProgress}
           />
      </main>

      {/* القائمة السفلية - تختفي في وضع الأدمن */}
      {!(isAdmin && currentView === 'admin_panel') && (
          <div className="fixed bottom-8 left-0 w-full z-50 flex justify-center pointer-events-none">
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="pointer-events-auto">
                  <FloatingDock items={navLinks} />
              </motion.div>
          </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <UIProvider>
        <SettingsProvider>
          <MainApp />
        </SettingsProvider>
      </UIProvider>
    </AuthProvider>
  );
}