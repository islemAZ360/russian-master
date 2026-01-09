"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconMessage, IconPlus, IconLock, IconSend, IconUserPlus, 
  IconArrowLeft, IconX, IconHash, IconWorld, IconTrash,
  IconSchool, IconLoader2, IconShieldLock, IconUsers
} from "@tabler/icons-react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, deleteDoc, limit, where, arrayUnion 
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";

export default function CommunicationHub() {
  const { user, userData, isAdmin, isTeacher, isStudent } = useAuth();
  const { t, dir } = useLanguage();
  
  // States
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  
  const [inputText, setInputText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const [newGroup, setNewGroup] = useState({ name: "", type: "public" });
  const [myStudentsToInvite, setMyStudentsToInvite] = useState([]);

  const messagesEndRef = useRef(null);

  // --- 1. جلب الدردشات ---
  useEffect(() => {
    if (!user) return;
    setLoadingChats(true);

    const chatsMap = new Map();
    const unsubscribers = [];

    const updateLocalChats = () => {
        const uniqueChats = Array.from(chatsMap.values())
            .sort((a, b) => {
                const timeA = a.lastActivity?.seconds || 0;
                const timeB = b.lastActivity?.seconds || 0;
                return timeB - timeA;
            });
        setChats(uniqueChats);
        setLoadingChats(false);
    };

    const addToMapAndSync = (snap) => {
        snap.docs.forEach(doc => chatsMap.set(doc.id, { id: doc.id, ...doc.data() }));
        snap.docChanges().forEach((change) => {
            if (change.type === "removed") {
                chatsMap.delete(change.doc.id);
            }
        });
        updateLocalChats();
    };

    try {
        // الاستعلامات (Queries)
        const qPublic = query(collection(db, "chats"), where("type", "==", "public"));
        unsubscribers.push(onSnapshot(qPublic, addToMapAndSync));

        const qMember = query(collection(db, "chats"), where("members", "array-contains", user.uid));
        unsubscribers.push(onSnapshot(qMember, addToMapAndSync));

        const qOwner = query(collection(db, "chats"), where("createdBy", "==", user.uid));
        unsubscribers.push(onSnapshot(qOwner, addToMapAndSync));

        if (isStudent && userData?.teacherId) {
            const qTeacher = query(collection(db, "chats"), where("createdBy", "==", userData.teacherId));
            unsubscribers.push(onSnapshot(qTeacher, addToMapAndSync));
        }
    } catch (err) {
        console.error("Chat Query Error:", err);
        setLoadingChats(false);
    }

    // إيقاف التحميل حتى لو لم تكن هناك بيانات
    setTimeout(() => setLoadingChats(false), 2000);

    return () => {
        unsubscribers.forEach(unsub => unsub());
    };
  }, [user, isAdmin, isStudent, userData, isTeacher]);

  // --- 2. جلب الرسائل ---
  useEffect(() => {
    if (!selectedChat) return;
    
    if (isStudent && userData?.teacherId === selectedChat.createdBy && !selectedChat.members?.includes(user.uid)) {
        updateDoc(doc(db, "chats", selectedChat.id), {
            members: arrayUnion(user.uid)
        }).catch(err => console.error("Auto-join failed", err));
    }

    const q = query(
        collection(db, "chats", selectedChat.id, "messages"), 
        orderBy("createdAt", "asc"),
        limit(100)
    );
    
    const unsub = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsub();
  }, [selectedChat, isStudent, user, userData]);

  // --- 3. جلب طلاب الأستاذ للدعوة ---
  useEffect(() => {
      if (showInviteModal && isTeacher) {
          const q = query(collection(db, "users"), where("teacherId", "==", user.uid));
          const unsub = onSnapshot(q, (snap) => {
              setMyStudentsToInvite(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          });
          return () => unsub();
      }
  }, [showInviteModal, isTeacher, user]);

  // --- Actions ---
  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;
    const text = inputText;
    setInputText("");

    try {
        await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
            text,
            senderId: user.uid,
            senderName: user.displayName || "Agent",
            createdAt: serverTimestamp(),
            type: 'text'
        });

        await updateDoc(doc(db, "chats", selectedChat.id), {
            lastActivity: serverTimestamp(),
            lastMessage: text
        });
    } catch (e) { console.error(e); }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;
    const finalType = isTeacher ? (newGroup.type || 'private') : newGroup.type;

    try {
        const docRef = await addDoc(collection(db, "chats"), {
            name: newGroup.name,
            type: finalType,
            createdBy: user.uid,
            members: [user.uid],
            lastActivity: serverTimestamp(),
            lastMessage: "CHANNEL_INITIALIZED"
        });
        
        setShowCreateModal(false);
        setNewGroup({ name: "", type: "public" });
        setSelectedChat({ id: docRef.id, name: newGroup.name, type: finalType, createdBy: user.uid, members: [user.uid] });
        
    } catch (e) { console.error(e); }
  };

  const handleInviteUser = async (studentId) => {
      if (!selectedChat) return;
      try {
          await updateDoc(doc(db, "chats", selectedChat.id), { members: arrayUnion(studentId) });
          alert("Operative added.");
      } catch (e) { console.error(e); }
  };

  const handleDeleteChat = async () => {
      if(!selectedChat) return;
      if(!confirm("Dismantle this squad channel?")) return;
      
      try {
          const chatId = selectedChat.id;
          setSelectedChat(null); 
          setChats(prev => prev.filter(c => c.id !== chatId));
          await deleteDoc(doc(db, "chats", chatId));
      } catch(e) { console.error("Delete Error:", e); }
  };

  const canCreate = !isStudent; 
  const isOwner = selectedChat && selectedChat.createdBy === user.uid;
  const canModify = isOwner || isAdmin;

  // FIX: استخدام ارتفاع ثابت بدلاً من calc لتجنب المشاكل
  // وإضافة خلفية واضحة للتأكد من الرؤية
  return (
    <div className="w-full h-[80vh] min-h-[600px] flex flex-col md:flex-row bg-[#0c0c0c] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative z-10" dir={dir}>
      
      {/* Sidebar List */}
      <aside className={`w-full md:w-80 border-r border-white/5 flex flex-col bg-black/60 shrink-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
              <IconMessage className="text-cyan-500" size={24}/>
              <h2 className="text-lg font-black tracking-tighter text-white uppercase">{t('chat_title')}</h2>
          </div>
          {canCreate && (
              <button onClick={() => setShowCreateModal(true)} className="p-2 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-500 hover:text-white rounded-xl transition-all border border-cyan-500/20 shadow-lg">
                  <IconPlus size={20}/>
              </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {loadingChats && chats.length === 0 && (
              <div className="text-center py-10 opacity-50 flex flex-col items-center">
                  <IconLoader2 className="animate-spin mb-2"/>
                  <span className="text-[10px]">SYNCING...</span>
              </div>
          )}
          
          {!loadingChats && chats.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <IconUsers size={40} className="text-white/20 mb-4"/>
                  <p className="text-white/30 text-xs font-mono uppercase mb-4">No active squads found</p>
                  {canCreate && (
                      <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-[10px] uppercase font-bold border border-white/10">
                          Create Squad
                      </button>
                  )}
              </div>
          )}
          
          <AnimatePresence>
            {chats.map(chat => {
                const isTeacherChat = isStudent && chat.createdBy === userData?.teacherId;
                const isMyChat = chat.createdBy === user.uid;

                return (
                <motion.div 
                    key={chat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedChat(chat)} 
                    className={`p-4 rounded-2xl cursor-pointer transition-all border group flex justify-between items-center ${
                        selectedChat?.id === chat.id 
                        ? 'bg-cyan-600/10 border-cyan-500/40 shadow-lg' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                >
                    <div className="overflow-hidden flex-1 mr-2">
                        <div className={`font-black text-sm truncate uppercase flex items-center gap-2 ${selectedChat?.id === chat.id ? 'text-cyan-400' : 'text-zinc-300'}`}>
                            {chat.name}
                            {isTeacherChat && <span className="bg-emerald-500/20 text-emerald-500 text-[8px] px-1.5 py-0.5 rounded">CMD</span>}
                            {isMyChat && <span className="bg-purple-500/20 text-purple-400 text-[8px] px-1.5 py-0.5 rounded">MY</span>}
                        </div>
                        <div className="text-[9px] text-white/20 truncate mt-1 font-mono">{chat.lastMessage || "Ready"}</div>
                    </div>
                    {chat.type === 'private' ? <IconLock size={14} className="text-orange-500"/> : <IconWorld size={14} className="text-cyan-500"/>}
                </motion.div>
                );
            })}
          </AnimatePresence>
        </div>
      </aside>

      {/* Chat Area */}
      <main className={`flex-1 flex flex-col relative bg-[#050505] ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-30">
              <IconHash size={64} className="text-white/20 mb-6"/>
              <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.4em]">{t('chat_no_freq')}</h3>
              {canCreate && <p className="text-[10px] mt-2 text-white/20">Select a squad or create a new one.</p>}
          </div>
        ) : (
          <>
            <header className="h-20 border-b border-white/5 flex items-center px-6 bg-black/40 backdrop-blur-md gap-4 shrink-0 z-10 justify-between">
              <div className="flex items-center gap-4 overflow-hidden">
                  <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 hover:bg-white/10 rounded-xl text-white"><IconArrowLeft size={20}/></button>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/10 uppercase shrink-0">
                      {selectedChat.name?.[0] || "#"}
                  </div>
                  <div className="flex flex-col truncate">
                      <h3 className="font-black text-white text-base leading-none uppercase tracking-tight truncate">{selectedChat.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${selectedChat.type === 'private' ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                          <span className="text-[8px] text-white/30 font-black uppercase tracking-widest truncate">
                              {selectedChat.type === 'private' ? t('chat_server_private') : t('chat_server_public')}
                          </span>
                      </div>
                  </div>
              </div>
              
              <div className="flex items-center gap-2">
                  {canModify && (
                    <>
                        <button onClick={() => setShowInviteModal(true)} className="p-2.5 bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 rounded-xl transition-all shadow-lg"><IconUserPlus size={20} /></button>
                        <button onClick={handleDeleteChat} className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all shadow-lg"><IconTrash size={20} /></button>
                    </>
                  )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-[0.02] relative">
              {messages.length === 0 && <div className="text-center text-white/20 mt-10 text-xs font-mono uppercase">Start transmission...</div>}
              {messages.map((m) => {
                const isMe = m.senderId === user.uid;
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-start gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] text-white font-black uppercase shrink-0 shadow-lg">{m.senderName?.[0]}</div>
                            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-xl ${isMe ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-zinc-900/80 text-zinc-200 border border-white/5 rounded-tl-none'}`}>
                                {m.text}
                            </div>
                        </div>
                    </motion.div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            <footer className="p-4 bg-black border-t border-white/5 shrink-0">
              <div className="flex gap-3 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 focus-within:border-cyan-500/50 transition-all">
                  <input value={inputText} onChange={e=>setInputText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSendMessage()} className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/10 font-medium" placeholder={t('chat_type_msg')} />
                  <button onClick={handleSendMessage} disabled={!inputText.trim()} className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-20 text-white rounded-xl transition-all shadow-lg"><IconSend size={20}/></button>
              </div>
            </footer>
          </>
        )}
      </main>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl flex flex-col max-h-[500px]">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h3 className="text-lg font-black text-white uppercase">{t('chat_invite')}</h3>
                <button onClick={()=>setShowInviteModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white"><IconX size={18}/></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {isTeacher ? (
                    myStudentsToInvite.length > 0 ? (
                        myStudentsToInvite.map(u => (
                            <div key={u.id} className="p-3 bg-white/[0.03] rounded-xl flex justify-between items-center border border-transparent hover:border-white/5 transition-all">
                                <span className="text-xs font-bold text-white uppercase">{u.displayName}</span>
                                {selectedChat?.members?.includes(u.id) ? 
                                    <span className="text-[9px] text-emerald-500 font-black">JOINED</span> :
                                    <button onClick={() => handleInviteUser(u.id)} className="px-3 py-1.5 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-lg text-[9px] font-black transition-all">ADD</button>
                                }
                            </div>
                        ))
                    ) : <div className="text-center py-10 text-white/20 text-xs font-mono">No students assigned.</div>
                ) : (
                    <div className="text-center py-10 text-white/20 text-xs font-mono">Restricted.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-2xl font-black mb-6 text-white uppercase tracking-tighter">{t('chat_create_squad')}</h3>
              <input value={newGroup.name} onChange={e=>setNewGroup({...newGroup, name:e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-500 text-white font-bold text-sm mb-4" placeholder="Squad Name..." />
              
              {!isTeacher && (
                  <select value={newGroup.type} onChange={e=>setNewGroup({...newGroup, type:e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 outline-none text-white focus:border-cyan-500 cursor-pointer uppercase font-bold text-xs mb-8">
                    <option value="public">{t('chat_public')}</option>
                    <option value="private">{t('chat_private')}</option>
                  </select>
              )}
              {isTeacher && <div className="mb-8 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[10px] text-orange-400 font-bold uppercase flex items-center gap-2"><IconShieldLock size={14}/> Private Class Channel</div>}

              <div className="flex gap-3">
                  <button onClick={()=>setShowCreateModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white font-black uppercase text-[10px]">{t('chat_cancel')}</button>
                  <button onClick={handleCreateGroup} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-lg uppercase text-[10px]">{t('chat_init')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}