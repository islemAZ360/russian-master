// lib/downloadSwarm.js

// قائمة الخوادم العالمية (Nodes)
// هذا النظام يوزع الحمل، إذا سقط خادم يعمل الآخر
const SWARM_NODES = [
    { url: "https://co.wuk.sh/api/json", name: "NODE_ALPHA (EU)" },
    { url: "https://api.cobalt.tools/api/json", name: "NODE_BETA (US)" },
    { url: "https://cobalt.kwiatekmiki.pl/api/json", name: "NODE_GAMMA (PL)" },
    { url: "https://cobalt.steamodded.com/api/json", name: "NODE_DELTA (UK)" },
    { url: "https://us.cobalt.gif.ci/api/json", name: "NODE_EPSILON (CA)" }
];

export const VideoProcessor = {
    /**
     * تنظيف الرابط من أي ملفات تتبع قد تسبب فشل التحميل
     */
    sanitizeUrl: (rawUrl) => {
        try {
            const urlObj = new URL(rawUrl);
            // يوتيوب العادي
            if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                const v = urlObj.searchParams.get('v');
                if (v) return `https://www.youtube.com/watch?v=${v}`;
                // روابط المشاركة المختصرة
                if (urlObj.pathname.length > 1) return `https://www.youtube.com${urlObj.pathname}`;
            }
            // الشورتس
            if (urlObj.pathname.includes('/shorts/')) {
                return `https://www.youtube.com${urlObj.pathname}`;
            }
            return rawUrl;
        } catch (e) {
            return rawUrl;
        }
    },

    /**
     * تشغيل السرب للبحث عن مسار تحميل صالح
     */
    process: async (url, config, onLog) => {
        const cleanUrl = VideoProcessor.sanitizeUrl(url);
        onLog(`Target Identified: ${cleanUrl}`);
        onLog(`Initializing Swarm Protocol... [${SWARM_NODES.length} Nodes Ready]`);

        const payload = {
            url: cleanUrl,
            vCodec: "h264",
            vQuality: config.quality || "720",
            aFormat: "mp3",
            isAudioOnly: config.format === "audio",
            filenamePattern: "basic"
        };

        // محاولة الاتصال بالخوادم بالتسلسل
        for (const node of SWARM_NODES) {
            try {
                onLog(`>>> Pinging ${node.name}...`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 ثواني مهلة لكل خادم

                const response = await fetch(node.url, {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                const data = await response.json();

                if (data && (data.url || data.picker)) {
                    onLog(`[SUCCESS] Connection Established with ${node.name}`);
                    
                    let finalUrl = data.url;
                    if (!finalUrl && data.picker && data.picker.length > 0) {
                        finalUrl = data.picker[0].url;
                        onLog(`Multiplexing stream extracted.`);
                    }

                    if(finalUrl) {
                        return {
                            url: finalUrl,
                            filename: data.filename || "download.mp4",
                            node: node.name
                        };
                    }
                } else {
                    onLog(`[FAIL] ${node.name} returned invalid packet.`);
                }

            } catch (err) {
                onLog(`[ERROR] ${node.name} timed out or blocked.`);
            }
        }

        throw new Error("ALL_NODES_BUSY");
    }
};