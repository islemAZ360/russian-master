"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconRobot, IconSend, IconMenu2, IconX, IconPlus, IconMessage, 
  IconVolume, IconCopy, IconSparkles, IconPlayerStop 
} from "@tabler/icons-react";
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function AITutor({ user }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState([]); 
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const scrollRef = useRef(null);

  // اقتراحات سريعة
  const QUICK_PROMPTS = [
    "🇷🇺 علمني كلمة روسية جديدة",
    "📝 صحح لي هذه الجملة",
    "🗣️ كيف أنطق 'شكراً' بالروسية؟",
    "🤖 من أنت؟"
  ];

  // جلب الجلسات
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "ai_chats"), orderBy("lastUpdate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) setMessages(session.messages || []);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, sessions]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  // دالة النطق المتطورة
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // إيقاف أي صوت سابق
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      // محاولة اكتشاف اللغة تلقائياً (بسيط)
      if (/[а-яА-Я]/.test(text)) utterance.lang = 'ru-RU';
      else if (/[a-zA-Z]/.test(text)) utterance.lang = 'en-US';
      else utterance.lang = 'ar-SA';
      
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("تم نسخ النص!");
  };

  const sendMessage = async (overrideText = null) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;

    const newHistory = [...messages, { role: "user", text: textToSend }];
    
    setInput("");
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.reply || "Server Error");

      const finalMessages = [...newHistory, { role: "model", text: data.reply }];
      setMessages(finalMessages);

      // حفظ في Firebase
      if (user) {
        if (!currentSessionId) {
          const title = textToSend.substring(0, 20) + "...";
          const docRef = await addDoc(collection(db, "users", user.uid, "ai_chats"), {
            title, messages: finalMessages, createdAt: serverTimestamp(), lastUpdate: serverTimestamp()
          });
          setCurrentSessionId(docRef.id);
        } else {
          await updateDoc(doc(db, "users", user.uid, "ai_chats", currentSessionId), {
            messages: finalMessages, lastUpdate: serverTimestamp()
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
    <div className="w-full h-full flex bg-[#020202] overflow-hidden relative font-sans text-white">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/80 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a0a] border-r border-white/5 transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shrink-0`}>
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-cyan-950/10 backdrop-blur-md">
            <h2 className="font-black tracking-[0.2em] text-cyan-500 text-sm flex items-center gap-2">
                <IconSparkles size={16}/> NEXUS LOGS
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/50"><IconX size={20}/></button>
        </div>
        <div className="p-4">
            <button onClick={startNewChat} className="w-full py-3 bg-cyan-600/10 border border-cyan-500/30 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-600/30 text-cyan-400 font-bold text-xs tracking-wider transition-all hover:scale-[1.02]">
                <IconPlus size={16}/> NEW SESSION
            </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {sessions.map(session => (
                <div key={session.id} onClick={() => { setCurrentSessionId(session.id); setIsSidebarOpen(false); }} className={`group p-3 rounded-xl cursor-pointer transition-all border flex items-center gap-3 ${currentSessionId === session.id ? 'bg-white/10 border-cyan-500/40' : 'border-transparent hover:bg-white/5'}`}>
                    <div className={`p-2 rounded-lg ${currentSessionId === session.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/30'}`}><IconMessage size={16}/></div>
                    <span className="text-xs truncate font-mono opacity-70 group-hover:opacity-100">{session.title}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
        
        {/* Header */}
        <div className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center px-6 justify-between shrink-0 z-20">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-white/50 hover:text-white"><IconMenu2/></button>
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        <IconRobot size={22} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                </div>
                <div>
                    <h3 className="font-bold text-sm tracking-widest text-white">NEXUS-7 AI</h3>
                    <p className="text-[10px] text-cyan-400/60 font-mono">ONLINE // V2.5</p>
                </div>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6 pb-40">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-1000">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 animate-bounce">
                        <IconSparkles size={40} className="text-cyan-500"/>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">System Online</h2>
                    <p className="text-white/30 text-sm max-w-xs">Ask me anything in any language. I am ready to teach.</p>
                    
                    {/* Quick Prompts */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg">
                        {QUICK_PROMPTS.map((prompt, i) => (
                            <button 
                                key={i} 
                                onClick={() => sendMessage(prompt)}
                                className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-left hover:bg-white/10 hover:border-cyan-500/30 transition-all text-white/70"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {messages.map((msg, i) => (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex ${msg.role === "model" ? 'justify-start' : 'justify-end'}`}
                >
                    <div className={`max-w-[85%] md:max-w-[70%] group relative`}>
                        {/* Bubble */}
                        <div className={`p-4 rounded-2xl border backdrop-blur-sm shadow-sm ${
                            msg.role === "model" 
                            ? 'bg-[#111] border-white/10 text-gray-200 rounded-tl-sm' 
                            : 'bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-cyan-500/30 text-cyan-50 rounded-tr-sm'
                        }`}>
                            <p className={`whitespace-pre-wrap text-sm leading-relaxed ${/[\u0600-\u06FF]/.test(msg.text) ? 'font-cairo text-right dir-rtl' : 'font-mono'}`}>
                                {msg.text}
                            </p>
                        </div>

                        {/* Actions (Only for AI messages) */}
                        {msg.role === "model" && (
                            <div className="flex gap-2 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={() => speakText(msg.text)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-white/50 hover:text-cyan-400 transition-all" title="Speak">
                                    {isSpeaking ? <IconPlayerStop size={14}/> : <IconVolume size={14}/>}
                                </button>
                                <button onClick={() => copyText(msg.text)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-white/50 hover:text-purple-400 transition-all" title="Copy">
                                    <IconCopy size={14}/>
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
            
            {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-[#111] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                </motion.div>
            )}
            <div ref={scrollRef}></div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black via-[#0a0a0a] to-transparent z-30">
            <div className="max-w-4xl mx-auto flex gap-3 items-end bg-[#0f0f0f] border border-white/10 p-2 rounded-2xl shadow-2xl ring-1 ring-white/5">
                <textarea 
                    rows={1}
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    placeholder="Transmitting to NEXUS..." 
                    className="flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-white/20 font-mono text-sm resize-none max-h-32 custom-scrollbar"
                />
                <button 
                    onClick={() => sendMessage()} 
                    disabled={loading || !input.trim()} 
                    className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <IconSend size={20} />
                </button>
            </div>
            <div className="text-center mt-2 text-[10px] text-white/20 font-mono uppercase tracking-widest">
                Secured via Gemini 2.5 Flash Protocol
            </div>
        </div>
      </div>
    </div>
  );
}