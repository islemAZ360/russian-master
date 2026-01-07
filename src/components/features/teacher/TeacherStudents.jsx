"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, doc, serverTimestamp, limit 
} from "firebase/firestore";
import { 
  IconUsers, IconUserPlus, IconSearch, IconUserX, 
  IconSchool, IconCircleCheck, IconLoader 
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

export default function TeacherStudents() {
  const { user } = useAuth();
  const { t, dir } = useLanguage();

  const [myStudents, setMyStudents] = useState([]);
  const [potentialUsers, setPotentialUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviteStatus, setInviteStatus] = useState({}); // لتتبع حالة أزرار الدعوة

  // 1. جلب طلابي الحاليين (Real-time)
  useEffect(() => {
    if (!user) return;

    // الاستعلام: المستخدمون الذين لديهم teacherId يساوي معرفي
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

  // 2. البحث عن مستخدمين جدد (Users with role 'user')
  useEffect(() => {
    if (!searchQuery.trim()) {
        setPotentialUsers([]);
        return;
    }

    // بحث بسيط (في الواقع يفضل استخدام Algolia أو حلول بحث متقدمة، لكن هذا يكفي للمشاريع الصغيرة)
    // سنجلب المستخدمين العاديين فقط
    const q = query(
        collection(db, "users"),
        where("role", "==", "user"),
        limit(10)
    );

    const unsub = onSnapshot(q, (snap) => {
        const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // تصفية النتائج محلياً بناءً على الاسم أو الإيميل
        const filtered = users.filter(u => 
            (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setPotentialUsers(filtered);
    });

    return () => unsub();
  }, [searchQuery]);

  // --- العمليات ---

  // إرسال دعوة (Invite)
  const handleInvite = async (targetUser) => {
    setInviteStatus(prev => ({ ...prev, [targetUser.id]: 'loading' }));
    
    try {
        // إنشاء إشعار في مجموعة notifications
        await addDoc(collection(db, "notifications"), {
            userId: targetUser.id,      // المستلم
            senderId: user.uid,         // المرسل (الأستاذ)
            senderName: user.displayName || "Teacher",
            type: "invite",             // نوع الإشعار
            title: "ACADEMY INVITATION",
            message: `Commander ${user.displayName} wants to recruit you to their squad.`,
            createdAt: serverTimestamp(),
            read: false,
            // بيانات إضافية لقبول الدعوة
            actionPayload: {
                teacherId: user.uid,
                newRole: 'student'
            }
        });

        setInviteStatus(prev => ({ ...prev, [targetUser.id]: 'sent' }));
        setTimeout(() => {
            setInviteStatus(prev => {
                const newState = { ...prev };
                delete newState[targetUser.id];
                return newState;
            });
        }, 3000);

    } catch (error) {
        console.error("Invite Failed:", error);
        setInviteStatus(prev => ({ ...prev, [targetUser.id]: 'error' }));
    }
  };

  // فصل طالب (Remove Student)
  const handleRemoveStudent = async (studentId) => {
      if(!confirm("Are you sure you want to discharge this operative?")) return;
      
      try {
          await updateDoc(doc(db, "users", studentId), {
              teacherId: null,
              role: 'user' // إعادته لرتبة مستخدم عادي
          });
      } catch (e) {
          console.error("Removal Failed:", e);
      }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 font-sans pb-32" dir={dir}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 animate-in fade-in slide-in-from-top-4">
          <div>
              <div className="flex items-center gap-3 text-cyan-500 mb-2">
                  <IconUsers size={32} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Squad_Management</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  {t('nav_students') || "My Students"}
              </h1>
          </div>
          
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="text-right">
                  <div className="text-2xl font-black text-white leading-none">{myStudents.length}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-wider">Active Operatives</div>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <IconSchool className="text-emerald-500" size={24} />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
          
          {/* العمود 1: طلابي الحاليين */}
          <div className="flex flex-col bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <IconCircleCheck className="text-emerald-500" size={20}/> Current Squad
              </h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {loading ? (
                      <div className="text-center py-10 opacity-30 text-xs font-mono">SCANNING DATABASE...</div>
                  ) : myStudents.length === 0 ? (
                      <div className="text-center py-20 flex flex-col items-center opacity-30">
                          <IconUsers size={48} className="mb-4"/>
                          <p className="text-xs font-black uppercase tracking-widest">No operatives assigned yet.</p>
                      </div>
                  ) : (
                      <AnimatePresence>
                          {myStudents.map(student => (
                              <motion.div 
                                  key={student.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl transition-all"
                              >
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden">
                                          <img src={student.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover"/>
                                      </div>
                                      <div>
                                          <div className="font-bold text-white text-sm">{student.displayName}</div>
                                          <div className="text-[9px] text-white/30 font-mono">{student.email}</div>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                      <div className="text-right hidden sm:block">
                                          <div className="text-[10px] text-emerald-400 font-black">{student.xp || 0} XP</div>
                                          <div className="text-[8px] text-white/20 uppercase">Level {Math.floor((student.xp||0)/500)+1}</div>
                                      </div>
                                      <button 
                                          onClick={() => handleRemoveStudent(student.id)}
                                          className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                          title="Discharge"
                                      >
                                          <IconUserX size={18} />
                                      </button>
                                  </div>
                              </motion.div>
                          ))}
                      </AnimatePresence>
                  )}
              </div>
          </div>

          {/* العمود 2: البحث والإضافة */}
          <div className="flex flex-col bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50"></div>
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <IconUserPlus className="text-cyan-500" size={20}/> Recruit New
              </h3>

              <div className="relative group mb-6">
                  <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-500 transition-colors" size={20} />
                  <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-medium focus:border-cyan-500 outline-none transition-all placeholder:text-white/20"
                  />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {!searchQuery ? (
                      <div className="text-center py-20 opacity-20 flex flex-col items-center">
                          <IconSearch size={48} className="mb-4"/>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em]">Enter query to scan network</p>
                      </div>
                  ) : potentialUsers.length === 0 ? (
                      <div className="text-center py-10 opacity-30 text-xs font-mono">NO MATCHING SIGNALS FOUND</div>
                  ) : (
                      potentialUsers.map(u => (
                          <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden opacity-60">
                                      <img src={u.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover"/>
                                  </div>
                                  <div>
                                      <div className="font-bold text-white text-sm">{u.displayName || "Unknown"}</div>
                                      <div className="text-[9px] text-white/30 font-mono truncate max-w-[150px]">{u.email}</div>
                                  </div>
                              </div>
                              
                              <button 
                                  onClick={() => handleInvite(u)}
                                  disabled={inviteStatus[u.id] === 'sent' || inviteStatus[u.id] === 'loading'}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2
                                  ${inviteStatus[u.id] === 'sent' 
                                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 cursor-default'
                                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'}`}
                              >
                                  {inviteStatus[u.id] === 'loading' && <IconLoader className="animate-spin" size={14}/>}
                                  {inviteStatus[u.id] === 'sent' ? 'SENT' : 'INVITE'}
                              </button>
                          </div>
                      ))
                  )}
              </div>
          </div>

      </div>
    </div>
  );
}