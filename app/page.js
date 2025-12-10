"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconHome, IconCpu, IconDatabase, IconTrophy, IconSettings, 
  IconShield, IconMessageCircle, IconDeviceGamepad, IconBroadcast
} from '@tabler/icons-react';

// --- استيراد المكونات ---
import { HeroSection } from '../components/HeroSection';
import { CategorySelect } from '../components/CategorySelect';
import { StudyCard } from '../components/StudyCard';
import { AuthScreen } from '../components/AuthScreen';
import { DataManager } from '../components/DataManager'; 
import CyberDeck from '../components/CyberDeck'; 
import CommunicationHub from '../components/CommunicationHub'; 
import SettingsView from '../components/SettingsView'; 
import AdminDashboard from '../components/AdminDashboard'; 
// تم حذف AITutor من هنا
import GamesHub from '../components/GamesHub';
import { FloatingDock } from '../components/ui/floating-dock';
import DigitalRain from '../components/ui/DigitalRain'; 
import IntroSequence from '../components/IntroSequence'; 
import { BossBattleWrapper } from '../components/BossBattleWrapper'; 
import DailyReward from '../components/DailyReward';
import RealLiveStream from '../components/live/RealLiveStream';

// --- استيراد اللعبة الفخمة ---
import TimeTraveler from '../components/games/TimeTraveler';

import { useStudySystem } from '../hooks/useStudySystem';
import { useAudio } from '../hooks/useAudio';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";

const MASTER_EMAIL = "islamaz@bomba.com";

