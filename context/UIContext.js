"use client";
import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);

  return (
    <UIContext.Provider value={{ 
        currentView, setCurrentView, 
        activeCategory, setActiveCategory,
        showSupport, setShowSupport,
        activeOverlayGame, setActiveOverlayGame
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);