"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconMessage, IconPlus, IconSearch, IconUsers, IconLock, 
  IconSend, IconPhoto, IconHash, IconX, IconDotsVertical, IconCheck 
} from "@tabler/icons-react";
import { db } from "../lib/firebase";
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, arrayUnion 
} from "firebase/firestore";

export default function CommunicationHub({ user }) {
  const [activeTab, setActiveTab] = useState("all"); // all, my
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  
  // New Group State
  const [newGroup, setNewGroup] = useState({ name: "", desc: "", type: "public", image: "" });

  const messagesEndRef = useRef(null);

  // 1. Fetch Chats
  useEffect(() => {
    if (!user) return;

    // جلب المجموعات العامة والعالمية
    const qPublic = query(collection(db, "chats"), where("type", "in", ["global", "public"]));
    // جلب المجموعات الخاصة التي أنا عضو فيها
    const qPrivate = query(collection(db, "chats"), where("members", "array-contains", user.uid));

    const unsubPublic = onSnapshot(qPublic, (snap) => {
        const publicChats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // دمج النتائج وتحديث الحالة (سيتم تحسين هذا في تطبيق إنتاجي ليكون أكثر كفاءة)
        setChats(prev => {
            const privateChats = prev.filter(c => c.type === 'private');
            // دمج بدون تكرار
            const combined = [...publicChats, ...privateChats].filter((v,i,a)=>a.findIndex(t=>(t.id===v.id))===i);
            return combined.sort((a,b) => (b.lastActivity?.seconds || 0) - (a.lastActivity?.seconds || 0));
        });
    });

    const unsubPrivate = onSnapshot(qPrivate, (snap) => {
        const myChats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setChats(prev => {
            const publicChats = prev.filter(c => c.type !== 'private');
            const combined = [...publicChats, ...myChats].filter((v,i,a)=>a.findIndex(t=>(t.id===v.id))===i);
            return combined.sort((a,b) => (b.lastActivity?.seconds || 0) - (a.lastActivity?.seconds || 0));
        });
    });

    return () => { unsubPublic(); unsubPrivate(); };
  }, [user]);

  // 2. Fetch Messages for Selected Chat
  useEffect(() => {
    if (!selectedChat) return;
    const q = query(
        collection(db, "chats", selectedChat.id, "messages"), 
        orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        scrollToBottom();
    });
    return () => unsub();
  }, [selectedChat]);

  const scrollToBottom = () => {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // --- ACTIONS ---

  const createGroup = async () => {
      if(!newGroup.name) return;
      try {
          const docRef = await addDoc(collection(db, "chats"), {
              ...newGroup,
              createdBy: user.uid,
              members: [user.uid],
              createdAt: serverTimestamp(),
              lastActivity: serverTimestamp(),
              image: newGroup.image || "https://cdn-icons-png.flaticon.com/512/924/924915.png" // Default Cyber Icon
          });
          setShowCreateModal(false);
          setNewGroup({ name: "", desc: "", type: "public", image: "" });
          // Auto select the new chat
          setSelectedChat({ id: docRef.id, ...newGroup, members: [user.uid] });
      } catch (e) { console.error(e); }
  };

  const sendMessage = async () => {
      if ((!inputText.trim() && !imageUrl) || !selectedChat) return;

      const msgData = {
          text: inputText,
          image: imageUrl,
          senderId: user.uid,
          senderName: user.email.split('@')[0],
          senderAvatar: user.photoURL || "👤", // نفترض وجود صورة أو رمز
          createdAt: serverTimestamp()
      };

      try {
          setInputText("");
          setImageUrl("");
          setShowImageInput(false);
          
          await addDoc(collection(db, "chats", selectedChat.id, "messages"), msgData);
          
          // تحديث آخر نشاط للمجموعة لترتيب القائمة
          await updateDoc(doc(db, "chats", selectedChat.id), {
              lastActivity: serverTimestamp(),
              lastMessage: inputText || "Image Sent"
          });

          // إذا كانت المجموعة عامة وأنا لست فيها، أضفني للأعضاء تلقائياً
          if (!selectedChat.members?.includes(user.uid)) {
              await updateDoc(doc(db, "chats", selectedChat.id), {
                  members: arrayUnion(user.uid)
              });
          }

      } catch (e) { console.error(e); }
  };

  // تصفية القائمة
  const filteredChats = activeTab === 'my' 
    ? chats.filter(c => c.members?.includes(user.uid)) 
    : chats;

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-[#050505] overflow-hidden font-sans text-white">
      
      {/* LEFT SIDEBAR (Chat List) */}
      <div className={`w-full md:w-80 border-r border-white/10 flex flex-col bg-black/50 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 shrink-0 flex justify-between items-center">
            <div>
                <h2 className="font-black text-xl tracking-widest text-cyan-500">COMMS LINK</h2>
                <p className="text-[10px] text-white/40 uppercase">Encrypted Channels</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="p-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 shadow-[0_0_15px_#06b6d4]">
                <IconPlus size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 border-b border-white/5">
            <button onClick={()=>setActiveTab('all')} className={`flex-1 py-2 text-xs font-bold rounded ${activeTab==='all' ? 'bg-white/10 text-white' : 'text-white/40'}`}>GLOBAL</button>
            <button onClick={()=>setActiveTab('my')} className={`flex-1 py-2 text-xs font-bold rounded ${activeTab==='my' ? 'bg-white/10 text-white' : 'text-white/40'}`}>MY SQUADS</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredChats.map(chat => (
                <div 
                    key={chat.id} 
                    onClick={() => setSelectedChat(chat)}
                    className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${selectedChat?.id === chat.id ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-black">
                        {chat.image ? <img src={chat.image} alt="grp" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-800"><IconHash/></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold truncate text-sm">{chat.name}</h3>
                            {chat.type === 'private' && <IconLock size={12} className="text-orange-500"/>}
                        </div>
                        <p className="text-xs text-white/40 truncate">{chat.lastMessage || chat.description || "No messages yet"}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* RIGHT SIDE (Chat Window) */}
      <div className={`flex-1 flex-col bg-[#0a0a0a] relative ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Chat Background Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[size:100%_4px] pointer-events-none"></div>

        {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                <IconMessage size={64} stroke={1} className="mb-4" />
                <p className="tracking-widest uppercase">Select a frequency to connect</p>
            </div>
        ) : (
            <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-black/40 backdrop-blur-md shrink-0 z-10">
                    <button onClick={() => setSelectedChat(null)} className="md:hidden text-white/50"><IconX/></button>
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-cyan-500/30">
                        <img src={selectedChat.image || "https://placehold.co/100x100/000/FFF?text=G"} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg leading-none">{selectedChat.name}</h3>
                        <p className="text-xs text-cyan-500/70">{selectedChat.type === 'global' ? 'Global Network' : `${selectedChat.members?.length || 0} Operatives Online`}</p>
                    </div>
                    <button className="text-white/30 hover:text-white"><IconDotsVertical/></button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {messages.map((msg, i) => {
                        const isMe = msg.senderId === user.uid;
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                                <div className={`max-w-[80%] md:max-w-[60%] flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-white/10 text-xs">
                                        {msg.senderAvatar === "👤" ? msg.senderName[0] : "👤"}
                                    </div>
                                    <div className={`p-3 rounded-2xl ${isMe ? 'bg-cyan-600 rounded-tr-none text-white' : 'bg-[#1a1a1a] border border-white/10 rounded-tl-none text-gray-200'}`}>
                                        {!isMe && <div className="text-[10px] text-cyan-400 font-bold mb-1">{msg.senderName}</div>}
                                        
                                        {msg.image && (
                                            <div className="mb-2 rounded-lg overflow-hidden border border-black/20">
                                                <img src={msg.image} alt="attachment" className="max-w-full h-auto" />
                                            </div>
                                        )}
                                        
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{msg.text}</p>
                                        <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-cyan-200' : 'text-gray-500'}`}>
                                            {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "Sending..."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/40 border-t border-white/10 shrink-0 z-10">
                    {showImageInput && (
                        <div className="mb-2 flex gap-2 animate-in slide-in-from-bottom-2">
                            <input 
                                value={imageUrl} 
                                onChange={(e) => setImageUrl(e.target.value)} 
                                placeholder="Paste Image URL here..." 
                                className="flex-1 bg-[#111] border border-cyan-500/50 rounded-lg p-2 text-xs text-white outline-none font-mono"
                            />
                            <button onClick={() => setShowImageInput(false)} className="text-red-500 hover:text-red-400"><IconX size={18}/></button>
                        </div>
                    )}
                    
                    <div className="flex items-end gap-2 bg-[#111] border border-white/10 rounded-2xl p-2 focus-within:border-cyan-500/50 transition-colors">
                        <button 
                            onClick={() => setShowImageInput(!showImageInput)}
                            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${showImageInput ? 'text-cyan-400' : 'text-white/40'}`}
                        >
                            <IconPhoto size={20} />
                        </button>
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Transmit message..." 
                            className="flex-1 bg-transparent border-none outline-none text-white max-h-32 min-h-[40px] py-2 resize-none custom-scrollbar"
                            rows={1}
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={!inputText.trim() && !imageUrl}
                            className={`p-2 rounded-full transition-all ${(!inputText.trim() && !imageUrl) ? 'bg-white/5 text-white/20' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg'}`}
                        >
                            <IconSend size={18} />
                        </button>
                    </div>
                </div>
            </>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      <AnimatePresence>
        {showCreateModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0f0f0f] border border-cyan-500 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-2"><IconUsers className="text-cyan-500"/> CREATE SQUAD</h2>
                        <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white"><IconX/></button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-white/50 uppercase font-bold">Squad Name</label>
                            <input 
                                value={newGroup.name} 
                                onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 text-white outline-none focus:border-cyan-500 mt-1" 
                                placeholder="e.g. Cyber Ninjas"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-white/50 uppercase font-bold">Image URL (Optional)</label>
                            <input 
                                value={newGroup.image} 
                                onChange={e => setNewGroup({...newGroup, image: e.target.value})}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 text-white outline-none focus:border-cyan-500 mt-1 text-xs font-mono" 
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="text-xs text-white/50 uppercase font-bold">Description</label>
                            <textarea 
                                value={newGroup.desc} 
                                onChange={e => setNewGroup({...newGroup, desc: e.target.value})}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 text-white outline-none focus:border-cyan-500 mt-1 resize-none h-20" 
                                placeholder="Mission objectives..."
                            />
                        </div>
                        <div>
                            <label className="text-xs text-white/50 uppercase font-bold">Access Type</label>
                            <div className="flex gap-4 mt-2">
                                <button onClick={()=>setNewGroup({...newGroup, type: 'public'})} className={`flex-1 py-2 rounded border text-sm font-bold ${newGroup.type === 'public' ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-white/20 text-white/40'}`}>
                                    PUBLIC
                                </button>
                                <button onClick={()=>setNewGroup({...newGroup, type: 'private'})} className={`flex-1 py-2 rounded border text-sm font-bold ${newGroup.type === 'private' ? 'bg-orange-600 border-orange-500 text-white' : 'border-white/20 text-white/40'}`}>
                                    PRIVATE
                                </button>
                            </div>
                        </div>
                    </div>

                    <button onClick={createGroup} className="w-full mt-8 py-3 bg-white text-black font-black rounded-lg hover:bg-cyan-400 transition-colors">
                        INITIALIZE SQUAD
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}