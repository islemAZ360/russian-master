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
  IconSend, IconDeviceGamepad, IconHome, IconCheck, IconUser
} from '@tabler/icons-react';
import { useUI } from '@/context/UIContext';

export default function AdminDashboard({ currentUser }) {
  const { setCurrentView } = useUI();
  const [activeView, setActiveView] = useState('overview');
  
  // --- Data States ---
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [chats, setChats] = useState([]);
  
  // --- Feature States ---
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  
  // --- Chat Management States ---
  const [managingChat, setManagingChat] = useState(null);
  const [chatMembers, setChatMembers] = useState([]);
  const [adminChatMsg, setAdminChatMsg] = useState("");

  // --- Real-time Data Fetching ---
  useEffect(() => {
    // 1. Fetch Users
    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snap) => {
        setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    
    // 2. Fetch Support Tickets
    const unsubTickets = onSnapshot(query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc")), (snap) => {
        setTickets(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    
    // 3. Fetch Chat Groups
    const unsubChats = onSnapshot(collection(db, "chats"), (snap) => {
        setChats(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => { unsubUsers(); unsubTickets(); unsubChats(); };
  }, []);

  // --- Actions ---

  const sendBroadcast = async () => {
    if(!broadcastMsg.trim()) return;
    if(!confirm("Send Global Broadcast to ALL users?")) return;
    try {
        await updateDoc(doc(db, "system", "broadcast"), { 
            message: broadcastMsg, 
            active: true, 
            sentBy: currentUser.email, 
            timestamp: new Date().toISOString() 
        });
        setBroadcastMsg("");
        alert("Broadcast Sent Successfully!");
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleRoleChange = async (uid, newRole) => {
      if(!confirm(`Change user role to ${newRole}?`)) return;
      try {
          await updateDoc(doc(db, "users", uid), { role: newRole });
      } catch (e) { alert("Error: " + e.message); }
  };

  const toggleBan = async (uid, currentStatus) => {
      if(!confirm(currentStatus ? "Unban User?" : "BAN USER?")) return;
      try {
          await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
      } catch (e) { alert("Error: " + e.message); }
  };

  const deleteChat = async (chatId) => {
      if(!confirm("⚠️ WARNING: Delete this squad channel permanently?")) return;
      try {
          await deleteDoc(doc(db, "chats", chatId));
          if(managingChat?.id === chatId) setManagingChat(null);
      } catch (error) {
          alert("FAILED TO DELETE: " + error.message + "\nCheck Security Rules.");
      }
  };

  const openChatManager = (chat) => {
      setManagingChat(chat);
      setChatMembers([]); 
      // Filter users list to find members of this chat
      if (chat.members && chat.members.length > 0) {
          const membersFound = users.filter(u => chat.members.includes(u.id));
          setChatMembers(membersFound);
      }
  };

  const sendAdminMessageToChat = async () => {
      if (!adminChatMsg.trim() || !managingChat) return;
      try {
          await addDoc(collection(db, "chats", managingChat.id, "messages"), {
              text: adminChatMsg, 
              senderName: "SYSTEM ADMIN", 
              isSystem: true, 
              createdAt: serverTimestamp()
          });
          await updateDoc(doc(db, "chats", managingChat.id), {
              lastActivity: serverTimestamp(), 
              lastMessage: "🔴 SYSTEM: " + adminChatMsg
          });
          setAdminChatMsg("");
      } catch (e) { alert("Error: " + e.message); }
  };

  const sendSupportReply = async () => {
      if(!selectedTicket || !replyText.trim()) return;
      try {
          const newMsg = { text: replyText, sender: 'admin', time: Date.now() };
          await updateDoc(doc(db, "support_tickets", selectedTicket.id), {
              messages: arrayUnion(newMsg), 
              lastUpdate: Date.now(), 
              status: 'replied'
          });
          
          // Notify the user
          await addDoc(collection(db, "notifications"), {
              userId: selectedTicket.userId, 
              title: "SUPPORT REPLY", 
              message: "Admin has replied to your ticket.", 
              type: "support_reply", 
              createdAt: serverTimestamp()
          });
          
          setReplyText("");
      } catch (e) { alert("Error: " + e.message); }
  };

  const markTicketResolved = async (ticketId) => {
      if(!confirm("Mark this ticket as resolved?")) return;
      try {
          await updateDoc(doc(db, "support_tickets", ticketId), { status: 'resolved' });
          if(selectedTicket?.id === ticketId) setSelectedTicket(null);
      } catch (e) { alert("Error: " + e.message); }
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
    <button 
        onClick={() => setActiveView(id)} 
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${activeView === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
        <div className="flex items-center gap-3"><Icon size={20} /><span className="font-bold text-sm">{label}</span></div>
        {count > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{count}</span>}
    </button>
  );

  return (
    // Fixed container to prevent layout shifting
    <div className="fixed inset-0 z-[200] flex bg-[#050505] text-white font-sans overflow-hidden">
        
        {/* Sidebar */}
        <nav className="w-72 border-r border-white/10 bg-black flex flex-col shrink-0">
            <div className="p-6 h-20 border-b border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20">
                    <IconShieldLock size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="font-black tracking-widest text-lg leading-none">NEXUS<span className="text-indigo-500">OS</span></h1>
                    <span className="text-[10px] text-gray-500 font-mono uppercase">Admin Terminal V3.0</span>
                </div>
            </div>
            
            <div className="flex-1 py-6 px-4 space-y-1">
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2 ml-2">Modules</div>
                <NavBtn id="overview" label="Overview" icon={IconLayoutDashboard} />
                <NavBtn id="users" label="Operatives" icon={IconUsers} />
                <NavBtn id="comms" label="Squad Control" icon={IconDeviceGamepad} />
                
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2 ml-2 mt-6">Signals</div>
                <NavBtn id="support" label="Support Uplink" icon={IconMessage2} count={tickets.filter(t=>t.status!=='resolved').length} />
                <NavBtn id="broadcast" label="Global Alert" icon={IconBroadcast} />
            </div>

            <div className="p-4 border-t border-white/10">
                <button 
                    onClick={() => setCurrentView('home')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-bold"
                >
                    <IconHome size={18} />
                    <span>Exit Terminal</span>
                </button>
            </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden relative">
            {/* Header */}
            <header className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-3">
                    {activeView === 'overview' && <><IconLayoutDashboard className="text-indigo-500"/> System Overview</>}
                    {activeView === 'users' && <><IconUsers className="text-indigo-500"/> Operative Database</>}
                    {activeView === 'comms' && <><IconDeviceGamepad className="text-indigo-500"/> Squad Channels</>}
                    {activeView === 'support' && <><IconMessage2 className="text-indigo-500"/> Support Signals</>}
                    {activeView === 'broadcast' && <><IconBroadcast className="text-red-500"/> Emergency Broadcast</>}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-mono text-gray-500">SECURE CONNECTION</span>
                </div>
            </header>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden relative">
                
                {/* 1. OVERVIEW */}
                {activeView === 'overview' && (
                    <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in">
                            <StatCard title="Total Operatives" value={users.length} icon={<IconUsers/>} color="text-cyan-400" />
                            <StatCard title="Active Threats" value={users.filter(u => u.isBanned).length} icon={<IconBan/>} color="text-red-500" />
                            <StatCard title="Open Tickets" value={tickets.filter(t => t.status !== 'resolved').length} icon={<IconMessage2/>} color="text-yellow-500" />
                            <StatCard title="Commanders" value={users.filter(u => u.role === 'admin' || u.role === 'master').length} icon={<IconShieldLock/>} color="text-purple-500" />
                        </div>
                    </div>
                )}

                {/* 2. USERS */}
                {activeView === 'users' && (
                    <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Operative</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                                                        {u.photoURL ? (
                                                            <img src={u.photoURL} className="w-full h-full object-cover" alt="avatar"/>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400"><IconUser size={20}/></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white" dir="auto">{u.displayName || "Unknown Agent"}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select 
                                                    value={u.role || 'user'} 
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    className={`bg-black border border-white/20 rounded px-2 py-1 text-xs font-bold uppercase outline-none focus:border-indigo-500 ${
                                                        u.role === 'master' ? 'text-red-500' : 
                                                        u.role === 'admin' ? 'text-purple-500' : 
                                                        u.role === 'junior' ? 'text-cyan-500' : 'text-gray-400'
                                                    }`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="junior">Junior</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                {u.isBanned ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] bg-red-900/20 text-red-500 px-2 py-1 rounded border border-red-500/20 font-bold uppercase">Banned</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] bg-green-900/20 text-green-500 px-2 py-1 rounded border border-green-500/20 font-bold uppercase">Active</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => toggleBan(u.id, u.isBanned)}
                                                    className={`text-xs font-bold underline ${u.isBanned ? 'text-green-500' : 'text-red-500'}`}
                                                >
                                                    {u.isBanned ? "Revoke Ban" : "Ban Agent"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. SQUAD COMMS (CHAT CONTROL) */}
                {activeView === 'comms' && (
                    <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {chats.map(chat => (
                                <div key={chat.id} className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-indigo-500 transition-all group relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-white/5 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <IconDeviceGamepad size={24}/>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => openChatManager(chat)} 
                                                className="p-2 bg-white/5 hover:bg-indigo-600 rounded-lg text-gray-400 hover:text-white transition-colors" 
                                                title="Manage Squad"
                                            >
                                                <IconSettings size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => deleteChat(chat.id)} 
                                                className="p-2 bg-white/5 hover:bg-red-600 rounded-lg text-gray-400 hover:text-white transition-colors" 
                                                title="Delete Channel"
                                            >
                                                <IconTrash size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-white text-lg mb-1 truncate" dir="auto">{chat.name}</h3>
                                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase border-t border-white/5 pt-3 mt-3">
                                        <span>Type: {chat.type}</span>
                                        <span>{chat.members?.length || 0} Members</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. SUPPORT SYSTEM */}
                {activeView === 'support' && (
                    <div className="absolute inset-0 p-6 flex gap-6">
                        {/* Ticket List */}
                        <div className="w-1/3 bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-white/10 font-bold text-gray-400 text-xs uppercase bg-[#151515] flex justify-between items-center">
                                <span>Incoming Signals</span>
                                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">{tickets.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {tickets.length === 0 && <div className="p-8 text-center text-gray-600 text-sm">No active tickets.</div>}
                                {tickets.map(t => (
                                    <div 
                                        key={t.id} 
                                        onClick={() => setSelectedTicket(t)}
                                        className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${selectedTicket?.id === t.id ? 'bg-indigo-900/20 border-l-4 border-indigo-500' : ''}`}
                                    >
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-white text-sm truncate w-32">{t.userEmail}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${t.status === 'resolved' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
                                                {t.status || 'new'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 truncate" dir="auto">{t.messages[t.messages.length-1]?.text || "No message content"}</div>
                                        <div className="text-[9px] text-gray-600 mt-2 text-right">{new Date(t.lastUpdate).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden relative">
                            {selectedTicket ? (
                                <>
                                    <div className="p-4 border-b border-white/10 bg-[#151515] flex justify-between items-center shrink-0">
                                        <div>
                                            <div className="font-bold text-white text-sm">{selectedTicket.userEmail}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">UID: {selectedTicket.userId}</div>
                                        </div>
                                        {selectedTicket.status !== 'resolved' && (
                                            <button 
                                                onClick={() => markTicketResolved(selectedTicket.id)} 
                                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <IconCheck size={14}/> Resolve Ticket
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/50">
                                        {selectedTicket.messages.map((m, i) => (
                                            <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-3 rounded-xl text-sm leading-relaxed ${m.sender === 'admin' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-[#222] text-gray-200 rounded-bl-none border border-white/5'}`} dir="auto">
                                                    {m.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="p-4 bg-[#151515] border-t border-white/10 flex gap-3 shrink-0">
                                        <input 
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            className="flex-1 bg-black border border-white/20 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="Type response..."
                                            onKeyDown={e => e.key === 'Enter' && sendSupportReply()}
                                        />
                                        <button onClick={sendSupportReply} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg transition-colors">
                                            <IconSend size={18}/>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-50">
                                    <IconMessage2 size={48} className="mb-4"/>
                                    <span className="text-sm font-mono uppercase tracking-widest">Select a signal to establish uplink</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 5. BROADCAST */}
                {activeView === 'broadcast' && (
                    <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-2xl mx-auto bg-[#111] border border-white/10 rounded-2xl p-8 mt-10">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white"><IconBroadcast className="text-red-500"/> Global System Alert</h3>
                            <p className="text-gray-500 text-sm mb-6">This message will be broadcast to all active operatives immediately via the notification system.</p>
                            
                            <textarea 
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                className="w-full h-32 bg-black border border-white/20 rounded-xl p-4 text-white mb-4 focus:border-red-500 outline-none resize-none font-mono text-sm"
                                placeholder="ENTER ALERT MESSAGE..."
                                dir="auto"
                            />
                            <button 
                                onClick={sendBroadcast}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 uppercase tracking-widest text-xs"
                            >
                                Execute Broadcast
                            </button>
                        </div>
                    </div>
                )}

                {/* --- CHAT MANAGER MODAL --- */}
                {managingChat && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <div className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#151515]">
                                <div>
                                    <h3 className="text-lg font-black text-white flex items-center gap-2" dir="auto">
                                        <IconDeviceGamepad className="text-indigo-500"/> {managingChat.name}
                                    </h3>
                                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Control Panel</span>
                                </div>
                                <button onClick={() => setManagingChat(null)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><IconX/></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                {/* Admin Message */}
                                <div className="mb-8 bg-indigo-900/10 border border-indigo-500/30 p-4 rounded-xl">
                                    <label className="text-xs font-bold text-indigo-400 uppercase mb-2 block flex items-center gap-2"><IconBroadcast size={14}/> System Broadcast to Group</label>
                                    <div className="flex gap-2">
                                        <input 
                                            value={adminChatMsg} 
                                            onChange={e => setAdminChatMsg(e.target.value)} 
                                            className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-indigo-500" 
                                            placeholder="Type alert message..."
                                        />
                                        <button onClick={sendAdminMessageToChat} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white font-bold text-xs">SEND</button>
                                    </div>
                                </div>

                                {/* Members List */}
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b border-white/10 pb-2">Active Squad Members</h4>
                                <div className="space-y-2">
                                    {chatMembers.map(member => (
                                        <div key={member.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold border border-white/10 text-white overflow-hidden">
                                                    {member.photoURL ? <img src={member.photoURL} className="w-full h-full object-cover"/> : member.displayName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white" dir="auto">{member.displayName || "Unknown Agent"}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">{member.email}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-400 font-mono mb-1">
                                                    Last: {member.lastLogin ? new Date(member.lastLogin.toDate()).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <button 
                                                    onClick={() => toggleBan(member.id, member.isBanned)} 
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${member.isBanned ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'} hover:opacity-80 transition-opacity`}
                                                >
                                                    {member.isBanned ? "REVOKE BAN" : "BAN USER"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {chatMembers.length === 0 && <div className="text-center text-gray-600 text-xs py-4">No members found or data unavailable.</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </main>
    </div>
  );
}