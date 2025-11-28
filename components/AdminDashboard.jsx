"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc, addDoc, query, orderBy, getDocs } from "firebase/firestore";
import { 
  IconShield, IconBan, IconUser, IconMessage, IconCheck, IconX, IconCrown, IconStar 
} from '@tabler/icons-react';

export default function AdminDashboard({ currentUser, userData }) {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); 
  const [supportTickets, setSupportTickets] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  // تحقق أن المستخدم الحالي أدمن حقيقي (وليس جونيور فقط) لبعض الخصائص
  const isSuperAdmin = userData?.role === 'admin';

  useEffect(() => {
    // جلب المستخدمين
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // جلب تذاكر الدعم
    const unsubSupport = onSnapshot(query(collection(db, "support_tickets"), orderBy("lastUpdate", "desc")), (snap) => {
        setSupportTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubUsers(); unsubSupport(); };
  }, []);

  // --- التحكم بالرتب ---
  const changeRole = async (userId, newRole) => {
      if (!isSuperAdmin) return alert("Access Denied: Only Super Admin can promote users.");
      if (confirm(`Change user role to ${newRole}?`)) {
          await updateDoc(doc(db, "users", userId), { role: newRole });
      }
  };

  const banUser = async (id, status) => {
      if (!isSuperAdmin) return alert("Access Denied: Only Super Admin can ban users.");
      await updateDoc(doc(db, "users", id), { isBanned: !status });
  };

  // --- الدعم الفني ---
  const sendSupportReply = async () => {
      if (!selectedTicket || !replyText) return;
      
      const ticketRef = doc(db, "support_tickets", selectedTicket.id);
      const newMessage = {
          text: replyText,
          sender: "admin",
          createdAt: new Date().toISOString()
      };

      // تحديث مصفوفة الرسائل
      const updatedMessages = [...(selectedTicket.messages || []), newMessage];
      
      await updateDoc(ticketRef, {
          messages: updatedMessages,
          lastUpdate: new Date().toISOString(),
          status: 'answered'
      });

      setReplyText("");
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans text-white overflow-hidden relative pb-32">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <div>
            <h1 className="text-3xl font-black text-white tracking-widest flex items-center gap-2">
                <IconShield className="text-red-500"/> COMMAND CENTER
            </h1>
            <p className="text-xs text-white/40 font-mono">
                LOGGED AS: <span className="text-cyan-400 uppercase">{userData?.role || "UNKNOWN"}</span>
            </p>
        </div>
        <div className="flex gap-2">
            <button onClick={()=>setActiveTab('users')} className={`px-4 py-2 rounded font-bold ${activeTab==='users' ? 'bg-cyan-600' : 'bg-white/10'}`}>USERS</button>
            <button onClick={()=>setActiveTab('support')} className={`px-4 py-2 rounded font-bold ${activeTab==='support' ? 'bg-purple-600' : 'bg-white/10'}`}>SUPPORT</button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/40 uppercase sticky top-0 backdrop-blur-md">
                    <tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-white">{u.email}</div>
                                <div className="text-xs text-white/30">{u.id}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-black uppercase ${
                                    u.role === 'admin' ? 'bg-red-500/20 text-red-500' : 
                                    u.role === 'junior' ? 'bg-yellow-500/20 text-yellow-500' : 
                                    'bg-gray-500/20 text-gray-400'
                                }`}>
                                    {u.role || 'USER'}
                                </span>
                            </td>
                            <td className="p-4 flex gap-2">
                                {isSuperAdmin && (
                                    <>
                                        <button onClick={()=>changeRole(u.id, 'junior')} title="Promote to Junior" className="p-2 bg-yellow-900/30 text-yellow-500 rounded hover:bg-yellow-500 hover:text-black"><IconStar size={16}/></button>
                                        <button onClick={()=>changeRole(u.id, 'admin')} title="Promote to Admin" className="p-2 bg-red-900/30 text-red-500 rounded hover:bg-red-500 hover:text-white"><IconCrown size={16}/></button>
                                        <button onClick={()=>changeRole(u.id, 'user')} title="Demote to User" className="p-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-600"><IconUser size={16}/></button>
                                        <div className="w-[1px] bg-white/10 mx-2"></div>
                                        <button onClick={()=>banUser(u.id, u.isBanned)} className={`p-2 rounded ${u.isBanned ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
                                            {u.isBanned ? <IconCheck size={16}/> : <IconBan size={16}/>}
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
          <div className="flex h-full gap-4">
              {/* Ticket List */}
              <div className="w-1/3 border-r border-white/10 overflow-y-auto custom-scrollbar">
                  {supportTickets.map(ticket => (
                      <div 
                        key={ticket.id} 
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 ${selectedTicket?.id === ticket.id ? 'bg-purple-900/20 border-l-4 border-l-purple-500' : ''}`}
                      >
                          <div className="font-bold text-white truncate">{ticket.userEmail}</div>
                          <div className="text-xs text-white/40 truncate">{ticket.messages[ticket.messages.length - 1]?.text}</div>
                          <div className="text-[10px] text-right mt-1 opacity-50">{ticket.status}</div>
                      </div>
                  ))}
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col bg-[#050505] rounded-xl overflow-hidden border border-white/10">
                  {selectedTicket ? (
                      <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {selectedTicket.messages?.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.sender === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-[#111] border-t border-white/10 flex gap-2">
                            <input 
                                value={replyText} 
                                onChange={e => setReplyText(e.target.value)} 
                                className="flex-1 bg-black border border-white/20 rounded p-2 text-white outline-none"
                                placeholder="Type admin reply..."
                            />
                            <button onClick={sendSupportReply} className="bg-purple-600 px-4 py-2 rounded text-white font-bold">SEND</button>
                        </div>
                      </>
                  ) : (
                      <div className="flex items-center justify-center h-full text-white/20">SELECT A TICKET</div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}