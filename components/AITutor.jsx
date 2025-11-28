"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconRobot, IconSend, IconMicrophone, IconVolume, IconVolumeOff, 
  IconCpu, IconPlayerStop, IconTarget, IconGhost
} from "@tabler/icons-react";
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const API_KEY = "AIzaSyDi8-POg6RGCoBCkni6_8XNikJvTmH4z3M";

// سيناريوهات المهمات (Roleplay)
const MISSIONS = [
  { id: 'cafe', title: 'Coffee Order', prompt: 'Act as a grumpy Russian waiter in a Moscow cafe. I am a customer. Do not translate, speak Russian only. Correct me if I am wrong.', icon: '☕' },
  { id: 'taxi', title: 'Lost in Taxi', prompt: 'Act as a Russian Taxi driver. I am a tourist giving wrong directions. Be talkative and use slang.', icon: '🚕' },
  { id: 'spy', title: 'KGB Interrogation', prompt: 'Act as a suspicious KGB officer. I am a spy trying to cross the border. Ask me strict questions.', icon: '🕵️‍♂️' },
];

export default function AITutor({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [activeMission, setActiveMission] = useState(null);
  
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null); // للصوت

  // --- 1. إعداد التعرف على الصوت ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'ru-RU'; // الاستماع للروسية
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsRecording(false);
            sendMessage(transcript); // إرسال تلقائي بعد التحدث
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech Error:", event.error);
            setIsRecording(false);
        };
    }
  }, []);

  // --- 2. دالة النطق (البوت يتكلم) ---
  const speakText = (text) => {
      if (!soundOn) return;
      window.speechSynthesis.cancel();
      // تنظيف النص من الرموز والإنجليزية للنطق الروسي الصحيح
      const cleanText = text.replace(/[A-Za-z]/g, '').replace(/[*_#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "ru-RU";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
  };

  const toggleRecord = () => {
      if (isRecording) {
          recognitionRef.current.stop();
          setIsRecording(false);
      } else {
          recognitionRef.current.start();
          setIsRecording(true);
      }
  };

  // --- 3. بدء مهمة ---
  const startMission = (mission) => {
      setActiveMission(mission);
      setMessages([{ role: "model", text: `⚠️ MISSION STARTED: ${mission.title}\nInitializing Scenario...` }]);
      // إرسال تعليمات المهمة للبوت في الخفاء
      sendMessage("START_MISSION", mission.prompt);
  };

  const sendMessage = async (textOverride = null, hiddenPrompt = null) => {
    const msgText = textOverride || input;
    if (!msgText.trim() && !hiddenPrompt) return;

    if (!hiddenPrompt) {
        setMessages(prev => [...prev, { role: "user", text: msgText }]);
        setInput("");
    }
    setLoading(true);

    try {
      // تحديد التعليمات بناءً على الوضع (عادي أو مهمة)
      const systemInstruction = hiddenPrompt || (activeMission 
        ? `STAY IN CHARACTER. Context: ${activeMission.prompt}. User said: "${msgText}".`
        : `You are "Russian Master AI". User said: "${msgText}". Reply in Russian, then explain in Arabic. Analyze pronunciation if audio input.`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemInstruction }] }]
          }),
        }
      );

      const data = await response.json();
      const botReply = data.candidates[0].content.parts[0].text;
      
      setMessages(prev => [...prev, { role: "model", text: botReply }]);
      speakText(botReply); // نطق الرد

    } catch (err) {
      setMessages(prev => [...prev, { role: "model", text: "⚠️ Signal Lost." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden relative font-sans">
      
      {/* Header */}
      <div className="p-4 bg-cyan-950/20 border-b border-cyan-500/30 flex justify-between items-center backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${activeMission ? 'border-red-500 animate-pulse' : 'border-cyan-400'}`}>
                {activeMission ? <IconTarget className="text-red-500"/> : <IconRobot className="text-cyan-400"/>}
            </div>
            <div>
                <h2 className="font-black text-white tracking-widest text-sm">
                    {activeMission ? `MISSION: ${activeMission.title.toUpperCase()}` : "NEURAL LINK"}
                </h2>
                <p className="text-[10px] text-white/40 font-mono">
                    {activeMission ? "ROLEPLAY MODE ACTIVE" : "STANDARD MODE"}
                </p>
            </div>
        </div>
        
        {/* أزرار التحكم */}
        <div className="flex gap-2">
            <button onClick={() => setSoundOn(!soundOn)} className={`p-2 rounded-lg border ${soundOn ? 'border-cyan-500 text-cyan-400' : 'border-gray-600 text-gray-600'}`}>
                {soundOn ? <IconVolume size={18}/> : <IconVolumeOff size={18}/>}
            </button>
            {activeMission && (
                <button onClick={() => { setActiveMission(null); setMessages([]); }} className="p-2 bg-red-900/30 border border-red-500 text-red-500 rounded-lg text-xs font-bold">
                    ABORT
                </button>
            )}
        </div>
      </div>

      {/* منطقة الرسائل */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 relative">
         {/* خلفية تفاعلية */}
         <div className={`absolute inset-0 opacity-10 pointer-events-none ${activeMission ? 'bg-red-900/20' : 'bg-cyan-900/10'}`}></div>

         {/* Mission Selector (يظهر فقط إذا لم تكن في مهمة والرسائل فارغة) */}
         {!activeMission && messages.length === 0 && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
                 {MISSIONS.map(m => (
                     <button key={m.id} onClick={() => startMission(m)} className="p-4 border border-white/10 bg-white/5 rounded-xl hover:bg-cyan-900/20 hover:border-cyan-500 transition-all text-left group">
                         <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{m.icon}</div>
                         <div className="font-bold text-white text-sm">{m.title}</div>
                         <div className="text-[10px] text-white/40">Initialize Simulation</div>
                     </button>
                 ))}
             </div>
         )}

         {messages.map((msg, i) => {
             const isBot = msg.role === "model";
             return (
                 <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: isBot ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                 >
                     <div className={`max-w-[85%] p-4 rounded-2xl border backdrop-blur-md ${
                         isBot 
                         ? 'bg-[#111] border-cyan-500/30 rounded-tl-none text-cyan-100' 
                         : 'bg-purple-900/20 border-purple-500/30 rounded-tr-none text-white'
                     }`}>
                         <div className="text-[9px] font-bold opacity-50 mb-1 uppercase tracking-widest flex items-center gap-1">
                             {isBot ? <IconCpu size={10}/> : <IconGhost size={10}/>}
                             {isBot ? "SYSTEM" : "USER"}
                         </div>
                         <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
                         {/* زر إعادة النطق للرسالة */}
                         {isBot && (
                             <button onClick={() => speakText(msg.text)} className="mt-2 text-cyan-500 hover:text-white transition-colors">
                                 <IconVolume size={14}/>
                             </button>
                         )}
                     </div>
                 </motion.div>
             )
         })}
         
         {loading && (
             <div className="flex justify-start">
                 <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs text-cyan-400 animate-pulse flex items-center gap-2">
                     <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span> PROCESSING AUDIO DATA...
                 </div>
             </div>
         )}
         <div ref={scrollRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black border-t border-white/10 shrink-0 z-20">
          <div className="flex gap-2 max-w-4xl mx-auto items-end">
              {/* زر التسجيل الصوتي */}
              <button 
                onClick={toggleRecord}
                className={`p-3 rounded-xl border transition-all ${
                    isRecording 
                    ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-[0_0_20px_#ef4444]' 
                    : 'bg-white/5 text-white/50 border-white/10 hover:text-cyan-400 hover:border-cyan-400'
                }`}
              >
                  {isRecording ? <IconPlayerStop size={22} /> : <IconMicrophone size={22} />}
              </button>

              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={isRecording ? "Listening..." : "Type or speak russian..."}
                className="flex-1 bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all font-mono text-sm resize-none h-[50px] custom-scrollbar"
              />
              
              <button 
                onClick={() => sendMessage()}
                disabled={loading || (!input.trim())}
                className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 h-[50px] w-[50px] flex items-center justify-center"
              >
                  <IconSend size={22} />
              </button>
          </div>
          {isRecording && <p className="text-center text-[10px] text-red-500 mt-2 animate-pulse uppercase tracking-widest">Mic Active - Speak Russian</p>}
      </div>
    </div>
  );
}