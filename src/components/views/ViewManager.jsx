"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// === استيراد صفحات الأستاذ الجديدة (تمت إضافتها) ===
import TeacherStudents from '@/components/features/teacher/TeacherStudents';
import TeacherProgress from '@/components/features/teacher/TeacherProgress';

/**
 * مدير العروض المركزي (ViewManager)
 * النسخة النهائية: تربط جميع الصفحات ببعضها
 */
export default function ViewManager(props) {
  const { currentView, setActiveCategory, activeCategory, setCurrentView } = useUI();
  const { isJunior, isAdmin, isTeacher, isStudent } = useAuth();
  const { t, dir, isRTL, isLoaded } = useLanguage();

  // إعدادات الحركة (Transitions)
  const pageVariants = {
    initial: { 
      opacity: 0, 
      x: isRTL ? -30 : 30,
      filter: "blur(15px)",
      scale: 0.97
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      filter: "blur(0px)",
      scale: 1,
      transition: { type: "spring", stiffness: 280, damping: 28, mass: 0.5 }
    },
    exit: { 
      opacity: 0, 
      x: isRTL ? 30 : -30,
      filter: "blur(15px)",
      scale: 1.03,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const renderViewContent = () => {
    if (!isLoaded) return null;

    switch (currentView) {
      // --- الصفحة الرئيسية ---
      case 'home':
        return <HeroView />;

      // --- لوحة الأدمن ---
      case 'admin_panel':
        if (isJunior || isAdmin) return <AdminView />;
        return <AccessDenied />;

      // --- صفحات الأستاذ (تم الربط الفعلي الآن) ---
      case 'teacher_db':
        // الأستاذ يستخدم DataView لإضافة محتواه
        if (!isTeacher) return <AccessDenied />;
        return (
          <DataView 
            cards={props.cards} 
            addCard={props.addCard} 
            deleteCard={props.deleteCard} 
            updateCard={props.updateCard} 
            readOnly={false} // الأستاذ يملك صلاحية التعديل
          />
        );

      case 'teacher_students':
        // صفحة إدارة الطلاب
        if (!isTeacher) return <AccessDenied />;
        return <TeacherStudents />;

      case 'teacher_progress':
        // صفحة الإحصائيات
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
        // الأستاذ والأدمن فقط يمكنهم التعديل من هذه الصفحة
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

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center" dir={dir}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full will-change-transform flex flex-col scroll-smooth"
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