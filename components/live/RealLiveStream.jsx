"use client";
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { IconBroadcast, IconX, IconLoader, IconVideo, IconUsers } from "@tabler/icons-react";

// استيراد Jitsi (ديناميكي)
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false }
);

export default function RealLiveStream({ user, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoin = () => {
    if (!roomName.trim()) return;
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setIsJoined(true);
    }, 500);
  };

  return (
    // استخدام w-full h-full لملء المساحة المتاحة داخل الصفحة بدلاً من fixed
    <div className="w-full h-[80vh] flex flex-col bg-[#111] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative z-50">
      
      {/* شريط العنوان */}
      <div className="h-16 bg-black/50 border-b border-white/10 flex justify-between items-center px-6 shrink-0">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isJoined ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <h2 className="font-bold text-white tracking-widest">
                {isJoined ? `LIVE: ${roomName.toUpperCase()}` : "LIVE OPERATIONS"}
            </h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-500/20 text-white/50 hover:text-red-500 rounded-lg transition-all">
            <IconX size={20}/>
        </button>
      </div>

      {/* منطقة المحتوى */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        
        {!isJoined ? (
            // --- شاشة الدخول (واجهة بسيطة وواضحة) ---
            <div className="w-full max-w-md p-6 flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
                <div className="text-center">
                    <div className="w-20 h-20 bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                        <IconVideo size={40} className="text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">START SESSION</h3>
                    <p className="text-white/40 text-sm">Enter a unique ID to create or join a room.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-cyan-500 uppercase ml-1 mb-1 block">Room ID</label>
                        <input 
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Ex: SQUAD-1"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-500 focus:bg-white/10 transition-all font-mono uppercase text-lg"
                        />
                    </div>

                    <button 
                        onClick={handleJoin}
                        disabled={!roomName || loading}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <IconLoader className="animate-spin"/> : <><IconBroadcast size={20}/> CONNECT NOW</>}
                    </button>
                </div>
            </div>
        ) : (
            // --- شاشة الفيديو (Jitsi) ---
            <div className="w-full h-full bg-gray-900">
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={`RussianApp_${roomName}`}
                    configOverwrite={{
                        startWithAudioMuted: false,
                        disableThirdPartyRequests: true,
                        prejoinPageEnabled: false,
                        toolbarButtons: ['microphone', 'camera', 'desktop', 'chat', 'raisehand', 'tileview', 'hangup']
                    }}
                    interfaceConfigOverwrite={{
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        DEFAULT_BACKGROUND: '#000000',
                        TOOLBAR_ALWAYS_VISIBLE: true,
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