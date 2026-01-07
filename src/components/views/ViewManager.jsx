"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconLoader2 } from '@tabler/icons-react';

// استيراد الهوكس الأساسية
import { useUI } from '@/hooks/useUI';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// استيراد العروض الأساسية (Views)
import HeroView from './HeroView';
import AdminView from './AdminView';
import StudyView from './StudyView';
import GamesView from './GamesView';
import LiveView from './LiveView';
import DataView from './DataView';
import LeaderboardView from './LeaderboardView';
import SettingsViewWrapper from './SettingsViewWrapper';

// استيراد الميزات الفرعية
import CommunicationHub from '@/components/features/chat/CommunicationHub';
import { CategorySelect } from '@/components/features/study/CategorySelect';

// === استيراد صفحات الأستاذ (تأكدنا من المسارات والفصل بينها) ===
import TeacherStudents from '@/components/features/teacher/TeacherStudents';
import TeacherProgress from '@/components/features/teacher/TeacherProgress';

export default function ViewManager(props) {
  const { currentView, setActiveCategory, activeCategory, setCurrentView } = useUI();
  const { isJunior, isAdmin, isTeacher } = useAuth();
  const { dir, isLoaded } = useLanguage();

  // إعدادات الحركة
  const pageVariants = {
    initial: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.02, filter: "blur(4px)", transition: { duration: 0.2, ease: "easeIn" } }
  };

  const renderViewContent = () => {
    switch (currentView) {
      case 'home': return <HeroView />;
      
      case 'admin_panel': return (isJunior || isAdmin) ? <AdminView /> : <AccessDenied />;

      // === صفحات الأستاذ (تم الفصل بشكل صحيح) ===
      
      case 'teacher_db': // صفحة إنشاء المحتوى
        if (!isTeacher) return <AccessDenied />;
        return (
          <DataView 
            cards={props.cards} 
            addCard={props.addCard} 
            deleteCard={props.deleteCard} 
            updateCard={props.updateCard} 
            readOnly={false} 
          />
        );

      case 'teacher_students': // صفحة إدارة الطلاب وإرسال الدعوات
        if (!isTeacher) return <AccessDenied />;
        // هنا كان الخطأ المحتمل: التأكد من استدعاء TeacherStudents وليس Progress
        return <TeacherStudents />; 

      case 'teacher_progress': // صفحة الإحصائيات والتحليلات
        if (!isTeacher) return <AccessDenied />;
        return <TeacherProgress />; 

      case 'games': return <GamesView />;
      case 'live': return <LiveView />;
      case 'chat': return <CommunicationHub />;
      
      case 'category':
        return (
          <CategorySelect 
            categories={props.categories} 
            cards={props.cards}
            activeCategory={activeCategory} 
            onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} 
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
        const canEdit = isTeacher || isAdmin || isJunior;
        return (
          <DataView 
            cards={props.cards} 
            addCard={canEdit ? props.addCard : null} 
            deleteCard={canEdit ? props.deleteCard : null} 
            updateCard={canEdit ? props.updateCard : null} 
            readOnly={!canEdit}
          />
        );

      case 'leaderboard': return <LeaderboardView cards={props.cards} stats={props.stats} />;
      case 'settings': return <SettingsViewWrapper resetProgress={props.resetProgress} />;

      default: return <HeroView />;
    }
  };

  // حل مشكلة الشاشة السوداء/الفارغة عند التنقل
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <IconLoader2 className="animate-spin text-cyan-500" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex flex-col items-center" dir={dir}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col flex-1"
          >
            {renderViewContent()}
          </motion.div>
        </AnimatePresence>
        <style jsx>{`div { scrollbar-gutter: stable; }`}</style>
    </div>
  );
}

const AccessDenied = () => (
  <div className="h-full flex flex-col items-center justify-center text-red-500 font-mono tracking-widest gap-4 text-center p-4">
      <span className="text-4xl">⚠️</span>
      <span className="font-black uppercase text-xs md:text-sm">Access_Denied</span>
  </div>
);