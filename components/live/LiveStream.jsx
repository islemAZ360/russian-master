// FILE: components/live/LiveStream.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { IconUsers, IconMessage, IconHeart, IconX, IconSend } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveStream({ user, onClose }) {
  const [messages, setMessages] = useState([
    { user: 'System', text: 'Welcome to the Neural Classroom.' },
    { user: 'Alex', text: 'Ready to learn!' },
  ]);
  const [input, setInput] = useState("");
  const [likes, setLikes] = useState(0);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { user: user?.email?.split('@')[0] || 'Guest', text: input }]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col md:flex-row font-sans">
      
      {/* Video Area */}
      <div className="flex-1 bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden">
        {/* Animated Background Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
                <div className="w-24 h-24 rounded-full border-4 border-red-500 animate-ping absolute opacity-20"></div>
                <div className="bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">LIVE FEED</div>
                <h2 className="text-4xl font-black text-white mb-2">ADVANCED RUSSIAN SYNTAX</h2>
                <p className="text-white/50">Professor: NEXUS AI</p>
            </div>
        </div>

        {/* Floating Hearts */}
        <button 
            onClick={() => setLikes(l => l + 1)}
            className="absolute bottom-8 right-8 p-4 bg-gray-800/50 backdrop-blur-md rounded-full text-red-500 hover:bg-white/10 hover:scale-110 transition-all border border-white/10"
        >
            <IconHeart className={likes % 2 === 0 ? "fill-red-500" : ""} />
            <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold px-2 rounded-full">{likes}</span>
        </button>

        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white"><IconX size={32}/></button>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full md:w-96 bg-[#111] border-l border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#151515]">
            <h3 className="font-bold text-white flex items-center gap-2"><IconMessage size={18}/> LIVE CHAT</h3>
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                <IconUsers size={12}/> 1,204 Online
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, i) => (
                <div key={i} className="flex flex-col">
                    <span className="text-[10px] text-white/40 font-bold mb-1">{msg.user}</span>
                    <span className="text-sm text-white/90 bg-white/5 p-2 rounded-lg rounded-tl-none">{msg.text}</span>
                </div>
            ))}
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-[#151515] border-t border-white/10 flex gap-2">
            <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-black border border-white/20 rounded-lg px-4 text-sm text-white focus:border-purple-500 outline-none"
            />
            <button type="submit" className="p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500"><IconSend size={18}/></button>
        </form>
      </div>
    </div>
  );
}