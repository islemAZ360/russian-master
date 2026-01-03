"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, onSnapshot, doc, updateDoc, query, orderBy, 
  deleteDoc, addDoc, serverTimestamp, arrayUnion, getDoc, where, getDocs 
} from "firebase/firestore";
import { 
  IconShieldLock, IconUsers, IconLayoutDashboard, 
  IconBroadcast, IconMessage2, IconBan, 
  IconTrash, IconSettings, IconEye, 
  IconSend, IconDeviceGamepad, IconAlertTriangle, IconX
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
  
  // Chat Management Modal State
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

  // --- Chat Management Functions ---

  const openChatManager = async (chat) => {
      setManagingChat(chat);
      setChatMembers([]); // Reset
      if (chat.members && chat.members.length > 0) {
          // Fetch user details for members
          // Note: Firestore 'in' query supports max 10 items. For prod, fetch individually or structure differently.
          // Here we filter from the already loaded 'users' state for speed/efficiency
          const membersDetails = users.filter(u => chat.members.includes(u.id));
          setChatMembers(membersDetails);
      }
  };

  const sendAdminMessageToChat = async () => {
      if (!adminChatMsg.trim() || !managingChat) return;
      try {
          await addDoc(collection(db, "chats", managingChat.id, "messages"), {
              text: adminChatMsg,
              senderName: "SYSTEM ADMIN",
              isSystem: true, // Special flag for styling
              createdAt: serverTimestamp()
          });
          await updateDoc(doc(db, "chats", managingChat.id), {
              lastActivity: serverTimestamp(),
              lastMessage: "🔴 SYSTEM ALERT: " + adminChatMsg
          });
          setAdminChatMsg("");
          alert("Official Admin Message Sent.");
      } catch (e) {
          alert("Error: " + e.message);
      }
  };

  const deleteChat = async (chatId) => {
      if(!confirm("⚠️ DANGER: Are you sure you want to delete this channel? This cannot be undone.")) return;
      try {
          await deleteDoc(doc(db, "chats", chatId));
          if(managingChat?.id === chatId) setManagingChat(null);
      } catch (error) {
          alert("FAILED: " + error.message + "\nCheck Rules.");
      }
  };

  // --- General Admin Functions ---

  const sendBroadcast = async () => {
    if(!broadcastMsg.trim()) return;
    if(!confirm("Send Global Broadcast?")) return;
    await updateDoc(doc(db, "system", "broadcast"), { 
        message: broadcastMsg, active: true, sentBy: currentUser.email, timestamp: new Date().toISOString() 
    });
    setBroadcastMsg("");
    alert("Broadcast Sent!");
  };

  const handleRoleChange = async (uid, newRole) => {
      if(!confirm(`Promote/Demote user to ${newRole}?`)) return;
      await updateDoc(doc(db, "users", uid), { role: newRole });
  };

  const toggleBan = async (uid, currentStatus) => {
      if(!confirm(currentStatus ? "Unban User?" : "BAN USER?")) return;
      await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
  };

  const sendSupportReply = async () => {
      if(!selectedTicket || !replyText.trim()) return;
      const newMsg = { text: replyText, sender: 'admin', time: Date.now() };
      await updateDoc(doc(db, "support_tickets", selectedTicket.id), {
          messages: arrayUnion(newMsg), lastUpdate: Date.now(), status: 'replied'
      });
      setReplyText("");
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
                <button onClick={() => setCurrentView('home')} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-bold"><IconHome size={18} /> Exit Terminal</button>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#050505]">
            <header className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">{activeView}</h2>
            </header>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {activeView === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard title="Total Users" value={users.length} icon={<IconUsers/>} color="text-cyan-400" />
                        <StatCard title="Banned" value={users.filter(u => u.isBanned).length} icon={<IconBan/>} color="text-red-500" />
                        <StatCard title="Tickets" value={tickets.length} icon={<IconMessage2/>} color="text-yellow-500" />
                        <StatCard title="Admins" value={users.filter(u => u.role === 'admin' || u.role === 'master').length} icon={<IconShieldLock/>} color="text-purple-500" />
                    </div>
                )}

                {activeView === 'users' && (
                    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                                <tr><th className="p-4">Agent</th><th className="p-4">Rank</th><th className="p-4">Last Seen</th><th className="p-4 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">{u.photoURL && <img src={u.photoURL} className="w-full h-full object-cover"/>}</div>
                                            <div>
                                                <div className="font-bold text-white" dir="auto">{u.displayName}</div>
                                                <div className="text-[10px] text-gray-500">{u.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <select value={u.role || 'user'} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="bg-black border border-white/20 rounded px-2 py-1 text-xs font-bold uppercase outline-none">
                                                <option value="user">User</option><option value="junior">Junior</option><option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-xs text-gray-400 font-mono">{u.lastLogin ? new Date(u.lastLogin.toDate()).toLocaleString() : 'Unknown'}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => toggleBan(u.id, u.isBanned)} className={`px-3 py-1 rounded text-[10px] font-bold ${u.isBanned ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{u.isBanned ? "UNBAN" : "BAN"}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* SQUAD COMMS WITH FULL CONTROL */}
                {activeView === 'comms' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chats.map(chat => (
                            <div key={chat.id} className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-indigo-500 transition-all group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-white/5 text-indigo-400"><IconDeviceGamepad size={24}/></div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openChatManager(chat)} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white" title="Manage Squad"><IconSettings size={16}/></button>
                                        <button onClick={() => deleteChat(chat.id)} className="p-2 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors" title="Delete Squad"><IconTrash size={16}/></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-white text-lg mb-1" dir="auto">{chat.name}</h3>
                                <div className="flex justify-between items-center text-xs text-gray-500 font-mono uppercase">
                                    <span>{chat.type}</span>
                                    <span>{chat.members?.length || 0} Members</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- CHAT MANAGER MODAL --- */}
                {managingChat && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                        <div className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#151515]">
                                <div>
                                    <h3 className="text-xl font-black text-white flex items-center gap-2" dir="auto">
                                        <IconDeviceGamepad className="text-indigo-500"/> {managingChat.name}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Squad Control Panel</span>
                                </div>
                                <button onClick={() => setManagingChat(null)} className="p-2 hover:bg-white/10 rounded-full"><IconX/></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Admin Message */}
                                <div className="mb-8 bg-indigo-900/10 border border-indigo-500/30 p-4 rounded-xl">
                                    <label className="text-xs font-bold text-indigo-400 uppercase mb-2 block">Broadcast System Message to Squad</label>
                                    <div className="flex gap-2">
                                        <input 
                                            value={adminChatMsg} 
                                            onChange={e => setAdminChatMsg(e.target.value)} 
                                            className="flex-1 bg-black border border-white/10 rounded-lg px-4 text-sm text-white outline-none focus:border-indigo-500" 
                                            placeholder="Type alert (e.g. 'Meeting at 10 PM')..."
                                        />
                                        <button onClick={sendAdminMessageToChat} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white font-bold text-xs">SEND</button>
                                    </div>
                                </div>

                                {/* Members List */}
                                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Active Squad Members</h4>
                                <div className="space-y-2">
                                    {chatMembers.map(member => (
                                        <div key={member.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold border border-white/10">
                                                    {member.photoURL ? <img src={member.photoURL} className="w-full h-full object-cover rounded-full"/> : member.displayName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white" dir="auto">{member.displayName}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">{member.email}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-400 font-mono mb-1">
                                                    Last Login: {member.lastLogin ? new Date(member.lastLogin.toDate()).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => toggleBan(member.id, member.isBanned)} className={`text-[10px] font-bold px-2 py-0.5 rounded ${member.isBanned ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                                                        {member.isBanned ? "UNBAN" : "BAN"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {chatMembers.length === 0 && <div className="text-center text-gray-500 text-xs py-4">No members found or unable to fetch details.</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Support & Broadcast (Same as before) */}
                {activeView === 'broadcast' && (
                    <div className="max-w-xl mx-auto bg-[#111] border border-white/10 rounded-2xl p-8 mt-10">
                        <textarea value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} className="w-full h-32 bg-black border border-white/20 rounded-xl p-4 text-white mb-4 focus:border-red-500 outline-none" placeholder="Global Alert Message..." dir="auto"/>
                        <button onClick={sendBroadcast} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl uppercase tracking-widest">SEND ALERT</button>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
}