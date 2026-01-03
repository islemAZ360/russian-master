"use client";
import React from 'react';
import { HeroSection } from '../features/HeroSection';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

export default function HeroView() {
  const { setCurrentView } = useUI();
  const { user, isAdmin } = useAuth();
  return <HeroSection onStart={() => setCurrentView('category')} onOpenGame={() => setCurrentView('games')} user={user} isAdmin={isAdmin} onOpenAdmin={() => setCurrentView('admin_panel')} />;
}