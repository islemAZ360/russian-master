"use client";
import React from 'react';
// FIX: الإشارة للمجلد الفرعي profile
import CyberDeck from '@/components/features/profile/CyberDeck';
import { useAuth } from '@/context/AuthContext';

export default function LeaderboardView({ cards, stats }) {
  const { user } = useAuth();
  return <CyberDeck user={user} stats={stats || { xp: 0, streak: 0 }} cards={cards || []} />;
}