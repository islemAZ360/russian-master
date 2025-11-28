import React from "react";
import { IconTrophy, IconFlame, IconActivity, IconSchool } from "@tabler/icons-react";

export function StatsView({ cards }) {
  const total = cards.length;
  const mastered = cards.filter(c => c.level >= 5).length;
  const learning = cards.filter(c => c.level > 0 && c.level < 5).length;
  const fresh = cards.filter(c => c.level === 0).length;
  
  // Fake calculation for "Streak" & "XP" just for gamification feel
  const xp = (mastered * 100) + (learning * 20);
  const nextLevelXp = Math.ceil((xp + 1) / 500) * 500;
  const progress = (xp / nextLevelXp) * 100;
  const level = Math.floor(xp / 500) + 1;

  const StatCard = ({ icon: Icon, title, value, color, sub }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={80} />
        </div>
        <div className={`p-3 rounded-lg w-fit mb-4 ${color} bg-opacity-20 text-white`}>
            <Icon size={24} />
        </div>
        <div className="text-4xl font-black text-white mb-1">{value}</div>
        <div className="text-white/50 font-medium uppercase tracking-wider text-xs">{title}</div>
        {sub && <div className="mt-2 text-xs text-white/30">{sub}</div>}
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-6 font-sans">
      
      {/* Level Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 p-8 rounded-3xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)] border-4 border-black">
                <span className="text-4xl font-black text-black">Lvl {level}</span>
            </div>
            <div className="flex-1 w-full">
                <div className="flex justify-between text-white mb-2">
                    <span className="font-bold">Scholar Rank</span>
                    <span className="text-white/50 text-sm">{xp} / {nextLevelXp} XP</span>
                </div>
                <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-white/40 text-sm">Review more words to verify your knowledge and level up.</p>
            </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={IconSchool} title="Total Words" value={total} color="bg-blue-500" sub="Your entire library" />
        <StatCard icon={IconTrophy} title="Mastered" value={mastered} color="bg-emerald-500" sub="Level 5 (Permanent)" />
        <StatCard icon={IconActivity} title="Learning" value={learning} color="bg-purple-500" sub="In progress" />
        <StatCard icon={IconFlame} title="New" value={fresh} color="bg-orange-500" sub="Not started yet" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Badges</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{name: "Rookie", desc: "Added 5 words", unlocked: total >= 5}, 
          {name: "Scholar", desc: "Mastered 10 words", unlocked: mastered >= 10},
          {name: "Collector", desc: "100 Total Words", unlocked: total >= 100},
          {name: "Expert", desc: "Level 10 Reached", unlocked: level >= 10}
        ].map((badge, i) => (
            <div key={i} className={`p-4 rounded-xl border flex flex-col items-center text-center ${badge.unlocked ? 'bg-white/10 border-emerald-500/30' : 'bg-black/40 border-white/5 opacity-50'}`}>
                <div className={`mb-2 text-2xl ${badge.unlocked ? '' : 'grayscale'}`}>
                    {badge.unlocked ? '🥇' : '🔒'}
                </div>
                <div className={`font-bold ${badge.unlocked ? 'text-white' : 'text-white/40'}`}>{badge.name}</div>
                <div className="text-[10px] text-white/30 mt-1">{badge.desc}</div>
            </div>
        ))}
      </div>
    </div>
  );
}