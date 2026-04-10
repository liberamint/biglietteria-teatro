import Link from 'next/link';
import { Container, PageShell, Card, CardContent, Button } from '@/components/ui';

export default function HomePage() {
  return (
    <PageShell>
      <Container>
        <div className="mx-auto max-w-5xl px-2 pt-8 sm:pt-12">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="overflow-hidden">
              <CardContent>
                <div className="rounded-[28px] border border-[#dcc7aa] bg-[linear-gradient(180deg,#fff9f2_0%,#f6eadb_100%)] p-6 shadow-sm sm:p-8">
                  <div className="inline-block rounded-full border border-[#d4b28a] bg-white/80 px-4 py-1 text-xs uppercase tracking-[0.34em] text-[#8f7153] shadow-sm">
                    Officina Teatrale
                  </div>

                  <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#5a1821] sm:text-5xl lg:text-6xl">
                    Biglietteria Teatro
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6d6054] sm:text-base">
                    Un piccolo foyer digitale per prenotare, organizzare e gestire
                    gli spettacoli con eleganza, chiarezza e un colpo d’occhio immediato.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link href="/prenota" className="w-full sm:w-auto">
                      <Button className="w-full sm:min-w-[180px]">
                        Prenota biglietti
                      </Button>
                    </Link>

                    <Link href="/admin" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:min-w-[180px]">
                        Area admin
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#e2d1ba] bg-white/75 px-4 py-4 shadow-sm">
                      <div className="text-xs uppercase tracking-[0.18em] text-[#927252]">
                        Prenotazioni
                      </div>
                      <div className="mt-2 text-sm font-medium text-[#5a1821]">
                        Richieste semplici e veloci
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#e2d1ba] bg-white/75 px-4 py-4 shadow-sm">
                      <div className="text-xs uppercase tracking-[0.18em] text-[#927252]">
                        Controllo
                      </div>
                      <div className="mt-2 text-sm font-medium text-[#5a1821]">
                        Gestione pagamenti e seriali
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#e2d1ba] bg-white/75 px-4 py-4 shadow-sm">
                      <div className="text-xs uppercase tracking-[0.18em] text-[#927252]">
                        Visione
                      </div>
                      <div className="mt-2 text-sm font-medium text-[#5a1821]">
                        Posti e incassi sempre sotto controllo
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card>
                <CardContent>
                  <div className="rounded-[28px] border border-[#e2d1ba] bg-white/80 p-6 shadow-sm">
                    <div className="text-xs uppercase tracking-[0.25em] text-[#927252]">
                      Accesso rapido
                    </div>

                    <div className="mt-4 space-y-3">
                      <Link href="/prenota" className="block">
                        <div className="rounded-2xl border border-[#dcc7aa] bg-[#fff8f0] px-4 py-4 transition hover:bg-white">
                          <div className="text-base font-semibold text-[#5a1821]">
                            🎟️ Prenota
                          </div>
                          <div className="mt-1 text-sm text-[#6d6054]">
                            Inserisci i dati e richiedi i biglietti per lo spettacolo scelto.
                          </div>
                        </div>
                      </Link>

                      <Link href="/admin" className="block">
                        <div className="rounded-2xl border border-[#dcc7aa] bg-[#fff8f0] px-4 py-4 transition hover:bg-white">
                          <div className="text-base font-semibold text-[#5a1821]">
                            🎭 Area admin
                          </div>
                          <div className="mt-1 text-sm text-[#6d6054]">
                            Gestisci prenotazioni, incassi, ricevute, posti e ingressi.
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="rounded-[28px] border border-[#e2d1ba] bg-[linear-gradient(180deg,#fffdf9_0%,#f8efe3_100%)] p-6 shadow-sm">
                    <div className="text-xs uppercase tracking-[0.25em] text-[#927252]">
                      Nota
                    </div>

                    <p className="mt-4 text-sm leading-7 text-[#6d6054]">
                      Le prenotazioni vengono registrate subito, ma la conferma del pagamento,
                      i seriali dei biglietti e la ricevuta vengono gestiti
                      esclusivamente dall’organizzazione.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}