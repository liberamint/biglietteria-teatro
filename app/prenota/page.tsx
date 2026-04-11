'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { SHOWS, TOTAL_POSTI } from '@/lib/config';
import {
  Container,
  PageShell,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Textarea,
  Button,
} from '@/components/ui';

export default function PrenotaPage() {
  const supabase = createClient();

  const [showSlug, setShowSlug] = useState<string>(SHOWS[0].slug);
  const [requesterName, setRequesterName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullTickets, setFullTickets] = useState(1);
  const [reducedTickets, setReducedTickets] = useState(0);
  const [participantNames, setParticipantNames] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const [postiRimastiReali, setPostiRimastiReali] = useState<number>(TOTAL_POSTI);
  const [postiRimastiSeConfermati, setPostiRimastiSeConfermati] = useState<number>(TOTAL_POSTI);
  const [loadingPosti, setLoadingPosti] = useState(true);

  const selectedShow = SHOWS.find((s) => s.slug === showSlug);
  const prezzoIntero = Number(selectedShow?.price_full || 10);
  const prezzoRidotto = Number(selectedShow?.price_reduced || 8);
  const posterSrc = `/locandine/${showSlug}.jpg`;

  const ticketCount = Number(fullTickets || 0) + Number(reducedTickets || 0);
  const totaleStimato =
    Number(fullTickets || 0) * prezzoIntero +
    Number(reducedTickets || 0) * prezzoRidotto;

  function getBookingTickets(booking: any) {
    const full = Number(booking.full_tickets || 0);
    const reduced = Number(booking.reduced_tickets || 0);
    const ticketCountDb = Number(booking.ticket_count || 0);

    const normalizedFull = full === 0 && reduced === 0 ? ticketCountDb : full;
    const totalTickets = normalizedFull + reduced;

    return {
      full: normalizedFull,
      reduced,
      totalTickets,
    };
  }

  async function loadDisponibilita(slug = showSlug) {
    setLoadingPosti(true);

    const { data: show, error: showError } = await supabase
      .from('shows')
      .select('id')
      .eq('slug', slug)
      .single();

    if (showError || !show) {
      setPostiRimastiReali(TOTAL_POSTI);
      setPostiRimastiSeConfermati(TOTAL_POSTI);
      setLoadingPosti(false);
      return;
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('ticket_count, full_tickets, reduced_tickets, paid')
      .eq('show_id', show.id);

    if (bookingsError) {
      setPostiRimastiReali(TOTAL_POSTI);
      setPostiRimastiSeConfermati(TOTAL_POSTI);
      setLoadingPosti(false);
      return;
    }

    const allBookings = bookingsData || [];

    const bigliettiPagati = allBookings
      .filter((b: any) => b.paid)
      .reduce((sum: number, booking: any) => sum + getBookingTickets(booking).totalTickets, 0);

    const bigliettiPrenotatiTotali = allBookings.reduce(
      (sum: number, booking: any) => sum + getBookingTickets(booking).totalTickets,
      0
    );

    setPostiRimastiReali(Math.max(TOTAL_POSTI - bigliettiPagati, 0));
    setPostiRimastiSeConfermati(Math.max(TOTAL_POSTI - bigliettiPrenotatiTotali, 0));
    setLoadingPosti(false);
  }

  useEffect(() => {
    loadDisponibilita(showSlug);
  }, [showSlug]);

  async function submitBooking() {
    setBusy(true);
    setMessage('');

    const { data: show, error: showError } = await supabase
      .from('shows')
      .select('id, name, slug')
      .eq('slug', showSlug)
      .maybeSingle();

    if (showError) {
      setMessage(`Errore spettacolo: ${showError.message}`);
      setBusy(false);
      return;
    }

    if (!show) {
      setMessage(`Spettacolo non trovato: ${showSlug}`);
      setBusy(false);
      return;
    }

    if (ticketCount <= 0) {
      setMessage('Inserisci almeno un biglietto tra interi e ridotti.');
      setBusy(false);
      return;
    }

    if (ticketCount > postiRimastiSeConfermati) {
      setMessage(
        `Posti insufficienti. Se tutte le prenotazioni venissero confermate, i posti disponibili sarebbero ${postiRimastiSeConfermati}.`
      );
      setBusy(false);
      return;
    }

    const { error: insertError } = await supabase.from('bookings').insert({
      show_id: show.id,
      requester_name: requesterName,
      phone,
      email,
      ticket_count: ticketCount,
      full_tickets: Number(fullTickets || 0),
      reduced_tickets: Number(reducedTickets || 0),
      participant_names: participantNames,
      notes,
      confirmed: false,
      paid: false,
      checked_in: false,
    });

    if (insertError) {
      setMessage(`Errore nel salvataggio della prenotazione: ${insertError.message}`);
      setBusy(false);
      return;
    }

    setMessage("Richiesta inviata. Pagamento e seriali saranno confermati solo dall'organizzazione.");
    setRequesterName('');
    setPhone('');
    setEmail('');
    setFullTickets(1);
    setReducedTickets(0);
    setParticipantNames('');
    setNotes('');
    setBusy(false);

    await loadDisponibilita(showSlug);
  }

  const fieldCardClass =
    'rounded-[24px] border border-[#e2cfb7] bg-[linear-gradient(180deg,#fffdf9_0%,#f7ecdf_100%)] p-4 shadow-[0_16px_28px_rgba(90,24,33,0.10),0_3px_0_rgba(255,255,255,0.65)_inset]';

  const fieldInputClass =
    'bg-white/95 shadow-[0_10px_18px_rgba(90,24,33,0.08)] border-[#d6b58f]';

  return (
    <PageShell>
      <Container>
        <div className="relative mx-auto max-w-5xl px-2 pt-6 sm:pt-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[280px] rounded-[36px] bg-[radial-gradient(circle_at_top,#7b2430_0%,#5a1821_35%,rgba(90,24,33,0.08)_72%,transparent_100%)] opacity-95" />
          <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-8 rounded-l-[36px] bg-[linear-gradient(180deg,#74202c_0%,#4b141a_100%)] opacity-85 sm:w-12" />
          <div className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-8 rounded-r-[36px] bg-[linear-gradient(180deg,#74202c_0%,#4b141a_100%)] opacity-85 sm:w-12" />

          <div className="mb-8 text-center">
            <div className="inline-block rounded-full border border-[#d6b892] bg-white/75 px-4 py-1 text-xs uppercase tracking-[0.34em] text-[#8f7153] shadow-sm">
              Prenotazioni
            </div>

            <div className="mx-auto mt-5 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <div className="rounded-[26px] border border-[#e0cfb7] bg-white/90 p-3 shadow-[0_12px_24px_rgba(90,24,33,0.10)]">
                <Image
                  src="/logo-officina.png"
                  alt="Logo Officina Teatrale Il Ponte"
                  width={78}
                  height={78}
                  className="h-[64px] w-[64px] object-contain sm:h-[78px] sm:w-[78px]"
                  priority
                />
              </div>

              <div className="rounded-[26px] border border-[#e0cfb7] bg-white/85 p-3 shadow-[0_12px_24px_rgba(90,24,33,0.10)]">
                <Image
                  src="/icon.png"
                  alt="Icona Biglietteria Teatro"
                  width={88}
                  height={88}
                  className="h-[72px] w-[72px] rounded-[18px] object-cover sm:h-[88px] sm:w-[88px]"
                  priority
                />
              </div>
            </div>

            <div className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#8f7153]">
              Officina Teatrale Il Ponte
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#5a1821] sm:text-5xl">
              Prenota il tuo posto in platea
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6d6054] sm:text-base">
              Scegli lo spettacolo, inserisci i tuoi dati e invia la richiesta.
              La conferma del pagamento e i seriali dei biglietti verranno gestiti
              dall&apos;organizzazione.
            </p>
          </div>

          <Card className="bg-white/88">
            <CardHeader>
              <CardTitle>Modulo di prenotazione</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div className="rounded-[28px] border border-[#dbc3a4] bg-[linear-gradient(180deg,#fffaf4_0%,#f8ecde_100%)] p-5 shadow-sm">
                  <label className="text-sm font-medium text-[#5a1821]">Spettacolo</label>

                  <select
                    className="mt-2 w-full rounded-2xl border border-[#d4b28a] bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-[#8a3843]"
                    value={showSlug}
                    onChange={(e) => setShowSlug(e.target.value)}
                  >
                    {SHOWS.map((show) => (
                      <option key={show.slug} value={show.slug}>
                        {show.name}
                      </option>
                    ))}
                  </select>

                  <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[30px] border border-[#d9c3a5] bg-[linear-gradient(180deg,#fffdf9_0%,#f8ecde_100%)] p-4 shadow-[0_12px_30px_rgba(90,24,33,0.10)]">
                      <div className="rounded-[26px] border border-[#eadcc9] bg-white/90 p-3 shadow-inner">
                        <div className="rounded-[20px] border border-[#e6d3ba] bg-[#fffaf4] p-2">
                          <div
                            key={posterSrc}
                            className="relative overflow-hidden rounded-[14px] border border-[#e9dcca] bg-white"
                            style={{ animation: 'posterReveal 420ms ease' }}
                          >
                            <Image
                              src={posterSrc}
                              alt={`Locandina ${selectedShow?.name || ''}`}
                              width={900}
                              height={1350}
                              className="h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                              priority
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-center text-xs uppercase tracking-[0.22em] text-[#927252]">
                        Locandina spettacolo
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#e0cfb7] bg-white/85 p-5 shadow-sm">
                      <div className="text-lg font-semibold text-[#5a1821]">
                        {selectedShow?.name}
                      </div>

                      <div className="mt-3 text-sm text-[#61564c]">
                        📅{' '}
                        {new Date(selectedShow?.datetime || '').toLocaleDateString('it-IT', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        • 🕒 ore{' '}
                        {new Date(selectedShow?.datetime || '').toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      <div className="mt-3 text-sm font-medium text-[#5a1821]">
                        💶 Intero: €{selectedShow?.price_full} • Ridotto: €{selectedShow?.price_reduced}
                      </div>

                      <div className="mt-2 text-xs text-[#7a6c5f]">
                        Ridotto valido per bambini fino a 6 anni o per chi assiste a più spettacoli.
                      </div>

                      <div className="mt-4 grid gap-3">
                        <div className="rounded-2xl border border-[#d6c0a0] bg-[#fff7ee] px-4 py-3 text-sm">
                          <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">
                            Disponibilità reale
                          </div>
                          <div className="mt-1 text-2xl font-bold text-[#5a1821]">
                            {loadingPosti ? '...' : postiRimastiReali}
                          </div>
                          <div className="mt-1 text-xs text-[#74675c]">
                            Considera solo i biglietti già pagati
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#d6c0a0] bg-[#fff7ee] px-4 py-3 text-sm">
                          <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">
                            Disponibilità potenziale
                          </div>
                          <div className="mt-1 text-2xl font-bold text-[#5a1821]">
                            {loadingPosti ? '...' : postiRimastiSeConfermati}
                          </div>
                          <div className="mt-1 text-xs text-[#74675c]">
                            Se tutte le prenotazioni venissero confermate
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                        ⚠️ Da pagare in Officina entro 10 giorni dalla prenotazione, pena decadimento della stessa.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className={fieldCardClass}>
                    <label className="mb-2 block text-sm font-medium text-[#5a1821]">
                      Nome e cognome
                    </label>
                    <Input
                      className={fieldInputClass}
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={fieldCardClass}>
                    <label className="mb-2 block text-sm font-medium text-[#5a1821]">
                      Telefono
                    </label>
                    <Input
                      className={fieldInputClass}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className={fieldCardClass}>
                    <label className="mb-2 block text-sm font-medium text-[#5a1821]">
                      Email
                    </label>
                    <Input
                      className={fieldInputClass}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className={fieldCardClass}>
                    <label className="mb-2 block text-sm font-medium text-[#5a1821]">
                      Biglietti interi
                    </label>
                    <Input
                      className={fieldInputClass}
                      type="number"
                      min={0}
                      max={12}
                      value={fullTickets}
                      onChange={(e) => setFullTickets(Number(e.target.value))}
                    />
                  </div>

                  <div className={fieldCardClass}>
                    <label className="mb-2 block text-sm font-medium text-[#5a1821]">
                      Biglietti ridotti
                    </label>
                    <Input
                      className={fieldInputClass}
                      type="number"
                      min={0}
                      max={12}
                      value={reducedTickets}
                      onChange={(e) => setReducedTickets(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#e2cfb7] bg-[linear-gradient(180deg,#fffdf9_0%,#f7ecdf_100%)] p-5 shadow-[0_18px_30px_rgba(90,24,33,0.10),0_3px_0_rgba(255,255,255,0.65)_inset]">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">
                        Biglietti richiesti
                      </div>
                      <div className="mt-1 text-3xl font-bold text-[#5a1821]">
                        {ticketCount}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">
                        Totale da corrispondere
                      </div>
                      <div className="mt-1 text-3xl font-bold text-[#5a1821]">
                        €{totaleStimato}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={fieldCardClass}>
                  <label className="mb-2 block text-sm font-medium text-[#5a1821]">
                    Nomi partecipanti
                  </label>
                  <Textarea
                    className={fieldInputClass}
                    rows={5}
                    value={participantNames}
                    onChange={(e) => setParticipantNames(e.target.value)}
                    placeholder="Uno per riga, se possibile"
                  />
                </div>

                <div className={fieldCardClass}>
                  <label className="mb-2 block text-sm font-medium text-[#5a1821]">
                    Note
                  </label>
                  <Textarea
                    className={fieldInputClass}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Eventuali comunicazioni utili"
                  />
                </div>

                <div className="rounded-2xl border border-[#e2d3bf] bg-white/70 p-4 text-sm text-[#6d6155]">
                  Per ogni nominativo farà fede l&apos;ultima richiesta inviata. La conferma del
                  pagamento e i seriali dei biglietti vengono inseriti solo dall&apos;organizzazione.
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-[32px]">
                    <div className="select-none text-[90px] font-black leading-none text-white/10 blur-[1px] sm:text-[120px]">
                      🎭
                    </div>
                  </div>

                  <div className="pointer-events-none absolute -bottom-3 left-1/2 h-8 w-[82%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(90,24,33,0.22)_0%,rgba(90,24,33,0.08)_45%,rgba(90,24,33,0)_75%)] blur-md" />

                  <Button
                    onClick={submitBooking}
                    disabled={
                      busy ||
                      !requesterName ||
                      !phone ||
                      !email ||
                      ticketCount <= 0 ||
                      ticketCount > postiRimastiSeConfermati
                    }
                    className="relative w-full rounded-[28px] border-[#4b141a] bg-[linear-gradient(180deg,#6e1e2a_0%,#5a1821_55%,#4b141a_100%)] py-4 text-base shadow-[0_18px_28px_rgba(90,24,33,0.24),0_3px_0_rgba(255,255,255,0.10)_inset] hover:translate-y-[1px] hover:bg-[linear-gradient(180deg,#6e1e2a_0%,#56171f_55%,#431217_100%)]"
                  >
                    <span className="relative z-10 tracking-[0.04em]">
                      {busy ? 'Invio...' : 'Invia richiesta'}
                    </span>
                  </Button>
                </div>

                {message ? (
                  <div className="rounded-2xl border border-[#dcc6a7] bg-white/85 px-4 py-3 text-sm text-[#5a1821] shadow-sm">
                    {message}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <style jsx>{`
          @keyframes posterReveal {
            0% {
              opacity: 0;
              transform: scale(1.035);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </Container>
    </PageShell>
  );
}