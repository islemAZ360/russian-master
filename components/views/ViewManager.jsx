"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// استيراد جميع الشاشات هنا
import { HeroSection } from '../HeroSection';
import { CategorySelect } from '../CategorySelect';
import { StudyCard } from '../StudyCard';
import { DataManager } from '../DataManager'; 
import CyberDeck from '../CyberDeck'; 
import CommunicationHub from '../CommunicationHub'; 
import SettingsView from '../SettingsView'; 
import AdminDashboard from '../AdminDashboard'; 
import GamesHub from '../GamesHub';
import RealLiveStream from '../live/RealLiveStream';
import { IconCpu, IconInfinity } from '@tabler/icons-react';

export default function ViewManager({ 
  currentView, 
  setCurrentView, 
  user, 
  userData,
  isAdmin, 
  // props للدراسة
  cards,
  currentCard,
  sessionStats,
  setSessionStats,
  handleSwipe,
  playSFX,
  speak,
  // props للبيانات
  addCard,
  deleteCard,
  updateCard,
  stats,
  categories,
  activeCategory,
  setActiveCategory,
  // props للأدمن
  handleLogout,
  resetProgress,
  onOpenGame,
  setShowSupport
}) {

  // إذا كان أدمن وفي وضع اللوحة، اعرض لوحة الأدمن فوراً (بدون أنيميشن الثيم)
  if (currentView === 'admin_panel' && isAdmin) {
      return <AdminDashboard currentUser={user} userData={userData} />;
  }

  // محتوى الشاشات العادية
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
      
      case 'games': 
        return <GamesHub cards={cards} onOpenGame={onOpenGame} />;
      
      case 'live': 
        return <RealLiveStream user={user} onClose={() => setCurrentView('home')} />;
      
      case 'chat': 
        return <CommunicationHub user={user} />;
      
      case 'category': 
        return <CategorySelect 
                  categories={categories} 
                  activeCategory={activeCategory} 
                  onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} 
               />;
      
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

      case 'data': 
        return <DataManager cards={cards} onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} isJunior={true} />; 
      
      case 'leaderboard': 
        return <CyberDeck user={user} stats={stats || { xp: 0, streak: 0, avatar: '👤' }} cards={cards || []} />;
      
      case 'settings': 
        return <SettingsView user={user} resetProgress={resetProgress} onLogout={handleLogout} />;
      
      default: 
        return <HeroSection onStart={() => setCurrentView('category')} onOpenGame={() => setCurrentView('games')} user={user} />;
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