"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  IconBroadcast, IconLoader, IconDeviceTv, IconShieldCheck 
} from "@tabler/icons-react";
import { useUI } from "@/context/UIContext";

export default function RealLiveStream() {
  const { startBroadcast, liveStream, toggleMinimize } = useUI();
  const [roomName, setRoomName] = useState("");
  const [status, setStatus] = useState("idle");

  // --- المنطق الذكي (Auto-Maximize / Auto-Minimize) ---
  useEffect(() => {
    // 1. عند الدخول للصفحة: إذا كان البث شغالاً ومصغراً، كبّره
    if (liveStream.isActive && liveStream.isMinimized) {
        toggleMinimize(false);
    }

    // 2. عند الخروج من الصفحة (Cleanup): إذا كان البث شغالاً، صغره (لا تغلقه)
    return () => {
        // نتحقق من الحالة الحالية عبر دالة لضمان القيمة الأحدث
        // ملاحظة: لا نستطيع الوصول لـ liveStream.isActive المحدثة هنا بسهولة في الـ cleanup
        // لذلك نعتمد على أن المكون GlobalManager سيتعامل مع الـ View Change
        toggleMinimize(true); 
    };
  }, []);

  const handleJoin = () => {
    if (!roomName.trim()) return;
    setStatus("scanning");
    
    // تأخير سينمائي
    setTimeout(() => {
        startBroadcast(roomName); // تشغيل البث في الـ Global Manager
    }, 1500);
  };

  // إذا كان البث يعمل (في وضع الشاشة الكاملة)، نعرض رسالة انتظار أو لا شيء
  // لأن GlobalManager سيغطي هذه الصفحة بالكامل
  if (liveStream.isActive && !liveStream.isMinimized) {
      return null; // الفيديو يغطي كل شيء
  }

  // واجهة الدخول (Lobby)
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 animate-pulse">
                    <IconBroadcast size={40} className="text-cyan-400" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter">SECURE CHANNEL</h2>
            </div>

            <div className="space-y-4">
                <div className="relative group">
                    <IconDeviceTv className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                    <input 
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value.toUpperCase())}
                        placeholder="ENTER ROOM ID..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-cyan-500 transition-all font-mono text-center tracking-widest uppercase"
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    />
                </div>

                <button 
                    onClick={handleJoin}
                    disabled={!roomName || status === "scanning"}
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === "scanning" ? <IconLoader className="animate-spin" /> : <IconShieldCheck />}
                    {status === "scanning" ? "CONNECTING..." : "START UPLINK"}
                </button>
            </div>
        </motion.div>
    </div>
  );
}