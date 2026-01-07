"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  IconBroadcast, IconLoader, IconDeviceTv, 
  IconShieldCheck, IconWifi, IconSchool, IconChalkboard 
} from "@tabler/icons-react";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export default function RealLiveStream() {
  const { startBroadcast, liveState } = useUI(); 
  const { user, userData, isTeacher, isStudent } = useAuth();
  const { t, dir } = useLanguage();
  
  const [roomName, setRoomName] = useState("");
  const [status, setStatus] = useState("idle"); // idle, scanning, connected
  const [logs, setLogs] = useState([]);

  // سجلات النظام (Log Console)
  const addLog = (msg) => setLogs(prev => [...prev.slice(-3), `> ${msg}`]);

  // --- 1. بدء البث للأستاذ (مع إرسال الإشعارات) ---
  const handleStartClass = async () => {
      setStatus("scanning");
      addLog("INITIALIZING CLASSROOM PROTOCOL...");
      
      // اسم الغرفة الثابت للأستاذ
      const classRoomId = `CLASS_${user.uid}`;
      
      try {
          addLog("BROADCASTING SIGNAL TO SQUAD...");
          
          // 1. جلب جميع الطلاب المرتبطين بهذا الأستاذ
          const q = query(collection(db, "users"), where("teacherId", "==", user.uid));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
              // 2. إرسال إشعار لكل طالب
              const notificationsPromises = snapshot.docs.map(studentDoc => {
                  return addDoc(collection(db, "notifications"), {
                      userId: studentDoc.id,
                      target: 'student',
                      type: 'live_start', // النوع الجديد الذي يفهمه NotificationCenter
                      title: "🔴 LIVE CLASS STARTED",
                      message: `Commander ${user.displayName || "Teacher"} is live now. Tap to join!`,
                      roomId: classRoomId, // نمرر معرف الغرفة ليدخل الطالب مباشرة
                      senderId: user.uid,
                      createdAt: serverTimestamp(),
                      read: false
                  });
              });
              
              await Promise.all(notificationsPromises);
              addLog(`SIGNAL SENT TO ${snapshot.size} OPERATIVES.`);
          } else {
              addLog("NO OPERATIVES FOUND IN ROSTER.");
          }
      } catch (error) {
          console.error("Failed to notify students:", error);
          addLog("WARNING: SIGNAL RELAY FAILED.");
      }
      
      // تأخير بسيط للمحاكاة قبل الدخول
      setTimeout(() => {
          addLog("SECURE CHANNEL ESTABLISHED.");
          startBroadcast(classRoomId); 
      }, 1500);
  };

  // --- 2. انضمام الطالب لصف أستاذه ---
  const handleJoinClass = () => {
      if (!userData?.teacherId) {
          addLog("ERROR: NO COMMANDER ASSIGNED.");
          return;
      }

      setStatus("scanning");
      addLog("SEARCHING FOR COMMANDER SIGNAL...");
      
      const targetRoomId = `CLASS_${userData.teacherId}`;
      
      setTimeout(() => {
          addLog("UPLINK SUCCESSFUL.");
          startBroadcast(targetRoomId); 
      }, 1500);
  };

  // --- 3. انضمام يدوي (للمستخدمين العاديين) ---
  const handleManualJoin = () => {
    if (!roomName.trim()) return;
    setStatus("scanning");
    addLog(t('live_log_encrypt'));
    
    setTimeout(() => {
        addLog(t('live_log_established'));
        startBroadcast(roomName.toUpperCase()); 
    }, 1500);
  };

  // --- حالة: البث نشط حالياً (Screen Active) ---
  if (liveState.isActive) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full text-center" dir={dir}>
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                <div className="w-24 h-24 rounded-full border-4 border-cyan-500/30 flex items-center justify-center animate-pulse mb-6 relative z-10 bg-black/50">
                    <IconWifi size={40} className="text-cyan-500"/>
                </div>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">{t('live_active_msg')}</h2>
            <p className="text-white/40 font-mono text-sm mb-8 uppercase tracking-widest">
                {t('live_secure_channel')}: <span className="text-cyan-400">{liveState.roomName}</span>
            </p>
            <div className="text-xs text-cyan-500/50 font-mono border border-cyan-500/20 px-6 py-3 rounded-xl bg-cyan-950/10">
                {t('live_active_desc')}
            </div>
        </div>
      );
  }

  return (
    <div className="w-full h-full flex flex-col relative font-sans overflow-hidden items-center justify-center p-6" dir={dir}>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group"
        >
            {/* Header Icon */}
            <div className="text-center mb-10 relative z-10">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 border shadow-[0_0_40px_rgba(0,0,0,0.3)]
                    ${isTeacher 
                        ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' 
                        : isStudent 
                            ? 'bg-indigo-900/20 border-indigo-500/30 text-indigo-400'
                            : 'bg-zinc-900/50 border-white/10 text-white/50'
                    }`}
                >
                    {isTeacher ? <IconChalkboard size={48}/> : isStudent ? <IconSchool size={48}/> : <IconBroadcast size={48}/>}
                </div>
                
                <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">
                    {isTeacher ? "Command Center" : isStudent ? "Academy Uplink" : "Neural Link"}
                </h2>
                <div className="flex items-center justify-center gap-2 text-[9px] font-mono text-white/30 uppercase tracking-[0.3em]">
                    {isTeacher ? "Broadcast V.4.0" : isStudent ? "Receiver V.4.0" : "Secure Gateway V.4.0"}
                </div>
            </div>

            {/* Actions Area */}
            <div className="space-y-6 relative z-10">
                
                {/* --- واجهة الأستاذ --- */}
                {isTeacher && (
                    <button 
                        onClick={handleStartClass}
                        disabled={status === "scanning"}
                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === "scanning" ? <IconLoader className="animate-spin" size={24} /> : <IconBroadcast size={24} />}
                        <span className="tracking-widest text-xs uppercase">INITIATE CLASS SESSION</span>
                    </button>
                )}

                {/* --- واجهة الطالب --- */}
                {isStudent && (
                    <button 
                        onClick={handleJoinClass}
                        disabled={status === "scanning" || !userData?.teacherId}
                        className={`w-full py-5 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                        ${!userData?.teacherId ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'}`}
                    >
                        {status === "scanning" ? <IconLoader className="animate-spin" size={24} /> : <IconSchool size={24} />}
                        <span className="tracking-widest text-xs uppercase">
                            {userData?.teacherId ? "JOIN COMMANDER'S ROOM" : "NO ASSIGNED TEACHER"}
                        </span>
                    </button>
                )}

                {/* --- واجهة المستخدم العادي (أو خيار إضافي للجميع) --- */}
                {(!isTeacher && !isStudent) && (
                    <div className="space-y-4">
                        <div className="relative group/input">
                            <IconDeviceTv className={`absolute top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-cyan-400 transition-colors ${dir === 'rtl' ? 'right-4' : 'left-4'}`} size={20} />
                            <input 
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value.toUpperCase())}
                                placeholder={t('live_enter_id')}
                                className={`w-full bg-black/50 border border-white/10 rounded-xl py-4 ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white outline-none focus:border-cyan-500 focus:bg-cyan-950/10 transition-all font-mono text-sm uppercase tracking-widest`}
                                disabled={status === "scanning"}
                                onKeyDown={(e) => e.key === 'Enter' && handleManualJoin()}
                            />
                        </div>
                        <button 
                            onClick={handleManualJoin}
                            disabled={!roomName || status === "scanning"}
                            className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                        >
                            {status === "scanning" ? <IconLoader className="animate-spin" size={18} /> : <IconShieldCheck size={18} />}
                            <span className="tracking-widest text-xs">{t('live_connect_btn')}</span>
                        </button>
                    </div>
                )}
                
                {/* Console Logs */}
                <div className="bg-black/40 rounded-xl p-4 h-24 overflow-hidden font-mono text-[9px] text-green-500/70 border border-white/5 flex flex-col justify-end text-left shadow-inner" dir="ltr">
                    {logs.length === 0 && <span className="opacity-30">Waiting for command...</span>}
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </motion.div>
    </div>
  );
}