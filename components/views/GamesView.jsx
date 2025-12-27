"use client";
import React from 'react';
import GamesHub from '../GamesHub';
import { useUI } from '../../context/UIContext';

export default function GamesView({ cards }) {
  const { setActiveOverlayGame } = useUI();
  return <GamesHub cards={cards} onOpenGame={(gameId) => setActiveOverlayGame(gameId)} />;
}