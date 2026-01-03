"use client";
import React, { useState, useRef } from "react";
import dynamic from 'next/dynamic';
import { 
  IconBroadcast, IconX, IconLoader, IconVideo, 
  IconPlayerRecord, IconPlayerStop, IconDownload, IconMicrophone 
} from "@tabler/icons-react";

// استيراد Jitsi بشكل ديناميكي
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false }
);

export default function RealLiveStream({ user, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // --- منطق التسجيل ---
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleJoin = () => {
    if (!roomName.trim()) return;
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setIsJoined(true);
    }, 800);
  };

  // بدء تسجيل الشاشة
  const startRecording = async () => {
    try {
      // طلب إذن تسجيل الشاشة والصوت
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true // لتسجيل صوت المحاضرة
      });

      // إعداد المسجل
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        saveVideo();
        setIsRecording(false);
        
        // إيقاف التراكات (لإغلاق شارة التسجيل في المتصفح)
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (err) {
      console.error("Error starting recording:", err);
      alert("تعذر بدء التسجيل. تأكد من منح الأذونات.");
    }
  };

  // إيقاف التسجيل
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // حفظ الفيديو
  const saveVideo = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = `russian-lecture-${new Date().toISOString().slice(0,10)}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert("تم حفظ المحاضرة بنجاح!");
  };

  return (
    // حاوية رئيسية بتصميم زجاجي محسن
    <div className="w-full h-[85vh] flex flex-col bg-[#050505] rounded-3xl border border-cyan-500/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-50 font-sans">
      
      {/* شريط العنوان المطور */}
      <div className="h-16 bg-[#0a0a0a] border-b border-white/5 flex justify-between items-center px-6 shrink-0 relative overflow-hidden">
        {/* تأثير خلفية للشريط */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 to-transparent pointer-events-none"></div>

        <div className="flex items-center gap-4 z-10">
            <div className="relative">
                <div className={`w-3 h-3 rounded-full ${isJoined ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500'}`}></div>
                {isJoined && <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>}
            </div>
            <div>
                <h2 className="font-black text-white tracking-[0.2em] text-sm md:text-base">
                    {isJoined ? `FREQ: ${roomName.toUpperCase()}` : "LIVE OPS CENTER"}
                </h2>
                {isRecording && <span className="text-[10px] text-red-500 font-bold animate-pulse">● REC {new Date().toLocaleTimeString()}</span>}
            </div>
        </div>

        <div className="flex items-center gap-2 z-10">
            {/* زر التسجيل يظهر فقط عند الانضمام */}
            {isJoined && (
                <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all border ${
                        isRecording 
                        ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                        : 'bg-white/5 border-white/10 text-white hover:border-cyan-500 hover:text-cyan-400'
                    }`}
                >
                    {isRecording ? <><IconPlayerStop size={16}/> STOP REC</> : <><IconPlayerRecord size={16}/> REC SCREEN</>}
                </button>
            )}

            <button onClick={onClose} className="p-2 hover:bg-red-500/20 text-white/30 hover:text-red-500 rounded-lg transition-all">
                <IconX size={20}/>
            </button>
        </div>
      </div>

      {/* منطقة المحتوى */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        
        {!isJoined ? (
            // --- شاشة الدخول (Lobby) بتصميم جديد ---
            <div className="w-full max-w-md p-8 flex flex-col gap-6 relative z-10">
                {/* تأثيرات الخلفية */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="text-center relative">
                    <div className="w-24 h-24 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] group">
                        <IconVideo size={48} className="text-cyan-500 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">SECURE CHANNEL</h3>
                    <p className="text-white/40 text-sm font-mono">Enter frequency ID to initialize uplink.</p>
                </div>

                <div className="space-y-4 relative">
                    <div className="group">
                        <label className="text-[10px] font-bold text-cyan-500 uppercase ml-1 mb-2 block tracking-widest">Channel Identity</label>
                        <div className="relative">
                            <input 
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="SQUAD-ALPHA"
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-5 pr-12 text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all font-mono uppercase text-lg placeholder:text-white/10"
                            />
                            <IconMicrophone className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={20}/>
                        </div>
                    </div>

                    <button 
                        onClick={handleJoin}
                        disabled={!roomName || loading}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? <IconLoader className="animate-spin"/> : (
                            <>
                                <IconBroadcast size={20} className="group-hover:animate-pulse"/> 
                                <span className="tracking-widest">ESTABLISH LINK</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        ) : (
            // --- شاشة الفيديو (Jitsi) ---
            <div className="w-full h-full relative">
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={`RussianApp_Secure_${roomName}`}
                    configOverwrite={{
                        startWithAudioMuted: false,
                        disableThirdPartyRequests: true,
                        prejoinPageEnabled: false,
                        toolbarButtons: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat', 
                            'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'select-background', 'download', 'help', 'mute-everyone'
                        ]
                    }}
                    interfaceConfigOverwrite={{
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        DEFAULT_BACKGROUND: '#000000',
                        TOOLBAR_ALWAYS_VISIBLE: true,
                        DEFAULT_REMOTE_DISPLAY_NAME: 'Operative',
                    }}
                    userInfo={{
                        displayName: user?.email?.split('@')[0] || "Operative"
                    }}
                    getIFrameRef={(iframeRef) => {
                        iframeRef.style.height = '100%';
                        iframeRef.style.width = '100%';
                        iframeRef.style.border = 'none';
                    }}
                />
            </div>
        )}
      </div>
    </div>
  );
}