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
  IconSchool, IconUnlink, IconActivity, IconLock, IconWorld, IconPencil, IconCheck, IconX
} from '@tabler/icons-react';
import { useUI } from '@/context/UIContext';
import { useLanguage } from '@/hooks/useLanguage';

// بطاقة إحصائيات
const StatCard = ({ title, value, icon, color }) => (
  <div className="relative p-6 rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden group hover:border-white/20 transition-all">
      <div className={`absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 ${color}`}>
          {React.cloneElement(icon, { size: 64 })}
      </div>
      <div className={`p-3 rounded-2xl w-fit mb-4 ${color} bg-white/5 backdrop-blur-sm`}>
          {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="text-4xl font-black text-white mb-1 font-mono tracking-tighter">{value}</div>
      <div className="text-[10px] font-bold uppercase text-white/40 tracking-[0.2em]">{title}</div>
  </div>
);

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
  
  // حالات الدردشة والتعديل
  const [browsingChat, setBrowsingChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  
  // حالة الرسالة التي يتم تعديلها حالياً
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const chatEndRef = useRef(null);

  // --- جلب البيانات ---
  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
        setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    
    const unsubTickets = onSnapshot(query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc")), (snap) => {
        setTickets(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    
    // جلب كل المحادثات (بما فيها الخاصة) لأن قواعد الأمان تسمح للأدمن بذلك
    const unsubChats = onSnapshot(collection(db, "chats"), (snap) => {
        setChats(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => { unsubUsers(); unsubTickets(); unsubChats(); };
  }, []);

  // --- مراقبة رسائل الدردشة ---
  useEffect(() => {
    if (!browsingChat) return;
    const q = query(collection(db, "chats", browsingChat.id, "messages"), orderBy("createdAt", "asc"), limit(50));
    const unsubMsgs = onSnapshot(q, (snap) => {
        setChatMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubMsgs();
  }, [browsingChat]);

  // --- Helper: العثور على اسم الأستاذ ---
  const getTeacherName = (teacherId) => {
      const teacher = users.find(u => u.id === teacherId);
      return teacher ? teacher.displayName : "Unknown ID";
  };

  // --- الإجراءات ---
  const handleRoleChange = async (uid, newRole) => {
      try { 
          await updateDoc(doc(db, "users", uid), { role: newRole }); 
      } catch (e) { alert(e.message); }
  };

  const toggleBan = async (uid, currentStatus) => {
      if(confirm(currentStatus ? t('admin_unban') : t('admin_ban_user'))) 
          await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus }); 
  };

  const unlinkStudent = async (studentId) => {
      if (!confirm("Force unlink this student from their teacher?")) return;
      try {
          await updateDoc(doc(db, "users", studentId), {
              teacherId: deleteField(),
              role: 'user' 
          });
          alert("Link severed.");
      } catch (e) { console.error(e); }
  };

  const sendBroadcast = async () => {
    if(!broadcastMsg.trim()) return;
    await updateDoc(doc(db, "system", "broadcast"), { 
        message: broadcastMsg, 
        active: true, 
        sentBy: currentUser.email, 
        timestamp: new Date().toISOString() 
    });
    setBroadcastMsg(""); 
    alert("Global Broadcast Sent.");
  };

  const initiateChatWithUser = (targetUser) => {
      const existingTicket = tickets.find(t => t.id === targetUser.id);
      if (existingTicket) { 
          setSelectedTicket(existingTicket); 
      } else {
          setSelectedTicket({ 
              id: targetUser.id, 
              userEmail: targetUser.email, 
              userId: targetUser.id, 
              messages: [], 
              status: 'initiated_by_admin', 
              isVirtual: true
          });
      }
      setActiveView('support'); 
      setIsMobileMenuOpen(false);
  };

  const sendSupportReply = async () => {
      if(!selectedTicket || !replyText.trim()) return;
      try {
          const ticketRef = doc(db, "support_tickets", selectedTicket.id);
          const newMsg = { text: replyText, sender: 'admin', time: Date.now() };
          
          if (selectedTicket.isVirtual) {
              await setDoc(ticketRef, { 
                  userId: selectedTicket.id, 
                  userEmail: selectedTicket.userEmail, 
                  messages: [newMsg], 
                  lastUpdate: Date.now(), 
                  status: 'replied' 
              });
              setSelectedTicket(prev => ({ ...prev, isVirtual: false, messages: [newMsg] }));
          } else {
              await updateDoc(ticketRef, { 
                  messages: arrayUnion(newMsg), 
                  lastUpdate: Date.now(), 
                  status: 'replied' 
              });
          }

          await addDoc(collection(db, "notifications"), {
              userId: selectedTicket.userId, 
              target: 'user',
              type: "support_reply",
              title: "📩 INCOMING TRANSMISSION",
              message: `Admin Command: "${replyText.substring(0, 30)}${replyText.length>30?'...':''}"`,
              senderId: currentUser.uid,
              createdAt: serverTimestamp(),
              read: false
          });

          setReplyText("");
      } catch (e) { console.error(e); }
  };

  const deleteMessage = async (msgId) => { 
      if (confirm("Delete this message permanently?")) 
          await deleteDoc(doc(db, "chats", browsingChat.id, "messages", msgId)); 
  };

  // --- منطق تعديل الرسالة ---
  const startEditing = (msg) => {
      setEditingMsgId(msg.id);
      setEditContent(msg.text);
  };

  const saveEditedMessage = async () => {
      if (!editContent.trim()) return;
      try {
          await updateDoc(doc(db, "chats", browsingChat.id, "messages", editingMsgId), {
              text: editContent,
              isEdited: true,
              editedBy: 'admin',
              editedAt: serverTimestamp()
          });
          setEditingMsgId(null);
          setEditContent("");
      } catch (e) {
          console.error("Update failed:", e);
          alert("Failed to update message.");
      }
  };

  const filteredUsers = users.filter(u => 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const NavBtn = ({ id, label, icon: Icon, count }) => (
    <button 
        onClick={() => { setActiveView(id); setBrowsingChat(null); setIsMobileMenuOpen(false); }} 
        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all mb-2
        ${activeView === id 
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/20' 
            : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
    >
        <div className="flex items-center gap-3">
            <Icon size={20} />
            <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
        </div>
        {count > 0 && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black shadow-lg shadow-red-900/40">{count}</span>}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[200] flex bg-[#050505] text-white font-sans overflow-hidden" dir={dir}>
        
        {/* Sidebar */}
        <nav className={`fixed md:relative top-0 left-0 h-full w-72 bg-[#0a0a0a] border-r border-white/10 z-50 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}`}>
            <div className="p-8 h-24 flex items-center gap-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30">
                    <IconShield size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="font-black text-lg uppercase tracking-tight">NEXUS<span className="text-indigo-500">ADMIN</span></h1>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[8px] text-white/40 font-mono uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 py-8 px-4 overflow-y-auto no-scrollbar">
                <NavBtn id="overview" label={t('admin_overview')} icon={IconLayoutDashboard} />
                <NavBtn id="users" label={t('admin_operatives')} icon={IconUsers} />
                <NavBtn id="chat_control" label={t('admin_chat_control')} icon={IconMessages} />
                <NavBtn id="support" label={t('admin_uplink')} icon={IconMessage2} count={tickets.filter(t=>t.status!=='resolved').length} />
                <NavBtn id="broadcast" label={t('admin_alert')} icon={IconBroadcast} />
            </div>
            
            <div className="p-4 border-t border-white/5">
                <button onClick={() => setCurrentView('home')} className="w-full py-4 rounded-2xl bg-white/5 hover:bg-red-900/20 hover:text-red-500 text-gray-400 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <IconHome size={16}/> {t('admin_exit')}
                </button>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full bg-[#050505] relative overflow-hidden">
            <header className="h-24 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 bg-white/5 rounded-lg text-white"><IconMenu2 size={24}/></button>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{activeView.replace('_', ' ')}</h2>
                </div>
                
                {activeView === 'users' && (
                    <div className="relative group w-64 hidden md:block">
                        <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-500 transition-colors"/>
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search operatives..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-white/20"
                        />
                    </div>
                )}
            </header>

            <div className="flex-1 overflow-hidden relative">
                
                {/* 1. Overview */}
                {activeView === 'overview' && (
                    <div className="h-full overflow-y-auto p-8 custom-scrollbar animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title={t('admin_total_ops')} value={users.length} icon={<IconUsers/>} color="text-cyan-400" />
                            <StatCard title={t('admin_threats')} value={users.filter(u => u.isBanned).length} icon={<IconBan/>} color="text-red-500" />
                            <StatCard title="Active Squads" value={chats.length} icon={<IconDeviceGamepad/>} color="text-purple-500" />
                            <StatCard title={t('admin_tickets')} value={tickets.filter(t => t.status !== 'resolved').length} icon={<IconMessage2/>} color="text-orange-500" />
                        </div>
                    </div>
                )}

                {/* 2. Users Management */}
                {activeView === 'users' && (
                    <div className="h-full overflow-y-auto p-8 custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                                    <tr>
                                        <th className="p-6">Operative</th>
                                        <th className="p-6">Role</th>
                                        <th className="p-6">Mentor / Status</th>
                                        <th className="p-6 text-right">Command</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm font-medium">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden border border-white/5">
                                                        <img src={u.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{u.displayName || "Unknown"}</div>
                                                        <div className="text-[10px] text-white/40 font-mono">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <select 
                                                    value={u.role || 'user'} 
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    className={`bg-black border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-indigo-500 transition-colors cursor-pointer
                                                    ${u.role === 'teacher' ? 'text-emerald-400' : u.role === 'student' ? 'text-cyan-400' : 'text-zinc-400'}`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="student">Student</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    {u.isBanned 
                                                        ? <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[9px] font-black border border-red-500/20 uppercase tracking-wider"><IconBan size={10}/> Banned</span>
                                                        : <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black border border-emerald-500/20 uppercase tracking-wider"><IconActivity size={10}/> Active</span>
                                                    }
                                                    
                                                    {u.role === 'student' && u.teacherId && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <IconSchool size={12} className="text-purple-400"/>
                                                            <span className="text-[10px] text-white/50">
                                                                Mentor: <span className="text-purple-300 font-bold">{getTeacherName(u.teacherId)}</span>
                                                            </span>
                                                            <button 
                                                                onClick={() => unlinkStudent(u.id)}
                                                                className="text-red-500/50 hover:text-red-500 transition-colors" 
                                                                title="Unlink"
                                                            >
                                                                <IconUnlink size={12}/>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => initiateChatWithUser(u)} className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-lg transition-all"><IconMessagePlus size={16}/></button>
                                                    <button onClick={() => toggleBan(u.id, u.isBanned)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"><IconBan size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. Broadcast */}
                {activeView === 'broadcast' && (
                    <div className="h-full flex items-center justify-center animate-in zoom-in duration-500 p-8">
                        <div className="max-w-2xl w-full bg-[#0a0a0a] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-600"></div>
                            <div className="flex items-center gap-6 mb-8">
                                <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-500 shadow-lg shadow-red-900/20">
                                    <IconBroadcast size={40}/>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{t('admin_broadcast_title')}</h3>
                                    <p className="text-white/40 text-xs font-mono tracking-wide mt-1">Force message to all active terminals.</p>
                                </div>
                            </div>
                            <textarea 
                                value={broadcastMsg} 
                                onChange={e=>setBroadcastMsg(e.target.value)} 
                                className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-white text-lg font-bold focus:border-red-500 outline-none transition-all resize-none mb-8 placeholder:text-white/10" 
                                placeholder="TYPE ALERT MESSAGE..." 
                                dir="auto"
                            />
                            <button 
                                onClick={sendBroadcast} 
                                disabled={!broadcastMsg.trim()}
                                className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-xl shadow-red-900/30 uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Execute Protocol
                            </button>
                        </div>
                    </div>
                )}

                {/* 4. Chat Control (Enhanced) */}
                {activeView === 'chat_control' && (
                    <div className="h-full flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-500">
                        <div className={`w-full md:w-80 border-r border-white/10 bg-black/30 flex flex-col shrink-0 ${browsingChat ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-6 border-b border-white/5 font-black text-[10px] text-white/40 uppercase tracking-widest shrink-0">Available Frequencies</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {chats.map(chat => (
                                    <div key={chat.id} onClick={() => setBrowsingChat(chat)} className={`p-5 rounded-2xl cursor-pointer transition-all border group flex flex-col gap-2 ${browsingChat?.id === chat.id ? 'bg-indigo-600/10 border-indigo-600/50 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'}`}>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-black text-white text-base leading-tight truncate w-3/4 group-hover:text-indigo-400 transition-colors uppercase tracking-tighter">{chat.name}</h3>
                                            {/* أيقونة القفل للمحادثات الخاصة */}
                                            {chat.type === 'private' ? <IconLock size={14} className="text-orange-500"/> : <IconWorld size={14} className="text-cyan-500"/>}
                                        </div>
                                        <div className="flex items-center gap-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                                            <span>{chat.members?.length || 0} Agents</span>
                                            {/* عرض اسم المنشئ */}
                                            {chat.createdBy && <span className="text-white/30">ID: {chat.createdBy.substring(0,6)}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col bg-[#070707] relative overflow-hidden">
                            {browsingChat ? (
                                <>
                                    <div className="p-6 bg-white/[0.02] border-b border-white/10 flex justify-between items-center shadow-xl shrink-0 z-10">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setBrowsingChat(null)} className="md:hidden p-2 bg-white/5 rounded text-white"><IconMessages/></button>
                                            <h3 className="font-black text-indigo-400 uppercase tracking-tighter text-2xl leading-none">{browsingChat.name}</h3>
                                        </div>
                                        <button onClick={() => { if(confirm("Terminate channel?")) deleteDoc(doc(db, "chats", browsingChat.id)) }} className="px-4 py-2 bg-red-950/40 text-red-500 rounded-xl border border-red-500/30 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-red-600 hover:text-white"><IconTrash size={16} className="inline mr-1"/> Terminate</button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-opacity-5 relative">
                                        {chatMessages.map(msg => (
                                            <div key={msg.id} className="group flex flex-col gap-2 max-w-[85%] animate-in fade-in">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/20">{msg.senderName}</span>
                                                    {msg.isEdited && <span className="text-[8px] text-white/30 font-mono">(EDITED BY ADMIN)</span>}
                                                </div>
                                                
                                                <div className="relative group/msg">
                                                    {editingMsgId === msg.id ? (
                                                        // وضع التعديل
                                                        <div className="flex flex-col gap-2 p-4 bg-zinc-900 border border-indigo-500/50 rounded-2xl">
                                                            <textarea 
                                                                value={editContent} 
                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                className="w-full bg-black/50 border-0 text-white text-sm p-2 rounded outline-none resize-none"
                                                                rows={3}
                                                            />
                                                            <div className="flex gap-2 justify-end">
                                                                <button onClick={saveEditedMessage} className="p-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500"><IconCheck size={16}/></button>
                                                                <button onClick={() => setEditingMsgId(null)} className="p-2 bg-zinc-700 rounded-lg text-white hover:bg-zinc-600"><IconX size={16}/></button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // وضع العرض
                                                        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/5 text-sm text-zinc-300 shadow-xl backdrop-blur-sm group-hover/msg:border-white/10 transition-all leading-relaxed">
                                                            {msg.text}
                                                        </div>
                                                    )}

                                                    {/* أزرار الإجراءات (تظهر عند التحويم) */}
                                                    {editingMsgId !== msg.id && (
                                                        <div className="absolute -right-24 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/msg:opacity-100 transition-all">
                                                            <button 
                                                                onClick={() => startEditing(msg)} 
                                                                className="p-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                                                                title="Edit Message"
                                                            >
                                                                <IconPencil size={16}/>
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteMessage(msg.id)} 
                                                                className="p-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg"
                                                                title="Delete Message"
                                                            >
                                                                <IconTrash size={16}/>
                                                            </button>
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
                                    <IconMessages size={64}/><p className="text-sm font-black font-mono uppercase mt-4 tracking-[0.4em]">Select frequency</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 5. Support Tickets */}
                {activeView === 'support' && (
                    <div className="h-full flex flex-col md:flex-row p-0 gap-8 overflow-hidden animate-in fade-in duration-500">
                        <div className="w-full md:w-80 bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shrink-0">
                            <div className="p-5 border-b border-white/5 font-black text-[10px] text-white/40 uppercase tracking-widest shrink-0">Signal Queue</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {tickets.map(t => (
                                    <div key={t.id} onClick={() => setSelectedTicket(t)} className={`p-5 rounded-2xl cursor-pointer transition-all border group ${selectedTicket?.id === t.id ? 'bg-indigo-600/10 border-indigo-600/50 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                                        <div className="flex justify-between items-center mb-1"><span className="font-black text-white text-xs uppercase tracking-tighter truncate w-3/4">{t.userEmail}</span><span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase border ${t.status === 'resolved' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-orange-500 border-orange-500/20 bg-orange-500/5'}`}>{t.status || 'NEW'}</span></div>
                                        <p className="text-[10px] text-gray-600 font-mono truncate lowercase">{t.messages?.[t.messages.length-1]?.text || "Link Ready"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                            {selectedTicket ? (
                                <>
                                    <div className="p-6 bg-zinc-900/50 border-b border-white/5 flex justify-between items-center shrink-0">
                                        <div><div className="font-black text-indigo-400 text-base uppercase tracking-widest tracking-tighter">COMMS: {selectedTicket.userEmail}</div></div>
                                        {!selectedTicket.isVirtual && <button onClick={() => updateDoc(doc(db, "support_tickets", selectedTicket.id), { status: 'resolved' })} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-emerald-900/20">Resolve Signal</button>}
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-opacity-5">
                                        {selectedTicket.messages?.map((m, i) => (
                                            <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}><div className={`max-w-[70%] p-5 rounded-3xl text-sm leading-relaxed shadow-xl ${m.sender === 'admin' ? 'bg-indigo-600 text-white shadow-indigo-900/20' : 'bg-zinc-900 border border-white/5 text-zinc-300'}`}>{m.text}</div></div>
                                        ))}
                                    </div>
                                    <div className="p-5 bg-black/40 border-t border-white/5 flex gap-4 shrink-0"><input value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendSupportReply()} className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-600 transition-all font-bold text-sm shadow-inner" placeholder="Enter transmission response..."/><button onClick={sendSupportReply} className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl transition-all shadow-indigo-900/20"><IconSend size={24}/></button></div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-800 font-mono uppercase text-xs tracking-[0.4em] animate-pulse">Establishing Comms Link...</div>
                            )}
                        </div>
                    </div>
                )}
                
            </div>
        </main>
    </div>
  );
}