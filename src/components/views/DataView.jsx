"use client";
import React from 'react';
import { DataManager } from '../features/DataManager';
import { useAuth } from '../../context/AuthContext';

export default function DataView({ cards, addCard, deleteCard, updateCard }) {
  const { isJunior } = useAuth();
  return <DataManager cards={cards} onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} isJunior={isJunior} />;
}