"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconMessage, IconPlus, IconLock, IconSend, IconUserPlus, IconArrowLeft, IconX, IconHash
} from "@tabler/icons-react";
import { db } from "../../lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, arrayUnion 
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

export default function CommunicationHub() {
  const { user, userData, isJunior } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", type: "public" });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("lastActivity", "desc"));
    return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setChats(list.filter(c => c.type === 'public' || c.members?.includes(user.uid)));
    });
  }, [user]);

  useEffect(() => {
    if (!selectedChat) return;
    const q = query(collection(db, "chats", selectedChat.id, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map(d => d.data()));
        setTimeout(scrollToBottom, 100);
    });
    return () => unsub();
  }, [selectedChat]);

  useEffect(() => {
    onSnapshot(collection(db, "users"), (snap) => {
        setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const createGroup = async () => {
    if(!newGroup.name.trim() || !isJunior) return;
    const docRef = await addDoc(collection(db, "chats"), {
      name: newGroup.name,
      type: newGroup.type,
      createdBy: user.uid,
      members: [user.uid],
      lastActivity: serverTimestamp(),
      lastMessage: "Channel Active"
    });
    setShowCreateModal(false);
    setSelectedChat({ id: docRef.id, name: newGroup.name });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;
    const text = inputText; setInputText("");
    await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
      text, senderName: userData?.displayName || user.email, createdAt: serverTimestamp()
    });
    await updateDoc(doc(db, "chats", selectedChat.id), {
      lastActivity: serverTimestamp(), lastMessage: text
    });
  };

  const sendInvite = async (targetId, targetName) => {
    await addDoc(collection(db, "notifications"), {
      userId: targetId,
      title: "SQUAD INVITE",
      message: `${userData.displayName} invited you to join ${selectedChat.name}`,
      type: "invite",
      chatId: selectedChat.id,
      createdAt: serverTimestamp()
    });
    alert(`Invite sent to ${targetName}`);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-black/40 backdrop-blur-xl border border-white/5 overflow-hidden">
      
      {/* Sidebar List */}
      <aside className={`w-full md:w-80 border-r border-white/10 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'} bg-[#0a0a0a]`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-white italic tracking-tighter">SQUADS</h2>
            {isJunior && (
                <button onClick={() => setShowCreateModal(true)} className="p-2 bg-cyan-600 rounded-xl hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20">
                    <IconPlus size={20} className="text-white"/>
                </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {chats.map(chat => (
            <div key={chat.id} onClick={() => setSelectedChat(chat)} className={`p-4 rounded-2xl cursor-pointer transition-all group ${selectedChat?.id === chat.id ? 'bg-cyan-900/20 border border-cyan-500/50' : 'hover:bg-white/5 border border-transparent'}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">{chat.name}</span>
                {chat.type === 'private' && <IconLock size={14} className="text-orange-500" />}
              </div>
              <p className="text-[10px] text-white/30 truncate mt-1 font-mono">{chat.lastMessage}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col relative ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/10">
              <IconHash size={100} className="mb-4 opacity-50"/>
              <p className="font-mono text-sm tracking-[0.2em]">NO FREQUENCY SELECTED</p>
          </div>
        ) : (
          <>
            {/* Header المعدل: زر الدعوة بجانب الاسم */}
            <header className="h-20 border-b border-white/10 flex items-center px-6 bg-black/40 backdrop-blur-md gap-4">
              <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 hover:bg-white/10 rounded-full"><IconArrowLeft/></button>
              
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-800 to-black border border-white/10 flex items-center justify-center font-bold text-white shrink-0">
                    {selectedChat.name[0].toUpperCase()}
                 </div>
                 
                 <div className="flex flex-col">
                     <h3 className="font-black text-white text-lg leading-none truncate">{selectedChat.name}</h3>
                     <span className="text-[10px] text-cyan-500 font-mono tracking-wider uppercase">{selectedChat.type} SERVER</span>
                 </div>

                 {/* زر الدعوة تم نقله هنا بجانب الاسم */}
                 {selectedChat.createdBy === user.uid && (
                    <button 
                        onClick={() => setShowInviteModal(true)} 
                        className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-cyan-600/20 text-white/50 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/50 rounded-full transition-all text-[10px] font-bold uppercase tracking-wider"
                    >
                        <IconUserPlus size={14} />
                        <span className="hidden sm:inline">Invite</span>
                    </button>
                  )}
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.senderName === (userData?.displayName || user.email) ? 'items-end' : 'items-start'}`}>
                   <div className="flex items-end gap-2 max-w-[85%]">
                      {m.senderName !== (userData?.displayName || user.email) && (
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mb-1">
                              {m.senderName[0].toUpperCase()}
                          </div>
                      )}
                      <div>
                          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                              m.senderName === (userData?.displayName || user.email) 
                              ? 'bg-cyan-600 text-white rounded-tr-none' 
                              : 'bg-[#1a1a1a] text-gray-200 border border-white/10 rounded-tl-none'
                          }`}>
                              {m.text}
                          </div>
                          <span className="text-[9px] text-white/20 px-1 mt-1 block">
                             {m.createdAt ? new Date(m.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                          </span>
                      </div>
                   </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <footer className="p-4 bg-black/60 border-t border-white/10 backdrop-blur-md">
              <div className="flex gap-2 bg-[#111] p-1.5 rounded-2xl border border-white/10 focus-within:border-cyan-500/50 transition-colors">
                  <input 
                    value={inputText} 
                    onChange={e=>setInputText(e.target.value)} 
                    onKeyDown={e=>e.key==='Enter'&&sendMessage()} 
                    className="flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/20" 
                    placeholder="Type encrypted message..." 
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={!inputText.trim()}
                    className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:bg-gray-800"
                  >
                    <IconSend size={18}/>
                  </button>
              </div>
            </footer>
          </>
        )}
      </main>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Reinforcements</h3>
                <button onClick={()=>setShowInviteModal(false)} className="text-white/30 hover:text-white"><IconX/></button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                {allUsers.filter(u=>u.id!==user.uid).map(u => (
                  <div key={u.id} className="p-3 bg-white/5 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs">{u.email[0].toUpperCase()}</div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">{u.displayName}</span>
                    </div>
                    <button onClick={()=>sendInvite(u.id, u.displayName)} className="p-2 bg-cyan-900/30 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-lg text-xs transition-all border border-cyan-500/20">
                        <IconUserPlus size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <h3 className="text-2xl font-black mb-1 italic uppercase text-white">Forge Squad</h3>
              <p className="text-white/30 text-xs mb-6">Create a new neural frequency.</p>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest ml-1">Squad Name</label>
                      <input value={newGroup.name} onChange={e=>setNewGroup({...newGroup, name:e.target.value})} className="w-full bg-black border border-white/20 rounded-xl p-3 mt-1 outline-none focus:border-cyan-500 text-white font-bold" placeholder="Alpha Team" />
                  </div>
                  <div>
                      <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest ml-1">Security Protocol</label>
                      <select value={newGroup.type} onChange={e=>setNewGroup({...newGroup, type:e.target.value})} className="w-full bg-black border border-white/20 rounded-xl p-3 mt-1 outline-none text-white focus:border-cyan-500 cursor-pointer">
                        <option value="public">Public (Open)</option>
                        <option value="private">Encrypted (Private)</option>
                      </select>
                  </div>
              </div>

              <div className="flex gap-3 mt-8">
                  <button onClick={()=>setShowCreateModal(false)} className="flex-1 py-3 text-white/50 font-bold hover:text-white transition-colors">Cancel</button>
                  <button onClick={createGroup} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all">Initialize</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}