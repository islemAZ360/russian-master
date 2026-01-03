"use client";
import React, { useState, useEffect, useRef } from 'react';
// FIX: استخدام @ للمسار الصحيح
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, setDoc, onSnapshot, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { IconX, IconSend, IconMessage2, IconLoader } from '@tabler/icons-react';

export default function SupportModal({ user, onClose }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const ticketRef = doc(db, "support_tickets", user.uid);
    const unsub = onSnapshot(ticketRef, (snap) => {
        if(snap.exists()) setHistory(snap.data().messages || []);
        else setDoc(ticketRef, { userId: user.uid, userEmail: user.email, messages: [], lastUpdate: Date.now() });
        setLoading(false);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [user]);

  const send = async () => {
    if(!msg.trim()) return;
    const text = msg; setMsg("");

    await updateDoc(doc(db, "support_tickets", user.uid), {
        messages: arrayUnion({ text, sender: 'user', time: Date.now() }),
        lastUpdate: Date.now(),
        status: 'new'
    });

    await addDoc(collection(db, "notifications"), {
        target: "admin",
        title: "NEW SUPPORT TICKET",
        message: `User ${user.email.split('@')[0]} sent a message: "${text.substring(0, 20)}..."`,
        type: "admin_alert",
        linkUserId: user.uid,
        createdAt: serverTimestamp()
    });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
        <div className="w-full max-w-lg bg-[#0a0a0a] border border-cyan-500/30 rounded-[2.5rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
            <div className="p-6 bg-cyan-950/20 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-cyan-400 font-black flex gap-2 items-center uppercase italic"><IconMessage2 size={20}/> Technical Support</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><IconX/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loading ? <IconLoader className="animate-spin mx-auto text-cyan-500"/> : history.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-2xl text-sm max-w-[85%] ${m.sender === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-neutral-800 text-gray-200 rounded-tl-none'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>
            <div className="p-4 bg-black border-t border-white/5 flex gap-3">
                <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white outline-none focus:border-cyan-500" placeholder="Describe the issue..." />
                <button onClick={send} className="bg-cyan-600 p-4 rounded-2xl text-white hover:bg-cyan-50"><IconSend size={20}/></button>
            </div>
        </div>
    </div>
  );
}