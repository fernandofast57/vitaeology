# Piano: Protezione PDF — Signed URL + Watermark

## Obiettivo

Proteggere i PDF dei 3 libri (Leadership, Risolutore, Microfelicità) con:
1. **Signed URL (24h)** — Link temporaneo che scade, generato dopo acquisto
2. **Watermark personalizzato** — Nome + email dell'acquirente stampato in trasparenza su ogni pagina

## Stato Attuale

- PDF consegnati via email con URL statici (env vars `PDF_URL_*`)
- URL esposti direttamente nell'HTML dell'email → chiunque può condividerli
- Tabella `user_books` ha già colonne `download_count` e `last_download_at` (mai usate)
- Nessun endpoint di download, nessuna protezione

## Dipendenze da Installare

```
npm install pdf-lib jose
```

- **`pdf-lib`** — Manipolazione PDF pura JS (watermark su ogni pagina)
- **`jose`** — JWT per token di download firmati con scadenza automatica

## Architettura

```
ACQUISTO STRIPE
    ↓
Webhook → sendBookEmail()
    ↓
Genera JWT (24h) → URL: /api/libro/download?token=xxx
    ↓
Email con link protetto (non più URL diretto al PDF)

UTENTE CLICCA LINK EMAIL
    ↓
/api/libro/download?token=xxx
    ↓
Valida JWT → Fetch PDF originale (server-side) → Watermark → Stream al browser
    ↓
PDF con "Copia personale di Mario Rossi - mario@example.com" su ogni pagina

UTENTE LOGGATO (dashboard/grazie)
    ↓
/api/libro/download?book=leadership (con cookie auth)
    ↓
Verifica auth + ownership → Watermark → Stream
```

## File da Creare

### 1. `src/lib/libro/download-token.ts` — Generazione/verifica JWT

```typescript
// generateDownloadToken({ email, name, bookSlug, expiresInSeconds? })
// → JWT firmato con CRON_SECRET, scadenza 24h default

// verifyDownloadToken(token)
// → { email, name, bookSlug } | null
```

- Signing key: `CRON_SECRET` (già esistente)
- Payload: `{ sub: email, name, book: slug, exp: +24h }`
- Libreria: `jose` (SignJWT / jwtVerify)

### 2. `src/lib/libro/watermark-pdf.ts` — Watermarking PDF

```typescript
// generateWatermarkedPdf({ bookSlug, buyerEmail, buyerName })
// → Uint8Array (PDF watermarked)
```

- Fetch PDF originale da env var `PDF_URL_*` (server-side, mai esposto al client)
- Carica con `PDFDocument.load()` da `pdf-lib`
- Su ogni pagina: testo diagonale (45°) semi-trasparente
  - Riga 1: Nome acquirente (36pt)
  - Riga 2: Email acquirente (22pt)
  - Colore: grigio (0.6, 0.6, 0.6), opacity 0.12
  - Font: Helvetica (built-in, nessun font esterno)
- Restituisce `Uint8Array` via `pdfDoc.save()`

### 3. `src/app/api/libro/download/route.ts` — Endpoint download

Due modalità di accesso:

**Token mode** (da email): `GET /api/libro/download?token=<JWT>`
- Valida JWT → estrae email, nome, bookSlug
- Se scaduto/invalido → redirect a login con messaggio

**Auth mode** (da dashboard/grazie): `GET /api/libro/download?book=<slug>`
- Verifica sessione Supabase
- Query `user_books` per confermare ownership
- Estrae nome/email dal profilo

In entrambi i casi:
- Genera PDF watermarked
- Incrementa `download_count` e aggiorna `last_download_at` in `user_books`
- Risponde con `Content-Type: application/pdf`, `Content-Disposition: attachment`
- Rate limit soft: max 20 download per libro per utente

### 4. `src/components/libro/DownloadBookButton.tsx` — Bottone download client

- Componente `'use client'`
- Verifica auth e ownership al mount
- Click → `fetch('/api/libro/download?book=slug')` → blob → download
- Loading state durante generazione watermark
- Gestione errori (401, 403, 500)
- Se webhook non ancora arrivato: retry dopo 3s, messaggio "Preparazione..."

### 5. `sql/user-books-update-policy.sql` — RLS policy UPDATE

```sql
CREATE POLICY "Users update own book downloads" ON user_books
  FOR UPDATE USING (auth.uid() = user_id);
```

## File da Modificare

### 6. `src/lib/email/send-book-email.ts`

**`sendBookEmail()`:**
- Import `generateDownloadToken`
- Genera token 24h: `generateDownloadToken({ email, name, bookSlug })`
- Costruisci URL: `${appUrl}/api/libro/download?token=${token}`
- Sostituisci `pdfUrl` con `downloadUrl` nel template HTML
- Aggiungi nota: "Questo link è valido per 24 ore"

**`sendTrilogyEmail()`:**
- Genera 3 token separati (uno per libro)
- Sostituisci i 3 `book.pdfUrl` con download URL firmati

### 7. `src/app/libro/[slug]/grazie/page.tsx`

- Aggiungere `DownloadBookButton` sotto il box info
- Sezione "Scarica subito il tuo libro" con download diretto
- Testo aggiornato: "Il PDF è anche in arrivo nella tua email"

### 8. Dashboard (opzionale, fase successiva)

- Card "Il Tuo Libro" nella dashboard del percorso per chi possiede il libro
- Bottone ri-download con `DownloadBookButton`

## Ordine di Implementazione

| # | Step | Dipende da |
|---|------|------------|
| 1 | `npm install pdf-lib jose` | — |
| 2 | `download-token.ts` (JWT) | jose |
| 3 | `watermark-pdf.ts` (watermark) | pdf-lib |
| 4 | `/api/libro/download` (endpoint) | #2, #3 |
| 5 | `send-book-email.ts` (email con signed URL) | #2 |
| 6 | `DownloadBookButton.tsx` (componente) | #4 |
| 7 | `grazie/page.tsx` (download diretto) | #6 |
| 8 | SQL migration (RLS policy) | — |
| 9 | Build + test | tutti |

## Env Vars

Nessuna nuova variabile richiesta:
- `PDF_URL_LEADERSHIP/RISOLUTORE/MICROFELICITA` — già esistenti (ora usate solo server-side)
- `CRON_SECRET` — già esistente (usato come signing key JWT)
- `NEXT_PUBLIC_APP_URL` — già esistente (per costruire download URL)

## Verifica

1. **TypeScript**: `npx tsc --noEmit` — 0 errori
2. **Lint**: `npx next lint` — 0 errori
3. **Test manuale**:
   - Generare token → verificare → download funziona
   - Token scaduto → mostra errore amichevole con link login
   - PDF watermarked → nome/email visibili su ogni pagina, leggibilità intatta
   - Utente loggato con libro → download da pagina grazie funziona
   - `download_count` incrementato dopo ogni download
   - URL originali PDF MAI esposti al client (verificare Network tab)
4. **Build**: `npm run build` pulita
