import Link from 'next/link';
import { Container, PageShell, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function HomePage() {
  return (
    <PageShell>
      <Container wide>
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">Biglietteria Teatro</h1>
            <p className="max-w-2xl text-zinc-600">
              Web app installabile dal browser per gestire 6 spettacoli, prenotazioni nominali,
              pagamenti confermati solo dall&apos;organizzazione e seriali assegnati manualmente.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Link href="/prenota">
              <Card className="h-full hover:shadow-md transition">
                <CardHeader><CardTitle>Area pubblica</CardTitle></CardHeader>
                <CardContent>
                  Il pubblico può solo prenotare o aggiornare la propria richiesta.
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin">
              <Card className="h-full hover:shadow-md transition">
                <CardHeader><CardTitle>Area amministratore</CardTitle></CardHeader>
                <CardContent>
                  Solo l&apos;organizzazione può segnare pagamenti, assegnare seriali e registrare ingressi.
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
