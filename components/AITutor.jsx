"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconRobot, IconSend, IconCpu, IconMenu2, IconX, IconPlus, 
  IconMessage, IconTrash, IconEdit, IconCheck, IconMicrophone 
} from "@tabler/icons-react";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  deleteDoc, doc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";

// مفتاح API المباشر
const API_KEY = "AIzaSyDi8-POg6RGCoBCkni6_8XNikJvTmH4z3M";

export default function AITutor({ user }) {
  // --- States ---
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // للقائمة الجانبية في الموبايل
  
  // إدارة الجلسات
  const [sessions, setSessions] = useState([]); 
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // إعادة التسمية
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const scrollRef = useRef(null);

  // --- 1. تحميل قائمة المحادثات من Firebase ---
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "ai_chats"), 
      orderBy("lastUpdate", "desc") // الأحدث أولاً
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(loadedSessions);
    });
    return () => unsubscribe();
  }, [user]);

  // --- 2. تحميل رسائل الجلسة المختارة ---
  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) setMessages(session.messages || []);
    } else {
      setMessages([]); // جلسة جديدة فارغة
    }
  }, [currentSessionId, sessions]);

  // --- 3. السكرول التلقائي للأسفل ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- Actions ---

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const deleteChat = async (e, id) => {
    e.stopPropagation();
    if (confirm("Delete this neural memory?")) {
      await deleteDoc(doc(db, "users", user.uid, "ai_chats", id));
      if (currentSessionId === id) startNewChat();
    }
  };

  const startRenaming = (e, session) => {
    e.stopPropagation();
    setEditingTitleId(session.id);
    setNewTitle(session.title);
  };

  const saveTitle = async (e, id) => {
    e.stopPropagation();
    if (newTitle.trim()) {
      await updateDoc(doc(db, "users", user.uid, "ai_chats", id), { title: newTitle });
    }
    setEditingTitleId(null);
  };

  // --- Core Logic: Send & Save ---
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    
    // تحديث الواجهة فوراً (Optimistic UI)
    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // 1. الاتصال بـ Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ 
                text: `You are "Russian Master AI". 
                       Context: Teaching Russian to an Arabic speaker.
                       User: ${userMsg}
                       Reply concisely. If user uses Arabic, reply in Arabic. If Russian, correct errors.` 
              }]
            }]
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const botReply = data.candidates[0].content.parts[0].text;
      const finalMessages = [...newMessages, { role: "model", text: botReply }];
      
      setMessages(finalMessages);

      // 2. الحفظ في Firebase
      if (user) {
        if (!currentSessionId) {
          // إنشاء وثيقة جديدة لأول مرة
          const title = userMsg.substring(0, 30) + "...";
          const docRef = await addDoc(collection(db, "users", user.uid, "ai_chats"), {
            title,
            messages: finalMessages,
            createdAt: serverTimestamp(),
            lastUpdate: serverTimestamp()
          });
          setCurrentSessionId(docRef.id);
        } else {
          // تحديث الوثيقة الحالية
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
      
      {/* --- Sidebar (History) --- */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a0a] border-r border-white/10 transform transition-transform duration-300 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shrink-0
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-cyan-950/10">
            <h2 className="font-black tracking-widest text-cyan-500 text-sm">MEMORY LOGS</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><IconX size={20}/></button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
            <button 
                onClick={startNewChat}
                className="w-full py-3 bg-cyan-600/20 border border-cyan-500/50 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-600/40 transition-all text-cyan-400 font-bold text-xs tracking-wider"
            >
                <IconPlus size={16}/> NEW OPERATION
            </button>
        </div>

        {/* List of Chats (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {sessions.map(session => (
                <div 
                    key={session.id}
                    onClick={() => { setCurrentSessionId(session.id); setIsSidebarOpen(false); }}
                    className={`group p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all border ${
                        currentSessionId === session.id 
                        ? 'bg-white/10 border-cyan-500/50 text-white' 
                        : 'bg-transparent border-transparent hover:bg-white/5 text-white/50'
                    }`}
                >
                    {/* Title or Edit Input */}
                    {editingTitleId === session.id ? (
                        <div className="flex items-center gap-1 w-full">
                            <input 
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-black border border-cyan-500 rounded px-1 py-0.5 text-xs w-full outline-none"
                                autoFocus
                            />
                            <button onClick={(e) => saveTitle(e, session.id)} className="text-green-500"><IconCheck size={14}/></button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 truncate flex-1">
                                <IconMessage size={14} />
                                <span className="text-xs truncate font-mono">{session.title}</span>
                            </div>
                            
                            {/* Action Buttons (Hover Only) */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => startRenaming(e, session)} className="hover:text-blue-400 p-1"><IconEdit size={14}/></button>
                                <button onClick={(e) => deleteChat(e, session.id)} className="hover:text-red-400 p-1"><IconTrash size={14}/></button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        
        {/* Header */}
        <div className="h-16 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur flex items-center px-4 justify-between shrink-0 z-20">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-white/50 hover:text-white"><IconMenu2/></button>
                <div className="w-8 h-8 rounded-full bg-cyan-900/20 border border-cyan-500/50 flex items-center justify-center animate-pulse-slow">
                    <IconRobot size={18} className="text-cyan-400" />
                </div>
                <div>
                    <h3 className="font-bold text-sm tracking-widest">RUSSIAN MENTOR AI</h3>
                    <p className="text-[10px] text-white/30 font-mono uppercase">
                        {currentSessionId ? "Secure Connection" : "Standby Mode"}
                    </p>
                </div>
            </div>
        </div>

        {/* Messages List (THIS IS THE SCROLL FIX) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 scroll-smooth">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 select-none">
                    <IconCpu size={80} stroke={1} className="mb-4 animate-float"/>
                    <p className="text-sm tracking-[0.3em] uppercase">System Ready</p>
                    <p className="text-xs mt-2 font-mono">Ask anything in Arabic or Russian</p>
                </div>
            ) : (
                messages.map((msg, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "model" ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl border backdrop-blur-sm ${
                            msg.role === "model"
                            ? 'bg-[#111] border-white/10 text-gray-200 rounded-tl-none'
                            : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-50 rounded-tr-none'
                        }`}>
                            <div className="text-[9px] font-bold opacity-40 mb-2 uppercase flex gap-2 tracking-widest">
                                {msg.role === "model" ? <><IconCpu size={10}/> AI CORE</> : "OPERATIVE"}
                            </div>
                            <p className={`whitespace-pre-wrap leading-relaxed text-sm ${/[\u0600-\u06FF]/.test(msg.text) ? 'font-cairo text-right dir-rtl' : 'font-mono'}`}>
                                {msg.text}
                            </p>
                        </div>
                    </motion.div>
                ))
            )}
            
            {/* Loading Indicator */}
            {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs text-cyan-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                        PROCESSING...
                    </div>
                </motion.div>
            )}
            
            {/* Anchor for auto-scroll */}
            <div ref={scrollRef} className="h-4" />
        </div>

        {/* Input Area (Fixed Bottom) */}
        <div className="p-4 bg-[#0a0a0a] border-t border-white/10 shrink-0 z-20">
            <div className="flex gap-2 max-w-4xl mx-auto items-end">
                <div className="flex-1 bg-[#151515] border border-white/10 rounded-xl flex items-center focus-within:border-cyan-500/50 transition-colors">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type message..." 
                        className="w-full bg-transparent px-4 py-3 text-white outline-none font-mono text-sm"
                        dir="auto"
                    />
                </div>
                <button 
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                    <IconSend size={20} />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}