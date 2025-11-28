"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IconRobot, IconSend, IconMenu2, IconX, IconPlus, IconMessage } from "@tabler/icons-react";
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function AITutor({ user }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [sessions, setSessions] = useState([]); 
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const scrollRef = useRef(null);

  // جلب الجلسات
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "ai_chats"), orderBy("lastUpdate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // جلب الرسائل عند تغيير الجلسة
  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) setMessages(session.messages || []);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, sessions]);

  // التمرير للأسفل تلقائياً
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsgText = input;
    const newHistory = [...messages, { role: "user", text: userMsgText }];
    
    setInput("");
    setMessages(newHistory);
    setLoading(true);

    try {
      // الاتصال بالـ API الذي أنشأناه في الخطوة 1
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.reply || "Server Error");

      const botReply = { role: "model", text: data.reply };
      const finalMessages = [...newHistory, botReply];
      
      setMessages(finalMessages);

      // الحفظ في Firebase
      if (user) {
        if (!currentSessionId) {
          const title = userMsgText.substring(0, 25) + "...";
          const docRef = await addDoc(collection(db, "users", user.uid, "ai_chats"), {
            title,
            messages: finalMessages,
            createdAt: serverTimestamp(),
            lastUpdate: serverTimestamp()
          });
          setCurrentSessionId(docRef.id);
        } else {
          await updateDoc(doc(db, "users", user.uid, "ai_chats", currentSessionId), {
            messages: finalMessages,
            lastUpdate: serverTimestamp()
          });
        }
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: "model", text: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex bg-[#050505] overflow-hidden relative font-sans text-white">
      
      {/* القائمة الجانبية */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a0a] border-r border-white/10 transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shrink-0`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-cyan-950/10">
            <h2 className="font-black tracking-widest text-cyan-500 text-sm">LOGS</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><IconX size={20}/></button>
        </div>
        <div className="p-3">
            <button onClick={startNewChat} className="w-full py-3 bg-cyan-600/20 border border-cyan-500/50 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-600/40 text-cyan-400 font-bold text-xs tracking-wider">
                <IconPlus size={16}/> NEW
            </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {sessions.map(session => (
                <div key={session.id} onClick={() => { setCurrentSessionId(session.id); setIsSidebarOpen(false); }} className={`p-3 rounded-lg cursor-pointer transition-all border ${currentSessionId === session.id ? 'bg-white/10 border-cyan-500/50' : 'border-transparent hover:bg-white/5'}`}>
                    <div className="flex items-center gap-2"><IconMessage size={14}/><span className="text-xs truncate font-mono">{session.title}</span></div>
                </div>
            ))}
        </div>
      </div>

      {/* منطقة المحادثة */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        <div className="h-16 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur flex items-center px-4 justify-between shrink-0 z-20">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-white/50"><IconMenu2/></button>
                <div className="w-8 h-8 rounded-full bg-cyan-900/20 border border-cyan-500/50 flex items-center justify-center"><IconRobot size={18} className="text-cyan-400" /></div>
                <h3 className="font-bold text-sm tracking-widest">AI MENTOR</h3>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 pb-32">
            {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-white/20 text-sm font-mono">SYSTEM READY...</div>
            )}
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "model" ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl border backdrop-blur-sm ${msg.role === "model" ? 'bg-[#111] border-white/10 text-gray-200' : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-50'}`}>
                        <p className={`whitespace-pre-wrap text-sm ${/[\u0600-\u06FF]/.test(msg.text) ? 'font-cairo text-right dir-rtl' : 'font-mono'}`}>{msg.text}</p>
                    </div>
                </div>
            ))}
            {loading && <div className="text-cyan-500 text-xs animate-pulse ml-4">Processing...</div>}
            <div ref={scrollRef}></div>
        </div>

        {/* مربع الإدخال */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-[#0a0a0a] border-t border-white/10 z-30 mb-16 md:mb-0">
            <div className="flex gap-2 max-w-4xl mx-auto">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Enter command..." className="flex-1 bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 font-mono text-sm" />
                <button onClick={sendMessage} disabled={loading} className="bg-cyan-600 text-white p-3 rounded-xl disabled:opacity-50"><IconSend size={20} /></button>
            </div>
        </div>
      </div>
    </div>
  );
}