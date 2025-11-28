import "./globals.css";

export const metadata = {
  title: "Russian Master | Neural Interface",
  description: "Advanced Language Acquisition System",
  manifest: "/manifest.json", 
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // منع التكبير للحفاظ على شعور التطبيق
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {/* الطبقات السينمائية */}
        <div className="scanlines"></div>
        <div className="vignette"></div>
        
        {/* حدود النظام */}
        <div className="hud-corner tl"></div>
        <div className="hud-corner tr"></div>
        <div className="hud-corner bl"></div>
        <div className="hud-corner br"></div>

        {/* خط ليزر علوي للتزيين */}
        <div className="fixed top-5 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-40"></div>

        {children}
      </body>
    </html>
  );
}