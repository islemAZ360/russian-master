"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, setDoc, addDoc, query, orderBy, limit } from "firebase/firestore";
import { 
  IconTrash, IconUser, IconMessage, IconBroadcast, IconDatabase, 
  IconShield, IconBolt, IconBan, IconGift, 
  IconEye, IconLock, IconLogout, IconEdit, IconCheck, IconX, IconServer, IconFileCode
} from '@tabler/icons-react';

// --- CANVAS BACKGROUND (الخلفية الشبكية) ---
const NeuralMap = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const cvs = canvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        let w = cvs.width = cvs.offsetWidth;
        let h = cvs.height = cvs.offsetHeight;
        
        // تقليل عدد النقاط قليلاً لتحسين الأداء
        const nodes = Array.from({length: 30}, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1
        }));

        let animationFrameId;

        const loop = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#06b6d4';
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
            
            nodes.forEach((n, i) => {
                n.x += n.vx; n.y += n.vy;
                if(n.x < 0 || n.x > w) n.vx *= -1;
                if(n.y < 0 || n.y > h) n.vy *= -1;
                
                ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, Math.PI*2); ctx.fill();
                
                nodes.forEach((o, j) => {
                    if (i !== j) {
                        const dist = Math.hypot(n.x - o.x, n.y - o.y);
                        if (dist < 100) {
                            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(o.x, o.y); ctx.stroke();
                        }
                    }
                });
            });
            animationFrameId = requestAnimationFrame(loop);
        };
        loop();

        const handleResize = () => { 
            if(cvs){ w = cvs.width = cvs.offsetWidth; h = cvs.height = cvs.offsetHeight; }
        };
        window.addEventListener('resize', handleResize);
        
        return () => { 
            cancelAnimationFrame(animationFrameId); 
            window.removeEventListener('resize', handleResize); 
        };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" />;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [cards, setCards] = useState([]); 
  const [activeTab, setActiveTab] = useState('overview'); 
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [realLogs, setRealLogs] = useState([]);
  const [maintenance, setMaintenance] = useState(false);
  
  // Library Edit State
  const [editingCard, setEditingCard] = useState(null);
  const [searchCard, setSearchCard] = useState("");
  const [newCard, setNewCard] = useState({ russian: "", arabic: "", category: "General" });

  // User Inspector State
  const [inspectUser, setInspectUser] = useState(null);
  const [jsonEdit, setJsonEdit] = useState("");

  useEffect(() => {
    // جلب البيانات
    const unsubSys = onSnapshot(doc(db, "system", "status"), (d) => setMaintenance(d.exists() ? d.data().maintenance : false));
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>(b.xp||0)-(a.xp||0))));
    const unsubMsgs = onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "desc")), (s) => setMessages(s.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubCards = onSnapshot(collection(db, "library"), (s) => setCards(s.docs.map(d=>({id:d.id,...d.data()}))));
    
    // جلب السجلات (Logs)
    const unsubLogs = onSnapshot(query(collection(db, "system_logs"), orderBy("timestamp", "desc"), limit(50)), (s) => {
        setRealLogs(s.docs.map(d=>({id:d.id, ...d.data()})));
    });

    return () => { unsubUsers(); unsubMsgs(); unsubCards(); unsubLogs(); unsubSys(); };
  }, []);

  // --- ACTIONS ---
  const toggleMaint = async () => {
      const newState = !maintenance;
      await setDoc(doc(db, "system", "status"), { maintenance: newState }, { merge: true });
      if(newState) await setDoc(doc(db, "system", "broadcast"), { message: "⚠️ MAINTENANCE STARTED ⚠️", active: true, timestamp: Date.now() });
      else await setDoc(doc(db, "system", "broadcast"), { active: false });
  };
  
  const sendBroadcast = async () => { await setDoc(doc(db, "system", "broadcast"), { message: broadcastMsg, active: !!broadcastMsg, timestamp: Date.now() }); if(broadcastMsg) alert("Deployed!"); };
  const kickUser = async (id) => { if(confirm("Kick?")) { await updateDoc(doc(db, "users", id), { forceLogout: true }); setTimeout(()=>updateDoc(doc(db, "users", id), { forceLogout: false }), 5000); }};
  const banUser = async (id, status) => await updateDoc(doc(db, "users", id), { isBanned: !status });

  // Library Actions
  const addLibCard = async (e) => { e.preventDefault(); if(!newCard.russian) return; await addDoc(collection(db, "library"), {...newCard, createdAt: Date.now()}); setNewCard({russian:"",arabic:"",category:"General"}); };
  const deleteLibCard = async (id) => { if(confirm("Delete Word?")) await deleteDoc(doc(db, "library", id)); };
  const updateLibCard = async () => { if(editingCard) { await updateDoc(doc(db, "library", editingCard.id), { russian: editingCard.russian, arabic: editingCard.arabic, category: editingCard.category }); setEditingCard(null); }};

  // Inspector Actions
  const openInspector = (user) => { setInspectUser(user); setJsonEdit(JSON.stringify(user, null, 4)); };
  const saveInspector = async () => {
      try {
          const parsed = JSON.parse(jsonEdit);
          const { id, ...data } = parsed; 
          await updateDoc(doc(db, "users", inspectUser.id), data);
          alert("User Data Patched Successfully!");
          setInspectUser(null);
      } catch (e) { alert("Invalid JSON: " + e.message); }
  };

  // فلترة الكلمات
  const filteredCards = cards.filter(c => 
    (c.russian && c.russian.toLowerCase().includes(searchCard.toLowerCase())) || 
    (c.arabic && c.arabic.includes(searchCard))
  );

  return (
    <div className="w-full h-screen flex flex-col p-4 font-sans text-white overflow-hidden relative bg-black">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
            <IconShield size={32} className={`text-white ${maintenance ? 'animate-pulse text-orange-500' : ''}`} />
            <div>
                <h1 className="text-2xl font-black tracking-widest">NEXUS CONTROL</h1>
                <p className="text-xs text-white/40 tracking-[0.3em] font-bold">Admin Privileges Active</p>
            </div>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
            {['overview','users','database','logs'].map(t => (
                <button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-1 rounded text-xs font-bold uppercase ${activeTab===t ? 'bg-cyan-600 text-white' : 'text-white/40 hover:text-white'}`}>{t}</button>
            ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#080808] border border-white/10 rounded-2xl relative shadow-2xl">
        
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
            <div className="relative h-full p-6">
                <NeuralMap />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="AGENTS" value={users.length} color="text-cyan-400" border="border-cyan-500/30" bg="bg-cyan-900/20" />
                    <StatCard title="DATA UNITS" value={cards.length} color="text-purple-400" border="border-purple-500/30" bg="bg-purple-900/20" />
                    <div className={`border p-6 rounded-xl cursor-pointer flex items-center justify-center gap-4 ${maintenance ? 'bg-orange-900/40 border-orange-500' : 'bg-black/40 border-white/10'}`} onClick={toggleMaint}>
                        <IconServer size={32} className={maintenance ? 'text-orange-500 animate-bounce' : 'text-white/20'}/>
                        <div className="text-left"><h3 className="font-bold">MAINTENANCE</h3><p className="text-xs">{maintenance ? "ACTIVE" : "DISABLED"}</p></div>
                    </div>
                </div>
                <div className="relative z-10 bg-black/60 border border-white/10 rounded-xl p-4 flex gap-4">
                    <input value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} placeholder="GLOBAL BROADCAST MESSAGE..." className="flex-1 bg-transparent outline-none font-mono text-sm" />
                    <button onClick={sendBroadcast} className="text-red-500 font-bold text-xs border border-red-500/50 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-all">DEPLOY</button>
                </div>
            </div>
        )}

        {/* TAB: USERS */}
        {activeTab === 'users' && (
            <div className="p-2">
                <table className="w-full text-left text-xs md:text-sm">
                    <thead className="bg-white/5 text-white/40 uppercase"><tr><th className="p-3">User</th><th className="p-3">XP</th><th className="p-3">Status</th><th className="p-3 text-right">Control</th></tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/5">
                                <td className="p-3 font-bold text-cyan-400 cursor-pointer hover:underline" onClick={() => openInspector(u)}>{u.email}</td>
                                <td className="p-3 font-mono">{u.xp}</td>
                                <td className="p-3">{u.isBanned ? <span className="text-red-500">BANNED</span> : <span className="text-emerald-500">OK</span>}</td>
                                <td className="p-3 text-right flex justify-end gap-2">
                                    <button onClick={() => openInspector(u)} className="text-blue-400 hover:bg-blue-900/30 p-1 rounded"><IconFileCode size={16}/></button>
                                    <button onClick={() => kickUser(u.id)} className="text-orange-400 hover:bg-orange-900/30 p-1 rounded"><IconLogout size={16}/></button>
                                    <button onClick={() => banUser(u.id, u.isBanned)} className="text-red-400 hover:bg-red-900/30 p-1 rounded"><IconBan size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* TAB: DATABASE */}
        {activeTab === 'database' && (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-white/10 bg-black/20 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                        <input value={newCard.russian} onChange={e=>setNewCard({...newCard, russian:e.target.value})} placeholder="Russian" className="bg-black border border-white/20 p-2 rounded text-sm outline-none focus:border-cyan-500"/>
                        <input value={newCard.arabic} onChange={e=>setNewCard({...newCard, arabic:e.target.value})} placeholder="Arabic" className="bg-black border border-white/20 p-2 rounded text-sm outline-none focus:border-cyan-500 dir-rtl"/>
                        <select value={newCard.category} onChange={e=>setNewCard({...newCard, category:e.target.value})} className="bg-black border border-white/20 p-2 rounded text-sm outline-none">
                            <option>General</option><option>Tech</option><option>Slang</option><option>Business</option>
                        </select>
                    </div>
                    <button onClick={addLibCard} className="bg-cyan-600 px-6 rounded font-bold text-sm hover:bg-cyan-500 shadow-lg">ADD</button>
                </div>
                
                <div className="p-2 border-b border-white/10"><input value={searchCard} onChange={e=>setSearchCard(e.target.value)} placeholder="Search Library..." className="w-full bg-transparent p-2 outline-none text-sm font-mono text-white/50"/></div>
                
                <div className="flex-1 overflow-y-auto p-2 grid grid-cols-1 gap-2">
                    {filteredCards.map(c => (
                        <div key={c.id} className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5 hover:border-cyan-500/30 group">
                            {editingCard?.id === c.id ? (
                                <div className="flex gap-2 w-full">
                                    <input value={editingCard.russian} onChange={e=>setEditingCard({...editingCard, russian:e.target.value})} className="bg-black border border-cyan-500 p-1 rounded flex-1"/>
                                    <input value={editingCard.arabic} onChange={e=>setEditingCard({...editingCard, arabic:e.target.value})} className="bg-black border border-cyan-500 p-1 rounded flex-1"/>
                                    <button onClick={updateLibCard} className="text-emerald-500"><IconCheck/></button>
                                    <button onClick={()=>setEditingCard(null)} className="text-red-500"><IconX/></button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-4 items-center">
                                        <span className="text-cyan-400 font-bold">{c.russian}</span>
                                        <span className="text-white/50 text-xs">/</span>
                                        <span className="text-white">{c.arabic}</span>
                                        <span className="text-[10px] bg-white/10 px-2 rounded text-white/40">{c.category}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                                        <button onClick={()=>setEditingCard(c)} className="text-blue-400 hover:text-white"><IconEdit size={16}/></button>
                                        <button onClick={()=>deleteLibCard(c.id)} className="text-red-400 hover:text-white"><IconTrash size={16}/></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TAB: LOGS (تم إصلاح الخطأ هنا) */}
        {activeTab === 'logs' && (
            <div className="p-4 font-mono text-xs text-green-400 space-y-1">
                 {realLogs.length === 0 && <div className="text-white/20 text-center pt-20">NO SYSTEM LOGS FOUND.</div>}
                 {realLogs.map((log) => (
                    <div key={log.id} className="border-b border-white/5 py-2 flex gap-2 opacity-80 hover:opacity-100 items-center">
                        <span className="text-white/30 min-w-[70px]">[{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '00:00:00'}]</span>
                        {/* استخدام شرط (ternary) للتحقق من وجود البريد الإلكتروني قبل التقسيم */}
                        <span className="text-cyan-500 font-bold w-24 truncate">
                            {log.email ? log.email.split('@')[0] : 'SYSTEM'}
                        </span>
                        <span className="text-white w-24 truncate">{log.action}</span>
                        <span className={`w-16 font-bold ${log.status==='SUCCESS'?'text-emerald-500': log.status==='FAIL' ? 'text-red-500' : 'text-yellow-500'}`}>{log.status}</span>
                        <span className="text-white/50 truncate flex-1">{log.details}</span>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* USER INSPECTOR MODAL */}
      {inspectUser && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
              <div className="bg-[#111] border border-cyan-500 rounded-xl w-full max-w-2xl h-[80vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <h3 className="font-bold text-cyan-400 flex items-center gap-2"><IconFileCode/> DNA INSPECTOR: {inspectUser.email}</h3>
                      <button onClick={()=>setInspectUser(null)} className="text-red-500"><IconX/></button>
                  </div>
                  <div className="flex-1 p-4 bg-black overflow-hidden">
                      <textarea 
                        value={jsonEdit} 
                        onChange={(e)=>setJsonEdit(e.target.value)} 
                        className="w-full h-full bg-transparent text-green-500 font-mono text-xs outline-none resize-none"
                        spellCheck="false"
                      />
                  </div>
                  <div className="p-4 border-t border-white/10 flex justify-between items-center bg-[#151515]">
                      <span className="text-xs text-red-400 flex items-center gap-1"><IconShield size={12}/> CAUTION: DIRECT DB WRITE</span>
                      <button onClick={saveInspector} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded">PATCH DNA</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

// مكون البطاقة الإحصائية (تم إدراجه هنا)
const StatCard = ({ title, value, color, border, bg }) => (
    <div className={`${bg} border ${border} p-6 rounded-xl`}>
        <h3 className={`text-xs ${color} font-bold tracking-wider mb-2`}>{title}</h3>
        <p className="text-4xl font-black text-white">{value}</p>
    </div>
);