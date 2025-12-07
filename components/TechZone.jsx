"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconMusic, 
  IconVideo, IconLoader, IconAlertTriangle 
} from "@tabler/icons-react";

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video"); // video | audio
  const [quality, setQuality] = useState("720"); // 1080, 720, 480, 360
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleProcess = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format, quality })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "فشل في المعالجة");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="w-full h-screen overflow-y-auto custom-scrollbar p-6 pb-32 bg-[#050505] relative flex flex-col items-center pt-20">
      
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      <div className="max-w-3xl w-full relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center animate-in fade-in slide-in-from-top-5 duration-700">
            <div className="inline-flex items-center justify-center p-4 bg-red-900/20 rounded-full border border-red-500/30 mb-4 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <IconBrandYoutube size={48} className="text-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                TECH <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">ZONE</span>
            </h1>
            <p className="text-white/40 font-mono text-sm uppercase tracking-[0.2em]">
                Advanced Stream Extraction System
            </p>
        </div>

        {/* Control Panel */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Input */}
            <div className="mb-6 relative">
                <label className="text-xs text-red-500 font-bold uppercase tracking-widest mb-2 block ml-1">Target URL</label>
                <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube Link Here..."
                    className="w-full bg-black border border-white/20 rounded-xl p-4 text-white outline-none focus:border-red-500 focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all font-mono"
                />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Format Selector */}
                <div>
                    <label className="text-xs text-white/50 font-bold uppercase tracking-widest mb-2 block ml-1">Format Mode</label>
                    <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                        <button 
                            onClick={() => setFormat('video')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${format === 'video' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                        >
                            <IconVideo size={18} /> VIDEO
                        </button>
                        <button 
                            onClick={() => setFormat('audio')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${format === 'audio' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                        >
                            <IconMusic size={18} /> AUDIO
                        </button>
                    </div>
                </div>

                {/* Quality Selector */}
                <div className={`${format === 'audio' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="text-xs text-white/50 font-bold uppercase tracking-widest mb-2 block ml-1">Resolution</label>
                    <select 
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-red-500 h-[52px]"
                    >
                        <option value="1080">1080p (FHD)</option>
                        <option value="720">720p (HD)</option>
                        <option value="480">480p</option>
                    </select>
                </div>
            </div>

            {/* Action Button */}
            <button 
                onClick={handleProcess}
                disabled={loading || !url}
                className="w-full py-5 bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 text-white font-black text-lg tracking-[0.2em] rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
            >
                {loading ? (
                    <><IconLoader className="animate-spin" /> PROCESSING...</>
                ) : (
                    <>
                        <span className="relative z-10 flex items-center gap-2">INITIATE DOWNLOAD <IconCpu /></span>
                    </>
                )}
            </button>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400"
                    >
                        <IconAlertTriangle />
                        <span className="text-sm font-bold">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Result Area */}
        <AnimatePresence>
            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-[#111] border border-green-500/30 rounded-3xl p-6 relative overflow-hidden group"
                >
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        {/* Thumbnail */}
                        <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden border border-white/10 relative">
                            {result.thumb ? (
                                <img src={result.thumb} alt="thumb" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center"><IconVideo /></div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left min-w-0">
                            <h3 className="text-xl font-bold text-white mb-2 truncate">{result.title}</h3>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                <span className="px-3 py-1 bg-white/10 rounded text-xs text-white/70 uppercase font-mono">
                                    {format.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Download Button */}
                        <button 
                            onClick={() => downloadFile(result.url)}
                            className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <IconDownload size={20} />
                            DOWNLOAD
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}