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

// --- استيراد Jitsi (معزول) ---
// loading component بسيط وخفيف
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false, loading: () => <div className="w-full h-full bg-black flex items-center justify-center text-cyan-900 font-mono tracking-widest text-xs">INITIALIZING SECURE FEED...</div> }
);

// --- موجات صوتية وهمية (للأداء العالي بدلاً من تحليل الصوت الحقيقي) ---
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
  const { liveStream, stopLive, setCurrentView, toggleMinimize } = useUI();
  const { user } = useAuth();
  
  // حالات محلية للواجهة
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [isHovered, setIsHovered] = useState(false);
  const timerInterval = useRef(null);

  // --- إعدادات Jitsi (Memoized بصرامة لمنع إعادة التحميل) ---
  const configOverwrite = useMemo(() => ({
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    disableThirdPartyRequests: true,
    prejoinPageEnabled: false,
    resolution: 720, // دقة مثالية للأداء
    constraints: {
        video: { height: { ideal: 720, max: 720, min: 240 } }
    },
    // إخفاء بعض الأزرار التي سنستبدلها بواجهتنا أو لا نحتاجها
    toolbarButtons: [
       'microphone', 'camera', 'desktop', 'chat', 'raisehand', 
       'tileview', 'select-background', 'hangup'
    ]
  }), []);

  const interfaceConfigOverwrite = useMemo(() => ({
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    DEFAULT_BACKGROUND: '#000000',
    TOOLBAR_ALWAYS_VISIBLE: false, // نعتمد على تحريك الماوس لإظهارها
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    filmStripOnly: false,
    VERTICAL_FILMSTRIP: true,
  }), []);

  // --- منطق المؤقت الوهمي للتسجيل ---
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

  // إذا لم يكن البث نشطاً، لا ترسم شيئاً
  if (!liveStream.isActive) return null;

  // --- إعدادات الحركة والموقع (Framer Motion Variants) ---
  const variants = {
    full: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: 0,
      x: 0, y: 0,
      zIndex: 40, // تحت القائمة السفلية (z-60)
      borderWidth: 0,
    },
    mini: {
      position: "fixed",
      bottom: 100, // فوق شريط التنقل
      right: 20,
      width: 320,
      height: 190,
      borderRadius: 16,
      zIndex: 100, // فوق كل شيء
      x: 0, y: 0,
      borderWidth: 1,
      borderColor: "rgba(6, 182, 212, 0.3)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
    }
  };

  return (
    <motion.div
      layout // السحر هنا: هذا يجعل التحول ناعماً تلقائياً
      initial="full"
      animate={liveStream.isMinimized ? "mini" : "full"}
      variants={variants}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="bg-black overflow-hidden relative group"
      drag={liveStream.isMinimized} // السحب مسموح فقط في الوضع المصغر
      dragMomentum={false}
      dragElastic={0.1}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        {/* =========================================================
            1. حاوية الفيديو (Jitsi Container) - ثابتة لا تتغير
           ========================================================= */}
        <div className={`w-full h-full bg-black relative`}>
             {/* طبقة حماية شفافة في الوضع المصغر لمنع التفاعل الخاطئ مع أزرار الفيديو أثناء السحب */}
             {liveStream.isMinimized && <div className="absolute inset-0 z-10 bg-transparent" />}

             <JitsiMeeting
                domain="meet.jit.si"
                roomName={`RM_SECURE_${liveStream.roomName}`}
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
        </div>

        {/* =========================================================
            2. واجهة التحكم الكاملة (Full Screen HUD)
           ========================================================= */}
        <AnimatePresence>
            {!liveState.isMinimized && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none z-20"
                >
                    {/* الشريط العلوي العائم */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        
                        {/* معلومات البث (يسار) */}
                        <div className="flex flex-col gap-2 pointer-events-auto">
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg flex items-center gap-4 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                                    <span className="text-xs font-black text-white tracking-widest uppercase">LIVE</span>
                                </div>
                                <div className="h-4 w-px bg-white/10"></div>
                                <div className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase">
                                    {liveStream.roomName}
                                </div>
                            </div>
                            
                            {/* إحصائيات وهمية للمظهر */}
                            <div className="flex gap-2 opacity-60 hover:opacity-100 transition-opacity">
                                <div className="bg-black/40 px-2 py-1 rounded border border-white/5 text-[9px] font-mono text-green-500 flex items-center gap-1">
                                    <IconWifi size={10}/> 24ms
                                </div>
                                <div className="bg-black/40 px-2 py-1 rounded border border-white/5 text-[9px] font-mono text-yellow-500 flex items-center gap-1">
                                    <IconCpu size={10}/> STABLE
                                </div>
                            </div>
                        </div>

                        {/* أدوات التحكم (يمين) */}
                        <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 px-2 py-2 rounded-lg shadow-lg">
                            <div className="px-2 hidden sm:block"><FakeAudioVisualizer /></div>
                            
                            {isRecording && <span className="font-mono text-red-400 text-xs font-bold px-2 animate-pulse">{timer}</span>}
                            
                            <div className="h-6 w-px bg-white/10 mx-1"></div>
                            
                            {/* زر التصغير اليدوي */}
                            <button 
                                onClick={() => { toggleMinimize(true); setCurrentView('home'); }} 
                                className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-md transition-colors group relative"
                                title="Minimize"
                            >
                                <IconLayoutSidebarRightCollapse size={18}/>
                            </button>

                            {/* زر التسجيل */}
                            <button 
                                onClick={() => setIsRecording(!isRecording)} 
                                className={`p-2 rounded-md transition-all ${isRecording ? 'text-red-500 bg-red-500/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                            >
                                {isRecording ? <IconPlayerStop size={18}/> : <IconPlayerRecord size={18}/>}
                            </button>

                            {/* زر الإغلاق */}
                            <button onClick={() => { stopLive(); setCurrentView('home'); }} className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-md ml-1 shadow-lg transition-colors">
                                <IconX size={18} />
                            </button>
                        </div>
                    </div>

                    {/* زوايا تقنية (HUD Overlay) */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <svg className="w-full h-full">
                            <path d="M 40 40 L 80 40 M 40 40 L 40 80" stroke="#06b6d4" strokeWidth="2" fill="none" />
                            <path d="M calc(100% - 40px) 40 L calc(100% - 80px) 40 M calc(100% - 40px) 40 L calc(100% - 40px) 80" stroke="#06b6d4" strokeWidth="2" fill="none" />
                            <path d="M 40 calc(100% - 40px) L 80 calc(100% - 40px) M 40 calc(100% - 40px) L 40 calc(100% - 80px)" stroke="#06b6d4" strokeWidth="2" fill="none" />
                            <path d="M calc(100% - 40px) calc(100% - 40px) L calc(100% - 80px) calc(100% - 40px) M calc(100% - 40px) calc(100% - 40px) L calc(100% - 40px) calc(100% - 80px)" stroke="#06b6d4" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* =========================================================
            3. واجهة المشغل المصغر (Mini Player Controls)
           ========================================================= */}
        {liveState.isMinimized && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="absolute top-0 left-0 w-full h-8 bg-black/80 backdrop-blur-md flex items-center justify-between px-3 z-30 border-b border-white/10 cursor-move"
            >
                <div className="flex items-center gap-2">
                    <IconGripVertical size={12} className="text-white/20" />
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-mono text-cyan-500 uppercase truncate max-w-[80px]">
                        {liveState.roomName}
                    </span>
                </div>
                
                {/* أزرار التحكم المصغرة - تظهر عند التحويم */}
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => { toggleMinimize(false); setCurrentView('live'); }} 
                        className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                        title="Maximize"
                    >
                        <IconMaximize size={12}/>
                    </button>
                    <button 
                        onClick={stopLive} 
                        className="p-1 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                        title="Close"
                    >
                        <IconX size={12}/>
                    </button>
                </div>
            </motion.div>
        )}
    </motion.div>
  );
}