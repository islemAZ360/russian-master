"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, deleteDoc } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconShieldLock, IconUsers, IconActivity, IconLayoutDashboard, 
  IconBroadcast, IconSearch, IconMessage2, IconLogout, 
  IconTerminal2, IconCpu, IconServer, IconEye, IconBan, IconCheck, IconTrash
} from '@tabler/icons-react';

export default function AdminDashboard({ currentUser }) {
  const [isBooting, setIsBooting] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [logs, setLogs] = useState([]);

  // --- محاكاة إقلاع النظام (Boot Sequence) ---
  useEffect(() => {
    // إضافة سجلات وهمية لتبدو وكأن النظام يعمل
    addLog("SYSTEM_INIT_SEQUENCE_STARTED");
    setTimeout(() => addLog("LOADING_CORE_MODULES..."), 500);
    setTimeout(() => addLog("CONNECTING_TO_MAINFRAME..."), 1200);
    setTimeout(() => addLog("ENCRYPTION_KEY_VERIFIED"), 1800);
    setTimeout(() => {
        addLog("ACCESS_GRANTED");
        setIsBooting(false);
    }, 2500);
  }, []);

  // --- جلب البيانات من Firebase ---
  useEffect(() => {
    // 1. المستخدمين
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
      addLog(`DATA_SYNC: ${snap.docs.length} USERS LOADED`);
    });

    // 2. التذاكر
    const qTickets = query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc"));
    const unsubTickets = onSnapshot(qTickets, (snap) => {
        setTickets(snap.docs.map(d => ({id: d.id, ...d.data()})));
        addLog(`DATA_SYNC: TICKETS UPDATED`);
    });

    return () => { unsubUsers(); unsubTickets(); };
  }, []);

  // --- دوال مساعدة ---
  const addLog = (msg) => {
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const handleRoleChange = async (uid, role, email) => {
      if (email === 'islamaz@bomba.com') {
          alert("ACCESS DENIED: CANNOT MODIFY SUPREME COMMANDER.");
          return;
      }
      await updateDoc(doc(db, "users", uid), { role });
      addLog(`ACTION: ROLE_CHANGE FOR ${email} -> ${role}`);
  };
  
  const toggleBan = async (uid, currentStatus, email) => {
      if (email === 'islamaz@bomba.com') return;
      await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
      addLog(`ACTION: BAN_STATUS_CHANGED FOR ${email}`);
  };

  const deleteTicket = async (id) => {
      if(confirm("CONFIRM DELETION?")) {
        await deleteDoc(doc(db, "support_tickets", id));
        addLog(`ACTION: TICKET ${id} DELETED`);
      }
  };

  const sendBroadcast = async () => {
    if(!broadcastMsg) return;
    await updateDoc(doc(db, "system", "broadcast"), { 
        message: broadcastMsg, active: true, sentBy: currentUser.email, timestamp: new Date().toISOString()
    });
    setBroadcastMsg("");
    alert("TRANSMISSION SENT SUCCESSFULLY");
    addLog("ACTION: GLOBAL_BROADCAST_SENT");
  };

  const exitSystem = () => {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 1s ease';
      setTimeout(() => window.location.reload(), 1000);
  };

  // --- شاشة الإقلاع ---
  if (isBooting) return <BootScreen logs={logs} />;

  // --- الواجهة الرئيسية ---
  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#00ff00] font-mono overflow-hidden selection:bg-[#00ff00] selection:text-black border-4 border-[#003300]">
      
      {/* SIDEBAR */}
      <nav className="w-20 lg:w-72 border-r border-[#003300] flex flex-col bg-black/90 shrink-0 relative z-20 shadow-[10px_0_50px_rgba(0,50,0,0.1)]">
        <div className="p-6 border-b border-[#003300] flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
            <div>
                <h1 className="text-xl font-black tracking-[0.2em] text-white">
                    NEXUS<span className="text-[#00ff00]">OS</span>
                </h1>
                <p className="text-[9px] text-[#008800] mt-1">SECURE TERMINAL V4.0</p>
            </div>
        </div>

        <div className="flex-1 py-6 space-y-1 px-2">
            <div className="text-[10px] text-[#004400] mb-2 px-4">/// NAVIGATION MODULES</div>
            <NavBtn id="overview" label="COMMAND DASHBOARD" icon={IconLayoutDashboard} active={activeView} set={setActiveView} />
            <NavBtn id="users" label="OPERATIVE ROSTER" icon={IconUsers} active={activeView} set={setActiveView} />
            <NavBtn id="support" label="COMMUNICATIONS" icon={IconMessage2} active={activeView} set={setActiveView} badge={tickets.length} />
            <NavBtn id="broadcast" label="GLOBAL BROADCAST" icon={IconBroadcast} active={activeView} set={setActiveView} />
        </div>

        {/* LOG TERMINAL MINI */}
        <div className="h-32 border-t border-[#003300] bg-black p-2 overflow-hidden text-[9px] text-[#005500] font-mono opacity-50 hidden lg:block">
            {logs.map((log, i) => <div key={i} className="truncate">{log}</div>)}
        </div>

        <button onClick={exitSystem} className="p-4 border-t border-[#003300] hover:bg-red-900/20 text-red-500 flex items-center justify-center lg:justify-start gap-3 transition-all font-bold hover:tracking-widest">
            <IconLogout size={20} />
            <span className="hidden lg:block">TERMINATE SESSION</span>
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_center,#0a1a0a_0%,#000000_100%)]">
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

        {/* Top Header */}
        <header className="h-16 border-b border-[#003300] flex items-center justify-between px-8 bg-black/40 relative z-10 backdrop-blur-sm">
            <div className="flex gap-8 text-xs text-[#006600] font-bold">
                <div className="flex items-center gap-2"><IconServer size={14} className="text-[#00ff00]"/> SERVER: ONLINE</div>
                <div className="flex items-center gap-2"><IconCpu size={14}/> CPU: 4%</div>
                <div className="flex items-center gap-2"><IconActivity size={14}/> MEM: 64TB</div>
            </div>
            <div className="text-right flex items-center gap-4">
                <div>
                    <div className="text-xs font-bold text-white tracking-wider">{currentUser.email.toUpperCase()}</div>
                    <div className="text-[9px] text-[#00ff00]">SUPREME COMMANDER</div>
                </div>
                <div className="w-8 h-8 border border-[#00ff00] flex items-center justify-center bg-[#00ff00]/10">
                    <IconShieldLock size={16} />
                </div>
            </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
            
            <AnimatePresence mode="wait">
                {activeView === 'overview' && (
                    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KpiCard title="TOTAL OPERATIVES" value={users.length} icon={IconUsers} />
                            <KpiCard title="OPEN TICKETS" value={tickets.length} icon={IconMessage2} warning={tickets.length > 0} />
                            <KpiCard title="SYSTEM XP" value={users.reduce((a,b)=>a+(b.xp||0),0)} icon={IconActivity} />
                            <KpiCard title="BANNED UNITS" value={users.filter(u=>u.isBanned).length} icon={IconBan} danger />
                        </div>
                        
                        <div className="border border-[#003300] bg-black/60 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-20"><IconTerminal2 size={100}/></div>
                            <h3 className="text-lg font-bold mb-4 text-white border-b border-[#003300] pb-2 inline-block">LIVE SYSTEM LOGS</h3>
                            <div className="font-mono text-xs text-[#00aa00] space-y-1 h-64 overflow-y-auto custom-scrollbar">
                                {logs.map((log, i) => <div key={i} className="border-l-2 border-[#003300] pl-2">{log}</div>)}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeView === 'users' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
                        <div className="flex justify-between items-center bg-[#001100] border border-[#003300] p-4">
                            <h2 className="text-xl font-bold text-white tracking-widest">OPERATIVE DATABASE</h2>
                            <div className="relative">
                                <IconSearch className="absolute right-3 top-2.5 text-[#005500]" size={16}/>
                                <input className="bg-black border border-[#004400] text-[#00ff00] pl-4 pr-10 py-2 w-64 focus:border-[#00ff00] outline-none text-sm placeholder:text-[#004400]" placeholder="SEARCH ID..." />
                            </div>
                        </div>
                        <div className="grid gap-1">
                            {users.map((u) => (
                                <div key={u.id} className="flex items-center justify-between p-3 bg-black/80 border-l-2 border-[#003300] hover:border-[#00ff00] hover:bg-[#001a00] transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1.5 h-1.5 ${u.isBanned ? 'bg-red-500 box-shadow-red' : 'bg-[#00ff00] box-shadow-green'}`}></div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{u.email}</div>
                                            <div className="text-[10px] text-[#006600] font-mono">{u.id}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-xs font-mono text-[#008800]">{u.xp} XP</span>
                                        <select 
                                            value={u.role || 'user'} 
                                            onChange={(e) => handleRoleChange(u.id, e.target.value, u.email)}
                                            className="bg-black border border-[#004400] text-xs py-1 px-2 text-white focus:border-[#00ff00] outline-none uppercase"
                                            disabled={u.email === 'islamaz@bomba.com'}
                                        >
                                            <option value="user">USER</option>
                                            <option value="admin">ADMIN</option>
                                            <option value="master">MASTER</option>
                                        </select>
                                        
                                        {u.email !== 'islamaz@bomba.com' && (
                                            <button 
                                                onClick={() => toggleBan(u.id, u.isBanned, u.email)}
                                                className={`p-1.5 border ${u.isBanned ? 'border-green-500 text-green-500' : 'border-red-900 text-red-700 hover:text-red-500 hover:border-red-500'} transition-all`}
                                                title={u.isBanned ? "REVOKE BAN" : "EXECUTE BAN"}
                                            >
                                                {u.isBanned ? <IconCheck size={14} /> : <IconBan size={14} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeView === 'support' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid gap-4">
                        {tickets.length === 0 ? (
                            <div className="text-center py-20 text-[#004400] text-xl">NO ACTIVE TRANSMISSIONS</div>
                        ) : (
                            tickets.map(t => (
                                <div key={t.id} className="bg-black border border-[#003300] p-4 flex flex-col md:flex-row gap-4 hover:border-[#005500] transition-all">
                                    <div className="md:w-1/4 border-l-2 border-[#00ff00] pl-3">
                                        <div className="text-white font-bold">{t.userEmail}</div>
                                        <div className="text-[10px] text-[#006600]">{new Date(t.lastUpdate).toLocaleString()}</div>
                                        <div className="mt-2 text-xs bg-[#002200] inline-block px-2 py-0.5 text-[#00ff00] border border-[#004400]">{t.status}</div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-[#050505] p-3 text-sm text-[#00dd00] h-32 overflow-y-auto mb-2 font-mono border border-[#002200]">
                                            {t.messages?.map((m, i) => (
                                                <div key={i} className={`mb-1 ${m.sender === 'user' ? 'text-white' : 'text-[#00ff00] text-right'}`}>
                                                    <span className="opacity-50 mr-2">[{m.sender === 'user' ? 'IN' : 'OUT'}]:</span>
                                                    {m.text}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => deleteTicket(t.id)} className="text-red-700 hover:text-red-500 text-xs flex items-center gap-1"><IconTrash size={12}/> PURGE</button>
                                            <button onClick={()=>alert('REPLY SYSTEM LOADING...')} className="bg-[#003300] text-white px-4 py-1 text-xs hover:bg-[#005500]">RESPOND</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}

                {activeView === 'broadcast' && (
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="max-w-2xl mx-auto mt-10">
                        <div className="bg-black border-2 border-red-900 p-1 relative">
                            {/* Danger Stripes */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,#330000,#330000_10px,#ff0000_10px,#ff0000_20px)] opacity-50"></div>
                            <div className="absolute bottom-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,#330000,#330000_10px,#ff0000_10px,#ff0000_20px)] opacity-50"></div>
                            
                            <div className="p-8 border border-red-900/30 bg-[#050000]">
                                <h2 className="text-3xl font-black text-red-600 mb-6 flex items-center gap-3 tracking-tighter">
                                    <IconBroadcast size={32} className="animate-pulse"/> EMERGENCY BROADCAST
                                </h2>
                                <p className="text-red-900 text-xs mb-1 uppercase">Transmission Message:</p>
                                <textarea 
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    className="w-full h-40 bg-black border border-red-900/50 p-4 text-red-50 focus:border-red-500 outline-none font-mono mb-6 resize-none"
                                    placeholder="ENTER SYSTEM-WIDE ALERT..."
                                />
                                <button 
                                    onClick={sendBroadcast}
                                    disabled={!broadcastMsg}
                                    className="w-full py-4 bg-red-900/20 border border-red-600 text-red-500 font-black tracking-[0.3em] hover:bg-red-600 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    TRANSMIT SIGNAL
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
      </main>
    </div>
  );
}

// --- Sub Components ---

const NavBtn = ({ id, label, icon: Icon, active, set, badge }) => (
    <button 
        onClick={() => set(id)}
        className={`w-full flex items-center gap-4 px-6 py-3 transition-all relative group ${active === id ? 'bg-[#003300] text-white border-l-4 border-[#00ff00]' : 'text-[#005500] hover:text-[#00aa00] hover:bg-[#001100]'}`}
    >
        <Icon size={18} className={active === id ? "text-[#00ff00]" : "text-[#004400] group-hover:text-[#008800]"} />
        <span className="text-[10px] font-bold tracking-[0.2em]">{label}</span>
        {badge > 0 && <span className="absolute right-4 bg-red-600 text-white text-[9px] w-5 h-5 flex items-center justify-center font-bold">{badge}</span>}
    </button>
);

const KpiCard = ({ title, value, icon: Icon, warning, danger }) => (
    <div className={`p-6 bg-black border relative overflow-hidden group ${danger ? 'border-red-900 text-red-500' : warning ? 'border-yellow-900 text-yellow-500' : 'border-[#003300] text-[#00ff00]'}`}>
        <div className="flex justify-between items-start mb-2">
            <Icon size={28} className="opacity-50" />
            <div className={`text-4xl font-black ${danger ? 'text-red-600' : warning ? 'text-yellow-600' : 'text-white'}`}>{value}</div>
        </div>
        <div className="text-[9px] tracking-[0.3em] uppercase opacity-70 border-t border-current pt-2 mt-2">{title}</div>
        <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-5 transition-opacity"></div>
    </div>
);

const BootScreen = ({ logs }) => (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center font-mono text-[#00ff00] p-4">
        <div className="w-full max-w-2xl border border-[#003300] p-1 bg-[#050505]">
            <div className="bg-[#001100] p-2 flex justify-between items-center border-b border-[#003300] mb-2">
                <span className="text-xs font-bold">NEXUS_BOOT_LOADER_V4.0</span>
                <div className="flex gap-1"><div className="w-2 h-2 bg-[#00ff00]"></div><div className="w-2 h-2 bg-[#00ff00] opacity-50"></div></div>
            </div>
            <div className="h-64 overflow-hidden flex flex-col justify-end p-4 space-y-1 text-xs opacity-80">
                {logs.slice().reverse().map((log, i) => (
                    <div key={i} className="font-mono">{log}</div>
                ))}
            </div>
            <div className="h-2 w-full bg-[#002200] mt-2 relative overflow-hidden">
                <motion.div 
                    initial={{x:"-100%"}} 
                    animate={{x:"100%"}} 
                    transition={{duration:1.5, repeat:Infinity, ease:"linear"}} 
                    className="absolute top-0 left-0 w-1/3 h-full bg-[#00ff00] opacity-50"
                />
            </div>
        </div>
    </div>
);