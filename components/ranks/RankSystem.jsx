"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconCrown, IconMedal, IconTrophy, IconStar,
  IconSword, IconShield, IconFlag, IconUser,
  IconArrowUp, IconAward, IconChevronRight,
  IconChartBar, IconTrendingUp, IconSparkles
} from '@tabler/icons-react';
import { MILITARY_RANKS, getCurrentRank, getNextRank, getRankProgress, getRankUpRewards } from '../../data/militaryRanks';

const RankSystem = ({ userXP, userStats, onRankUp }) => {
  const [currentRank, setCurrentRank] = useState(null);
  const [nextRank, setNextRank] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showRankUp, setShowRankUp] = useState(false);
  const [rewards, setRewards] = useState(null);

  useEffect(() => {
    const rank = getCurrentRank(userXP);
    const next = getNextRank(userXP);
    const prog = getRankProgress(userXP);
    
    setCurrentRank(rank);
    setNextRank(next);
    setProgress(prog);
    
    // التحقق من ترقية جديدة
    const lastRank = localStorage.getItem('lastRank');
    if (lastRank && rank.id !== lastRank) {
      const reward = getRankUpRewards(lastRank, rank.id);
      setRewards(reward);
      setShowRankUp(true);
      localStorage.setItem('lastRank', rank.id);
      
      if (onRankUp) {
        onRankUp(rank, reward);
      }
    } else if (!lastRank) {
      localStorage.setItem('lastRank', rank.id);
    }
  }, [userXP, onRankUp]);

  const getRankIcon = (rankId) => {
    const icons = {
      recruit: '🪖',
      private: '🎖️',
      corporal: '⭐',
      sergeant: '🎗️',
      lieutenant: '⚔️',
      captain: '🎖️',
      major: '🏅',
      colonel: '👑',
      general: '🦅',
      marshal: '🔥',
      supreme_commander: '👁️'
    };
    return icons[rankId] || '⭐';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* ترقية الرتبة */}
      <AnimatePresence>
        {showRankUp && rewards && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500 rounded-3xl p-8 max-w-md w-full shadow-[0_0_100px_rgba(255,193,7,0.5)]">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-pulse">🎉</div>
                <h2 className="text-3xl font-black text-white mb-2">ترقية!</h2>
                <p className="text-yellow-300">أنت الآن {currentRank.title}</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <span className="text-4xl">{getRankIcon(currentRank.id)}</span>
                    <IconArrowUp className="text-yellow-400" />
                    <span className="text-4xl animate-bounce" style={{ color: currentRank.color }}>
                      {getRankIcon(currentRank.id)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-center text-white mb-2">{currentRank.name}</h3>
                  <p className="text-white/70 text-center">{currentRank.description}</p>
                </div>
                
                <div className="bg-black/30 p-4 rounded-xl">
                  <h4 className="font-bold text-white mb-3">المكافآت</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">النقاط:</span>
                      <span className="text-yellow-400 font-bold">+{rewards.xp}</span>
                    </div>
                    {rewards.cards.map((card, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-white/70">بطاقة:</span>
                        <span className="text-cyan-400">{card}</span>
                      </div>
                    ))}
                    {rewards.special && (
                      <div className="flex justify-between">
                        <span className="text-white/70">مكافأة خاصة:</span>
                        <span className="text-purple-400 font-bold">{rewards.special}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowRankUp(false)}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl transition-colors"
              >
                استمر
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* بطاقة الرتبة الحالية */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-gray-900 to-black border-2 border-cyan-500/30 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <IconCrown size={120} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* شارة الرتبة */}
            <div className="relative">
              <div
                className="w-40 h-40 rounded-full flex items-center justify-center text-6xl shadow-2xl"
                style={{
                  background: `radial-gradient(circle, ${currentRank?.color}20, transparent 70%)`,
                  border: `4px solid ${currentRank?.color}`
                }}
              >
                <span className="text-5xl">{getRankIcon(currentRank?.id)}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-cyan-600 text-black px-3 py-1 rounded-full text-xs font-bold">
                LVL {currentRank ? MILITARY_RANKS.findIndex(r => r.id === currentRank.id) + 1 : 1}
              </div>
            </div>
            
            {/* معلومات الرتبة */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-cyan-400 font-bold tracking-widest">الرتبة الحالية</span>
                <div className="flex-1 h-px bg-cyan-500/30"></div>
              </div>
              
              <h2 className="text-4xl font-black text-white mb-2" style={{ color: currentRank?.color }}>
                {currentRank?.title}
              </h2>
              <div className="text-white/50 text-lg mb-4">{currentRank?.name}</div>
              <p className="text-white/70 mb-6">{currentRank?.description}</p>
              
              {/* المزايا */}
              <div className="flex flex-wrap gap-2">
                {currentRank?.perks.map((perk, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/80"
                  >
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* تقدم الرتبة */}
        <div className="lg:col-span-2">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <IconTrendingUp className="text-green-500" />
                التقدم للرتبة التالية
              </h3>
              <div className="text-cyan-400 font-bold">
                {progress}%
              </div>
            </div>
            
            {nextRank ? (
              <>
                {/* شريط التقدم */}
                <div className="relative mb-4">
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>{currentRank?.xp} XP</span>
                    <span>{nextRank.xp} XP</span>
                  </div>
                </div>
                
                {/* الرتبة التالية */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                      style={{
                        background: `radial-gradient(circle, ${nextRank.color}20, transparent 70%)`,
                        border: `2px solid ${nextRank.color}`
                      }}
                    >
                      {getRankIcon(nextRank.id)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{nextRank.title}</h4>
                      <p className="text-white/50 text-sm">{nextRank.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/70">تحتاج</div>
                      <div className="text-xl font-black text-yellow-400">
                        {nextRank.xp - userXP} XP
                      </div>
                    </div>
                  </div>
                  
                  {/* مزايا الرتبة التالية */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-sm text-white/70 mb-2">مزايا جديدة:</div>
                    <div className="space-y-2">
                      {nextRank.perks.map((perk, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <IconStar size={14} className="text-yellow-500" />
                          <span className="text-white">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <IconCrown size={48} className="text-yellow-500 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-white mb-2">أنت في القمة!</h4>
                <p className="text-white/50">وصلت لأعلى رتبة ممكنة</p>
              </div>
            )}
          </div>
          
          {/* إحصائيات الرتبة */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<IconTrophy className="text-yellow-500" />}
              title="مركزك"
              value={`#${Math.ceil((MILITARY_RANKS.findIndex(r => r.id === currentRank?.id) + 1) * 2.5)}`}
              subtitle="عالمياً"
            />
            <StatCard
              icon={<IconSparkles className="text-cyan-500" />}
              title="النقاط"
              value={userXP.toLocaleString()}
              subtitle="XP"
            />
            <StatCard
              icon={<IconChartBar className="text-green-500" />}
              title="التقدم اليومي"
              value={`+${userStats?.dailyXP || 0}`}
              subtitle="نقاط"
            />
            <StatCard
              icon={<IconAward className="text-purple-500" />}
              title="الأوسمة"
              value={userStats?.achievements || 0}
              subtitle="إنجاز"
            />
          </div>
        </div>
        
        {/* قائمة الرتب */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <IconMedal className="text-yellow-500" />
            سلم الرتب العسكرية
          </h3>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {MILITARY_RANKS.map((rank, index) => {
              const isCurrent = currentRank?.id === rank.id;
              const isUnlocked = userXP >= rank.xp;
              
              return (
                <div
                  key={rank.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : isUnlocked
                      ? 'border-white/10 bg-white/5'
                      : 'border-white/5 bg-black/30 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{
                        background: isCurrent 
                          ? `radial-gradient(circle, ${rank.color}30, transparent 70%)`
                          : 'transparent',
                        border: `2px solid ${rank.color}`
                      }}
                    >
                      {getRankIcon(rank.id)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold ${isCurrent ? 'text-cyan-400' : 'text-white'}`}>
                          {rank.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded-full">
                            أنت هنا
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-white/50">{rank.name}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{rank.xp.toLocaleString()} XP</div>
                      <div className="text-xs text-white/30">المستوى {index + 1}</div>
                    </div>
                  </div>
                  
                  {isUnlocked && rank.perks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex flex-wrap gap-1">
                        {rank.perks.slice(0, 2).map((perk, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-white/5 rounded"
                          >
                            {perk}
                          </span>
                        ))}
                        {rank.perks.length > 2 && (
                          <span className="text-xs px-2 py-1 bg-white/5 rounded">
                            +{rank.perks.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <div className="text-sm text-white/70">{title}</div>
    </div>
    <div className="text-2xl font-black text-white">{value}</div>
    <div className="text-xs text-white/30">{subtitle}</div>
  </div>
);

export default RankSystem;