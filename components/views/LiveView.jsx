"use client";
import React from 'react';
import RealLiveStream from '../live/RealLiveStream';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

export default function LiveView() {
  const { setCurrentView } = useUI();
  const { user } = useAuth();
  return <RealLiveStream user={user} onClose={() => setCurrentView('home')} />;
}