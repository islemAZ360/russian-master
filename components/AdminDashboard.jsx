"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, addDoc } from "firebase/firestore";
import { 
  IconShield, IconUser, IconActivity, IconChartBar, 
  IconBroadcast, IconSearch, IconCpu 
} from '@tabler/icons-react';

export default function AdminDashboard({ currentUser }) {
  const [activeView, setActiveView] = useState('overview'); // overview, users, system
  const [users, setUsers] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");

  // جلب البيانات
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => 
      setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})))
    );
    return () => unsub();
  }, []);

  // دالة إرسال البث
  const sendBroadcast = async () => {
    if(!broadcastMsg) return;
    await updateDoc(doc(db, "system", "broadcast"), { message: broadcastMsg, active: true });
    alert("Signal Transmitted!");
    setBroadcastMsg("");
  };

  // --- مكونات الرسوم البيانية البسيطة (SVG) ---
  const ActivityChart = () => (
    <div className="h-40 flex items-end gap-2 mt-4 pb-2 border-b border-white/10">
      {[40, 70, 30, 80, 50, 90, 60, 40, 70, 95].map((h, i) => (
        <div key={i} className="flex-1 bg-[var(--neon-primary)]/20 hover:bg-[var(--neon-primary)] transition-all rounded-t-sm relative group" style={{height: `${h}%`}}>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/20 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{h}%</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[var(--bg-deep)] text-white overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white/5 border-r border-white/10 flex flex-col p-4 gap-2">
        <div className="p-4 mb-4 border-b border-white/10">
            <h2 className="font-black text-xl tracking-widest text-[var(--neon-primary)]">OVERWATCH</h2>
            <p className="text-[10px] text-white/40 uppercase">Admin Console v2.0</p>
        </div>
        <MenuBtn id="overview" icon={IconChartBar} label="Analytics" active={activeView} set={setActiveView} />
        <MenuBtn id="users" icon={IconUser} label="Operatives" active={activeView} set={setActiveView} />
        <MenuBtn id="system" icon={IconBroadcast} label="Comms" active={activeView} set={setActiveView} />
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        
        {activeView === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <h1 className="text-3xl font-black">SYSTEM METRICS</h1>
                
                {/* Cards */}
                <div className="grid grid-cols-3 gap-6">
                    <StatCard title="Active Users" value={users.length} icon={IconUser} color="text-blue-400" />
                    <StatCard title="Total XP" value={users.reduce((a,b) => a + (b.xp||0), 0)} icon={IconActivity} color="text-green-400" />
                    <StatCard title="System Load" value="12%" icon={IconCpu} color="text-red-400" />
                </div>

                {/* Chart Section */}
                <div className="p-6 glass-card rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white mb-2">Network Traffic</h3>
                    <ActivityChart />
                </div>
            </div>
        )}

        {activeView === 'users' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black">OPERATIVE LIST</h1>
                    <div className="relative">
                        <IconSearch className="absolute left-3 top-2.5 text-white/30" size={18} />
                        <input placeholder="Search ID..." className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 outline-none focus:border-[var(--neon-primary)]" />
                    </div>
                </div>
                <div className="glass-card rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-white/40 uppercase font-mono text-xs">
                            <tr><th className="p-4">User</th><th className="p-4">Rank</th><th className="p-4">XP</th><th className="p-4 text-right">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-white/5">
                                    <td className="p-4 font-bold">{u.email}</td>
                                    <td className="p-4 text-[var(--neon-secondary)]">{u.role || 'Agent'}</td>
                                    <td className="p-4 font-mono">{u.xp || 0}</td>
                                    <td className="p-4 text-right"><span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">ONLINE</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeView === 'system' && (
            <div className="max-w-2xl space-y-6">
                <h1 className="text-3xl font-black text-red-500">GLOBAL BROADCAST</h1>
                <div className="p-6 glass-card rounded-2xl border border-red-500/30 bg-red-900/5">
                    <textarea 
                        value={broadcastMsg}
                        onChange={e => setBroadcastMsg(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white h-32 mb-4 focus:border-red-500 outline-none"
                        placeholder="ENTER SYSTEM ALERT MESSAGE..."
                    />
                    <button onClick={sendBroadcast} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all">
                        TRANSMIT SIGNAL
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

const MenuBtn = ({ id, icon: Icon, label, active, set }) => (
    <button onClick={() => set(id)} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${active === id ? 'bg-[var(--neon-primary)] text-black font-bold' : 'text-white/60 hover:bg-white/10'}`}>
        <Icon size={20} /> <span>{label}</span>
    </button>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="p-6 glass-card rounded-2xl border border-white/10 flex items-center gap-4">
        <div className={`p-4 rounded-xl bg-white/5 ${color}`}><Icon size={32}/></div>
        <div>
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-xs text-white/40 uppercase tracking-wider">{title}</div>
        </div>
    </div>
);