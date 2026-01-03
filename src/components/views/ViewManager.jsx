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

  // تبسيط الحركة لمنع اختفاء المحتوى
  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
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
        return <DataView cards={props.cards} addCard={props.addCard} deleteCard={props.deleteCard} updateCard={props.updateCard} />;
      case 'leaderboard':
        return <LeaderboardView cards={props.cards} stats={props.stats} />;
      case 'settings':
        return <SettingsViewWrapper resetProgress={props.resetProgress} />;
      default:
        return <HeroView />;
    }
  };

  return (
    // إزالة mode='wait' هو الحل السحري لمشكلة اختفاء الصفحة
    <AnimatePresence>
      <motion.div 
        key={currentView}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }} // سرعة انتقال عالية
        className="w-full h-full relative"
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
}