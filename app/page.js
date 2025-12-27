"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconHome, IconCpu, IconDatabase, IconTrophy, IconSettings, 
  IconShield, IconMessageCircle, IconDeviceGamepad, IconBroadcast, 
  IconInfinity, IconLifebuoy
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
import AdminDashboard from '../components/AdminDashboard'; // اللوحة الجديدة
import GamesHub from '../components/GamesHub';
import { FloatingDock } from '../components/ui/floating-dock';
import DigitalRain from '../components/ui/DigitalRain'; 
import IntroSequence from '../components/IntroSequence'; 
import RealLiveStream from '../components/live/RealLiveStream';
import TimeTraveler from '../components/games/TimeTraveler';
import SupportModal from '../components/SupportModal'; // نافذة الدعم
import { GridBackground } from '../components/ui/GridBackground'; 
import { CyberHUD } from '../components/ui/CyberHUD';

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
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // حالة نافذة الدعم الفني
  const [showSupport, setShowSupport] = useState(false);

  // حالة لتشغيل اللعبة بملء الشاشة
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);

  // --- عداد الجلسة ---
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  const containerRef = useRef(null);

  // استدعاء الهوك المحدث الذي يدعم البيانات الشخصية
  const { 
    cards, currentCard, stats, handleSwipe, resetProgress, 
    addCard, deleteCard, updateCard 
  } = useStudySystem(user);

  const { speak, playSFX } = useAudio();

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  // مراقبة حالة تسجيل الدخول
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (u) {
            setUser(u);
            const userRef = doc(db, "users", u.uid);
            
            // التأكد من وجود وثيقة للمستخدم
            const snap = await getDoc(userRef);
            
            // إذا كان هو الماستر، نمنحه الصلاحية فوراً
            if (u.email === MASTER_EMAIL) {
                if (!snap.exists()) {
                    await setDoc(userRef, { email: u.email, role: 'master', xp: 0, createdAt: new Date().toISOString() });
                } else if (snap.data().role !== 'master') {
                    await updateDoc(userRef, { role: 'master' });
                }
            } else if (!snap.exists()) {
                // مستخدم عادي جديد
                await setDoc(userRef, { email: u.email, role: 'user', xp: 0, createdAt: new Date().toISOString() });
            }

            // الاستماع للتحديثات الحية للمستخدم (للرتب والحظر)
            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    
                    // طرد المستخدم إذا تم حظره
                    if (data.isBanned && u.email !== MASTER_EMAIL) {
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

  // مراقبة البث العام
  useEffect(() => {
    const unsubBroad = onSnapshot(doc(db, "system", "broadcast"), (d) => setBroadcast(d.exists() && d.data().active ? d.data().message : null));
    return () => unsubBroad();
  }, []);

  const handleLogout = () => auth.signOut().then(() => window.location.reload());

  const categories = useMemo(() => {
      if (!cards) return [];
      return [...new Set(cards.map(c => c.category || "General"))];
  }, [cards]);

  // تحديد الصلاحيات
  const isMaster = user?.email === MASTER_EMAIL;
  const isAdmin = userData?.role === 'admin' || userData?.role === 'master' || isMaster;
  const isJunior = userData?.role === 'junior' || isAdmin;
  const isBanned = userData?.isBanned && !isMaster;

  // --- شاشات خاصة ---

  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;

  if (isBanned) return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-red-500 space-y-6 font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none"></div>
        <h1 className="text-6xl font-black tracking-widest text-center glitch-text" data-text="ACCESS DENIED">ACCESS DENIED</h1>
        <p className="text-white/50 tracking-widest uppercase">Your neural link has been severed by the Administrator.</p>
        <button onClick={handleLogout} className="px-8 py-3 border border-red-500 rounded hover:bg-red-900/20 transition-colors z-10">TERMINATE CONNECTION</button>
    </div>
  );

  if (loadingAuth) return <div className="h-screen bg-black text-cyan-500 flex items-center justify-center font-mono animate-pulse">LOADING NEURAL LINK...</div>;
  
  if (!user) return <AuthScreen onLoginSuccess={setUser} />;

  // *** نقطة التحول: إذا كان العرض هو لوحة الأدمن، نخرج من الثيم بالكامل ***
  if (currentView === 'admin_panel' && isAdmin) {
      return <AdminDashboard currentUser={user} userData={userData} />;
  }

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
  
  // زر الدعم الفني للمستخدمين العاديين
  if (!isAdmin) {
      navLinks.push({ title: "Support", icon: <IconLifebuoy className="w-full text-orange-500" />, onClick: () => setShowSupport(true) });
  }

  // --- محتوى التطبيق ---
  const renderContent = () => {
    switch (currentView) {
      case 'home': 
        return <HeroSection 
                  onStart={() => setCurrentView('category')} 
                  onOpenGame={() => setCurrentView('games')} 
                  user={user} 
                  isAdmin={isAdmin}
                  onOpenAdmin={() => setCurrentView('admin_panel')}
               />;
      case 'games': return <GamesHub cards={cards} onOpenGame={(gameId) => setActiveOverlayGame(gameId)} />;
      case 'live': return <RealLiveStream user={user} onClose={() => setCurrentView('home')} />;
      case 'chat': return <CommunicationHub user={user} />;
      case 'category': return <CategorySelect categories={categories} activeCategory={activeCategory} onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} />;
      case 'study':
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
      // هنا DataManager يستخدم الدوال التي تعدل على personal_cards فقط
      case 'data': return <DataManager cards={cards} onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} isJunior={true} />; 
      case 'leaderboard': return <CyberDeck user={user} stats={stats || { xp: 0, streak: 0, avatar: '👤' }} cards={cards || []} />;
      case 'settings': return <SettingsView user={user} resetProgress={resetProgress} onLogout={handleLogout} />;
      default: return <HeroSection onStart={() => setCurrentView('category')} onOpenGame={() => setCurrentView('games')} user={user} />;
    }
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full overflow-hidden font-sans text-neutral-200 bg-black selection:bg-cyan-500/30 selection:text-cyan-200 spotlight-bg"
    >
      <GridBackground /> 
      <CyberHUD /> 
      <div className="crt-overlay"></div>
      <DigitalRain />
      
      {/* نوافذ الألعاب والأدوات العائمة */}
      {activeOverlayGame === 'time_traveler' && <TimeTraveler onClose={() => setActiveOverlayGame(null)} />}
      {showSupport && <SupportModal user={user} onClose={() => setShowSupport(false)} />}
      
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