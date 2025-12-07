"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconMusic, 
  IconVideo, IconLoader, IconAlertTriangle, IconCheck 
} from "@tabler/icons-react";

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video"); // video or audio
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
        body: JSON.stringify({ url, format })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
          throw new Error(data.error || "فشل التحميل");
      }

      setResult(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (link) => {
    // فتح الرابط في نافذة جديدة لبدء التحميل فوراً
    window.open(link, '_blank');
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 bg-[#050505] flex flex-col items-center pt-20 font-sans">
      
      <div className="max-w-2xl w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
            <div className="inline-block p-4 rounded-full bg-blue-900/20 border border-blue-500/30 mb-4">
                <IconBrandYoutube size={40} className="text-blue-500" />
            </div>
            <h1 className="text-5xl font-black text-white mb-2">RAPID <span className="text-blue-500">LINK</span></h1>
            <p className="text-white/40 font-mono tracking-widest text-xs uppercase">Premium API Gateway</p>
        </div>

        {/* Input Area */}
        <div className="bg-[#111] border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            
            {/* URL Input */}
            <div className="flex gap-2 bg-black border border-white/10 p-2 rounded-xl mb-4 focus-within:border-blue-500 transition-colors">
                <input 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube Link Here..."
                    className="bg-transparent w-full outline-none text-white font-mono text-sm px-2"
                />
            </div>

            {/* Options */}
            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setFormat('video')}
                    className={`flex-1 py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${format === 'video' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                    <IconVideo size={16}/> MP4 VIDEO
                </button>
                <button 
                    onClick={() => setFormat('audio')}
                    className={`flex-1 py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${format === 'audio' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                    <IconMusic size={16}/> MP3 AUDIO
                </button>
            </div>

            {/* Action Button */}
            <button 
                onClick={handleProcess}
                disabled={loading || !url}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
            >
                {loading ? <><IconLoader className="animate-spin"/> PROCESSING...</> : <><IconCpu/> GENERATE LINK</>}
            </button>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 overflow-hidden">
                        <div className="p-4 bg-red-900/20 text-red-400 text-center rounded-xl border border-red-500/20 text-sm flex items-center justify-center gap-2">
                            <IconAlertTriangle size={16}/> {error}
                        </div>
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
                    className="mt-6 bg-[#111] border border-green-500/30 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center shadow-2xl shadow-green-900/10"
                >
                    <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        {result.thumb && <img src={result.thumb} className="w-full h-full object-cover" alt="Thumb"/>}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center md:text-left w-full">
                        <h3 className="font-bold text-white truncate mb-1">{result.title}</h3>
                        <div className="text-xs text-white/40 mb-4 uppercase tracking-wider font-mono">Ready to download</div>
                        
                        <button 
                            onClick={() => downloadFile(result.downloadUrl)}
                            className="w-full md:w-auto px-6 py-3 bg-green-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-500 transition-all shadow-lg shadow-green-900/20"
                        >
                            <IconDownload size={16}/> DOWNLOAD NOW
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}