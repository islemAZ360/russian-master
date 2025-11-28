"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconHome, IconCpu, IconDatabase, IconTrophy, IconSettings, 
  IconShield, IconLock, IconAlertTriangle, IconServer,
  IconMessageCircle, IconRobot 
} from '@tabler/icons-react';

// --- Components ---
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
import HackingGame from '../components/HackingGame'; // استيراد اللعبة
import { FloatingDock } from '../components/ui/floating-dock';
import DigitalRain from '../components/ui/DigitalRain'; 
import IntroSequence from '../components/IntroSequence'; 
import { BossBattleWrapper } from '../components/BossBattleWrapper'; 
import DailyReward from '../components/DailyReward';

// --- Hooks & Libs ---
import { useStudySystem } from '../hooks/useStudySystem';
import { useAudio } from '../hooks/useAudio';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";

// الإيميل الرئيسي (السوبر أدمن) - سيحصل على الصلاحيات دائماً
const MASTER_EMAIL = "islamaz@bomba.com";

export default function RussianApp() {
  // --- الحالات (States) ---
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState("All");
  const [showIntro, setShowIntro] = useState(true); 
  const [broadcast, setBroadcast] = useState(null);
  const [maintenance, setMaintenance] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // حالة اللعبة (جديد)
  const [showGame, setShowGame] = useState(false); 

  // حالات المعركة في الدراسة
  const [battleResult, setBattleResult] = useState(null); 
  const [battleTrigger, setBattleTrigger] = useState(0);

  // استدعاء الهوكات
  const { 
    cards, currentCard, stats, handleSwipe, resetProgress, 
    addCard, deleteCard, updateCard 
  } = useStudySystem(user);

  const { speak, playSFX } = useAudio();

  // --- 1. مراقبة الدخول وتصحيح الأدمن ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (u) {
            setUser(u);
            const userRef = doc(db, "users", u.uid);
            
            // إصلاح صلاحيات السوبر أدمن تلقائياً عند الدخول
            if (u.email === MASTER_EMAIL) {
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                    // إنشاء حساب أدمن إذا لم يكن موجوداً
                    await setDoc(userRef, { email: u.email, role: 'admin', xp: 0, createdAt: new Date().toISOString() });
                } else if (snap.data().role !== 'admin') {
                    // ترقية قسرية إذا لم يكن أدمن
                    await updateDoc(userRef, { role: 'admin' });
                }
            }

            // مراقبة بيانات المستخدم الحية
            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                    // التحقق من الطرد القسري
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

  // --- 2. مراقبة حالة النظام والبث ---
  useEffect(() => {
    const unsubBroad = onSnapshot(doc(db, "system", "broadcast"), (d) => setBroadcast(d.exists() && d.data().active ? d.data().message : null));
    const unsubMaint = onSnapshot(doc(db, "system", "status"), (d) => setMaintenance(d.exists() ? d.data().maintenance : false));
    return () => { unsubBroad(); unsubMaint(); };
  }, []);

  const handleLogout = () => auth.signOut().then(() => window.location.reload());

  const categories = useMemo(() => {
      if (!cards) return [];
      return [...new Set(cards.map(c => c.category || "General"))];
  }, [cards]);

  // --- تعريف الصلاحيات ---
  const isMaster = user?.email === MASTER_EMAIL;
  const isAdmin = userData?.role === 'admin' || isMaster;
  const isJunior = userData?.role === 'junior' || isAdmin;
  const isBanned = userData?.isBanned && !isMaster; // السوبر أدمن لا يمكن حظره

  // --- الشاشات الأولية والتحذيرية ---
  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;

  if (maintenance && !isAdmin) return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-orange-500 relative overflow-hidden font-mono">
          <DigitalRain />
          <div className="z-10 text-center bg-black/90 p-12 border border-orange-500/50 rounded-3xl backdrop-blur-xl">
             <IconServer size={100} className="mx-auto mb-6 animate-pulse" />
             <h1 className="text-5xl font-black mb-4 text-white">SYSTEM UPDATING</h1>
             <p>MAINTENANCE MODE ACTIVE</p>
          </div>
      </div>
  );

  if (isBanned) return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-red-500 space-y-6 font-mono">
        <IconLock size={80} className="animate-pulse" />
        <h1 className="text-6xl font-black">ACCESS DENIED</h1>
        <button onClick={handleLogout} className="px-8 py-3 border border-red-500 rounded">LOGOUT</button>
    </div>
  );

  if (loadingAuth) return <div className="h-screen bg-black text-cyan-500 flex items-center justify-center">LOADING NEURAL LINK...</div>;
  if (!user) return <AuthScreen onLoginSuccess={setUser} />;

  // --- إعداد القائمة السفلية ---
  let navLinks = [
    { title: "Base", icon: <IconHome className="w-full text-cyan-400" />, onClick: () => { setCurrentView('home'); setShowGame(false); } },
    { title: "AI Mentor", icon: <IconRobot className="w-full text-pink-500" />, onClick: () => { setCurrentView('ai-tutor'); setShowGame(false); } },
    { title: "Comms", icon: <IconMessageCircle className="w-full text-blue-400" />, onClick: () => { setCurrentView('chat'); setShowGame(false); } },
    { title: "Missions", icon: <IconCpu className="w-full text-purple-400" />, onClick: () => { setCurrentView('category'); setShowGame(false); } },
    { title: "Archive", icon: <IconDatabase className="w-full text-emerald-400" />, onClick: () => { setCurrentView('data'); setShowGame(false); } }, 
    { title: "ID Card", icon: <IconTrophy className="w-full text-yellow-500" />, onClick: () => { setCurrentView('leaderboard'); setShowGame(false); } },
    { title: "Config", icon: <IconSettings className="w-full text-neutral-400" />, onClick: () => { setCurrentView('settings'); setShowGame(false); } },
  ];
  
  // إضافة زر الأدمن إذا كان يملك الصلاحية
  if (isJunior) {
      navLinks.push({ title: "CONTROL", icon: <IconShield className="w-full text-red-500" />, onClick: () => { setCurrentView('admin'); setShowGame(false); } });
  }

  // --- محول العرض (Router) ---
  const renderContent = () => {
    // 1. عرض اللعبة إذا كانت مفعلة
    if (showGame) return <HackingGame cards={cards} onClose={() => setShowGame(false)} />;

    // 2. حماية صفحة الأدمن
    if (currentView === 'admin' && !isJunior) return <HeroSection onStart={() => setCurrentView('category')} onOpenGame={() => setShowGame(true)} user={user} />;

    // 3. باقي الصفحات
    switch (currentView) {
      case 'home': 
        // تمرير دالة فتح اللعبة إلى HeroSection
        return <HeroSection onStart={() => setCurrentView('category')} onOpenGame={() => setShowGame(true)} user={user} />;
      
      case 'ai-tutor': return <AITutor user={user} />;
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
                        <button onClick={() => setCurrentView('home')} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-full">BASE</button>
                    </div>
                )}
            </div>
        );
      
      case 'data': 
        return <DataManager cards={cards} onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} isJunior={isJunior} />;
      
      case 'leaderboard': 
        return <CyberDeck user={user} stats={stats || { xp: 0, streak: 0, avatar: '👤' }} cards={cards || []} />;
      
      case 'settings': 
        return <SettingsView user={user} resetProgress={resetProgress} onLogout={handleLogout} />;
      
      case 'admin':
        return <AdminDashboard currentUser={user} userData={userData} />;
      
      default: return <HeroSection onStart={() => setCurrentView('category')} onOpenGame={() => setShowGame(true)} user={user} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-neutral-200 bg-black selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* المؤثرات الخلفية */}
      <DigitalRain />
      
      {/* النوافذ المنبثقة */}
      {showDailyReward && <DailyReward user={user} onClose={() => setShowDailyReward(false)} />}
      <AnimatePresence>
        {broadcast && (
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="fixed top-0 w-full bg-red-900/90 text-white text-center py-3 z-[100] font-bold border-b border-red-500 backdrop-blur">
                <IconAlertTriangle className="inline mr-2" /> {broadcast}
            </motion.div>
        )}
      </AnimatePresence>

      {/* منطقة المحتوى الرئيسية */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full pt-10 md:pt-0">
           <AnimatePresence mode="wait">
             <motion.div 
                key={currentView + showGame} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.05 }} 
                className="w-full h-full flex justify-center"
             >
                {renderContent()}
             </motion.div>
           </AnimatePresence>
      </main>

      {/* القائمة السفلية العائمة */}
      <div className="fixed bottom-8 left-0 w-full z-50 flex justify-center pointer-events-none">
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="pointer-events-auto">
              <FloatingDock items={navLinks} />
          </motion.div>
      </div>
    </div>
  );
}