"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// استيراد الهوكس الأساسية
import { useUI } from '@/hooks/useUI';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// استيراد كافة العروض (Views) - تم التأكد من المسارات الصحيحة
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
 * القلب النابض للنظام والمسؤول عن توجيه البيانات وتنسيق الانتقالات البصرية
 */
export default function ViewManager(props) {
  const { currentView, setActiveCategory, activeCategory, setCurrentView } = useUI();
  const { isJunior, isAdmin } = useAuth();
  const { t, dir, isRTL, isLoaded } = useLanguage();

  // --- إعدادات الأنيميشن السينمائي (Motion Variants) ---
  const pageVariants = {
    initial: { 
      opacity: 0, 
      x: isRTL ? -30 : 30, // الحركة تتبع منطق اتجاه اللغة
      filter: "blur(15px)",
      scale: 0.97
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      filter: "blur(0px)",
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 280,
        damping: 28,
        mass: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      x: isRTL ? 30 : -30,
      filter: "blur(15px)",
      scale: 1.03,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  /**
   * وظيفة رندرة المحتوى بناءً على حالة العرض الحالية
   * تضمن تمرير كافة الوظائف المستلمة من Page.js دون أي حذف
   */
  const renderViewContent = () => {
    // 1. انتظار تحميل محرك اللغة لمنع الومضات البرمجية
    if (!isLoaded) return null;

    switch (currentView) {
      case 'home':
        return <HeroView />;

      case 'admin_panel':
        // فحص أمني مزدوج للوصول للوحة الإدارة
        if (isJunior || isAdmin) return <AdminView />;
        return (
            <div className="h-full flex flex-col items-center justify-center text-red-500 font-mono tracking-widest gap-4">
                <span className="text-4xl">⚠️</span>
                <span className="font-black uppercase text-xs">Access_Denied: Unauthorized_Clearance_Level</span>
            </div>
        );

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
        // العودة للقاعدة في حال وجود أي حالة غير معرفة
        return <HeroView />;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center" dir={dir}>
        
        {/* AnimatePresence تضمن خروج الصفحة السابقة تماماً قبل رندرة الجديدة (mode="wait") */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            key={currentView} // المفتاح الذي يراقب التغيير لتشغيل الأنيميشن
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full will-change-transform flex flex-col scroll-smooth"
          >
            {renderViewContent()}
          </motion.div>
        </AnimatePresence>

        {/* ستايلات محلية لضمان ثبات الواجهة أثناء التنقل */}
        <style jsx>{`
            div {
                scrollbar-gutter: stable;
            }
        `}</style>
    </div>
  );
}