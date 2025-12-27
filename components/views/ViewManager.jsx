"use client";
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

// Themes
import { GamesTheme, StudyTheme, AdminTheme, DataTheme, DefaultTheme } from '../ui/PageThemes';

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
  const { currentView } = useUI();
  const { isAdmin } = useAuth();

  // تحويل فوري للأدمن
  if (currentView === 'admin_panel' && isAdmin) {
    return (
        <AdminTheme>
            <AdminView />
        </AdminTheme>
    );
  }

  // تحديد المحتوى والثيم
  let Content = null;
  let ThemeWrapper = DefaultTheme; // الافتراضي

  switch (currentView) {
    case 'home':
        Content = <HeroView />;
        ThemeWrapper = DefaultTheme;
        break;
    
    case 'games':
        Content = <GamesView cards={props.cards} />;
        ThemeWrapper = GamesTheme; // ثيم الأركيد
        break;

    case 'study':
        Content = <StudyView {...props} />;
        ThemeWrapper = StudyTheme; // ثيم التركيز
        break;

    case 'category':
        Content = <CategorySelect {...props} />;
        ThemeWrapper = DefaultTheme;
        break;

    case 'data':
        Content = <DataView {...props} />;
        ThemeWrapper = DataTheme; // ثيم الأرشيف
        break;

    case 'leaderboard':
        Content = <LeaderboardView {...props} />;
        ThemeWrapper = DefaultTheme;
        break;
    
    case 'chat':
        Content = <CommunicationHub {...props} />;
        ThemeWrapper = DefaultTheme;
        break;

    case 'live':
        Content = <LiveView />;
        ThemeWrapper = DefaultTheme;
        break;

    case 'settings':
        Content = <SettingsViewWrapper {...props} />;
        ThemeWrapper = DefaultTheme;
        break;

    default:
        Content = <HeroView />;
        ThemeWrapper = DefaultTheme;
  }

  return (
    <AnimatePresence mode="wait">
        <motion.div 
            key={currentView}
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
        >
            <ThemeWrapper>
                {Content}
            </ThemeWrapper>
        </motion.div>
    </AnimatePresence>
  );
}