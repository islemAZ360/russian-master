"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  IconBroadcast, IconLoader, IconDeviceTv, IconShieldCheck, IconWifi 
} from "@tabler/icons-react";
import { useUI } from "@/context/UIContext";
import { useLanguage } from "@/hooks/useLanguage";

export default function RealLiveStream() {
  const uiContext = useUI(); // استدعاء السياق كاملاً أولاً
  const { startBroadcast, liveState, toggleMinimize } = uiContext || {}; // تفكيك آمن
  const { t, dir } = useLanguage();
  
  const [roomName, setRoomName] = useState("");
  const [status, setStatus] = useState("idle");
  const [logs, setLogs] = useState([`> ${t('live_log_ready')}`, `> ${t('live_log_waiting')}`]);

  const addLog = (msg) => setLogs(prev => [...prev.slice(-3), `> ${msg}`]);

  // حماية ضد الانهيار إذا لم يتم تحميل السياق بعد
  if (!uiContext || !liveState) return <div className="p-10 text-center text-white/50">Loading Interface...</div>;

  const handleJoin = () => {
    if (!roomName.trim()) return;
    setStatus("scanning");
    addLog(t('live_log_encrypt'));
    
    setTimeout(() => {
        addLog(t('live_log_established'));
        startBroadcast(roomName); 
    }, 1500);
  };

  if (liveState.isActive) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full text-center" dir={dir}>
            <div className="w-24 h-24 rounded-full border-4 border-cyan-500/30 flex items-center justify-center animate-pulse mb-6">
                <IconWifi size={40} className="text-cyan-500"/>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">{t('live_active_msg')}</h2>
            <p className="text-white/40 font-mono text-sm mb-8">{t('live_secure_channel')}: {liveState.roomName}</p>
            <div className="text-xs text-cyan-500/50 font-mono border border-cyan-500/20 px-4 py-2 rounded">
                {t('live_active_desc')}
            </div>
        </div>
      );
  }

  return (
    <div className="w-full h-full flex flex-col relative font-sans overflow-hidden items-center justify-center" dir={dir}>
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
        >
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-cyan-900 to-black rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                    <IconBroadcast size={40} className="text-cyan-400" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-2">NEURAL LINK</h2>
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.2em]">
                    Secure Gateway V.4.0
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="relative group/input">
                    <IconDeviceTv className={`absolute top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-cyan-400 transition-colors ${dir === 'rtl' ? 'right-4' : 'left-4'}`} size={20} />
                    <input 
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value.toUpperCase())}
                        placeholder={t('live_enter_id')}
                        className={`w-full bg-black/50 border border-white/10 rounded-xl py-4 ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white outline-none focus:border-cyan-500 focus:bg-cyan-950/10 transition-all font-mono text-sm uppercase tracking-widest`}
                        disabled={status === "scanning"}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    />
                </div>

                <button 
                    onClick={handleJoin}
                    disabled={!roomName || status === "scanning"}
                    className="w-full py-4 bg-white text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                    {status === "scanning" ? <IconLoader className="animate-spin" size={20} /> : <IconShieldCheck size={20} />}
                    <span className="tracking-widest text-xs">
                        {status === "scanning" ? t('live_connecting') : t('live_connect_btn')}
                    </span>
                </button>
                
                <div className="bg-black/40 rounded-lg p-3 h-20 overflow-hidden font-mono text-[9px] text-green-500/60 border border-white/5 flex flex-col justify-end text-left" dir="ltr">
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
            </div>
        </motion.div>
    </div>
  );
}