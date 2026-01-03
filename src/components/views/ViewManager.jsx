"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// FIX: استيراد الـ Hooks من مجلد hooks الصحيح
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

// Features
import CommunicationHub from '@/components/features/chat/CommunicationHub';
import { CategorySelect } from '@/components/features/study/CategorySelect';

export default function ViewManager(props) {
  const { currentView, setActiveCategory, activeCategory, setCurrentView } = useUI();
  const { isAdmin } = useAuth();

  const pageTransition = {
    initial: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HeroView onStart={() => setCurrentView('category')} onOpenGame={() => setCurrentView('games')} onOpenAdmin={() => setCurrentView('admin_panel')} />;
      case 'admin_panel':
        return isAdmin ? <AdminView /> : <HeroView />;
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
    <AnimatePresence mode="wait">
      <motion.div key={currentView} {...pageTransition} className="w-full h-full relative">
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
}