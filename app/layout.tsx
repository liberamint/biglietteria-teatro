import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biglietteria Teatro',
  description: 'Prenotazioni spettacoli Officina Teatrale',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#5b1820',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-[linear-gradient(180deg,#f9f4ec_0%,#f5ede2_100%)] text-zinc-900 antialiased">
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-[#d8c8b1] bg-[#f8f1e7]/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-5">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.28em] text-[#8d6b57]">
                  Officina Teatrale
                </div>
                <div className="truncate text-sm font-semibold text-[#5b1820] sm:text-base">
                  Biglietteria Teatro
                </div>
              </div>

              <nav className="flex items-center gap-2">
                <Link
                  href="/prenota"
                  className="rounded-full border border-[#c6ab8a] bg-white/80 px-3 py-2 text-sm font-medium text-[#5b1820] shadow-sm transition hover:bg-white"
                >
                  Prenota
                </Link>

                <Link
                  href="/admin"
                  className="rounded-full border border-[#5b1820] bg-[#5b1820] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#4a141a]"
                >
                  Admin
                </Link>
              </nav>
            </div>
          </header>

          <main className="pb-10">{children}</main>
        </div>
      </body>
    </html>
  );
}