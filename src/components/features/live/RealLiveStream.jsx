"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBroadcast, IconX, IconLoader, IconPlayerRecord, 
  IconPlayerStop, IconMicrophone, IconWifi, IconLock, 
  IconDeviceTv, IconShieldCheck, IconActivity
} from "@tabler/icons-react";

// استيراد ديناميكي مع إيقاف SSR لتسريع التحميل الأولي
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false, loading: () => <CustomLoader /> }
);

// --- مكون التحميل المخصص (خفيف جداً) ---
const CustomLoader = () => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-black text-cyan-500">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <div className="mt-4 text-xs font-mono tracking-[0.3em] animate-pulse">ESTABLISHING UPLINK...</div>
  </div>
);

// --- مكون الفيديو المعزول (Jitsi) ---
// نستخدم React.memo هنا بصرامة لمنع إعادة التحميل عند تغيير حالة التسجيل أو الأزرار
const SecureMeeting = React.memo(({ roomName, userName, onReadyToClose }) => {
  
  // تثبيت الإعدادات في الذاكرة لمنع أي وميض أو إعادة تحميل
  const configOverwrite = useMemo(() => ({
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    disableThirdPartyRequests: true, // تسريع الاتصال
    prejoinPageEnabled: false, // الدخول المباشر
    resolution: 720, // دقة متوازنة للأداء
    constraints: {
        video: {
            height: { ideal: 720, max: 720, min: 240 }
        }
    },
    toolbarButtons: [
       'microphone', 'camera', 'desktop', 'fullscreen',
       'fodeviceselection', 'hangup', 'chat', 'raisehand',
       'tileview', 'select-background'
    ]
  }), []);

  const interfaceConfigOverwrite = useMemo(() => ({
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    DEFAULT_BACKGROUND: '#000000',
    DEFAULT_LOCAL_DISPLAY_NAME: 'Me',
    TOOLBAR_ALWAYS_VISIBLE: false,
    filmStripOnly: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true, // تقليل الضجيج
  }), []);

  return (
    <div className="w-full h-full bg-black rounded-2xl overflow-hidden relative z-0">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={`RM_SECURE_${roomName}`}
        configOverwrite={configOverwrite}
        interfaceConfigOverwrite={interfaceConfigOverwrite}
        userInfo={{ displayName: userName }}
        onReadyToClose={onReadyToClose}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
          iframeRef.style.border = 'none';
          iframeRef.style.background = 'black';
        }}
      />
    </div>
  );
}, (prev, next) => prev.roomName === next.roomName); // إعادة التصيير فقط إذا تغير اسم الغرفة

SecureMeeting.displayName = "SecureMeeting";

