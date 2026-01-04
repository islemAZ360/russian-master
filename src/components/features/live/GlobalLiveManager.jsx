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

// تحميل Jitsi ديناميكياً لضمان عدم حدوث أخطاء SSR
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { 
    ssr: false, 
    loading: () => (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-4">
            <IconBroadcast size={40} className="text-cyan-500 animate-pulse" />
            <div className="text-[10px] text-cyan-500 font-black font-mono tracking-[0.4em] uppercase animte-pulse">
                Initializing_Secure_Feed...
            </div>
        </div>
    )
  }
);

/**
 * مدير البث المباشر العالمي (Global Live Manager)
 * تم تطويره ليكون المكون الأكثر استقراراً وجمالية في واجهة النظام
 */
export default function GlobalLiveManager() {
  const { liveState, endBroadcast, setCurrentView, toggleMinimize } = useUI();
  const { user } = useAuth();
  const { t, dir, isRTL } = useLanguage();
  
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const timerInterval = useRef(null);

  // إعدادات Jitsi المتقدمة
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

  // إدارة عداد التسجيل
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

  // دالة الإنهاء الآمن
  const handleTerminateLink = useCallback(() => {
      endBroadcast(); 
      setCurrentView('home');
  }, [endBroadcast, setCurrentView]);

  if (!liveState?.isActive) return null;

  // إعدادات الأنيميشن والحركة (إصلاح مشكلة الـ PIP)
  const layoutVariants = {
    full: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: 0,
      zIndex: 100,
      padding: 0
    },
    mini: {
      position: "fixed",
      bottom: "100px",
      right: isRTL ? "auto" : "24px",
      left: isRTL ? "24px" : "auto",
      width: "340px",
      height: "220px",
      borderRadius: "28px",
      zIndex: 100,
      boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
      border: "1px solid rgba(6, 182, 212, 0.3)"
    }
  };

  return (
    <motion.div
      layout
      initial="full"
      animate={liveState.isMinimized ? "mini" : "full"}
      variants={layoutVariants}
      transition={{ type: "spring", stiffness: 180, damping: 28 }}
      className="bg-black overflow-hidden flex flex-col group shadow-2xl"
    >
        {/* 1. شريط التحكم في الوضع المصغر (Mini Controls) */}
        <AnimatePresence>
            {liveState.isMinimized && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-12 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between px-5 shrink-0 z-50 cursor-move"
                >
                    <div className="flex items-center gap-3">
                        <IconGripVertical size={16} className="text-white/20"/>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest font-mono truncate max-w-[120px]">
                                {liveState.roomName}
                            </span>
                            <span className="text-[7px] text-white/30 uppercase tracking-tighter">Signal_Live</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => { toggleMinimize(false); setCurrentView('live'); }} 
                            className="p-1.5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
                        >
                            <IconMaximize size={16}/>
                        </button>
                        <button 
                            onClick={handleTerminateLink} 
                            className="p-1.5 hover:bg-red-500/20 rounded-xl text-red-500 transition-all active:scale-90"
                        >
                            <IconX size={16}/>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* 2. حاوية الفيديو الرئيسية */}
        <div className="flex-1 relative bg-black overflow-hidden">
             {/* طبقة تفاعل للوضع المصغر */}
             {liveState.isMinimized && (
               <div 
                 className="absolute inset-0 z-10 cursor-pointer bg-transparent" 
                 onClick={() => { toggleMinimize(false); setCurrentView('live'); }}
                 title="Tap to Maximize"
               />
             )}
             
             <JitsiMeeting
                domain="meet.jit.si"
                roomName={`RM_V4_SECURE_${liveState.roomName}`}
                configOverwrite={configOverwrite}
                interfaceConfigOverwrite={interfaceConfigOverwrite}
                userInfo={{ displayName: user?.displayName || "Agent" }}
                onReadyToClose={handleTerminateLink}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                    iframeRef.style.borderRadius = liveState.isMinimized ? "0 0 28px 28px" : "0";
                }}
            />
        </div>

        {/* 3. واجهة التحكم الكاملة (Full View HUD) */}
        {!liveState.isMinimized && (
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-20" dir={dir}>
                {/* معلومات القناة (يسار) */}
                <div className="flex flex-col gap-3 pointer-events-auto">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-5 shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_12px_red]"></div>
                            <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase">LIVE_FEED</span>
                        </div>
                        <div className="h-5 w-px bg-white/10"></div>
                        <div className="flex items-center gap-3">
                            <IconShieldCheck size={18} className="text-cyan-400" />
                            <span className="text-[10px] font-black font-mono text-cyan-400 uppercase tracking-widest">
                                {liveState.roomName}
                            </span>
                        </div>
                    </motion.div>

                    <div className="flex gap-3">
                        <StatusBadge icon={<IconWifi size={12}/>} text="24MS" color="text-emerald-500" />
                        <StatusBadge icon={<IconCpu size={12}/>} text="STABLE" color="text-amber-500" />
                    </div>
                </div>

                {/* أدوات التحكم (يمين) */}
                <div className="flex items-center gap-3 pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl shadow-2xl">
                    <div className="px-4 border-r border-white/10 hidden sm:block">
                        <AudioVisualizer />
                    </div>
                    
                    {isRecording && (
                        <div className="px-4 font-mono text-red-500 text-sm font-black animate-pulse flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            {timer}
                        </div>
                    )}

                    <button 
                      onClick={() => { toggleMinimize(true); setCurrentView('home'); }} 
                      className="p-3 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all active:scale-90"
                      title="Minimize to PIP"
                    >
                      <IconLayoutSidebarRightCollapse size={24}/>
                    </button>

                    <button 
                      onClick={handleTerminateLink} 
                      className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-xl shadow-xl transition-all active:scale-95 flex items-center gap-2"
                    >
                      <IconX size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{t('admin_exit')}</span>
                    </button>
                </div>
            </div>
        )}
    </motion.div>
  );
}

/**
 * مكون منبثق لحالة الاتصال
 */
function StatusBadge({ icon, text, color }) {
    return (
        <div className={`bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-tighter ${color} backdrop-blur-md`}>
            {icon} {text}
        </div>
    );
}

/**
 * ميزان صوت وهمي تجميلي
 */
function AudioVisualizer() {
    return (
        <div className="flex items-end gap-[2px] h-5 w-12">
            {[...Array(6)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-1.5 bg-cyan-500/60 rounded-full animate-pulse"
                    style={{ 
                        height: `${Math.random() * 100}%`, 
                        animationDuration: `${0.3 + Math.random() * 0.7}s` 
                    }} 
                />
            ))}
        </div>
    );
}