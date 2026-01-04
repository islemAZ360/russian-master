// src/app/layout.js
import { JetBrains_Mono, Cairo } from "next/font/google";
import "./globals.css";

// استيراد الـ Providers
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { UIProvider } from "@/context/UIContext";

// استيراد المكونات المساعدة
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// تعريف الخطوط
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

// إعدادات الميتا (SEO & Web App)
export const metadata = {
  title: "Russian Master | Neural Interface",
  description: "Advanced Cybernetic Language Acquisition System - Master Russian language with AI-powered learning",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Russian Master",
  },
  other: {
    "mobile-web-app-capable": "yes",
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
  colorScheme: "dark light",
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="ar" 
      dir="ltr" 
      className={`${jetbrainsMono.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* سكريبت التهيئة السريع: يمنع الوميض ويضبط اللغة والثيم فوراً */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // استخدام المفتاح v4 ليتطابق مع الـ Context
                  const saved = localStorage.getItem('russian_master_config_v4');
                  const root = document.documentElement;
                  
                  let themeToApply = 'dark';
                  let langToApply = 'ar';
                  let dirToApply = 'rtl';

                  if (saved) {
                    const config = JSON.parse(saved);
                    
                    // 1. معالجة الثيم
                    if (config.theme === 'light') {
                      themeToApply = 'light';
                    } else if (config.theme === 'system') {
                      themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }

                    // 2. معالجة اللغة والاتجاه (حل مشكلة الثبات على العربية)
                    if (config.systemLanguage) {
                      langToApply = config.systemLanguage;
                      dirToApply = langToApply === 'ar' ? 'rtl' : 'ltr';
                    }
                  } else {
                    // الوضع الافتراضي إذا لم يوجد تخزين
                    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    themeToApply = systemPrefersDark ? 'dark' : 'light';
                  }

                  // تطبيق الإعدادات على الوسم الجذري فوراً
                  root.setAttribute('data-theme', themeToApply);
                  root.setAttribute('lang', langToApply);
                  root.setAttribute('dir', dirToApply);
                  
                  if (themeToApply === 'light') {
                    root.classList.add('light');
                    root.classList.remove('dark');
                  } else {
                    root.classList.add('dark');
                    root.classList.remove('light');
                  }
                } catch (e) {
                  console.error('System Init Error:', e);
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <meta name="theme-color" content="#050505" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f8fafc" media="(prefers-color-scheme: light)" />
      </head>
      <body 
        className="antialiased bg-[var(--bg-primary)] text-[var(--text-main)] overflow-hidden selection:bg-cyan-500/30 transition-colors duration-300"
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <AuthProvider>
            <SettingsProvider>
              <UIProvider>
                <ServiceWorkerRegister />
                <div className="relative z-10 w-full h-full">
                  {children}
                </div>
              </UIProvider>
            </SettingsProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}