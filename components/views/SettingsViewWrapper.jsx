"use client";
import React from 'react';
import SettingsView from '../SettingsView';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';

export default function SettingsViewWrapper({ resetProgress }) {
  const { user } = useAuth();
  const handleLogout = () => auth.signOut().then(() => window.location.reload());

  return <SettingsView user={user} resetProgress={resetProgress} onLogout={handleLogout} />;
}