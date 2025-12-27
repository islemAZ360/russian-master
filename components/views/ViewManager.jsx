"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

// Layouts - الاستيراد من الملف الجديد
import { HubLayout, ArcadeLayout, ArchiveLayout, FocusLayout } from '../layouts/DistinctLayouts';
import TerminalLayout from '../layouts/TerminalLayout'; // الأدمن له ملفه الخاص كما اتفقنا

// Views
import HeroView from './HeroView';
import AdminView from './AdminView';
import StudyView from './StudyView';
import GamesView from './GamesView';
import LiveView from './LiveView';
import DataView from './DataView';
import LeaderboardView from './LeaderboardView';
import SettingsViewWrapper from './SettingsViewWrapper';
import { CategorySelect } from '../CategorySelect';
import CommunicationHub from '../CommunicationHub';

export default function ViewManager(props) {
  const { currentView, setCurrentView, activeCategory, setActiveCategory } = useUI();
  const { isAdmin } = useAuth();

  // --- ADMIN OVERRIDE ---
  if (currentView === 'admin_panel' && isAdmin) {
    return (
        <TerminalLayout onExit={() => window.location.reload()}>
            <AdminView />
        </TerminalLayout>
    );
  }

  // --- VIEW ROUTING ---
  let Content = null;
  let LayoutWrapper = HubLayout; // الافتراضي هو الهب

  switch (currentView) {
    case 'home':
        Content = <HeroView />;
        LayoutWrapper = HubLayout;
        break;
    
    case 'games':
        Content = <GamesView cards={props.cards} />; // تم استخدام المكون المحدث
        LayoutWrapper = ArcadeLayout; // <--- لاحظ تغيير القالب
        break;

    case 'study':
        Content = <StudyView {...props} />;
        LayoutWrapper = FocusLayout; // <--- قالب التركيز
        break;

    case 'category':
        Content = <CategorySelect {...props} onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} />;
        LayoutWrapper = FocusLayout; // اختيار الفئة جزء من الدراسة
        break;

    case 'data':
        Content = <DataView {...props} />;
        LayoutWrapper = ArchiveLayout; // <--- قالب الأرشيف
        break;

    case 'leaderboard':
        Content = <LeaderboardView {...props} />;
        LayoutWrapper = HubLayout;
        break;
    
    case 'chat':
        Content = <CommunicationHub user={props.user} />;
        LayoutWrapper = HubLayout; // الشات يناسبه الهب
        break;

    case 'live':
        Content = <LiveView />;
        LayoutWrapper = HubLayout;
        break;

    case 'settings':
        Content = <SettingsViewWrapper {...props} />;
        LayoutWrapper = ArchiveLayout; // الإعدادات تناسب الأرشيف
        break;

    default:
        Content = <HeroView />;
        LayoutWrapper = HubLayout;
  }

  return (
    <AnimatePresence mode="wait">
        <motion.div 
            key={currentView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
        >
            <LayoutWrapper>
                {Content}
            </LayoutWrapper>
        </motion.div>
    </AnimatePresence>
  );
}