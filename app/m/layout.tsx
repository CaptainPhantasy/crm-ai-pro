import { Metadata, Viewport } from 'next'
import '@/app/globals.css'
import { MobileLayoutClient } from './mobile-layout-client'

export const metadata: Metadata = {
  title: 'CRM-AI PRO Mobile',
  description: 'Field Operations Mobile App',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CRM-AI PRO',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })()
            `,
          }}
        />
      </head>
      <body>
        <MobileLayoutClient>{children}</MobileLayoutClient>
      </body>
    </html>
  )
}

