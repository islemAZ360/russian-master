"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconHome, IconCpu, IconDatabase, IconTrophy, IconSettings, 
  IconShield, IconLock, IconAlertTriangle, IconServer,
  IconMessageCircle, IconRobot, IconDeviceGamepad,
  IconMap, IconVideo, IconScript, IconSword, IconRank
} from '@tabler/icons-react';

// --- استيراد المكونات الجديدة ---
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
import { FloatingDock } from '../components/ui/floating-dock';
import DigitalRain from '../components/ui/DigitalRain'; 
import IntroSequence from '../components/IntroSequence'; 
import { BossBattleWrapper } from '../components/BossBattleWrapper'; 
import DailyReward from '../components/DailyReward';

// --- المكونات الجديدة ---
import RussianInvasion from '../components/games/RussianInvasion';
import LiveStream from '../components/live/LiveStream';
import ScenarioEditor from '../components/scenarios/ScenarioEditor';
import RankSystem from '../components/ranks/RankSystem';

// --- المكتبات والخطافات الجديدة ---
import { useStudySystem } from '../hooks/useStudySystem';
import { useSmartSRS } from '../hooks/useSmartSRS'; // الجديد
import { useAudio } from '../hooks/useAudio';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";

const MASTER_EMAIL = "islamaz@bomba.com";

