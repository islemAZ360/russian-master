"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconMusic, 
  IconVideo, IconLoader, IconTerminal, IconWifi, IconCheck, 
  IconServer, IconDatabase, IconPlayerPlay
} from "@tabler/icons-react";

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video");
  const [quality, setQuality] = useState("1080p");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]); 
  const [result, setResult] = useState(null);
  
  const logsEndRef = useRef(null);

  // --- جيش خوادم Piped (API Swarm) ---
  // هذه الخوادم مصممة لتعطي روابط مباشرة وتدعم العمل من المتصفح
  const PIPED_NODES = [
    "https://api.piped.video",           // الرسمي
    "https://pipedapi.kavin.rocks",      // خادم قوي جداً
    "https://api.piped.projectsegfau.lt", // خادم أوروبي
    "https://pipedapi.drgns.space",
    "https://piped-api.lunar.icu",
    "https://api.piped.privacy.com.de"
  ];

  const addLog = (msg, type = "info") => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { time: timestamp, msg, type }]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // دالة استخراج ID الفيديو
  const extractVideoID = (link) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = link.match(regex);
    return match ? match[1] : null;
  };

  const handleProcess = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setResult(null);
    setLogs([]); 
    
    const videoId = extractVideoID(url);

    if (!videoId) {
        addLog("Invalid YouTube URL format.", "error");
        setLoading(false);
        return;
    }

    addLog(`Target ID Identified: ${videoId}`, "info");
    addLog("Initializing Piped API Swarm...", "system");

    try {
      let data = null;
      let connectedNode = "";

      // الهجوم على الخوادم (Swarm Attack)
      for (const node of PIPED_NODES) {
          try {
              addLog(`>>> Handshake with ${new URL(node).hostname}...`, "system");
              
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 ثواني لكل خادم

              const response = await fetch(`${node}/streams/${videoId}`, {
                  signal: controller.signal
              });
              
              clearTimeout(timeoutId);

              if (response.ok) {
                  const json = await response.json();
                  if (!json.error && json.audioStreams && json.videoStreams) {
                      data = json;
                      connectedNode = new URL(node).hostname;
                      break; // نجحنا!
                  }
              }
          } catch (e) {
              addLog(`[FAIL] Node ${new URL(node).hostname} unreachable.`, "error");
          }
      }

      if (!data) {
          throw new Error("All Piped nodes are currently offline.");
      }

      addLog(`[SUCCESS] Data stream secured from ${connectedNode}`, "success");

      // معالجة البيانات لاستخراج الرابط المناسب
      let finalUrl = "";
      let finalQuality = "";

      if (format === "audio") {
          // البحث عن أفضل ملف صوتي
          const bestAudio = data.audioStreams.sort((a, b) => b.bitrate - a.bitrate)[0];
          finalUrl = bestAudio.url;
          finalQuality = "High Bitrate Audio";
      } else {
          // البحث عن الفيديو المناسب (Mp4 حصراً لضمان التوافق)
          // Piped يعطي أحياناًwebm، نبحث عن mp4
          const videos = data.videoStreams.filter(v => v.format === "mp4" && v.videoOnly === false);
          
          // إذا لم نجد فيديو مع صوت (مدمج)، نأخذ أفضل جودة متوفرة (قد تكون بدون صوت في بعض الحالات النادرة في Piped)
          // لكن Piped عادة يوفر 720p و 360p مدمجة.
          let selectedVideo = videos.find(v => v.quality.includes("720")); // نفضل 720 للتوافق
          
          if (!selectedVideo) selectedVideo = videos[0]; // fallback

          if (selectedVideo) {
              finalUrl = selectedVideo.url;
              finalQuality = selectedVideo.quality;
          } else {
              // حالة نادرة: نأخذ HLS
              finalUrl = data.hls;
              finalQuality = "Auto HLS";
          }
      }

      addLog(`Stream decoded: ${finalQuality}`, "success");
      
      setResult({
        url: finalUrl,
        title: data.title,
        thumb: data.thumbnailUrl,
        node: connectedNode,
        isHls: finalQuality === "Auto HLS"
      });

    } catch (err) {
      addLog(`FATAL: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (link) => {
    addLog("Opening direct stream...", "info");
    window.open(link, '_blank');
    addLog("Browser taking over.", "success");
  };

  const getLogColor = (type) => {
      switch(type) {
          case "error": return "text-red-500 font-bold";
          case "success": return "text-cyan-400 font-bold";
          case "warning": return "text-yellow-400";
          case "system": return "text-purple-400";
          default: return "text-white/60";
      }
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 bg-[#050505] relative flex flex-col items-center pt-10 font-sans">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d41a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d41a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none opacity-20"></div>

      <div className="max-w-5xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-cyan-900/10 rounded-full border border-cyan-500/30 mb-4 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                <IconDatabase size={48} className="text-cyan-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                PIPED <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">NETWORK</span>
            </h1>
            <p className="text-white/40 font-mono text-xs md:text-sm uppercase tracking-[0.3em]">
                Decentralized Stream Extractor
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Controls */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-transparent"></div>
                
                <div className="mb-6">
                    <label className="text-xs text-cyan-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <IconWifi size={14} className="animate-pulse"/> YouTube Link
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
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Type</label>
                        <div className="flex bg-[#111] p-1 rounded-xl border border-white/10">
                            <button onClick={() => setFormat('video')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex justify-center gap-1 ${format === 'video' ? 'bg-cyan-700 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                                <IconVideo size={14}/> MP4
                            </button>
                            <button onClick={() => setFormat('audio')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex justify-center gap-1 ${format === 'audio' ? 'bg-blue-700 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                                <IconMusic size={14}/> MP3
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Mode</label>
                        <div className="w-full bg-[#111] border border-white/10 rounded-xl p-2 text-white text-xs h-[36px] flex items-center justify-center text-white/50 cursor-not-allowed">
                            AUTO-BEST
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleProcess}
                    disabled={loading || !url}
                    className="w-full py-4 bg-white text-black font-black text-sm tracking-[0.2em] rounded-xl hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
                >
                    {loading ? (
                        <span className="flex items-center gap-2"><IconLoader className="animate-spin"/> SEARCHING...</span>
                    ) : (
                        <span className="flex items-center gap-2"><IconCpu/> EXTRACT</span>
                    )}
                </button>
            </div>

            {/* Terminal */}
            <div className="flex flex-col gap-4">
                <div className="flex-1 bg-black border border-white/10 rounded-3xl p-5 font-mono text-xs overflow-hidden relative min-h-[250px] shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                        <div className="flex gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                            <IconTerminal size={14}/> Piped Console
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                        </div>
                    </div>
                    
                    <div className="h-full overflow-y-auto custom-scrollbar pr-2 max-h-[220px] space-y-1">
                        <div className="text-white/20 italic">_client@piped-net:~$ waiting...</div>
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
                                <div className="text-sm font-bold text-white truncate mb-2">{result.title || "Ready"}</div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => downloadFile(result.url)}
                                        className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] font-bold rounded flex items-center gap-2 transition-all w-fit uppercase tracking-widest"
                                    >
                                        <IconDownload size={12}/> DOWNLOAD
                                    </button>
                                    <button 
                                        onClick={() => window.open(result.url, '_blank')}
                                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded flex items-center gap-2 transition-all w-fit"
                                    >
                                        <IconPlayerPlay size={12}/>
                                    </button>
                                </div>
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