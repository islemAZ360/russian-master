"use client";
import React from 'react';
import { DataManager } from '@/components/features/data/DataManager';

export default function DataView({ cards, addCard, deleteCard, updateCard, readOnly }) {
  // هذا المكون يقرر الصلاحيات قبل تمريرها لمدير البيانات
  // إذا كان الوضع "قراءة فقط" (readOnly)، نمرر null لدوال التعديل
  // هذا سيجعل DataManager يخفي أيقونات القلم، الحذف، والإضافة تلقائياً
  
  return (
    <DataManager 
      cards={cards} 
      onAdd={readOnly ? null : addCard} 
      onDelete={readOnly ? null : deleteCard} 
      onUpdate={readOnly ? null : updateCard} 
    />
  );
}