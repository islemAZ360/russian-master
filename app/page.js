"use client";
import React, { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// --- UI Components ---
import { FloatingDock } from "@/components/ui/floating-dock";
import { FluidBackground } from "@/components/ui/fluid-background";
import { IntroScreen } from "@/components/IntroScreen";
import { AuthScreen } from "@/components/AuthScreen";

// --- Icons ---
import { 
  IconHome, 
  IconBook, 
  IconChartBar, 
  IconDatabase, 
  IconMap2,          
  IconBuildingStore, 
  IconSkull,
  IconCpu // <-- تمت إضافة الأيقونة هنا
} from "@tabler/icons-react";

// --- Feature Components ---
import { HeroSection } from "@/components/HeroSection";
import { StudyCard } from "@/components/StudyCard";
import { StatsView } from "@/components/StatsView";
import { DataManager } from "@/components/DataManager";

// --- New Features Components ---
import NeuralMap from "@/components/NeuralMap";      
import CyberBase from "@/components/CyberBase";      
import SlangDistrict from "@/components/SlangDistrict"; 
import TechZone from "@/components/TechZone"; // <-- تمت إضافة استدعاء الصفحة الجديدة هنا

// --- Logic Hooks ---
import { useStudySystem } from "@/hooks/useStudySystem";

export default function RussianApp() {
  // 1. حالة المصادقة (Authentication State)
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // 2. حالة التطبيق (App State)
  const [currentView, setCurrentView] = useState("hero");
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // 3. ربط النظام (System Hook)
  const { 
    cards, 
    stats, 
    handleSwipe,  
    addCard, 
    deleteCard, 
    updateCard, 
    buyItem,      
    equipItem,    
    exportData, 
    importData 
  } = useStudySystem(user);

  // مراقبة حالة تسجيل الدخول
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 4. منطق طابور الدراسة (Study Queue Logic)
  const studyQueue = useMemo(() => {
    if (!cards) return [];
    return cards.filter(c => c.level < 5).sort((a, b) => a.reviews - b.reviews);
  }, [cards]);

  // دالة معالجة نتيجة البطاقة (صحيح/خطأ)
  const handleCardResult = (id, known) => {
    const direction = known ? 'right' : 'left';
    handleSwipe(direction); 

    if (currentCardIndex < studyQueue.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCurrentCardIndex(0);
      setCurrentView("stats");
    }
  };

  // 5. قائمة التنقل السفلية (Dock Navigation)
  const navLinks = [
    { 
      title: "Base", 
      icon: <IconHome className="h-full w-full text-neutral-300" />, 
      onClick: () => setCurrentView("hero") 
    },
    { 
      title: "Neural Map", 
      icon: <IconMap2 className="h-full w-full text-cyan-400" />, 
      onClick: () => setCurrentView("neural") 
    },
    { 
      title: "Training", 
      icon: <IconBook className="h-full w-full text-neutral-300" />, 
      onClick: () => setCurrentView("study") 
    },
    { 
      title: "Tech Zone", // <-- الزر الجديد هنا
      icon: <IconCpu className="h-full w-full text-red-500" />, 
      onClick: () => setCurrentView("tech") 
    },
    { 
      title: "Cyber Shop", 
      icon: <IconBuildingStore className="h-full w-full text-yellow-400" />, 
      onClick: () => setCurrentView("shop") 
    },
    { 
      title: "Slang Zone", 
      icon: <IconSkull className="h-full w-full text-red-600" />, 
      onClick: () => setCurrentView("slang") 
    },
    { 
      title: "Stats", 
      icon: <IconChartBar className="h-full w-full text-neutral-300" />, 
      onClick: () => setCurrentView("stats") 
    },
    { 
      title: "Database", 
      icon: <IconDatabase className="h-full w-full text-neutral-300" />, 
      onClick: () => setCurrentView("data") 
    },
  ];

  // 6. إدارة العرض (View Manager)
  const renderContent = () => {
    switch (currentView) {
      case "hero":
        return (
          <HeroSection 
            onStart={() => setCurrentView("study")} 
            onOpenGame={() => setCurrentView("slang")} 
            user={user} 
          />
        );
      
      case "neural":
        return <NeuralMap cards={cards} />;
      
      case "study":
        return (
          <div className="h-screen flex flex-col items-center justify-center pt-10 pb-32 animate-in fade-in duration-700 relative z-10">
             {studyQueue.length > 0 ? (
               <>
                 <StudyCard 
                    card={studyQueue[currentCardIndex]} 
                    onResult={handleCardResult} 
                 />
                 <div className="mt-8 flex flex-col items-center gap-2">
                    <p className="text-neutral-500/80 text-sm bg-black/30 px-4 py-1 rounded-full border border-white/5 font-mono">
                      DATA_PACKET: {currentCardIndex + 1} / {studyQueue.length}
                    </p>
                    <p className="text-[10px] text-cyan-500/50 uppercase tracking-widest">Neural Link Active</p>
                 </div>
               </>
             ) : (
               <div className="text-center p-10 glass-card rounded-2xl border border-white/10 bg-black/50">
                 <h2 className="text-2xl font-bold text-white mb-2">MISSION COMPLETE</h2>
                 <p className="text-white/50 mb-6">No pending data packets for review.</p>
                 <button 
                    onClick={() => setCurrentView("stats")} 
                    className="px-6 py-2 bg-cyan-600 rounded-full text-white font-bold hover:bg-cyan-500 transition-colors"
                 >
                    Check Stats
                 </button>
               </div>
             )}
          </div>
        );
      
      case "tech": // <-- تشغيل الصفحة الجديدة
        return <TechZone />;

      case "shop":
        return (
          <CyberBase 
            user={user} 
            stats={stats} 
            onBuy={buyItem} 
            onEquip={equipItem} 
          />
        );
      
      case "slang":
        return <SlangDistrict stats={stats} />;
      
      case "stats":
        return (
          <div className="h-screen flex items-center justify-center pt-10 pb-32 animate-in fade-in zoom-in duration-500 relative z-10">
            <StatsView cards={cards} stats={stats} />
          </div>
        );
      
      case "data":
        return (
          <div className="h-screen flex items-center justify-center pt-10 pb-32 animate-in slide-in-from-bottom duration-500 relative z-10">
            <DataManager 
              onAdd={addCard} 
              onDelete={deleteCard} 
              onUpdate={updateCard} 
              onExport={exportData} 
              onImport={importData} 
              cards={cards} 
            />
          </div>
        );
      
      default:
        return <HeroSection onStart={() => setCurrentView("study")} user={user} />;
    }
  };

  // 7. شاشة التحميل والمصادقة (Loading & Auth)
  if (loadingAuth) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center text-cyan-500 font-mono animate-pulse">
        INITIALIZING NEURAL LINK...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLoginSuccess={setUser} />;
  }

  // 8. واجهة التطبيق الرئيسية (Main Render)
  return (
    <div className="min-h-screen overflow-hidden font-sans text-white relative bg-[#050505] selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* شاشة البداية */}
      <IntroScreen onFinish={() => setIsIntroDone(true)} />
      
      {/* الخلفية الحية */}
      <FluidBackground />
      
      {/* أنماط CSS إضافية */}
      <style jsx global>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .preserve-3d { transform-style: preserve-3d; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.5); }
        .glass-card { background: rgba(20,20,20,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
      `}</style>

      {/* المحتوى الرئيسي */}
      {isIntroDone && (
          <>
            <main className="w-full h-full relative z-10">
              {renderContent()}
            </main>
            
            {/* شريط التنقل السفلي */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
                <div className="pointer-events-auto">
                   <FloatingDock items={navLinks.map(link => ({ ...link, href: "#" }))} />
                </div>
            </div>
          </>
      )}
    </div>
  );
}