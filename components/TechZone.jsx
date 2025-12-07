"use client";
import React, { useState } from "react";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconWifi, 
  IconAlertTriangle, IconExternalLink, IconServer
} from "@tabler/icons-react";

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [activeVideoId, setActiveVideoId] = useState(null);

  const handleProcess = () => {
    if (!url.trim()) return;
    
    // استخراج ID الفيديو بدقة
    let videoId = "";
    try {
        if (url.includes("youtu.be")) videoId = url.split("/").pop().split("?")[0];
        else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
        else if (url.includes("shorts")) videoId = url.split("shorts/")[1].split("?")[0];
    } catch(e) {}

    if (videoId) {
        setActiveVideoId(videoId);
    } else {
        alert("رابط غير صحيح!");
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 bg-[#050505] flex flex-col items-center pt-20 font-sans">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                FINAL <span className="text-blue-600">GATEWAY</span>
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">
                Direct Embed & Redirect Protocol
            </p>
        </div>

        {/* Input Area */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl shadow-2xl mb-8">
            <div className="flex gap-2 bg-[#111] border border-white/10 p-4 rounded-xl focus-within:border-blue-600 transition-colors mb-4">
                <IconWifi className="text-blue-600"/>
                <input 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="ضع رابط الفيديو هنا..."
                    className="bg-transparent w-full outline-none text-white font-mono text-sm"
                />
            </div>
            <button 
                onClick={handleProcess}
                className="w-full py-4 bg-white text-black font-black text-sm tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all flex justify-center items-center gap-2"
            >
                <IconCpu size={20}/> INITIALIZE
            </button>
        </div>

        {/* --- منطقة النظامين (الحل الجذري) --- */}
        {activeVideoId && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* System A: Loader.to Widget (يدعم الطويل والمحمي) */}
                <div className="w-full overflow-hidden rounded-2xl border-2 border-blue-600/30 bg-[#111] shadow-2xl">
                    <div className="bg-blue-900/20 p-3 flex justify-between items-center border-b border-blue-600/20">
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <IconServer size={14}/> Server A (Embedded)
                        </span>
                    </div>
                    {/* 
                        استخدام Loader.to Card API
                        هذا هو السيرفر الوحيد الذي يسمح بالتضمين (Iframe) دون شاشة بيضاء غالباً
                    */}
                    <iframe
                        src={`https://loader.to/api/card/?url=https://www.youtube.com/watch?v=${activeVideoId}`}
                        width="100%"
                        height="450px" // ارتفاع كافٍ لظهور القائمة
                        scrolling="no"
                        frameBorder="0"
                        allowTransparency="true"
                        className="w-full bg-[#0a0a0a]"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" // صلاحيات لضمان العمل
                    ></iframe>
                </div>

                {/* System B: Emergency Button (إذا ظهرت شاشة بيضاء) */}
                <div className="p-4 bg-red-900/10 border border-red-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <IconAlertTriangle className="text-red-500" size={24}/>
                        <div>
                            <h3 className="text-white font-bold text-sm">هل ظهرت شاشة بيضاء؟</h3>
                            <p className="text-white/40 text-xs">اضغط هنا للانتقال لسيرفر الطوارئ الخارجي</p>
                        </div>
                    </div>
                    <a 
                        href={`https://ssyoutube.com/watch?v=${activeVideoId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
                    >
                        <IconExternalLink size={16}/> سيرفر الطوارئ (مضمون)
                    </a>
                </div>

            </div>
        )}

    </div>
    </div>
  );
}