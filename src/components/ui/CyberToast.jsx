"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconAlertTriangle, IconCheck, IconInfoCircle } from "@tabler/icons-react";

export const CyberToast = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-24 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <ToastItem key={notif.id} notif={notif} onRemove={removeNotification} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ notif, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notif.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notif.id, onRemove]);

  const styles = {
    success: { border: "border-green-500", bg: "bg-green-900/80", icon: <IconCheck className="text-green-400" /> },
    error: { border: "border-red-500", bg: "bg-red-900/80", icon: <IconAlertTriangle className="text-red-400" /> },
    info: { border: "border-cyan-500", bg: "bg-cyan-900/80", icon: <IconInfoCircle className="text-cyan-400" /> },
  };

  const currentStyle = styles[notif.type] || styles.info;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 100, opacity: 0, scale: 0.8 }}
      className={`pointer-events-auto min-w-[280px] max-w-sm p-4 rounded-lg border-l-4 ${currentStyle.border} ${currentStyle.bg} backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-3 relative overflow-hidden`}
    >
      {/* Glitch Effect Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20 animate-pulse"></div>
      
      <div className="p-2 bg-black/40 rounded-full border border-white/10">
        {currentStyle.icon}
      </div>
      <div>
        <h4 className="font-bold text-white text-sm uppercase tracking-wider">{notif.title}</h4>
        <p className="text-white/70 text-xs font-mono">{notif.message}</p>
      </div>
    </motion.div>
  );
};