"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { motion } from 'framer-motion';
import { IconTrophy, IconMedal, IconCrown } from '@tabler/icons-react';

export default function LeaderboardView({ currentUserEmail }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
        try {
            const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(10));
            const snapshot = await getDocs(q);
            setLeaders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    fetchLeaders();
  }, []);

  if (loading) return <div className="text-yellow-500/50 text-center p-20 animate-pulse tracking-widest text-sm">CALCULATING RANKINGS...</div>;

  return (
    <div className="w-full max-w-3xl mx-auto pb-32">
      <div className="flex flex-col gap-3">
        {leaders.map((user, index) => {
            const isMe = user.email === currentUserEmail;
            
            // تصميم خاص للمراكز الثلاثة الأولى
            let rankStyle = "bg-white/5 border-white/10 text-white/70";
            let scale = 1;
            
            if (index === 0) { rankStyle = "bg-yellow-500/20 border-yellow-500/50 text-yellow-100 shadow-[0_0_30px_rgba(234,179,8,0.15)]"; scale = 1.05; }
            else if (index === 1) { rankStyle = "bg-slate-400/20 border-slate-400/50 text-slate-200"; }
            else if (index === 2) { rankStyle = "bg-orange-700/20 border-orange-700/50 text-orange-200"; }

            return (
                <motion.div 
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative flex items-center p-4 rounded-xl border backdrop-blur-md transition-all ${rankStyle} ${isMe ? 'ring-1 ring-white/50' : ''}`}
                    style={{ scale }}
                >
                    <div className="w-10 text-xl font-black italic opacity-50">#{index + 1}</div>
                    
                    <div className="flex-1">
                        <h3 className="font-bold text-sm tracking-wide">
                            {user.email ? user.email.split('@')[0] : 'Unknown'}
                            {isMe && <span className="ml-2 text-[8px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                        </h3>
                        {index === 0 && <span className="text-[9px] text-yellow-400 uppercase tracking-widest">Current Champion</span>}
                    </div>

                    <div className="text-right">
                        <div className="text-xl font-black font-mono">{user.xp || 0}</div>
                        <div className="text-[8px] opacity-40 uppercase tracking-wider">Total XP</div>
                    </div>
                    
                    {index === 0 && <div className="absolute -right-2 -top-2 text-yellow-400 animate-bounce"><IconCrown size={24}/></div>}
                </motion.div>
            );
        })}
      </div>
    </div>
  );
}