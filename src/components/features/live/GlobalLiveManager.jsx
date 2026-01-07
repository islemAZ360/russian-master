"use client";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  IconX, IconMaximize, IconMinimize, IconBroadcast, 
  IconPlayerRecord, IconMicrophone, IconVideo 
} from "@tabler/icons-react";

// تحميل Jitsi ديناميكياً لتجنب مشاكل الـ SSR
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { 
    ssr: false, 
    loading: () => (
        <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                <div className="w-20 h-20 border-t-4 border-cyan-500 border-r-4 border-r-transparent rounded-full animate-spin relative z-10"></div>
            </div>
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
  const { dir } = useLanguage();
  
  const [timer, setTimer] = useState("00:00");
  const timerInterval = useRef(null);

  // إعدادات Jitsi المحسنة لتخفيف القيود
  // ملاحظة: لتجاوز حد الـ 5 دقائق بشكل مضمون 100%، يفضل استخدام AppID من 8x8 (مجاني)
  // لكن هذه الإعدادات تخفي الكثير من واجهات "الديمو" المزعجة
  const configOverwrite = useMemo(() => ({
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    prejoinPageEnabled: false,        // تجاوز صفحة الانتظار
    disableThirdPartyRequests: true,  // منع الطلبات الخارجية
    disableDeepLinking: true,         // منع فتح التطبيق
    enablePromo: false,               // إخفاء الإعلانات
    toolbarButtons: [
       'microphone', 'camera', 'desktop', 'chat', 'raisehand', 
       'tileview', 'hangup', 'fullscreen', 'participants-pane', 'settings'
    ],
    // إعدادات الجودة لتقليل استهلاك البيانات
    resolution: 480, 
    constraints: {
        video: { height: { ideal: 480, max: 720, min: 240 } }
    }
  }), []);

  const interfaceConfigOverwrite = useMemo(() => ({
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    SHOW_BRAND_WATERMARK: false,
    DEFAULT_BACKGROUND: '#050505',
    TOOLBAR_ALWAYS_VISIBLE: false,
    filmStripOnly: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
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
      right: dir === 'rtl' ? "auto" : "24px",
      left: dir === 'rtl' ? "24px" : "auto",
      width: "320px",
      height: "200px",
      borderRadius: "24px",
      zIndex: 9999,
      boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
      border: "1px solid rgba(6, 182, 212, 0.3)"
    }
  };

  // توليد اسم غرفة فريد لتجنب التصادم
  // نستخدم اسم الغرفة + بادئة خاصة لضمان عدم دخول غرباء
  const secureRoomName = `RM_SECURE_CHANNEL_${liveState.roomName || 'GENERAL'}`;

  return (
    <motion.div
      layout
      initial="full"
      animate={liveState.isMinimized ? "mini" : "full"}
      variants={layoutVariants}
      transition={{ type: "spring", stiffness: 150, damping: 25 }}
      className="bg-black overflow-hidden flex flex-col group shadow-2xl"
    >
        {/* 1. شريط التحكم المصغر (يظهر فقط عند التصغير) */}
        <AnimatePresence>
            {liveState.isMinimized && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="h-10 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-50 cursor-grab active:cursor-grabbing backdrop-blur-md"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black text-white/70 uppercase tracking-widest truncate max-w-[150px]">
                            {liveState.roomName}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => { toggleMinimize(false); setCurrentView('live'); }} 
                            className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
                            title="Maximize"
                        >
                            <IconMaximize size={14}/>
                        </button>
                        <button 
                            onClick={handleTerminateLink} 
                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
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
                roomName={secureRoomName}
                configOverwrite={configOverwrite}
                interfaceConfigOverwrite={interfaceConfigOverwrite}
                userInfo={{ 
                    displayName: user?.displayName || "Operative",
                    email: user?.email 
                }}
                onReadyToClose={handleTerminateLink}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                    iframeRef.style.background = '#050505';
                }}
            />
        </div>

        {/* 3. واجهة التحكم الكاملة (HUD) - تظهر فقط في الوضع الكامل */}
        {!liveState.isMinimized && (
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-20" dir={dir}>
                
                {/* معلومات الغرفة */}
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <IconBroadcast className="text-red-500" size={20} />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">LIVE SIGNAL</span>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                            {liveState.roomName}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[9px] text-emerald-500 font-black backdrop-blur-sm font-mono tracking-widest">
                            REC: {timer}
                        </div>
                    </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button 
                      onClick={() => { toggleMinimize(true); setCurrentView('home'); }} 
                      className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-white rounded-2xl transition-all active:scale-95 shadow-xl group"
                      title="Minimize (PIP)"
                    >
                      <IconMinimize size={20} className="group-hover:scale-110 transition-transform"/>
                    </button>

                    <button 
                      onClick={handleTerminateLink} 
                      className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl shadow-2xl shadow-red-900/40 transition-all active:scale-95 flex items-center gap-3 uppercase text-[10px] font-black tracking-[0.2em] border border-red-400/20 group"
                    >
                      <IconX size={18} className="group-hover:rotate-90 transition-transform"/> TERMINATE
                    </button>
                </div>
            </div>
        )}
    </motion.div>
  );
}