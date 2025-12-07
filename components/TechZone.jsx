"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconMusic, 
  IconVideo, IconLoader, IconAlertTriangle, IconCheck, 
  IconWifi
} from "@tabler/icons-react";

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("mp3"); // الافتراضي mp3 لأنه أسرع
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleProcess = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // إعدادات RapidAPI (من بياناتك)
      const apiKey = "dadaa32ee3mshea65c3b698adda9p1bd70fjsn7f23dfd97126"; 
      const apiHost = "youtube-info-download-api.p.rapidapi.com";
      
      // تجهيز الرابط
      const targetFormat = format === 'audio' ? 'mp3' : 'mp4';
      // نستخدم نقطة نهاية مختلفة وأسرع
      const apiUrl = `https://${apiHost}/ajax/download.php?format=${targetFormat}&url=${encodeURIComponent(url)}`;

      console.log("Connecting to RapidAPI..."); // للتأكد من الفحص

      // الاتصال المباشر من المتصفح (لتفادي مشكلة الـ 10 ثواني في Vercel)
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": apiHost
        }
      });

      if (!response.ok) {
          throw new Error(`خطأ في السيرفر: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // لرؤية البيانات في الكونسول

      if (!data.success && !data.url) {
          throw new Error("لم يتمكن السيرفر من استخراج الرابط. حاول فيديو آخر.");
      }

      setResult({
        title: data.title || "YouTube Media",
        thumb: data.poster || null,
        downloadUrl: data.url
      });

    } catch (err) {
      console.error(err);
      setError(err.message || "حدث خطأ غير متوقع");
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
        
        {/* Header */}
        <div className="text-center mb-10">
            <div className="inline-block p-4 rounded-full bg-blue-900/10 border border-blue-500/20 mb-4 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                <IconBrandYoutube size={48} className="text-blue-500" />
            </div>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                ULTIMATE <span className="text-blue-500">DOWNLOADER</span>
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">
                Powered by RapidAPI Enterprise
            </p>
        </div>

        {/* Input Area */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent"></div>

            {/* URL Input */}
            <div className="mb-6">
                <label className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <IconWifi size={14} className="animate-pulse"/> Video URL
                </label>
                <div className="flex gap-2 bg-[#111] border border-white/10 p-4 rounded-xl focus-within:border-blue-500 transition-colors">
                    <input 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://youtu.be/..."
                        className="bg-transparent w-full outline-none text-white font-mono text-sm"
                    />
                </div>
            </div>

            {/* Format Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    onClick={() => setFormat('video')}
                    className={`py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${format === 'video' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-[#111] border-white/10 text-white/40 hover:border-white/30'}`}
                >
                    <IconVideo size={18}/> MP4 VIDEO
                </button>
                <button 
                    onClick={() => setFormat('audio')}
                    className={`py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${format === 'audio' ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-[#111] border-white/10 text-white/40 hover:border-white/30'}`}
                >
                    <IconMusic size={18}/> MP3 AUDIO
                </button>
            </div>

            {/* Action Button */}
            <button 
                onClick={handleProcess}
                disabled={loading || !url}
                className="w-full py-5 bg-white text-black font-black text-sm tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <><IconLoader className="animate-spin"/> PROCESSING...</> : <><IconCpu/> START ENGINE</>}
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
                    className="mt-8 bg-[#0a0a0a] border border-green-500/30 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center shadow-[0_0_50px_rgba(34,197,94,0.1)] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20 text-green-500">
                        <IconCheck size={100} />
                    </div>

                    <div className="w-full md:w-40 aspect-video bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-white/10 relative z-10">
                        {result.thumb ? <img src={result.thumb} className="w-full h-full object-cover" alt="Thumb"/> : <div className="w-full h-full flex items-center justify-center text-white/20"><IconVideo/></div>}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center md:text-left w-full relative z-10">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded border border-green-500/20 uppercase">Success</span>
                            <span className="px-2 py-0.5 bg-white/5 text-white/40 text-[10px] font-bold rounded border border-white/10 uppercase">{format}</span>
                        </div>
                        <h3 className="font-bold text-white text-lg truncate mb-6">{result.title}</h3>
                        
                        <button 
                            onClick={() => downloadFile(result.downloadUrl)}
                            className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                        >
                            <IconDownload size={18}/> DOWNLOAD FILE
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}