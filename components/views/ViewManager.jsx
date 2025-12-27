"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

// 1. استيراد الثيمات (العوالم المختلفة لكل صفحة)
// تأكد من أنك قمت بإنشاء ملف PageThemes.jsx كما اتفقنا سابقاً
import { 
  GamesTheme, 
  StudyTheme, 
  AdminTheme, 
  DataTheme, 
  DefaultTheme 
} from '../ui/PageThemes';

// 2. استيراد المشاهد (Views)
import HeroView from './HeroView';
import AdminView from './AdminView';
import StudyView from './StudyView';
import GamesView from './GamesView';
import LiveView from './LiveView';
import DataView from './DataView';
import LeaderboardView from './LeaderboardView';
import SettingsViewWrapper from './SettingsViewWrapper';

// 3. استيراد مكونات إضافية (تستخدم كـ Views مباشرة)
import { CategorySelect } from '../CategorySelect';
import CommunicationHub from '../CommunicationHub';

export default function ViewManager(props) {
  const { currentView, setCurrentView, activeCategory, setActiveCategory } = useUI();
  const { isAdmin } = useAuth();

  // --- منطق توجيه الأدمن ---
  // إذا كان المستخدم أدمن واختار لوحة التحكم، نستخدم ثيم الأدمن الخاص
  if (currentView === 'admin_panel' && isAdmin) {
    return (
        <AdminTheme>
            <AdminView />
        </AdminTheme>
    );
  }

  // --- تحديد المحتوى والثيم بناءً على الصفحة ---
  let Content = null;
  let ThemeWrapper = DefaultTheme; // الثيم الافتراضي (الرئيسي)

  switch (currentView) {
    case 'home':
        Content = <HeroView />;
        ThemeWrapper = DefaultTheme;
        break;
    
    case 'games':
        // نمرر الـ cards للعبة
        Content = <GamesView cards={props.cards} />;
        ThemeWrapper = GamesTheme; // تطبيق ثيم الأركيد/النيون
        break;

    case 'study':
        // نمرر جميع props الخاصة بالدراسة
        Content = <StudyView {...props} />;
        ThemeWrapper = StudyTheme; // تطبيق ثيم التركيز العميق
        break;

    case 'category':
        Content = <CategorySelect 
                    categories={props.categories} 
                    activeCategory={activeCategory} 
                    onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} 
                  />;
        ThemeWrapper = DefaultTheme;
        break;

    case 'data':
        // صفحة البيانات
        Content = <DataView 
                    cards={props.cards} 
                    addCard={props.addCard} 
                    deleteCard={props.deleteCard} 
                    updateCard={props.updateCard} 
                  />;
        ThemeWrapper = DataTheme; // تطبيق ثيم الأرشيف/البيانات
        break;

    case 'leaderboard':
        Content = <LeaderboardView cards={props.cards} stats={props.stats} />;
        ThemeWrapper = DefaultTheme;
        break;
    
    case 'chat':
        Content = <CommunicationHub user={props.user} />;
        ThemeWrapper = DefaultTheme;
        break;

    case 'live':
        Content = <LiveView />;
        ThemeWrapper = DefaultTheme;
        break;

    case 'settings':
        Content = <SettingsViewWrapper resetProgress={props.resetProgress} />;
        ThemeWrapper = DefaultTheme;
        break;

    default:
        Content = <HeroView />;
        ThemeWrapper = DefaultTheme;
  }

  // --- العرض النهائي ---
  return (
    <AnimatePresence mode="wait">
        <motion.div 
            key={currentView}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full"
        >
            {/* تغليف المحتوى بالثيم المحدد */}
            <ThemeWrapper>
                {Content}
            </ThemeWrapper>
        </motion.div>
    </AnimatePresence>
  );
}