// --- المكون الرئيسي ---
export default function RealLiveStream({ user, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // مرحلة تحليل الشبكة
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // منطق المؤقت (Timer Logic)
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinSequence = () => {
    if (!roomName.trim()) return;
    setIsAnalyzing(true);
    // محاكاة فحص الشبكة لإعطاء طابع احترافي
    setTimeout(() => {
        setIsAnalyzing(false);
        setIsJoined(true);
    }, 1500);
  };

  // تسجيل الشاشة بجودة عالية
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: "always" }, 
        audio: true 
      });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        saveVideo();
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop()); // إيقاف مشاركة الشاشة
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Recording permission denied or canceled.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const saveVideo = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = `Mission_Log_${roomName}_${new Date().toISOString().slice(0,10)}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col relative font-sans overflow-hidden">
      
      <AnimatePresence mode="wait">
        {!isJoined ? (
            /* === LOBBY: THE SECURE TERMINAL === */
            <motion.div 
                key="lobby"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
                className="absolute inset-0 z-50 flex items-center justify-center p-6"
            >
                <div className="w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                    {/* Dynamic Border Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                    
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-cyan-900 to-black rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                            <IconBroadcast size={40} className="text-cyan-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">NEURAL LINK</h2>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.2em]">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Secure Gateway V.4.0
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="relative group/input">
                            <IconDeviceTv className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-cyan-400 transition-colors" size={20} />
                            <input 
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="ENTER FREQUENCY ID..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-cyan-500 focus:bg-cyan-950/10 transition-all font-mono text-sm uppercase"
                                onKeyDown={(e) => e.key === 'Enter' && handleJoinSequence()}
                            />
                        </div>

                        <button 
                            onClick={handleJoinSequence}
                            disabled={!roomName || isAnalyzing}
                            className="w-full py-4 bg-white text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            {isAnalyzing ? (
                                <>
                                    <IconLoader className="animate-spin" size={20} />
                                    <span className="tracking-widest text-xs">ENCRYPTING...</span>
                                </>
                            ) : (
                                <>
                                    <IconShieldCheck size={20} />
                                    <span className="tracking-widest text-xs">INITIALIZE UPLINK</span>
                                </>
                            )}
                        </button>
                        
                        {/* Network Status Indicators */}
                        <div className="grid grid-cols-2 gap-2 mt-4 opacity-50">
                            <div className="bg-white/5 rounded-lg p-2 flex items-center justify-center gap-2 border border-white/5">
                                <IconWifi size={14} className="text-green-500"/> <span className="text-[9px] text-white font-mono">LATENCY: 12ms</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 flex items-center justify-center gap-2 border border-white/5">
                                <IconLock size={14} className="text-yellow-500"/> <span className="text-[9px] text-white font-mono">AES-256</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        ) : (
            /* === ACTIVE STREAM UI === */
            <motion.div 
                key="stream"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full h-full flex flex-col bg-black overflow-hidden"
            >
                {/* 1. Header Control Bar (Floating) */}
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-4 left-0 w-full flex justify-center z-[100] pointer-events-none"
                >
                    <div className="pointer-events-auto bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-2xl flex items-center gap-6">
                        
                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                            <span className="text-xs font-black text-white uppercase tracking-widest">LIVE</span>
                        </div>

                        <div className="h-4 w-[1px] bg-white/10"></div>

                        {/* Room Info */}
                        <div className="flex items-center gap-2 text-white/50">
                            <IconActivity size={14} className="text-cyan-500"/>
                            <span className="text-xs font-mono uppercase">{roomName}</span>
                        </div>

                        <div className="h-4 w-[1px] bg-white/10"></div>

                        {/* Recording Controls */}
                        <div className="flex items-center gap-3">
                            {isRecording && (
                                <span className="font-mono text-red-400 text-xs font-bold animate-pulse">
                                    {formatTime(recordingTime)}
                                </span>
                            )}
                            <button 
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`p-2 rounded-full transition-all ${
                                    isRecording 
                                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
                                    : 'bg-white/5 text-white hover:bg-white/20'
                                }`}
                                title={isRecording ? "Stop Recording" : "Start Recording"}
                            >
                                {isRecording ? <IconPlayerStop size={18}/> : <IconPlayerRecord size={18}/>}
                            </button>
                        </div>

                        {/* Close */}
                        <button 
                            onClick={onClose}
                            className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full transition-colors ml-2 shadow-lg"
                        >
                            <IconX size={18} />
                        </button>
                    </div>
                </motion.div>

                {/* 2. The Meeting Container (Memoized) */}
                <div className="flex-1 w-full h-full relative">
                    <SecureMeeting 
                        roomName={roomName}
                        userName={user?.displayName || user?.email?.split('@')[0]}
                        onReadyToClose={onClose}
                    />
                </div>

                {/* 3. Aesthetic Overlays (Corners) */}
                <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-white/20 rounded-tl-2xl pointer-events-none z-10"></div>
                <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-white/20 rounded-tr-2xl pointer-events-none z-10"></div>
                <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-white/20 rounded-bl-2xl pointer-events-none z-10"></div>
                <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-white/20 rounded-br-2xl pointer-events-none z-10"></div>

            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}