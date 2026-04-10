import Image from 'next/image';
import Link from 'next/link';
import { Container, PageShell, Card, CardContent, Button } from '@/components/ui';

export default function HomePage() {
  return (
    <PageShell>
      <Container>
        <div className="mx-auto max-w-6xl px-2 pt-8 sm:pt-12">
          <div className="relative overflow-hidden rounded-[36px] border border-[#d9c3a5] bg-[radial-gradient(circle_at_top,#fff6ee_0%,#f8ebdd_35%,#e8d2c4_70%,#d8b5aa_100%)] shadow-[0_20px_50px_rgba(90,24,33,0.12)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_30%,rgba(90,24,33,0.04)_100%)]" />

            <div className="absolute left-0 top-0 h-full w-10 bg-[linear-gradient(180deg,#6c1c27_0%,#4d141b_100%)] opacity-90 sm:w-14" />
            <div className="absolute right-0 top-0 h-full w-10 bg-[linear-gradient(180deg,#6c1c27_0%,#4d141b_100%)] opacity-90 sm:w-14" />

            <div className="relative px-5 py-8 sm:px-10 sm:py-12">
              <div className="mx-auto max-w-5xl">
                <div className="text-center">
                  <div className="inline-block rounded-full border border-[#d4b28a] bg-white/80 px-4 py-1 text-xs uppercase tracking-[0.34em] text-[#8f7153] shadow-sm">
                    Officina Teatrale
                  </div>

                  <div className="mx-auto mt-6 flex justify-center">
                    <div className="rounded-[28px] border border-[#e0cfb7] bg-white/85 p-4 shadow-lg">
                      <Image
                        src="/icon.png"
                        alt="Icona Biglietteria Teatro"
                        width={110}
                        height={110}
                        className="h-[90px] w-[90px] rounded-[20px] object-cover sm:h-[110px] sm:w-[110px]"
                        priority
                      />
                    </div>
                  </div>

                  <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#5a1821] sm:text-5xl lg:text-6xl">
                    Biglietteria Teatro
                  </h1>

                  <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#6d6054] sm:text-base">
                    Un sipario digitale per accompagnare il pubblico dalla prenotazione
                    alla platea, con uno spazio elegante e semplice da usare per spettatori
                    e organizzazione.
                  </p>

                  <div className="mx-auto mt-6 max-w-3xl rounded-[28px] border border-[#e0cfb7] bg-white/75 px-5 py-5 shadow-sm">
                    <p className="text-base italic leading-8 text-[#5a1821] sm:text-lg">
                      “Il teatro non è altro che il disperato sforzo dell’uomo di dare un senso alla vita.”
                    </p>
                    <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-[#927252]">
                      Eduardo De Filippo
                    </p>
                  </div>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <Card className="bg-white/82">
                    <CardContent>
                      <div className="rounded-[28px] border border-[#e2d1ba] bg-[linear-gradient(180deg,#fffdf9_0%,#f8efe3_100%)] p-6 shadow-sm sm:p-8">
                        <div className="text-xs uppercase tracking-[0.25em] text-[#927252]">
                          Inizia da qui
                        </div>

                        <h2 className="mt-3 text-2xl font-semibold text-[#5a1821] sm:text-3xl">
                          Scegli il tuo ingresso in scena
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-[#6d6054] sm:text-base">
                          Prenota i biglietti per lo spettacolo scelto oppure accedi
                          all’area di gestione per controllare disponibilità, incassi,
                          ricevute e seriali.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                          <Link href="/prenota" className="w-full sm:w-auto">
                            <Button className="w-full sm:min-w-[200px]">
                              🎟️ Prenota biglietti
                            </Button>
                          </Link>

                          <Link href="/admin" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:min-w-[200px]">
                              🎭 Area admin
                            </Button>
                          </Link>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-[#e2d1ba] bg-white/80 px-4 py-4 shadow-sm">
                            <div className="text-xs uppercase tracking-[0.18em] text-[#927252]">
                              Prenota
                            </div>
                            <div className="mt-2 text-sm font-medium text-[#5a1821]">
                              Richiesta semplice e rapida
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#e2d1ba] bg-white/80 px-4 py-4 shadow-sm">
                            <div className="text-xs uppercase tracking-[0.18em] text-[#927252]">
                              Controlla
                            </div>
                            <div className="mt-2 text-sm font-medium text-[#5a1821]">
                              Posti, pagamenti e ricevute
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#e2d1ba] bg-white/80 px-4 py-4 shadow-sm">
                            <div className="text-xs uppercase tracking-[0.18em] text-[#927252]">
                              Organizza
                            </div>
                            <div className="mt-2 text-sm font-medium text-[#5a1821]">
                              Tutto in un solo spazio
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6">
                    <Card className="bg-white/82">
                      <CardContent>
                        <div className="rounded-[28px] border border-[#e2d1ba] bg-white/75 p-6 shadow-sm">
                          <div className="text-xs uppercase tracking-[0.25em] text-[#927252]">
                            Accesso rapido
                          </div>

                          <div className="mt-4 space-y-3">
                            <Link href="/prenota" className="block">
                              <div className="rounded-2xl border border-[#dcc7aa] bg-[#fff8f0] px-4 py-4 transition hover:bg-white">
                                <div className="text-base font-semibold text-[#5a1821]">
                                  Prenotazioni
                                </div>
                                <div className="mt-1 text-sm text-[#6d6054]">
                                  Inserisci i dati e richiedi i biglietti per lo spettacolo scelto.
                                </div>
                              </div>
                            </Link>

                            <Link href="/admin" className="block">
                              <div className="rounded-2xl border border-[#dcc7aa] bg-[#fff8f0] px-4 py-4 transition hover:bg-white">
                                <div className="text-base font-semibold text-[#5a1821]">
                                  Gestione amministrativa
                                </div>
                                <div className="mt-1 text-sm text-[#6d6054]">
                                  Controlla disponibilità, ricevute, ingressi e situazione economica.
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/82">
                      <CardContent>
                        <div className="rounded-[28px] border border-[#e2d1ba] bg-[linear-gradient(180deg,#fffdf9_0%,#f8efe3_100%)] p-6 shadow-sm">
                          <div className="text-xs uppercase tracking-[0.25em] text-[#927252]">
                            Nota di scena
                          </div>

                          <p className="mt-4 text-sm leading-7 text-[#6d6054]">
                            Le prenotazioni vengono registrate subito, ma la conferma del
                            pagamento, i seriali dei biglietti e la ricevuta vengono gestiti
                            solo dall’organizzazione.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}