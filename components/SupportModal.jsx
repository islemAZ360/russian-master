"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { IconX, IconSend, IconMessage2 } from '@tabler/icons-react';

export default function SupportModal({ user, onClose }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    // جلب أو إنشاء تذكرة الدعم الخاصة بالمستخدم
    const ticketRef = doc(db, "support_tickets", user.uid);
    
    const unsubscribe = onSnapshot(ticketRef, (docSnap) => {
        if (docSnap.exists()) {
            setChatHistory(docSnap.data().messages || []);
        } else {
            // إنشاء تذكرة فارغة إذا لم تكن موجودة
            setDoc(ticketRef, {
                userId: user.uid,
                userEmail: user.email,
                messages: [],
                status: 'open',
                lastUpdate: new Date().toISOString()
            });
        }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = async () => {
      if(!message.trim()) return;
      const ticketRef = doc(db, "support_tickets", user.uid);
      const msgObj = { text: message, sender: 'user', createdAt: new Date().toISOString() };
      
      await updateDoc(ticketRef, {
          messages: arrayUnion(msgObj),
          lastUpdate: new Date().toISOString(),
          status: 'open'
      });
      setMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111] border border-purple-500 rounded-2xl flex flex-col h-[600px] shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-purple-900/20">
                <h3 className="font-bold text-purple-400 flex items-center gap-2"><IconMessage2/> SUPPORT LINE</h3>
                <button onClick={onClose} className="text-white/50 hover:text-white"><IconX/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black">
                {chatHistory.length === 0 && <div className="text-center text-white/30 text-sm mt-10">Send a message to Admins...</div>}
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={scrollRef}></div>
            </div>

            <div className="p-4 border-t border-white/10 flex gap-2">
                <input 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Describe your issue..." 
                    className="flex-1 bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500"
                />
                <button onClick={sendMessage} className="bg-purple-600 p-2 rounded-lg text-white hover:bg-purple-500"><IconSend size={20}/></button>
            </div>
        </div>
    </div>
  );
}