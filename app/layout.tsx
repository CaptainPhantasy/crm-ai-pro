import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRM-AI PRO",
  description: "AI-Native Business Operating System",
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
                  const isDark = theme === 'midnight' || 
                    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                  if (metaThemeColor) {
                    metaThemeColor.setAttribute('content', isDark ? '#040816' : '#f2e4cf');
                  } else {
                    const meta = document.createElement('meta');
                    meta.name = 'theme-color';
                    meta.content = isDark ? '#040816' : '#f2e4cf';
                    document.head.appendChild(meta);
                  }
                } catch (e) {
                  // Silently fail if localStorage is not available
                }
              })();
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
      </body>
    </html>
  );
}
