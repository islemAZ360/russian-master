"use client";
import React from 'react';
// FIX: الإشارة للمجلد الفرعي data
import { DataManager } from '@/components/features/data/DataManager';
import { useAuth } from '@/context/AuthContext';

export default function DataView({ cards, addCard, deleteCard, updateCard }) {
  const { isJunior } = useAuth();
  return <DataManager cards={cards} onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} isJunior={isJunior} />;
}