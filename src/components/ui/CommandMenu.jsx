// FILE: components/CommandMenu.jsx
"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSearch, IconHome, IconSettings, IconUser, IconCpu, 
  IconMessage, IconDeviceGamepad, IconLogout, IconTerminal 
} from '@tabler/icons-react';

export default function CommandMenu({ isOpen, onClose, onNavigate, onAction }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    { id: 'home', label: 'Go to Base', icon: IconHome, group: 'Navigation' },
    { id: 'study', label: 'Start Training', icon: IconCpu, group: 'Navigation' },
    { id: 'games', label: 'Cyber Arcade', icon: IconDeviceGamepad, group: 'Navigation' },
    { id: 'profile', label: 'User ID', icon: IconUser, group: 'Navigation' },
    { id: 'settings', label: 'System Config', icon: IconSettings, group: 'System' },
    { id: 'logout', label: 'Terminate Session', icon: IconLogout, group: 'System', color: 'text-red-500' },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? onClose() : onAction('open_cmd');
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        const item = filtered[selectedIndex];
        if (item) {
          onNavigate(item.id === 'logout' || item.id === 'settings' ? item.id : item.id); // معالجة خاصة
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filtered, onClose, onAction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-[#09090b] border border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="flex items-center px-4 py-4 border-b border-white/10">
          <IconSearch className="text-white/40 mr-3" size={20} />
          <input 
            autoFocus
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 font-mono"
          />
          <div className="text-xs text-white/20 bg-white/5 px-2 py-1 rounded">ESC</div>
        </div>
        
        <div className="py-2 max-h-[300px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/30 text-sm">No commands found.</div>
          ) : (
            filtered.map((action, i) => (
              <div
                key={action.id}
                onClick={() => { onNavigate(action.id); onClose(); }}
                className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                  i === selectedIndex ? 'bg-white/10 border-l-2 border-cyan-500' : 'text-white/60 hover:bg-white/5'
                }`}
              >
                <action.icon size={18} className={action.color || "text-white"} />
                <span className={`text-sm ${i === selectedIndex ? 'text-white font-bold' : ''}`}>{action.label}</span>
                {i === selectedIndex && <IconTerminal size={14} className="ml-auto text-cyan-500 animate-pulse" />}
              </div>
            ))
          )}
        </div>
        
        <div className="px-4 py-2 bg-black/50 border-t border-white/5 flex justify-between text-[10px] text-white/30 uppercase tracking-wider">
            <span>Nexus OS v3.0</span>
            <span className="flex items-center gap-2">
                Use <kbd className="bg-white/10 px-1 rounded">↑</kbd> <kbd className="bg-white/10 px-1 rounded">↓</kbd> to navigate
            </span>
        </div>
      </motion.div>
    </div>
  );
}