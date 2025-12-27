"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { IconX, IconSend, IconMessage2 } from '@tabler/icons-react';

export default function SupportModal({ user, onClose }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
      const ticketRef = doc(db, "support_tickets", user.uid);
      const unsub = onSnapshot(ticketRef, (snap) => {
          if(snap.exists()) setHistory(snap.data().messages || []);
          else setDoc(ticketRef, { userId: user.uid, userEmail: user.email, messages: [], status: 'open', lastUpdate: Date.now() });
      });
      return () => unsub();
  }, [user]);

  const send = async () => {
      if(!msg.trim()) return;
      const ticketRef = doc(db, "support_tickets", user.uid);
      await updateDoc(ticketRef, {
          messages: arrayUnion({ text: msg, sender: 'user', createdAt: new Date().toISOString() }),
          lastUpdate: Date.now(),
          status: 'open'
      });
      setMsg("");
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="w-full max-w-md bg-[#111] border border-cyan-500 rounded-xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 bg-cyan-900/20 border-b border-cyan-500/30 flex justify-between items-center">
                <h3 className="text-cyan-400 font-bold flex gap-2"><IconMessage2/> الدعم الفني</h3>
                <button onClick={onClose}><IconX className="text-white/50 hover:text-white"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/50">
                {history.map((m, i) => (
                    <div key={i} className={`p-3 rounded-lg text-sm max-w-[80%] ${m.sender === 'user' ? 'bg-cyan-900/40 text-cyan-100 ml-auto rounded-tr-none' : 'bg-gray-800 text-white mr-auto rounded-tl-none'}`}>
                        {m.text}
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
                <input value={msg} onChange={e=>setMsg(e.target.value)} className="flex-1 bg-black border border-white/20 rounded px-3 text-white outline-none focus:border-cyan-500" placeholder="اكتب مشكلتك..." />
                <button onClick={send} className="bg-cyan-600 p-2 rounded text-white"><IconSend size={18}/></button>
            </div>
        </div>
    </div>
  );
}