"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconMusic, 
  IconVideo, IconLoader, IconAlertTriangle, IconTerminal, 
  IconWifi, IconCheck, IconServer
} from "@tabler/icons-react";
import { VideoProcessor } from "../lib/downloadSwarm"; // استدعاء المحرك الجديد

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video");
  const [quality, setQuality] = useState("720");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]); // لتخزين سجلات النظام
  const [result, setResult] = useState(null);
  
  const logsEndRef = useRef(null);

  // دالة لإضافة سطر جديد في التيرمينال
  const addLog = (msg) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
  };

  // تمرير التيرمينال للأسفل تلقائياً
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleProcess = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setResult(null);
    setLogs([]); // تصفير السجلات
    addLog("Initializing Neural Downloader v2.0...");

    try {
      // استخراج الـ ID للصورة المصغرة (محلياً لسرعة العرض)
      let videoId = "";
      try {
        if(url.includes("youtu.be")) videoId = url.split("/").pop().split("?")[0];
        else if(url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
      } catch(e) {}
      
      const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
      if(thumb) addLog("Metadata extracted successfully.");

      // استدعاء المحرك القوي
      const data = await VideoProcessor.process(url, { format, quality }, addLog);

      addLog("Stream buffer ready. Preparing download link...");
      
      setResult({
        ...data,
        thumb
      });

    } catch (err) {
      addLog(`CRITICAL ERROR: ${err.message}`);
      addLog("System Halted.");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (link, filename) => {
    addLog("Initiating direct transfer protocol...");
    const a = document.createElement('a');
    a.href = link;
    a.download = filename || 'video';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog("Transfer started.");
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 bg-[#050505] relative flex flex-col items-center pt-10 font-sans">
      
      {/* Background Tech Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-20"></div>

      <div className="max-w-4xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-orange-900/20 rounded-full border border-orange-500/30 mb-4 shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                <IconCpu size={48} className="text-orange-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">OVERRIDE</span>
            </h1>
            <p className="text-white/40 font-mono text-xs md:text-sm uppercase tracking-[0.3em]">
                Advanced Media Extraction Protocol
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Controls */}
            <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent"></div>
                
                {/* Input */}
                <div className="mb-6">
                    <label className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <IconWifi size={14}/> Target Source
                    </label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste Secure Link..."
                            className="w-full bg-black border border-white/20 rounded-xl p-4 pl-12 text-white outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all font-mono text-sm"
                        />
                        <IconBrandYoutube className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-500 transition-colors" size={20} />
                    </div>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Mode</label>
                        <div className="flex bg-black p-1 rounded-xl border border-white/10">
                            <button onClick={() => setFormat('video')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex justify-center gap-1 ${format === 'video' ? 'bg-orange-600 text-white' : 'text-white/40'}`}>
                                <IconVideo size={14}/> VID
                            </button>
                            <button onClick={() => setFormat('audio')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex justify-center gap-1 ${format === 'audio' ? 'bg-blue-600 text-white' : 'text-white/40'}`}>
                                <IconMusic size={14}/> MP3
                            </button>
                        </div>
                    </div>
                    <div className={format === 'audio' ? 'opacity-30 pointer-events-none' : ''}>
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Quality</label>
                        <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-2 text-white text-xs h-[36px] outline-none">
                            <option value="1080">1080p (FHD)</option>
                            <option value="720">720p (HD)</option>
                            <option value="480">480p (SD)</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleProcess}
                    disabled={loading || !url}
                    className="w-full py-4 bg-white text-black font-black text-sm tracking-[0.2em] rounded-xl hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <IconLoader className="animate-spin"/> : <IconCpu/>}
                    EXECUTE
                </button>
            </div>

            {/* Right Column: Terminal & Results */}
            <div className="flex flex-col gap-4">
                
                {/* Terminal Window */}
                <div className="flex-1 bg-black border border-white/10 rounded-3xl p-4 font-mono text-xs text-green-500 overflow-hidden relative min-h-[200px] shadow-inner">
                    <div className="absolute top-2 right-4 text-[10px] text-white/20 flex gap-2">
                        <IconTerminal size={12}/> SYSTEM LOG
                    </div>
                    <div className="h-full overflow-y-auto custom-scrollbar pr-2 max-h-[200px]">
                        <div className="mb-2 text-white/30">_waiting for input...</div>
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1">
                                <span className="text-white/30">[{log.time}]</span> <span className={log.msg.includes("ERROR") ? "text-red-500" : log.msg.includes("SUCCESS") ? "text-blue-400" : "text-green-500"}>{log.msg}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>

                {/* Result Card */}
                <AnimatePresence>
                    {result && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#111] border border-green-500/50 rounded-3xl p-4 flex gap-4 items-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                            
                            <div className="w-24 h-16 bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-white/20 relative z-10">
                                {result.thumb ? <img src={result.thumb} className="w-full h-full object-cover"/> : <IconVideo className="m-auto mt-4 text-white/20"/>}
                            </div>
                            
                            <div className="flex-1 min-w-0 z-10">
                                <div className="text-xs text-green-500 font-bold mb-1 flex items-center gap-1">
                                    <IconServer size={10}/> {result.node}
                                </div>
                                <div className="text-sm font-bold text-white truncate mb-2">Media Ready</div>
                                <button 
                                    onClick={() => downloadFile(result.url, result.filename)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all w-fit"
                                >
                                    <IconDownload size={14}/> DOWNLOAD
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
      </div>
    </div>
  );
}