"use client";
import React, { useState } from "react";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconAlertTriangle, 
  IconWifi, IconPlayerPlay
} from "@tabler/icons-react";

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [activeUrl, setActiveUrl] = useState(null); // الرابط الذي سيتم إرساله للأداة

  const handleProcess = () => {
    if (!url.trim()) return;
    
    // تنظيف الرابط للتأكد من أنه ID فقط أو رابط نظيف
    let cleanVideoId = "";
    try {
        if (url.includes("youtu.be")) cleanVideoId = url.split("/").pop().split("?")[0];
        else if (url.includes("v=")) cleanVideoId = url.split("v=")[1].split("&")[0];
        else if (url.includes("shorts")) cleanVideoId = url.split("shorts/")[1].split("?")[0];
    } catch(e) {}

    if (cleanVideoId) {
        // نستخدم خدمة Cooconvert القوية عبر Iframe
        // هذه الخدمة نظيفة وسريعة وتدعم الفيديوهات الطويلة
        setActiveUrl(`https://cooconvert.com/api/widget?url=https://www.youtube.com/watch?v=${cleanVideoId}`);
    } else {
        alert("تأكد من صحة الرابط!");
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 bg-[#050505] flex flex-col items-center pt-20 font-sans">
      <div className="max-w-3xl w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                YOUTUBE <span className="text-red-600">MASTER</span>
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">
                Direct Widget System
            </p>
        </div>

        {/* Input Area */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl relative mb-8">
            <div className="mb-6">
                <label className="text-xs text-red-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <IconWifi size={14} className="animate-pulse"/> Paste Link
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
                className="w-full py-5 bg-white text-black font-black text-sm tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all flex justify-center items-center gap-3"
            >
                <IconCpu size={20}/> LOAD VIDEO
            </button>
        </div>

        {/* The Widget Area (الحل الجذري) */}
        {activeUrl && (
            <div className="w-full bg-white rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)] border border-white/20 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="bg-red-600 text-white p-2 text-center text-xs font-bold uppercase tracking-widest">
                    Download Panel
                </div>
                {/* 
                    نقوم بتضمين أداة التحميل هنا. 
                    هذا يتجاوز كل مشاكل السيرفر والكود لأنه يعمل كصفحة مستقلة داخل موقعك.
                */}
                <iframe
                    src={activeUrl}
                    width="100%"
                    height="350px"
                    scrolling="no"
                    frameBorder="0"
                    allowTransparency="true"
                    className="w-full bg-white"
                    title="yt-widget"
                ></iframe>
            </div>
        )}

        <div className="mt-8 text-center opacity-30 text-xs">
            <p>Secure Iframe Technology • No Server Limits</p>
        </div>

      </div>
    </div>
  );
}