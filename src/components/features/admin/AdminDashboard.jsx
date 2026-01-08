"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, onSnapshot, doc, updateDoc, query, orderBy, 
  deleteDoc, setDoc, serverTimestamp, arrayUnion, arrayRemove, limit, 
  deleteField, where, addDoc, getDoc 
} from "firebase/firestore";
import { 
  IconShield, IconUsers, IconLayoutDashboard, 
  IconBroadcast, IconMessage2, IconBan, IconTrash, 
  IconMenu2, IconSend, IconDeviceGamepad, IconHome, 
  IconUserMinus, IconMessages, IconMessagePlus, IconSearch,
  IconSchool, IconUnlink, IconActivity, IconLock, IconWorld, IconPencil, IconCheck, IconX,
  IconCpu, IconTerminal2
} from '@tabler/icons-react';
import { useUI } from '@/context/UIContext';
import { useLanguage } from '@/hooks/useLanguage';

// --- مكونات التصميم الفرعية (UI Components) ---

// 1. بطاقة الإحصائيات (Stat Card) - تصميم جديد
const StatCard = ({ title, value, icon, color, gradient }) => (
  <div className="relative group overflow-hidden rounded-[2rem] border border-white/5 bg-[#0e0e0e] p-6 transition-all hover:border-white/10 hover:shadow-2xl">
      {/* خلفية متوهجة */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${gradient} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${color.bg} ${color.text} border border-white/5 shadow-inner`}>
                  {React.cloneElement(icon, { size: 24 })}
              </div>
              {/* أيقونة خلفية كبيرة باهتة */}
              <div className={`absolute right-4 top-4 opacity-5 scale-150 transition-transform group-hover:scale-125 ${color.text}`}>
                  {React.cloneElement(icon, { size: 80 })}
              </div>
          </div>
          <div>
              <div className="text-4xl font-black text-white tracking-tighter mb-1">{value}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{title}</div>
          </div>
      </div>
  </div>
);

// 2. زر التنقل (Nav Button) - تصميم جديد
const NavBtn = ({ id, label, icon: Icon, count, activeView, onClick }) => {
    const isActive = activeView === id;
    return (
        <button 
            onClick={onClick} 
            className={`relative w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group overflow-hidden mb-2
            ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
        >
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent border-l-4 border-indigo-500"></div>
            )}
            <div className="relative flex items-center gap-4 z-10">
                <Icon size={20} className={isActive ? 'text-indigo-400' : 'group-hover:text-white transition-colors'} />
                <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
            </div>
            {count > 0 && (
                <span className="relative z-10 bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] px-2 py-0.5 rounded-lg font-black shadow-sm">
                    {count}
                </span>
            )}
        </button>
    );
};

