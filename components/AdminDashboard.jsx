"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, query, orderBy, addDoc } from "firebase/firestore";
import { 
  IconShield, IconUser, IconActivity, IconChartBar, 
  IconBroadcast, IconSearch, IconCpu, IconMessage2, 
  IconLock, IconLockOpen, IconTrash, IconEye
} from '@tabler/icons-react';

export default function AdminDashboard({ currentUser }) {
  const [activeView, setActiveView] = useState('overview'); 
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // لعرض تفاصيل مستخدم أو مراسلته

  // 1. جلب المستخدمين
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => 
      setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})))
    );
    return () => unsubUsers();
  }, []);

  // 2. جلب تذاكر الدعم
  useEffect(() => {
    const q = query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc"));
    const unsubTickets = onSnapshot(q, (snap) => 
        setTickets(snap.docs.map(d => ({id: d.id, ...d.data()})))
    );
    return () => unsubTickets();
  }, []);

  // --- ACTIONS ---

  const handleRoleChange = async (targetUid, newRole, targetEmail) => {
      // قانون التحريم: لا يمكن لمستخدم عادي تعديل الماستر
      if (targetEmail === 'islamaz@bomba.com') {
          alert("خطأ: لا يمكن تعديل رتبة القائد الأعلى (Master).");
          return;
      }
      await updateDoc(doc(db, "users", targetUid), { role: newRole });
  };

  const toggleBan = async (user) => {
      if (user.email === 'islamaz@bomba.com') return;
      await updateDoc(doc(db, "users", user.id), { isBanned: !user.isBanned });
  };

  const sendBroadcast = async () => {
    if(!broadcastMsg) return;
    await updateDoc(doc(db, "system", "broadcast"), { 
        message: broadcastMsg, 
        active: true,
        sentBy: currentUser.email,
        timestamp: new Date().toISOString()
    });
    alert("تم إرسال الرسالة العامة لجميع الوحدات.");
    setBroadcastMsg("");
  };

  const replyToTicket = async (ticketId, reply) => {
      // إضافة رد على تذكرة
      // ... (يمكن تنفيذها بفتح مودال)
      alert("خاصية الرد قيد التطوير في النسخة 2.1");
  };

  return (
    // التصميم: أبيض وأسود صارم (Monochrome Corporate)
    <div className="w-full h-screen bg-[#f5f5f5] text-black font-mono flex overflow-hidden selection:bg-black selection:text-white">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-black text-white flex flex-col border-r border-gray-800 shadow-2xl shrink-0">
        <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-black tracking-tighter">NEXUS<span className="text-gray-500">ADMIN</span></h1>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                Level 5 Clearance
            </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <MenuBtn id="overview" label="لوحة القيادة" icon={IconChartBar} active={activeView} set={setActiveView} />
            <MenuBtn id="users" label="المستخدمين والرتب" icon={IconUser} active={activeView} set={setActiveView} />
            <MenuBtn id="support" label="مركز الدعم والشكاوى" icon={IconMessage2} active={activeView} set={setActiveView} badge={tickets.length} />
            <MenuBtn id="broadcast" label="البث العام" icon={IconBroadcast} active={activeView} set={setActiveView} />
        </nav>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
            SYSTEM V.2.0 <br/> SECURE CONNECTION
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto bg-white p-8">
        
        {/* OVERVIEW */}
        {activeView === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black border-b-4 border-black pb-2 mb-6">تقرير الحالة</h2>
                <div className="grid grid-cols-4 gap-6">
                    <StatBox title="إجمالي المستخدمين" value={users.length} />
                    <StatBox title="تذاكر مفتوحة" value={tickets.length} highlight />
                    <StatBox title="إجمالي XP" value={users.reduce((a,b)=>a+(b.xp||0),0)} />
                    <StatBox title="حالات الحظر" value={users.filter(u=>u.isBanned).length} />
                </div>
                
                {/* User Growth Chart Placeholder */}
                <div className="h-64 bg-gray-100 border border-gray-300 flex items-center justify-center rounded-sm">
                    <p className="text-gray-400 text-sm">[ رسم بياني لنشاط الموقع يظهر هنا ]</p>
                </div>
            </div>
        )}

        {/* USER MANAGEMENT (THE POWER TOOL) */}
        {activeView === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center border-b-4 border-black pb-2">
                    <h2 className="text-3xl font-black">إدارة المستخدمين</h2>
                    <div className="relative">
                        <IconSearch className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        <input placeholder="بحث عن عميل..." className="bg-gray-100 border border-gray-300 rounded-none py-2 pr-10 pl-4 w-64 focus:bg-white focus:border-black outline-none text-sm transition-all" />
                    </div>
                </div>

                <div className="overflow-hidden border border-gray-200 shadow-sm">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-black text-white uppercase tracking-wider">
                            <tr>
                                <th className="p-4">المستخدم</th>
                                <th className="p-4">البريد الإلكتروني</th>
                                <th className="p-4">الرتبة الحالية</th>
                                <th className="p-4">النقاط (XP)</th>
                                <th className="p-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(u => {
                                const isTargetMaster = u.email === 'islamaz@bomba.com';
                                return (
                                    <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.isBanned ? 'bg-red-50' : ''}`}>
                                        <td className="p-4 font-bold">{u.id.substring(0,8)}...</td>
                                        <td className="p-4 font-mono">{u.email}</td>
                                        <td className="p-4">
                                            {isTargetMaster ? (
                                                <span className="bg-black text-white px-2 py-1 text-xs font-bold rounded">MASTER</span>
                                            ) : (
                                                <select 
                                                    value={u.role || 'user'} 
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value, u.email)}
                                                    className="bg-white border border-gray-300 px-2 py-1 text-xs focus:border-black outline-none cursor-pointer"
                                                >
                                                    <option value="user">مستخدم</option>
                                                    <option value="junior_admin">أدمن مساعد</option>
                                                    <option value="admin">أدمن</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="p-4">{u.xp}</td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button onClick={() => setSelectedUser(u)} className="p-2 border border-gray-300 hover:bg-black hover:text-white transition-colors" title="عرض الملف">
                                                <IconEye size={16}/>
                                            </button>
                                            {!isTargetMaster && (
                                                <button 
                                                    onClick={() => toggleBan(u)} 
                                                    className={`p-2 border transition-colors ${u.isBanned ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 hover:bg-red-600 hover:text-white'}`}
                                                    title={u.isBanned ? "إلغاء الحظر" : "حظر المستخدم"}
                                                >
                                                    {u.isBanned ? <IconLockOpen size={16}/> : <IconLock size={16}/>}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* SUPPORT & TICKETS */}
        {activeView === 'support' && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black border-b-4 border-black pb-2">مركز الشكاوى</h2>
                
                <div className="grid gap-4">
                    {tickets.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">لا توجد رسائل جديدة.</div>
                    ) : (
                        tickets.map(ticket => (
                            <div key={ticket.id} className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4">
                                <div className="md:w-1/4 border-l border-gray-100 pl-4">
                                    <div className="font-bold text-lg mb-1">{ticket.userEmail}</div>
                                    <div className="text-xs text-gray-500 mb-2">UID: {ticket.userId}</div>
                                    <div className={`text-xs px-2 py-1 inline-block rounded ${ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                        {ticket.status === 'open' ? 'مفتوح' : 'مغلق'}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm mb-4 max-h-40 overflow-y-auto">
                                        {ticket.messages && ticket.messages.map((m, i) => (
                                            <div key={i} className={`mb-2 p-2 rounded ${m.sender === 'user' ? 'bg-white border border-gray-200' : 'bg-black text-white ml-auto w-fit'}`}>
                                                <p>{m.text}</p>
                                                <span className="text-[10px] opacity-50 block mt-1">{new Date(m.createdAt).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => alert("سيتم فتح نافذة الرد هنا")} className="bg-black text-white px-4 py-2 text-sm hover:opacity-80">
                                        فتح المحادثة والرد
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {/* BROADCAST SYSTEM */}
        {activeView === 'broadcast' && (
            <div className="max-w-2xl mx-auto mt-10 animate-in fade-in duration-500">
                <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                        <IconBroadcast /> بروتوكول البث العام
                    </h2>
                    <p className="mb-4 text-sm text-gray-600">
                        تحذير: هذه الرسالة ستظهر لجميع المستخدمين المتصلين فوراً في أعلى شاشتهم.
                    </p>
                    <textarea 
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 p-4 text-sm focus:border-black outline-none h-32 resize-none mb-4"
                        placeholder="اكتب رسالة النظام هنا..."
                    />
                    <button 
                        onClick={sendBroadcast}
                        disabled={!broadcastMsg}
                        className="w-full bg-black text-white py-4 font-bold text-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        إرسال الإشارة
                    </button>
                </div>
            </div>
        )}

      </div>

      {/* USER DETAILS MODAL (Simple overlay) */}
      {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
              <div className="bg-white p-8 max-w-lg w-full shadow-2xl border-2 border-black" onClick={e => e.stopPropagation()}>
                  <h3 className="text-2xl font-black mb-4">بيانات العميل</h3>
                  <div className="space-y-2 text-sm">
                      <p><strong>ID:</strong> {selectedUser.id}</p>
                      <p><strong>Email:</strong> {selectedUser.email}</p>
                      <p><strong>XP:</strong> {selectedUser.xp}</p>
                      <p><strong>Last Login:</strong> {selectedUser.lastLogin || 'N/A'}</p>
                  </div>
                  
                  <div className="mt-6 border-t pt-4">
                      <h4 className="font-bold mb-2">تعديل الرصيد (XP)</h4>
                      <div className="flex gap-2">
                          <button onClick={async () => { await updateDoc(doc(db, "users", selectedUser.id), { xp: (selectedUser.xp || 0) + 100 }); alert("تمت الزيادة"); }} className="bg-green-600 text-white px-4 py-2 text-xs">+100 XP</button>
                          <button onClick={async () => { await updateDoc(doc(db, "users", selectedUser.id), { xp: Math.max(0, (selectedUser.xp || 0) - 100) }); alert("تم الخصم"); }} className="bg-red-600 text-white px-4 py-2 text-xs">-100 XP</button>
                      </div>
                  </div>

                  <button onClick={() => setSelectedUser(null)} className="mt-6 w-full border border-black py-2 hover:bg-black hover:text-white transition-colors">إغلاق</button>
              </div>
          </div>
      )}

    </div>
  );
}

const MenuBtn = ({ id, label, icon: Icon, active, set, badge }) => (
    <button 
        onClick={() => set(id)}
        className={`w-full flex items-center justify-between p-3 text-sm font-bold transition-all ${active === id ? 'bg-white text-black translate-x-2' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
    >
        <div className="flex items-center gap-3">
            <Icon size={18} />
            <span>{label}</span>
        </div>
        {badge > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
);

const StatBox = ({ title, value, highlight }) => (
    <div className={`p-6 border ${highlight ? 'bg-black text-white border-black' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="text-3xl font-black mb-1">{value}</div>
        <div className={`text-xs uppercase tracking-widest ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>{title}</div>
    </div>
);