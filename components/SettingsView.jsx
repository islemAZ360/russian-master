"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconVolume, IconLogout, IconTrash, IconUser, IconShield, IconSettings, IconCheck, IconMessageExclamation 
} from '@tabler/icons-react';
import { useStudySystem } from '../hooks/useStudySystem';
import { auth, db } from '../lib/firebase';
import SupportModal from './SupportModal'; // المكون الجديد

const AVATARS = ["👤", "🤖", "👽", "👾", "💀", "🐱", "🦉", "⚡", "🔥", "💎", "🐉", "🚀"];

export default function SettingsView({ onLogout, resetProgress, user }) {
  const { setAvatar, stats } = useStudySystem(user);
  const [soundEnabled, setSoundEnabled] = useState(true); 
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans text-white pb-32 overflow-y-auto custom-scrollbar">
      
      {/* Support Modal */}
      {showSupport && <SupportModal user={user} onClose={() => setShowSupport(false)} />}

      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b border-white/10 pb-6 flex justify-between items-end">
            <div>
                <h2 className="text-4xl font-black tracking-widest flex items-center gap-3 text-white">
                    <IconSettings size={40} className="text-cyan-500 animate-[spin_10s_linear_infinite]"/>
                    SYSTEM CONFIG
                </h2>
                <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-2 ml-14">
                    Neural Interface Customization
                </p>
            </div>
            {/* زر الدعم الفني */}
            <button onClick={() => setShowSupport(true)} className="bg-purple-600/20 border border-purple-500 text-purple-400 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-600 hover:text-white transition-all">
                <IconMessageExclamation size={18} /> CONTACT HQ
            </button>
        </motion.div>

        {/* Avatar Section */}
        <section className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-400"><IconUser/> OPERATIVE IDENTITY</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {AVATARS.map((avi, index) => {
                    const isSelected = stats?.avatar === avi;
                    return (
                        <button key={index} onClick={() => setAvatar(avi)} className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all relative ${isSelected ? 'bg-cyan-600/20 border-2 border-cyan-500' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                            {avi}
                            {isSelected && <div className="absolute -top-2 -right-2 bg-cyan-500 rounded-full p-0.5 text-black"><IconCheck size={12} stroke={4} /></div>}
                        </button>
                    );
                })}
            </div>
        </section>

        {/* Logout */}
        <button onClick={onLogout} className="w-full py-5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-2xl font-black tracking-widest flex items-center justify-center gap-3 transition-all">
            <IconLogout className="text-cyan-500"/> DISCONNECT
        </button>
      </div>
    </div>
  );
}