"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, onSnapshot, doc, updateDoc, query, orderBy, 
  deleteDoc, addDoc, serverTimestamp 
} from "firebase/firestore";
import { 
  IconShieldLock, IconUsers, IconLayoutDashboard, 
  IconBroadcast, IconMessage2, IconBan, 
  IconTrash, IconSearch, IconArrowLeft, IconHome
} from '@tabler/icons-react';
import { useUI } from '@/context/UIContext';

export default function AdminDashboard({ currentUser }) {
  const { setCurrentView } = useUI();
  const [activeView, setActiveView] = useState('overview');
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  
  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snap) => {
        setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubTickets = onSnapshot(query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc")), (snap) => {
        setTickets(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsubUsers(); unsubTickets(); };
  }, []);

  const sendBroadcast = async () => {
    if(!broadcastMsg.trim()) return;
    await updateDoc(doc(db, "system", "broadcast"), { 
        message: broadcastMsg, 
        active: true, 
        sentBy: currentUser.email, 
        timestamp: new Date().toISOString() 
    });
    setBroadcastMsg("");
    alert("تم إرسال البث للجميع");
  };

  const toggleBan = async (uid, currentStatus) => {
      if(!confirm(currentStatus ? "رفع الحظر؟" : "حظر المستخدم؟")) return;
      await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
  };

  // المكونات الداخلية
  const StatCard = ({ title, value, icon, color }) => (
    <div className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:border-white/20 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-white/5 ${color}`}>{icon}</div>
        </div>
        <div className="text-3xl font-black text-white mb-1">{value}</div>
        <div className="text-xs font-bold uppercase text-gray-500 tracking-widest">{title}</div>
    </div>
  );

  const NavBtn = ({ id, label, icon: Icon }) => (
    <button 
        onClick={() => setActiveView(id)} 
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all mb-1 ${
            activeView === id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        <Icon size={20} />
        <span className="font-bold text-sm">{label}</span>
    </button>
  );

  return (
    // التصحيح هنا: fixed inset-0 z-[100] يضمن ملء الشاشة بالكامل فوق أي شيء
    <div className="fixed inset-0 z-[100] flex bg-[#050505] text-white font-sans overflow-hidden">
        
        {/* Sidebar */}
        <nav className="w-64 border-r border-white/10 bg-black flex flex-col shrink-0">
            <div className="p-6 h-20 border-b border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20">
                    <IconShieldLock size={20} className="text-white" />
                </div>
                <h1 className="font-black tracking-widest text-lg">NEXUS<span className="text-indigo-500">OS</span></h1>
            </div>
            
            <div className="flex-1 py-6 px-3">
                <NavBtn id="overview" label="لوحة القيادة" icon={IconLayoutDashboard} />
                <NavBtn id="users" label="العملاء" icon={IconUsers} />
                <NavBtn id="support" label="الدعم الفني" icon={IconMessage2} />
                <NavBtn id="broadcast" label="بث عام" icon={IconBroadcast} />
            </div>

            <div className="p-4 border-t border-white/10">
                <button 
                    onClick={() => setCurrentView('home')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-bold"
                >
                    <IconHome size={18} />
                    <span>عودة للرئيسية</span>
                </button>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#050505]">
            <header className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-8">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">
                    {activeView === 'overview' && "نظرة عامة للنظام"}
                    {activeView === 'users' && "قاعدة بيانات العملاء"}
                    {activeView === 'support' && "رسائل الدعم"}
                    {activeView === 'broadcast' && "نظام التنبيهات"}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-mono text-gray-500">SECURE CONNECTION</span>
                </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {activeView === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="إجمالي المستخدمين" value={users.length} icon={<IconUsers/>} color="text-cyan-400" />
                        <StatCard title="المحظورين" value={users.filter(u => u.isBanned).length} icon={<IconBan/>} color="text-red-500" />
                        <StatCard title="تذاكر مفتوحة" value={tickets.filter(t => t.status !== 'resolved').length} icon={<IconMessage2/>} color="text-yellow-500" />
                        <StatCard title="المشرفين" value={users.filter(u => u.role === 'admin' || u.role === 'master').length} icon={<IconShieldLock/>} color="text-purple-500" />
                    </div>
                )}

                {activeView === 'users' && (
                    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-4">المستخدم</th>
                                    <th className="p-4">البريد</th>
                                    <th className="p-4">الرتبة</th>
                                    <th className="p-4">XP</th>
                                    <th className="p-4 text-right">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-white">{u.displayName || "Unknown"}</td>
                                        <td className="p-4 text-gray-400 font-mono">{u.email}</td>
                                        <td className="p-4"><span className="px-2 py-1 rounded bg-white/10 text-xs font-bold uppercase">{u.role}</span></td>
                                        <td className="p-4 text-indigo-400 font-bold">{u.xp}</td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => toggleBan(u.id, u.isBanned)}
                                                className={`px-3 py-1 rounded text-xs font-bold ${u.isBanned ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}
                                            >
                                                {u.isBanned ? "UNBAN" : "BAN"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeView === 'broadcast' && (
                    <div className="max-w-2xl mx-auto bg-[#111] border border-white/10 rounded-2xl p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><IconBroadcast className="text-red-500"/> إرسال تنبيه عاجل</h3>
                        <textarea 
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            className="w-full h-32 bg-black border border-white/20 rounded-xl p-4 text-white mb-4 focus:border-indigo-500 outline-none"
                            placeholder="اكتب الرسالة هنا..."
                        />
                        <button 
                            onClick={sendBroadcast}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                        >
                            إرسال للجميع
                        </button>
                    </div>
                )}
                
                {/* Support section placeholder - can be copied from previous code if needed */}
                {activeView === 'support' && (
                    <div className="text-center text-gray-500 mt-20">نظام الدعم قيد التطوير في هذه الواجهة المبسطة</div>
                )}
            </div>
        </main>
    </div>
  );
}