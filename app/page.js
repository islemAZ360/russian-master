// FILE: app/page.js
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconHome, IconCpu, IconDatabase, IconTrophy, IconSettings, 
  IconShield, IconMessageCircle, IconRobot, IconDeviceGamepad 
} from '@tabler/icons-react';

// Components
import { HeroSection } from '../components/HeroSection';
import { CategorySelect } from '../components/CategorySelect';
import { StudyCard } from '../components/StudyCard';
import { AuthScreen } from '../components/AuthScreen';
import { DataManager } from '../components/DataManager'; 
import CyberDeck from '../components/CyberDeck'; 
import CommunicationHub from '../components/CommunicationHub'; 
import SettingsView from '../components/SettingsView'; 
import AdminDashboard from '../components/AdminDashboard'; 
import AITutor from '../components/AITutor';
import GamesHub from '../components/GamesHub';
import CommandMenu from '../components/CommandMenu'; // The New Feature
import { FloatingDock } from '../components/ui/floating-dock';
import DigitalRain from '../components/ui/DigitalRain'; 
import IntroSequence from '../components/IntroSequence'; 
import { BossBattleWrapper } from '../components/BossBattleWrapper'; 
import DailyReward from '../components/DailyReward';

// Hooks & Libs
import { useStudySystem } from '../hooks/useStudySystem';
import { useAudio } from '../hooks/useAudio';
import { useSettings } from '../context/SettingsContext';
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
  const [battleResult, setBattleResult] = useState(null); 
  const [battleTrigger, setBattleTrigger] = useState(0);
  const [isCmdOpen, setIsCmdOpen] = useState(false); // Command Palette State

  const { settings } = useSettings();
  const { 
    cards, currentCard, stats, handleSwipe, resetProgress, 
    addCard, deleteCard, updateCard 
  } = useStudySystem(user);
  const { speak, playSFX } = useAudio();

  // ... (نفس منطق Firebase useEffect الموجود سابقاً) ...
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (u) {
            setUser(u);
            const userRef = doc(db, "users", u.uid);
            if (u.email === MASTER_EMAIL) {
                const snap = await getDoc(userRef);
                if (!snap.exists() || snap.data().role !== 'admin') {
                    await setDoc(userRef, { email: u.email, role: 'admin', xp: 0 }, { merge: true });
                }
            }
            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) setUserData(docSnap.data());
                if (docSnap.exists() && docSnap.data().forceLogout) { auth.signOut(); window.location.reload(); }
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

  const handleLogout = () => auth.signOut().then(() => window.location.reload());
  
  const categories = useMemo(() => {
      if (!cards) return [];
      return [...new Set(cards.map(c => c.category || "General"))];
  }, [cards]);

  const isMaster = user?.email === MASTER_EMAIL;
  const isAdmin = userData?.role === 'admin' || isMaster;
  const isJunior = userData?.role === 'junior' || isAdmin;
  const isBanned = userData?.isBanned && !isMaster;

  // Shortcuts Listener for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            setIsCmdOpen(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Views ---
  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;
  if (isBanned) return <div className="h-screen bg-black text-red-500 flex items-center justify-center font-mono text-4xl">ACCESS DENIED</div>;
  if (loadingAuth) return <div className="h-screen bg-black text-cyan-500 flex items-center justify-center font-mono">INITIALIZING...</div>;
  if (!user) return <AuthScreen onLoginSuccess={setUser} />;

  const navLinks = [
    { title: "Base", icon: <IconHome className="w-full text-cyan-400" />, onClick: () => setCurrentView('home') },
    { title: "AI Tutor", icon: <IconRobot className="w-full text-pink-500" />, onClick: () => setCurrentView('ai-tutor') },
    { title: "Arcade", icon: <IconDeviceGamepad className="w-full text-green-500" />, onClick: () => setCurrentView('games') },
    { title: "Comms", icon: <IconMessageCircle className="w-full text-blue-400" />, onClick: () => setCurrentView('chat') },
    { title: "Study", icon: <IconCpu className="w-full text-purple-400" />, onClick: () => setCurrentView('category') },
    { title: "Archive", icon: <IconDatabase className="w-full text-emerald-400" />, onClick: () => setCurrentView('data') }, 
    { title: "ID Card", icon: <IconTrophy className="w-full text-yellow-500" />, onClick: () => setCurrentView('leaderboard') },
    { title: "Config", icon: <IconSettings className="w-full text-neutral-400" />, onClick: () => setCurrentView('settings') },
  ];
  if (isJunior) navLinks.push({ title: "GOD MODE", icon: <IconShield className="w-full text-red-500" />, onClick: () => setCurrentView('admin') });

  const renderContent = () => {
    if (currentView === 'admin' && !isJunior) return <HeroSection onStart={() => setCurrentView('category')} />;
    switch (currentView) {
      case 'home': return <HeroSection onStart={() => setCurrentView('category')} onOpenGame={() => setCurrentView('games')} user={user} />;
      case 'ai-tutor': return <AITutor user={user} />;
      case 'games': return <GamesHub cards={cards} />;
      case 'chat': return <CommunicationHub user={user} />;
      case 'category': return <CategorySelect categories={categories} activeCategory={activeCategory} onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} />;
      case 'study': return (
        <div className="flex flex-col items-center justify-center h-full pb-32">
            {currentCard ? (
                <BossBattleWrapper isCorrect={battleResult} resetTrigger={battleTrigger}>
                    <StudyCard card={currentCard} onResult={(id, known) => {
                         setBattleResult(known); setBattleTrigger(prev => prev + 1);
                         setTimeout(() => { handleSwipe(known ? 'right' : 'left'); setBattleResult(null); }, 1000); 
                         if(known) playSFX('success'); else playSFX('error');
                    }} speak={speak} />
                </BossBattleWrapper>
            ) : (
                <div className="text-center p-10 glass-panel rounded-3xl"><h2 className="text-3xl font-black text-cyan-400 mb-4">MISSION COMPLETE</h2><button onClick={() => setCurrentView('home')} className="px-8 py-3 bg-cyan-600 rounded-full font-bold">RETURN TO BASE</button></div>
            )}
        </div>
      );
      case 'data': return <DataManager cards={cards} onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} isJunior={isJunior} />;
      case 'leaderboard': return <CyberDeck user={user} stats={stats || { xp: 0, streak: 0 }} cards={cards || []} />;
      case 'settings': return <SettingsView user={user} resetProgress={resetProgress} onLogout={handleLogout} />;
      case 'admin': return <AdminDashboard currentUser={user} userData={userData} />;
      default: return <HeroSection onStart={() => setCurrentView('category')} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-neutral-200 bg-[#020617] selection:bg-cyan-500/30">
      {settings.visualEffects && <DigitalRain />}
      {showDailyReward && <DailyReward user={user} onClose={() => setShowDailyReward(false)} />}
      
      <CommandMenu 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        onNavigate={(view) => { setCurrentView(view === 'logout' ? 'home' : view); if(view === 'logout') handleLogout(); }} 
        onAction={() => {}}
      />

      <div className="absolute top-4 right-4 z-50 text-xs text-white/20 font-mono hidden md:block">
          PRESS <kbd className="bg-white/10 px-1 rounded border border-white/20">CTRL</kbd> + <kbd className="bg-white/10 px-1 rounded border border-white/20">K</kbd> FOR COMMANDS
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full pt-10 md:pt-0">
           <AnimatePresence mode="wait">
             <motion.div 
                key={currentView} 
                initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }} 
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
                exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }} 
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