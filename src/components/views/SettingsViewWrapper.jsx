"use client";
import React from 'react';
import SettingsView from './SettingsView';
import { useAuth } from '@/context/AuthContext';

export default function SettingsViewWrapper(props) {
  const { logout } = useAuth();

  return (
    <SettingsView 
      {...props} 
      onLogout={logout} 
    />
  );
}