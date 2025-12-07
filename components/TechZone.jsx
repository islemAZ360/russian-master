"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconMusic, 
  IconVideo, IconLoader, IconTerminal, IconWifi, IconCheck, 
  IconServer, IconShieldBolt, IconRefresh
} from "@tabler/icons-react";

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video");
  const [quality, setQuality] = useState("720");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]); 
  const [result, setResult] = useState(null);
  
  const logsEndRef = useRef(null);

  const addLog = (msg, type = "info") => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { time: timestamp, msg, type }]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleProcess = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setResult(null);
    setLogs([]); 
    
    addLog(`Target Locked: ${url}`, "info");
    addLog("Engaging Swarm Protocol (8 Nodes)...", "system");

    try {
      // 1. استخراج الصورة للمظهر فقط
      let videoId = "";
      try {
        if(url.includes("youtu.be")) videoId = url.split("/").pop().split("?")[0];
        else if(url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
      } catch(e) {}
      const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

      // 2. إرسال الطلب للسيرفر القوي
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format, quality })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
          throw new Error(data.details || data.error || "Connection Refused");
      }

      // 3. النجاح
      addLog(`[SUCCESS] Connection Secured: ${data.node}`, "success");
      addLog("Stream Decrypted. Ready for Extract.", "success");
      
      setResult({
        url: data.data.url,
        filename: data.data.filename,
        node: data.node,
        thumb
      });

    } catch (err) {
      addLog(`FAILURE: ${err.message}`, "error");
      addLog("Tip: Check link or try again.", "warning");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (link, filename) => {
    addLog(`Downloading: ${filename}...`, "info");
    const a = document.createElement('a');
    a.href = link;
    a.download = filename || 'video.mp4';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog("Transfer Active.", "success");
  };

  const getLogColor = (type) => {
      switch(type) {
          case "error": return "text-red-500 font-bold";
          case "success": return "text-emerald-400 font-bold";
          case "warning": return "text-yellow-400";
          case "system": return "text-cyan-400";
          default: return "text-white/60";
      }
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 bg-[#050505] relative flex flex-col items-center pt-10 font-sans">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e91a_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e91a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none opacity-20"></div>

      <div className="max-w-5xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-cyan-900/10 rounded-full border border-cyan-500/30 mb-4 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                <IconShieldBolt size={48} className="text-cyan-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                NEXUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">DOWNLOADER</span>
            </h1>
            <p className="text-white/40 font-mono text-xs md:text-sm uppercase tracking-[0.3em]">
                Multi-Node Extraction System
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Controls */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-transparent"></div>
                
                <div className="mb-6">
                    <label className="text-xs text-cyan-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <IconWifi size={14} className="animate-pulse"/> Video Link
                    </label>
                    <div className="relative group/input">
                        <input 
                            type="text" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://youtu.be/..."
                            className="w-full bg-[#111] border border-white/20 rounded-xl p-4 pl-12 text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all font-mono text-sm placeholder:text-white/20"
                        />
                        <IconBrandYoutube className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-cyan-500 transition-colors" size={20} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Format</label>
                        <div className="flex bg-[#111] p-1 rounded-xl border border-white/10">
                            <button onClick={() => setFormat('video')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex justify-center gap-1 ${format === 'video' ? 'bg-cyan-700 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                                <IconVideo size={14}/> MP4
                            </button>
                            <button onClick={() => setFormat('audio')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex justify-center gap-1 ${format === 'audio' ? 'bg-blue-700 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                                <IconMusic size={14}/> MP3
                            </button>
                        </div>
                    </div>
                    <div className={format === 'audio' ? 'opacity-30 pointer-events-none' : ''}>
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Quality</label>
                        <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl p-2 text-white text-xs h-[36px] outline-none focus:border-cyan-500">
                            <option value="1080">1080p</option>
                            <option value="720">720p</option>
                            <option value="480">480p</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleProcess}
                    disabled={loading || !url}
                    className="w-full py-4 bg-white text-black font-black text-sm tracking-[0.2em] rounded-xl hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
                >
                    {loading ? (
                        <span className="flex items-center gap-2"><IconLoader className="animate-spin"/> CONNECTING...</span>
                    ) : (
                        <span className="flex items-center gap-2"><IconCpu/> INITIALIZE</span>
                    )}
                </button>
            </div>

            {/* Terminal */}
            <div className="flex flex-col gap-4">
                <div className="flex-1 bg-black border border-white/10 rounded-3xl p-5 font-mono text-xs overflow-hidden relative min-h-[250px] shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                        <div className="flex gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                            <IconTerminal size={14}/> Console
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                        </div>
                    </div>
                    
                    <div className="h-full overflow-y-auto custom-scrollbar pr-2 max-h-[220px] space-y-1">
                        <div className="text-white/20 italic">_root@nexus:~$ waiting...</div>
                        {logs.map((log, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                key={i} 
                                className="flex gap-2"
                            >
                                <span className="text-white/20 shrink-0">[{log.time}]</span> 
                                <span className={getLogColor(log.type)}>{log.msg}</span>
                            </motion.div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>

                {/* Result */}
                <AnimatePresence>
                    {result && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="bg-[#0f0f0f] border border-cyan-500 rounded-2xl p-4 flex gap-4 items-center relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                        >
                            <div className="w-20 h-14 bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-white/20 relative">
                                {result.thumb ? <img src={result.thumb} className="w-full h-full object-cover opacity-80"/> : <IconVideo className="m-auto mt-3 text-white/20"/>}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-cyan-500 font-bold mb-0.5 flex items-center gap-1 uppercase tracking-wider">
                                    <IconServer size={10}/> {result.node}
                                </div>
                                <div className="text-sm font-bold text-white truncate mb-2">Ready for Download</div>
                                <button 
                                    onClick={() => downloadFile(result.url, result.filename)}
                                    className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] font-bold rounded flex items-center gap-2 transition-all w-fit uppercase tracking-widest"
                                >
                                    <IconDownload size={12}/> SAVE FILE
                                </button>
                            </div>
                            
                            <IconCheck className="absolute top-4 right-4 text-cyan-500/10" size={60} />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
      </div>
    </div>
  );
}