"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useUI } from '@/hooks/useUI';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// استيراد كافة العروض (Views)
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

/**
 * مدير العروض المركزي (ViewManager)
 * المسؤول عن التنقل السلس بين وحدات النظام مع دعم كامل للترجمة والأنيميشن
 */
export default function ViewManager(props) {
  const { currentView, setActiveCategory, activeCategory, setCurrentView } = useUI();
  const { isJunior, isAdmin } = useAuth();
  const { dir, isRTL, isLoaded } = useLanguage();

  // --- إعدادات الأنيميشن الاحترافية (Cinematic Layering) ---
  const variants = {
    initial: { 
      opacity: 0, 
      x: isRTL ? -20 : 20, // الحركة تأتي حسب اتجاه اللغة
      filter: "blur(12px)",
      scale: 0.98
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      filter: "blur(0px)",
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      x: isRTL ? 20 : -20,
      filter: "blur(12px)",
      scale: 1.02,
      transition: {
        duration: 0.3
      }
    }
  };

  /**
   * دالة رندرة المحتوى بناءً على العرض الحالي
   * تضمن تمرير كافة الوظائف السابقة دون حذف أي منها
   */
  const renderContent = () => {
    // نمنع الرندرة حتى يتم تحميل محرك اللغة لمنع ظهور الرموز (Keys)
    if (!isLoaded) return null;

    switch (currentView) {
      case 'home':
        return <HeroView />;
      
      case 'admin_panel':
        // حماية أمنية: الأدمن فقط من يمكنه رؤية هذه اللوحة
        if (isJunior || isAdmin) return <AdminView />;
        return <div className="h-full flex items-center justify-center font-mono text-red-500">ACCESS_DENIED: UNAUTHORIZED_ENTRY</div>;
      
      case 'games':
        return <GamesView />;
      
      case 'live':
        return <LiveView />;
      
      case 'chat':
        return <CommunicationHub />;
      
      case 'category':
        return (
          <CategorySelect 
            categories={props.categories} 
            cards={props.cards}
            activeCategory={activeCategory} 
            onSelect={(cat) => { 
                setActiveCategory(cat); 
                setCurrentView('study'); 
            }} 
          />
        );
      
      case 'study':
        return (
          <StudyView 
            cards={props.cards} 
            currentCard={props.currentCard} 
            sessionStats={props.sessionStats} 
            setSessionStats={props.setSessionStats} 
            handleSwipe={props.handleSwipe} 
            playSFX={props.playSFX} 
            speak={props.speak} 
          />
        );
      
      case 'data':
        return (
          <DataView 
            cards={props.cards} 
            addCard={props.addCard} 
            deleteCard={props.deleteCard} 
            updateCard={props.updateCard} 
          />
        );
      
      case 'leaderboard':
        return (
          <LeaderboardView 
            cards={props.cards} 
            stats={props.stats} 
          />
        );
      
      case 'settings':
        return (
          <SettingsViewWrapper 
            resetProgress={props.resetProgress} 
          />
        );

      default:
        return <HeroView />;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center">
        {/* AnimatePresence تضمن خروج العرض القديم بنعومة قبل دخول الجديد */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            key={currentView}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full will-change-transform flex flex-col"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
    </div>
  );
}