"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks الجديدة
import { useUI } from '@/hooks/useUI';
import { useAuth } from '@/hooks/useAuth';

// استيراد الواجهات (Views) من أماكنها الجديدة
import HeroView from './HeroView';
import AdminView from './AdminView';
import StudyView from './StudyView';
import GamesView from './GamesView';
import LiveView from './LiveView';
import DataView from './DataView';
import LeaderboardView from './LeaderboardView';
import SettingsViewWrapper from './SettingsViewWrapper';

// استيراد الميزات (Features)
import CommunicationHub from '@/components/features/chat/CommunicationHub';
import { CategorySelect } from '@/components/features/study/CategorySelect';

export default function ViewManager(props) {
  // استخراج دوال التحكم في الواجهة والصلاحيات
  const { currentView, setActiveCategory, activeCategory, setCurrentView } = useUI();
  const { user, isAdmin } = useAuth();

  // إعدادات الحركة (Animation) عند الانتقال بين الصفحات
  const pageTransition = {
    initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.02, filter: 'blur(10px)' },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  };

  // دالة تحديد المحتوى المعروض
  const renderContent = () => {
    switch (currentView) {
      // 1. الصفحة الرئيسية
      case 'home':
        return (
          <HeroView 
            onStart={() => setCurrentView('category')} 
            onOpenGame={() => setCurrentView('games')} 
            onOpenAdmin={() => setCurrentView('admin_panel')} 
            user={user}
          />
        );

      // 2. لوحة التحكم (محمية للأدمن فقط)
      case 'admin_panel':
        return isAdmin ? <AdminView /> : <HeroView />;

      // 3. الألعاب (تحتاج لبيانات البطاقات)
      case 'games':
        return <GamesView cards={props.cards} />;

      // 4. البث المباشر
      case 'live':
        return <LiveView />;

      // 5. الدردشة
      case 'chat':
        return <CommunicationHub user={user} />;

      // 6. اختيار الأقسام (قبل الدراسة)
      case 'category':
        return (
          <CategorySelect 
            categories={props.categories} 
            activeCategory={activeCategory} 
            onSelect={(cat) => { 
              setActiveCategory(cat); 
              setCurrentView('study'); 
            }} 
          />
        );

      // 7. شاشة الدراسة (الأهم - تحتاج كل البيانات)
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
            addCard={props.addCard}
            categories={props.categories}
          />
        );

      // 8. أرشيف البيانات
      case 'data':
        return (
          <DataView 
            cards={props.cards} 
            addCard={props.addCard} 
            deleteCard={props.deleteCard} 
            updateCard={props.updateCard} 
          />
        );

      // 9. لوحة المتصدرين
      case 'leaderboard':
        return (
          <LeaderboardView 
            cards={props.cards} 
            stats={props.stats} 
          />
        );

      // 10. الإعدادات
      case 'settings':
        return (
          <SettingsViewWrapper 
            resetProgress={props.resetProgress} 
          />
        );

      // الحالة الافتراضية
      default:
        return <HeroView />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={currentView} // المفتاح يضمن إعادة تشغيل الأنيميشن عند تغيير الصفحة
        {...pageTransition}
        className="w-full h-full relative"
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
}