"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconRobot, IconSend, IconCpu, IconPlus, IconTrash, 
  IconMessage, IconMenu2, IconX, IconDeviceFloppy 
} from "@tabler/icons-react";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  deleteDoc, doc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase"; // تأكد أن مسار الاستيراد صحيح

// مفتاحك المباشر
const API_KEY = "AIzaSyDi8-POg6RGCoBCkni6_8XNikJvTmH4z3M";

export default function AITutor({ user }) {
  // --- الحالات (State) ---
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // إدارة المحادثات
  const [sessions, setSessions] = useState([]); // قائمة المحادثات المحفوظة
  const [currentSessionId, setCurrentSessionId] = useState(null); // المحادثة الحالية
  const [messages, setMessages] = useState([]); // رسائل المحادثة الحالية

  const scrollRef = useRef(null);

  // 1. جلب قائمة المحادثات السابقة من Firebase
  useEffect(() => {
    if (!user) return;
    
    // جلب المحادثات الخاصة بالمستخدم فقط
    const q = query(
      collection(db, "users", user.uid, "ai_chats"), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(loadedSessions);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. تحميل رسائل المحادثة المختارة
  useEffect(() => {
    if (!currentSessionId && sessions.length > 0) {
        // لا تختار تلقائياً، اترك المستخدم يختار أو ينشئ جديداً
        // setMessages([]); 
    } else if (currentSessionId) {
        const session = sessions.find(s => s.id === currentSessionId);
        if (session) {
            setMessages(session.messages || []);
        }
    }
  }, [currentSessionId, sessions]);

  // 3. السكرول التلقائي لآخر رسالة
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- الوظائف (Actions) ---

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const deleteChat = async (e, chatId) => {
    e.stopPropagation(); // منع فتح الشات عند الضغط على الحذف
    if(!confirm("Are you sure you want to delete this memory data?")) return;
    
    await deleteDoc(doc(db, "users", user.uid, "ai_chats", chatId));
    if (currentSessionId === chatId) {
        startNewChat();
    }
  };

  const saveToFirebase = async (newMessages, generatedTitle = null) => {
    if (!user) return;

    // إذا كانت محادثة جديدة
    if (!currentSessionId) {
        const title = generatedTitle || newMessages[0].text.substring(0, 30) + "...";
        const docRef = await addDoc(collection(db, "users", user.uid, "ai_chats"), {
            createdAt: serverTimestamp(),
            title: title,
            messages: newMessages
        });
        setCurrentSessionId(docRef.id);
    } else {
        // تحديث محادثة موجودة
        const chatRef = doc(db, "users", user.uid, "ai_chats", currentSessionId);
        await updateDoc(chatRef, {
            messages: newMessages,
            lastUpdate: serverTimestamp()
        });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    
    // تحديث الواجهة فوراً
    const updatedMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // إرسال الطلب لجوجل
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { 
                    // --- التعديل هنا: تعليمات مرنة جداً ---
                    text: `
                      You are "Russian Master AI", a highly intelligent assistant with a Cyberpunk personality.
                      
                      CORE DIRECTIVES:
                      1. ANSWER ANY QUESTION the user asks, in ANY language they use.
                      2. If the user asks about Russian language, be a strict tutor.
                      3. If the user asks about programming, life, history, or chat casually, answer helpfully and normally.
                      4. TONE: Professional, slightly futuristic, helpful.
                      
                      User History: ${JSON.stringify(messages.slice(-5))}
                      Current Message: ${userMsg}
                    ` 
                  }
                ]
              }
            ]
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const botReply = data.candidates[0].content.parts[0].text;
      const finalMessages = [...updatedMessages, { role: "model", text: botReply }];
      
      setMessages(finalMessages);
      
      // حفظ في قاعدة البيانات
      await saveToFirebase(finalMessages);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "model", text: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex bg-[#050505] overflow-hidden relative font-sans text-white">
      
      {/* --- Sidebar (History) --- */}
      <div className={`
        fixed md:relative z-30 w-72 h-full bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="font-black tracking-widest text-cyan-500">DATA LOGS</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden"><IconX/></button>
        </div>

        <div className="p-3">
            <button 
                onClick={startNewChat}
                className="w-full py-3 bg-cyan-900/20 border border-cyan-500/50 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all text-cyan-400 font-bold text-sm"
            >
                <IconPlus size={18}/> NEW SESSION
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {sessions.map(session => (
                <div 
                    key={session.id}
                    onClick={() => { setCurrentSessionId(session.id); setSidebarOpen(false); }}
                    className={`group p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all border ${
                        currentSessionId === session.id 
                        ? 'bg-white/10 border-cyan-500/50 text-white' 
                        : 'bg-transparent border-transparent hover:bg-white/5 text-white/50'
                    }`}
                >
                    <div className="flex items-center gap-3 truncate">
                        <IconMessage size={16} />
                        <span className="text-xs truncate max-w-[140px] font-mono">
                            {session.title || "Unknown Data"}
                        </span>
                    </div>
                    <button 
                        onClick={(e) => deleteChat(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                    >
                        <IconTrash size={14} />
                    </button>
                </div>
            ))}
        </div>
      </div>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Header */}
        <div className="h-16 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur flex items-center px-4 justify-between shrink-0 z-20">
            <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/50"><IconMenu2/></button>
                <div className="w-8 h-8 rounded-full bg-cyan-900/20 border border-cyan-500/50 flex items-center justify-center">
                    <IconRobot size={18} className="text-cyan-400" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">AI MENTOR V2</h3>
                    <p className="text-[10px] text-white/30 uppercase">
                        {currentSessionId ? "Session Recorded" : "Unsaved Channel"}
                    </p>
                </div>
            </div>
        </div>

        {/* Messages List (Scrollable) */}
        {/* السر هنا: flex-1 مع overflow-y-auto يسمح بالسكرول داخل هذا الجزء فقط */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                    <IconCpu size={64} stroke={1} className="mb-4 animate-pulse"/>
                    <p className="text-sm tracking-widest uppercase">System Ready.</p>
                    <p className="text-xs mt-2">Ask me anything in any language.</p>
                </div>
            ) : (
                messages.map((msg, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "model" ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl border ${
                            msg.role === "model"
                            ? 'bg-[#111] border-white/10 text-gray-200 rounded-tl-none'
                            : 'bg-cyan-900/20 border-cyan-500/30 text-cyan-100 rounded-tr-none'
                        }`}>
                            <div className="text-[10px] font-bold opacity-40 mb-2 uppercase flex gap-2">
                                {msg.role === "model" ? "AI CORE" : "YOU"}
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
                        </div>
                    </motion.div>
                ))
            )}
            
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-white/5 px-4 py-2 rounded-full text-xs text-cyan-400 animate-pulse border border-cyan-500/20">
                        Thinking...
                    </div>
                </div>
            )}
            {/* عنصر وهمي للنزول إليه */}
            <div ref={scrollRef} className="h-4" />
        </div>

        {/* Input Area (Fixed Bottom) */}
        <div className="p-4 bg-[#0a0a0a] border-t border-white/10 shrink-0">
            <div className="flex gap-2 max-w-4xl mx-auto">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="اكتب رسالتك هنا..." 
                    className="flex-1 bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all font-mono text-sm"
                    dir="auto"
                />
                <button 
                    onClick={sendMessage}
                    disabled={loading}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl transition-all disabled:opacity-50"
                >
                    <IconSend size={20} />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}