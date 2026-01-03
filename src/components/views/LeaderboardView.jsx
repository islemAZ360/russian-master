"use client";
import React from 'react';
import CyberDeck from '../features/CyberDeck';
import { useAuth } from '../../context/AuthContext';

export default function LeaderboardView({ cards, stats }) {
  const { user } = useAuth();
  return <CyberDeck user={user} stats={stats || { xp: 0, streak: 0 }} cards={cards || []} />;
}