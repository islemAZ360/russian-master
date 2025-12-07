"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBrandYoutube, IconDownload, IconCpu, IconMusic, 
  IconVideo, IconLoader, IconAlertTriangle, IconWifi, 
  IconCheck, IconHourglass
} from "@tabler/icons-react";

export default function TechZone() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("1080"); // 1080 (mp4) or mp3
  const [status, setStatus] = useState("idle"); // idle, processing, success, error
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // دالة بدء الطلب
  const startConversion = async () => {
    if (!url.trim()) return;
    
    setStatus("processing");
    setProgress(0);
    setResult(null);
    setErrorMsg("");

    try {
      // 1. إرسال طلب التحويل
      // format: mp3, 1080, 720, 480
      const apiUrl = `https://api.loader.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}`;
      
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.success && !data.id) {
        throw new Error("لم يتمكن السيرفر من بدء المعالجة. تأكد من الرابط.");
      }

      const trackingId = data.id;
      console.log("Tracking ID:", trackingId);

      // 2. بدء مراقبة التقدم (Polling)
      trackProgress(trackingId);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "فشل الاتصال بالخادم");
      setStatus("error");
    }
  };

  // دالة مراقبة التقدم (تتكرر حتى يكتمل التحميل)
  const trackProgress = async (id) => {
    try {
      const progressUrl = `https://p.oceansaver.in/ajax/progress.php?id=${id}`;
      
      const res = await fetch(progressUrl);
      const data = await res.json();

      if (data.success === 1) {
        // تم الانتهاء بنجاح!
        setProgress(100);
        setStatus("success");
        setResult({
          downloadUrl: data.download_url,
          title: "Download Ready", // للأسف هذا الـ API لا يعطي الاسم دائماً قبل التحميل
          text: data.text || "Success"
        });
      } else {
        // ما زال يعمل أو يجهز
        // data.progress يعطينا النسبة المئوية للتحويل من طرف السيرفر
        // نقوم بتحديث شريط التقدم
        let currentProgress = data.progress || 0;
        
        // تحسين بصري: إذا كان الرقم 0 أو قليل، نزيد عداد وهمي ليشعر المستخدم بالعمل
        if(currentProgress < 100) {
            setProgress((prev) => Math.max(prev, currentProgress)); 
            // نعيد الفحص بعد 2 ثانية
            setTimeout(() => trackProgress(id), 2000);
        }
      }
    } catch (err) {
      // إذا فشل طلب التقدم، نحاول مرة أخرى ولا نوقف العملية فوراً
      setTimeout(() => trackProgress(id), 3000);
    }
  };

  const downloadFile = () => {
    if (result?.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 bg-[#050505] flex flex-col items-center pt-20 font-sans">
      <div className="max-w-2xl w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                LOADER <span className="text-green-500">MAX</span>
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">
                Async Processing System
            </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            
            {/* Input */}
            <div className="mb-6">
                <label className="text-xs text-green-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <IconWifi size={14} className="animate-pulse"/> Video URL
                </label>
                <div className="flex gap-2 bg-[#111] border border-white/10 p-4 rounded-xl focus-within:border-green-500 transition-colors">
                    <input 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste Link (Supports 1h+ videos)..."
                        className="bg-transparent w-full outline-none text-white font-mono text-sm"
                    />
                </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setFormat('1080')} className={`py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${format === '1080' ? 'bg-green-600 border-green-500 text-white' : 'bg-[#111] border-white/10 text-white/40'}`}>
                    <IconVideo size={18}/> 1080p MP4
                </button>
                <button onClick={() => setFormat('mp3')} className={`py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${format === 'mp3' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#111] border-white/10 text-white/40'}`}>
                    <IconMusic size={18}/> MP3 HQ
                </button>
            </div>

            {/* Button / Progress */}
            {status === "processing" ? (
                <div className="w-full py-4 bg-[#111] border border-white/10 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-green-900/30 transition-all duration-500" style={{width: `${progress}%`}}></div>
                    <div className="relative flex items-center justify-center gap-3 text-green-400 font-bold font-mono">
                        <IconLoader className="animate-spin" size={20}/>
                        <span>PROCESSING {progress/10}%</span>
                    </div>
                </div>
            ) : status === "success" ? (
                <button onClick={downloadFile} className="w-full py-5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-pulse">
                    <IconDownload size={20}/> DOWNLOAD READY
                </button>
            ) : (
                <button onClick={startConversion} disabled={!url} className="w-full py-5 bg-white text-black font-black text-sm tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all flex justify-center items-center gap-3 disabled:opacity-50">
                    <IconCpu size={20}/> START CONVERSION
                </button>
            )}

            {/* Error */}
            <AnimatePresence>
                {status === "error" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 overflow-hidden">
                        <div className="p-4 bg-red-900/10 text-red-400 text-center rounded-xl border border-red-500/20 text-sm flex items-center justify-center gap-2">
                            <IconAlertTriangle size={16}/> {errorMsg}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Notes */}
        <div className="mt-8 text-center text-white/20 text-xs font-mono">
            <p>Supported: YouTube (1080p, 4K, 1H+), SoundCloud, Facebook</p>
            <p className="mt-2">Note: Long videos may take 1-2 mins to process.</p>
        </div>

      </div>
    </div>
  );
}