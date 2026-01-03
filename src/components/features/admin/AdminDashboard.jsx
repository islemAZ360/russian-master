"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, onSnapshot, doc, updateDoc, query, orderBy, 
  deleteDoc, addDoc, serverTimestamp, arrayUnion 
} from "firebase/firestore";
import { 
  IconShieldLock, IconUsers, IconLayoutDashboard, 
  IconBroadcast, IconMessage2, IconBan, 
  IconTrash, IconSettings, IconX, 
  IconSend, IconDeviceGamepad, IconHome, IconCheck
} from '@tabler/icons-react';
import { useUI } from '@/context/UIContext';

export default function AdminDashboard({ currentUser }) {
  const { setCurrentView } = useUI();
  const [activeView, setActiveView] = useState('overview');
  
  // Data States
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [chats, setChats] = useState([]);
  
  // Feature States
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  
  // Chat Management
  const [managingChat, setManagingChat] = useState(null);
  const [chatMembers, setChatMembers] = useState([]);
  const [adminChatMsg, setAdminChatMsg] = useState("");

  // Fetch Data
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

  // --- Actions ---
  const sendBroadcast = async () => {
    if(!broadcastMsg.trim()) return;
    if(!confirm("Send Global Broadcast?")) return;
    try {
        await updateDoc(doc(db, "system", "broadcast"), { 
            message: broadcastMsg, active: true, sentBy: currentUser.email, timestamp: new Date().toISOString() 
        });
        setBroadcastMsg("");
        alert("Broadcast Sent!");
    } catch (e) { alert(e.message); }
  };

  const handleRoleChange = async (uid, newRole) => {
      if(!confirm(`Change role to ${newRole}?`)) return;
      await updateDoc(doc(db, "users", uid), { role: newRole });
  };

  const toggleBan = async (uid, currentStatus) => {
      if(!confirm(currentStatus ? "Unban?" : "Ban User?")) return;
      await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
  };

  const deleteChat = async (chatId) => {
      if(!confirm("Delete this channel permanently?")) return;
      try {
          await deleteDoc(doc(db, "chats", chatId));
          if(managingChat?.id === chatId) setManagingChat(null);
      } catch (error) {
          alert("FAILED: " + error.message + "\nCheck Rules.");
      }
  };

  const sendAdminMessageToChat = async () => {
      if (!adminChatMsg.trim() || !managingChat) return;
      try {
          await addDoc(collection(db, "chats", managingChat.id, "messages"), {
              text: adminChatMsg, senderName: "SYSTEM ADMIN", isSystem: true, createdAt: serverTimestamp()
          });
          await updateDoc(doc(db, "chats", managingChat.id), {
              lastActivity: serverTimestamp(), lastMessage: "🔴 SYSTEM: " + adminChatMsg
          });
          setAdminChatMsg("");
      } catch (e) { alert(e.message); }
  };

  const openChatManager = (chat) => {
      setManagingChat(chat);
      setChatMembers([]); 
      if (chat.members?.length > 0) {
          setChatMembers(users.filter(u => chat.members.includes(u.id)));
      }
  };

  const sendSupportReply = async () => {
      if(!selectedTicket || !replyText.trim()) return;
      try {
          const newMsg = { text: replyText, sender: 'admin', time: Date.now() };
          await updateDoc(doc(db, "support_tickets", selectedTicket.id), {
              messages: arrayUnion(newMsg), lastUpdate: Date.now(), status: 'replied'
          });
          await addDoc(collection(db, "notifications"), {
              userId: selectedTicket.userId, title: "SUPPORT REPLY", message: "New reply from admin.", type: "support_reply", createdAt: serverTimestamp()
          });
          setReplyText("");
      } catch (e) { alert(e.message); }
  };

  const markTicketResolved = async (ticketId) => {
      if(!confirm("Close this ticket?")) return;
      await updateDoc(doc(db, "support_tickets", ticketId), { status: 'resolved' });
      if(selectedTicket?.id === ticketId) setSelectedTicket(null);
  };

  // --- Components ---
  const StatCard = ({ title, value, icon, color }) => (
    <div className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-white/20 transition-all">
        <div className={`p-3 rounded-xl bg-white/5 w-fit mb-4 ${color}`}>{icon}</div>
        <div className="text-3xl font-black text-white mb-1">{value}</div>
        <div className="text-xs font-bold uppercase text-gray-500 tracking-widest">{title}</div>
    </div>
  );

  const NavBtn = ({ id, label, icon: Icon, count }) => (
    <button onClick={() => setActiveView(id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${activeView === id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <div className="flex items-center gap-3"><Icon size={20} /><span className="font-bold text-sm">{label}</span></div>
        {count > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{count}</span>}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#050505] text-white font-sans overflow-hidden">
        
        {/* Sidebar */}
        <nav className="w-72 border-r border-white/10 bg-black flex flex-col shrink-0">
            <div className="p-6 h-20 border-b border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center"><IconShieldLock size={20} /></div>
                <div><h1 className="font-black text-lg">NEXUS<span className="text-indigo-500">OS</span></h1><span className="text-[10px] text-gray-500">ADMIN V3.0</span></div>
            </div>
            <div className="flex-1 py-6 px-4 space-y-1">
                <NavBtn id="overview" label="Overview" icon={IconLayoutDashboard} />
                <NavBtn id="users" label="Operatives" icon={IconUsers} />
                <NavBtn id="comms" label="Squad Control" icon={IconDeviceGamepad} />
                <NavBtn id="support" label="Support" icon={IconMessage2} count={tickets.filter(t=>t.status!=='resolved').length} />
                <NavBtn id="broadcast" label="Global Alert" icon={IconBroadcast} />
            </div>
            <div className="p-4 border-t border-white/10">
                <button onClick={() => setCurrentView('home')} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-bold"><IconHome size={18} /> Exit</button>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden">
            <header className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">{activeView}</h2>
            </header>

            {/* Content Container - Fixed: overflow-hidden for parent, auto for child */}
            <div className="flex-1 overflow-hidden relative">
                
                {/* 1. OVERVIEW */}
                {activeView === 'overview' && (
                    <div className="h-full overflow-y-auto p-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard title="Total Users" value={users.length} icon={<IconUsers/>} color="text-cyan-400" />
                            <StatCard title="Banned" value={users.filter(u => u.isBanned).length} icon={<IconBan/>} color="text-red-500" />
                            <StatCard title="Tickets" value={tickets.filter(t => t.status !== 'resolved').length} icon={<IconMessage2/>} color="text-yellow-500" />
                            <StatCard title="Admins" value={users.filter(u => u.role === 'admin' || u.role === 'master').length} icon={<IconShieldLock/>} color="text-purple-500" />
                        </div>
                    </div>
                )}

                {/* 2. USERS */}
                {activeView === 'users' && (
                    <div className="h-full overflow-y-auto p-8">
                        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                                    <tr><th className="p-4">Agent</th><th className="p-4">Rank</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">{u.photoURL && <img src={u.photoURL} className="w-full h-full object-cover"/>}</div>
                                                    <div><div className="font-bold text-white">{u.displayName}</div><div className="text-[10px] text-gray-500">{u.email}</div></div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select value={u.role || 'user'} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="bg-black border border-white/20 rounded px-2 py-1 text-xs font-bold uppercase outline-none">
                                                    <option value="user">User</option><option value="junior">Junior</option><option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-xs font-mono">{u.isBanned ? <span className="text-red-500">BANNED</span> : <span className="text-green-500">ACTIVE</span>}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => toggleBan(u.id, u.isBanned)} className="text-xs underline hover:text-white">{u.isBanned ? "Unban" : "Ban"}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. SUPPORT (THE FIX) */}
                {activeView === 'support' && (
                    <div className="absolute inset-0 p-6 flex gap-6">
                        {/* Ticket List */}
                        <div className="w-1/3 bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-white/10 font-bold text-gray-400 text-xs uppercase bg-[#151515]">Incoming Signals</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {tickets.length === 0 && <div className="p-4 text-center text-gray-600 text-sm">No active tickets.</div>}
                                {tickets.map(t => (
                                    <div 
                                        key={t.id} 
                                        onClick={() => setSelectedTicket(t)}
                                        className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${selectedTicket?.id === t.id ? 'bg-indigo-900/20 border-l-4 border-indigo-500' : ''}`}
                                    >
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-white text-sm truncate w-24">{t.userEmail}</span>
                                            <span className={`text-[10px] px-2 rounded ${t.status === 'resolved' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>{t.status || 'new'}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 truncate" dir="auto">{t.messages[t.messages.length-1]?.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat View */}
                        <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                            {selectedTicket ? (
                                <>
                                    <div className="p-4 border-b border-white/10 bg-[#151515] flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-white">{selectedTicket.userEmail}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">ID: {selectedTicket.userId}</div>
                                        </div>
                                        {selectedTicket.status !== 'resolved' && (
                                            <button onClick={() => markTicketResolved(selectedTicket.id)} className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold">
                                                <IconCheck size={14}/> Resolve
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/50">
                                        {selectedTicket.messages.map((m, i) => (
                                            <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-3 rounded-xl text-sm ${m.sender === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-200'}`} dir="auto">
                                                    {m.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-[#151515] border-t border-white/10 flex gap-3">
                                        <input 
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            className="flex-1 bg-black border border-white/20 rounded-xl px-4 text-sm text-white outline-none focus:border-indigo-500"
                                            placeholder="Type response..."
                                            onKeyDown={e => e.key === 'Enter' && sendSupportReply()}
                                        />
                                        <button onClick={sendSupportReply} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500"><IconSend size={18}/></button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-600 font-mono text-sm uppercase">Select a ticket to view details</div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. COMMS */}
                {activeView === 'comms' && (
                    <div className="h-full overflow-y-auto p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {chats.map(chat => (
                                <div key={chat.id} className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-indigo-500 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-white/5 text-indigo-400"><IconDeviceGamepad size={24}/></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openChatManager(chat)} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white" title="Manage"><IconSettings size={16}/></button>
                                            <button onClick={() => deleteChat(chat.id)} className="p-2 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white rounded-lg" title="Delete"><IconTrash size={16}/></button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-white text-lg mb-1" dir="auto">{chat.name}</h3>
                                    <div className="text-xs text-gray-500 font-mono uppercase">{chat.type} • {chat.members?.length || 0} Users</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CHAT MANAGER MODAL */}
                {managingChat && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                        <div className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#151515]">
                                <h3 className="text-xl font-black text-white" dir="auto">Managing: {managingChat.name}</h3>
                                <button onClick={() => setManagingChat(null)} className="hover:text-white text-gray-500"><IconX/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                                    <label className="text-xs font-bold text-indigo-400 block mb-2">SYSTEM BROADCAST TO GROUP</label>
                                    <div className="flex gap-2">
                                        <input value={adminChatMsg} onChange={e=>setAdminChatMsg(e.target.value)} className="flex-1 bg-black border border-white/10 rounded px-3 text-sm text-white" placeholder="Message..."/>
                                        <button onClick={sendAdminMessageToChat} className="bg-indigo-600 px-4 py-2 rounded text-white text-xs font-bold">SEND</button>
                                    </div>
                                </div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Members ({chatMembers.length})</h4>
                                <div className="space-y-2">
                                    {chatMembers.map(m => (
                                        <div key={m.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                                            <span className="text-sm font-bold text-white">{m.displayName || m.email}</span>
                                            <span className="text-[10px] text-gray-500 font-mono">{m.id}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. BROADCAST */}
                {activeView === 'broadcast' && (
                    <div className="h-full overflow-y-auto p-8">
                        <div className="max-w-xl mx-auto bg-[#111] border border-white/10 rounded-2xl p-8">
                            <textarea value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} className="w-full h-32 bg-black border border-white/20 rounded-xl p-4 text-white mb-4 focus:border-red-500 outline-none" placeholder="Global Alert..." dir="auto"/>
                            <button onClick={sendBroadcast} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl uppercase tracking-widest">SEND ALERT</button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
}