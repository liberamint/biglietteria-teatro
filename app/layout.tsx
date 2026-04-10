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
  themeColor: '#5a1821',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,#fff8f0_0%,#f5ebde_45%,#efe0d0_100%)] text-zinc-900 antialiased">
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-[#d8c1a2] bg-[#fbf4eb]/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-5">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.34em] text-[#9a7b59]">
                  Officina Teatrale
                </div>
                <div className="truncate text-sm font-semibold text-[#5a1821] sm:text-base">
                  Biglietteria Teatro
                </div>
              </div>

              <nav className="flex items-center gap-2">
                <Link
                  href="/prenota"
                  className="rounded-full border border-[#d3b48f] bg-white/80 px-3 py-2 text-sm font-medium text-[#5a1821] shadow-sm transition hover:bg-white"
                >
                  Prenota
                </Link>

                <Link
                  href="/admin"
                  className="rounded-full border border-[#5a1821] bg-[#5a1821] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#49141b]"
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