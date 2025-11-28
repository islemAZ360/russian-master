"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconHome, 
  IconCpu, 
  IconDatabase, 
  IconTrophy, 
  IconSettings, 
  IconShield, 
  IconLock, 
  IconAlertTriangle, 
  IconServer,
  IconMessageCircle,
  IconRobot // تم إضافة أيقونة الروبوت
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
import { FloatingDock } from '../components/ui/floating-dock';
import DigitalRain from '../components/ui/DigitalRain'; 
import IntroSequence from '../components/IntroSequence'; 
import { BossBattleWrapper } from '../components/BossBattleWrapper'; 
import DailyReward from '../components/DailyReward';
import AITutor from '../components/AITutor'; // --- تم استيراد مكون البوت الجديد ---

// --- المكتبات والخطافات (Hooks) ---
import { useStudySystem } from '../hooks/useStudySystem';
import { useAudio } from '../hooks/useAudio';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export default function RussianApp() {
  // --- تعريف الحالات (State Definition) ---
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState("All");
  const [showIntro, setShowIntro] = useState(true); 
  const [broadcast, setBroadcast] = useState(null);
  const [maintenance, setMaintenance] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // حالات نظام المعركة (Boss Battle)
  const [battleResult, setBattleResult] = useState(null); 
  const [battleTrigger, setBattleTrigger] = useState(0);

  // استدعاء الهوكات الخاصة
  const { 
    cards, 
    currentCard, 
    stats, 
    handleSwipe, 
    resetProgress, 
    loading: loadingData, 
    addCard, 
    deleteCard, 
    updateCard, 
    isAdmin, 
    isBanned 
  } = useStudySystem(user);

  const { speak, playSFX } = useAudio();

  // --- التأثيرات (Effects) ---

  // 1. مراقبة حالة المستخدم (Login/Logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoadingAuth(false);
        if (u) setShowDailyReward(true); 
    });
    return () => unsubscribe();
  }, []);

  // 2. مراقبة النظام (الصيانة + البث المباشر)
  useEffect(() => {
    const unsubBroad = onSnapshot(doc(db, "system", "broadcast"), (d) => {
        setBroadcast(d.exists() && d.data().active ? d.data().message : null);
    });
    const unsubMaint = onSnapshot(doc(db, "system", "status"), (d) => {
        setMaintenance(d.exists() ? d.data().maintenance : false);
    });
    return () => { unsubBroad(); unsubMaint(); };
  }, []);

  // 3. نظام الطرد الأمني (Kick System)
  useEffect(() => {
    if (!user) return;
    const unsubUserDoc = onSnapshot(doc(db, "users", user.uid), async (snapshot) => {
        if (snapshot.exists() && snapshot.data().forceLogout) {
            await auth.signOut();
            await updateDoc(doc(db, "users", user.uid), { forceLogout: false });
            window.location.reload(); 
        }
    });
    return () => unsubUserDoc();
  }, [user]);

  const handleLogout = () => auth.signOut().then(() => window.location.reload());

  // تصفية الفئات (Categories)
  const categories = useMemo(() => {
      if (!cards) return [];
      return [...new Set(cards.map(c => c.category || "General"))];
  }, [cards]);

  // --- منطق العرض (Rendering Logic) ---

  // 1. شاشة الإقلاع (Intro Sequence)
  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;

  // 2. شاشة الصيانة (Maintenance)
  if (maintenance && !isAdmin) return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-orange-500 relative overflow-hidden font-mono">
          <DigitalRain />
          <div className="z-10 text-center bg-black/90 p-12 border border-orange-500/50 rounded-3xl backdrop-blur-xl shadow-[0_0_50px_#ea580c]">
             <IconServer size={100} className="mx-auto mb-6 animate-pulse text-orange-500" />
             <h1 className="text-5xl font-black mb-4 text-white">SYSTEM UPDATING</h1>
             <p className="text-orange-400/80 tracking-[0.2em] uppercase text-sm mb-8">Server connection severed by Admin.</p>
             <div className="w-full h-1 bg-orange-900/30 rounded-full overflow-hidden">
                 <div className="h-full bg-orange-500 w-1/2 animate-[width_2s_ease-in-out_infinite]"></div>
             </div>
          </div>
      </div>
  );

  // 3. شاشة الحظر (Banned)
  if (isBanned) return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-red-500 space-y-6 font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none"></div>
        <IconLock size={80} className="animate-pulse" />
        <h1 className="text-6xl font-black tracking-widest text-center">ACCESS DENIED</h1>
        <p className="text-red-500/50 uppercase tracking-widest text-center">Your neural link has been terminated.</p>
        <button onClick={handleLogout} className="px-8 py-3 bg-red-900/20 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all">
            LOGOUT
        </button>
    </div>
  );

  // 4. شاشة التحميل الأولي
  if (loadingAuth) return <div className="h-screen bg-black text-cyan-500 flex items-center justify-center">LOADING CORE...</div>;

  // 5. شاشة تسجيل الدخول
  if (!user) return <AuthScreen onLoginSuccess={setUser} />;

  // --- بناء القائمة السفلية (Navigation Dock) ---
  let navLinks = [
    { title: "Base", icon: <IconHome className="w-full text-cyan-400" />, onClick: () => setCurrentView('home') },
    // --- الزر الجديد: AI Mentor ---
    { title: "AI Mentor", icon: <IconRobot className="w-full text-pink-500" />, onClick: () => setCurrentView('ai-tutor') },
    
    { title: "Comms", icon: <IconMessageCircle className="w-full text-blue-400" />, onClick: () => setCurrentView('chat') },
    { title: "Missions", icon: <IconCpu className="w-full text-purple-400" />, onClick: () => setCurrentView('category') },
    { title: "Archive", icon: <IconDatabase className="w-full text-emerald-400" />, onClick: () => setCurrentView('data') }, 
    { title: "ID Card", icon: <IconTrophy className="w-full text-yellow-500" />, onClick: () => setCurrentView('leaderboard') },
    { title: "Config", icon: <IconSettings className="w-full text-neutral-400" />, onClick: () => setCurrentView('settings') },
  ];
  
  if (isAdmin) {
      navLinks.push({ title: "GOD MODE", icon: <IconShield className="w-full text-red-500" />, onClick: () => setCurrentView('admin') });
  }

  // --- محول العرض (View Switcher) ---
  const renderContent = () => {
    if (currentView === 'admin' && isAdmin) return <AdminDashboard />;
    if (currentView === 'admin' && !isAdmin) return <HeroSection onStart={() => setCurrentView('category')} user={user} />;

    switch (currentView) {
      case 'home': 
        return <HeroSection onStart={() => setCurrentView('category')} user={user} />;
      
      // --- عرض صفحة البوت ---
      case 'ai-tutor':
        return <AITutor user={user} />;
      
      case 'chat':
        return <CommunicationHub user={user} />;
      
      case 'category': 
        return <CategorySelect categories={categories} activeCategory={activeCategory} onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} />;
      
      case 'study':
        return (
            <div className="flex flex-col items-center justify-center h-full w-full relative">
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
      
      case 'data': 
        return <DataManager cards={cards} onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} />;
      
      case 'leaderboard': 
        return (
            <CyberDeck 
                user={user || { email: 'Guest' }} 
                stats={stats || { xp: 0, streak: 0, avatar: '👤' }} 
                cards={cards || []} 
            />
        );
      
      case 'settings': 
        return (
            <SettingsView 
                resetProgress={resetProgress} 
                onLogout={handleLogout} 
            />
        );
      default: 
        return <HeroSection onStart={() => setCurrentView('category')} user={user} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-neutral-200 bg-black selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. الخلفية الرقمية */}
      <DigitalRain />
      
      {/* 2. صندوق المكافأة */}
      {showDailyReward && <DailyReward user={user} onClose={() => setShowDailyReward(false)} />}

      {/* 3. شريط البث المباشر */}
      <AnimatePresence>
        {broadcast && (
            <motion.div 
                initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} 
                className="fixed top-0 w-full bg-red-900/90 border-b border-red-500 text-white text-center py-3 z-[100] font-bold shadow-[0_0_30px_rgba(220,38,38,0.5)] flex justify-center items-center gap-3 backdrop-blur-xl"
            >
                <IconAlertTriangle className="animate-pulse text-yellow-400" />
                <span className="tracking-widest uppercase text-sm md:text-base">{broadcast}</span>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 4. الحاوية الرئيسية للعرض */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full pt-10 pb-20 md:pt-0">
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

      {/* 5. القائمة العائمة */}
      <div className="fixed bottom-8 left-0 w-full z-50 flex justify-center pointer-events-none">
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="pointer-events-auto">
              <FloatingDock items={navLinks} />
          </motion.div>
      </div>
    </div>
  );
}