export default function RussianApp() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState("All");
  const [showIntro, setShowIntro] = useState(true); 
  const [broadcast, setBroadcast] = useState(null);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // حالة لتشغيل اللعبة بملء الشاشة
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);

  // حالات المعركة
  const [battleResult, setBattleResult] = useState(null); 
  const [battleTrigger, setBattleTrigger] = useState(0);

  const { 
    cards, currentCard, stats, handleSwipe, resetProgress, 
    addCard, deleteCard, updateCard 
  } = useStudySystem(user);

  const { speak, playSFX } = useAudio();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (u) {
            setUser(u);
            const userRef = doc(db, "users", u.uid);
            
            if (u.email === MASTER_EMAIL) {
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                    await setDoc(userRef, { email: u.email, role: 'admin', xp: 0, createdAt: new Date().toISOString() });
                } else if (snap.data().role !== 'admin') {
                    await updateDoc(userRef, { role: 'admin' });
                }
            }

            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                    if (docSnap.data().forceLogout) {
                        auth.signOut();
                        window.location.reload();
                    }
                }
            });
            setShowDailyReward(true);
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

  const handleLogout = () => auth.signOut().then(() => window.location.reload());

  const categories = useMemo(() => {
      if (!cards) return [];
      return [...new Set(cards.map(c => c.category || "General"))];
  }, [cards]);

  const isMaster = user?.email === MASTER_EMAIL;
  const isAdmin = userData?.role === 'admin' || isMaster;
  const isJunior = userData?.role === 'junior' || isAdmin;
  const isBanned = userData?.isBanned && !isMaster;

  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;

  if (isBanned) return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-red-500 space-y-6 font-mono relative overflow-hidden">
        <h1 className="text-6xl font-black tracking-widest text-center">ACCESS DENIED</h1>
        <button onClick={handleLogout} className="px-8 py-3 border border-red-500 rounded hover:bg-red-900/20 transition-colors">LOGOUT</button>
    </div>
  );

  if (loadingAuth) return <div className="h-screen bg-black text-cyan-500 flex items-center justify-center font-mono animate-pulse">LOADING NEURAL LINK...</div>;
  
  if (!user) return <AuthScreen onLoginSuccess={setUser} />;

  let navLinks = [
    { title: "Base", icon: <IconHome className="w-full text-cyan-400" />, onClick: () => setCurrentView('home') },
    // تم حذف رابط AI Mentor من هنا
    { title: "Arcade", icon: <IconDeviceGamepad className="w-full text-green-500" />, onClick: () => setCurrentView('games') },
    { title: "Live Ops", icon: <IconBroadcast className="w-full text-red-500" />, onClick: () => setCurrentView('live') },
    { title: "Comms", icon: <IconMessageCircle className="w-full text-blue-400" />, onClick: () => setCurrentView('chat') },
    { title: "Missions", icon: <IconCpu className="w-full text-purple-400" />, onClick: () => setCurrentView('category') },
    { title: "Archive", icon: <IconDatabase className="w-full text-emerald-400" />, onClick: () => setCurrentView('data') }, 
    { title: "ID Card", icon: <IconTrophy className="w-full text-yellow-500" />, onClick: () => setCurrentView('leaderboard') },
    { title: "Config", icon: <IconSettings className="w-full text-neutral-400" />, onClick: () => setCurrentView('settings') },
  ];
  
  if (isJunior) {
      navLinks.push({ title: "CONTROL", icon: <IconShield className="w-full text-red-500" />, onClick: () => setCurrentView('admin') });
  }

  const renderContent = () => {
    if (currentView === 'admin' && !isJunior) return <HeroSection onStart={() => setCurrentView('category')} onOpenGame={() => setCurrentView('games')} user={user} />;

    switch (currentView) {
      case 'home': return <HeroSection onStart={() => setCurrentView('category')} onOpenGame={() => setCurrentView('games')} user={user} />;
      // تم حذف حالة ai-tutor من هنا
      case 'games': 
        return <GamesHub cards={cards} onOpenGame={(gameId) => setActiveOverlayGame(gameId)} />;
      case 'live': return <RealLiveStream user={user} onClose={() => setCurrentView('home')} />;
      case 'chat': return <CommunicationHub user={user} />;
      case 'category': return <CategorySelect categories={categories} activeCategory={activeCategory} onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} />;
      case 'study':
        return (
            <div className="flex flex-col items-center justify-center h-full w-full relative pb-32">
                {currentCard ? (
                    <BossBattleWrapper isCorrect={battleResult} resetTrigger={battleTrigger}>
                        <StudyCard 
                            card={currentCard} 
                            onResult={(id, known) => {
                                 setBattleResult(known);
                                 setBattleTrigger(prev => prev + 1);
                                 setTimeout(() => {
                                    handleSwipe(known ? 'right' : 'left');
                                    setBattleResult(null);
                                 }, 1000); 
                                 if(known) playSFX('success'); else playSFX('error');
                            }} 
                            speak={speak}
                        />
                    </BossBattleWrapper>
                ) : (
                    <div className="text-center p-10 bg-black/60 border border-cyan-500/50 rounded-2xl backdrop-blur-md">
                        <IconCpu size={64} className="text-cyan-500 mx-auto mb-4 animate-pulse" />
                        <h2 className="text-3xl font-black text-cyan-400 mb-2">MISSION ACCOMPLISHED</h2>
                        <button onClick={() => setCurrentView('home')} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-500 shadow-[0_0_20px_#06b6d4]">BASE</button>
                    </div>
                )}
            </div>
        );
      case 'data': return <DataManager cards={cards} onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} isJunior={isJunior} />;
      case 'leaderboard': return <CyberDeck user={user} stats={stats || { xp: 0, streak: 0, avatar: '👤' }} cards={cards || []} />;
      case 'settings': return <SettingsView user={user} resetProgress={resetProgress} onLogout={handleLogout} />;
      case 'admin': return <AdminDashboard currentUser={user} userData={userData} />;
      default: return <HeroSection onStart={() => setCurrentView('category')} onOpenGame={() => setCurrentView('games')} user={user} />;
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans text-neutral-200 bg-black selection:bg-cyan-500/30 selection:text-cyan-200">
      <DigitalRain />
      
      {activeOverlayGame === 'time_traveler' && (
          <TimeTraveler onClose={() => setActiveOverlayGame(null)} />
      )}

      {showDailyReward && <DailyReward user={user} onClose={() => setShowDailyReward(false)} />}
      
      <AnimatePresence>
        {broadcast && (
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="fixed top-0 w-full bg-red-900/90 border-b border-red-500 text-white text-center py-3 z-[100] font-bold shadow-[0_0_30px_rgba(220,38,38,0.5)] flex justify-center items-center gap-3 backdrop-blur-xl">
                <span className="tracking-widest uppercase text-sm md:text-base">{broadcast}</span>
            </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex flex-col items-center justify-start h-full w-full pt-10 md:pt-0">
           <AnimatePresence mode="wait">
             <motion.div 
                key={currentView} 
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} 
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }} 
                transition={{ duration: 0.3 }} 
                className="w-full h-full flex justify-center"
             >
                {renderContent()}
             </motion.div>
           </AnimatePresence>
      </main>

      <div className="fixed bottom-8 left-0 w-full z-50 flex justify-center pointer-events-none">
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="pointer-events-auto">
              <FloatingDock items={navLinks} />
          </motion.div>
      </div>
    </div>
  );
}