// FILE: components/AdminDashboard.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, limit, addDoc } from "firebase/firestore";
import { 
  IconShield, IconBan, IconUser, IconTerminal, IconActivity, IconSearch, 
  IconServer, IconAlertTriangle, IconDatabase, IconClock 
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function AdminDashboard({ currentUser, userData }) {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState(["> System Initialized.", "> Awaiting input..."]);
  const [cmdInput, setCmdInput] = useState("");
  const terminalEndRef = useRef(null);

  // Real-time Listeners
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setUsers(snap.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsubLogs = onSnapshot(query(collection(db, "system_logs"), orderBy("timestamp", "desc"), limit(20)), (snap) => setLogs(snap.docs.map(d => d.data())));
    return () => { unsubUsers(); unsubLogs(); };
  }, []);

  // Terminal Logic
  const executeCommand = async (e) => {
    if (e.key !== 'Enter') return;
    const cmd = cmdInput.trim().toLowerCase();
    const newOutput = [...terminalOutput, `$ ${cmdInput}`];
    
    if (cmd === 'clear') {
        setTerminalOutput(["> Terminal Cleared."]);
    } else if (cmd === 'status') {
        newOutput.push(`> System Status: ONLINE`, `> Users: ${users.length}`, `> Latency: 24ms`);
        setTerminalOutput(newOutput);
    } else if (cmd.startsWith('ban ')) {
        const email = cmd.split(' ')[1];
        const target = users.find(u => u.email === email);
        if (target) {
            await updateDoc(doc(db, "users", target.id), { isBanned: true });
            newOutput.push(`> SUCCESS: User ${email} has been banned.`);
        } else {
            newOutput.push(`> ERROR: User not found.`);
        }
        setTerminalOutput(newOutput);
    } else {
        newOutput.push(`> Unknown command: ${cmd}`);
        setTerminalOutput(newOutput);
    }
    setCmdInput("");
    setTimeout(() => terminalEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const navItems = [
    { id: 'overview', icon: IconActivity, label: 'Overview' },
    { id: 'users', icon: IconUser, label: 'Operatives' },
    { id: 'terminal', icon: IconTerminal, label: 'Console' },
    { id: 'logs', icon: IconClock, label: 'Audit Logs' },
  ];

  return (
    <div className="w-full h-full flex bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <div className="w-20 md:w-64 border-r border-white/10 flex flex-col bg-black/50 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shadow-[0_0_15px_#dc2626]"><IconShield size={18}/></div>
            <span className="font-black text-lg tracking-widest hidden md:block">ADMIN_OS</span>
        </div>
        <div className="flex-1 py-4 space-y-1 px-2">
            {navItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === item.id 
                        ? 'bg-white/10 text-white border-l-2 border-red-500' 
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <item.icon size={20} />
                    <span className="hidden md:block text-sm font-bold uppercase tracking-wider">{item.label}</span>
                </button>
            ))}
        </div>
        <div className="p-4 border-t border-white/5">
            <div className="text-[10px] text-white/20 font-mono text-center md:text-left">V3.0.1 STABLE</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative">
        
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {activeTab === 'overview' && (
            <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-black mb-6 glow-text-red">SYSTEM OVERVIEW</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatBox title="Total Users" value={users.length} icon={IconUser} color="border-cyan-500/50" text="text-cyan-400" />
                    <StatBox title="System Load" value="12%" icon={IconServer} color="border-green-500/50" text="text-green-400" />
                    <StatBox title="Security" value="SECURE" icon={IconShield} color="border-red-500/50" text="text-red-400" />
                    <StatBox title="Database" value="CONNECTED" icon={IconDatabase} color="border-purple-500/50" text="text-purple-400" />
                </div>
                
                {/* Simulated Traffic Graph */}
                <div className="glass-panel p-6 rounded-2xl h-64 flex items-end justify-between gap-1 mt-8 relative overflow-hidden">
                    <div className="absolute top-4 left-4 text-xs font-mono text-white/50">NETWORK TRAFFIC (REAL-TIME)</div>
                    {Array.from({length: 40}).map((_, i) => (
                        <div key={i} 
                             className="w-full bg-red-500/20 rounded-t hover:bg-red-500 transition-all duration-300"
                             style={{ height: `${Math.random() * 80 + 10}%` }}
                        ></div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="relative z-10">
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2"><IconUser size={18}/> USER DATABASE</h3>
                        <div className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 flex items-center gap-2">
                            <IconSearch size={14} className="text-white/50"/>
                            <input placeholder="Search query..." className="bg-transparent border-none outline-none text-xs w-48 text-white"/>
                        </div>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-white/40 uppercase font-mono text-xs">
                            <tr><th className="p-4">ID</th><th className="p-4">Identity</th><th className="p-4">Rank</th><th className="p-4">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-xs">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white/30">{u.id.substring(0,8)}...</td>
                                    <td className="p-4 text-white font-bold">{u.email}</td>
                                    <td className="p-4 text-cyan-400">{u.role || 'USER'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded ${u.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                            {u.isBanned ? 'BANNED' : 'ACTIVE'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'terminal' && (
            <div className="relative z-10 h-full flex flex-col">
                <div className="flex-1 bg-black border border-white/20 rounded-xl p-4 font-mono text-xs text-green-500 overflow-y-auto shadow-inner shadow-black">
                    {terminalOutput.map((line, i) => <div key={i} className="mb-1">{line}</div>)}
                    <div ref={terminalEndRef}></div>
                </div>
                <div className="mt-4 flex gap-2">
                    <span className="text-green-500 font-mono py-3 pl-2">{">"}</span>
                    <input 
                        value={cmdInput}
                        onChange={(e) => setCmdInput(e.target.value)}
                        onKeyDown={executeCommand}
                        autoFocus
                        className="flex-1 bg-black border border-white/20 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-green-500"
                        placeholder="Enter command (try 'status' or 'clear')..."
                    />
                </div>
            </div>
        )}

        {activeTab === 'logs' && (
            <div className="relative z-10 space-y-2 font-mono text-xs">
                {logs.map((log, i) => (
                    <div key={i} className="glass-panel p-3 rounded flex gap-4 items-center">
                        <span className="text-white/30">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`${log.status === 'FAIL' ? 'text-red-500' : 'text-green-500'}`}>[{log.status}]</span>
                        <span className="text-white">{log.action}</span>
                        <span className="text-white/50 ml-auto">{log.details}</span>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}

const StatBox = ({ title, value, icon: Icon, color, text }) => (
    <div className={`glass-panel p-6 rounded-xl border-l-4 ${color}`}>
        <div className="flex justify-between items-start">
            <div>
                <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">{title}</div>
                <div className="text-3xl font-black text-white">{value}</div>
            </div>
            <Icon size={24} className={text} />
        </div>
    </div>
);