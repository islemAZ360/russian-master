"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { motion } from 'framer-motion';
import { 
  IconShieldLock, IconUsers, IconActivity, IconTerminal2, 
  IconBroadcast, IconSearch, IconMessage2, IconLogout, 
  IconBan, IconCheck, IconServer, IconCpu, IconEye
} from '@tabler/icons-react';

export default function AdminDashboard({ currentUser }) {
  const [booting, setBooting] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  
  // تأثير الإقلاع (Boot Sequence)
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2500);
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

  const sendBroadcast = async () => {
    if(!broadcastMsg) return;
    await updateDoc(doc(db, "system", "broadcast"), { 
        message: broadcastMsg, active: true, sentBy: currentUser.email, timestamp: new Date().toISOString()
    });
    setBroadcastMsg("");
    alert("SYSTEM: Broadcast Transmitted Successfully.");
  };

  const exitSystem = () => {
      // تأثير خروج
      document.body.style.opacity = '0';
      setTimeout(() => window.location.reload(), 1000);
  };

  // شاشة الإقلاع (Boot Screen)
  if (booting) return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center font-mono text-green-500 p-8">
          <div className="w-full max-w-lg space-y-2">
              <p className="text-xs">INITIALIZING KERNEL...</p>
              <div className="w-full h-1 bg-green-900"><motion.div initial={{width:0}} animate={{width:"100%"}} transition={{duration:1}} className="h-full bg-green-500"/></div>
              <p className="text-xs">LOADING SECURE MODULES...</p>
              <div className="w-full h-1 bg-green-900"><motion.div initial={{width:0}} animate={{width:"100%"}} transition={{duration:1.5, delay:0.5}} className="h-full bg-green-500"/></div>
              <p className="text-xs">ESTABLISHING UPLINK...</p>
              <div className="w-full h-1 bg-green-900"><motion.div initial={{width:0}} animate={{width:"100%"}} transition={{duration:0.5, delay:2}} className="h-full bg-green-500"/></div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.2}} className="text-center mt-4 text-xl font-black text-white bg-green-600 px-4 py-1">
                  ACCESS GRANTED
              </motion.div>
          </div>
      </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#050505] text-green-500 font-mono overflow-hidden selection:bg-green-500 selection:text-black border-4 border-green-900/30">
      
      {/* SIDEBAR */}
      <nav className="w-64 border-r border-green-900/30 flex flex-col bg-black/50 backdrop-blur-sm shrink-0 relative z-20">
        <div className="p-6 border-b border-green-900/30">
            <h1 className="text-xl font-black tracking-[0.2em] text-white flex items-center gap-2">
                <IconShieldLock className="text-green-500" />
                ADMIN<span className="text-green-700">OS</span>
            </h1>
            <p className="text-[10px] text-green-700 mt-1">SECURE TERMINAL V2.4</p>
        </div>

        <div className="flex-1 py-4 space-y-1 px-2">
            <NavBtn id="overview" label="DASHBOARD" icon={IconActivity} active={activeView} set={setActiveView} />
            <NavBtn id="users" label="OPERATIVES" icon={IconUsers} active={activeView} set={setActiveView} />
            <NavBtn id="support" label="COMMS LINK" icon={IconMessage2} active={activeView} set={setActiveView} badge={tickets.length} />
            <NavBtn id="broadcast" label="BROADCAST" icon={IconBroadcast} active={activeView} set={setActiveView} />
        </div>

        <div className="p-4 border-t border-green-900/30">
            <button onClick={exitSystem} className="w-full py-3 bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-500 hover:text-black transition-all font-bold flex items-center justify-center gap-2 group">
                <IconLogout size={18} className="group-hover:-translate-x-1 transition-transform"/> EXIT SYSTEM
            </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

        {/* Top Bar */}
        <header className="h-16 border-b border-green-900/30 flex items-center justify-between px-8 bg-black/40 relative z-10">
            <div className="flex gap-6 text-xs text-green-700">
                <div className="flex items-center gap-2"><IconServer size={14} className="animate-pulse"/> SERVER_STATUS: ONLINE</div>
                <div className="flex items-center gap-2"><IconCpu size={14}/> CPU_LOAD: 14%</div>
            </div>
            <div className="text-right">
                <div className="text-xs font-bold text-white">{currentUser.email}</div>
                <div className="text-[10px] text-green-600">SUPREME_COMMANDER</div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
            
            {activeView === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-5 fade-in duration-500">
                    <KpiCard title="TOTAL UNITS" value={users.length} icon={IconUsers} />
                    <KpiCard title="OPEN TICKETS" value={tickets.length} icon={IconMessage2} warning={tickets.length > 0} />
                    <KpiCard title="SYSTEM XP" value={users.reduce((a,b)=>a+(b.xp||0),0)} icon={IconActivity} />
                    <KpiCard title="BANNED" value={users.filter(u=>u.isBanned).length} icon={IconBan} danger />
                </div>
            )}

            {activeView === 'users' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center bg-black/40 border border-green-900/30 p-4">
                        <h2 className="text-xl font-bold text-white">OPERATIVE DATABASE</h2>
                        <div className="relative">
                            <IconSearch className="absolute right-3 top-2.5 text-green-700" size={16}/>
                            <input className="bg-black border border-green-900/50 text-green-500 pl-4 pr-10 py-2 w-64 focus:border-green-500 outline-none placeholder:text-green-900" placeholder="SEARCH ID..." />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        {users.map((u, i) => (
                            <div key={u.id} className="flex items-center justify-between p-4 bg-black/60 border border-green-900/20 hover:border-green-500/50 transition-colors group">
                                <div>
                                    <div className="font-bold text-white">{u.email}</div>
                                    <div className="text-[10px] text-green-800 font-mono">{u.id}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs bg-green-900/20 px-2 py-1 border border-green-900/30">{u.role || 'USER'}</span>
                                    <span className="font-mono text-yellow-500">{u.xp} XP</span>
                                    <button className="p-2 hover:bg-green-500 hover:text-black transition-colors border border-green-900/30"><IconEye size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeView === 'broadcast' && (
                <div className="max-w-2xl mx-auto mt-10">
                    <div className="bg-black/80 border-2 border-red-900/50 p-8 shadow-[0_0_50px_rgba(220,38,38,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse"></div>
                        <h2 className="text-2xl font-black text-red-500 mb-6 flex items-center gap-3"><IconBroadcast/> EMERGENCY BROADCAST</h2>
                        <textarea 
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            className="w-full h-40 bg-[#110505] border border-red-900/30 p-4 text-red-100 focus:border-red-500 outline-none font-mono mb-4 resize-none"
                            placeholder="ENTER SYSTEM-WIDE MESSAGE..."
                        />
                        <button onClick={sendBroadcast} className="w-full py-4 bg-red-600 text-black font-black tracking-[0.2em] hover:bg-red-500 transition-colors">
                            TRANSMIT SIGNAL
                        </button>
                    </div>
                </div>
            )}

        </div>
      </main>
    </div>
  );
}

const NavBtn = ({ id, label, icon: Icon, active, set, badge }) => (
    <button 
        onClick={() => set(id)}
        className={`w-full flex items-center gap-4 px-6 py-3 transition-all relative ${active === id ? 'bg-green-500/10 text-green-400 border-l-2 border-green-500' : 'text-green-800 hover:text-green-500 hover:bg-green-500/5'}`}
    >
        <Icon size={18} />
        <span className="text-xs font-bold tracking-widest">{label}</span>
        {badge > 0 && <span className="absolute right-4 bg-red-500 text-black text-[10px] w-5 h-5 flex items-center justify-center font-bold rounded-full">{badge}</span>}
    </button>
);

const KpiCard = ({ title, value, icon: Icon, warning, danger }) => (
    <div className={`p-6 bg-black/60 border ${danger ? 'border-red-900/50 text-red-500' : warning ? 'border-yellow-900/50 text-yellow-500' : 'border-green-900/30 text-green-500'} relative overflow-hidden group`}>
        <div className="flex justify-between items-start mb-4">
            <Icon size={24} />
            <div className={`text-3xl font-black text-white`}>{value}</div>
        </div>
        <div className="text-[10px] tracking-[0.2em] opacity-60">{title}</div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-current opacity-20 group-hover:opacity-100 transition-opacity"></div>
    </div>
);