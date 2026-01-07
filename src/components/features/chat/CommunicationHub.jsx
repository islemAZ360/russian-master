"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconMessage, IconPlus, IconLock, IconSend, IconUserPlus, 
  IconArrowLeft, IconX, IconHash, IconUsers, IconWorld, IconTrash,
  IconShieldLock, IconSchool
} from "@tabler/icons-react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, deleteDoc, limit, where 
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * مركز الاتصالات (Communication Hub) - النسخة الهرمية (RBAC Edition)
 */
export default function CommunicationHub() {
  const { user, userData, isAdmin, isJunior, isTeacher, isStudent, isUser } = useAuth();
  const { t, dir } = useLanguage();
  
  // --- حالات الحالة (States) ---
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // حالات النوافذ والمدخلات
  const [inputText, setInputText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // إعدادات المجموعة الجديدة
  const [newGroup, setNewGroup] = useState({ name: "", type: "public" });
  
  // قائمة المستخدمين للدعوة (للأستاذ فقط مبدئياً لجلب طلابه)
  const [availableUsersToInvite, setAvailableUsersToInvite] = useState([]);

  const messagesEndRef = useRef(null);

  // --- 1. جلب قائمة الدردشات بناءً على الصلاحيات ---
  useEffect(() => {
    if (!user) return;

    // الاستعلام الأساسي: ترتيب حسب النشاط
    const q = query(collection(db, "chats"), orderBy("lastActivity", "desc"));
    
    const unsub = onSnapshot(q, (snapshot) => {
        const allChats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // التصفية المنطقية حسب الرتبة
        const filteredChats = allChats.filter(chat => {
            // 1. الأدمن يرى كل شيء
            if (isAdmin || isJunior) return true;

            // 2. إذا كانت المجموعة عامة، يراها الجميع
            if (chat.type === 'public') return true;

            // 3. إذا كانت خاصة، يراها فقط الأعضاء فيها
            // (وهذا يغطي الأستاذ الذي أنشأها، والطالب الذي تمت إضافته لها)
            if (chat.members && chat.members.includes(user.uid)) return true;

            return false;
        });

        setChats(filteredChats);
    });

    return () => unsub();
  }, [user, isAdmin, isJunior]);

  // --- 2. جلب الرسائل للدردشة المختارة ---
  useEffect(() => {
    if (!selectedChat) return;
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
  }, [selectedChat]);

  // --- 3. جلب المستخدمين للدعوة (مخصص للأستاذ) ---
  useEffect(() => {
      if (showInviteModal && isTeacher) {
          // الأستاذ يدعو طلابه فقط
          const q = query(collection(db, "users"), where("teacherId", "==", user.uid));
          onSnapshot(q, (snap) => {
              setAvailableUsersToInvite(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          });
      }
  }, [showInviteModal, isTeacher, user]);

  // --- العمليات (Actions) ---

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;
    const text = inputText;
    setInputText("");

    try {
        await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
            text,
            senderId: user.uid,
            senderName: userData?.displayName || "Agent",
            createdAt: serverTimestamp(),
            type: 'text'
        });

        await updateDoc(doc(db, "chats", selectedChat.id), {
            lastActivity: serverTimestamp(),
            lastMessage: text
        });
    } catch (e) { console.error("Message Error:", e); }
  };

  const handleDeleteMessage = async (msgId) => {
      if (!isAdmin && !isTeacher) return; // الأستاذ أيضاً يمكنه حذف الرسائل في مجموعته
      if (confirm(t('admin_confirm_delete'))) {
          await deleteDoc(doc(db, "chats", selectedChat.id, "messages", msgId));
      }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;
    
    // الطالب لا يمكنه الإنشاء (حماية إضافية)
    if (isStudent) return;

    // الأستاذ ينشئ مجموعات خاصة تلقائياً
    const finalType = isTeacher ? 'private' : newGroup.type;

    try {
        const docRef = await addDoc(collection(db, "chats"), {
            name: newGroup.name,
            type: finalType,
            createdBy: user.uid,
            members: [user.uid], // المنشئ عضو تلقائي
            lastActivity: serverTimestamp(),
            lastMessage: "CHANNEL_INITIALIZED"
        });
        
        setShowCreateModal(false);
        setNewGroup({ name: "", type: "public" });
        // الانتقال للمجموعة الجديدة فوراً
        setSelectedChat({ id: docRef.id, name: newGroup.name, type: finalType, createdBy: user.uid });
        
    } catch (e) { console.error("Creation Error:", e); }
  };

  const handleInviteUser = async (userId) => {
      if (!selectedChat) return;
      try {
          await updateDoc(doc(db, "chats", selectedChat.id), {
              // استخدام arrayUnion لمنع التكرار
              members: arrayUnion(userId) 
          });
          alert("Operative added to frequency.");
      } catch (e) { console.error(e); }
  };

  // تحديد ما إذا كان المستخدم يمكنه إنشاء مجموعة
  // (الأدمن، الأستاذ، والمستخدم العادي يمكنهم) - (الطالب لا يمكنه)
  const canCreate = !isStudent;

  // تحديد ما إذا كان المستخدم يمكنه دعوة الآخرين للمجموعة الحالية
  // (منشئ المجموعة أو الأدمن)
  const canInvite = selectedChat && (selectedChat.createdBy === user.uid || isAdmin);

  return (
    <div className="flex-1 w-full flex flex-col md:flex-row bg-[#080808]/60 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl mb-10 h-[calc(100vh-180px)]" dir={dir}>
      
      {/* 1. القائمة الجانبية (Sidebar) */}
      <aside className={`w-full md:w-80 border-r border-white/5 flex flex-col bg-black/40 shrink-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
              <IconMessage className="text-cyan-500" size={24}/>
              <h2 className="text-lg font-black tracking-tighter text-white uppercase">{t('chat_title')}</h2>
          </div>
          
          {canCreate && (
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="p-2 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-500 hover:text-white rounded-xl transition-all border border-cyan-500/20 shadow-lg"
                title={t('chat_create_squad')}
              >
                  <IconPlus size={20}/>
              </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {chats.map(chat => (
            <motion.div 
                key={chat.id} 
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedChat(chat)} 
                className={`p-4 rounded-2xl cursor-pointer transition-all border group flex justify-between items-center ${
                    selectedChat?.id === chat.id 
                    ? 'bg-cyan-600/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                }`}
            >
              <div className="overflow-hidden">
                <div className={`font-black text-sm transition-colors truncate uppercase tracking-tight ${selectedChat?.id === chat.id ? 'text-cyan-400' : 'text-zinc-300'}`}>
                    {chat.name}
                </div>
                <div className="text-[9px] text-white/20 truncate mt-1 font-mono uppercase tracking-widest">
                    {chat.lastMessage || "Standby..."}
                </div>
              </div>
              {chat.type === 'private' ? <IconLock size={14} className="text-orange-500" /> : <IconWorld size={14} className="text-emerald-500" />}
            </motion.div>
          ))}
          {chats.length === 0 && (
              <div className="text-center py-10 text-white/20 text-[10px] uppercase font-mono">No Frequencies Found</div>
          )}
        </div>
      </aside>

      {/* 2. منطقة الدردشة (Chat Area) */}
      <main className={`flex-1 flex flex-col relative bg-[#050505]/40 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-30">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-6 animate-[spin_30s_linear_infinite]">
                  <IconHash size={40} className="text-white/40"/>
              </div>
              <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em]">{t('chat_no_freq')}</h3>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="h-20 border-b border-white/5 flex items-center px-6 bg-black/40 backdrop-blur-md gap-4 shrink-0 z-10">
              <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 hover:bg-white/10 rounded-xl text-white">
                  <IconArrowLeft size={20}/>
              </button>
              
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/10 uppercase shrink-0">
                    {selectedChat.name[0]}
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

              {canInvite && (
                <button 
                    onClick={() => setShowInviteModal(true)} 
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 rounded-xl transition-all shadow-lg"
                    title={t('chat_invite')}
                >
                    <IconUserPlus size={20} />
                </button>
              )}
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-[0.02] relative">
              {messages.map((m) => {
                const isMe = m.senderId === user.uid;
                const isAdminMsg = m.senderId === 'ADMIN_SYSTEM'; // Future expansion
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={m.id} 
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`flex items-start gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] text-white font-black uppercase shrink-0 shadow-lg">
                                {m.senderName?.[0] || "?"}
                            </div>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter">{m.senderName}</span>
                                    <span className="text-[7px] font-mono text-white/10 uppercase">
                                        {m.createdAt ? new Date(m.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                                    </span>
                                </div>
                                <div className={`relative group p-3.5 rounded-2xl text-sm leading-relaxed shadow-xl backdrop-blur-sm transition-all duration-300 ${
                                    isMe 
                                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-cyan-900/20' 
                                    : 'bg-zinc-900/80 text-zinc-200 border border-white/5 rounded-tl-none'
                                }`}>
                                    {m.text}
                                    
                                    {(isAdmin || (isTeacher && selectedChat.createdBy === user.uid)) && (
                                        <button 
                                            onClick={() => handleDeleteMessage(m.id)}
                                            className={`absolute ${isMe ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 p-1.5 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all`}
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

            {/* Input */}
            <footer className="p-4 bg-black border-t border-white/5 shrink-0">
              <div className="flex gap-3 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 focus-within:border-cyan-500/50 transition-all shadow-inner">
                  <input 
                    value={inputText} 
                    onChange={e=>setInputText(e.target.value)} 
                    onKeyDown={e=>e.key==='Enter'&&handleSendMessage()} 
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/10 font-medium" 
                    placeholder={t('chat_type_msg')} 
                  />
                  <button 
                    onClick={handleSendMessage} 
                    disabled={!inputText.trim()}
                    className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-20 text-white rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    <IconSend size={20}/>
                  </button>
              </div>
            </footer>
          </>
        )}
      </main>

      {/* 3. نافذة الإنشاء (Create Modal) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-2xl font-black mb-1 text-white uppercase tracking-tighter">{t('chat_create_squad')}</h3>
              <p className="text-white/20 text-[9px] mb-6 font-mono uppercase tracking-[0.2em]">Frequency_Generator</p>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-[9px] font-black text-cyan-500 uppercase tracking-widest ml-1 mb-2 block">{t('chat_squad_name')}</label>
                      <input value={newGroup.name} onChange={e=>setNewGroup({...newGroup, name:e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-500 text-white font-bold text-sm" placeholder="e.g. ALPHA TEAM" />
                  </div>
                  
                  {/* إخفاء خيار النوع للأستاذ لأنه دائماً خاص */}
                  {!isTeacher && (
                      <div>
                          <label className="text-[9px] font-black text-cyan-500 uppercase tracking-widest ml-1 mb-2 block">{t('chat_security')}</label>
                          <select value={newGroup.type} onChange={e=>setNewGroup({...newGroup, type:e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 outline-none text-white focus:border-cyan-500 cursor-pointer uppercase font-bold text-xs">
                            <option value="public">{t('chat_public')}</option>
                            <option value="private">{t('chat_private')}</option>
                          </select>
                      </div>
                  )}
                  {isTeacher && (
                      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3">
                          <IconLock size={16} className="text-orange-500"/>
                          <span className="text-[10px] text-orange-400 font-bold uppercase">Locked to Private Class</span>
                      </div>
                  )}
              </div>

              <div className="flex gap-3 mt-8">
                  <button onClick={()=>setShowCreateModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white font-black uppercase text-[10px] transition-colors">{t('chat_cancel')}</button>
                  <button onClick={handleCreateGroup} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-lg transition-all uppercase text-[10px] tracking-widest">{t('chat_init')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. نافذة الدعوة (Invite Modal) */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl flex flex-col max-h-[500px]">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <IconUsers size={20} className="text-cyan-500"/> 
                    <span className="text-lg font-black text-white uppercase tracking-tight">{t('chat_invite')}</span>
                </div>
                <button onClick={()=>setShowInviteModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all"><IconX size={18}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {/* إذا كان أستاذاً، اعرض طلابه فقط، وإلا اعرض الجميع (أو منطق آخر) */}
                {isTeacher ? (
                    availableUsersToInvite.length > 0 ? (
                        availableUsersToInvite.map(u => (
                            <InviteRow key={u.id} user={u} onInvite={handleInviteUser} isMember={selectedChat?.members?.includes(u.id)} />
                        ))
                    ) : (
                        <div className="text-center py-10 text-white/20 text-xs uppercase font-mono">No students assigned yet.</div>
                    )
                ) : (
                    <div className="text-center py-10 text-white/20 text-xs uppercase font-mono">Feature restricted to command.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// مكون فرعي لصف الدعوة
const InviteRow = ({ user, onInvite, isMember }) => (
    <div className="p-3 bg-white/[0.03] rounded-xl flex justify-between items-center border border-transparent hover:border-white/5 transition-all">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs text-white font-black uppercase">
                {user.displayName?.[0]}
            </div>
            <div>
                <div className="text-xs font-bold text-white uppercase">{user.displayName}</div>
                <div className="text-[8px] text-white/30 font-mono">ID: {user.id.slice(0,4)}</div>
            </div>
        </div>
        <button 
            onClick={() => !isMember && onInvite(user.id)} 
            disabled={isMember}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${isMember ? 'text-white/20 bg-transparent cursor-default' : 'bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white'}`}
        >
            {isMember ? 'JOINED' : 'ADD'}
        </button>
    </div>
);