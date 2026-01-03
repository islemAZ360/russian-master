"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useUI } from '@/hooks/useUI';
import { useAuth } from '@/hooks/useAuth';

// Views
import HeroView from './HeroView';
import AdminView from './AdminView';
import StudyView from './StudyView';
import GamesView from './GamesView';
import LiveView from './LiveView';
import DataView from './DataView';
import LeaderboardView from './LeaderboardView';
import SettingsViewWrapper from './SettingsViewWrapper';

import CommunicationHub from '@/components/features/chat/CommunicationHub';
import { CategorySelect } from '@/components/features/study/CategorySelect';

export default function ViewManager(props) {
  const { currentView, setActiveCategory, activeCategory, setCurrentView } = useUI();
  const { isJunior, isAdmin } = useAuth();

  // --- إعدادات الأنيميشن الاحترافي (Cinematic Blur) ---
  const variants = {
    initial: { 
      opacity: 0, 
      scale: 0.98,        // تبدأ أصغر قليلاً
      filter: "blur(10px)", // ضبابية قوية في البداية
      y: 10               // تأتي من الأسفل قليلاً
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      filter: "blur(0px)", // تصبح واضحة
      y: 0 
    },
    exit: { 
      opacity: 0, 
      scale: 1.02,        // تكبر قليلاً عند الخروج
      filter: "blur(10px)", // تعود للضبابية
      y: -10              // تخرج للأعلى قليلاً
    }
  };

  const transitionSettings = {
    type: "spring",
    stiffness: 300,  // سرعة الحركة
    damping: 25,     // نعومة التوقف
    mass: 0.5,       // خفة العنصر
    duration: 0.3
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HeroView onStart={() => setCurrentView('category')} onOpenGame={() => setCurrentView('games')} />;
      case 'admin_panel':
        if (isJunior || isAdmin) return <AdminView />;
        return <div className="text-center p-10 text-red-500 font-bold">Access Denied</div>;
      case 'games':
        return <GamesView cards={props.cards} />;
      case 'live':
        return <LiveView />;
      case 'chat':
        return <CommunicationHub />;
      case 'category':
        return <CategorySelect categories={props.categories} activeCategory={activeCategory} onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} />;
      case 'study':
        return <StudyView cards={props.cards} currentCard={props.currentCard} sessionStats={props.sessionStats} setSessionStats={props.setSessionStats} handleSwipe={props.handleSwipe} playSFX={props.playSFX} speak={props.speak} addCard={props.addCard} categories={props.categories} />;
      case 'data':
        return <DataView cards={props.cards} addCard={props.addCard} deleteCard={props.deleteCard} updateCard={props.updateCard} isJunior={isJunior} />;
      case 'leaderboard':
        return <LeaderboardView cards={props.cards} stats={props.stats} />;
      case 'settings':
        return <SettingsViewWrapper resetProgress={props.resetProgress} />;
      default:
        return <HeroView />;
    }
  };

  return (
    // mode="wait" يضمن خروج الصفحة القديمة تماماً قبل دخول الجديدة لمنع التداخل
    <AnimatePresence mode="wait">
      <motion.div 
        key={currentView}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitionSettings}
        className="w-full h-full relative will-change-transform" // تحسين الأداء
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
}