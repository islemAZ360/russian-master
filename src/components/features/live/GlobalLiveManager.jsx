"use client";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  IconX, IconMaximize, IconMinimize, IconMicrophone, 
  IconPlayerRecord, IconPlayerStop, IconWifi, IconCpu, 
  IconLayoutSidebarRightCollapse, IconGripVertical, IconBroadcast, IconShieldCheck 
} from "@tabler/icons-react";

// تحميل Jitsi ديناميكياً (يمنع أخطاء SSR)
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { 
    ssr: false, 
    loading: () => (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="text-[10px] text-cyan-500 font-black font-mono tracking-[0.4em] uppercase animate-pulse">
                Establishing_Secure_Link...
            </div>
        </div>
    )
  }
);

export default function GlobalLiveManager() {
  const { liveState, endBroadcast, setCurrentView, toggleMinimize } = useUI();
  const { user } = useAuth();
  const { t, dir, isRTL } = useLanguage();
  
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const timerInterval = useRef(null);

  // إعدادات Jitsi لتقليل استهلاك البيانات
  const configOverwrite = useMemo(() => ({
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    disableThirdPartyRequests: true,
    prejoinPageEnabled: false,
    resolution: 360, // جودة متوسطة للأداء
    constraints: {
        video: {
            height: { ideal: 360, max: 720, min: 240 }
        }
    },
    toolbarButtons: [
       'microphone', 'camera', 'desktop', 'chat', 'raisehand', 
       'tileview', 'hangup', 'fullscreen'
    ]
  }), []);

  const interfaceConfigOverwrite = useMemo(() => ({
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    DEFAULT_BACKGROUND: '#050505',
    TOOLBAR_ALWAYS_VISIBLE: false,
    filmStripOnly: false,
  }), []);

  // إدارة وقت الجلسة
  useEffect(() => {
    if (liveState.isActive) {
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
  }, [liveState.isActive]);

  const handleTerminateLink = useCallback(() => {
      endBroadcast(); 
      // العودة للقاعدة عند الانتهاء
      setCurrentView('home'); 
  }, [endBroadcast, setCurrentView]);

  if (!liveState?.isActive) return null;

  // إعدادات الحركة للتبديل بين الوضع الكامل والمصغر
  const layoutVariants = {
    full: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: "100%",
      borderRadius: 0,
      zIndex: 100,
    },
    mini: {
      position: "fixed",
      bottom: "100px",
      right: isRTL ? "auto" : "24px",
      left: isRTL ? "24px" : "auto",
      width: "320px",
      height: "200px",
      borderRadius: "24px",
      zIndex: 9999, // فوق كل شيء
      boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
      border: "1px solid rgba(6, 182, 212, 0.3)"
    }
  };

  return (
    <motion.div
      layout
      initial="full"
      animate={liveState.isMinimized ? "mini" : "full"}
      variants={layoutVariants}
      transition={{ type: "spring", stiffness: 150, damping: 25 }}
      className="bg-black overflow-hidden flex flex-col group"
    >
        {/* 1. شريط التحكم المصغر (يظهر فقط عند التصغير) */}
        <AnimatePresence>
            {liveState.isMinimized && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="h-10 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-50 cursor-grab active:cursor-grabbing"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black text-white/50 uppercase tracking-widest truncate max-w-[150px]">
                            {liveState.roomName}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => { toggleMinimize(false); setCurrentView('live'); }} 
                            className="p-1 hover:bg-white/10 rounded text-white"
                            title="Maximize"
                        >
                            <IconMaximize size={14}/>
                        </button>
                        <button 
                            onClick={handleTerminateLink} 
                            className="p-1 hover:bg-red-500/20 rounded text-red-500"
                            title="End Call"
                        >
                            <IconX size={14}/>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* 2. منطقة الفيديو (Jitsi) */}
        <div className="flex-1 relative bg-black">
             {/* طبقة حماية للتفاعل في الوضع المصغر */}
             {liveState.isMinimized && (
               <div 
                 className="absolute inset-0 z-10 cursor-pointer bg-transparent" 
                 onDoubleClick={() => { toggleMinimize(false); setCurrentView('live'); }}
                 title="Double click to maximize"
               />
             )}
             
             <JitsiMeeting
                domain="meet.jit.si"
                roomName={`RM_V5_SECURE_${liveState.roomName}`}
                configOverwrite={configOverwrite}
                interfaceConfigOverwrite={interfaceConfigOverwrite}
                userInfo={{ displayName: user?.displayName || "Agent" }}
                onReadyToClose={handleTerminateLink}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                    iframeRef.style.background = 'black';
                }}
            />
        </div>

        {/* 3. واجهة التحكم الكاملة (HUD) */}
        {!liveState.isMinimized && (
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-20" dir={dir}>
                
                {/* معلومات الغرفة */}
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl flex items-center gap-4 shadow-2xl">
                        <div className="flex items-center gap-2">
                            <IconBroadcast className="text-red-500 animate-pulse" size={18} />
                            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">LIVE</span>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                            {liveState.roomName}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-lg bg-black/30 border border-white/5 text-[9px] text-emerald-500 font-black backdrop-blur-sm">
                            {timer}
                        </div>
                    </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button 
                      onClick={() => { toggleMinimize(true); setCurrentView('home'); }} 
                      className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all active:scale-95 shadow-xl"
                      title="Minimize (PIP)"
                    >
                      <IconLayoutSidebarRightCollapse size={20}/>
                    </button>

                    <button 
                      onClick={handleTerminateLink} 
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-2xl transition-all active:scale-95 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest border border-red-400/20"
                    >
                      <IconX size={16} /> END SESSION
                    </button>
                </div>
            </div>
        )}
    </motion.div>
  );
}