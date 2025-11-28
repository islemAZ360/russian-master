"use client";
import React from 'react';
import { 
  IconVolume, IconVolumeOff, IconEye, IconEyeOff, IconGauge, IconLogout, IconCpu 
} from '@tabler/icons-react';
import { useSettings } from '../context/SettingsContext';

export default function SettingsView({ onLogout }) {
  const { settings, updateSettings } = useSettings();

  const Toggle = ({ label, icon: Icon, value, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl mb-3 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${value ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>
            <Icon size={24} />
        </div>
        <span className="font-bold text-sm tracking-widest">{label}</span>
      </div>
      <button 
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full p-1 transition-colors ${value ? 'bg-cyan-600' : 'bg-gray-700'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans text-white pb-32 overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-3xl font-black mb-8 text-cyan-500 tracking-[0.2em] flex items-center gap-2">
            <IconGauge className="animate-spin-slow" /> SYSTEM CONFIG
        </h2>

        {/* إعدادات الصوت */}
        <div className="mb-8">
            <h3 className="text-xs text-white/40 uppercase font-bold mb-3 ml-2">Audio Modules</h3>
            <Toggle label="System SFX" icon={settings.soundEffects ? IconVolume : IconVolumeOff} value={settings.soundEffects} onChange={(v) => updateSettings('soundEffects', v)} />
            <Toggle label="Voice Assistant" icon={IconCpu} value={settings.speech} onChange={(v) => updateSettings('speech', v)} />
        </div>

        {/* إعدادات الجرافيك */}
        <div className="mb-8">
            <h3 className="text-xs text-white/40 uppercase font-bold mb-3 ml-2">Visual Interface</h3>
            <Toggle label="High Performance" icon={settings.visualEffects ? IconEye : IconEyeOff} value={settings.visualEffects} onChange={(v) => updateSettings('visualEffects', v)} />
        </div>

        {/* إعدادات الصعوبة */}
        <div className="mb-8">
            <h3 className="text-xs text-white/40 uppercase font-bold mb-3 ml-2">Training Intensity</h3>
            <div className="grid grid-cols-3 gap-2">
                {['easy', 'normal', 'hard'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => updateSettings('difficulty', mode)}
                        className={`py-3 rounded-lg font-bold text-xs uppercase border transition-all ${
                            settings.difficulty === mode 
                            ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                            : 'bg-black border-white/10 text-white/40 hover:bg-white/5'
                        }`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>

        {/* تسجيل الخروج */}
        <button onClick={onLogout} className="w-full py-4 mt-4 bg-red-900/20 border border-red-500/50 text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-900/40 transition-all">
            <IconLogout size={20} /> TERMINATE SESSION
        </button>
      </div>
    </div>
  );
}