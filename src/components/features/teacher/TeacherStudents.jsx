"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs, limit, orderBy } from "firebase/firestore";
import { 
  IconUserPlus, IconSearch, IconUsers, IconUser, 
  IconCheck, IconLoader2, IconSchool, IconShield,
  IconSend, IconMailForward, IconRefresh
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

export default function TeacherStudents() {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  
  // --- الحالات (States) ---
  const [activeTab, setActiveTab] = useState('my_squad'); // 'my_squad' or 'recruit'
  const [myStudents, setMyStudents] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // المستخدمون المحتملون للتجنيد
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([]); 

  // 1. جلب طلابي الحاليين (My Squad) - مع معالجة الأخطاء
  useEffect(() => {
    if (!user) return;
    
    // استعلام بسيط ومباشر لجلب الطلاب المرتبطين بهذا الأستاذ
    const q = query(
      collection(db, "users"), 
      where("teacherId", "==", user.uid)
    );
    
    const unsub = onSnapshot(q, (snap) => {
      const studentsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log("My Students Found:", studentsList.length); // للتأكد في الكونسول
      setMyStudents(studentsList);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
    });
    
    return () => unsub();
  }, [user]);

  // 2. جلب المستخدمين للتجنيد (Recruitment Pool)
  useEffect(() => {
    if (activeTab === 'recruit') {
        const fetchPotentialRecruits = async () => {
            setLoading(true);
            try {
                // جلب المستخدمين العاديين فقط
                const q = query(
                    collection(db, "users"),
                    where("role", "==", "user"), 
                    limit(50) 
                );
                
                const snap = await getDocs(q);
                // استبعاد الطلاب الذين يتبعون لي بالفعل
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
      
      try {
          await addDoc(collection(db, "notifications"), {
              userId: targetUser.id,      
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

          setInvitedUsers(prev => [...prev, targetUser.id]);
          
      } catch (error) {
          console.error("Invite Failed:", error);
          alert("Failed to send invite.");
      }
  };

  const filteredRecruits = allUsers.filter(u => 
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 font-sans pb-32" dir={dir}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div>
                <div className="flex items-center gap-3 mb-2 text-cyan-500">
                    <IconShield size={32}/>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Squad_Command</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                    {activeTab === 'recruit' ? t('recruit_title') || "Recruitment" : t('nav_students') || "My Squad"}
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#0a0a0a] border border-white/10 p-1 rounded-2xl">
                <button 
                    onClick={() => setActiveTab('my_squad')}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2
                    ${activeTab === 'my_squad' ? 'bg-cyan-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                    <IconUsers size={16}/> {t('squad_active') || "Active Agents"}
                </button>
                <button 
                    onClick={() => setActiveTab('recruit')}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2
                    ${activeTab === 'recruit' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                    <IconUserPlus size={16}/> {t('recruit_invite_btn') || "Recruit"}
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* === Tab 1: My Squad === */}
            {activeTab === 'my_squad' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading && myStudents.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-cyan-500/50">
                            <IconLoader2 className="animate-spin" size={32}/>
                            <span className="text-xs font-black uppercase tracking-widest">Syncing Squad Data...</span>
                        </div>
                    ) : myStudents.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                            <IconSchool size={64} className="mb-4 text-cyan-500"/>
                            <h3 className="text-lg font-black uppercase tracking-widest">Squad Empty</h3>
                            <p className="text-xs font-mono mt-2">Go to "Recruit" tab to add students.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myStudents.map((student, i) => (
                                <motion.div 
                                    key={student.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:border-cyan-500/30 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden border border-white/10 shrink-0">
                                        <img src={student.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-bold truncate uppercase">{student.displayName || "Unknown Agent"}</div>
                                        <div className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            OPERATIVE
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-cyan-400 font-black text-sm">{student.xp || 0}</div>
                                        <div className="text-[8px] text-white/30 uppercase">XP</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* === Tab 2: Recruit === */}
            {activeTab === 'recruit' && (
                <div className="flex flex-col h-full">
                    {/* Search */}
                    <div className="relative mb-6">
                        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20}/>
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('recruit_search_ph') || "Search by codename or email..."}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-purple-500 transition-all font-mono text-sm placeholder:text-white/20"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-purple-500/50">
                                <IconLoader2 className="animate-spin" size={32}/>
                                <span className="text-xs font-black uppercase tracking-widest">Scanning Global Network...</span>
                            </div>
                        ) : filteredRecruits.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <p className="text-xs font-black uppercase tracking-widest">{t('recruit_no_results') || "No candidates found"}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredRecruits.map((candidate, i) => {
                                    const isInvited = invitedUsers.includes(candidate.id);
                                    
                                    return (
                                        <motion.div 
                                            key={candidate.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all"
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden border border-white/10 shrink-0">
                                                    <img src={candidate.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover"/>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-white font-bold text-sm truncate uppercase">{candidate.displayName || "Unknown"}</div>
                                                    <div className="text-[10px] text-white/30 font-mono truncate">{candidate.email}</div>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => !isInvited && sendInvite(candidate)}
                                                disabled={isInvited}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                                                ${isInvited 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                                                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg active:scale-95'}`}
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