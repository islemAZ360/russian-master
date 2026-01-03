"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { IconShieldCheck, IconCrown, IconUser, IconMedal } from '@tabler/icons-react';

export default function MemberList() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("xp", "desc"));
    return onSnapshot(q, (snap) => {
        setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 pb-40 font-sans">
        <h2 className="text-3xl font-black text-white italic mb-8 uppercase tracking-tighter">Operative Network</h2>
        <div className="grid gap-3">
            {members.map((m, i) => (
                <div key={m.id} className="bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-all">
                    <div className="relative">
                        <img src={m.photoURL} className="w-14 h-14 rounded-full object-cover border-2 border-white/10" />
                        <div className="absolute -bottom-1 -right-1 bg-black rounded-full px-2 py-0.5 text-[8px] font-black border border-white/20">#{i+1}</div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{m.displayName}</span>
                            {m.specialBadges?.includes('obedient') && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                                    <IconShieldCheck size={10}/> OBEDIENT
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3 mt-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${m.role === 'master' ? 'text-red-500' : m.role === 'junior' ? 'text-cyan-400' : 'text-gray-500'}`}>{m.role}</span>
                            <span className="text-[9px] text-white/30 font-bold uppercase">{m.xp} XP</span>
                        </div>
                    </div>
                    <div>
                        {m.role === 'master' ? <IconCrown className="text-yellow-500" /> : m.xp > 5000 ? <IconMedal className="text-cyan-500"/> : <IconUser className="text-white/20"/>}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}