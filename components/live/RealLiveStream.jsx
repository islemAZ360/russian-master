"use client";
import React, { useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { IconBroadcast, IconX, IconLoader } from "@tabler/icons-react";

export default function RealLiveStream({ user, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  // توليد اسم غرفة فريد لتجنب دخول غرباء
  const handleJoin = () => {
    if (!roomName.trim()) return;
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setIsJoined(true);
    }, 1500); // محاكاة تحميل بسيط
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col font-sans">
      
      {/* رأس الصفحة */}
      <div className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-md flex justify-between items-center px-6 z-50">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isJoined ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <h2 className="font-black tracking-widest text-white uppercase">
                {isJoined ? `LIVE: ${roomName}` : "LIVE OPERATIONS"}
            </h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-red-500 transition-colors">
            <IconX size={24}/>
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-black">
        {/* خلفية جمالية */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

        {!isJoined ? (
            // --- شاشة اللوبي (دخول الغرفة) ---
            <div className="h-full flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
                <div className="max-w-md w-full bg-[#111] border border-cyan-500/30 p-8 rounded-3xl relative shadow-[0_0_100px_rgba(6,182,212,0.15)]">
                    
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-cyan-900/20 rounded-full flex items-center justify-center border-2 border-cyan-500/50">
                            <IconBroadcast size={48} className="text-cyan-400" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-center text-white mb-2">SECURE CHANNEL</h1>
                    <p className="text-center text-white/40 text-sm mb-8 font-mono">Establish a secure video link</p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-cyan-500 tracking-widest ml-2">Channel Frequency (Name)</label>
                            <input 
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="ex: MOSCOW-1"
                                className="w-full bg-black border border-white/20 rounded-xl p-4 text-white outline-none focus:border-cyan-500 transition-all font-mono text-lg uppercase"
                            />
                        </div>

                        <button 
                            onClick={handleJoin}
                            disabled={!roomName || loading}
                            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <IconLoader className="animate-spin"/> : "INITIALIZE UPLINK"}
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            // --- شاشة الاجتماع (Jitsi) ---
            <div className="w-full h-full">
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={`RussianMaster_App_${roomName}`} // اسم فريد لتجنب التداخل مع غرف أخرى في العالم
                    configOverwrite={{
                        startWithAudioMuted: true,
                        disableThirdPartyRequests: true,
                        prejoinPageEnabled: false, // الدخول مباشرة بدون انتظار
                        theme: {
                            default: 'dark',
                        }
                    }}
                    interfaceConfigOverwrite={{
                        TOOLBAR_BUTTONS: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                            'security'
                        ],
                        // إخفاء شعار Jitsi لتبدو وكأنها خاصة بموقعك
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        DEFAULT_BACKGROUND: '#050505',
                    }}
                    userInfo={{
                        displayName: user?.email?.split('@')[0] || "Operative",
                        email: user?.email
                    }}
                    getIFrameRef={(iframeRef) => {
                        iframeRef.style.height = '100%';
                        iframeRef.style.width = '100%';
                        iframeRef.style.background = '#000';
                    }}
                />
            </div>
        )}
      </div>
    </div>
  );
}