export default function RussianApp() {
  // --- تعريف الحالات الجديدة ---
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState("All");
  const [showIntro, setShowIntro] = useState(true); 
  const [broadcast, setBroadcast] = useState(null);
  const [maintenance, setMaintenance] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userXP, setUserXP] = useState(0);
  const [conqueredCities, setConqueredCities] = useState([]);
  const [scenarios, setScenarios] = useState([]);

  // حالات المعركة
  const [battleResult, setBattleResult] = useState(null); 
  const [battleTrigger, setBattleTrigger] = useState(0);

  // استخدام النظام الذكي الجديد
  const { cards, currentCard, stats, handleSwipe, resetProgress, addCard, deleteCard, updateCard } = useStudySystem(user);
  const { dueCards, updateCard: updateSRS, generateStudyPlan } = useSmartSRS(user?.uid, cards);
  const { speak, playSFX } = useAudio();

  // --- 1. مراقبة المستخدم والبيانات ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (u) {
            setUser(u);
            const userRef = doc(db, "users", u.uid);
            
            // إصلاح صلاحيات السوبر أدمن
            if (u.email === MASTER_EMAIL) {
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                    await setDoc(userRef, { 
                        email: u.email, 
                        role: 'admin', 
                        xp: 0, 
                        createdAt: new Date().toISOString(),
                        conqueredCities: [],
                        scenarios: [],
                        rank: 'recruit'
                    });
                } else if (snap.data().role !== 'admin') {
                    await updateDoc(userRef, { role: 'admin' });
                }
            }

            // مراقبة بيانات المستخدم
            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    setUserXP(data.xp || 0);
                    setConqueredCities(data.conqueredCities || []);
                    setScenarios(data.scenarios || []);
                    
                    if (data.forceLogout) {
                        auth.signOut();
                        window.location.reload();
                    }
                }
            });
            setShowDailyReward(true);
        } else {
            setUser(null);
            setUserData(null);
            setUserXP(0);
        }
        setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. مراقبة حالة النظام ---
  useEffect(() => {
    const unsubBroad = onSnapshot(doc(db, "system", "broadcast"), (d) => 
        setBroadcast(d.exists() && d.data().active ? d.data().message : null)
    );
    const unsubMaint = onSnapshot(doc(db, "system", "status"), (d) => 
        setMaintenance(d.exists() ? d.data().maintenance : false)
    );
    return () => { unsubBroad(); unsubMaint(); };
  }, []);

  const handleLogout = () => auth.signOut().then(() => window.location.reload());

  // معالجة فوز في لعبة الغزو
  const handleCityConquered = async (cityReward) => {
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
        xp: userXP + cityReward.xp,
        conqueredCities: [...conqueredCities, cityReward.id],
        [`inventory.${cityReward.cards[0]}`]: true
    });
    
    playSFX('victory');
  };

  // تصفية الفئات
  const categories = useMemo(() => {
      if (!cards) return [];
      return [...new Set(cards.map(c => c.category || "General"))];
  }, [cards]);

  // --- تحديد الصلاحيات ---
  const isMaster = user?.email === MASTER_EMAIL;
  const isAdmin = userData?.role === 'admin' || isMaster;
  const isJunior = userData?.role === 'junior' || isAdmin;
  const isBanned = userData?.isBanned && !isMaster;

  // --- الشاشات الافتتاحية والتحذيرية ---
  
  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;

  if (maintenance && !isAdmin) return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-orange-500 relative overflow-hidden font-mono">
          <DigitalRain />
          <div className="z-10 text-center bg-black/90 p-12 border border-orange-500/50 rounded-3xl backdrop-blur-xl shadow-[0_0_50px_#ea580c]">
             <IconServer size={100} className="mx-auto mb-6 animate-pulse text-orange-500" />
             <h1 className="text-5xl font-black mb-4 text-white">SYSTEM UPDATING</h1>
             <p className="text-orange-400/80 tracking-[0.2em] uppercase text-sm">Server connection severed by Admin.</p>
          </div>
      </div>
  );

  if (isBanned) return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-red-500 space-y-6 font-mono relative overflow-hidden">
        <IconLock size={80} className="animate-pulse" />
        <h1 className="text-6xl font-black tracking-widest text-center">ACCESS DENIED</h1>
        <p className="text-red-500/50 uppercase tracking-widest">Neural Link Terminated.</p>
        <button onClick={handleLogout} className="px-8 py-3 border border-red-500 rounded hover:bg-red-900/20 transition-colors">LOGOUT</button>
    </div>
  );

  if (loadingAuth) return <div className="h-screen bg-black text-cyan-500 flex items-center justify-center font-mono animate-pulse">LOADING NEURAL LINK...</div>;
  
  if (!user) return <AuthScreen onLoginSuccess={setUser} />;

  // --- إعداد القائمة السفلية الجديدة ---
  let navLinks = [
    { title: "Base", icon: <IconHome className="w-full text-cyan-400" />, onClick: () => setCurrentView('home') },
    { title: "AI Mentor", icon: <IconRobot className="w-full text-pink-500" />, onClick: () => setCurrentView('ai-tutor') },
    { title: "Arcade", icon: <IconDeviceGamepad className="w-full text-green-500" />, onClick: () => setCurrentView('games') },
    { title: "Invasion", icon: <IconSword className="w-full text-red-500" />, onClick: () => setCurrentView('invasion') },
    { title: "Live", icon: <IconVideo className="w-full text-purple-500" />, onClick: () => setCurrentView('live') },
    { title: "Comms", icon: <IconMessageCircle className="w-full text-blue-400" />, onClick: () => setCurrentView('chat') },
    { title: "Rank", icon: <IconRank className="w-full text-yellow-500" />, onClick: () => setCurrentView('rank') },
    { title: "Missions", icon: <IconCpu className="w-full text-purple-400" />, onClick: () => setCurrentView('category') },
    { title: "Archive", icon: <IconDatabase className="w-full text-emerald-400" />, onClick: () => setCurrentView('data') }, 
    { title: "Editor", icon: <IconScript className="w-full text-orange-500" />, onClick: () => setCurrentView('scenario-editor') },
    { title: "Config", icon: <IconSettings className="w-full text-neutral-400" />, onClick: () => setCurrentView('settings') },
  ];
  
  // زر الأدمن
  if (isJunior) {
      navLinks.push({ title: "CONTROL", icon: <IconShield className="w-full text-red-500" />, onClick: () => setCurrentView('admin') });
  }

  // --- محول العرض الجديد ---
  const renderContent = () => {
    if (currentView === 'admin' && !isJunior) {
        return <HeroSection 
            onStart={() => setCurrentView('category')} 
            onOpenGame={() => setCurrentView('games')} 
            user={user} 
        />;
    }

    switch (currentView) {
      case 'home': 
        return <HeroSection 
            onStart={() => setCurrentView('category')} 
            onOpenGame={() => setCurrentView('games')} 
            user={user} 
        />;
      
      case 'ai-tutor':
        return <AITutor user={user} />;
      
      case 'games':
        return <GamesHub cards={cards} />;
      
      case 'invasion':
        return <RussianInvasion 
            cards={cards} 
            user={user} 
            onClose={() => setCurrentView('home')}
            onVictory={handleCityConquered}
        />;
      
      case 'live':
        return <LiveStream 
            user={user} 
            onClose={() => setCurrentView('home')} 
        />;
      
      case 'scenario-editor':
        return <ScenarioEditor />;
      
      case 'rank':
        return <RankSystem 
            userXP={userXP}
            userStats={userData || {}}
            onRankUp={(rank, rewards) => {
                playSFX('levelup');
            }}
        />;
      
      case 'chat':
        return <CommunicationHub user={user} />;
      
      case 'category': 
        return <CategorySelect 
            categories={categories} 
            activeCategory={activeCategory} 
            onSelect={(cat) => { 
                setActiveCategory(cat); 
                setCurrentView('study'); 
            }} 
        />;
      
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
      
      case 'data': 
        return <DataManager 
            cards={cards} 
            onAdd={addCard} 
            onDelete={deleteCard} 
            onUpdate={updateCard} 
            isJunior={isJunior} 
        />;
      
      case 'leaderboard': 
        return <CyberDeck 
            user={user} 
            stats={stats || { xp: userXP, streak: 0, avatar: '👤' }} 
            cards={cards || []} 
        />;
      
      case 'settings': 
        return <SettingsView 
            user={user} 
            resetProgress={resetProgress} 
            onLogout={handleLogout} 
        />;
      
      case 'admin':
        return <AdminDashboard 
            currentUser={user} 
            userData={userData} 
        />;
      
      default: 
        return <HeroSection 
            onStart={() => setCurrentView('category')} 
            onOpenGame={() => setCurrentView('games')} 
            user={user} 
        />;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-neutral-200 bg-black selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. الخلفية الرقمية */}
      <DigitalRain />
      
      {/* 2. النوافذ العائمة */}
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

      {/* 4. الحاوية الرئيسية */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full pt-10 md:pt-0">
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

      {/* 5. القائمة السفلية */}
      <div className="fixed bottom-8 left-0 w-full z-50 flex justify-center pointer-events-none">
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="pointer-events-auto">
              <FloatingDock items={navLinks} />
          </motion.div>
      </div>
    </div>
  );
}