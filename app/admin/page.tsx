'use client';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { SHOWS, TOTAL_POSTI } from '@/lib/config';
import { formatDateTime } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Input,
  PageShell,
} from '@/components/ui';
import { logout } from '../login/actions';

export default function AdminPage() {
  const supabase = createClient();
  const [showSlug, setShowSlug] = useState<string>(SHOWS[0].slug);
  const [bookings, setBookings] = useState<any[]>([]);
  const [serials, setSerials] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [receiptDrafts, setReceiptDrafts] = useState<Record<string, string>>({});
  const [savingReceiptId, setSavingReceiptId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const selectedShow = SHOWS.find((s) => s.slug === showSlug);
  const prezzoIntero = Number(selectedShow?.price_full || 10);

  async function loadData(slug = showSlug) {
    setLoading(true);

    const { data: show, error: showError } = await supabase
      .from('shows')
      .select('id')
      .eq('slug', slug)
      .single();

    if (showError || !show) {
      console.error('Errore caricamento show:', showError);
      setLoading(false);
      return;
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('show_id', show.id)
      .order('updated_at', { ascending: false });

    const { data: serialsData, error: serialsError } = await supabase
      .from('serials')
      .select('*')
      .eq('show_id', show.id)
      .order('code', { ascending: true });

    if (bookingsError) {
      console.error('Errore caricamento bookings:', bookingsError);
    }

    if (serialsError) {
      console.error('Errore caricamento serials:', serialsError);
    }

    const loadedBookings = bookingsData || [];
    setBookings(loadedBookings);
    setSerials(serialsData || []);

    const nextDrafts: Record<string, string> = {};
    loadedBookings.forEach((booking: any) => {
      nextDrafts[booking.id] = booking.receipt_number || '';
    });
    setReceiptDrafts(nextDrafts);

    setLoading(false);
  }

  useEffect(() => {
    loadData(showSlug);
  }, [showSlug]);

  const filtered = useMemo(() => {
    return bookings.filter((b) =>
      `${b.requester_name} ${b.phone} ${b.email || ''} ${b.receipt_number || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [bookings, search]);

  async function toggleBookingField(
    id: string,
    field: 'confirmed' | 'paid' | 'checked_in',
    value: boolean
  ) {
    const { error } = await supabase
      .from('bookings')
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      await loadData();
    } else {
      console.error('Errore aggiornamento booking:', error);
    }
  }

  async function assignSerial(booking: any, serialCode: string) {
    const serial = serials.find((s) => s.code === serialCode && s.status === 'LIBERO');
    if (!serial) return;

    const { error } = await supabase
      .from('serials')
      .update({
        status: booking.paid ? 'PAGATO' : 'PRENOTATO',
        assigned_to: booking.requester_name,
        booking_id: booking.id,
      })
      .eq('id', serial.id);

    if (!error) {
      await loadData();
    } else {
      console.error('Errore assegnazione seriale:', error);
    }
  }

  async function freeSerial(serialId: string) {
    const { error } = await supabase
      .from('serials')
      .update({
        status: 'LIBERO',
        assigned_to: null,
        booking_id: null,
      })
      .eq('id', serialId);

    if (!error) {
      await loadData();
    } else {
      console.error('Errore liberazione seriale:', error);
    }
  }

  async function saveReceiptNumber(bookingId: string) {
    setSaveMessage('');
    setSaveError('');
    setSavingReceiptId(bookingId);

    const value = receiptDrafts[bookingId] || '';

    const { data, error } = await supabase
      .from('bookings')
      .update({
        receipt_number: value.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select();

    if (error) {
      console.error('Errore salvataggio ricevuta:', error);
      setSaveError(`Errore salvataggio ricevuta: ${error.message}`);
      setSavingReceiptId(null);
      return;
    }

    console.log('Risultato update ricevuta:', data);
    setSaveMessage('Ricevuta salvata correttamente.');
    setSavingReceiptId(null);
    await loadData();
  }

  function isExpired(booking: any) {
    if (booking.paid) return false;
    if (!booking.created_at) return false;

    const created = new Date(booking.created_at).getTime();
    const now = Date.now();
    const tenDays = 10 * 24 * 60 * 60 * 1000;

    return now - created > tenDays;
  }

  function exportPrenotazioniExcel() {
    const rows = filtered.map((booking) => {
      const spettacolo = SHOWS.find((s) => s.slug === showSlug)?.name || showSlug;
      const assigned = serials
        .filter((s) => s.booking_id === booking.id)
        .map((s) => s.code)
        .join(', ');

      return {
        Spettacolo: spettacolo,
        Nome: booking.requester_name,
        Telefono: booking.phone,
        Email: booking.email || '',
        Ricevuta: booking.receipt_number || '',
        Biglietti: booking.ticket_count,
        ImportoStimato: `€${Number(booking.ticket_count || 0) * prezzoIntero}`,
        Partecipanti: booking.participant_names,
        Note: booking.notes || '',
        Confermato: booking.confirmed ? 'Sì' : 'No',
        Pagato: booking.paid ? 'Sì' : 'No',
        Ingresso: booking.checked_in ? 'Sì' : 'No',
        Seriali: assigned,
        Aggiornato: formatDateTime(booking.updated_at),
        ScadenzaPagamento: booking.created_at
          ? new Date(
              new Date(booking.created_at).getTime() + 10 * 24 * 60 * 60 * 1000
            ).toLocaleDateString('it-IT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prenotazioni');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const file = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    const nomeSpettacolo = SHOWS.find((s) => s.slug === showSlug)?.name || 'spettacolo';
    const safeName = nomeSpettacolo.replace(/\s+/g, '_').toLowerCase();

    saveAs(file, `prenotazioni_${safeName}.xlsx`);
  }

  const totalTicketsPaid = bookings
    .filter((b) => b.paid)
    .reduce((sum, b) => sum + Number(b.ticket_count || 0), 0);

  const totalTicketsRequested = bookings
    .reduce((sum, b) => sum + Number(b.ticket_count || 0), 0);

  const postiRimasti = Math.max(TOTAL_POSTI - totalTicketsPaid, 0);
  const incassoPagato = totalTicketsPaid * prezzoIntero;
  const incassoTeorico = totalTicketsRequested * prezzoIntero;

  const stats = {
    postiTotali: TOTAL_POSTI,
    postiRimasti,
    pagati: serials.filter((s) => s.status === 'PAGATO').length,
    prenotati: serials.filter((s) => s.status === 'PRENOTATO').length,
    ingressi: bookings.filter((b) => b.checked_in).length,
    bigliettiPagati: totalTicketsPaid,
    incassoPagato,
    incassoTeorico,
  };

  return (
    <PageShell>
      <Container wide>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Area amministratore 🎭</h1>
              <p className="text-sm text-zinc-600">
                Pagamento, seriali, ricevuta e incasso sono gestiti solo qui.
              </p>
            </div>

            <form action={logout}>
              <Button type="submit" variant="outline">
                Esci
              </Button>
            </form>
          </div>

          {saveMessage ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {saveMessage}
            </div>
          ) : null}

          {saveError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          ) : null}

          <Card>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4 xl:grid-cols-7">
                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <div className="text-xs text-zinc-500">Posti totali</div>
                  <div className="mt-1 text-2xl font-bold">{stats.postiTotali}</div>
                </div>

                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <div className="text-xs text-zinc-500">Posti rimasti</div>
                  <div className="mt-1 text-2xl font-bold">{stats.postiRimasti}</div>
                </div>

                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <div className="text-xs text-zinc-500">Pagati</div>
                  <div className="mt-1 text-2xl font-bold">{stats.pagati}</div>
                </div>

                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <div className="text-xs text-zinc-500">Prenotati</div>
                  <div className="mt-1 text-2xl font-bold">{stats.prenotati}</div>
                </div>

                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <div className="text-xs text-zinc-500">Ingressi</div>
                  <div className="mt-1 text-2xl font-bold">{stats.ingressi}</div>
                </div>

                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <div className="text-xs text-zinc-500">Incasso pagato</div>
                  <div className="mt-1 text-2xl font-bold">€{stats.incassoPagato}</div>
                </div>

                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <div className="text-xs text-zinc-500">Incasso teorico</div>
                  <div className="mt-1 text-2xl font-bold">€{stats.incassoTeorico}</div>
                </div>
              </div>

              <p className="mt-4 text-xs text-zinc-500">
                Posti rimasti calcolati sui biglietti segnati come pagati. Totali attualmente a tariffa intera (€{prezzoIntero}) per lo spettacolo selezionato.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestione spettacolo</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="mb-6 flex flex-col gap-3 md:flex-row">
                <select
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-sm md:w-72"
                  value={showSlug}
                  onChange={(e) => setShowSlug(e.target.value)}
                >
                  {SHOWS.map((show) => (
                    <option key={show.slug} value={show.slug}>
                      {show.name}
                    </option>
                  ))}
                </select>

                <Input
                  placeholder="Cerca nome, telefono, email o ricevuta"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <Button type="button" variant="outline" onClick={exportPrenotazioniExcel}>
                  Esporta Excel
                </Button>
              </div>

              {loading ? <p className="text-sm text-zinc-500">Caricamento...</p> : null}

              <div className="space-y-4">
                {filtered.map((booking) => {
                  const assigned = serials.filter((s) => s.booking_id === booking.id);
                  const available = serials.filter((s) => s.status === 'LIBERO').slice(0, 12);
                  const importoStimato = Number(booking.ticket_count || 0) * prezzoIntero;

                  return (
                    <div key={booking.id} className="rounded-2xl border bg-white p-4 space-y-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-lg font-semibold">{booking.requester_name}</div>
                            {booking.confirmed ? <Badge>Confermato</Badge> : null}
                            {booking.paid ? <Badge>Pagato</Badge> : null}
                            {booking.checked_in ? <Badge>Entrato</Badge> : null}
                            {isExpired(booking) ? (
                              <span className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                                Scaduta
                              </span>
                            ) : null}
                          </div>

                          <div className="text-sm text-zinc-600">📞 {booking.phone}</div>
                          <div className="text-sm text-zinc-600">✉️ {booking.email || '-'}</div>
                          <div className="text-sm text-zinc-600">
                            Biglietti richiesti: {booking.ticket_count}
                          </div>
                          <div className="text-sm font-medium text-zinc-700">
                            Totale stimato: €{importoStimato}
                          </div>
                          <div className="text-sm text-zinc-600">
                            Ricevuta attuale: {booking.receipt_number || '—'}
                          </div>

                          <div className="flex flex-col gap-2 pt-1 md:flex-row md:items-end">
                            <div className="flex-1">
                              <label className="text-xs text-zinc-500">Numero ricevuta</label>
                              <input
                                type="text"
                                value={
                                  receiptDrafts[booking.id] !== undefined
                                    ? receiptDrafts[booking.id]
                                    : booking.receipt_number || ''
                                }
                                onChange={(e) =>
                                  setReceiptDrafts((prev) => ({
                                    ...prev,
                                    [booking.id]: e.target.value,
                                  }))
                                }
                                placeholder="Inserisci seriale ricevuta"
                                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                              />
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => saveReceiptNumber(booking.id)}
                              disabled={savingReceiptId === booking.id}
                            >
                              {savingReceiptId === booking.id ? 'Salvataggio...' : 'Salva ricevuta'}
                            </Button>
                          </div>

                          <div className="whitespace-pre-line text-sm text-zinc-600">
                            {booking.participant_names}
                          </div>

                          <div className="text-xs text-zinc-500">
                            Aggiornato: {formatDateTime(booking.updated_at)}
                          </div>

                          <div className="text-xs text-zinc-500">
                            Scadenza pagamento:{' '}
                            {booking.created_at
                              ? new Date(
                                  new Date(booking.created_at).getTime() +
                                    10 * 24 * 60 * 60 * 1000
                                ).toLocaleDateString('it-IT', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })
                              : '-'}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={booking.confirmed ? 'secondary' : 'outline'}
                            onClick={() =>
                              toggleBookingField(booking.id, 'confirmed', !booking.confirmed)
                            }
                          >
                            {booking.confirmed ? 'Confermato' : 'Conferma'}
                          </Button>

                          <Button
                            variant={booking.paid ? 'secondary' : 'outline'}
                            onClick={() => toggleBookingField(booking.id, 'paid', !booking.paid)}
                          >
                            {booking.paid ? 'Pagato' : 'Segna pagato'}
                          </Button>

                          <Button
                            variant={booking.checked_in ? 'secondary' : 'outline'}
                            onClick={() =>
                              toggleBookingField(booking.id, 'checked_in', !booking.checked_in)
                            }
                          >
                            {booking.checked_in ? 'Entrato' : 'Ingresso'}
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-zinc-50 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">Seriali assegnati</div>
                          <div className="text-sm text-zinc-600">
                            {assigned.length} / {booking.ticket_count}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {assigned.length === 0 ? (
                            <span className="text-sm text-zinc-500">
                              Nessun seriale assegnato.
                            </span>
                          ) : null}

                          {assigned.map((serial) => (
                            <button
                              key={serial.id}
                              type="button"
                              className="rounded-full border bg-white px-3 py-1 text-sm"
                              onClick={() => freeSerial(serial.id)}
                            >
                              {serial.code}
                            </button>
                          ))}
                        </div>

                        {assigned.length < booking.ticket_count ? (
                          <div className="flex flex-wrap gap-2">
                            {available.map((serial) => (
                              <Button
                                key={serial.id}
                                variant="outline"
                                onClick={() => assignSerial(booking, serial.code)}
                              >
                                {serial.code}
                              </Button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </PageShell>
  );
}