"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  IconRocket, IconTerminal, IconSparkles, IconActivity, 
  IconSchool, IconShieldLock, IconBook 
} from "@tabler/icons-react";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { DecryptText } from "@/components/ui/DecryptText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useSettings } from "@/context/SettingsContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/context/AuthContext";

export function HeroSection({ onStart, onOpenGame }) {
  const { isDark } = useSettings();
  const { t, dir, isRTL } = useLanguage();
  const { user, userData, isTeacher, isStudent, isAdmin } = useAuth();

  // تخصيص الواجهة بناءً على الرتبة
  let roleTitle = "OPERATIVE";
  let mainActionText = t('btn_start');
  let statusText = t('hero_status');
  let RoleIcon = IconRocket;
  let subMessage = t('hero_line2');

  if (isAdmin) {
      roleTitle = "COMMANDER";
      mainActionText = "SYSTEM CONTROL";
      statusText = "SYSTEM: ROOT ACCESS";
      RoleIcon = IconShieldLock;
      subMessage = "> Full command privileges active.";
  } else if (isTeacher) {
      roleTitle = "INSTRUCTOR";
      mainActionText = "MANAGE CLASS"; // الأستاذ يذهب لإدارة المحتوى/الطلاب
      statusText = "SYSTEM: CLASSROOM ACTIVE";
      RoleIcon = IconSchool;
      subMessage = "> Monitoring student progress.";
  } else if (isStudent) {
      roleTitle = "STUDENT";
      mainActionText = "CONTINUE MISSION"; // الطالب يذهب للدراسة
      statusText = "SYSTEM: LEARNING MODE";
      RoleIcon = IconBook;
      subMessage = "> Neural link established with teacher.";
  }

  // تحديد الاسم الذي سيظهر في التأثير المشفر
  const userName = user?.displayName || user?.email?.split('@')[0]?.toUpperCase() || roleTitle;

  return (
    <div 
      className="w-full h-full flex flex-col md:flex-row items-center justify-between p-6 md:p-12 relative z-10 gap-12" 
      dir={dir}
    >
      {/* القسم الأيسر: الترحيب والحالة */}
      <motion.div 
        initial={{ opacity: 0, x: isRTL ? 50 : -50 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 space-y-8"
      >
        {/* شارة حالة النظام */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black tracking-[0.2em] uppercase ${
          isDark 
            ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400' 
            : 'border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm'
        }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]' : 'bg-emerald-500'}`}></span> 
            {statusText}
        </div>
        
        <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className={`text-5xl md:text-7xl font-black leading-tight mb-4 tracking-tighter ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
                {t('hero_welcome')} <br/>
                <span className={`text-transparent bg-clip-text drop-shadow-sm ${
                  isDark 
                    ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500' 
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600'
                }`}>
                    <DecryptText text={userName} />
                </span>
            </h1>
            
            <div className={`font-mono text-sm md:text-base border-l-4 pl-6 mt-6 py-2 ${
              isDark 
                ? 'text-white/40 border-purple-500/50 bg-white/[0.02]' 
                : 'text-zinc-500 border-indigo-400 bg-black/[0.02]'
            }`}>
                <p className="mb-1">{t('hero_line1')}</p>
                <p>{subMessage}</p>
            </div>
        </div>

        {/* كروت الإحصائيات المصغرة */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 mt-10"
        >
            <StatPill value={userData?.xp || 0} label={t('profile_exp')} color="text-cyan-500" isDark={isDark} />
            <StatPill value={Math.floor((userData?.xp||0)/500)+1} label={t('profile_lvl')} color="text-purple-500" isDark={isDark} />
            <StatPill value={userData?.streak || 0} label="STREAK" color="text-emerald-500" isDark={isDark} />
        </motion.div>
      </motion.div>

      {/* القسم الأيمن: الأزرار الرئيسية */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex-1 flex flex-col items-center justify-center gap-10 relative"
      >
        {/* الزر الرئيسي (المغناطيسي) */}
        <MagneticButton 
            onClick={() => {
                // تنفيذ الإجراء المناسب عند الضغط
                if (isTeacher && !isAdmin) {
                    // الأستاذ يذهب لإدارة المحتوى (Teacher DB)
                    // ملاحظة: يتم تمرير onStart من ViewManager أو Page، وسيقوم Page.js بالتعامل مع التوجيه
                    // ولكن لضمان التوجيه الصحيح يمكننا استخدام الدالة الممررة
                    onStart(); 
                } else if (isAdmin) {
                    // الأدمن يذهب للوحة التحكم (إذا كانت الدالة ممررة)
                     // في Page.js قمنا بتمرير onOpenAdmin للأدمن
                     // ولكن هنا نستخدم onStart العامة التي توجه للـ Category/Study
                     // يمكن للأدمن استخدام الشريط السفلي للوصول للوحة التحكم
                    onStart();
                } else {
                    // الطالب يذهب للدراسة
                    onStart(); 
                }
            }} 
            className="group relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center focus:outline-none"
        >
            <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-[spin_15s_linear_infinite] ${
              isDark ? 'border-cyan-500/20' : 'border-indigo-400/30'
            }`}></div>
            
            <div className={`w-52 h-52 md:w-56 md:h-56 rounded-full border flex flex-col items-center justify-center z-10 relative overflow-hidden transition-transform group-hover:scale-105 ${
              isDark 
                ? 'bg-gradient-to-br from-[#0a0a0a] to-[#121212] border-white/10 shadow-[0_0_60px_rgba(6,182,212,0.15)]' 
                : 'bg-white border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
            }`}>
                <BorderBeam 
                  size={250} 
                  duration={10} 
                  colorFrom={isDark ? "#06b6d4" : "#4f46e5"} 
                  colorTo={isDark ? "#a855f7" : "#10b981"} 
                />
                <RoleIcon size={56} className={isDark ? 'text-white mb-4' : 'text-indigo-600 mb-4'} />
                <span className={`text-xl md:text-2xl font-black tracking-[0.2em] uppercase text-center px-4 leading-none ${
                  isDark ? 'text-white' : 'text-zinc-800'
                }`}>
                    {mainActionText}
                </span>
            </div>
        </MagneticButton>

        {/* زر التسلل العصبي (الألعاب) */}
        {/* يظهر للجميع، بما فيهم الطالب الآن */}
        <MagneticButton 
          onClick={onOpenGame} 
          className={`relative group w-full max-w-sm overflow-hidden rounded-[1.5rem] border p-6 transition-all active:scale-95 ${
            isDark 
              ? 'border-red-500/30 bg-red-950/10 hover:bg-red-950/20 hover:border-red-500' 
              : 'border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 shadow-sm'
          }`}
        >
            <BorderBeam 
              size={180} 
              duration={6} 
              colorFrom={isDark ? "#ef4444" : "#f97316"} 
              colorTo={isDark ? "#dc2626" : "#ea580c"} 
            />
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-red-500/20' : 'bg-white shadow-sm'}`}>
                        <IconTerminal size={28} className={isDark ? 'text-red-500' : 'text-orange-600'}/>
                    </div>
                    <div className={isRTL ? "text-right" : "text-left"}>
                        <div className={`text-sm font-black tracking-widest uppercase ${
                          isDark ? 'text-red-500' : 'text-orange-800'
                        }`}>{t('btn_hacking')}</div>
                        <div className={`text-[10px] font-mono font-bold mt-1 opacity-60 ${
                          isDark ? 'text-red-400' : 'text-orange-600'
                        }`}>{t('hacking_sub')}</div>
                    </div>
                </div>
                <IconSparkles className={isDark ? 'text-red-500/20' : 'text-orange-400/30'} size={32} />
            </div>
        </MagneticButton>
      </motion.div>
    </div>
  );
}

function StatPill({ value, label, color, isDark }) {
    return (
        <div className={`px-5 py-3 rounded-2xl border backdrop-blur-md flex items-center gap-3 transition-all hover:-translate-y-1 ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.02] border-black/5 shadow-sm'
        }`}>
            <IconActivity size={16} className={color} />
            <div>
                <div className={`text-lg font-black leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>{value}</div>
                <div className="text-[9px] font-black uppercase tracking-wider opacity-40 mt-1">{label}</div>
            </div>
        </div>
    );
}