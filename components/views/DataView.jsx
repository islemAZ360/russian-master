"use client";
import React from 'react';
import { DataManager } from '../DataManager';
import { useAuth } from '../../context/AuthContext';

export default function DataView({ cards, addCard, deleteCard, updateCard }) {
  const { isJunior } = useAuth();
  // نمرر isJunior للتحكم في من يرى زر الإضافة
  return <DataManager cards={cards} onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} isJunior={isJunior} />;
}