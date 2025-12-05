"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, where, getDocs } from "firebase/firestore";
import { 
  IconShield, IconBan, IconUser, IconMessage, IconCheck, IconX, IconCrown, 
  IconStar, IconChartBar, IconSearch, IconAlertTriangle, IconActivity 
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function AdminDashboard({ currentUser, userData }) {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [supportTickets, setSupportTickets] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0, banned: 0 });

  const isSuperAdmin = userData?.role === 'admin';

  useEffect(() => {
    // مراقبة المستخدمين
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        const usersList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(usersList);
        setStats({
            totalUsers: usersList.length,
            activeToday: usersList.filter(u => u.lastLogin && new Date(u.lastLogin).getDate() === new Date().getDate()).length,
            banned: usersList.filter(u => u.isBanned).length
        });
    });

    // مراقبة التذاكر
    const unsubSupport = onSnapshot(query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc")), (snap) => {
        setSupportTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubUsers(); unsubSupport(); };
  }, []);

  const handleBroadcast = async () => {
      await updateDoc(doc(db, "system", "broadcast"), { message: broadcastMsg, active: !!broadcastMsg });
      alert("System Broadcast Updated");
  };

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full h-full flex flex-col bg-[#050505] text-white overflow-hidden relative">
      {/* Top Bar */}
      <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-500"><IconShield size={24}/></div>
            <h1 className="text-xl font-black tracking-[0.2em]">GOD MODE</h1>
        </div>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
            {['overview', 'users', 'support', 'system'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <StatCard title="Total Operatives" value={stats.totalUsers} icon={IconUser} color="text-cyan-400" />
                <StatCard title="Active Today" value={stats.activeToday} icon={IconActivity} color="text-green-400" />
                <StatCard title="Banned Units" value={stats.banned} icon={IconBan} color="text-red-400" />
                
                {/* Mock Chart Area */}
                <div className="md:col-span-3 h-64 glass-panel rounded-2xl p-6 flex items-end justify-between gap-2 mt-4 relative overflow-hidden">
                    <div className="absolute top-4 left-4 font-bold text-white/50 text-xs uppercase">Network Traffic (7 Days)</div>
                    {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="w-full bg-gradient-to-t from-red-900/50 to-red-500/50 rounded-t-lg transition-all hover:opacity-100 opacity-70" style={{ height: `${h}%` }}></div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-white/10 flex gap-4">
                    <div className="relative flex-1">
                        <IconSearch className="absolute left-3 top-3 text-white/30" size={18} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by email..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:border-red-500 outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-white/40 uppercase sticky top-0 backdrop-blur-md">
                            <tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">XP</th><th className="p-4">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono">{u.email}</td>
                                    <td className="p-4"><Badge role={u.role} /></td>
                                    <td className="p-4 text-cyan-400 font-bold">{u.xp || 0}</td>
                                    <td className="p-4 flex gap-2">
                                        {isSuperAdmin && (
                                            <>
                                                <ActionBtn icon={IconCrown} onClick={() => confirm(`Promote ${u.email}?`) && updateDoc(doc(db,"users",u.id),{role:'admin'})} color="text-yellow-500" />
                                                <ActionBtn icon={IconBan} onClick={() => updateDoc(doc(db,"users",u.id),{isBanned:!u.isBanned})} color={u.isBanned ? "text-green-500" : "text-red-500"} />
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'system' && (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><IconAlertTriangle className="text-yellow-500"/> Emergency Broadcast</h3>
                    <textarea 
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white h-32 mb-4 focus:border-red-500 outline-none"
                        placeholder="Type system-wide alert message..."
                    />
                    <button onClick={handleBroadcast} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_#dc2626]">
                        DEPLOY MESSAGE
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
        <div>
            <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{title}</div>
            <div className="text-4xl font-black text-white">{value}</div>
        </div>
        <div className={`p-4 rounded-xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={32} />
        </div>
    </div>
);

const Badge = ({ role }) => {
    const colors = { admin: "bg-red-500/20 text-red-400", junior: "bg-yellow-500/20 text-yellow-400", user: "bg-gray-500/20 text-gray-400" };
    return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[role] || colors.user}`}>{role || 'USER'}</span>
};

const ActionBtn = ({ icon: Icon, onClick, color }) => (
    <button onClick={onClick} className={`p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors ${color}`}><Icon size={16}/></button>
);