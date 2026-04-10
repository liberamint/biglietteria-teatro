'use client';

import Image from 'next/image';
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
  const prezzoRidotto = Number(selectedShow?.price_reduced || 8);

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

    const { error } = await supabase
      .from('bookings')
      .update({
        receipt_number: value.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Errore salvataggio ricevuta:', error);
      setSaveError(`Errore salvataggio ricevuta: ${error.message}`);
      setSavingReceiptId(null);
      return;
    }

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

  function getBookingTotals(booking: any) {
    const full = Number(booking.full_tickets || 0);
    const reduced = Number(booking.reduced_tickets || 0);
    const ticketCount = Number(booking.ticket_count || 0);

    const normalizedFull = full === 0 && reduced === 0 ? ticketCount : full;
    const totalTickets = normalizedFull + reduced;
    const totale = normalizedFull * prezzoIntero + reduced * prezzoRidotto;

    return {
      full: normalizedFull,
      reduced,
      totalTickets,
      totale,
    };
  }

  function exportPrenotazioniExcel() {
    const rows = filtered.map((booking) => {
      const spettacolo = SHOWS.find((s) => s.slug === showSlug)?.name || showSlug;
      const assigned = serials
        .filter((s) => s.booking_id === booking.id)
        .map((s) => s.code)
        .join(', ');

      const totals = getBookingTotals(booking);

      return {
        Spettacolo: spettacolo,
        Nome: booking.requester_name,
        Telefono: booking.phone,
        Email: booking.email || '',
        Ricevuta: booking.receipt_number || '',
        Interi: totals.full,
        Ridotti: totals.reduced,
        Biglietti: totals.totalTickets,
        TotaleEsatto: `€${totals.totale}`,
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

  const bigliettiPagati = bookings
    .filter((b) => b.paid)
    .reduce((sum, booking) => sum + getBookingTotals(booking).totalTickets, 0);

  const bigliettiPrenotatiNonPagati = bookings
    .filter((b) => !b.paid)
    .reduce((sum, booking) => sum + getBookingTotals(booking).totalTickets, 0);

  const bigliettiTotaliPrenotati = bookings.reduce(
    (sum, booking) => sum + getBookingTotals(booking).totalTickets,
    0
  );

  const incassoPagato = bookings
    .filter((b) => b.paid)
    .reduce((sum, booking) => sum + getBookingTotals(booking).totale, 0);

  const incassoTeorico = bookings.reduce(
    (sum, booking) => sum + getBookingTotals(booking).totale,
    0
  );

  const postiRimastiReali = Math.max(TOTAL_POSTI - bigliettiPagati, 0);
  const postiRimastiSeConfermati = Math.max(TOTAL_POSTI - bigliettiTotaliPrenotati, 0);

  const stats = {
    postiTotali: TOTAL_POSTI,
    postiRimastiReali,
    postiRimastiSeConfermati,
    bigliettiPagati,
    bigliettiPrenotatiNonPagati,
    ingressi: bookings.filter((b) => b.checked_in).length,
    incassoPagato,
    incassoTeorico,
  };

  return (
    <PageShell>
      <Container>
        <div className="relative mx-auto max-w-7xl px-2 pt-6 sm:pt-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] rounded-[38px] bg-[radial-gradient(circle_at_top,#7b2430_0%,#5a1821_34%,rgba(90,24,33,0.08)_72%,transparent_100%)] opacity-95" />
          <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-8 rounded-l-[38px] bg-[linear-gradient(180deg,#74202c_0%,#4b141a_100%)] opacity-85 sm:w-12" />
          <div className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-8 rounded-r-[38px] bg-[linear-gradient(180deg,#74202c_0%,#4b141a_100%)] opacity-85 sm:w-12" />

          <div className="mb-8 text-center">
            <div className="inline-block rounded-full border border-[#d6b892] bg-white/75 px-4 py-1 text-xs uppercase tracking-[0.34em] text-[#8f7153] shadow-sm">
              Regia di sala
            </div>

            <div className="mx-auto mt-5 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <div className="rounded-[26px] border border-[#e0cfb7] bg-white/90 p-3 shadow-[0_12px_24px_rgba(90,24,33,0.10)]">
                <Image
                  src="/logo-officina.png"
                  alt="Logo Officina Teatrale"
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

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#5a1821] sm:text-5xl">
              Area amministratore
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6d6054] sm:text-base">
              Qui il sipario si apre sui numeri: disponibilità, incassi, ricevute,
              ingressi e controllo completo delle prenotazioni.
            </p>

            <div className="mt-5">
              <form action={logout}>
                <Button type="submit" variant="outline">
                  Esci
                </Button>
              </form>
            </div>
          </div>

          {saveMessage ? (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
              {saveMessage}
            </div>
          ) : null}

          {saveError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              {saveError}
            </div>
          ) : null}

          <Card className="bg-white/88">
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                <div className="rounded-3xl border border-[#e0cfb7] bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">Posti totali</div>
                  <div className="mt-2 text-3xl font-bold text-[#5a1821]">{stats.postiTotali}</div>
                </div>

                <div className="rounded-3xl border border-[#e0cfb7] bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">Già pagati</div>
                  <div className="mt-2 text-3xl font-bold text-[#5a1821]">{stats.bigliettiPagati}</div>
                </div>

                <div className="rounded-3xl border border-[#e0cfb7] bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">Prenotati</div>
                  <div className="mt-2 text-3xl font-bold text-[#5a1821]">{stats.bigliettiPrenotatiNonPagati}</div>
                </div>

                <div className="rounded-3xl border border-[#e0cfb7] bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">Posti rimasti reali</div>
                  <div className="mt-2 text-3xl font-bold text-[#5a1821]">{stats.postiRimastiReali}</div>
                </div>

                <div className="rounded-3xl border border-[#e0cfb7] bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">Posti rimasti se confermati</div>
                  <div className="mt-2 text-3xl font-bold text-[#5a1821]">{stats.postiRimastiSeConfermati}</div>
                </div>

                <div className="rounded-3xl border border-[#e0cfb7] bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">Ingressi</div>
                  <div className="mt-2 text-3xl font-bold text-[#5a1821]">{stats.ingressi}</div>
                </div>

                <div className="rounded-3xl border border-[#e0cfb7] bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">Incasso pagato</div>
                  <div className="mt-2 text-3xl font-bold text-[#5a1821]">€{stats.incassoPagato}</div>
                </div>

                <div className="rounded-3xl border border-[#e0cfb7] bg-white/85 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#927252]">Incasso teorico</div>
                  <div className="mt-2 text-3xl font-bold text-[#5a1821]">€{stats.incassoTeorico}</div>
                </div>
              </div>

              <p className="mt-4 text-xs text-[#7a6c5f]">
                “Già pagati” e “Prenotati” indicano il numero di biglietti. “Posti rimasti reali” considera solo i pagati. “Posti rimasti se confermati” considera tutte le prenotazioni.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-white/88">
            <CardHeader>
              <CardTitle>Gestione spettacolo</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="mb-6 flex flex-col gap-3 md:flex-row">
                <select
                  className="w-full rounded-2xl border border-[#d4b28a] bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-[#8a3843] md:w-72"
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

              {loading ? <p className="text-sm text-[#6d6054]">Caricamento...</p> : null}

              <div className="space-y-5">
                {filtered.map((booking) => {
                  const assigned = serials.filter((s) => s.booking_id === booking.id);
                  const available = serials.filter((s) => s.status === 'LIBERO').slice(0, 12);
                  const totals = getBookingTotals(booking);

                  return (
                    <div
                      key={booking.id}
                      className="rounded-[28px] border border-[#e0cfb7] bg-white/88 p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-xl font-semibold text-[#5a1821]">
                              {booking.requester_name}
                            </div>
                            {booking.confirmed ? <Badge>Confermato</Badge> : null}
                            {booking.paid ? <Badge>Pagato</Badge> : null}
                            {booking.checked_in ? <Badge>Entrato</Badge> : null}
                            {isExpired(booking) ? (
                              <span className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                                Scaduta
                              </span>
                            ) : null}
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="text-sm text-[#61564c]">📞 {booking.phone}</div>
                            <div className="text-sm text-[#61564c]">✉️ {booking.email || '-'}</div>
                            <div className="text-sm text-[#61564c]">Biglietti interi: {totals.full}</div>
                            <div className="text-sm text-[#61564c]">Biglietti ridotti: {totals.reduced}</div>
                            <div className="text-sm text-[#61564c]">Biglietti richiesti: {totals.totalTickets}</div>
                            <div className="text-sm font-medium text-[#5a1821]">Totale esatto: €{totals.totale}</div>
                          </div>

                          <div className="rounded-2xl border border-[#e0cfb7] bg-[#fffaf4] px-4 py-3 text-sm text-[#61564c]">
                            Ricevuta attuale: <span className="font-medium text-[#5a1821]">{booking.receipt_number || '—'}</span>
                          </div>

                          <div className="flex flex-col gap-2 pt-1 md:flex-row md:items-end">
                            <div className="flex-1">
                              <label className="text-xs uppercase tracking-[0.18em] text-[#927252]">
                                Numero ricevuta
                              </label>
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
                                className="mt-1 w-full rounded-2xl border border-[#d4b28a] bg-white px-3 py-2 text-sm shadow-sm"
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

                          <div className="rounded-2xl border border-[#eadcc9] bg-[#fffdf9] p-4 text-sm text-[#61564c] whitespace-pre-line">
                            {booking.participant_names}
                          </div>

                          <div className="text-xs text-[#7a6c5f]">
                            Aggiornato: {formatDateTime(booking.updated_at)}
                          </div>

                          <div className="text-xs text-[#7a6c5f]">
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

                        <div className="flex flex-wrap gap-2 lg:max-w-[260px] lg:justify-end">
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

                      <div className="mt-5 rounded-3xl border border-[#e0cfb7] bg-[linear-gradient(180deg,#fffaf4_0%,#f8ecde_100%)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium text-[#5a1821]">Seriali assegnati</div>
                          <div className="text-sm text-[#61564c]">
                            {assigned.length} / {totals.totalTickets}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {assigned.length === 0 ? (
                            <span className="text-sm text-[#7a6c5f]">
                              Nessun seriale assegnato.
                            </span>
                          ) : null}

                          {assigned.map((serial) => (
                            <button
                              key={serial.id}
                              type="button"
                              className="rounded-full border bg-white px-3 py-1 text-sm shadow-sm"
                              onClick={() => freeSerial(serial.id)}
                            >
                              {serial.code}
                            </button>
                          ))}
                        </div>

                        {assigned.length < totals.totalTickets ? (
                          <div className="mt-3 flex flex-wrap gap-2">
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