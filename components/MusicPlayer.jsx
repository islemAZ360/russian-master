import React, { useState } from "react";
import { IconMusic, IconPlayerPlay, IconPlayerPause, IconPlayerSkipForward, IconPlayerSkipBack, IconPlus, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export function MusicPlayer({ music }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { playlist, currentTrack, isPlaying, addFiles, playPause, nextTrack, prevTrack, audioRef, onEnded } = music;

  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col items-end font-sans">
      <audio ref={audioRef} src={currentTrack?.src} onEnded={onEnded} />

      {/* زر العائمة الرئيسي */}
      <motion.button 
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 bg-black/50 backdrop-blur-xl border border-white/10 p-3 rounded-full shadow-2xl hover:bg-white/10 transition-all ${isPlaying ? 'border-purple-500/50 shadow-purple-900/20' : ''}`}
      >
        <div className="relative">
            <IconMusic size={20} className={isPlaying ? "text-purple-400" : "text-white/50"} />
            {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
            )}
        </div>
        {isExpanded && <span className="text-sm font-bold pr-2">Music Station</span>}
      </motion.button>

      {/* القائمة المنبثقة */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="w-80 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl overflow-hidden mt-2"
          >
            {/* Visualizer Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient-x" />

            {/* Track Info */}
            <div className="mb-6 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-inner flex items-center justify-center mb-4 border border-white/5">
                    {isPlaying ? (
                        <div className="flex gap-1 items-end h-8">
                            <div className="w-1 bg-purple-500 animate-[music-bar_0.5s_ease-in-out_infinite] h-4" />
                            <div className="w-1 bg-pink-500 animate-[music-bar_0.7s_ease-in-out_infinite] h-8" />
                            <div className="w-1 bg-blue-500 animate-[music-bar_0.4s_ease-in-out_infinite] h-6" />
                            <div className="w-1 bg-purple-500 animate-[music-bar_0.6s_ease-in-out_infinite] h-3" />
                        </div>
                    ) : (
                        <IconMusic size={32} className="text-white/20" />
                    )}
                </div>
                <h3 className="text-white font-bold truncate">{currentTrack?.name || "No Track Selected"}</h3>
                <p className="text-white/30 text-xs uppercase tracking-widest">{playlist.length} Tracks in Queue</p>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-6 mb-6">
                <button onClick={prevTrack} className="text-white/50 hover:text-white transition-colors"><IconPlayerSkipBack size={24} /></button>
                <button onClick={playPause} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    {isPlaying ? <IconPlayerPause size={24} fill="black" /> : <IconPlayerPlay size={24} fill="black" className="ml-1" />}
                </button>
                <button onClick={nextTrack} className="text-white/50 hover:text-white transition-colors"><IconPlayerSkipForward size={24} /></button>
            </div>

            {/* Upload Button */}
            <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors text-xs font-bold text-white/70 uppercase tracking-wider">
                <IconPlus size={16} /> Add Local Songs
                <input type="file" accept="audio/*" multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
            </label>

            <style jsx>{`
                @keyframes music-bar {
                    0%, 100% { height: 20%; }
                    50% { height: 100%; }
                }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}