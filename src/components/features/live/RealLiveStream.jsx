"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBroadcast, IconX, IconLoader, IconPlayerRecord, 
  IconPlayerStop, IconMicrophone, IconWifi, IconLock, 
  IconDeviceTv, IconShieldCheck, IconActivity, IconCpu, IconServer
} from "@tabler/icons-react";

// استيراد Jitsi ديناميكيًا لتقليل وقت التحميل الأولي
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false, loading: () => <div className="bg-black w-full h-full" /> }
);

// --- 1. مكون الموجات الصوتية الوهمية (CSS Pure Performance) ---
// هذا المكون يعطي انطباع تحليل الصوت دون استهلاك المعالج
const FakeAudioVisualizer = () => (
  <div className="flex items-end gap-[2px] h-4">
    {[...Array(5)].map((_, i) => (
      <div 
        key={i} 
        className="w-1 bg-cyan-500/80 rounded-t-sm animate-pulse"
        style={{ 
            height: `${Math.random() * 100}%`,
            animationDuration: `${0.4 + Math.random() * 0.5}s` 
        }} 
      />
    ))}
  </div>
);

// --- 2. سجل النظام (Terminal Log) ---
const SystemLog = ({ logs }) => (
  <div className="font-mono text-[9px] text-green-500/60 h-16 overflow-hidden flex flex-col justify-end pointer-events-none">
    {logs.map((log, i) => (
      <motion.div 
        key={i} 
        initial={{ opacity: 0, x: -10 }} 
        animate={{ opacity: 1, x: 0 }}
        className="truncate"
      >
        {`> ${log}`}
      </motion.div>
    ))}
  </div>
);

