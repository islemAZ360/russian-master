"use client";
import React, { useRef, useState, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { 
  IconX, IconMaximize, IconMinimize, IconMicrophone, 
  IconVideo, IconDotsVertical, IconActivity 
} from "@tabler/icons-react";

// استيراد Jitsi (معزول هنا)
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false, loading: () => <div className="w-full h-full bg-black flex items-center justify-center text-cyan-500 font-mono text-xs">LOADING UPLINK...</div> }
);

export default function GlobalLiveManager() {
  const { liveState, stopLive, setCurrentView } = useUI();
  const { user } = useAuth();
  const [isDraggable, setIsDraggable] = useState(false);

  // إعدادات ثابتة لمنع إعادة التحميل
  const configOverwrite = useMemo(() => ({
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    disableThirdPartyRequests: true,
    prejoinPageEnabled: false,
    resolution: 720,
    toolbarButtons: ['microphone', 'camera', 'desktop', 'hangup', 'chat', 'tileview']
  }), []);

  const interfaceConfigOverwrite = useMemo(() => ({
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    DEFAULT_BACKGROUND: '#000000',
    TOOLBAR_ALWAYS_VISIBLE: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    filmStripOnly: false,
  }), []);

  // إذا لم يكن البث نشطاً، لا ترسم شيئاً
  if (!liveState.isActive) return null;

  // تحديد الستايل بناءً على الحالة (شاشة كاملة أو مصغر)
  const variants = {
    full: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: 0,
      zIndex: 40, // تحت القوائم العائمة قليلاً
    },
    mini: {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "320px",
      height: "200px",
      borderRadius: "16px",
      zIndex: 100, // فوق كل شيء
      boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      border: "1px solid rgba(6, 182, 212, 0.3)"
    }
  };

  return (
    <motion.div
      initial="full"
      animate={liveState.isMinimized ? "mini" : "full"}
      variants={variants}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="bg-black overflow-hidden shadow-2xl"
      drag={liveState.isMinimized} // قابل للسحب فقط عند التصغير
      dragMomentum={false}
      onDragStart={() => setIsDraggable(true)}
      onDragEnd={() => setIsDraggable(false)}
    >
      {/* --- شريط التحكم المصغر (يظهر فقط في الوضع المصغر) --- */}
      {liveState.isMinimized && (
        <div className="absolute top-0 left-0 w-full h-8 bg-black/80 backdrop-blur-md z-20 flex items-center justify-between px-3 cursor-move border-b border-white/10 group">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-mono text-cyan-500 tracking-widest uppercase truncate max-w-[100px]">
                    {liveState.roomName}
                </span>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => setCurrentView('live')} 
                    className="p-1 hover:bg-white/10 rounded text-white"
                    title="Maximize"
                >
                    <IconMaximize size={12}/>
                </button>
                <button 
                    onClick={stopLive} 
                    className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                    title="Close Connection"
                >
                    <IconX size={12}/>
                </button>
            </div>
        </div>
      )}

      {/* --- حاوية الفيديو --- */}
      <div className={`w-full h-full relative ${liveState.isMinimized ? 'pointer-events-none' : ''}`}>
        {/* خدعة: pointer-events-none في الوضع المصغر لمنع التفاعل مع أزرار Jitsi بالخطأ أثناء السحب، 
            لكن يمكننا تفعيلها إذا أردت التحكم من النافذة الصغيرة */}
        <div className="w-full h-full pointer-events-auto"> 
             <JitsiMeeting
                domain="meet.jit.si"
                roomName={`RM_SECURE_${liveState.roomName}`}
                configOverwrite={configOverwrite}
                interfaceConfigOverwrite={interfaceConfigOverwrite}
                userInfo={{ displayName: user?.displayName || "Operative" }}
                onReadyToClose={() => {
                    stopLive();
                    if(!liveState.isMinimized) setCurrentView('home');
                }}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                    iframeRef.style.background = 'black';
                }}
            />
        </div>

        {/* تأثيرات تجميلية للوضع المصغر */}
        {liveState.isMinimized && (
            <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/20 rounded-2xl z-10">
                <div className="absolute bottom-2 right-2 flex gap-1">
                    <div className="w-1 h-3 bg-cyan-500/50 animate-pulse"></div>
                    <div className="w-1 h-2 bg-cyan-500/50 animate-pulse delay-75"></div>
                    <div className="w-1 h-4 bg-cyan-500/50 animate-pulse delay-150"></div>
                </div>
            </div>
        )}
      </div>
    </motion.div>
  );
}