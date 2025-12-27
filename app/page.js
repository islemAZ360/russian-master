"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  IconHome, IconCpu, IconDatabase, IconTrophy, IconSettings, 
  IconShield, IconMessageCircle, IconDeviceGamepad, IconBroadcast, IconLifebuoy
} from '@tabler/icons-react';

// استيراد مدير المشاهد الجديد (الذي أنشأناه للتو)
import ViewManager from '../components/views/ViewManager';

// استيراد المكونات العائمة والثابتة
import { FloatingDock } from '../components/ui/floating-dock';
import DigitalRain from '../components/ui/DigitalRain'; 
import IntroSequence from '../components/IntroSequence'; 
import TimeTraveler from '../components/games/TimeTraveler';
import SupportModal from '../components/SupportModal';
import { GridBackground } from '../components/ui/GridBackground'; 
import { CyberHUD } from '../components/ui/CyberHUD';
import { AuthScreen } from '../components/AuthScreen'; // Auth نحتاجه هنا

import { useStudySystem } from '../hooks/useStudySystem';
import { useAudio } from '../hooks/useAudio';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";

const MASTER_EMAIL = "islamaz@bomba.com";

export default function RussianApp() {
  // --- States (الحالات) ---
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState("All");
  const [showIntro, setShowIntro] = useState(true); 
  const [broadcast, setBroadcast] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  const containerRef = useRef(null);

  // --- Custom Hooks ---
  const { 
    cards, currentCard, stats, handleSwipe, resetProgress, 
    addCard, deleteCard, updateCard 
  } = useStudySystem(user);

  const { speak, playSFX } = useAudio();

  // --- Effects ---
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (u) {
            setUser(u);
            const userRef = doc(db, "users", u.uid);
            const snap = await getDoc(userRef);
            
            if (u.email === MASTER_EMAIL) {
                if (!snap.exists()) await setDoc(userRef, { email: u.email, role: 'master', xp: 0, createdAt: new Date().toISOString() });
                else if (snap.data().role !== 'master') await updateDoc(userRef, { role: 'master' });
            } else if (!snap.exists()) {
                await setDoc(userRef, { email: u.email, role: 'user', xp: 0, createdAt: new Date().toISOString() });
            }

            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                    if (docSnap.data().isBanned && u.email !== MASTER_EMAIL) {
                        auth.signOut();
                        window.location.reload();
                    }
                }
            });
        } else {
            setUser(null);
            setUserData(null);
        }
        setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubBroad = onSnapshot(doc(db, "system", "broadcast"), (d) => setBroadcast(d.exists() && d.data().active ? d.data().message : null));
    return () => unsubBroad();
  }, []);

  // --- Logic Helpers ---
  const handleLogout = () => auth.signOut().then(() => window.location.reload());

  const categories = useMemo(() => {
      if (!cards) return [];
      return [...new Set(cards.map(c => c.category || "General"))];
  }, [cards]);

  const isMaster = user?.email === MASTER_EMAIL;
  const isAdmin = userData?.role === 'admin' || userData?.role === 'master' || isMaster;
  const isJunior = userData?.role === 'junior' || isAdmin;
  const isBanned = userData?.isBanned && !isMaster;

  // --- القائمة السفلية ---
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

  // --- Render (العرض) ---
  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;
  
  if (isBanned) return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-red-500 space-y-6 font-mono">
        <h1 className="text-6xl font-black">ACCESS DENIED</h1>
        <button onClick={handleLogout} className="px-8 py-3 border border-red-500 text-white hover:bg-red-900/50">LOGOUT</button>
    </div>
  );

  if (loadingAuth) return <div className="h-screen bg-black text-cyan-500 flex items-center justify-center font-mono animate-pulse">LOADING...</div>;
  if (!user) return <AuthScreen onLoginSuccess={setUser} />;

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full overflow-hidden font-sans text-neutral-200 bg-black spotlight-bg"
    >
      {/* Backgrounds - تظهر فقط اذا لم نكن في وضع الادمن */}
      {!(isAdmin && currentView === 'admin_panel') && (
          <>
            <GridBackground /> 
            <CyberHUD /> 
            <div className="crt-overlay"></div>
            <DigitalRain />
          </>
      )}
      
      {/* Modals */}
      {activeOverlayGame === 'time_traveler' && <TimeTraveler onClose={() => setActiveOverlayGame(null)} />}
      {showSupport && <SupportModal user={user} onClose={() => setShowSupport(false)} />}
      
      <AnimatePresence>
        {broadcast && (
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="fixed top-0 w-full bg-red-900/90 text-white text-center py-3 z-[100] font-bold">
                {broadcast}
            </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex flex-col items-center justify-start h-full w-full pt-10 md:pt-0">
           {/* هنا نستدعي المدير الجديد بدلاً من كتابة كل شيء هنا */}
           <ViewManager 
              currentView={currentView}
              setCurrentView={setCurrentView}
              user={user}
              userData={userData}
              isAdmin={isAdmin}
              // تمرير البيانات
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
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              handleLogout={handleLogout}
              resetProgress={resetProgress}
              onOpenGame={(id) => setActiveOverlayGame(id)}
              setShowSupport={setShowSupport}
           />
      </main>

      {/* Dock يختفي في وضع الادمن */}
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