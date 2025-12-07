"use client";
import React, { useState } from "react";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconMusic, 
  IconVideo, IconLoader, IconAlertTriangle, IconWifi, 
  IconCheck, IconServer
} from "@tabler/icons-react";

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // قائمة خوادم Invidious القوية (تدعم CORS)
  const INVIDIOUS_INSTANCES = [
    "https://inv.tux.pizza",
    "https://invidious.projectsegfau.lt",
    "https://vid.uff.anze.logar.si",
    "https://invidious.protokolla.fi"
  ];

  const handleProcess = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setResult(null);
    setError(null);

    // 1. استخراج الـ ID
    let videoId = "";
    try {
        if (url.includes("youtu.be")) videoId = url.split("/").pop().split("?")[0];
        else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
        else if (url.includes("shorts")) videoId = url.split("shorts/")[1].split("?")[0];
    } catch(e) {}

    if (!videoId) {
        setError("رابط غير صحيح");
        setLoading(false);
        return;
    }

    // 2. الهجوم على الخوادم (Client-Side)
    let foundData = null;
    let usedInstance = "";

    for (const instance of INVIDIOUS_INSTANCES) {
        try {
            console.log(`Connecting to ${instance}...`);
            const res = await fetch(`${instance}/api/v1/videos/${videoId}`, {
                method: 'GET',
                // لا نضع headers معقدة لتجنب مشاكل CORS
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.formatStreams && data.formatStreams.length > 0) {
                    foundData = data;
                    usedInstance = new URL(instance).hostname;
                    break; // وجدنا البيانات! توقف.
                }
            }
        } catch (e) {
            console.warn(`Failed to fetch from ${instance}`);
        }
    }

    if (foundData) {
        // استخراج أفضل فيديو (MP4 720p أو أعلى)
        // نبحث عن container: mp4
        const mp4Videos = foundData.formatStreams.filter(v => v.container === 'mp4');
        const bestVideo = mp4Videos.find(v => v.qualityLabel === '720p') || mp4Videos[0]; // نفضل 720p أو نأخذ أي شيء

        setResult({
            title: foundData.title,
            thumb: foundData.videoThumbnails?.find(t => t.quality === 'high')?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            downloadUrl: bestVideo?.url || foundData.formatStreams[0].url, // الرابط المباشر
            source: usedInstance
        });
    } else {
        setError("فشلت جميع السيرفرات في جلب الفيديو. قد يكون الفيديو محظوراً جغرافياً.");
    }

    setLoading(false);
  };

  const downloadFile = (link, title) => {
    if(!link) return;
    // فتح الرابط في نافذة جديدة (لأن جوجل تمنع التحميل المباشر أحياناً داخل Iframe)
    window.open(link, '_blank');
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 bg-[#050505] flex flex-col items-center pt-20 font-sans">
      <div className="max-w-2xl w-full">
        
        <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                INVIDIOUS <span className="text-red-600">CORE</span>
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">
                Decentralized & Direct
            </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="mb-6">
                <label className="text-xs text-red-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <IconWifi size={14} className="animate-pulse"/> YouTube URL
                </label>
                <div className="flex gap-2 bg-[#111] border border-white/10 p-4 rounded-xl focus-within:border-red-500 transition-colors">
                    <input 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://youtu.be/..."
                        className="bg-transparent w-full outline-none text-white font-mono text-sm"
                    />
                </div>
            </div>

            <button 
                onClick={handleProcess}
                disabled={loading || !url}
                className="w-full py-5 bg-white text-black font-black text-sm tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
            >
                {loading ? <><IconLoader className="animate-spin"/> CONNECTING...</> : <><IconCpu/> FETCH VIDEO</>}
            </button>

            {error && (
                <div className="mt-6 p-4 bg-red-900/10 text-red-400 text-center rounded-xl border border-red-500/20 text-sm">
                    {error}
                </div>
            )}
        </div>

        {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-[#0a0a0a] border border-green-500/30 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                <div className="w-full md:w-40 aspect-video bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-white/10 relative z-10">
                    <img src={result.thumb} className="w-full h-full object-cover" alt="Thumb"/>
                </div>
                <div className="flex-1 min-w-0 text-center md:text-left w-full relative z-10">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <IconServer size={10}/> {result.source}
                        </span>
                    </div>
                    <h3 className="font-bold text-white text-lg truncate mb-4">{result.title}</h3>
                    <button 
                        onClick={() => downloadFile(result.downloadUrl, result.title)}
                        className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                    >
                        <IconDownload size={18}/> DIRECT DOWNLOAD
                    </button>
                </div>
            </motion.div>
        )}

      </div>
    </div>
  );
}