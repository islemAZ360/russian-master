import { JetBrains_Mono, Cairo } from "next/font/google";
import "./globals.css";

// 1. إعداد الخطوط (Google Fonts Optimization)
// الخط التقني للأرقام والإنجليزية
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  weight: ["400", "700"],
  display: "swap",
});

// الخط العربي للنصوص والشرح
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

// 2. بيانات التطبيق (Metadata)
export const metadata = {
  title: "Russian Master | Neural Interface",
  description: "Advanced Cybernetic Language Acquisition System",
  manifest: "/manifest.json", 
  themeColor: "#050505",
};

// 3. إعدادات الشاشة (منع الزووم لتعزيز شعور "النظام")
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="ltr" className={`${jetbrainsMono.variable} ${cairo.variable}`}>
      <body className="antialiased bg-[#050505] text-white overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
        
        {/* --- المؤثرات البصرية (Cinematic Layers) --- */}
        {/* هذه الطبقات تعتمد على CSS الذي كتبناه سابقاً */}
        <div className="scanlines"></div>
        <div className="vignette"></div>
        <div className="noise-overlay"></div>
        
        {/* --- واجهة النظام (HUD Corners) --- */}
        <div className="hud-corner tl"></div>
        <div className="hud-corner tr"></div>
        <div className="hud-corner bl"></div>
        <div className="hud-corner br"></div>

        {/* --- خط ليزر علوي للتزيين (Top Laser) --- */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-40 opacity-70 shadow-[0_0_10px_#06b6d4]"></div>

        {/* --- المحتوى الرئيسي للصفحات --- */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>

      </body>
    </html>
  );
}