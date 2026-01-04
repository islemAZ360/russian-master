"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { 
  doc, updateDoc, arrayUnion, setDoc, onSnapshot, 
  collection, addDoc, serverTimestamp, getDoc 
} from "firebase/firestore";
import { 
  IconX, IconSend, IconMessage2, IconLoader, 
  IconShieldCheck, IconHeadset, IconCircleFilled 
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function SupportModal({ user, onClose }) {
  const { t, dir } = useLanguage();
  
  // --- حالات المحادثة ---
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef(null);

  // --- 1. مراقبة المحادثة في الوقت الفعلي ---
  useEffect(() => {
    if (!user) return;

    const ticketRef = doc(db, "support_tickets", user.uid);
    
    // الاشتراك في التحديثات الحية للمستند
    const unsub = onSnapshot(ticketRef, (snap) => {
        if (snap.exists()) {
            setHistory(snap.data().messages || []);
        } else {
            // إذا لم تكن هناك محادثة بعد، نترك التاريخ فارغاً
            setHistory([]);
        }
        setLoading(false);
        
        // التمرير لأسفل المحادثة بعد تحديث الرسائل
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });

    return () => unsub();
  }, [user]);

  // --- 2. وظيفة إرسال الرسالة ---
  const handleSendMessage = async () => {
    if (!msg.trim() || !user) return;
    
    const textToSend = msg;
    setMsg(""); // مسح الحقل فوراً لتحسين الاستجابة (Optimistic UI)
    setIsTyping(true);

    try {
        const ticketRef = doc(db, "support_tickets", user.uid);
        const newMsg = { 
            text: textToSend, 
            sender: 'user', 
            time: Date.now() 
        };

        const snap = await getDoc(ticketRef);

        if (!snap.exists()) {
            // إنشاء مستند جديد إذا كان المستخدم هو من بدأ
            await setDoc(ticketRef, {
                userId: user.uid,
                userEmail: user.email,
                messages: [newMsg],
                lastUpdate: Date.now(),
                status: 'new'
            });
        } else {
            // تحديث المستند الموجود (سواء بدأه الأدمن أو المستخدم سابقاً)
            await updateDoc(ticketRef, {
                messages: arrayUnion(newMsg),
                lastUpdate: Date.now(),
                status: 'user_replied'
            });
        }

        // إرسال إشعار للأدمن ليعلم بوجود رد جديد
        await addDoc(collection(db, "notifications"), {
            target: "admin", // مستهدف للأدمن فقط
            title: "NEW MESSAGE FROM OPERATIVE",
            message: `User ${user.displayName || user.email} sent a response.`,
            type: "admin_alert",
            linkUserId: user.uid,
            createdAt: serverTimestamp()
        });

    } catch (error) {
        console.error("Transmission Error:", error);
        alert("Signal failed. Please try again.");
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col h-[650px] shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
            dir={dir}
        >
            {/* الهيدر (Header) */}
            <div className="p-6 bg-white/[0.02] border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <IconHeadset size={28} />
                    </div>
                    <div>
                        <h3 className="text-white font-black uppercase tracking-tighter text-xl leading-none">
                            {t('nav_support')}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <IconCircleFilled size={8} className="text-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Secure Uplink Active</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2.5 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"
                >
                    <IconX size={24} />
                </button>
            </div>

            {/* منطقة الرسائل (Chat Body) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-[0.03]">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <IconLoader className="animate-spin mb-4" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Logs...</span>
                    </div>
                ) : history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-10">
                        <IconMessage2 size={64} className="text-white/5 mb-6" />
                        <p className="text-white/40 text-sm leading-relaxed font-medium">
                            {t('live_log_waiting')}... <br/> 
                            <span className="text-[10px] uppercase tracking-widest opacity-50">Our commanders are ready to assist.</span>
                        </p>
                    </div>
                ) : (
                    history.map((m, i) => {
                        const isAdmin = m.sender === 'admin';
                        return (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, x: isAdmin ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                            >
                                <div className={`flex flex-col gap-1.5 max-w-[85%] ${isAdmin ? 'items-start' : 'items-end'}`}>
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest px-1">
                                        {isAdmin ? "Command Center" : "You"}
                                    </span>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                        isAdmin 
                                        ? 'bg-[#1a1a1a] border border-white/5 text-zinc-200 rounded-tl-none' 
                                        : 'bg-cyan-600 text-white rounded-tr-none shadow-cyan-900/20'
                                    }`}>
                                        {m.text}
                                    </div>
                                    <span className="text-[7px] font-mono text-white/10 uppercase">
                                        {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={scrollRef} className="h-2" />
            </div>

            {/* منطقة الإدخال (Input Area) */}
            <div className="p-6 bg-black border-t border-white/5 shrink-0">
                <div className="flex gap-3 items-center relative">
                    <input 
                        value={msg} 
                        onChange={e => setMsg(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        disabled={loading}
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all font-medium text-sm placeholder:text-white/20" 
                        placeholder={t('support_placeholder') || "Enter transmission..."} 
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!msg.trim() || isTyping}
                        className="p-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:hover:bg-cyan-600 text-white rounded-2xl transition-all shadow-xl shadow-cyan-900/40 active:scale-95 shrink-0"
                    >
                        {isTyping ? <IconLoader className="animate-spin" /> : <IconSend size={24} />}
                    </button>
                </div>
                
                <div className="mt-4 flex justify-center items-center gap-2 opacity-20">
                    <IconShieldCheck size={12} />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">End-to-End Encrypted Tunnel</span>
                </div>
            </div>
        </motion.div>
    </div>
  );
}