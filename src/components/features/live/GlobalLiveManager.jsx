"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { 
  IconX, IconMaximize, IconMinimize, IconMicrophone, 
  IconPlayerRecord, IconPlayerStop, IconWifi, IconCpu, 
  IconLayoutSidebarRightCollapse, IconGripVertical
} from "@tabler/icons-react";

// تحميل Jitsi ديناميكياً مع تعطيل SSR
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false, loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center text-cyan-500 font-mono tracking-widest text-xs">
      INITIALIZING SECURE FEED...
    </div>
  )}
);

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
  const { liveState, endBroadcast, setCurrentView, toggleMinimize } = useUI();
  const { user } = useAuth();
  
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const timerInterval = useRef(null);

  // إعدادات Jitsi
  const configOverwrite = useMemo(() => ({
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    disableThirdPartyRequests: true,
    prejoinPageEnabled: false,
    resolution: 720,
    toolbarButtons: ['microphone', 'camera', 'desktop', 'chat', 'raisehand', 'tileview', 'hangup']
  }), []);

  const interfaceConfigOverwrite = useMemo(() => ({
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    DEFAULT_BACKGROUND: '#000000',
    TOOLBAR_ALWAYS_VISIBLE: false,
  }), []);

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

  if (!liveState?.isActive) return null;

  // دالة الخروج النهائية
  const handleTerminate = () => {
    endBroadcast(); // إغلاق الحالة في Context
    setCurrentView('home');
  };

  // إعدادات الحركة للنافذة العائمة (PIP)
  const containerVariants = {
    full: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: 0,
      zIndex: 100,
    },
    mini: {
      position: "fixed",
      bottom: "100px",
      right: "20px",
      width: "320px",
      height: "200px",
      borderRadius: "24px",
      zIndex: 100,
      boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
    }
  };

  return (
    <motion.div
      initial="full"
      animate={liveState.isMinimized ? "mini" : "full"}
      variants={containerVariants}
      transition={{ type: "spring", stiffness: 150, damping: 25 }}
      className="bg-black border border-white/10 overflow-hidden flex flex-col"
    >
        {/* شريط التحكم العلوي في الوضع المصغر */}
        {liveState.isMinimized && (
            <div className="h-10 bg-zinc-900 border-b border-white/5 flex items-center justify-between px-4 shrink-0 cursor-move">
                <div className="flex items-center gap-2">
                    <IconGripVertical size={14} className="text-white/20"/>
                    <span className="text-[10px] font-bold text-cyan-500 font-mono truncate max-w-[120px]">
                       SECURE_LINK: {liveState.roomName}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => { toggleMinimize(false); setCurrentView('live'); }} className="p-1.5 hover:bg-white/10 rounded text-white"><IconMaximize size={14}/></button>
                    <button onClick={handleTerminate} className="p-1.5 hover:bg-red-500/20 rounded text-red-500"><IconX size={14}/></button>
                </div>
            </div>
        )}

        <div className="flex-1 relative bg-black">
             {/* طبقة حماية لمنع التفاعل مع الـ iframe في الوضع المصغر إلا عند الضغط */}
             {liveState.isMinimized && (
               <div 
                 className="absolute inset-0 z-10 cursor-pointer" 
                 onClick={() => { toggleMinimize(false); setCurrentView('live'); }}
               />
             )}
             
             <JitsiMeeting
                domain="meet.jit.si"
                roomName={`RM_V4_SECURE_${liveState.roomName}`}
                configOverwrite={configOverwrite}
                interfaceConfigOverwrite={interfaceConfigOverwrite}
                userInfo={{ displayName: user?.displayName || "Operative" }}
                onReadyToClose={handleTerminate}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                }}
            />
        </div>

        {/* أدوات التحكم في الوضع الكامل */}
        {!liveState.isMinimized && (
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none z-20">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                            <span className="text-xs font-black text-white tracking-widest uppercase">LIVE FEED</span>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="text-[10px] font-mono text-cyan-400">{liveState.roomName}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-xl">
                    <div className="px-3 hidden sm:block"><FakeAudioVisualizer /></div>
                    <button 
                      onClick={() => { toggleMinimize(true); setCurrentView('home'); }} 
                      className="p-2 hover:bg-white/10 text-white/70 rounded-lg transition-colors"
                    >
                      <IconLayoutSidebarRightCollapse size={20}/>
                    </button>
                    <button 
                      onClick={handleTerminate} 
                      className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg ml-2 shadow-lg transition-colors"
                    >
                      <IconX size={20} />
                    </button>
                </div>
            </div>
        )}
    </motion.div>
  );
}