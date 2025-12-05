"use client";
import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { 
  IconVolume, IconEye, IconShield, IconDatabase, IconTrash, 
  IconDeviceFloppy, IconBell, IconLanguage 
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsView({ user, onLogout, resetProgress }) {
  const { settings, updateSettings } = useSettings();
  const [activeCategory, setActiveCategory] = useState('interface');

  const categories = [
    { id: 'interface', label: 'Interface', icon: IconEye },
    { id: 'audio', label: 'Audio & Voice', icon: IconVolume },
    { id: 'data', label: 'Data & Privacy', icon: IconDatabase },
    { id: 'account', label: 'Account', icon: IconShield },
  ];

  return (
    <div className="w-full h-full p-8 flex flex-col max-w-5xl mx-auto font-sans">
      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-8 glow-text-blue">
        SYSTEM CONFIGURATION
      </h2>

      <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                activeCategory === cat.id 
                ? 'bg-white/10 text-cyan-400 border-l-4 border-cyan-400 shadow-lg' 
                : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <cat.icon size={20} />
              <span className="font-bold text-sm uppercase tracking-wider">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeCategory === 'interface' && (
                <div className="space-y-4">
                  <SettingGroup title="Visual Fidelity">
                    <ToggleOption 
                      label="High-Res Particles" 
                      desc="Enable detailed background effects (uses GPU)." 
                      value={settings.visualEffects} 
                      onChange={v => updateSettings('visualEffects', v)} 
                    />
                    <ToggleOption 
                      label="Motion Blur" 
                      desc="Add cinematic blur to animations." 
                      value={settings.motionBlur} 
                      onChange={v => updateSettings('motionBlur', v)} 
                    />
                  </SettingGroup>
                  <SettingGroup title="Language">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-sm font-bold text-white">App Language</span>
                        <select className="bg-black border border-white/20 rounded px-2 py-1 text-xs outline-none">
                            <option>English (System)</option>
                            <option>Arabic (العربية)</option>
                            <option>Russian (Русский)</option>
                        </select>
                    </div>
                  </SettingGroup>
                </div>
              )}

              {activeCategory === 'audio' && (
                <div className="space-y-4">
                  <SettingGroup title="Sound Mixer">
                    <ToggleOption 
                      label="UI Sound Effects" 
                      desc="Clicks, hovers, and system alerts." 
                      value={settings.soundEffects} 
                      onChange={v => updateSettings('soundEffects', v)} 
                    />
                    <ToggleOption 
                      label="AI Voice Synthesis" 
                      desc="Auto-pronounce Russian words." 
                      value={settings.speech} 
                      onChange={v => updateSettings('speech', v)} 
                    />
                  </SettingGroup>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm font-bold text-white mb-2">Voice Speed</div>
                    <input type="range" min="0.5" max="1.5" step="0.1" className="w-full accent-cyan-500" />
                    <div className="flex justify-between text-xs text-white/30 mt-1"><span>Slow</span><span>Fast</span></div>
                  </div>
                </div>
              )}

              {activeCategory === 'data' && (
                <div className="space-y-4">
                  <SettingGroup title="Privacy & Storage">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                        <div>
                            <div className="font-bold text-white">Export User Data</div>
                            <div className="text-xs text-white/40">Download a JSON file of your progress.</div>
                        </div>
                        <button className="p-2 bg-cyan-900/30 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-black transition-colors"><IconDeviceFloppy/></button>
                    </div>
                    <div className="p-4 bg-red-900/10 rounded-xl border border-red-500/30 flex justify-between items-center">
                        <div>
                            <div className="font-bold text-red-400">Factory Reset</div>
                            <div className="text-xs text-red-400/50">Wipe all progress permanently.</div>
                        </div>
                        <button onClick={resetProgress} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><IconTrash/></button>
                    </div>
                  </SettingGroup>
                </div>
              )}

              {activeCategory === 'account' && (
                <div className="space-y-4">
                    <div className="glass-panel p-6 rounded-xl text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <h3 className="text-xl font-bold text-white">{user?.email}</h3>
                        <p className="text-white/40 text-xs font-mono mt-1">{user?.uid}</p>
                        <button onClick={onLogout} className="mt-6 w-full py-3 border border-red-500/50 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all">
                            LOGOUT
                        </button>
                    </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const SettingGroup = ({ title, children }) => (
    <div className="space-y-2">
        <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest ml-1">{title}</h4>
        {children}
    </div>
);

const ToggleOption = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
        <div>
            <div className="text-sm font-bold text-white">{label}</div>
            <div className="text-xs text-white/40">{desc}</div>
        </div>
        <button 
            onClick={() => onChange(!value)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${value ? 'bg-cyan-600' : 'bg-gray-700'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);