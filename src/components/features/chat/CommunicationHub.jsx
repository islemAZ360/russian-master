"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconMessage, IconPlus, IconLock, IconSend, IconUserPlus, 
  IconArrowLeft, IconX, IconHash, IconUsers, IconWorld
} from "@tabler/icons-react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc 
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";

export default function CommunicationHub() {
  const { user, userData, isJunior } = useAuth();
  const { t, dir } = useLanguage(); // استدعاء الترجمة واتجاه النص
  
  // States
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // لغرض الدعوات
  const [inputText, setInputText] = useState("");
  
  // Modals States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", type: "public" });
  
  // Refs
  const messagesEndRef = useRef(null);

  // --- 1. جلب المحادثات (Real-time) ---
  useEffect(() => {
    if (!user) return;

    // ترتيب المحادثات حسب آخر نشاط
    const q = query(collection(db, "chats"), orderBy("lastActivity", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // تصفية المحادثات: إما عامة أو المستخدم عضو فيها
        setChats(list.filter(c => c.type === 'public' || c.members?.includes(user.uid)));
    });

    return () => unsubscribe();
  }, [user]);

  // --- 2. جلب الرسائل عند اختيار محادثة ---
  useEffect(() => {
    if (!selectedChat) return;
    
    const q = query(
        collection(db, "chats", selectedChat.id, "messages"), 
        orderBy("createdAt", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map(d => d.data()));
        // التمرير للأسفل عند وصول رسالة جديدة
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    });
    
    return () => unsubscribe();
  }, [selectedChat]);

  // --- 3. جلب المستخدمين (فقط عند فتح نافذة الدعوة) ---
  useEffect(() => {
    if(showInviteModal) {
        const unsubscribe = onSnapshot(collection(db, "users"), (snap) => {
            setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsubscribe();
    }
  }, [showInviteModal]);

  // --- Actions ---

  const createGroup = async () => {
    if(!newGroup.name.trim() || !isJunior) return;
    
    try {
        const docRef = await addDoc(collection(db, "chats"), {
          name: newGroup.name,
          type: newGroup.type,
          createdBy: user.uid,
          members: [user.uid],
          lastActivity: serverTimestamp(),
          lastMessage: "Channel Initialized"
        });
        
        setShowCreateModal(false);
        // الانتقال للمحادثة الجديدة مباشرة
        setSelectedChat({ 
            id: docRef.id, 
            name: newGroup.name, 
            type: newGroup.type, 
            createdBy: user.uid 
        });
        setNewGroup({ name: "", type: "public" });
    } catch (e) {
        console.error("Error creating group:", e);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;
    
    const text = inputText; 
    setInputText(""); // مسح الحقل فوراً لتحسين التجربة

    try {
        // إضافة الرسالة
        await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
          text, 
          senderName: userData?.displayName || user.email?.split('@')[0], 
          createdAt: serverTimestamp()
        });
        
        // تحديث آخر نشاط للمحادثة (لتظهر في الأعلى)
        await updateDoc(doc(db, "chats", selectedChat.id), {
          lastActivity: serverTimestamp(), 
          lastMessage: text
        });
    } catch (e) {
        console.error("Error sending message:", e);
    }
  };

  const sendInvite = async (targetId, targetName) => {
    try {
        // إضافة إشعار للمستخدم المدعو
        await addDoc(collection(db, "notifications"), {
          userId: targetId,
          title: t('chat_squad_invite'),
          message: `${userData?.displayName || "Commander"} invited you to join ${selectedChat.name}`,
          type: "invite", // هذا النوع يتم التعامل معه في NotificationCenter
          chatId: selectedChat.id,
          createdAt: serverTimestamp()
        });
        
        // إضافة المستخدم لقائمة الأعضاء (اختياري: يمكن أن يتم عند قبول الدعوة)
        // هنا سنضيفه مباشرة للتسهيل
        await updateDoc(doc(db, "chats", selectedChat.id), {
            // ملاحظة: Firestore arrayUnion يحتاج لاستيراد
            // لكن هنا سنفترض أن المستخدم سيقبل الدعوة من الإشعارات
        });

        alert(`Signal sent to ${targetName}`);
    } catch (e) {
        console.error("Invite failed:", e);
    }
  };

  return (
    <div className="w-full h-[80vh] flex flex-col md:flex-row rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-black/20" dir={dir}>
      
      {/* 1. Sidebar (قائمة المحادثات) */}
      <aside className={`w-full md:w-80 border-r border-white/5 flex flex-col bg-black/40 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
          <h2 className="text-xl font-black italic tracking-tighter text-white flex items-center gap-2">
            <IconMessage className="text-cyan-500"/> {t('chat_title')}
          </h2>
          {isJunior && (
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="p-2 bg-cyan-500/10 hover:bg-cyan-500 hover:text-white text-cyan-500 rounded-xl transition-all border border-cyan-500/20"
                title={t('chat_create_squad')}
              >
                  <IconPlus size={20}/>
              </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {chats.map(chat => (
            <div key={chat.id} onClick={() => setSelectedChat(chat)} 
                 className={`p-4 rounded-xl cursor-pointer transition-all group flex justify-between items-center border ${
                    selectedChat?.id === chat.id 
                    ? 'bg-cyan-500/10 border-cyan-500/30' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                 }`}
            >
              <div className="overflow-hidden">
                <div className={`font-bold text-sm transition-colors truncate ${selectedChat?.id === chat.id ? 'text-cyan-400' : 'text-white'}`}>
                    {chat.name}
                </div>
                <div className="text-[10px] text-white/40 truncate mt-1 font-mono max-w-[150px]">
                    {chat.lastMessage}
                </div>
              </div>
              
              {/* أيقونة نوع المحادثة */}
              {chat.type === 'private' 
                ? <IconLock size={14} className="text-orange-400 shrink-0" /> 
                : <IconWorld size={14} className="text-emerald-400 shrink-0" />
              }
            </div>
          ))}
        </div>
      </aside>

      {/* 2. Main Chat Area (منطقة المحادثة) */}
      <main className={`flex-1 flex flex-col relative bg-transparent ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20">
              <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center mb-6 animate-pulse">
                  <IconHash size={48} className="opacity-50"/>
              </div>
              <p className="font-mono text-sm tracking-[0.2em] uppercase">{t('chat_no_freq')}</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="h-20 border-b border-white/5 flex items-center px-6 bg-black/20 backdrop-blur-md gap-4 shrink-0">
              {/* زر الرجوع للموبايل */}
              <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 hover:bg-white/10 rounded-full text-white">
                  <IconArrowLeft/>
              </button>
              
              <div className="flex items-center gap-4 flex-1">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-lg border border-white/10">
                    {selectedChat.name[0].toUpperCase()}
                 </div>
                 <div className="flex flex-col">
                     <h3 className="font-bold text-white text-lg leading-none">{selectedChat.name}</h3>
                     <span className="text-[10px] text-cyan-500 font-mono tracking-wider uppercase mt-1 flex items-center gap-1">
                        {selectedChat.type === 'private' ? <IconLock size={10}/> : <IconWorld size={10}/>} 
                        {selectedChat.type === 'private' ? t('chat_server_private') : t('chat_server_public')}
                     </span>
                 </div>
              </div>

              {/* زر الدعوة (للمالك فقط) */}
              {selectedChat.createdBy === user.uid && (
                <button 
                    onClick={() => setShowInviteModal(true)} 
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                >
                    <IconUserPlus size={16} />
                    <span className="hidden sm:inline">{t('chat_invite')}</span>
                </button>
              )}
            </header>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent custom-scrollbar">
              {messages.map((m, i) => {
                const isMe = m.senderName === (userData?.displayName || user.email?.split('@')[0]);
                return (
                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-end gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mb-1 border border-white/10">
                                    {m.senderName ? m.senderName[0].toUpperCase() : '?'}
                                </div>
                            )}
                            <div>
                                {!isMe && <div className="text-[10px] text-white/40 mb-1 ml-1">{m.senderName}</div>}
                                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-md backdrop-blur-sm ${
                                    isMe 
                                    ? 'bg-cyan-600 text-white rounded-br-none' 
                                    : 'bg-white/10 text-white/90 border border-white/5 rounded-bl-none'
                                }`}>
                                    {m.text}
                                </div>
                                <span className={`text-[9px] text-white/20 mt-1 block font-mono ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                                    {m.createdAt ? new Date(m.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <footer className="p-4 bg-black/20 border-t border-white/5 backdrop-blur-md shrink-0">
              <div className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 focus-within:border-cyan-500/50 transition-colors">
                  <input 
                    value={inputText} 
                    onChange={e=>setInputText(e.target.value)} 
                    onKeyDown={e=>e.key==='Enter'&&sendMessage()} 
                    className="flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/20" 
                    placeholder={t('chat_type_msg')} 
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={!inputText.trim()}
                    className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all disabled:opacity-50 shadow-lg"
                  >
                    <IconSend size={18}/>
                  </button>
              </div>
            </footer>
          </>
        )}
      </main>

      {/* 3. Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="w-full max-w-md bg-[#111] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <IconUsers size={20} className="text-cyan-500"/> {t('chat_squad_invite')}
                </h3>
                <button onClick={()=>setShowInviteModal(false)} className="text-white/30 hover:text-white"><IconX/></button>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {allUsers.filter(u=>u.id!==user.uid).map(u => (
                  <div key={u.id} className="p-3 bg-white/5 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors group border border-transparent hover:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-white font-bold">
                            {(u.displayName || u.id || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{u.displayName || "Unknown Agent"}</span>
                            <span className="text-[10px] text-white/30 font-mono">ID: {u.id.slice(0,6)}...</span>
                        </div>
                    </div>
                    <button onClick={()=>sendInvite(u.id, u.displayName || u.id)} className="p-2 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-lg text-xs transition-all">
                        <IconUserPlus size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <h3 className="text-2xl font-black mb-1 italic uppercase text-white">{t('chat_create_squad')}</h3>
              <p className="text-white/30 text-xs mb-6 font-mono">Create a new frequency.</p>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest ml-1">{t('chat_squad_name')}</label>
                      <input value={newGroup.name} onChange={e=>setNewGroup({...newGroup, name:e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-3 mt-1 outline-none focus:border-cyan-500 text-white font-bold" placeholder="Alpha Team" />
                  </div>
                  <div>
                      <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest ml-1">{t('chat_security')}</label>
                      <select value={newGroup.type} onChange={e=>setNewGroup({...newGroup, type:e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-3 mt-1 outline-none text-white focus:border-cyan-500 cursor-pointer">
                        <option value="public">{t('chat_public')}</option>
                        <option value="private">{t('chat_private')}</option>
                      </select>
                  </div>
              </div>

              <div className="flex gap-3 mt-8">
                  <button onClick={()=>setShowCreateModal(false)} className="flex-1 py-3 text-white/50 font-bold hover:text-white transition-colors">{t('chat_cancel')}</button>
                  <button onClick={createGroup} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all">{t('chat_init')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}