import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'NAYA — The Feature Layer for Every App',
  description: 'AI-powered feature overlays for any app. Describe what you want, deploy it everywhere.',
  keywords: ['ai', 'overlay', 'features', 'browser extension', 'community', 'no-code'],
  authors: [{ name: 'naya' }],
  openGraph: {
    title: 'NAYA',
    description: 'AI-powered feature overlays for any app.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white font-mono antialiased">
        {/* Scan line overlay for CRT/industrial feel */}
        <div
          className="pointer-events-none fixed inset-0 z-[9999] bg-scan-lines opacity-30"
          aria-hidden="true"
        />

        {/* Main content */}
        <Providers>
          <div className="relative z-10">
            {children}
          </div>
        </Providers>

        {/* Bottom status bar */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-black/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-1.5">
            <span className="text-[9px] tracking-[0.15em] text-white/20 font-mono">
              NAYA://SYSTEM::READY
            </span>
            <div className="flex items-center gap-6">
              <span className="text-[9px] text-white/20 font-mono flex items-center gap-1.5">
                <span className="w-1 h-1 bg-green-500 inline-block" />
                OVERLAY::CONNECTED
              </span>
              <span className="text-[9px] text-white/20 font-mono">
                GPU::AVAILABLE
              </span>
              <span className="text-[9px] text-white/20 font-mono">
                v0.1.0
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
