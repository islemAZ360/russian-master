import { JetBrains_Mono, Cairo } from "next/font/google";
import "./globals.css";

// استيراد الـ Providers
import { AuthProvider } from "../context/AuthContext";
import { SettingsProvider } from "../context/SettingsContext";
import { UIProvider } from "../context/UIContext";
import ServiceWorkerRegister from "../components/ui/ServiceWorkerRegister";
import ErrorBoundary from "../components/ErrorBoundary";

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
  description: "Advanced Cybernetic Language Acquisition System - Master Russian language with AI-powered learning",
  manifest: "/manifest.json",
  keywords: "Russian learning, language learning, flashcards, SRS, spaced repetition, neural interface",
  authors: [{ name: "Islam Azaziya" }],
  creator: "Islam Azaziya",
  publisher: "Russian Master",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Russian Master",
  },
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
        {/* Optimized theme initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('russian_master_config');
                  let themeToApply = 'dark';

                  if (saved) {
                    const config = JSON.parse(saved);
                    if (config.theme === 'light') {
                      themeToApply = 'light';
                    } else if (config.theme === 'system') {
                      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      themeToApply = systemPrefersDark ? 'dark' : 'light';
                    }
                  } else {
                    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    themeToApply = systemPrefersDark ? 'dark' : 'light';
                  }

                  const root = document.documentElement;
                  if (themeToApply === 'light') {
                    root.setAttribute('data-theme', 'light');
                    root.classList.add('light');
                  } else {
                    root.classList.add('dark');
                  }
                } catch (e) {
                  console.error('Theme init error:', e);
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
        className="antialiased bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-100 transition-colors duration-300"
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
