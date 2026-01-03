"use client";
import React, { useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBroadcast, IconX, IconLoader, IconVideo, 
  IconPlayerRecord, IconPlayerStop, IconMicrophone, 
  IconWifi, IconLock, IconActivity, IconDeviceTv
} from "@tabler/icons-react";

// استيراد Jitsi بشكل ديناميكي لتجنب مشاكل SSR
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false }
);

export default function RealLiveStream({ user, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Fake Terminal Logs for aesthetic
  const [logs, setLogs] = useState(["Initializing uplink..."]);

  // --- Recording Logic ---
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if(!isJoined) {
        const interval = setInterval(() => {
            const msgs = ["Handshake protocol...", "Encrypting signal...", "Searching frequency...", "Ping: 12ms", "Packets: Secure"];
            setLogs(prev => [...prev.slice(-3), msgs[Math.floor(Math.random() * msgs.length)]]);
        }, 2000);
        return () => clearInterval(interval);
    }
  }, [isJoined]);

  const handleJoin = () => {
    if (!roomName.trim()) return;
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setIsJoined(true);
    }, 1500);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        saveVideo();
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Permission denied or error starting recording.");
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
    a.download = `mission-record-${new Date().toISOString().slice(0,10)}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden font-sans">
      
      {/* Background Ambience (Radar Effect) */}
      {!isJoined && (
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[50vw] h-[50vw] border border-[var(--accent-color)] rounded-full animate-[ping_4s_linear_infinite]"></div>
              <div className="w-[30vw] h-[30vw] border border-[var(--accent-color)] rounded-full animate-[ping_4s_linear_infinite_1s] absolute"></div>
          </div>
      )}

      <AnimatePresence mode="wait">
        {!isJoined ? (
            /* --- LOBBY SCREEN (SECURE TERMINAL) --- */
            <motion.div 
                key="lobby"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                className="flex-1 flex items-center justify-center p-4 z-10"
            >
                <div className="w-full max-w-lg bg-[var(--bg-secondary)]/80 backdrop-blur-2xl border border-[var(--text-muted)]/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    
                    {/* Top Tech Decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-50"></div>
                    
                    <div className="text-center mb-8 relative">
                        <div className="w-20 h-20 bg-[var(--accent-color)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--accent-color)]/20 shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]">
                            <IconBroadcast size={40} className="text-[var(--accent-color)] animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-1">
                            Live <span className="text-[var(--accent-color)]">Ops</span> Center
                        </h2>
                        <p className="text-[var(--text-muted)] text-xs font-mono tracking-[0.3em] uppercase">Secure Video Uplink V.9</p>
                    </div>

                    <div className="space-y-6">
                        {/* Status Indicators */}
                        <div className="flex justify-between px-4 py-2 bg-[var(--bg-primary)]/50 rounded-xl border border-[var(--text-muted)]/10 text-[10px] font-mono text-[var(--text-muted)] uppercase">
                            <span className="flex items-center gap-1"><IconWifi size={12} className="text-green-500"/> Signal: Strong</span>
                            <span className="flex items-center gap-1"><IconLock size={12} className="text-yellow-500"/> Encrypted</span>
                        </div>

                        {/* Input Field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IconDeviceTv className="text-[var(--text-muted)] group-focus-within:text-[var(--accent-color)] transition-colors" size={20} />
                            </div>
                            <input 
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="ENTER FREQUENCY ID (ROOM NAME)..."
                                className="w-full bg-[var(--bg-primary)] border border-[var(--text-muted)]/20 rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] placeholder-[var(--text-muted)]/40 outline-none focus:border-[var(--accent-color)] focus:shadow-[0_0_20px_rgba(var(--accent-rgb),0.15)] transition-all font-mono text-sm uppercase tracking-wide"
                            />
                        </div>

                        {/* Connect Button */}
                        <button 
                            onClick={handleJoin}
                            disabled={!roomName || loading}
                            className="w-full py-4 bg-[var(--accent-color)] hover:brightness-110 text-white font-bold rounded-2xl shadow-lg shadow-[var(--accent-color)]/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            {loading ? (
                                <IconLoader className="animate-spin" />
                            ) : (
                                <>
                                    <span className="tracking-[0.2em] relative z-10">ESTABLISH LINK</span>
                                    <IconArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" size={18} />
                                </>
                            )}
                        </button>

                        {/* Fake Logs */}
                        <div className="h-16 overflow-hidden flex flex-col justify-end text-[9px] font-mono text-[var(--text-muted)] opacity-60 border-t border-[var(--text-muted)]/10 pt-2">
                            {logs.map((log, i) => (
                                <motion.div key={i} initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}}>{`> ${log}`}</motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        ) : (
            /* --- ACTIVE STREAM UI --- */
            <motion.div 
                key="stream"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-[var(--accent-color)]/20"
            >
                {/* Floating Control Bar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-2xl transition-opacity duration-300 hover:bg-black/80">
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 pr-3 border-r border-white/10">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                        <span className="text-[10px] font-bold text-white tracking-widest uppercase">Live</span>
                    </div>

                    <div className="text-xs font-mono text-white/80 uppercase tracking-wider px-2">
                        {roomName}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                        <button 
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`p-2 rounded-full transition-all ${
                                isRecording 
                                ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50' 
                                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                            title={isRecording ? "Stop Recording" : "Start Recording"}
                        >
                            {isRecording ? <IconPlayerStop size={16}/> : <IconPlayerRecord size={16}/>}
                        </button>
                        
                        <button 
                            onClick={onClose} 
                            className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-all shadow-lg"
                            title="Disconnect"
                        >
                            <IconX size={16}/>
                        </button>
                    </div>
                </div>

                {/* Video Area */}
                <div className="flex-1 w-full h-full relative">
                    <JitsiMeeting
                        domain="meet.jit.si"
                        roomName={`RussianMaster_Secure_${roomName}`}
                        configOverwrite={{
                            startWithAudioMuted: false,
                            disableThirdPartyRequests: true,
                            prejoinPageEnabled: false,
                            toolbarButtons: [
                                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                                'fodeviceselection', 'hangup', 'chat', 'raisehand',
                                'videoquality', 'tileview', 'select-background'
                            ]
                        }}
                        interfaceConfigOverwrite={{
                            SHOW_JITSI_WATERMARK: false,
                            SHOW_WATERMARK_FOR_GUESTS: false,
                            DEFAULT_BACKGROUND: '#000000',
                            TOOLBAR_ALWAYS_VISIBLE: false, // Hide toolbar to use our custom header mostly
                        }}
                        userInfo={{
                            displayName: user?.displayName || user?.email?.split('@')[0] || "Operative"
                        }}
                        getIFrameRef={(iframeRef) => {
                            iframeRef.style.height = '100%';
                            iframeRef.style.width = '100%';
                            iframeRef.style.border = 'none';
                            iframeRef.style.background = 'black';
                        }}
                    />
                    
                    {/* Tech Corners Overlay */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[var(--accent-color)]/30 pointer-events-none"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[var(--accent-color)]/30 pointer-events-none"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[var(--accent-color)]/30 pointer-events-none"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[var(--accent-color)]/30 pointer-events-none"></div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Icon helper since I used ArrowRight inside the button
const IconArrowRight = ({className, size}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M5 12l14 0" />
      <path d="M13 18l6 -6" />
      <path d="M13 6l6 6" />
    </svg>
);