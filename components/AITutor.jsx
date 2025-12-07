"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconRobot, IconSend, IconMenu2, IconX, IconPlus, IconMessage, 
  IconVolume, IconCopy, IconMicrophone, IconPlayerStop, IconCpu 
} from "@tabler/icons-react";
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AITutor({ user }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState([]); 
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  // إعداد التعرف على الصوت
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'ar-SA'; // يمكن تغييرها حسب الحاجة
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + " " + transcript);
            setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        
        recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
      if (!recognitionRef.current) return alert("المتصفح لا يدعم الإدخال الصوتي");
      if (isListening) {
          recognitionRef.current.stop();
      } else {
          recognitionRef.current.start();
          setIsListening(true);
      }
  };

  // جلب البيانات
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "ai_chats"), orderBy("lastUpdate", "desc"));
    const unsub = onSnapshot(q, (snap) => setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) setMessages(session.messages || []);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, sessions]);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    if (isSpeaking) { setIsSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = /[а-яА-Я]/.test(text) ? 'ru-RU' : 'ar-SA';
    u.rate = 0.9;
    u.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const sendMessage = async (txt = null) => {
    const text = txt || input;
    if (!text.trim() || loading) return;

    const newMsgs = [...messages, { role: "user", text }];
    setInput("");
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs })
      });
      const data = await res.json();
      const finalMsgs = [...newMsgs, { role: "model", text: data.reply }];
      setMessages(finalMsgs);

      if (user) {
        if (!currentSessionId) {
            const ref = await addDoc(collection(db, "users", user.uid, "ai_chats"), { 
                title: text.substring(0, 20), messages: finalMsgs, createdAt: serverTimestamp(), lastUpdate: serverTimestamp() 
            });
            setCurrentSessionId(ref.id);
        } else {
            await updateDoc(doc(db, "users", user.uid, "ai_chats", currentSessionId), { messages: finalMsgs, lastUpdate: serverTimestamp() });
        }
      }
    } catch (e) { setMessages(prev => [...prev, { role: "model", text: "⚠️ Error connecting to mainframe." }]); } 
    finally { setLoading(false); }
  };

  return (
    <div className="w-full h-full flex bg-[#030303] text-white font-sans overflow-hidden relative">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-black/90 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shrink-0`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="font-black tracking-widest text-cyan-500 text-sm flex gap-2"><IconCpu/> MEMORY BANKS</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><IconX/></button>
        </div>
        <div className="p-4">
            <button onClick={() => { setCurrentSessionId(null); setMessages([]); setIsSidebarOpen(false); }} className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                <IconPlus size={18}/> New Sequence
            </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {sessions.map(s => (
                <div key={s.id} onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }} className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all ${currentSessionId === s.id ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'}`}>
                    <IconMessage size={16} className="text-white/40"/>
                    <span className="text-xs truncate font-mono text-white/70">{s.title}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col relative h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100">
        
        {/* Header */}
        <div className="h-20 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center px-6 justify-between z-40">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-white/5 rounded-lg"><IconMenu2/></button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                    <IconRobot size={24} className="text-white"/>
                </div>
                <div>
                    <h1 className="font-black text-lg tracking-widest text-white">NEXUS-7</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-mono text-white/50 uppercase">Systems Nominal</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6 pb-40">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 select-none">
                    <IconCpu size={64} className="mb-4 text-cyan-500/50 animate-pulse"/>
                    <h3 className="text-2xl font-bold text-white/20 uppercase tracking-widest">Awaiting Input</h3>
                </div>
            )}
            
            {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "model" ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[90%] md:max-w-[75%] relative group`}>
                        <div className={`p-5 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-md border ${
                            msg.role === "model" 
                            ? 'bg-[#111]/90 border-white/10 text-gray-200 rounded-tl-sm' 
                            : 'bg-cyan-900/20 border-cyan-500/30 text-cyan-50 rounded-tr-sm'
                        }`}>
                            {/* تنسيق Markdown */}
                            {msg.role === "model" ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                    strong: ({node, ...props}) => <span className="text-cyan-400 font-black" {...props} />,
                                    table: ({node, ...props}) => <table className="w-full my-2 border-collapse border border-white/20 text-xs" {...props} />,
                                    th: ({node, ...props}) => <th className="border border-white/20 p-2 bg-white/5 text-cyan-400" {...props} />,
                                    td: ({node, ...props}) => <td className="border border-white/20 p-2" {...props} />,
                                }}>
                                    {msg.text}
                                </ReactMarkdown>
                            ) : (
                                <p className="font-mono">{msg.text}</p>
                            )}
                        </div>
                        
                        {/* أدوات الرسالة */}
                        {msg.role === "model" && (
                            <div className="absolute -bottom-8 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => speakText(msg.text)} className="p-1.5 bg-white/10 rounded-full hover:bg-cyan-500 hover:text-black transition-all">
                                    {isSpeaking ? <IconPlayerStop size={14}/> : <IconVolume size={14}/>}
                                </button>
                                <button onClick={() => navigator.clipboard.writeText(msg.text)} className="p-1.5 bg-white/10 rounded-full hover:bg-purple-500 hover:text-white transition-all">
                                    <IconCopy size={14}/>
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}

            {loading && (
                <div className="flex items-center gap-3 text-cyan-500 text-xs font-mono animate-pulse">
                    <IconCpu size={16} className="animate-spin"/> PROCESSING DATA...
                </div>
            )}
            <div ref={scrollRef}></div>
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
            <div className="max-w-4xl mx-auto flex gap-3 items-end bg-[#111] border border-white/10 p-2 rounded-2xl shadow-2xl relative">
                
                {/* Voice Button */}
                <button 
                    onClick={toggleListening}
                    className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'hover:bg-white/5 text-white/50 hover:text-white'}`}
                >
                    <IconMicrophone size={22}/>
                </button>

                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Enter command to NEXUS..."
                    className="flex-1 bg-transparent border-none outline-none text-white px-2 py-3 max-h-32 min-h-[50px] resize-none font-mono text-sm custom-scrollbar"
                />

                <button 
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    <IconSend size={20}/>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}