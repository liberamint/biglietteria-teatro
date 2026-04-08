# Biglietteria Teatro

Web app Next.js + Supabase + Vercel per gestire:
- 6 spettacoli
- prenotazioni nominali
- pagamento segnato solo dall'organizzazione
- seriali assegnati manualmente
- controllo ingressi

## 1. Crea il progetto Supabase
Apri Supabase e crea un nuovo progetto.

## 2. Esegui lo schema SQL
Nel SQL Editor incolla e lancia il file `supabase-schema.sql`.

Questo crea:
- tabelle `shows`, `bookings`, `serials`, `admins`
- policy RLS
- seriali da 001 a 188 per ogni spettacolo

## 3. Crea l'utente admin
Nel pannello Supabase:
- vai in Authentication > Users
- crea un utente email/password per l'amministratore
- copia il suo UUID

Poi esegui nel SQL Editor:

```sql
insert into public.admins (user_id)
values ('UUID-DELL-UTENTE-ADMIN');
```

## 4. Configura il progetto locale
Copia `.env.example` in `.env.local` e inserisci:

```env
NEXT_PUBLIC_SUPABASE_URL=la-tua-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=la-tua-anon-key
```

## 5. Installa le dipendenze
```bash
npm install
```

## 6. Avvio locale
```bash
npm run dev
```

## 7. Deploy su Vercel
Metodo consigliato:
- carica il progetto su GitHub
- importa il repository in Vercel
- aggiungi in Vercel le Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- fai il deploy

In alternativa, da terminale:

```bash
npm i -g vercel
vercel --prod
```

## 8. Installazione sul telefono
Una volta pubblicata:
- Android: apri il link in Chrome > menu > Aggiungi a schermata Home
- iPhone: Safari > Condividi > Aggiungi a Home

## 9. Percorsi principali
- `/` home
- `/prenota` pubblico
- `/login` login amministratore
- `/admin` gestione completa

## 10. Sicurezza già inclusa
- `/admin` è protetta da login
- il pubblico può leggere solo gli spettacoli e inserire prenotazioni
- seriali e stato pagamenti sono leggibili e modificabili solo dagli admin tramite RLS

## 11. Miglioria futura semplice
Se vuoi, il passo successivo è aggiungere:
- modifica pubblica della prenotazione tramite telefono + codice
- stampa PDF elenco ingresso
- messaggio WhatsApp di conferma copiabile
