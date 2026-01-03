"use client";
import React from 'react';
import SettingsView from './SettingsView';
import { auth } from '../../lib/firebase';

// هذا المكون يجب أن يكون بسيطاً جداً
export default function SettingsViewWrapper(props) {
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <SettingsView 
      {...props} 
      onLogout={handleLogout} 
    />
  );
}