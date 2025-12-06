"use client";
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { 
  IconBroadcast, IconX, IconLoader, IconUsers, IconVideo, 
  IconMicrophone, IconCopy, IconArrowRight 
} from "@tabler/icons-react";
import { motion } from "framer-motion";

// استيراد Jitsi بشكل ديناميكي
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false }
);

export default function RealLiveStream({ user, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setIsJoined(true);
    }, 1000);
  };

  const copyRoomName = () => {
    navigator.clipboard.writeText(roomName);
    alert("تم نسخ اسم الغرفة! أرسله لأصدقائك.");
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030014] flex flex-col font-sans overflow-hidden">
      
      {/* الخلفية المتحركة */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-900/10 to-black pointer-events-none"></div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* الحالة الأولى: شاشة اللوبي (اختيار الغرفة) */}
      {/* ---------------------------------------------------- */}
      {!isJoined ? (
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
            
            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-500 rounded-full transition-all"
            >
                <IconX size={24} />
            </button>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
                {/* ديكور نيون */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_20px_#06b6d4]"></div>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto bg-cyan-900/20 rounded-2xl flex items-center justify-center border border-cyan-500/30 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                        <IconBroadcast size={40} className="text-cyan-400 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-wider">LIVE OPS</h1>
                    <p className="text-white/40 text-sm">أنشئ غرفة أو انضم لزملائك</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest ml-1 mb-2 block">
                            Room ID (اسم الغرفة)
                        </label>
                        <div className="relative">
                            <input 
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="مثلاً: RUSSIA-1"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-12 text-white outline-none focus:border-cyan-500 focus:bg-white/10 transition-all font-mono text-lg placeholder:text-white/20"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                                <IconUsers size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] text-white/30 mt-2 text-right">
                            * شارك هذا الاسم مع أصدقائك ليدخلوا معك
                        </p>
                    </div>

                    <button 
                        type="submit"
                        disabled={!roomName || loading}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <IconLoader className="animate-spin"/> : <>START SESSION <IconArrowRight size={18}/></>}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/5 flex justify-center gap-8 text-white/30">
                    <div className="flex flex-col items-center gap-1">
                        <IconVideo size={20} />
                        <span className="text-[10px]">HD Video</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <IconMicrophone size={20} />
                        <span className="text-[10px]">Clear Audio</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <IconUsers size={20} />
                        <span className="text-[10px]">Multi-User</span>
                    </div>
                </div>
            </motion.div>
        </div>
      ) : (
        // ----------------------------------------------------
        // الحالة الثانية: داخل البث (Jitsi Meeting)
        // ----------------------------------------------------
        <div className="flex flex-col h-full w-full relative z-20 bg-black">
            
            {/* شريط العنوان أثناء البث */}
            <div className="h-14 bg-[#111] border-b border-white/10 flex justify-between items-center px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-white font-bold font-mono tracking-wider">{roomName}</span>
                    <button onClick={copyRoomName} className="text-white/30 hover:text-white transition-colors" title="Copy Room Name">
                        <IconCopy size={16} />
                    </button>
                </div>
                <button 
                    onClick={() => { if(confirm("هل تريد مغادرة البث؟")) { setIsJoined(false); setRoomName(""); } }} 
                    className="px-4 py-1.5 bg-red-900/20 border border-red-500/50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                    LEAVE
                </button>
            </div>

            {/* حاوية الفيديو - هنا كان الإصلاح الأساسي */}
            <div className="flex-1 w-full h-full relative">
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={`RM_APP_V2_${roomName}`} // بادئة فريدة لتجنب التداخل
                    configOverwrite={{
                        startWithAudioMuted: true,
                        disableThirdPartyRequests: true,
                        prejoinPageEnabled: false,
                        toolbarButtons: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'select-background', 'download', 'help', 'mute-everyone', 'security'
                        ]
                    }}
                    interfaceConfigOverwrite={{
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        DEFAULT_BACKGROUND: '#000000',
                        DEFAULT_REMOTE_DISPLAY_NAME: 'Fellow Operative',
                        TOOLBAR_ALWAYS_VISIBLE: true,
                    }}
                    userInfo={{
                        displayName: user?.email?.split('@')[0] || "Unknown Operative"
                    }}
                    getIFrameRef={(iframeRef) => {
                        // إجبار الـ iframe على أخذ كامل المساحة
                        iframeRef.style.height = '100%';
                        iframeRef.style.width = '100%';
                        iframeRef.style.border = 'none';
                        iframeRef.style.display = 'block';
                        iframeRef.style.position = 'absolute';
                        iframeRef.style.top = '0';
                        iframeRef.style.left = '0';
                        iframeRef.style.zIndex = '10';
                    }}
                />
            </div>
        </div>
      )}
    </div>
  );
}