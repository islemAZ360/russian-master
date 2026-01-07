"use client";
import React from 'react';
import CyberDeck from '@/components/features/profile/CyberDeck';
import MemberList from '@/components/features/profile/MemberList';
import { useAuth } from '@/context/AuthContext';

export default function LeaderboardView({ cards, stats }) {
  const { user, userData } = useAuth();

  return (
    <div className="flex flex-col gap-10 w-full max-w-6xl mx-auto pb-20">
      {/* 1. بطاقة اللاعب الشخصية (إحصائيات، مستوى، رتبة) */}
      <CyberDeck 
        user={{...user, ...userData}} 
        stats={stats || { xp: 0, streak: 0 }} 
        cards={cards || []} 
      />

      {/* 2. جدول الترتيب (العالمي / الفصل) */}
      <MemberList />
    </div>
  );
}