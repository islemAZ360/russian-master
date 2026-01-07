"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconLoader2, IconAlertTriangle, IconHome } from '@tabler/icons-react';

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

// === استيراد صفحات الأستاذ (Recruitment & Analytics) ===
import TeacherStudents from '@/components/features/teacher/TeacherStudents';
import TeacherProgress from '@/components/features/teacher/TeacherProgress';

export default function ViewManager(props) {
  const { currentView, setActiveCategory, activeCategory, setCurrentView } = useUI();
  const { isJunior, isAdmin, isTeacher, isStudent } = useAuth();
  const { dir, isLoaded, t } = useLanguage();

  // إعدادات الحركة (Transitions)
  const pageVariants = {
    initial: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.02, filter: "blur(4px)", transition: { duration: 0.2, ease: "easeIn" } }
  };

  // مكون فرعي لعرض رسالة "ممنوع الدخول"
  const AccessDenied = () => (
    <div className="h-full flex flex-col items-center justify-center text-red-500 font-mono tracking-widest gap-4 text-center p-4">
        <IconAlertTriangle size={64} className="animate-pulse" />
        <h3 className="text-xl font-black uppercase">RESTRICTED_AREA</h3>
        <p className="text-xs text-white/50">Your neural clearance is insufficient for this sector.</p>
        <button 
            onClick={() => setCurrentView('home')}
            className="mt-6 px-6 py-2 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase flex items-center gap-2"
        >
            <IconHome size={16}/> Return to Base
        </button>
    </div>
  );

  // دالة تحديد المحتوى المعروض
  const renderViewContent = () => {
    switch (currentView) {
      // --- الصفحة الرئيسية ---
      case 'home': return <HeroView />;
      
      // --- لوحة التحكم (للأدمن فقط) ---
      case 'admin_panel': return (isJunior || isAdmin) ? <AdminView /> : <AccessDenied />;

      // === واجهات الأستاذ (Teacher Interfaces) ===
      
      case 'teacher_db': // صفحة إنشاء وتعديل المحتوى (Create Content)
        if (!isTeacher) return <AccessDenied />;
        return (
          <DataView 
            cards={props.cards} 
            addCard={props.addCard} 
            deleteCard={props.deleteCard} 
            updateCard={props.updateCard} 
            readOnly={false} // الأستاذ لديه صلاحية التعديل
          />
        );

      case 'teacher_students': // صفحة التجنيد وإدارة الطلاب
        if (!isTeacher) return <AccessDenied />;
        return <TeacherStudents />; 

      case 'teacher_progress': // صفحة التحليلات المتقدمة
        if (!isTeacher) return <AccessDenied />;
        return <TeacherProgress />; 

      // === الواجهات العامة والمشتركة ===

      case 'games': return <GamesView />;
      case 'live': return <LiveView />;
      case 'chat': return <CommunicationHub />;
      
      case 'category': // اختيار الوحدة الدراسية
        return (
          <CategorySelect 
            categories={props.categories} 
            cards={props.cards}
            activeCategory={activeCategory} 
            onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} 
          />
        );

      case 'study': // شاشة الدراسة (Flashcards)
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

      case 'data': // عرض الأرشيف (للطالب قراءة فقط، للآخرين حسب الصلاحية)
        // الطالب يرى المحتوى لكن لا يعدله (readOnly = true)
        // الأستاذ/الأدمن يمكنه التعديل
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

  // شاشة تحميل أولية لمنع الوميض
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
            <IconLoader2 className="animate-spin text-cyan-500" size={48} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500/50 animate-pulse">
                Loading_Modules...
            </span>
        </div>
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
        
        {/* CSS Fixes for Layout */}
        <style jsx global>{`
            /* تحسين التمرير وتثبيت الهامش الجانبي */
            .view-container { 
                scrollbar-gutter: stable; 
            }
        `}</style>
    </div>
  );
}