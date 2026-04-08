'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { SHOWS } from '@/lib/config';
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

  const selectedShow = SHOWS.find((s) => s.slug === showSlug);

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
  }

  return (
    <PageShell>
      <Container>
        <Card>
          <CardHeader>
            <CardTitle>Prenotazione biglietti</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Spettacolo</label>
                <select
                  className="mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm"
                  value={showSlug}
                  onChange={(e) => setShowSlug(e.target.value)}
                >
                  {SHOWS.map((show) => (
                    <option key={show.slug} value={show.slug}>
                      {show.name}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-sm text-zinc-600">
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
  <br />
  💶 Intero: €{selectedShow?.price_full} • Ridotto: €{selectedShow?.price_reduced}
  <br />
  <span className="text-xs text-zinc-500">
    Ridotto valido per bambini fino a 6 anni o per chi assiste a più spettacoli.
  </span>
  <br />
  <span className="text-xs text-red-600 font-medium">
    ⚠️ Da pagare in Officina entro 10 giorni dalla prenotazione, pena decadimento della stessa.
  </span>
</p>
              </div>

              <div>
                <label className="text-sm font-medium">Nome e cognome</label>
                <Input
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Telefono</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Numero biglietti</label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Nomi partecipanti</label>
                <Textarea
                  rows={5}
                  value={participantNames}
                  onChange={(e) => setParticipantNames(e.target.value)}
                  placeholder="Uno per riga, se possibile"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Note</label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                onClick={submitBooking}
                disabled={busy || !requesterName || !phone || !email}
                className="w-full"
              >
                {busy ? 'Invio...' : 'Invia richiesta'}
              </Button>

              <p className="text-sm text-zinc-600">
                Per ogni nominativo farà fede l&apos;ultima richiesta inviata. La conferma del
                pagamento e i seriali dei biglietti vengono inseriti solo dall&apos;organizzazione.
              </p>

              {message ? <p className="text-sm text-zinc-700">{message}</p> : null}
            </div>
          </CardContent>
        </Card>
      </Container>
    </PageShell>
  );
}