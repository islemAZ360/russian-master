"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, onSnapshot, doc, updateDoc, query, orderBy, 
  deleteDoc, addDoc, serverTimestamp, arrayUnion, arrayRemove, limit, setDoc, getDoc
} from "firebase/firestore";
import { 
  IconShieldLock, IconUsers, IconLayoutDashboard, 
  IconBroadcast, IconMessage2, IconBan, IconTrash, 
  IconMenu2, IconSend, IconDeviceGamepad, IconHome, 
  IconUser, IconArrowLeft, IconEye, IconUserMinus, IconMessages, IconMessagePlus
} from '@tabler/icons-react';
import { useUI } from '@/context/UIContext';
import { useLanguage } from '@/hooks/useLanguage';

const StatCard = ({ title, value, icon, color }) => (
  <div className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-indigo-500/50 transition-all shadow-xl group">
      <div className={`p-3 rounded-xl bg-white/5 w-fit mb-4 transition-transform group-hover:scale-110 ${color}`}>{icon}</div>
      <div className="text-3xl font-black text-white mb-1 font-mono">{value}</div>
      <div className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{title}</div>
  </div>
);

export default function AdminDashboard({ currentUser }) {
  const { setCurrentView } = useUI();
  const { t, dir } = useLanguage();
  
  // --- حالات التنقل والقائمة ---
  const [activeView, setActiveView] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- حالات البيانات العامة ---
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [chats, setChats] = useState([]);
  
  // --- حالات الميزات الخاصة ---
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  
  // --- حالات رقابة المحادثات ---
  const [browsingChat, setBrowsingChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const chatEndRef = useRef(null);

  // --- جلب البيانات ---
  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snap) => {
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

  // --- مراقبة الرسائل ---
  useEffect(() => {
    if (!browsingChat) return;
    const q = query(collection(db, "chats", browsingChat.id, "messages"), orderBy("createdAt", "asc"), limit(100));
    const unsubMsgs = onSnapshot(q, (snap) => {
        setChatMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubMsgs();
  }, [browsingChat]);

  // --- الوظائف ---
  const initiateChatWithUser = (targetUser) => {
      const existingTicket = tickets.find(t => t.id === targetUser.id);
      if (existingTicket) { setSelectedTicket(existingTicket); } 
      else {
          setSelectedTicket({ id: targetUser.id, userEmail: targetUser.email, userId: targetUser.id, messages: [], status: 'initiated_by_admin', isVirtual: true });
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
              await addDoc(collection(db, "notifications"), { userId: selectedTicket.id, title: "URGENT: COMMAND CENTER UPLINK", message: "Admin message received.", type: "support_reply", createdAt: serverTimestamp() });
              setSelectedTicket(prev => ({ ...prev, isVirtual: false, messages: [newMsg] }));
          } else {
              await updateDoc(ticketRef, { messages: arrayUnion(newMsg), lastUpdate: Date.now(), status: 'replied' });
          }
          setReplyText("");
      } catch (e) { alert(e.message); }
  };

  const deleteMessage = async (msgId) => { if (confirm(t('admin_confirm_delete'))) await deleteDoc(doc(db, "chats", browsingChat.id, "messages", msgId)); };
  const kickUserFromChat = async (chatId, userId) => { if (confirm(t('admin_kick_user'))) await updateDoc(doc(db, "chats", chatId), { members: arrayRemove(userId) }); };
  const toggleBan = async (uid, currentStatus) => { if(confirm(currentStatus ? t('admin_unban') : t('admin_ban_user'))) await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus }); };
  
  // === تعديل هام هنا: دعم كل الرتب ===
  const handleRoleChange = async (uid, newRole) => {
      try {
          await updateDoc(doc(db, "users", uid), { role: newRole });
      } catch (e) { alert("Error: " + e.message); }
  };

  const sendBroadcast = async () => {
    if(!broadcastMsg.trim()) return;
    await updateDoc(doc(db, "system", "broadcast"), { message: broadcastMsg, active: true, sentBy: currentUser.email, timestamp: new Date().toISOString() });
    setBroadcastMsg(""); alert("Broadcast Disseminated.");
  };

  const NavBtn = ({ id, label, icon: Icon, count }) => (
    <button onClick={() => { setActiveView(id); setBrowsingChat(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeView === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
        <div className="flex items-center gap-3"><Icon size={20} /><span className="font-bold text-sm uppercase tracking-tight">{label}</span></div>
        {count > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{count}</span>}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[200] flex bg-[#050505] text-white font-sans overflow-hidden" dir={dir}>
        
        {/* Sidebar */}
        <nav className={`fixed md:relative top-0 left-0 h-full w-72 bg-black border-r border-white/10 z-50 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}`}>
            <div className="p-8 h-24 border-b border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg"><IconShieldLock size={28} className="text-white" /></div>
                <div><h1 className="font-black text-xl uppercase tracking-tighter leading-none">NEXUS<span className="text-indigo-500">OS</span></h1><span className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">Admin Kernel v4.2</span></div>
            </div>
            <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto no-scrollbar">
                <NavBtn id="overview" label={t('admin_overview')} icon={IconLayoutDashboard} />
                <NavBtn id="users" label={t('admin_operatives')} icon={IconUsers} />
                <NavBtn id="chat_control" label={t('admin_chat_control')} icon={IconMessages} />
                <NavBtn id="support" label={t('admin_uplink')} icon={IconMessage2} count={tickets.filter(t=>t.status!=='resolved').length} />
                <NavBtn id="broadcast" label={t('admin_alert')} icon={IconBroadcast} />
            </div>
            <div className="p-4 border-t border-white/10">
                <button onClick={() => setCurrentView('home')} className="w-full py-4 rounded-2xl bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest"><IconHome size={18} className="inline mr-2"/> {t('admin_exit')}</button>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full bg-[#050505] relative overflow-hidden">
            <header className="h-24 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 bg-white/5 rounded-lg text-white"><IconMenu2 size={24}/></button>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-indigo-400">{activeView}</h2>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
                
                {activeView === 'overview' && (
                    <div className="h-full overflow-y-auto p-10 custom-scrollbar animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title={t('admin_total_ops')} value={users.length} icon={<IconUsers/>} color="text-cyan-400" />
                            <StatCard title={t('admin_threats')} value={users.filter(u => u.isBanned).length} icon={<IconBan/>} color="text-red-500" />
                            <StatCard title="Active Squads" value={chats.length} icon={<IconDeviceGamepad/>} color="text-purple-500" />
                            <StatCard title={t('admin_tickets')} value={tickets.filter(t => t.status !== 'resolved').length} icon={<IconMessage2/>} color="text-orange-500" />
                        </div>
                    </div>
                )}

                {activeView === 'users' && (
                    <div className="h-full overflow-y-auto p-10 custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest">
                                        <th className="p-6">Identity</th>
                                        <th className="p-6">Role</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-white/5 transition-all">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 overflow-hidden"><img src={u.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover" /></div>
                                                    <div><div className="font-bold text-white">{u.displayName}</div><div className="text-[9px] text-gray-500">{u.email}</div></div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                {/* === FIX: القائمة المنسدلة الكاملة === */}
                                                <select 
                                                    value={u.role || 'user'} 
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    className={`bg-black border border-white/20 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-indigo-500 transition-colors 
                                                    ${u.role === 'master' ? 'text-red-500 border-red-500/30' : 
                                                      u.role === 'teacher' ? 'text-emerald-400 border-emerald-500/30' : 
                                                      u.role === 'student' ? 'text-blue-400 border-blue-500/30' : 'text-indigo-400'}`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="student">Student</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="junior">Junior Admin</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-6">
                                                {u.isBanned 
                                                    ? <span className="text-[9px] bg-red-950/40 text-red-500 px-3 py-1 rounded-full border border-red-500/30 font-black">Terminated</span>
                                                    : <span className="text-[9px] bg-emerald-950/40 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/30 font-black">Active</span>
                                                }
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => initiateChatWithUser(u)} className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><IconMessagePlus size={16}/></button>
                                                    <button onClick={() => toggleBan(u.id, u.isBanned)} className="p-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"><IconBan size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeView === 'chat_control' && (
                    <div className="h-full flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-500">
                        <div className={`w-full md:w-80 border-r border-white/10 bg-black/30 flex flex-col shrink-0 ${browsingChat ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-6 bg-zinc-900/30 border-b border-white/5 font-black text-[10px] text-indigo-400 uppercase tracking-widest shrink-0">Available Frequencies</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {chats.map(chat => (
                                    <div key={chat.id} onClick={() => setBrowsingChat(chat)} className={`p-5 rounded-2xl cursor-pointer transition-all border group flex flex-col gap-2 ${browsingChat?.id === chat.id ? 'bg-indigo-600/10 border-indigo-600/50 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'}`}>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-black text-white text-base leading-tight truncate w-3/4 group-hover:text-indigo-400 transition-colors uppercase tracking-tighter">{chat.name}</h3>
                                            <IconEye size={18} className={`${browsingChat?.id === chat.id ? 'text-indigo-400' : 'text-gray-700'} group-hover:scale-110 transition-transform`}/>
                                        </div>
                                        <div className="flex items-center gap-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                                            <span className={`px-2 py-0.5 rounded border ${chat.type === 'private' ? 'text-orange-500 border-orange-500/30' : 'text-emerald-500 border-emerald-500/30'}`}>{chat.type}</span>
                                            <span>{chat.members?.length || 0} Agents</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col bg-[#070707] relative overflow-hidden">
                            {browsingChat ? (
                                <>
                                    <div className="p-6 bg-zinc-900/40 border-b border-white/10 flex justify-between items-center shadow-xl shrink-0 z-10">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setBrowsingChat(null)} className="md:hidden p-2 bg-white/5 rounded-lg text-white/50"><IconArrowLeft/></button>
                                            <div>
                                                <h3 className="font-black text-indigo-400 uppercase tracking-tighter text-2xl leading-none">{browsingChat.name}</h3>
                                                <p className="text-[9px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">Supervision Active</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { if(confirm("Terminate channel?")) deleteDoc(doc(db, "chats", browsingChat.id)) }} className="px-4 py-2 bg-red-950/40 text-red-500 rounded-xl border border-red-500/30 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-red-600 hover:text-white"><IconTrash size={16} className="inline mr-1"/> Terminate</button>
                                    </div>
                                    <div className="bg-black/60 border-b border-white/5 p-5 flex gap-4 overflow-x-auto no-scrollbar shrink-0">
                                        {users.filter(u => browsingChat.members?.includes(u.id)).map(member => (
                                            <div key={member.id} className="group shrink-0 relative flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-2xl border-2 border-zinc-800 group-hover:border-indigo-500/50 overflow-hidden bg-zinc-900 transition-all shadow-lg"><img src={member.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover"/></div>
                                                <div className="absolute -top-1 -right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90"><button onClick={() => kickUserFromChat(browsingChat.id, member.id)} className="p-1.5 bg-red-600 text-white rounded-lg"><IconUserMinus size={12}/></button><button onClick={() => toggleBan(member.id, member.isBanned)} className="p-1.5 bg-black text-red-500 border border-red-500 rounded-lg"><IconBan size={12}/></button></div>
                                                <span className="text-[8px] font-bold text-gray-500 mt-1.5 max-w-[60px] truncate uppercase tracking-tighter">{member.displayName}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-opacity-5 relative">
                                        {chatMessages.map(msg => (
                                            <div key={msg.id} className="group flex flex-col gap-2 max-w-[85%] animate-in fade-in">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/20">{msg.senderName}</span>
                                                    <span className="text-[9px] text-zinc-600 font-mono tracking-tighter uppercase">{msg.createdAt?.toDate().toLocaleString()}</span>
                                                </div>
                                                <div className="relative group/msg">
                                                    <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/5 text-sm text-zinc-300 shadow-xl backdrop-blur-sm group-hover/msg:border-red-500/30 transition-all leading-relaxed">{msg.text}</div>
                                                    <button onClick={() => deleteMessage(msg.id)} className="absolute -right-12 top-1/2 -translate-y-1/2 p-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl opacity-0 group-hover/msg:opacity-100 transition-all hover:bg-red-600 hover:text-white shadow-2xl scale-75 group-hover/msg:scale-100"><IconTrash size={18}/></button>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} className="h-10" />
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-800 opacity-20 animate-in zoom-in-95 duration-700">
                                    <IconMessages size={64}/><p className="text-sm font-black font-mono uppercase mt-4 tracking-[0.4em]">Select frequency for supervision</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'support' && (
                    <div className="h-full flex flex-col md:flex-row p-0 gap-8 overflow-hidden animate-in fade-in duration-500">
                        <div className="w-full md:w-80 bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shrink-0">
                            <div className="p-5 bg-zinc-900/50 border-b border-white/5 font-black text-[10px] text-indigo-400 uppercase tracking-widest shrink-0">Signal Queue</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {tickets.map(t => (
                                    <div key={t.id} onClick={() => setSelectedTicket(t)} className={`p-5 rounded-2xl cursor-pointer transition-all border group ${selectedTicket?.id === t.id ? 'bg-indigo-600/10 border-indigo-600/50 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                                        <div className="flex justify-between items-center mb-1"><span className="font-black text-white text-xs uppercase tracking-tighter truncate w-3/4">{t.userEmail}</span><span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase border ${t.status === 'resolved' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-orange-500 border-orange-500/20 bg-orange-500/5'}`}>{t.status || 'NEW'}</span></div>
                                        <p className="text-[10px] text-gray-600 font-mono truncate lowercase">{t.messages?.[t.messages.length-1]?.text || "Link Ready"}</p>
                                    </div>
                                ))}
                                {tickets.length === 0 && !selectedTicket?.isVirtual && <div className="p-10 text-center text-zinc-800 font-mono text-xs uppercase tracking-widest opacity-40">No Signals</div>}
                            </div>
                        </div>

                        <div className="flex-1 bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                            {selectedTicket ? (
                                <>
                                    <div className="p-6 bg-zinc-900/50 border-b border-white/5 flex justify-between items-center shrink-0">
                                        <div><div className="font-black text-indigo-400 text-base uppercase tracking-widest tracking-tighter">COMMS: {selectedTicket.userEmail}</div>{selectedTicket.isVirtual && <div className="text-[9px] text-orange-500 font-mono mt-1 uppercase">Warning: Unsaved Link - Message to commit</div>}</div>
                                        {!selectedTicket.isVirtual && <button onClick={() => {/* Resolve Logic if needed */}} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-emerald-900/20">Resolve Signal</button>}
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

                {activeView === 'broadcast' && (
                    <div className="h-full flex items-center justify-center animate-in zoom-in duration-500 p-0">
                        <div className="max-w-3xl w-full bg-[#0c0c0c] border border-white/10 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                            <div className="flex items-center gap-6 mb-8"><div className="p-4 bg-red-950/30 rounded-2xl border border-red-500/20 text-red-500 animate-pulse"><IconBroadcast size={40}/></div><div><h3 className="text-3xl font-black text-white uppercase tracking-tighter">{t('admin_broadcast_title')}</h3><p className="text-zinc-500 text-sm font-mono tracking-tight mt-1">High-priority signal forced on active terminals.</p></div></div>
                            <textarea value={broadcastMsg} onChange={e=>setBroadcastMsg(e.target.value)} className="w-full h-32 bg-black border border-zinc-800 rounded-3xl p-8 text-white text-xl font-mono focus:border-red-600 outline-none transition-all resize-none mb-8 shadow-inner" placeholder="TYPE SYSTEM ALERT MESSAGE HERE..." dir="auto"/>
                            <button onClick={sendBroadcast} className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-2xl shadow-2xl shadow-red-900/40 uppercase tracking-[0.5em] transition-all hover:scale-[1.01] active:scale-[0.99]">Execute Broadcast</button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    </div>
  );
}