"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconLoader2 } from '@tabler/icons-react'; // أيقونة للتحميل

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

// === استيراد صفحات الأستاذ الجديدة ===
import TeacherStudents from '@/components/features/teacher/TeacherStudents';
import TeacherProgress from '@/components/features/teacher/TeacherProgress';

/**
 * مدير العروض المركزي (ViewManager)
 * تم إصلاح مشكلة اختفاء المحتوى عند التنقل
 */
export default function ViewManager(props) {
  const { currentView, setActiveCategory, activeCategory, setCurrentView } = useUI();
  const { isJunior, isAdmin, isTeacher, isStudent } = useAuth();
  const { t, dir, isRTL, isLoaded } = useLanguage();

  // إعدادات الحركة (Transitions) - تم تبسيطها لمنع التعليق
  const pageVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.98,
      filter: "blur(4px)"
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      filter: "blur(0px)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 1.02,
      filter: "blur(4px)",
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  // دالة عرض المحتوى بناءً على الحالة
  const renderViewContent = () => {
    switch (currentView) {
      // --- الصفحة الرئيسية ---
      case 'home':
        return <HeroView />;

      // --- لوحة الأدمن ---
      case 'admin_panel':
        if (isJunior || isAdmin) return <AdminView />;
        return <AccessDenied />;

      // --- صفحات الأستاذ ---
      case 'teacher_db':
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

      case 'teacher_students':
        if (!isTeacher) return <AccessDenied />;
        return <TeacherStudents />;

      case 'teacher_progress':
        if (!isTeacher) return <AccessDenied />;
        return <TeacherProgress />;

      // --- الألعاب ---
      case 'games':
        return <GamesView />;

      // --- البث المباشر ---
      case 'live':
        return <LiveView />;

      // --- الدردشة ---
      case 'chat':
        return <CommunicationHub />;

      // --- الدراسة (اختيار التصنيف) ---
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

      // --- الدراسة (البطاقات) ---
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

      // --- الأرشيف (Data View) ---
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

      // --- السجل والترتيب ---
      case 'leaderboard':
        return (
          <LeaderboardView 
            cards={props.cards} 
            stats={props.stats} 
          />
        );

      // --- الإعدادات ---
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

  // FIX: إذا لم يتم تحميل الإعدادات بعد، نعرض شاشة تحميل بدلاً من null لتجنب اختفاء الواجهة
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <IconLoader2 className="animate-spin text-cyan-500" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex flex-col items-center" dir={dir}>
        {/* استخدام mode="wait" يضمن خروج الصفحة القديمة قبل دخول الجديدة */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col flex-1" // flex-1 يضمن ملء المساحة
          >
            {renderViewContent()}
          </motion.div>
        </AnimatePresence>

        <style jsx>{`
            div { scrollbar-gutter: stable; }
        `}</style>
    </div>
  );
}

const AccessDenied = () => (
  <div className="h-full flex flex-col items-center justify-center text-red-500 font-mono tracking-widest gap-4 text-center p-4">
      <span className="text-4xl">⚠️</span>
      <span className="font-black uppercase text-xs md:text-sm">Access_Denied: Unauthorized_Clearance_Level</span>
  </div>
);