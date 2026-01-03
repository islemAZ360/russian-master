"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, onSnapshot, doc, updateDoc, query, orderBy, 
  deleteDoc, arrayUnion, addDoc, serverTimestamp, where 
} from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconShieldLock, IconUsers, IconLayoutDashboard, 
  IconBroadcast, IconMessage2, IconBan, IconCheck, 
  IconTrash, IconSend, IconSearch, IconUserCog, IconX,
  IconArrowLeft, IconHome
} from '@tabler/icons-react';
import { useUI } from '../../context/UIContext';

export default function AdminDashboard({ currentUser }) {
  const { setCurrentView } = useUI();
  const [activeView, setActiveView] = useState('overview');
  
  // Data State
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    // 1. جلب المستخدمين
    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snap) => {
        setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    // 2. جلب تذاكر الدعم
    const unsubTickets = onSnapshot(query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc")), (snap) => {
        setTickets(snap.docs.map(d => ({id: d.id, ...d.data()})));
        setLoading(false);
    });

    return () => { unsubUsers(); unsubTickets(); };
  }, []);

  // --- Actions ---
  const handleRoleChange = async (uid, newRole) => {
      if(!confirm(`Change role to ${newRole}?`)) return;
      await updateDoc(doc(db, "users", uid), { role: newRole });
      // إشعار للمستخدم
      await addDoc(collection(db, "notifications"), {
          userId: uid,
          title: "SYSTEM UPDATE",
          message: `Your rank has been updated to: ${newRole.toUpperCase()}`,
          type: "rank",
          createdAt: serverTimestamp()
      });
  };

  const toggleBan = async (uid, currentStatus) => {
      if(!confirm(currentStatus ? "Unban User?" : "BAN USER?")) return;
      await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
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
    alert("Broadcast Sent Globally");
  };

  const stopBroadcast = async () => {
    await updateDoc(doc(db, "system", "broadcast"), { active: false });
  };

  // --- Views Components ---
  
  // 1. Overview Tab
  const OverviewStats = () => {
      const totalUsers = users.length;
      const bannedUsers = users.filter(u => u.isBanned).length;
      const activeTickets = tickets.filter(t => t.status !== 'resolved').length;
      const admins = users.filter(u => u.role === 'admin' || u.role === 'master').length;

      return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
              <StatCard title="Total Operatives" value={totalUsers} icon={<IconUsers/>} color="text-cyan-500" />
              <StatCard title="Active Threats (Banned)" value={bannedUsers} icon={<IconBan/>} color="text-red-500" />
              <StatCard title="Support Signals" value={activeTickets} icon={<IconMessage2/>} color="text-yellow-500" />
              <StatCard title="Commanders" value={admins} icon={<IconShieldLock/>} color="text-purple-500" />
          </div>
      );
  };

  // 2. Users Tab
  const UsersTable = () => {
      const filteredUsers = users.filter(u => 
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
          <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search operatives..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-theme-card border border-theme rounded-xl py-3 pl-10 pr-4 text-theme-main outline-none focus:border-[var(--accent-color)]"
                      />
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar rounded-xl border border-theme bg-theme-card">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-theme-hover sticky top-0 z-10">
                          <tr>
                              <th className="p-4 text-xs font-bold uppercase text-[var(--text-muted)]">Operative</th>
                              <th className="p-4 text-xs font-bold uppercase text-[var(--text-muted)]">Role</th>
                              <th className="p-4 text-xs font-bold uppercase text-[var(--text-muted)]">Stats</th>
                              <th className="p-4 text-xs font-bold uppercase text-[var(--text-muted)]">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                          {filteredUsers.map(u => (
                              <tr key={u.id} className="hover:bg-theme-hover transition-colors">
                                  <td className="p-4">
                                      <div className="font-bold text-theme-main">{u.displayName || "Unknown"}</div>
                                      <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                                  </td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                                          u.role === 'master' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                          u.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                          u.role === 'junior' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' :
                                          'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                      }`}>
                                          {u.role}
                                      </span>
                                  </td>
                                  <td className="p-4 text-xs font-mono text-theme-main">
                                      XP: {u.xp || 0} <br/>
                                      Joined: {u.createdAt?.toDate ? new Date(u.createdAt.toDate()).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="p-4 flex items-center gap-2">
                                      <button onClick={() => toggleBan(u.id, u.isBanned)} className={`p-2 rounded hover:bg-white/5 transition-colors ${u.isBanned ? 'text-green-500' : 'text-red-500'}`} title={u.isBanned ? "Unban" : "Ban"}>
                                          {u.isBanned ? <IconCheck size={18}/> : <IconBan size={18}/>}
                                      </button>
                                      
                                      {/* Role Dropdown (Simple) */}
                                      <select 
                                        value={u.role} 
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        className="bg-theme-main border border-theme rounded p-1 text-xs text-theme-main outline-none cursor-pointer"
                                        disabled={u.email === 'islamaz@bomba.com'}
                                      >
                                          <option value="user">User</option>
                                          <option value="junior">Junior</option>
                                          <option value="admin">Admin</option>
                                      </select>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  // 3. Support Tab
  const SupportSystem = () => {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reply, setReply] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if(selectedTicket) {
            const freshTicket = tickets.find(t => t.id === selectedTicket.id);
            if(freshTicket) setSelectedTicket(freshTicket);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [tickets, selectedTicket?.id]);

    const sendReply = async () => {
        if(!reply.trim() || !selectedTicket) return;
        
        await updateDoc(doc(db, "support_tickets", selectedTicket.id), {
            messages: arrayUnion({ text: reply, sender: 'admin', time: Date.now() }),
            lastUpdate: Date.now(),
            status: 'answered'
        });

        // Notify User
        await addDoc(collection(db, "notifications"), {
            userId: selectedTicket.userId,
            title: "SUPPORT REPLY",
            message: `Admin: ${reply.substring(0, 30)}...`,
            type: "support_reply",
            createdAt: serverTimestamp()
        });

        setReply("");
    };

    return (
        <div className="flex h-full gap-4 animate-in fade-in">
            {/* Ticket List */}
            <div className="w-1/3 border border-theme bg-theme-card rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-theme bg-theme-hover font-bold text-theme-main">INBOX</div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {tickets.map(t => (
                        <div 
                            key={t.id} 
                            onClick={() => setSelectedTicket(t)}
                            className={`p-4 border-b border-theme cursor-pointer hover:bg-theme-hover transition-colors ${selectedTicket?.id === t.id ? 'bg-[var(--accent-color)] text-white' : 'text-theme-main'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-sm truncate">{t.userEmail}</span>
                                {t.status === 'new' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                            </div>
                            <p className="text-xs opacity-70 truncate">{t.messages?.[t.messages.length-1]?.text || "No messages"}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 border border-theme bg-theme-card rounded-xl overflow-hidden flex flex-col relative">
                {!selectedTicket ? (
                    <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm uppercase tracking-widest">Select a transmission</div>
                ) : (
                    <>
                        <div className="p-4 border-b border-theme flex justify-between items-center bg-theme-hover">
                            <span className="font-bold text-theme-main">{selectedTicket.userEmail}</span>
                            <button onClick={async () => {
                                if(confirm("Delete Ticket?")) {
                                    await deleteDoc(doc(db, "support_tickets", selectedTicket.id));
                                    setSelectedTicket(null);
                                }
                            }} className="text-red-500 hover:bg-red-500/10 p-2 rounded"><IconTrash size={18}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {selectedTicket.messages?.map((m, i) => (
                                <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                                        m.sender === 'admin' 
                                        ? 'bg-[var(--accent-color)] text-white' 
                                        : 'bg-theme-hover text-theme-main border border-theme'
                                    }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-theme bg-theme-hover flex gap-3">
                            <input 
                                value={reply} 
                                onChange={e => setReply(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendReply()}
                                className="flex-1 bg-theme-card border border-theme rounded-xl px-4 py-2 text-theme-main outline-none focus:border-[var(--accent-color)]"
                                placeholder="Type reply..."
                            />
                            <button onClick={sendReply} className="p-3 bg-[var(--accent-color)] text-white rounded-xl hover:opacity-90"><IconSend size={20}/></button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
  };

  // 4. Broadcast Tab
  const BroadcastSystem = () => (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-300">
          <div className="w-full max-w-lg p-8 border border-theme bg-theme-card rounded-3xl shadow-xl text-center">
              <IconBroadcast size={64} className="mx-auto mb-6 text-red-500" />
              <h2 className="text-2xl font-black text-theme-main mb-2">GLOBAL ALERT SYSTEM</h2>
              <p className="text-[var(--text-muted)] text-sm mb-6">Send a message to all active operatives instantly.</p>
              
              <textarea 
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  className="w-full h-32 bg-theme-hover border border-theme rounded-xl p-4 text-theme-main outline-none focus:border-red-500 mb-6 resize-none"
                  placeholder="ENTER URGENT MESSAGE..."
              />
              
              <div className="flex gap-4">
                  <button onClick={sendBroadcast} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-900/20">
                      TRANSMIT
                  </button>
                  <button onClick={stopBroadcast} className="px-6 py-4 bg-theme-hover border border-theme text-theme-main font-bold rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all">
                      <IconX />
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
        
        {/* Sidebar */}
        <nav className="w-20 lg:w-64 border-r border-theme bg-theme-card flex flex-col shrink-0 z-20">
            <div className="p-6 flex items-center gap-4 h-20 border-b border-theme">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg">
                    <IconShieldLock size={20} />
                </div>
                <h1 className="hidden lg:block font-black tracking-widest text-lg">NEXUS<span className="text-[var(--accent-color)]">OS</span></h1>
            </div>

            <div className="flex-1 py-6 space-y-1 px-3">
                <NavBtn id="overview" label="Command Deck" icon={IconLayoutDashboard} active={activeView} set={setActiveView} />
                <NavBtn id="users" label="Operatives" icon={IconUsers} active={activeView} set={setActiveView} />
                <NavBtn id="support" label="Comms Uplink" icon={IconMessage2} active={activeView} set={setActiveView} badge={tickets.filter(t=>t.status!=='resolved').length} />
                <NavBtn id="broadcast" label="Global Alert" icon={IconBroadcast} active={activeView} set={setActiveView} />
            </div>

            {/* زر الخروج من لوحة التحكم */}
            <div className="p-4 border-t border-theme space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-theme-hover">
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">AD</div>
                    <div className="hidden lg:block overflow-hidden">
                        <div className="font-bold text-xs truncate">{currentUser?.email}</div>
                        <div className="text-[10px] text-[var(--success-color)] uppercase font-bold">System Admin</div>
                    </div>
                </div>
                
                {/* زر العودة للصفحة الرئيسية */}
                <button 
                    onClick={() => setCurrentView('home')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-bold text-sm transition-all border border-[var(--accent-primary)]/30"
                >
                    <IconHome size={18} />
                    <span className="hidden lg:inline">Exit to Main</span>
                </button>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
            <header className="h-20 border-b border-theme bg-theme-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10">
                {/* زر العودة للموبايل */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setCurrentView('home')}
                        className="lg:hidden p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all"
                        title="Exit to Main"
                    >
                        <IconArrowLeft size={24} />
                    </button>
                    <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-theme-main">
                        {activeView === 'overview' && "System Overview"}
                        {activeView === 'users' && "Operative Database"}
                        {activeView === 'support' && "Secure Communications"}
                        {activeView === 'broadcast' && "Emergency Broadcast"}
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--success-color)] animate-pulse"></span>
                        <span className="text-xs font-mono text-[var(--text-muted)] hidden md:inline">SYSTEM ONLINE</span>
                    </div>
                    {/* زر الخروج للديسكتوب */}
                    <button 
                        onClick={() => setCurrentView('home')}
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-muted)] hover:text-[var(--accent-primary)] font-bold text-xs transition-all border border-[var(--border-color)]"
                    >
                        <IconHome size={16} />
                        Exit Admin
                    </button>
                </div>
            </header>

            <div className="flex-1 p-6 overflow-hidden relative">
                {activeView === 'overview' && <OverviewStats />}
                {activeView === 'users' && <UsersTable />}
                {activeView === 'support' && <SupportSystem />}
                {activeView === 'broadcast' && <BroadcastSystem />}
            </div>
        </main>
    </div>
  );
}

// Nav Button Component
const NavBtn = ({ id, label, icon: Icon, active, set, badge }) => (
    <button 
        onClick={() => set(id)} 
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group ${
            active === id 
            ? 'bg-[var(--accent-color)] text-white shadow-lg' 
            : 'text-[var(--text-muted)] hover:bg-theme-hover hover:text-theme-main'
        }`}
    >
        <Icon size={20} />
        <span className="hidden lg:block font-bold text-sm">{label}</span>
        {badge > 0 && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[9px] w-5 h-5 flex items-center justify-center font-bold rounded-full shadow-md">
                {badge}
            </span>
        )}
    </button>
);

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
    <div className="p-6 rounded-2xl border border-theme bg-theme-card hover:border-[var(--accent-color)] transition-colors group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-theme-hover ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
        </div>
        <div className="text-3xl font-black text-theme-main mb-1">{value}</div>
        <div className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-widest">{title}</div>
    </div>
);
