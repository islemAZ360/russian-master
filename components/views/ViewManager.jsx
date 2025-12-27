"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

// Layouts - الاستيراد من الملف الجديد
import { 
    HubLayout, 
    ArcadeLayout, 
    ArchiveLayout, 
    FocusLayout, 
    CommsLayout,
    HoloDeckLayout,
    ConfigLayout
} from '../layouts/DistinctLayouts';

import TerminalLayout from '../layouts/TerminalLayout'; // الأدمن له ملفه الخاص

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

  // --- VIEW ROUTING & THEME SELECTION ---
  let Content = null;
  let LayoutWrapper = HubLayout; // الافتراضي

  switch (currentView) {
    case 'home':
        Content = <HeroView />;
        LayoutWrapper = HubLayout;
        break;
    
    case 'games':
        Content = <GamesView cards={props.cards} />;
        LayoutWrapper = ArcadeLayout;
        break;

    case 'study':
        Content = <StudyView {...props} />;
        LayoutWrapper = FocusLayout;
        break;

    case 'category':
        Content = <CategorySelect {...props} onSelect={(cat) => { setActiveCategory(cat); setCurrentView('study'); }} />;
        LayoutWrapper = FocusLayout;
        break;

    case 'data':
        Content = <DataView {...props} />;
        LayoutWrapper = ArchiveLayout;
        break;

    case 'leaderboard':
        Content = <LeaderboardView {...props} />;
        LayoutWrapper = HoloDeckLayout; // <--- القالب الجديد للمتصدرين
        break;
    
    case 'chat':
        Content = <CommunicationHub user={props.user} />;
        LayoutWrapper = CommsLayout; // <--- القالب الجديد للشات
        break;

    case 'live':
        Content = <LiveView />;
        LayoutWrapper = CommsLayout; // البث المباشر يستخدم نفس قالب الاتصالات
        break;

    case 'settings':
        Content = <SettingsViewWrapper {...props} />;
        LayoutWrapper = ConfigLayout; // <--- القالب الجديد للإعدادات
        break;

    default:
        Content = <HeroView />;
        LayoutWrapper = HubLayout;
  }

  return (
    <AnimatePresence mode="wait">
        <motion.div 
            key={currentView}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full"
        >
            <LayoutWrapper>
                {Content}
            </LayoutWrapper>
        </motion.div>
    </AnimatePresence>
  );
}