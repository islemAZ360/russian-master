"use client";
import React from 'react';
import { DataManager } from '@/components/features/data/DataManager';

export default function DataView({ cards, addCard, deleteCard, updateCard, readOnly }) {
  // هذا المكون يعمل كوسيط:
  // إذا كان الوضع "قراءة فقط" (readOnly = true)، نمرر null لدوال التعديل
  // هذا سيجعل DataManager يخفي أزرار الإضافة والحذف والتعديل تلقائياً
  // كما نضمن أن cards مصفوفة دائماً لتجنب الأخطاء
  
  return (
    <DataManager 
      cards={cards || []} 
      onAdd={readOnly ? null : addCard} 
      onDelete={readOnly ? null : deleteCard} 
      onUpdate={readOnly ? null : updateCard} 
    />
  );
}