"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs, limit } from "firebase/firestore";
import { 
  IconUserPlus, IconSearch, IconUsers, 
  IconCheck, IconLoader2, IconSchool, IconShield,
  IconMailForward, IconId
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';

export default function TeacherStudents() {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  
  // --- الحالات (States) ---
  const [activeTab, setActiveTab] = useState('my_squad'); // 'my_squad' or 'recruit'
  const [myStudents, setMyStudents] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([]); 

  // 1. جلب طلابي الحاليين (My Squad)
  useEffect(() => {
    if (!user) return;
    
    // جلب الطلاب المرتبطين بمعرف الأستاذ الحالي
    const q = query(
      collection(db, "users"), 
      where("teacherId", "==", user.uid)
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setMyStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    
    return () => unsub();
  }, [user]);

  // 2. جلب المستخدمين للتجنيد (Recruitment)
  useEffect(() => {
    if (activeTab === 'recruit') {
        const fetchPotentialRecruits = async () => {
            setLoading(true);
            try {
                // جلب المستخدمين الذين ليس لديهم رتبة خاصة (role == user)
                // هذا يمنع ظهور الأساتذة الآخرين أو الأدمن في القائمة
                const q = query(
                    collection(db, "users"),
                    where("role", "==", "user"), 
                    limit(50) 
                );
                
                const snap = await getDocs(q);
                // نستبعد أي مستخدم مرتبط بالفعل بهذا الأستاذ (لزيادة الأمان)
                const users = snap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(u => u.teacherId !== user.uid);
                
                setAllUsers(users);
            } catch (e) {
                console.error("Error fetching recruits:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPotentialRecruits();
    }
  }, [activeTab, user]);

  // --- وظيفة إرسال الدعوة ---
  const sendInvite = async (targetUser) => {
      if (!user) return;
      
      // إضافة المستخدم لقائمة "تمت دعوتهم" محلياً فوراً لمنع التكرار
      setInvitedUsers(prev => [...prev, targetUser.id]);

      try {
          await addDoc(collection(db, "notifications"), {
              userId: targetUser.id,      // المستلم (الطالب المحتمل)
              target: 'student',          
              type: 'invite',             
              title: "🎓 SQUAD INVITATION",
              message: `Commander ${user.displayName || "Teacher"} invited you to join their squad.`,
              actionPayload: {
                  teacherId: user.uid,
                  teacherName: user.displayName || "Teacher",
                  newRole: 'student'
              },
              senderId: user.uid,
              createdAt: serverTimestamp(),
              read: false
          });
          
      } catch (error) {
          console.error("Invite Failed:", error);
          alert("Failed to send invite. System error.");
          // إزالة من القائمة المحلية في حال الفشل للسماح بالمحاولة مرة أخرى
          setInvitedUsers(prev => prev.filter(id => id !== targetUser.id));
      }
  };

  // فلترة قائمة التجنيد بناءً على البحث
  const filteredRecruits = allUsers.filter(u => {
      const name = u.displayName || "";
      const email = u.email || "";
      const search = searchTerm.toLowerCase();
      return name.toLowerCase().includes(search) || email.toLowerCase().includes(search);
  });

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 font-sans min-h-screen" dir={dir}>
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
                <div className="flex items-center gap-3 mb-2 text-cyan-500">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <IconShield size={28}/>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Squad_Command</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                    {activeTab === 'recruit' ? (t('recruit_title') || "Recruitment") : (t('nav_students') || "My Squad")}
                </h1>
            </div>

            {/* Tabs Toggle */}
            <div className="flex bg-[#0a0a0a] border border-white/10 p-1.5 rounded-2xl shadow-xl">
                <button 
                    onClick={() => setActiveTab('my_squad')}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 relative overflow-hidden
                    ${activeTab === 'my_squad' ? 'text-white' : 'text-white/40 hover:text-white'}`}
                >
                    {activeTab === 'my_squad' && (
                        <motion.div layoutId="tab-bg" className="absolute inset-0 bg-cyan-600 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)]" />
                    )}
                    <span className="relative z-10 flex items-center gap-2"><IconUsers size={16}/> {t('squad_active') || "Active"}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('recruit')}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 relative overflow-hidden
                    ${activeTab === 'recruit' ? 'text-white' : 'text-white/40 hover:text-white'}`}
                >
                    {activeTab === 'recruit' && (
                        <motion.div layoutId="tab-bg" className="absolute inset-0 bg-purple-600 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)]" />
                    )}
                    <span className="relative z-10 flex items-center gap-2"><IconUserPlus size={16}/> {t('recruit_invite_btn') || "Recruit"}</span>
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative">
            
            {/* === Tab 1: My Squad (قائمة طلابي) === */}
            {activeTab === 'my_squad' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
                    {loading && myStudents.length === 0 ? (
                        <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 text-cyan-500/50">
                            <IconLoader2 className="animate-spin" size={40}/>
                            <span className="text-xs font-black uppercase tracking-widest">Syncing Squad Data...</span>
                        </div>
                    ) : myStudents.length === 0 ? (
                        <div className="col-span-full h-96 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-white/5 rounded-[3rem]">
                            <IconSchool size={80} className="mb-6 text-cyan-500"/>
                            <h3 className="text-2xl font-black uppercase tracking-widest">Squad Empty</h3>
                            <p className="text-sm font-mono mt-2 text-white/50">Go to "Recruit" tab to add students.</p>
                        </div>
                    ) : (
                        myStudents.map((student, i) => (
                            <motion.div 
                                key={student.id || i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative p-6 rounded-[2rem] bg-[#0a0a0a] border border-white/5 hover:border-cyan-500/30 transition-all hover:bg-[#0f0f0f] hover:shadow-2xl overflow-hidden"
                            >
                                {/* Decorative Glow */}
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/5 blur-[50px] group-hover:bg-cyan-500/10 transition-all rounded-full pointer-events-none"></div>

                                <div className="relative z-10 flex items-center gap-5">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-zinc-800 overflow-hidden border-2 border-white/5 group-hover:border-cyan-500/50 transition-all shadow-lg">
                                            <img src={student.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover"/>
                                        </div>
                                        {/* Online Indicator */}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-black text-lg truncate uppercase mb-1">{student.displayName || "Unknown Agent"}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                                                LVL.{Math.floor((student.xp || 0)/500) + 1}
                                            </span>
                                            <span className="text-[9px] text-white/30 font-mono">{student.xp || 0} XP</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* === Tab 2: Recruit (التجنيد) === */}
            {activeTab === 'recruit' && (
                <div className="flex flex-col h-full">
                    {/* Search Bar */}
                    <div className="relative mb-8 group">
                        <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-500 transition-colors" size={24}/>
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('recruit_search_ph') || "Search by codename or email..."}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] py-5 pl-16 pr-6 text-white outline-none focus:border-purple-500 focus:bg-purple-900/5 transition-all font-mono text-sm placeholder:text-white/20 shadow-xl"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-4 text-purple-500/50">
                                <IconLoader2 className="animate-spin" size={40}/>
                                <span className="text-xs font-black uppercase tracking-widest">Scanning Global Network...</span>
                            </div>
                        ) : filteredRecruits.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <IconId size={64} className="mx-auto mb-4"/>
                                <p className="text-xs font-black uppercase tracking-widest">{t('recruit_no_results') || "No candidates found"}</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {filteredRecruits.map((candidate, i) => {
                                    const isInvited = invitedUsers.includes(candidate.id);
                                    
                                    return (
                                        <motion.div 
                                            key={candidate.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                                        >
                                            <div className="flex items-center gap-5 overflow-hidden">
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-800 overflow-hidden border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                                                    <img src={candidate.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover"/>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-white font-bold text-sm truncate uppercase">{candidate.displayName || "Unknown User"}</div>
                                                    <div className="text-[10px] text-white/30 font-mono truncate">{candidate.email}</div>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => !isInvited && sendInvite(candidate)}
                                                disabled={isInvited}
                                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg
                                                ${isInvited 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                                                    : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'}`}
                                            >
                                                {isInvited ? (
                                                    <><IconCheck size={14}/> {t('recruit_sent') || "Sent"}</>
                                                ) : (
                                                    <><IconMailForward size={14}/> {t('recruit_invite_btn') || "Invite"}</>
                                                )}
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    </div>
  );
}