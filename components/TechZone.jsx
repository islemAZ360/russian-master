"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconMusic, 
  IconVideo, IconLoader, IconAlertTriangle, IconWifi
} from "@tabler/icons-react";

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleProcess = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // نرسل الطلب لملف الـ route.js الذي أنشأناه
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
    if(!link) return;
    window.open(link, '_blank');
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 bg-[#050505] flex flex-col items-center pt-20 font-sans">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                FINAL <span className="text-blue-600">SOLUTION</span>
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">RapidAPI Corrected</p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="mb-6">
                <label className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <IconWifi size={14} className="animate-pulse"/> Link
                </label>
                <div className="flex gap-2 bg-[#111] border border-white/10 p-4 rounded-xl focus-within:border-blue-500 transition-colors">
                    <input 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste YouTube Link..."
                        className="bg-transparent w-full outline-none text-white font-mono text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setFormat('video')} className={`py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${format === 'video' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#111] border-white/10 text-white/40'}`}><IconVideo size={18}/> 720p Video</button>
                <button onClick={() => setFormat('audio')} className={`py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${format === 'audio' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#111] border-white/10 text-white/40'}`}><IconMusic size={18}/> MP3 Audio</button>
            </div>

            <button 
                onClick={handleProcess}
                disabled={loading || !url}
                className="w-full py-5 bg-white text-black font-black text-sm tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
            >
                {loading ? <><IconLoader className="animate-spin"/> PROCESSING...</> : <><IconCpu/> GET LINK</>}
            </button>

            <AnimatePresence>
                {error && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 overflow-hidden">
                        <div className="p-4 bg-red-900/10 text-red-400 text-center rounded-xl border border-red-500/20 text-sm">{error}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <AnimatePresence>
            {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-[#0a0a0a] border border-green-500/30 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                    <div className="w-full md:w-40 aspect-video bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-white/10 relative z-10">
                        {result.thumb ? <img src={result.thumb} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><IconVideo/></div>}
                    </div>
                    <div className="flex-1 min-w-0 text-center md:text-left w-full relative z-10">
                        <h3 className="font-bold text-white text-lg truncate mb-4">{result.title}</h3>
                        <button onClick={() => downloadFile(result.downloadUrl)} className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20">
                            <IconDownload size={18}/> DOWNLOAD NOW
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}