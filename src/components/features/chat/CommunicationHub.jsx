"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconMessage, IconPlus, IconLock, IconSend, IconUserPlus, 
  IconArrowLeft, IconX, IconHash, IconUsers, IconWorld, IconTrash
} from "@tabler/icons-react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, deleteDoc, limit 
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * مركز الاتصالات المطور (Communication Hub)
 * نظام دردشة سايبربانك متكامل يدعم الترجمة الحية والرقابة الإدارية
 */
export default function CommunicationHub() {
  const { user, userData, isAdmin, isJunior } = useAuth();
  const { t, dir, isRTL } = useLanguage();
  
  // --- حالات الحالة (States) ---
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [inputText, setInputText] = useState("");
  
  // --- حالات النوافذ (Modals) ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", type: "public" });
  
  const messagesEndRef = useRef(null);

  // --- 1. مراقبة قائمة الكتائب (Frequencies) ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "chats"), orderBy("lastActivity", "desc"));
    
    return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // تصفية: القنوات العامة + القنوات التي يشارك فيها المستخدم + صلاحية الأدمن لرؤية الكل
        setChats(list.filter(c => c.type === 'public' || c.members?.includes(user.uid) || isAdmin));
    });
  }, [user, isAdmin]);

  // --- 2. مراقبة بث الرسائل في القناة المختارة ---
  useEffect(() => {
    if (!selectedChat) return;
    const q = query(
        collection(db, "chats", selectedChat.id, "messages"), 
        orderBy("createdAt", "asc"),
        limit(100)
    );
    
    return onSnapshot(q, (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
  }, [selectedChat]);

  // --- العمليات (Actions) ---

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;
    const text = inputText;
    setInputText("");

    try {
        const msgData = {
            text,
            senderId: user.uid,
            senderName: userData?.displayName || user.email.split('@')[0],
            createdAt: serverTimestamp(),
            type: 'text'
        };

        await addDoc(collection(db, "chats", selectedChat.id, "messages"), msgData);
        await updateDoc(doc(db, "chats", selectedChat.id), {
            lastActivity: serverTimestamp(),
            lastMessage: text
        });
    } catch (e) { console.error("Signal Lost:", e); }
  };

  const handleDeleteMessage = async (msgId) => {
      if (!isAdmin) return;
      if (confirm(t('admin_confirm_delete'))) {
          await deleteDoc(doc(db, "chats", selectedChat.id, "messages", msgId));
      }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || !isJunior) return;
    try {
        const docRef = await addDoc(collection(db, "chats"), {
            name: newGroup.name,
            type: newGroup.type,
            createdBy: user.uid,
            members: [user.uid],
            lastActivity: serverTimestamp(),
            lastMessage: "CHANNEL_INITIALIZED"
        });
        setShowCreateModal(false);
        setNewGroup({ name: "", type: "public" });
    } catch (e) { console.error("Formation Error:", e); }
  };

  return (
    <div className="flex-1 w-full flex flex-col md:flex-row bg-[#080808]/60 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl mb-10" style={{ height: 'calc(100vh - 180px)' }} dir={dir}>
      
      {/* 1. قائمة الترددات (Sidebar) */}
      <aside className={`w-full md:w-85 border-r border-white/5 flex flex-col bg-black/40 shrink-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
              <IconMessage className="text-cyan-500" size={24}/>
              <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">{t('chat_title')}</h2>
          </div>
          {isJunior && (
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="p-2.5 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-500 hover:text-white rounded-xl transition-all border border-cyan-500/20 shadow-lg"
              >
                  <IconPlus size={20}/>
              </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {chats.map(chat => (
            <motion.div 
                key={chat.id} 
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedChat(chat)} 
                className={`p-5 rounded-[1.5rem] cursor-pointer transition-all border group flex justify-between items-center ${
                    selectedChat?.id === chat.id 
                    ? 'bg-cyan-600/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                }`}
            >
              <div className="overflow-hidden">
                <div className={`font-black text-sm transition-colors truncate uppercase tracking-tight ${selectedChat?.id === chat.id ? 'text-cyan-400' : 'text-zinc-300'}`}>
                    {chat.name}
                </div>
                <div className="text-[10px] text-white/20 truncate mt-1 font-mono uppercase tracking-widest">
                    {chat.lastMessage || "Standby..."}
                </div>
              </div>
              {chat.type === 'private' ? <IconLock size={16} className="text-orange-500" /> : <IconWorld size={16} className="text-emerald-500" />}
            </motion.div>
          ))}
        </div>
      </aside>

      {/* 2. منطقة البث (Main Chat Area) */}
      <main className={`flex-1 flex flex-col relative bg-[#050505]/40 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/5 flex items-center justify-center mb-8 animate-[spin_20s_linear_infinite]">
                  <IconHash size={48} className="text-white/10"/>
              </div>
              <h3 className="text-sm font-black text-white/20 uppercase tracking-[0.4em]">{t('chat_no_freq')}</h3>
          </div>
        ) : (
          <>
            {/* هيدر الدردشة */}
            <header className="h-24 border-b border-white/5 flex items-center px-8 bg-black/40 backdrop-blur-md gap-5 shrink-0 z-10">
              <button onClick={() => setSelectedChat(null)} className="md:hidden p-2.5 hover:bg-white/10 rounded-xl text-white">
                  <IconArrowLeft size={24}/>
              </button>
              
              <div className="flex items-center gap-4 flex-1">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-indigo-900/20 border border-white/10 uppercase">
                    {selectedChat.name[0]}
                 </div>
                 <div className="flex flex-col">
                     <h3 className="font-black text-white text-lg leading-none uppercase tracking-tight">{selectedChat.name}</h3>
                     <div className="flex items-center gap-2 mt-2">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${selectedChat.type === 'private' ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                        <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">
                            {selectedChat.type === 'private' ? t('chat_server_private') : t('chat_server_public')}
                        </span>
                     </div>
                 </div>
              </div>

              {selectedChat.createdBy === user.uid && (
                <button 
                    onClick={() => setShowInviteModal(true)} 
                    className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                    <IconUserPlus size={18} />
                    <span className="hidden sm:inline">{t('chat_invite')}</span>
                </button>
              )}
            </header>

            {/* منطقة الرسائل */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-[0.02] relative">
              {messages.map((m, i) => {
                const isMe = m.senderId === user.uid;
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={m.id} 
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`flex items-start gap-4 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-xs text-white font-black uppercase shrink-0 shadow-lg">
                                {m.senderName[0]}
                            </div>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-3 mb-2 px-1">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">{m.senderName}</span>
                                    <span className="text-[8px] font-mono text-white/10 uppercase">
                                        {m.createdAt ? new Date(m.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                                    </span>
                                </div>
                                <div className={`relative group p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-xl backdrop-blur-sm transition-all duration-300 ${
                                    isMe 
                                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-cyan-900/20' 
                                    : 'bg-zinc-900/80 text-zinc-200 border border-white/5 rounded-tl-none'
                                }`}>
                                    {m.text}
                                    
                                    {/* ميزة الحذف للأدمن */}
                                    {isAdmin && (
                                        <button 
                                            onClick={() => handleDeleteMessage(m.id)}
                                            className={`absolute ${isMe ? '-left-10' : '-right-10'} top-1/2 -translate-y-1/2 p-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white shadow-xl scale-75 group-hover:scale-100`}
                                        >
                                            <IconTrash size={14}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* منطقة الإدخال */}
            <footer className="p-6 bg-black border-t border-white/5 shrink-0">
              <div className="flex gap-4 bg-white/[0.03] p-2 rounded-2xl border border-white/10 focus-within:border-cyan-500/50 transition-all shadow-inner">
                  <input 
                    value={inputText} 
                    onChange={e=>setInputText(e.target.value)} 
                    onKeyDown={e=>e.key==='Enter'&&handleSendMessage()} 
                    className="flex-1 bg-transparent px-6 py-3 text-sm text-white outline-none placeholder:text-white/10 font-medium" 
                    placeholder={t('chat_type_msg')} 
                  />
                  <button 
                    onClick={handleSendMessage} 
                    disabled={!inputText.trim()}
                    className="p-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-20 text-white rounded-xl transition-all shadow-xl shadow-cyan-900/40 active:scale-95"
                  >
                    <IconSend size={22}/>
                  </button>
              </div>
            </footer>
          </>
        )}
      </main>

      {/* 3. نافذة إنشاء الكتيبة (Create Modal) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
              <h3 className="text-3xl font-black mb-2 italic uppercase text-white tracking-tighter">{t('chat_create_squad')}</h3>
              <p className="text-white/20 text-[10px] mb-8 font-mono uppercase tracking-[0.3em]">Neural_Frequency_Generator</p>
              
              <div className="space-y-6">
                  <div>
                      <label className="text-[9px] font-black text-cyan-500 uppercase tracking-widest ml-1 mb-2 block">{t('chat_squad_name')}</label>
                      <input value={newGroup.name} onChange={e=>setNewGroup({...newGroup, name:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500 text-white font-bold transition-all" placeholder="E.g. VODKA_UNIT" />
                  </div>
                  <div>
                      <label className="text-[9px] font-black text-cyan-500 uppercase tracking-widest ml-1 mb-2 block">{t('chat_security')}</label>
                      <select value={newGroup.type} onChange={e=>setNewGroup({...newGroup, type:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl p-4 outline-none text-white focus:border-cyan-500 cursor-pointer uppercase font-bold text-xs">
                        <option value="public">{t('chat_public')}</option>
                        <option value="private">{t('chat_private')}</option>
                      </select>
                  </div>
              </div>

              <div className="flex gap-4 mt-10">
                  <button onClick={()=>setShowCreateModal(false)} className="flex-1 py-4 text-white/30 font-black uppercase text-[10px] hover:text-white transition-colors">{t('chat_cancel')}</button>
                  <button onClick={handleCreateGroup} className="flex-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-2xl transition-all uppercase text-[10px] tracking-widest">{t('chat_init')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. نافذة الدعوة (Invite Modal) */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[600px]">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <IconUsers size={24} className="text-cyan-500"/> {t('chat_squad_invite')}
                </h3>
                <button onClick={()=>setShowInviteModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"><IconX/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {allUsers.filter(u=>u.id!==user.uid).map(u => (
                  <div key={u.id} className="p-4 bg-white/[0.03] rounded-2xl flex justify-between items-center hover:bg-white/[0.06] transition-all border border-transparent hover:border-white/5 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-sm text-white font-black border border-white/5 uppercase shadow-lg">
                            {u.displayName[0]}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white uppercase tracking-tight">{u.displayName}</span>
                            <span className="text-[9px] text-white/20 font-mono">ID: {u.id.slice(0,8).toUpperCase()}</span>
                        </div>
                    </div>
                    <button onClick={()=>sendInvite(u.id, u.displayName)} className="p-3 bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-xl transition-all border border-cyan-500/20 shadow-xl group-hover:scale-105">
                        <IconUserPlus size={20}/>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}