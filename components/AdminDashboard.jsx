// FILE: components/AdminDashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, limit, addDoc } from "firebase/firestore";
import { 
  IconShield, IconBan, IconUser, IconCrown, IconStar, IconSearch, 
  IconLayoutDashboard, IconMessage2, IconSettings, IconActivity, IconCheck
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard({ currentUser, userData }) {
  const [activeView, setActiveView] = useState('users');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [broadcast, setBroadcast] = useState("");

  const isSuperAdmin = userData?.role === 'admin';

  // --- جلب البيانات الحية ---
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => 
      setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})))
    );
    const unsubLogs = onSnapshot(query(collection(db, "system_logs"), orderBy("timestamp", "desc"), limit(20)), (snap) => 
      setLogs(snap.docs.map(d => d.data()))
    );
    return () => { unsubUsers(); unsubLogs(); };
  }, []);

  // --- دوال التحكم (Core Actions) ---
  const handleRoleChange = async (userId, newRole, userEmail) => {
    if (!isSuperAdmin) return alert("Security Alert: Unauthorized Action.");
    if (!confirm(`Confirm promotion of [${userEmail}] to [${newRole.toUpperCase()}]?`)) return;
    
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      await addLog(`Changed role of ${userEmail} to ${newRole}`, "SUCCESS");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const toggleBan = async (userId, currentStatus, userEmail) => {
    if (!isSuperAdmin) return;
    await updateDoc(doc(db, "users", userId), { isBanned: !currentStatus });
    await addLog(`${!currentStatus ? 'BANNED' : 'UNBANNED'} user ${userEmail}`, "WARN");
  };

  const addLog = async (action, status) => {
    await addDoc(collection(db, "system_logs"), {
      action, status, admin: currentUser.email, timestamp: Date.now()
    });
  };

  const updateBroadcast = async () => {
    await updateDoc(doc(db, "system", "broadcast"), { message: broadcast, active: !!broadcast });
    await addLog("Updated system broadcast", "INFO");
    alert("Broadcast Deployed.");
  };

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- القائمة الجانبية ---
  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveView(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        activeView === id 
        ? 'bg-gradient-to-r from-red-900/40 to-transparent border-l-4 border-red-500 text-white' 
        : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} />
      <span className="font-bold text-sm tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="w-full h-full flex bg-[#020202] text-white overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-20 md:w-72 border-r border-white/10 bg-black/60 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shadow-[0_0_20px_#dc2626]">
            <IconShield size={24} className="text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="font-black text-lg tracking-widest leading-none">OVERWATCH</h1>
            <span className="text-[10px] text-red-400 font-mono">ADMIN SYSTEM v4.0</span>
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          <SidebarItem id="users" icon={IconUser} label="User Management" />
          <SidebarItem id="system" icon={IconActivity} label="System Health" />
          <SidebarItem id="logs" icon={IconLayoutDashboard} label="Audit Logs" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

        {activeView === 'users' && (
          <div className="space-y-6 relative z-10">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-white mb-1">OPERATIVES</h2>
                <p className="text-white/40 text-sm">Manage access levels and security clearance.</p>
              </div>
              <div className="relative w-full md:w-96">
                <IconSearch className="absolute left-4 top-3.5 text-white/30" size={18} />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search database..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-500 focus:bg-black transition-all outline-none"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/40 uppercase font-mono text-xs border-b border-white/10">
                  <tr>
                    <th className="p-5">User Identity</th>
                    <th className="p-5">Current Rank</th>
                    <th className="p-5">Security Actions</th>
                    <th className="p-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-5">
                        <div className="font-bold text-white text-base">{u.email}</div>
                        <div className="text-xs text-white/30 font-mono mt-1">ID: {u.id}</div>
                      </td>
                      
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                            u.role === 'junior' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {u.role || 'USER'}
                          </span>
                        </div>
                      </td>

                      <td className="p-5">
                        {isSuperAdmin && (
                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            {/* أزرار الترقية الصريحة */}
                            <button 
                              onClick={() => handleRoleChange(u.id, 'user', u.email)}
                              title="Demote to User"
                              className={`p-2 rounded-lg border transition-all ${u.role !== 'admin' && u.role !== 'junior' ? 'bg-white/10 border-white/30 text-white' : 'border-transparent text-white/30 hover:bg-white/10'}`}
                            >
                              <IconUser size={18} />
                            </button>
                            
                            <button 
                              onClick={() => handleRoleChange(u.id, 'junior', u.email)}
                              title="Promote to Junior Admin"
                              className={`p-2 rounded-lg border transition-all ${u.role === 'junior' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'border-transparent text-yellow-500/50 hover:bg-yellow-500/20'}`}
                            >
                              <IconStar size={18} />
                            </button>

                            <button 
                              onClick={() => handleRoleChange(u.id, 'admin', u.email)}
                              title="Promote to Super Admin"
                              className={`p-2 rounded-lg border transition-all ${u.role === 'admin' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-transparent text-red-500/50 hover:bg-red-500/20'}`}
                            >
                              <IconCrown size={18} />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="p-5 text-right">
                        <button 
                          onClick={() => toggleBan(u.id, u.isBanned, u.email)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            u.isBanned 
                            ? 'bg-red-500 text-black hover:bg-red-400' 
                            : 'bg-green-900/30 text-green-400 border border-green-500/30 hover:bg-red-900/50 hover:text-red-400 hover:border-red-500/50'
                          }`}
                        >
                          {u.isBanned ? 'UNBAN' : 'ACTIVE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'system' && (
          <div className="max-w-3xl space-y-8 relative z-10">
            <h2 className="text-3xl font-black text-white">SYSTEM CONTROL</h2>
            
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4 text-cyan-400">Global Broadcast</h3>
              <p className="text-white/50 text-sm mb-4">Send a message to all connected neural links instantly.</p>
              <textarea 
                value={broadcast} 
                onChange={e => setBroadcast(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white h-32 mb-6 focus:border-cyan-500 outline-none resize-none font-mono"
                placeholder="> Enter system message protocol..."
              />
              <div className="flex justify-end">
                <button 
                  onClick={updateBroadcast}
                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  TRANSMIT SIGNAL
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'logs' && (
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white mb-6">SYSTEM AUDIT</h2>
            <div className="space-y-2 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="glass-card p-4 rounded-lg flex items-center gap-6 border-l-4 border-l-white/20">
                  <span className="text-white/30 w-32">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    log.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 
                    log.status === 'WARN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {log.status}
                  </span>
                  <span className="flex-1 text-white/80">{log.action}</span>
                  <span className="text-white/30">{log.admin}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}