// --- 3. مكون الفيديو المعزول (Memoized for Performance) ---
const SecureMeeting = React.memo(({ roomName, userName, onReadyToClose }) => {
  const configOverwrite = useMemo(() => ({
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    disableThirdPartyRequests: true,
    prejoinPageEnabled: false,
    resolution: 720,
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
    TOOLBAR_ALWAYS_VISIBLE: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
  }), []);

  return (
    <div className="w-full h-full bg-black relative z-0">
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
}, (prev, next) => prev.roomName === next.roomName);

SecureMeeting.displayName = "SecureMeeting";

// --- المكون الرئيسي ---
export default function RealLiveStream({ user, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [status, setStatus] = useState("idle"); // idle, scanning, connected
  const [isRecording, setIsRecording] = useState(false);
  const [logs, setLogs] = useState(["SYSTEM_READY", "WAITING FOR INPUT..."]);
  const [timer, setTimer] = useState("00:00");
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerInterval = useRef(null);

  // إضافة سجلات وهمية للمظهر الاحترافي
  const addLog = (msg) => setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString().split(' ')[0]} ${msg}`]);

  const handleJoin = () => {
    if (!roomName.trim()) return;
    setStatus("scanning");
    addLog("INITIATING HANDSHAKE...");
    
    // تسلسل دخول سينمائي
    setTimeout(() => addLog("ENCRYPTING TRAFFIC (AES-256)..."), 500);
    setTimeout(() => addLog("ESTABLISHING P2P BRIDGE..."), 1000);
    setTimeout(() => {
        setStatus("connected");
        addLog("CONNECTION SECURE.");
    }, 1800);
  };

  // منطق التسجيل
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style = "display: none";
        a.href = url;
        a.download = `Mission_Log_${roomName}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setIsRecording(false);
        clearInterval(timerInterval.current);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Timer Logic
      let seconds = 0;
      timerInterval.current = setInterval(() => {
          seconds++;
          const m = Math.floor(seconds / 60).toString().padStart(2, '0');
          const s = (seconds % 60).toString().padStart(2, '0');
          setTimer(`${m}:${s}`);
      }, 1000);

    } catch (err) {
      console.error(err);
      addLog("REC_ERROR: PERMISSION DENIED");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stop();
  };

  return (
    <div className="w-full h-full flex flex-col relative font-sans overflow-hidden bg-black">
      
      <AnimatePresence mode="wait">
        {status !== "connected" ? (
            /* === LOBBY: SECURE TERMINAL === */
            <motion.div 
                key="lobby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-10"
            >
                {/* Background Tech Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-[600px] h-[600px] border border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="w-[450px] h-[450px] border border-dashed border-cyan-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                </div>

                <div className="w-full max-w-md bg-[#050505]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1 overflow-hidden shadow-2xl">
                    <div className="bg-[#0a0a0a] rounded-xl p-8 border border-white/5 relative overflow-hidden">
                        
                        {/* Scanning Line Effect */}
                        {status === "scanning" && (
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-1/2 w-full animate-[scan_2s_linear_infinite] pointer-events-none"></div>
                        )}

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter">SECURE <span className="text-cyan-500">UPLINK</span></h2>
                                <p className="text-[10px] text-white/40 font-mono tracking-[0.2em]">SATELLITE V.9.2</p>
                            </div>
                            <IconBroadcast className={`text-cyan-500 ${status === 'scanning' ? 'animate-pulse' : ''}`} size={32} />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <IconDeviceTv className="text-white/30 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                </div>
                                <input 
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value.toUpperCase())}
                                    placeholder="FREQUENCY ID..."
                                    className="w-full bg-black border border-white/10 rounded-lg py-4 pl-12 pr-4 text-white outline-none focus:border-cyan-500/50 transition-all font-mono text-sm tracking-widest placeholder-white/20"
                                    disabled={status === "scanning"}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                                />
                            </div>

                            <button 
                                onClick={handleJoin}
                                disabled={!roomName || status === "scanning"}
                                className="w-full py-4 bg-white text-black font-black text-xs tracking-[0.2em] rounded-lg hover:bg-cyan-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === "scanning" ? <IconLoader className="animate-spin" size={16} /> : <IconShieldCheck size={16} />}
                                {status === "scanning" ? "ESTABLISHING..." : "INITIALIZE"}
                            </button>
                            
                            <div className="h-px w-full bg-white/5"></div>
                            
                            <SystemLog logs={logs} />
                        </div>
                    </div>
                </div>
            </motion.div>
        ) : (
            /* === ACTIVE STREAM HUD === */
            <motion.div 
                key="stream"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full h-full flex flex-col bg-black overflow-hidden"
            >
                {/* 1. HUD Top Bar */}
                <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
                    {/* Left Info */}
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg flex items-center gap-4 shadow-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                                <span className="text-xs font-black text-white tracking-widest">LIVE</span>
                            </div>
                            <div className="h-4 w-px bg-white/10"></div>
                            <div className="text-[10px] font-mono text-cyan-400 tracking-wider">
                                {roomName}
                            </div>
                        </div>
                        
                        {/* Fake Stats */}
                        <div className="flex gap-2">
                            <div className="bg-black/40 px-2 py-1 rounded border border-white/5 text-[9px] font-mono text-green-500 flex items-center gap-1">
                                <IconWifi size={10}/> 24ms
                            </div>
                            <div className="bg-black/40 px-2 py-1 rounded border border-white/5 text-[9px] font-mono text-yellow-500 flex items-center gap-1">
                                <IconCpu size={10}/> OPTIMAL
                            </div>
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 px-2 py-2 rounded-lg shadow-lg">
                        {/* Audio Viz */}
                        <div className="px-2 hidden sm:block">
                            <FakeAudioVisualizer />
                        </div>
                        
                        {isRecording && (
                            <span className="font-mono text-red-400 text-xs font-bold px-2 animate-pulse">
                                {timer}
                            </span>
                        )}

                        <div className="h-6 w-px bg-white/10 mx-1"></div>

                        <button 
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`p-2 rounded-md transition-all ${
                                isRecording 
                                ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
                                : 'bg-white/5 text-white hover:bg-white/20'
                            }`}
                            title={isRecording ? "Stop Recording" : "Start Recording"}
                        >
                            {isRecording ? <IconPlayerStop size={18}/> : <IconPlayerRecord size={18}/>}
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-md transition-colors ml-1"
                        >
                            <IconX size={18} />
                        </button>
                    </div>
                </div>

                {/* 2. The Meeting Container */}
                <div className="flex-1 w-full h-full relative">
                    <SecureMeeting 
                        roomName={roomName}
                        userName={user?.displayName || user?.email?.split('@')[0]}
                        onReadyToClose={onClose}
                    />
                    
                    {/* HUD Decorative Corners (Overlay) */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                        <svg className="w-full h-full opacity-30" preserveAspectRatio="none">
                            <path d="M 20 20 L 50 20 L 50 21 L 21 21 L 21 50 L 20 50 Z" fill="#06b6d4" />
                            <path d="M 20 20 L 30 30" stroke="#06b6d4" strokeWidth="1" />
                            
                            <path d="M 98% 20 L 95% 20" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2,2"/>
                            
                            <path d="M 20 95% L 20 98%" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2,2"/>
                        </svg>
                    </div>
                </div>

            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}