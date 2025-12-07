"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconMusic, 
  IconVideo, IconLoader, IconAlertTriangle, IconWifi, 
  IconExternalLink, IconCheck, IconServer
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
      // إرسال الطلب للسيرفر (الذي سيجرب المزود الأول ثم الثاني)
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
          throw new Error(data.error || "فشل التحميل من جميع المصادر");
      }

      setResult(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // دالة التحميل الذكية (تضمن فتح الرابط)
  const downloadFile = (link) => {
    if(!link) {
        alert("خطأ: رابط التحميل غير موجود!");
        return;
    }

    // محاولة فتح في نافذة جديدة
    const newWindow = window.open(link, '_blank');

    // إذا قام المتصفح بحظر النافذة المنبثقة (Pop-up blocker)
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // نفتح الرابط في نفس الصفحة إجبارياً
        window.location.href = link;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 bg-[#050505] flex flex-col items-center pt-20 font-sans">
      <div className="max-w-2xl w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                HYBRID <span className="text-blue-600">ENGINE</span>
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">Dual-Core API System</p>
        </div>

        {/* Control Panel */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            
            {/* URL Input */}
            <div className="mb-6">
                <label className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <IconWifi size={14} className="animate-pulse"/> YouTube Link
                </label>
                <div className="flex gap-2 bg-[#111] border border-white/10 p-4 rounded-xl focus-within:border-blue-500 transition-colors">
                    <input 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste Link Here..."
                        className="bg-transparent w-full outline-none text-white font-mono text-sm"
                    />
                </div>
            </div>

            {/* Format Selector */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    onClick={() => setFormat('video')} 
                    className={`py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${format === 'video' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-[#111] border-white/10 text-white/40 hover:border-white/30'}`}
                >
                    <IconVideo size={18}/> MP4 Video
                </button>
                <button 
                    onClick={() => setFormat('audio')} 
                    className={`py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${format === 'audio' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' : 'bg-[#111] border-white/10 text-white/40 hover:border-white/30'}`}
                >
                    <IconMusic size={18}/> MP3 Audio
                </button>
            </div>

            {/* Execute Button */}
            <button 
                onClick={handleProcess}
                disabled={loading || !url}
                className="w-full py-5 bg-white text-black font-black text-sm tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <><IconLoader className="animate-spin"/> ANALYZING...</> : <><IconCpu/> GENERATE LINK</>}
            </button>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 overflow-hidden">
                        <div className="p-4 bg-red-900/10 text-red-400 text-center rounded-xl border border-red-500/20 text-sm flex items-center justify-center gap-2">
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
                    className="mt-8 bg-[#0a0a0a] border border-green-500/30 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center shadow-[0_0_60px_rgba(34,197,94,0.15)] relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                    {/* Thumbnail */}
                    <div className="w-full md:w-48 aspect-video bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-white/10 relative z-10 shadow-lg">
                        {result.thumb ? (
                            <img src={result.thumb} className="w-full h-full object-cover" alt="thumbnail"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20"><IconVideo/></div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                            {format.toUpperCase()}
                        </div>
                    </div>
                    
                    {/* Info & Download */}
                    <div className="flex-1 min-w-0 text-center md:text-left w-full relative z-10">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1">
                                <IconServer size={12}/> {result.source || "Success"}
                            </span>
                        </div>
                        
                        <h3 className="font-bold text-white text-lg truncate mb-6" title={result.title}>{result.title}</h3>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => downloadFile(result.downloadUrl)} 
                                className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 active:scale-95"
                            >
                                <IconDownload size={18}/> DOWNLOAD NOW
                            </button>
                            
                            <a 
                                href={result.downloadUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] text-white/30 hover:text-white underline text-center block transition-colors"
                            >
                                رابط مباشر (احتياطي)
                            </a>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}