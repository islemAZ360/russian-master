"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconShieldLock, IconUsers, IconActivity, IconLayoutDashboard, 
  IconBroadcast, IconSearch, IconMessage2, IconLogout, 
  IconTerminal2, IconCpu, IconServer, IconEye, IconBan, IconCheck
} from '@tabler/icons-react';

export default function AdminDashboard({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");

  // محاكاة تحميل النظام (System Boot)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // جلب البيانات
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => 
      setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})))
    );
    const qTickets = query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc"));
    const unsubTickets = onSnapshot(qTickets, (snap) => 
        setTickets(snap.docs.map(d => ({id: d.id, ...d.data()})))
    );
    return () => { unsubUsers(); unsubTickets(); };
  }, []);

  // Actions
  const handleRoleChange = async (uid, role) => {
      await updateDoc(doc(db, "users", uid), { role });
  };
  
  const toggleBan = async (uid, currentStatus) => {
      await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
  };

  const sendBroadcast = async () => {
    if(!broadcastMsg) return;
    await updateDoc(doc(db, "system", "broadcast"), { 
        message: broadcastMsg, active: true, sentBy: currentUser.email, timestamp: new Date().toISOString()
    });
    setBroadcastMsg("");
    alert("TRANSMISSION SENT");
  };

  // زر الخروج: يقوم فقط بإعادة تحميل الصفحة لإعادة المستخدم للواجهة الرئيسية
  const exitAdminMode = () => {
      window.location.reload();
  };

  if (loading) return <BootSequence />;

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white font-mono overflow-hidden selection:bg-green-500/30">
      
      {/* SIDEBAR NAVIGATION */}
      <nav className="w-20 lg:w-64 border-r border-white/10 flex flex-col bg-[#0a0a0a] shrink-0">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
            <IconShieldLock className="text-red-500 w-8 h-8" />
            <span className="hidden lg:block ml-3 font-bold tracking-widest text-lg">NEXUS<span className="text-red-500">ADMIN</span></span>
        </div>

        <div className="flex-1 py-6 space-y-2">
            <NavBtn id="overview" icon={IconLayoutDashboard} label="DASHBOARD" active={activeView} set={setActiveView} />
            <NavBtn id="users" icon={IconUsers} label="OPERATIVES" active={activeView} set={setActiveView} />
            <NavBtn id="support" icon={IconMessage2} label="COMMS LINK" active={activeView} set={setActiveView} badge={tickets.length} />
            <NavBtn id="broadcast" icon={IconBroadcast} label="BROADCAST" active={activeView} set={setActiveView} />
        </div>

        <button onClick={exitAdminMode} className="p-4 border-t border-white/10 hover:bg-red-900/20 text-red-500 flex items-center justify-center lg:justify-start gap-3 transition-colors">
            <IconLogout size={20} />
            <span className="hidden lg:block font-bold">DISCONNECT</span>
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md">
            <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-2"><IconServer size={14}/> SERVER: ONLINE</span>
                <span className="w-1 h-4 bg-white/10"></span>
                <span className="flex items-center gap-2"><IconCpu size={14}/> CPU: STABLE</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                    <div className="text-sm font-bold text-white">{currentUser.email}</div>
                    <div className="text-[10px] text-red-500 tracking-widest uppercase">Supreme Commander</div>
                </div>
                <div className="w-10 h-10 bg-red-900/20 border border-red-500/50 rounded-full flex items-center justify-center text-red-500 font-bold">
                    {currentUser.email[0].toUpperCase()}
                </div>
            </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {activeView === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KpiCard title="TOTAL OPERATIVES" value={users.length} icon={IconUsers} color="text-blue-400" />
                        <KpiCard title="ACTIVE TICKETS" value={tickets.length} icon={IconMessage2} color="text-yellow-400" />
                        <KpiCard title="SYSTEM LOAD" value="12%" icon={IconActivity} color="text-green-400" />
                        <KpiCard title="BANNED UNITS" value={users.filter(u=>u.isBanned).length} icon={IconBan} color="text-red-500" />
                    </div>
                    
                    <div className="border border-white/10 bg-[#0f0f0f] rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><IconTerminal2 size={20} className="text-green-500"/> SYSTEM LOGS</h3>
                        <div className="font-mono text-xs text-green-500/60 space-y-1 h-48 overflow-hidden relative">
                            <p>&gt; System initialized at {new Date().toLocaleTimeString()}</p>
                            <p>&gt; Secure connection established via port 443</p>
                            <p>&gt; Database synchronized: {users.length} records updated</p>
                            <p>&gt; Neural interface active. Waiting for input...</p>
                            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#0f0f0f] to-transparent"></div>
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'users' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center bg-[#0f0f0f] p-4 rounded-lg border border-white/10">
                        <h2 className="text-xl font-bold">OPERATIVE DATABASE</h2>
                        <div className="relative">
                            <IconSearch className="absolute left-3 top-2.5 text-white/30" size={16} />
                            <input placeholder="SEARCH ID..." className="bg-black border border-white/20 rounded pl-10 pr-4 py-2 text-sm text-white focus:border-red-500 outline-none w-64" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        {users.map(u => (
                            <div key={u.id} className="group flex items-center justify-between p-4 bg-[#0a0a0a] border border-white/5 hover:border-white/20 hover:bg-[#111] transition-all rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${u.isBanned ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <div>
                                        <div className="font-bold text-white">{u.email}</div>
                                        <div className="text-[10px] text-white/40 font-mono">UID: {u.id}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-xs text-white/40 uppercase">XP Level</div>
                                        <div className="font-mono text-yellow-500">{u.xp || 0}</div>
                                    </div>
                                    
                                    <select 
                                        value={u.role || 'user'} 
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        className="bg-black border border-white/20 text-xs py-1 px-2 rounded focus:border-blue-500 outline-none"
                                        disabled={u.email === 'islamaz@bomba.com'}
                                    >
                                        <option value="user">USER</option>
                                        <option value="admin">ADMIN</option>
                                    </select>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => toggleBan(u.id, u.isBanned)}
                                            className={`p-2 rounded border ${u.isBanned ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'} hover:bg-white/5`}
                                            title={u.isBanned ? "Unban" : "Ban"}
                                        >
                                            {u.isBanned ? <IconCheck size={16} /> : <IconBan size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeView === 'broadcast' && (
                <div className="max-w-2xl mx-auto mt-10">
                    <div className="bg-[#0f0f0f] border border-red-500/30 p-8 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                        <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2"><IconBroadcast className="text-red-500"/> GLOBAL ALERT SYSTEM</h2>
                        <p className="text-white/40 text-sm mb-6">This message will be transmitted to all connected neural links immediately.</p>
                        
                        <textarea 
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            className="w-full h-32 bg-black border border-white/20 rounded-lg p-4 text-white focus:border-red-500 outline-none mb-4 font-mono"
                            placeholder="TYPE SYSTEM MESSAGE HERE..."
                        />
                        
                        <button 
                            onClick={sendBroadcast}
                            disabled={!broadcastMsg}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            INITIATE BROADCAST
                        </button>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

// --- Components ---

const NavBtn = ({ id, icon: Icon, label, active, set, badge }) => (
    <button 
        onClick={() => set(id)}
        className={`w-full flex items-center justify-center lg:justify-start gap-4 px-6 py-4 transition-all relative ${active === id ? 'text-white bg-white/5 border-r-2 border-red-500' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
    >
        <Icon size={20} />
        <span className="hidden lg:block font-bold text-xs tracking-widest">{label}</span>
        {badge > 0 && <span className="absolute top-2 right-2 lg:top-auto lg:right-4 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">{badge}</span>}
    </button>
);

const KpiCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-[#0f0f0f] border border-white/10 p-6 rounded-xl flex items-center gap-4 hover:border-white/20 transition-colors group">
        <div className={`p-3 bg-white/5 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div>
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">{title}</div>
        </div>
    </div>
);

const BootSequence = () => (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center font-mono text-green-500">
        <IconShieldLock size={64} className="mb-6 animate-pulse" />
        <div className="text-2xl font-black mb-2">ACCESSING SECURE MAINFRAME</div>
        <div className="w-64 h-1 bg-green-900/30 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: "100%" }} 
                transition={{ duration: 2 }}
                className="h-full bg-green-500"
            />
        </div>
        <div className="mt-4 text-xs opacity-50">verifying credentials...</div>
    </div>
);