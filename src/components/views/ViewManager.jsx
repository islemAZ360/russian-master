"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// استيراد الهوكس الأساسية
import { useUI } from '@/hooks/useUI';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// استيراد العروض (Views)
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
  const { isJunior, isAdmin, isTeacher, isStudent } = useAuth();
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
   */
  const renderViewContent = () => {
    // انتظار تحميل محرك اللغة لمنع الومضات البرمجية
    if (!isLoaded) return null;

    switch (currentView) {
      // 1. الصفحة الرئيسية
      case 'home':
        return <HeroView />;

      // 2. لوحة تحكم الأدمن
      case 'admin_panel':
        if (isJunior || isAdmin) return <AdminView />;
        return <AccessDenied />;

      // 3. واجهات الأستاذ الخاصة
      case 'teacher_db': // صفحة إنشاء قاعدة البيانات للأستاذ
        if (!isTeacher) return <AccessDenied />;
        // الأستاذ يستخدم DataView لكن بصلاحيات كاملة لإضافة الكلمات
        return (
          <DataView 
            cards={props.cards} 
            addCard={props.addCard} 
            deleteCard={props.deleteCard} 
            updateCard={props.updateCard} 
            isTeacherMode={true} // سنستخدم هذا في DataView لاحقاً
          />
        );

      case 'teacher_students': // صفحة إدارة الطلاب
        if (!isTeacher) return <AccessDenied />;
        // سنقوم بإنشاء مكون TeacherStudents لاحقاً، حالياً نعرض رسالة مؤقتة
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-3xl font-black text-cyan-500 mb-4">STUDENT MANAGEMENT</h2>
            <p className="text-white/50 font-mono text-sm">System Module Loading...</p>
            {/* هنا سيتم استبداله بـ <TeacherStudents /> في الخطوات القادمة */}
          </div>
        );

      case 'teacher_progress': // صفحة متابعة التقدم
        if (!isTeacher) return <AccessDenied />;
        // سنقوم بإنشاء مكون TeacherProgress لاحقاً
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-3xl font-black text-yellow-500 mb-4">CLASS PROGRESS</h2>
            <p className="text-white/50 font-mono text-sm">Analytics Module Loading...</p>
            {/* هنا سيتم استبداله بـ <TeacherProgress /> في الخطوات القادمة */}
          </div>
        );

      // 4. الألعاب
      case 'games':
        return <GamesView />;

      // 5. البث المباشر
      case 'live':
        return <LiveView />;

      // 6. الدردشة
      case 'chat':
        return <CommunicationHub />;

      // 7. اختيار التصنيف للدراسة
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

      // 8. وضع الدراسة (البطاقات)
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

      // 9. عرض البيانات (الأرشيف)
      case 'data':
        // الطالب يرى البيانات فقط ولا يعدلها
        // الأستاذ والأدمن يمكنهم التعديل
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

      // 10. السجل والجوائز
      case 'leaderboard':
        return (
          <LeaderboardView 
            cards={props.cards} 
            stats={props.stats} 
          />
        );

      // 11. الإعدادات
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
            div {
                scrollbar-gutter: stable;
            }
        `}</style>
    </div>
  );
}

// مكون بسيط لرفض الوصول
const AccessDenied = () => (
  <div className="h-full flex flex-col items-center justify-center text-red-500 font-mono tracking-widest gap-4 text-center p-4">
      <span className="text-4xl">⚠️</span>
      <span className="font-black uppercase text-xs md:text-sm">Access_Denied: Unauthorized_Clearance_Level</span>
  </div>
);