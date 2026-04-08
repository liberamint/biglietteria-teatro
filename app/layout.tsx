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
  themeColor: '#111111',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="bg-white text-zinc-900">
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="text-sm font-semibold sm:text-base">
                Biglietteria Teatro
              </div>

              <nav className="flex items-center gap-2">
                <Link
                  href="/prenota"
                  className="rounded-xl border px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Prenota
                </Link>

                <Link
                  href="/admin"
                  className="rounded-xl border px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Admin
                </Link>
              </nav>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}