'use client';

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
  const [ticketCount, setTicketCount] = useState(1);
  const [participantNames, setParticipantNames] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [postiRimasti, setPostiRimasti] = useState<number>(TOTAL_POSTI);
  const [loadingPosti, setLoadingPosti] = useState(true);

  const selectedShow = SHOWS.find((s) => s.slug === showSlug);

  async function loadPostiRimasti(slug = showSlug) {
    setLoadingPosti(true);

    const { data: show, error: showError } = await supabase
      .from('shows')
      .select('id')
      .eq('slug', slug)
      .single();

    if (showError || !show) {
      setPostiRimasti(TOTAL_POSTI);
      setLoadingPosti(false);
      return;
    }

    const { data: paidBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('ticket_count')
      .eq('show_id', show.id)
      .eq('paid', true);

    if (bookingsError) {
      setPostiRimasti(TOTAL_POSTI);
      setLoadingPosti(false);
      return;
    }

    const occupati = (paidBookings || []).reduce(
      (sum, booking: any) => sum + Number(booking.ticket_count || 0),
      0
    );

    setPostiRimasti(Math.max(TOTAL_POSTI - occupati, 0));
    setLoadingPosti(false);
  }

  useEffect(() => {
    loadPostiRimasti(showSlug);
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

    if (ticketCount > postiRimasti) {
      setMessage(`Posti insufficienti. Attualmente disponibili: ${postiRimasti}.`);
      setBusy(false);
      return;
    }

    const { error: insertError } = await supabase.from('bookings').insert({
      show_id: show.id,
      requester_name: requesterName,
      phone,
      email,
      ticket_count: ticketCount,
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
    setTicketCount(1);
    setParticipantNames('');
    setNotes('');
    setBusy(false);

    await loadPostiRimasti(showSlug);
  }

  return (
    <PageShell>
      <Container>
        <div className="mx-auto max-w-3xl px-2 pt-6 sm:pt-8">
          <div className="mb-6 text-center">
            <div className="inline-block rounded-full border border-[#d7c0a0] bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.28em] text-[#8d6b57] shadow-sm">
              Prenotazioni
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#5b1820] sm:text-4xl">
              Prenota il tuo posto in platea
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6f6257] sm:text-base">
              Scegli lo spettacolo, inserisci i tuoi dati e invia la richiesta.
              La conferma del pagamento e i seriali dei biglietti verranno gestiti dall&apos;organizzazione.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Modulo di prenotazione</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-5">
                <div className="rounded-3xl border border-[#dbc8b0] bg-[linear-gradient(180deg,#fffaf4_0%,#f8efe3_100%)] p-4 shadow-sm">
                  <label className="text-sm font-medium text-[#5b1820]">Spettacolo</label>

                  <select
                    className="mt-2 w-full rounded-2xl border border-[#d6c0a0] bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-[#8a3943]"
                    value={showSlug}
                    onChange={(e) => setShowSlug(e.target.value)}
                  >
                    {SHOWS.map((show) => (
                      <option key={show.slug} value={show.slug}>
                        {show.name}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 rounded-2xl border border-[#e3d2bc] bg-white/80 p-4 text-sm text-[#5f5449] shadow-sm">
                    <div className="font-semibold text-[#5b1820]">{selectedShow?.name}</div>

                    <div className="mt-2">
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

                    <div className="mt-2 font-medium text-[#5b1820]">
                      💶 Intero: €{selectedShow?.price_full} • Ridotto: €{selectedShow?.price_reduced}
                    </div>

                    <div className="mt-2 text-xs text-[#7a6e63]">
                      Ridotto valido per bambini fino a 6 anni o per chi assiste a più spettacoli.
                    </div>

                    <div className="mt-3 rounded-xl border border-[#d6c0a0] bg-[#fff7ee] px-3 py-2 text-sm font-medium text-[#5b1820]">
                      {loadingPosti ? 'Posti disponibili: calcolo in corso...' : `Posti rimasti: ${postiRimasti}`}
                    </div>

                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                      ⚠️ Da pagare in Officina entro 10 giorni dalla prenotazione, pena decadimento della stessa.
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5b1820]">
                      Nome e cognome
                    </label>
                    <Input
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5b1820]">
                      Telefono
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5b1820]">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5b1820]">
                      Numero biglietti
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5b1820]">
                    Nomi partecipanti
                  </label>
                  <Textarea
                    rows={5}
                    value={participantNames}
                    onChange={(e) => setParticipantNames(e.target.value)}
                    placeholder="Uno per riga, se possibile"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5b1820]">
                    Note
                  </label>
                  <Textarea
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

                <Button
                  onClick={submitBooking}
                  disabled={
                    busy ||
                    !requesterName ||
                    !phone ||
                    !email ||
                    ticketCount <= 0 ||
                    ticketCount > postiRimasti
                  }
                  className="w-full"
                >
                  {busy ? 'Invio...' : 'Invia richiesta'}
                </Button>

                {message ? (
                  <div className="rounded-2xl border border-[#d8c1a1] bg-white/80 px-4 py-3 text-sm text-[#5b1820] shadow-sm">
                    {message}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </PageShell>
  );
}