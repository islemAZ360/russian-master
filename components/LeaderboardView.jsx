import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
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
            // قمنا بتضمين ID المستند لضمان مفتاح فريد
            setLeaders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchLeaders();
  }, []);

  if (loading) return <div className="text-white text-center p-20 animate-pulse">Loading Rankings...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 pt-10 pb-32 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">
          CHAMPIONS
        </h1>
        <p className="text-white/40 tracking-widest uppercase text-sm">Top Learners Global Ranking</p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {leaders.map((user, index) => {
            const isMe = user.email === currentUserEmail;
            let rankColor = "bg-white/5 border-white/10";
            let icon = <span className="font-bold text-white/50">#{index + 1}</span>;
            
            // تم إصلاح الخطأ المطبعي هنا (إضافة مسافة)
            if (index === 0) { 
                rankColor = "bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]"; 
                icon = <IconCrown className="text-yellow-400" />; 
            }
            if (index === 1) { 
                rankColor = "bg-gray-400/20 border-gray-400/50"; 
                icon = <IconMedal className="text-gray-300" />; 
            }
            if (index === 2) { 
                rankColor = "bg-orange-700/20 border-orange-700/50"; 
                icon = <IconMedal className="text-orange-600" />; 
            }

            // معالجة الاسم بأمان لتجنب الأخطاء
            const displayName = user.email ? user.email.split('@')[0] : 'Unknown User';

            return (
                <motion.div 
                    key={user.id || index} // استخدام ID كمفتاح أساسي
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center p-4 rounded-2xl border backdrop-blur-md transition-all ${rankColor} ${isMe ? 'ring-2 ring-blue-500' : ''}`}
                >
                    <div className="w-12 h-12 flex items-center justify-center text-2xl font-bold mr-4">
                        {icon}
                    </div>
                    
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-xl mr-4 shadow-lg overflow-hidden">
                        {user.avatar || "👤"}
                    </div>

                    <div className="flex-1">
                        <h3 className={`font-bold ${isMe ? 'text-blue-400' : 'text-white'}`}>
                            {displayName}
                            {isMe && <span className="ml-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">YOU</span>}
                        </h3>
                        <div className="text-xs text-white/30 uppercase tracking-wider">
                            Streak: <span className="text-orange-400">{user.streak || 0} 🔥</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-black text-white">{user.xp || 0}</div>
                        <div className="text-[10px] text-white/40 uppercase">XP Earned</div>
                    </div>
                </motion.div>
            );
        })}
      </div>
    </div>
  );
}