const fs = require('fs');
const path = require('path');

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 تم إنشاء المجلد: ${dir}`);
  }
  fs.writeFileSync(filePath, content.trim());
  console.log(`✅ تم إنشاء الملف: ${filePath}`);
}

console.log("🚀 جاري بدء عملية إعادة الهيكلة الآمنة...");

// 1. إنشاء Contexts
// ---------------------------------------------------------

createFile('context/AuthContext.js', `
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();
const MASTER_EMAIL = "islamaz@bomba.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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

        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
             const data = docSnap.data();
             setUserData(data);
             if (data.isBanned && u.email !== MASTER_EMAIL) {
                auth.signOut();
                window.location.reload();
             }
          }
        });
        return () => unsubDoc();
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isMaster = user?.email === MASTER_EMAIL;
  const isAdmin = userData?.role === 'admin' || userData?.role === 'master' || isMaster;
  const isJunior = userData?.role === 'junior' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, isMaster, isJunior }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
`);

createFile('context/UIContext.js', `
"use client";
import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);

  return (
    <UIContext.Provider value={{ 
        currentView, setCurrentView, 
        activeCategory, setActiveCategory,
        showSupport, setShowSupport,
        activeOverlayGame, setActiveOverlayGame
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
`);

// 2. إنشاء Views (المشاهد) - تم التأكد من نقل كل سطر كود
// ---------------------------------------------------------

createFile('components/views/HeroView.jsx', `
"use client";
import React from 'react';
import { HeroSection } from '../HeroSection';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

export default function HeroView() {
  const { setCurrentView } = useUI();
  const { user, isAdmin } = useAuth();

  return (
    <HeroSection 
      onStart={() => setCurrentView('category')} 
      onOpenGame={() => setCurrentView('games')} 
      user={user} 
      isAdmin={isAdmin}
      onOpenAdmin={() => setCurrentView('admin_panel')}
    />
  );
}
`);

createFile('components/views/AdminView.jsx', `
"use client";
import React from 'react';
import AdminDashboard from '../AdminDashboard';
import { useAuth } from '../../context/AuthContext';

export default function AdminView() {
  const { user, userData } = useAuth();
  return <AdminDashboard currentUser={user} userData={userData} />;
}
`);

createFile('components/views/StudyView.jsx', `
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { IconInfinity, IconCpu } from '@tabler/icons-react';
import { StudyCard } from '../StudyCard';
import { useUI } from '../../context/UIContext';

export default function StudyView({ 
  currentCard, 
  sessionStats, 
  handleSwipe, 
  setSessionStats, 
  playSFX, 
  speak 
}) {
  const { setCurrentView } = useUI();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative pb-32">
        {currentCard ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex flex-col items-center"
            >
                <div className="mb-2 flex items-center gap-2 text-cyan-500/50">
                    <IconInfinity size={20} />
                    <span className="text-xs font-mono tracking-[0.3em]">UNLIMITED_LEARNING_PROTOCOL</span>
                </div>

                <StudyCard 
                    card={currentCard} 
                    sessionStats={sessionStats}
                    onResult={(id, known) => {
                         if (known) {
                            setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
                            playSFX('success');
                         } else {
                            setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
                            playSFX('error');
                         }
                         setTimeout(() => {
                            handleSwipe(known ? 'right' : 'left');
                         }, 300);
                    }} 
                    speak={speak}
                />
            </motion.div>
        ) : (
            <div className="text-center p-10 glass-card-pro rounded-2xl backdrop-blur-md">
                <IconCpu size={64} className="text-cyan-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-black text-cyan-400 mb-2 glitch-text" data-text="ALL DATA PROCESSED">ALL DATA PROCESSED</h2>
                <p className="text-white/50 text-sm mb-6">Neural link synced. No more cards due.</p>
                
                <div className="flex gap-6 justify-center mb-8 text-lg font-mono border border-white/10 p-4 rounded-xl bg-black/40">
                    <div className="text-green-500 font-bold">✓ {sessionStats.correct} Correct</div>
                    <div className="text-red-500 font-bold">✕ {sessionStats.wrong} Wrong</div>
                </div>

                <button onClick={() => setCurrentView('home')} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-500 shadow-[0_0_20px_#06b6d4]">RETURN TO BASE</button>
            </div>
        )}
    </div>
  );
}
`);

createFile('components/views/GamesView.jsx', `
"use client";
import React from 'react';
import GamesHub from '../GamesHub';
import { useUI } from '../../context/UIContext';

export default function GamesView({ cards }) {
  const { setActiveOverlayGame } = useUI();
  return <GamesHub cards={cards} onOpenGame={(gameId) => setActiveOverlayGame(gameId)} />;
}
`);

createFile('components/views/LiveView.jsx', `
"use client";
import React from 'react';
import RealLiveStream from '../live/RealLiveStream';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

export default function LiveView() {
  const { setCurrentView } = useUI();
  const { user } = useAuth();
  return <RealLiveStream user={user} onClose={() => setCurrentView('home')} />;
}
`);

createFile('components/views/DataView.jsx', `
"use client";
import React from 'react';
import { DataManager } from '../DataManager';
import { useAuth } from '../../context/AuthContext';

export default function DataView({ cards, addCard, deleteCard, updateCard }) {
  const { isJunior } = useAuth();
  // نمرر isJunior للتحكم في من يرى زر الإضافة
  return <DataManager cards={cards} onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} isJunior={isJunior} />;
}
`);

createFile('components/views/LeaderboardView.jsx', `
"use client";
import React from 'react';
import CyberDeck from '../CyberDeck';
import { useAuth } from '../../context/AuthContext';

export default function LeaderboardView({ cards, stats }) {
  const { user } = useAuth();
  return <CyberDeck user={user} stats={stats || { xp: 0, streak: 0, avatar: '👤' }} cards={cards || []} />;
}
`);

createFile('components/views/SettingsViewWrapper.jsx', `
"use client";
import React from 'react';
import SettingsView from '../SettingsView';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';

export default function SettingsViewWrapper({ resetProgress }) {
  const { user } = useAuth();
  const handleLogout = () => auth.signOut().then(() => window.location.reload());

  return <SettingsView user={user} resetProgress={resetProgress} onLogout={handleLogout} />;
}
`);

// 3. مدير المشاهد (ViewManager)
// ---------------------------------------------------------

createFile('components/views/ViewManager.jsx', `
"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

// Views Imports
import HeroView from './HeroView';
import AdminView from './AdminView';
import StudyView from './StudyView';
import GamesView from './GamesView';
import LiveView from './LiveView';
import DataView from './DataView';
import LeaderboardView from './LeaderboardView';
import SettingsViewWrapper from './SettingsViewWrapper';

// Components
import { CategorySelect } from '../CategorySelect';
import CommunicationHub from '../CommunicationHub';

export default function ViewManager({ 
  cards, currentCard, sessionStats, setSessionStats, 
  handleSwipe, playSFX, speak, 
  addCard, deleteCard, updateCard, stats, categories, 
  resetProgress 
}) {
  const { currentView, setCurrentView, activeCategory, setActiveCategory } = useUI();
  const { user, isAdmin } = useAuth();

  // تحويل فوري للأدمن
  if (currentView === 'admin_panel' && isAdmin) {
    return <AdminView />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home': return <HeroView />;
      case 'games': return <GamesView cards={cards} />;
      case 'live': return <LiveView />;
      case 'chat': return <CommunicationHub user={user} />;
      
      case 'category': 
        return <CategorySelect 
                  categories={categories} 
                  activeCategory={activeCategory} 
                  onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} 
               />;
      
      case 'study':
        return <StudyView 
                  currentCard={currentCard}
                  sessionStats={sessionStats}
                  handleSwipe={handleSwipe}
                  setSessionStats={setSessionStats}
                  playSFX={playSFX}
                  speak={speak}
               />;

      case 'data': 
        return <DataView cards={cards} addCard={addCard} deleteCard={deleteCard} updateCard={updateCard} />; 
      
      case 'leaderboard': 
        return <LeaderboardView cards={cards} stats={stats} />;
      
      case 'settings': 
        return <SettingsViewWrapper resetProgress={resetProgress} />;
      
      default: return <HeroView />;
    }
  };

  return (
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
  );
}
`);

// 4. صفحة التطبيق الرئيسية (Clean App)
// ---------------------------------------------------------

createFile('app/page.js', `
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
    containerRef.current.style.setProperty("--mouse-x", \`\${x}px\`);
    containerRef.current.style.setProperty("--mouse-y", \`\${y}px\`);
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
`);

console.log("🎉 تمت العملية بنجاح! تم تقسيم المشروع إلى هيكلة احترافية آمنة.");
console.log("👉 ملاحظة: البيانات القديمة محفوظة، فقط طريقة العرض تم تنظيمها.");