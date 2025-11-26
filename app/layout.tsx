import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { VoiceAgentOverlay } from "@/components/voice-agent-overlay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRM-AI PRO",
  description: "AI-Native Business Operating System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CRM-AI PRO",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme-preference') || 'system';
                  const root = document.documentElement;
                  
                  // Apply theme immediately
                  root.setAttribute('data-theme', theme);
                  root.classList.add('theme-' + theme);
                  
                  // Update meta theme-color
                  const darkThemes = ['dark', 'midnight'];
                  const isDark = darkThemes.includes(theme) || 
                    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                  if (metaThemeColor) {
                    metaThemeColor.setAttribute('content', isDark ? 'hsl(220, 30%, 8%)' : 'hsl(0, 0%, 100%)');
                  } else {
                    const meta = document.createElement('meta');
                    meta.name = 'theme-color';
                    meta.content = isDark ? 'hsl(220, 30%, 8%)' : 'hsl(0, 0%, 100%)';
                    document.head.appendChild(meta);
                  }
                } catch (e) {
                  // Silently fail if localStorage is not available
                }
              })();
            `,
          }}
        />
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((reg) => console.log('SW registered:', reg.scope))
                    .catch((err) => console.log('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
        {/* Voice widget outside Providers - isolated from context changes */}
        <VoiceAgentOverlay />
      </body>
    </html>
  );
}
