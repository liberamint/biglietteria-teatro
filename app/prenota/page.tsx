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
  const [fullTickets, setFullTickets] = useState(1);
  const [reducedTickets, setReducedTickets] = useState(0);
  const [participantNames, setParticipantNames] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [postiRimasti, setPostiRimasti] = useState<number>(TOTAL_POSTI);
  const [loadingPosti, setLoadingPosti] = useState(true);

  const selectedShow = SHOWS.find((s) => s.slug === showSlug);
  const prezzoIntero = Number(selectedShow?.price_full || 10);
  const prezzoRidotto = Number(selectedShow?.price_reduced || 8);

  const ticketCount = Number(fullTickets || 0) + Number(reducedTickets || 0);
  const totaleStimato =
    Number(fullTickets || 0) * prezzoIntero +
    Number(reducedTickets || 0) * prezzoRidotto;

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

    if (ticketCount <= 0) {
      setMessage('Inserisci almeno un biglietto tra interi e ridotti.');
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
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6f6257] sm