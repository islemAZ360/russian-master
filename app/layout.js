import { JetBrains_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "../context/SettingsContext"; // استيراد

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  weight: ["400", "700"],
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata = {
  title: "Russian Master | Neural Interface",
  description: "Advanced Cybernetic Language Acquisition System",
};

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
        <SettingsProvider>
            {/* الخلفيات الأساسية */}
            <div className="scanlines pointer-events-none"></div>
            <div className="vignette pointer-events-none"></div>
            
            {/* المحتوى */}
            <div className="relative z-10 w-full h-full">
              {children}
            </div>
        </SettingsProvider>
      </body>
    </html>
  );
}