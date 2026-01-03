"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { 
  IconX, IconMaximize, IconMinimize, IconMicrophone, 
  IconPlayerRecord, IconPlayerStop, IconWifi, IconCpu, 
  IconLayoutSidebarRightCollapse 
} from "@tabler/icons-react";

// استيراد Jitsi المعزول
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false, loading: () => <div className="w-full h-full bg-black" /> }
);

// --- موجات صوتية وهمية (للأداء) ---
const FakeAudioVisualizer = () => (
  <div className="flex items-end gap-[2px] h-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="w-1 bg-cyan-500/80 rounded-t-sm animate-pulse"
        style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.4 + Math.random() * 0.5}s` }} 
      />
    ))}
  </div>
);

export default function GlobalLiveManager() {
  const { liveState, stopLive, setCurrentView } = useUI();
  const { user } = useAuth();
  const [isDraggable, setIsDraggable] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const timerInterval = useRef(null);

  // إعدادات Jitsi الثابتة
  const configOverwrite = useMemo(() => ({
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    disableThirdPartyRequests: true,
    prejoinPageEnabled: false,
    resolution: 720,
    toolbarButtons: ['microphone', 'camera', 'desktop', 'chat', 'tileview', 'raisehand']
  }), []);

  const interfaceConfigOverwrite = useMemo(() => ({
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    DEFAULT_BACKGROUND: '#000000',
    TOOLBAR_ALWAYS_VISIBLE: false, // سنخفيه ونعتمد على واجهتنا
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    filmStripOnly: false,
  }), []);

  // منطق التسجيل والمؤقت
  useEffect(() => {
    if (isRecording) {
      let seconds = 0;
      timerInterval.current = setInterval(() => {
          seconds++;
          const m = Math.floor(seconds / 60).toString().padStart(2, '0');
          const s = (seconds % 60).toString().padStart(2, '0');
          setTimer(`${m}:${s}`);
      }, 1000);
    } else {
      clearInterval(timerInterval.current);
      setTimer("00:00");
    }
    return () => clearInterval(timerInterval.current);
  }, [isRecording]);

  if (!liveState.isActive) return null;

  // إعدادات الحركة والموقع
  const variants = {
    full: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: 0,
      x: 0, y: 0,
      zIndex: 40, // تحت القائمة السفلية
    },
    mini: {
      position: "fixed",
      bottom: 100, // فوق القائمة السفلية
      right: 20,
      width: 300,
      height: 180,
      borderRadius: 16,
      zIndex: 100,
      x: 0, y: 0,
      border: "1px solid rgba(6, 182, 212, 0.3)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
    }
  };

  return (
    <motion.div
      initial="full"
      animate={liveState.isMinimized ? "mini" : "full"}
      variants={variants}
      transition={{ type: "spring", stiffness: 150, damping: 25 }}
      className="bg-black overflow-hidden"
      drag={liveState.isMinimized}
      dragMomentum={false}
      onDragStart={() => setIsDraggable(true)}
      onDragEnd={() => setIsDraggable(false)}
    >
        {/* === 1. VIDEO CONTAINER (Always Active) === */}
        <div className={`w-full h-full relative ${liveState.isMinimized ? 'pointer-events-none' : ''}`}>
             <JitsiMeeting
                domain="meet.jit.si"
                roomName={`RM_SECURE_${liveState.roomName}`}
                configOverwrite={configOverwrite}
                interfaceConfigOverwrite={interfaceConfigOverwrite}
                userInfo={{ displayName: user?.displayName || "Operative" }}
                onReadyToClose={() => { stopLive(); setCurrentView('home'); }}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                    iframeRef.style.background = 'black';
                }}
            />
            {/* غطاء شفاف في الوضع المصغر لمنع التفاعل الخاطئ مع الفيديو */}
            {liveState.isMinimized && <div className="absolute inset-0 bg-transparent z-10" />}
        </div>

        {/* === 2. FULL SCREEN HUD (Only when NOT minimized) === */}
        <AnimatePresence>
            {!liveState.isMinimized && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none z-20"
                >
                    {/* Top Bar */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        {/* Info */}
                        <div className="flex flex-col gap-2 pointer-events-auto">
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg flex items-center gap-4 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                                    <span className="text-xs font-black text-white tracking-widest uppercase">LIVE</span>
                                </div>
                                <div className="h-4 w-px bg-white/10"></div>
                                <div className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase">
                                    {liveState.roomName}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="bg-black/40 px-2 py-1 rounded border border-white/5 text-[9px] font-mono text-green-500 flex items-center gap-1">
                                    <IconWifi size={10}/> 24ms
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 px-2 py-2 rounded-lg shadow-lg">
                            <div className="px-2 hidden sm:block"><FakeAudioVisualizer /></div>
                            {isRecording && <span className="font-mono text-red-400 text-xs font-bold px-2 animate-pulse">{timer}</span>}
                            <div className="h-6 w-px bg-white/10 mx-1"></div>
                            
                            {/* زر التصغير اليدوي */}
                            <button 
                                onClick={() => setCurrentView('home')} 
                                className="p-2 hover:bg-white/10 text-white rounded-md transition-colors"
                                title="Minimize & Browse"
                            >
                                <IconLayoutSidebarRightCollapse size={18}/>
                            </button>

                            <button 
                                onClick={() => setIsRecording(!isRecording)} 
                                className={`p-2 rounded-md transition-all ${isRecording ? 'text-red-500 bg-red-500/10' : 'text-white hover:bg-white/10'}`}
                            >
                                {isRecording ? <IconPlayerStop size={18}/> : <IconPlayerRecord size={18}/>}
                            </button>

                            <button onClick={() => { stopLive(); setCurrentView('home'); }} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-md ml-1 shadow-lg">
                                <IconX size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Tech Corners Overlay */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                        <svg className="w-full h-full">
                            <path d="M 30 30 L 60 30 M 30 30 L 30 60" stroke="#06b6d4" strokeWidth="2" fill="none" />
                            <path d="M calc(100% - 30px) 30 L calc(100% - 60px) 30 M calc(100% - 30px) 30 L calc(100% - 30px) 60" stroke="#06b6d4" strokeWidth="2" fill="none" />
                            <path d="M 30 calc(100% - 30px) L 60 calc(100% - 30px) M 30 calc(100% - 30px) L 30 calc(100% - 60px)" stroke="#06b6d4" strokeWidth="2" fill="none" />
                            <path d="M calc(100% - 30px) calc(100% - 30px) L calc(100% - 60px) calc(100% - 30px) M calc(100% - 30px) calc(100% - 30px) L calc(100% - 30px) calc(100% - 60px)" stroke="#06b6d4" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* === 3. MINI PLAYER CONTROLS (Only when minimized) === */}
        {liveState.isMinimized && (
            <div className="absolute top-0 left-0 w-full h-8 bg-black/80 backdrop-blur-md flex items-center justify-between px-3 z-30 border-b border-white/10 cursor-move group">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-mono text-cyan-500 uppercase truncate max-w-[80px]">
                        {liveState.roomName}
                    </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => setCurrentView('live')} 
                        className="p-1 hover:bg-white/20 rounded text-white"
                        title="Maximize"
                    >
                        <IconMaximize size={12}/>
                    </button>
                    <button 
                        onClick={stopLive} 
                        className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                        title="Close"
                    >
                        <IconX size={12}/>
                    </button>
                </div>
            </div>
        )}
    </motion.div>
  );
}