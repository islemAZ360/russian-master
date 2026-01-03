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
  IconTrash, IconSearch, IconArrowLeft, IconHome,
  IconSend, IconDeviceGamepad, IconUserCircle
} from '@tabler/icons-react';
import { useUI } from '@/context/UIContext';

export default function AdminDashboard({ currentUser }) {
  const { setCurrentView } = useUI();
  const [activeView, setActiveView] = useState('overview');
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [chats, setChats] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

  // جلب البيانات
  useEffect(() => {
    // 1. Users
    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snap) => {
        setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    // 2. Support Tickets
    const unsubTickets = onSnapshot(query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc")), (snap) => {
        setTickets(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    // 3. Chats (Groups)
    const unsubChats = onSnapshot(collection(db, "chats"), (snap) => {
        setChats(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => { unsubUsers(); unsubTickets(); unsubChats(); };
  }, []);

  // --- Actions ---

  const sendBroadcast = async () => {
    if(!broadcastMsg.trim()) return;
    if(!confirm("Send this message to ALL users?")) return;
    try {
        await updateDoc(doc(db, "system", "broadcast"), { 
            message: broadcastMsg, 
            active: true, 
            sentBy: currentUser.email, 
            timestamp: new Date().toISOString() 
        });
        setBroadcastMsg("");
        alert("Global Broadcast Sent!");
    } catch (e) {
        alert("Error sending broadcast: " + e.message);
    }
  };

  const handleRoleChange = async (uid, newRole) => {
      if(!confirm(`Change user role to ${newRole}?`)) return;
      try {
          await updateDoc(doc(db, "users", uid), { role: newRole });
      } catch (e) {
          alert("Error changing role: " + e.message);
      }
  };

  const toggleBan = async (uid, currentStatus) => {
      if(!confirm(currentStatus ? "Unban User?" : "BAN USER?")) return;
      try {
          await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
      } catch (e) {
          alert("Error updating ban status: " + e.message);
      }
  };

  // --- دالة الحذف المعدلة ---
  const deleteChat = async (chatId) => {
      if(!confirm("Delete this squad channel permanently?")) return;
      
      try {
          // محاولة الحذف
          await deleteDoc(doc(db, "chats", chatId));
          // لا حاجة لرسالة نجاح، العنصر سيختفي تلقائياً بفضل onSnapshot
      } catch (error) {
          console.error("Delete failed:", error);
          // هذه الرسالة ستخبرك بالسبب الحقيقي (مثلاً: Missing permissions)
          alert("FAILED TO DELETE: " + error.message + "\n\nCheck your Firebase Security Rules.");
      }
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

          await addDoc(collection(db, "notifications"), {
              userId: selectedTicket.userId,
              title: "SUPPORT REPLY",
              message: "Admin has replied to your ticket.",
              type: "support_reply",
              createdAt: serverTimestamp()
          });

          setReplyText("");
      } catch (e) {
          alert("Error sending reply: " + e.message);
      }
  };

  // --- UI Components ---

  const StatCard = ({ title, value, icon, color }) => (
    <div className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-white/20 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-white/5 ${color}`}>{icon}</div>
        </div>
        <div className="text-3xl font-black text-white mb-1">{value}</div>
        <div className="text-xs font-bold uppercase text-gray-500 tracking-widest">{title}</div>
    </div>
  );

  const NavBtn = ({ id, label, icon: Icon, count }) => (
    <button 
        onClick={() => { setActiveView(id); setSelectedTicket(null); }} 
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${
            activeView === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        <div className="flex items-center gap-3">
            <Icon size={20} />
            <span className="font-bold text-sm">{label}</span>
        </div>
        {count > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{count}</span>}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#050505] text-white font-sans overflow-hidden">
        
        {/* Sidebar */}
        <nav className="w-72 border-r border-white/10 bg-black flex flex-col shrink-0">
            <div className="p-6 h-20 border-b border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20">
                    <IconShieldLock size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="font-black tracking-widest text-lg leading-none">NEXUS<span className="text-indigo-500">OS</span></h1>
                    <span className="text-[10px] text-gray-500 font-mono">ADMIN TERMINAL</span>
                </div>
            </div>
            
            <div className="flex-1 py-6 px-4 space-y-1">
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2 ml-2">Main Modules</div>
                <NavBtn id="overview" label="Command Deck" icon={IconLayoutDashboard} />
                <NavBtn id="users" label="Operatives" icon={IconUsers} />
                <NavBtn id="comms" label="Squad Comms" icon={IconDeviceGamepad} />
                
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2 ml-2 mt-6">Signals</div>
                <NavBtn id="support" label="Support Uplink" icon={IconMessage2} count={tickets.filter(t=>t.status!=='resolved').length} />
                <NavBtn id="broadcast" label="Global Alert" icon={IconBroadcast} />
            </div>

            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold">AD</div>
                    <div className="text-xs">
                        <div className="text-white font-bold">Admin Session</div>
                        <div className="text-green-500">Online</div>
                    </div>
                </div>
                <button 
                    onClick={() => setCurrentView('home')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-bold"
                >
                    <IconHome size={18} />
                    <span>Exit Terminal</span>
                </button>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#050505]">
            <header className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-3">
                    {activeView === 'overview' && <><IconLayoutDashboard className="text-indigo-500"/> System Overview</>}
                    {activeView === 'users' && <><IconUsers className="text-indigo-500"/> Operative Database</>}
                    {activeView === 'comms' && <><IconDeviceGamepad className="text-indigo-500"/> Squad Channels</>}
                    {activeView === 'support' && <><IconMessage2 className="text-indigo-500"/> Support Signals</>}
                    {activeView === 'broadcast' && <><IconBroadcast className="text-red-500"/> Emergency Broadcast</>}
                </h2>
            </header>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                
                {/* 1. OVERVIEW */}
                {activeView === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <StatCard title="Total Operatives" value={users.length} icon={<IconUsers/>} color="text-cyan-400" />
                        <StatCard title="Active Threats" value={users.filter(u => u.isBanned).length} icon={<IconBan/>} color="text-red-500" />
                        <StatCard title="Open Signals" value={tickets.filter(t => t.status !== 'resolved').length} icon={<IconMessage2/>} color="text-yellow-500" />
                        <StatCard title="Commanders" value={users.filter(u => u.role === 'admin' || u.role === 'master').length} icon={<IconShieldLock/>} color="text-purple-500" />
                    </div>
                )}

                {/* 2. USERS (OPERATIVES) */}
                {activeView === 'users' && (
                    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl animate-in fade-in">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-4">Agent</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Rank / Role</th>
                                    <th className="p-4">XP Status</th>
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
                                                        <img src={u.photoURL} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold">{u.email[0].toUpperCase()}</div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-white" dir="auto">{u.displayName || "Unknown Agent"}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400 font-mono text-xs">{u.email}</td>
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
                                        <td className="p-4 text-indigo-400 font-bold font-mono">{u.xp} XP</td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => toggleBan(u.id, u.isBanned)}
                                                className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all ${
                                                    u.isBanned 
                                                    ? 'bg-green-900/30 text-green-400 border border-green-500/50 hover:bg-green-500 hover:text-black' 
                                                    : 'bg-red-900/30 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white'
                                                }`}
                                            >
                                                {u.isBanned ? "REVOKE BAN" : "BAN AGENT"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 3. SUPPORT SYSTEM */}
                {activeView === 'support' && (
                    <div className="flex h-[calc(100vh-180px)] gap-6">
                        {/* Ticket List */}
                        <div className="w-1/3 bg-[#111] border border-white/10 rounded-2xl overflow-y-auto custom-scrollbar">
                            <div className="p-4 border-b border-white/10 font-bold text-gray-400 text-xs uppercase">Incoming Signals</div>
                            {tickets.map(t => (
                                <div 
                                    key={t.id} 
                                    onClick={() => setSelectedTicket(t)}
                                    className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${selectedTicket?.id === t.id ? 'bg-indigo-900/20 border-l-4 border-indigo-500' : ''}`}
                                >
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-white text-sm truncate w-24">{t.userEmail}</span>
                                        <span className="text-[10px] text-gray-500">{new Date(t.lastUpdate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 truncate" dir="auto">{t.messages[t.messages.length-1]?.text || "No Data"}</div>
                                </div>
                            ))}
                        </div>

                        {/* Chat View */}
                        <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                            {selectedTicket ? (
                                <>
                                    <div className="p-4 border-b border-white/10 bg-black/50 flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-white">{selectedTicket.userEmail}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">ID: {selectedTicket.userId}</div>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                        {selectedTicket.messages.map((m, i) => (
                                            <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-3 rounded-xl text-sm ${m.sender === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-200'}`} dir="auto">
                                                    {m.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-black/50 border-t border-white/10 flex gap-3">
                                        <input 
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            className="flex-1 bg-black border border-white/20 rounded-xl px-4 text-sm text-white outline-none focus:border-indigo-500"
                                            placeholder="Type response..."
                                        />
                                        <button onClick={sendSupportReply} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500"><IconSend size={18}/></button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-600 font-mono text-sm uppercase">Select a signal to establish uplink</div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. SQUAD COMMS */}
                {activeView === 'comms' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {chats.map(chat => (
                            <div key={chat.id} className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-indigo-500/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-white/5 text-indigo-400 group-hover:text-white group-hover:bg-indigo-500 transition-all">
                                        <IconDeviceGamepad size={24}/>
                                    </div>
                                    <button 
                                        onClick={() => deleteChat(chat.id)} 
                                        className="text-gray-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/5"
                                        title="Delete Channel"
                                    >
                                        <IconTrash size={18}/>
                                    </button>
                                </div>
                                <h3 className="font-bold text-white text-lg mb-1" dir="auto">{chat.name}</h3>
                                <div className="text-xs text-gray-500 font-mono uppercase mb-4">{chat.type} CHANNEL</div>
                                <div className="text-[10px] text-gray-600">Last Activity: {chat.lastActivity ? new Date(chat.lastActivity.toDate()).toLocaleString() : 'N/A'}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 5. BROADCAST */}
                {activeView === 'broadcast' && (
                    <div className="max-w-2xl mx-auto bg-[#111] border border-white/10 rounded-2xl p-8 mt-10">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white"><IconBroadcast className="text-red-500"/> Global System Alert</h3>
                        <p className="text-gray-500 text-sm mb-6">This message will be broadcast to all active operatives immediately.</p>
                        
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
                )}
            </div>
        </main>
    </div>
  );
}