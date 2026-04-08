import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Biglietteria Teatro',
  description: 'Prenotazioni e gestione biglietti per spettacoli teatrali',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <header className="border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
            <Link href="/" className="text-lg font-semibold">Biglietteria Teatro</Link>
            <nav className="flex gap-4 text-sm text-zinc-600">
              <Link href="/prenota">Prenota</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
