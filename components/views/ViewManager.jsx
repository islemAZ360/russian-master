"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

// Views Imports
import HeroView from './HeroView';
import AdminView from './AdminView';
import StudyView from './StudyView';
import GamesView from './GamesView';
import LiveView from './LiveView';
import DataView from './DataView';
import LeaderboardView from './LeaderboardView';
import SettingsViewWrapper from './SettingsViewWrapper';

// Components
import { CategorySelect } from '../CategorySelect';
import CommunicationHub from '../CommunicationHub';

export default function ViewManager({ 
  cards, currentCard, sessionStats, setSessionStats, 
  handleSwipe, playSFX, speak, 
  addCard, deleteCard, updateCard, stats, categories, 
  resetProgress 
}) {
  const { currentView, setCurrentView, activeCategory, setActiveCategory } = useUI();
  const { user, isAdmin } = useAuth();

  // تحويل فوري للأدمن
  if (currentView === 'admin_panel' && isAdmin) {
    return <AdminView />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home': return <HeroView />;
      case 'games': return <GamesView cards={cards} />;
      case 'live': return <LiveView />;
      case 'chat': return <CommunicationHub user={user} />;
      
      case 'category': 
        return <CategorySelect 
                  categories={categories} 
                  activeCategory={activeCategory} 
                  onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} 
               />;
      
      case 'study':
        return <StudyView 
                  currentCard={currentCard}
                  sessionStats={sessionStats}
                  handleSwipe={handleSwipe}
                  setSessionStats={setSessionStats}
                  playSFX={playSFX}
                  speak={speak}
               />;

      case 'data': 
        return <DataView cards={cards} addCard={addCard} deleteCard={deleteCard} updateCard={updateCard} />; 
      
      case 'leaderboard': 
        return <LeaderboardView cards={cards} stats={stats} />;
      
      case 'settings': 
        return <SettingsViewWrapper resetProgress={resetProgress} />;
      
      default: return <HeroView />;
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