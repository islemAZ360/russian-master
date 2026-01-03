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
  const { isJunior, isAdmin } = useAuth(); // استخدام isJunior أو isAdmin

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HeroView onStart={() => setCurrentView('category')} onOpenGame={() => setCurrentView('games')} />;
      
      case 'admin_panel':
        // السماح بالدخول إذا كان المستخدم جونيور أو أدمن
        if (isJunior || isAdmin) {
            return <AdminView />;
        }
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
    <AnimatePresence mode="wait">
      <motion.div key={currentView} {...pageTransition} className="w-full h-full relative">
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
}