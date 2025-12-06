"use client";
import React, { useState, useEffect } from "react";
// استخدام الاستيراد الديناميكي لتجنب مشاكل الـ SSR
import dynamic from 'next/dynamic';
import { IconX, IconBroadcast, IconLoader } from "@tabler/icons-react";

// استيراد Jitsi بشكل آمن جداً
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { ssr: false }
);

export default function RealLiveStream({ user, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  
  // حالة للتأكد من أننا في المتصفح
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // إذا لم يتم التحميل في المتصفح، لا تعرض شيئاً
  if (!mounted) return null;

  const startMeeting = () => {
    if (roomName.trim()) setIsJoined(true);
  };

  return (
    // استخدام z-index عالي جداً وخلفية سوداء كاملة
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'black', display: 'flex', flexDirection: 'column' }}>
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
        <h2 className="text-white font-bold flex items-center gap-2">
            <IconBroadcast className="text-red-500 animate-pulse" /> 
            {isJoined ? `LIVE: ${roomName}` : "LIVE OPS CENTER"}
        </h2>
        <button onClick={onClose} className="p-2 bg-red-600 text-white rounded hover:bg-red-700">
            <IconX />
        </button>
      </div>

      {/* المحتوى */}
      <div className="flex-1 relative w-full h-full flex items-center justify-center">
        {!isJoined ? (
            // شاشة الدخول (بسيطة ومباشرة)
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 text-center w-full max-w-md">
                <h1 className="text-2xl font-bold text-white mb-6">START BROADCAST</h1>
                <input 
                    type="text" 
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter Room Name (e.g. ROOM1)" 
                    className="w-full p-4 bg-black text-white border border-gray-600 rounded-lg mb-4 outline-none focus:border-blue-500 text-center uppercase font-mono"
                />
                <button 
                    onClick={startMeeting}
                    disabled={!roomName}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50"
                >
                    JOIN NOW
                </button>
            </div>
        ) : (
            // شاشة الاجتماع Jitsi
            <JitsiMeeting
                domain="meet.jit.si"
                roomName={`RussianApp_${roomName}`}
                configOverwrite={{
                    startWithAudioMuted: true,
                    disableThirdPartyRequests: true,
                    prejoinPageEnabled: false,
                }}
                interfaceConfigOverwrite={{
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_BACKGROUND: '#000000',
                }}
                userInfo={{
                    displayName: user?.email?.split('@')[0] || "User",
                }}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                }}
            />
        )}
      </div>
    </div>
  );
}