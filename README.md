# BabyChess

Una semplice web app per archiviar, cercare e visualizzare partite di scacchi in formato PGN.

## Stack

- **Next.js 16**: framework React fullstack
- **Tailwind CSS 4**: styling
- **Supabase**: backend PostgreSQL con autenticazione e RLS
- **pgn-parser**: parser per file PGN

## Setup

### Prerequisiti
- Node.js 18+
- Un account Supabase

### Installazione locale

```bash
# Clone / apri il repo
cd babychess

# Installa dipendenze
npm install

# Configura variabili ambiente
cp .env.example .env.local
# Modifica .env.local con le tue credenziali Supabase
```

### Configurazione Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un progetto
2. Copia `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nel file `.env.local`
3. Vai nella console SQL di Supabase e esegui il contenuto di `supabase/schema.sql`
4. (Opzionale) Configura le righe RLS se vuoi controllare accessi

### Avvio development

```bash
npm run dev
```

L'app sarà disponibile a `http://localhost:3000`.

## Utilizzo

### Pagina Partite (Home)
- Visualizza tutte le partite archiviate
- Filtra per giocatore, data o autore dell'inserimento
- Clicca su una partita per vederne il dettaglio completo

### Pagina Inserisci
- Carica un file PGN (uno o più partite)
- Oppure inserisci manualmente una partita
- Specifica il nickname `babyfeeling` o `bb` come autore
- Le partite vengono salvate nel database

### Dettaglio Partita
- Visualizza metadati completi (evento, luogo, turno, autore)
- Leggi il PGN completo della partita

## Tema e Stile

L'interfaccia è in **dark mode** con gradient blu-scuro. Le componenti supportano Tailwind CSS e possono essere facilmente personalizzate modificando i file in `src/app/` e `src/components/`.

## Struttura Progetto

```
src/
  app/
    page.tsx           # Homepage con filtri
    add/page.tsx       # Upload/inserimento PGN
    login/page.tsx     # Info accesso (non usato attualmente)
    games/[id]/page.tsx # Dettaglio partita
  components/
    game-cards.tsx     # Lista partite
    pgn-upload.tsx     # Upload file PGN
    parsed-games-preview.tsx # Anteprima partite caricate
    site-shell.tsx     # Layout comune
  lib/
    chess.ts           # Utilità e tipi
    pgn-parser.ts      # Parser PGN
    supabase-browser.ts # Client Supabase
supabase/
  schema.sql         # Schema database e RLS policies
```

## Deployment

### Vercel + Supabase

1. Pushare su GitHub
2. Connettere il repo in Vercel
3. Impostare variabili ambiente in Vercel: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automatico da `main`

## Note

- I nickname riconosciuti sono `babyfeeling` e `bb`
- Tutte le partite sono pubbliche per lettura
- Il database traccia chi ha inserito ogni partita tramite `added_by_email`

## Licenza

MIT