export default function AdminDashboard({ currentUser }) {
  const { setCurrentView } = useUI();
  const { t, dir } = useLanguage();
  
  const [activeView, setActiveView] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [chats, setChats] = useState([]);
  
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [browsingChat, setBrowsingChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const chatEndRef = useRef(null);

  // --- Logic (كما هو بدون تغيير) ---
  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
        setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubTickets = onSnapshot(query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc")), (snap) => {
        setTickets(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubChats = onSnapshot(collection(db, "chats"), (snap) => {
        setChats(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsubUsers(); unsubTickets(); unsubChats(); };
  }, []);

  useEffect(() => {
    if (!browsingChat) return;
    const q = query(collection(db, "chats", browsingChat.id, "messages"), orderBy("createdAt", "asc"), limit(50));
    const unsubMsgs = onSnapshot(q, (snap) => {
        setChatMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubMsgs();
  }, [browsingChat]);

  const getTeacherName = (teacherId) => {
      const teacher = users.find(u => u.id === teacherId);
      return teacher ? teacher.displayName : "Unknown ID";
  };

  const handleRoleChange = async (uid, newRole) => {
      try { await updateDoc(doc(db, "users", uid), { role: newRole }); } catch (e) { alert(e.message); }
  };

  const toggleBan = async (uid, currentStatus) => {
      if(confirm(currentStatus ? t('admin_unban') : t('admin_ban_user'))) 
          await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus }); 
  };

  const unlinkStudent = async (studentId) => {
      if (!confirm("Force unlink student?")) return;
      try {
          await updateDoc(doc(db, "users", studentId), { teacherId: deleteField(), role: 'user' });
          alert("Link severed.");
      } catch (e) { console.error(e); }
  };

  const sendBroadcast = async () => {
    if(!broadcastMsg.trim()) return;
    await updateDoc(doc(db, "system", "broadcast"), { 
        message: broadcastMsg, active: true, sentBy: currentUser.email, timestamp: new Date().toISOString() 
    });
    setBroadcastMsg(""); 
    alert("Global Broadcast Sent.");
  };

  const initiateChatWithUser = (targetUser) => {
      const existingTicket = tickets.find(t => t.id === targetUser.id);
      if (existingTicket) { setSelectedTicket(existingTicket); } else {
          setSelectedTicket({ 
              id: targetUser.id, userEmail: targetUser.email, userId: targetUser.id, 
              messages: [], status: 'initiated_by_admin', isVirtual: true 
          });
      }
      setActiveView('support'); setIsMobileMenuOpen(false);
  };

  const sendSupportReply = async () => {
      if(!selectedTicket || !replyText.trim()) return;
      try {
          const ticketRef = doc(db, "support_tickets", selectedTicket.id);
          const newMsg = { text: replyText, sender: 'admin', time: Date.now() };
          
          if (selectedTicket.isVirtual) {
              await setDoc(ticketRef, { userId: selectedTicket.id, userEmail: selectedTicket.userEmail, messages: [newMsg], lastUpdate: Date.now(), status: 'replied' });
              setSelectedTicket(prev => ({ ...prev, isVirtual: false, messages: [newMsg] }));
          } else {
              await updateDoc(ticketRef, { messages: arrayUnion(newMsg), lastUpdate: Date.now(), status: 'replied' });
          }
          await addDoc(collection(db, "notifications"), {
              userId: selectedTicket.userId, target: 'user', type: "support_reply",
              title: "📩 ADMIN MESSAGE", message: `Admin: "${replyText.substring(0, 30)}..."`,
              senderId: currentUser.uid, createdAt: serverTimestamp(), read: false
          });
          setReplyText("");
      } catch (e) { console.error(e); }
  };

  const deleteMessage = async (msgId) => { if (confirm("Delete message?")) await deleteDoc(doc(db, "chats", browsingChat.id, "messages", msgId)); };
  
  const startEditing = (msg) => { setEditingMsgId(msg.id); setEditContent(msg.text); };
  
  const saveEditedMessage = async () => {
      if (!editContent.trim()) return;
      try {
          await updateDoc(doc(db, "chats", browsingChat.id, "messages", editingMsgId), {
              text: editContent, isEdited: true, editedBy: 'admin', editedAt: serverTimestamp()
          });
          setEditingMsgId(null); setEditContent("");
      } catch (e) { alert("Failed to update."); }
  };

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- Main Render ---
  return (
    <div className="fixed inset-0 z-[200] flex bg-[#030303] text-white font-sans overflow-hidden selection:bg-indigo-500/30" dir={dir}>
        
        {/* Sidebar */}
        <aside className={`fixed md:relative top-0 left-0 h-full w-80 bg-[#050505] border-r border-white/5 z-50 transition-transform duration-300 md:translate-x-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}`}>
            {/* Logo Area */}
            <div className="p-8 h-28 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <IconShield size={24} className="text-indigo-400" />
                </div>
                <div>
                    <h1 className="font-black text-xl tracking-tight text-white">NEXUS<span className="text-indigo-500">OS</span></h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                        <span className="text-[9px] text-white/40 font-mono uppercase tracking-[0.2em]">Online</span>
                    </div>
                </div>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 py-4 px-4 overflow-y-auto custom-scrollbar space-y-1">
                <NavBtn id="overview" label={t('admin_overview')} icon={IconLayoutDashboard} activeView={activeView} onClick={() => {setActiveView('overview'); setIsMobileMenuOpen(false);}} />
                <NavBtn id="users" label={t('admin_operatives')} icon={IconUsers} activeView={activeView} onClick={() => {setActiveView('users'); setIsMobileMenuOpen(false);}} />
                <NavBtn id="chat_control" label={t('admin_chat_control')} icon={IconMessages} activeView={activeView} onClick={() => {setActiveView('chat_control'); setIsMobileMenuOpen(false);}} />
                <NavBtn id="support" label={t('admin_uplink')} icon={IconMessage2} count={tickets.filter(t=>t.status!=='resolved').length} activeView={activeView} onClick={() => {setActiveView('support'); setIsMobileMenuOpen(false);}} />
                <NavBtn id="broadcast" label={t('admin_alert')} icon={IconBroadcast} activeView={activeView} onClick={() => {setActiveView('broadcast'); setIsMobileMenuOpen(false);}} />
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                <button onClick={() => setCurrentView('home')} className="w-full py-4 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 text-red-400 transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 group">
                    <IconHome size={16} className="group-hover:-translate-y-0.5 transition-transform"/> {t('admin_exit')}
                </button>
            </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col h-full bg-[#030303] relative overflow-hidden">
            {/* Top Bar */}
            <header className="h-24 border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-3 bg-white/5 rounded-xl text-white"><IconMenu2 size={24}/></button>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">{activeView.replace('_', ' ')}</h2>
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mt-1">Command Console</span>
                    </div>
                </div>
                
                {activeView === 'users' && (
                    <div className="relative group w-72 hidden md:block">
                        <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-500 transition-colors"/>
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search database..." 
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-indigo-500 focus:bg-indigo-950/10 transition-all placeholder:text-white/10"
                        />
                    </div>
                )}
            </header>

            <div className="flex-1 overflow-hidden relative">
                
                {/* 1. Overview */}
                {activeView === 'overview' && (
                    <div className="h-full overflow-y-auto p-8 custom-scrollbar animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title={t('admin_total_ops')} value={users.length} icon={<IconUsers/>} color={{bg:'bg-cyan-500/10', text:'text-cyan-400'}} gradient="bg-cyan-500" />
                            <StatCard title={t('admin_threats')} value={users.filter(u => u.isBanned).length} icon={<IconBan/>} color={{bg:'bg-red-500/10', text:'text-red-500'}} gradient="bg-red-500" />
                            <StatCard title="Active Squads" value={chats.length} icon={<IconDeviceGamepad/>} color={{bg:'bg-purple-500/10', text:'text-purple-500'}} gradient="bg-purple-500" />
                            <StatCard title={t('admin_tickets')} value={tickets.filter(t => t.status !== 'resolved').length} icon={<IconMessage2/>} color={{bg:'bg-orange-500/10', text:'text-orange-500'}} gradient="bg-orange-500" />
                        </div>
                    </div>
                )}

                {/* 2. Users Management (Modern List) */}
                {activeView === 'users' && (
                    <div className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid gap-3">
                            {filteredUsers.map(u => (
                                <div key={u.id} className="group flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-indigo-500/30 transition-all hover:bg-[#0e0e0e]">
                                    
                                    {/* Avatar & Info */}
                                    <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden border border-white/10">
                                                <img src={u.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover" />
                                            </div>
                                            {u.isBanned && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></div>}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{u.displayName || "Unknown"}</div>
                                            <div className="text-[10px] text-white/30 font-mono">{u.email}</div>
                                        </div>
                                    </div>

                                    {/* Role & Status */}
                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                                        <select 
                                            value={u.role || 'user'} 
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            className={`bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-indigo-500 cursor-pointer
                                            ${u.role === 'teacher' ? 'text-emerald-400' : u.role === 'student' ? 'text-cyan-400' : 'text-zinc-400'}`}
                                        >
                                            <option value="user">User</option>
                                            <option value="student">Student</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="admin">Admin</option>
                                        </select>

                                        {u.role === 'student' && u.teacherId && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5" title="Unlink Teacher">
                                                <IconSchool size={12} className="text-purple-400"/>
                                                <span className="text-[10px] text-white/50">{getTeacherName(u.teacherId).substring(0,10)}..</span>
                                                <button onClick={() => unlinkStudent(u.id)} className="text-red-500/50 hover:text-red-500"><IconUnlink size={12}/></button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                        <button onClick={() => initiateChatWithUser(u)} className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-xl transition-all border border-indigo-500/20"><IconMessagePlus size={18}/></button>
                                        <button onClick={() => toggleBan(u.id, u.isBanned)} className={`p-2.5 rounded-xl transition-all border ${u.isBanned ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'}`}>
                                            {u.isBanned ? <IconCheck size={18}/> : <IconBan size={18}/>}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Broadcast */}
                {activeView === 'broadcast' && (
                    <div className="h-full flex items-center justify-center animate-in zoom-in duration-500 p-8">
                        <div className="max-w-2xl w-full bg-[#0a0a0a] border border-white/10 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full group-hover:opacity-100 opacity-50 transition-opacity"></div>

                            <div className="flex items-center gap-6 mb-10 relative z-10">
                                <div className="p-5 bg-red-500/10 rounded-3xl border border-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                    <IconBroadcast size={48}/>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{t('admin_broadcast_title')}</h3>
                                    <p className="text-white/40 text-xs font-mono tracking-widest mt-2 uppercase">Emergency Protocol // Global Override</p>
                                </div>
                            </div>
                            
                            <textarea 
                                value={broadcastMsg} 
                                onChange={e=>setBroadcastMsg(e.target.value)} 
                                className="w-full h-40 bg-black border border-white/10 rounded-3xl p-6 text-white text-lg font-bold focus:border-red-500 outline-none transition-all resize-none mb-8 placeholder:text-white/10 relative z-10" 
                                placeholder="ENTER SYSTEM ALERT MESSAGE..." 
                                dir="auto"
                            />
                            
                            <button 
                                onClick={sendBroadcast} 
                                disabled={!broadcastMsg.trim()}
                                className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-900/30 uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative z-10 text-sm flex items-center justify-center gap-3"
                            >
                                <IconTerminal2 size={20} /> Execute Broadcast
                            </button>
                        </div>
                    </div>
                )}

                {/* 4. Chat Control */}
                {activeView === 'chat_control' && (
                    <div className="h-full flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-500">
                        {/* Chat List */}
                        <div className={`w-full md:w-80 border-r border-white/10 bg-[#050505] flex flex-col shrink-0 ${browsingChat ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-6 border-b border-white/5 font-black text-[10px] text-white/40 uppercase tracking-widest shrink-0">Frequency Bands</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {chats.map(chat => (
                                    <div key={chat.id} onClick={() => setBrowsingChat(chat)} className={`p-4 rounded-2xl cursor-pointer transition-all border group flex flex-col gap-1 ${browsingChat?.id === chat.id ? 'bg-indigo-600/10 border-indigo-600/50 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'}`}>
                                        <div className="flex justify-between items-start">
                                            <h3 className={`font-black text-sm uppercase tracking-tight truncate w-3/4 ${browsingChat?.id === chat.id ? 'text-indigo-400' : 'text-white'}`}>{chat.name}</h3>
                                            {chat.type === 'private' ? <IconLock size={14} className="text-orange-500"/> : <IconWorld size={14} className="text-cyan-500"/>}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{chat.members?.length || 0} UNITS</span>
                                            {chat.createdBy && <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-white/20 font-mono">ID:{chat.createdBy.substring(0,4)}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Details */}
                        <div className="flex-1 flex flex-col bg-[#030303] relative overflow-hidden">
                            {browsingChat ? (
                                <>
                                    <div className="p-6 bg-[#0a0a0a]/80 backdrop-blur border-b border-white/10 flex justify-between items-center shadow-xl shrink-0 z-10">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setBrowsingChat(null)} className="md:hidden p-2 bg-white/5 rounded text-white"><IconMessages/></button>
                                            <div>
                                                <h3 className="font-black text-indigo-400 uppercase tracking-tighter text-xl leading-none">{browsingChat.name}</h3>
                                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{browsingChat.type} CHANNEL</span>
                                            </div>
                                        </div>
                                        <button onClick={() => { if(confirm("Terminate channel?")) deleteDoc(doc(db, "chats", browsingChat.id)) }} className="px-5 py-2.5 bg-red-950/30 text-red-500 rounded-xl border border-red-500/20 font-black text-[9px] uppercase tracking-widest transition-all hover:bg-red-600 hover:text-white flex items-center gap-2"><IconTrash size={14}/> Terminate</button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-[0.03]">
                                        {chatMessages.map(msg => (
                                            <div key={msg.id} className="group flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${msg.sender === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>{msg.senderName || "Unknown"}</span>
                                                    {msg.isEdited && <span className="text-[8px] text-white/20 font-mono flex items-center gap-1"><IconPencil size={8}/> EDITED</span>}
                                                </div>
                                                
                                                <div className="relative group/msg">
                                                    {editingMsgId === msg.id ? (
                                                        <div className="flex flex-col gap-3 p-4 bg-[#0e0e0e] border border-indigo-500 rounded-2xl shadow-2xl">
                                                            <textarea 
                                                                value={editContent} 
                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                className="w-full bg-black/50 border border-white/5 text-white text-sm p-3 rounded-xl outline-none resize-none font-medium"
                                                                rows={3}
                                                            />
                                                            <div className="flex gap-2 justify-end">
                                                                <button onClick={saveEditedMessage} className="p-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500 transition-colors"><IconCheck size={16}/></button>
                                                                <button onClick={() => setEditingMsgId(null)} className="p-2 bg-zinc-800 rounded-lg text-white hover:bg-zinc-700 transition-colors"><IconX size={16}/></button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className={`p-5 rounded-3xl text-sm shadow-lg backdrop-blur-sm leading-relaxed border transition-all ${msg.sender === 'admin' ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-100' : 'bg-zinc-900/60 border-white/5 text-zinc-300'}`}>
                                                            {msg.text}
                                                        </div>
                                                    )}

                                                    {/* Actions Overlay */}
                                                    {editingMsgId !== msg.id && (
                                                        <div className="absolute -right-24 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover/msg:opacity-100 transition-all translate-x-4 group-hover/msg:translate-x-0">
                                                            <button onClick={() => startEditing(msg)} className="p-2.5 bg-[#0e0e0e] text-indigo-400 border border-indigo-500/30 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg"><IconPencil size={16}/></button>
                                                            <button onClick={() => deleteMessage(msg.id)} className="p-2.5 bg-[#0e0e0e] text-red-500 border border-red-500/30 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg"><IconTrash size={16}/></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} className="h-10" />
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-800 opacity-20 animate-in zoom-in-95 duration-700">
                                    <IconCpu size={80} className="mb-6"/>
                                    <p className="text-sm font-black font-mono uppercase tracking-[0.4em]">Awaiting Frequency Selection</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 5. Support Tickets */}
                {activeView === 'support' && (
                    <div className="h-full flex flex-col md:flex-row p-0 gap-0 md:gap-8 overflow-hidden animate-in fade-in duration-500 pt-4 md:pt-0 px-4 md:px-8 pb-4">
                        {/* Ticket List */}
                        <div className="w-full md:w-80 bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl shrink-0">
                            <div className="p-5 border-b border-white/5 font-black text-[10px] text-white/40 uppercase tracking-widest shrink-0">Incoming Signals</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {tickets.map(t => (
                                    <div key={t.id} onClick={() => setSelectedTicket(t)} className={`p-5 rounded-2xl cursor-pointer transition-all border group ${selectedTicket?.id === t.id ? 'bg-orange-500/10 border-orange-500/50 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-black text-white text-xs uppercase tracking-tighter truncate w-3/4">{t.userEmail.split('@')[0]}</span>
                                            <span className={`w-2 h-2 rounded-full ${t.status === 'resolved' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-mono truncate lowercase">{t.messages?.[t.messages.length-1]?.text || "Signal Established"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ticket Chat */}
                        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative">
                            {selectedTicket ? (
                                <>
                                    <div className="p-6 bg-zinc-900/50 border-b border-white/5 flex justify-between items-center shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500"><IconMessage2 size={20}/></div>
                                            <div>
                                                <div className="font-black text-white text-sm uppercase tracking-widest">UPLINK ESTABLISHED</div>
                                                <div className="text-[10px] text-white/30 font-mono">{selectedTicket.userEmail}</div>
                                            </div>
                                        </div>
                                        {!selectedTicket.isVirtual && <button onClick={() => updateDoc(doc(db, "support_tickets", selectedTicket.id), { status: 'resolved' })} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"><IconCheck size={14}/> Resolve</button>}
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-opacity-5">
                                        {selectedTicket.messages?.map((m, i) => (
                                            <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                                <div className={`max-w-[70%] p-5 rounded-3xl text-sm leading-relaxed shadow-xl ${m.sender === 'admin' ? 'bg-indigo-600 text-white shadow-indigo-900/20 rounded-tr-none' : 'bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none'}`}>
                                                    {m.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-5 bg-black/40 border-t border-white/5 flex gap-4 shrink-0">
                                        <input value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendSupportReply()} className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-600 transition-all font-bold text-sm shadow-inner text-white placeholder:text-white/20" placeholder="Type transmission..." />
                                        <button onClick={sendSupportReply} className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl transition-all shadow-indigo-900/20"><IconSend size={24}/></button>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-800 font-mono uppercase text-xs tracking-[0.4em] animate-pulse">
                                    <IconActivity size={64} className="mb-4 opacity-20"/>
                                    Select Active Signal
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
            </div>
        </main>
    </div>
  );
}