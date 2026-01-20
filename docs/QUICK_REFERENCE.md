# VITAEOLOGY - QUICK REFERENCE

Riferimento rapido per riprendere il lavoro sul progetto.

---

## COMANDI ESSENZIALI

```bash
# Avvia sviluppo
npm run dev

# Build
npm run build

# Esegui SQL
node scripts/run-sql.js sql/nomefile.sql

# Aggiorna RAG da LaTeX
npm run update-rag

# Oppure con opzioni
npx tsx scripts/update-rag-from-latex.ts --zip=./books/libri.zip --clear --dry-run
```

---

## STRUTTURA CHIAVE

```
src/app/                    # Pages
src/components/             # React components
src/lib/                    # Business logic
src/lib/ai-coach/           # Sistema AI Coach
src/lib/challenge/          # Contenuti challenge
src/lib/email/              # Template email
src/data/libri.ts           # Dati 3 libri
src/config/pricing.ts       # Config prezzi
```

---

## URL PRINCIPALI

| Pagina | URL |
|--------|-----|
| Homepage | `/` |
| Dashboard | `/dashboard` |
| Assessment Leadership | `/assessment/leadership` |
| Assessment Risolutore | `/assessment/risolutore` |
| Assessment Microfelicità | `/assessment/microfelicita` |
| Esercizi | `/exercises` |
| Challenge Leadership | `/challenge/leadership` |
| Challenge Ostacoli | `/challenge/ostacoli` |
| Challenge Microfelicità | `/challenge/microfelicita` |
| Libro Leadership | `/libro/leadership` |
| Admin Users | `/admin/users` |
| Admin Analytics | `/admin/analytics` |

---

## API PRINCIPALI

| Endpoint | Metodo | Funzione |
|----------|--------|----------|
| `/api/ai-coach` | POST | Chat AI Coach |
| `/api/assessment/questions` | GET | Domande assessment |
| `/api/assessment/complete` | POST | Completa assessment |
| `/api/challenge/subscribe` | POST | Iscrizione challenge |
| `/api/stripe/checkout` | POST | Checkout subscription |
| `/api/libro/checkout` | POST | Checkout libro |

---

## COLORI BRAND

```
Petrol (Primary):  #0A2540
Gold (Accent):     #F4B942
```

**Pilastri:**
- Visione: #3B82F6 (blu)
- Relazioni: #10B981 (verde)
- Adattamento: #8B5CF6 (viola)
- Azione: #F59E0B (arancione)

**Challenge:**
- Leadership: amber
- Ostacoli: emerald
- Microfelicità: violet

---

## DATABASE TABLES PRINCIPALI

| Tabella | Righe | Uso |
|---------|-------|-----|
| `profiles` | N utenti | Profili utente |
| `characteristics` | 24 | Caratteristiche leadership |
| `assessment_questions` | 167 | Domande assessment (72+48+47) |
| `exercises` | 52 | Esercizi settimanali |
| `ai_coach_conversations` | N | Storico chat AI |
| `challenge_subscribers` | N | Iscritti challenge |
| `book_knowledge` | 966 | Chunks RAG libri (3 libri LaTeX) |

---

## VARIABILI AMBIENTE RICHIESTE

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ANTHROPIC_API_KEY
OPENAI_API_KEY
RESEND_API_KEY
CRON_SECRET
NEXT_PUBLIC_APP_URL
```

---

## PRINCIPI FONDAMENTALI

1. **Linguaggio SEMPRE validante** - Mai "ti manca", sempre "puoi espandere"
2. **User Agency** - Utente è agente, non paziente
3. **AI Coach = FERNANDO** - Mai Marco
4. **Sequenza ESSERE → FARE → AVERE**

---

## FILE DA LEGGERE PRIMA DI MODIFICARE

| Area | File |
|------|------|
| Stili globali | `src/app/globals.css` |
| Config Tailwind | `tailwind.config.ts` |
| AI Coach prompt | `src/lib/ai-coach/system-prompt.ts` |
| Dati libri | `src/data/libri.ts` |
| Prezzi | `src/config/pricing.ts` |
| Challenge content | `src/lib/challenge/day-content.ts` |
| Email templates | `src/lib/email/challenge-day-templates.ts` |

---

## DOCUMENTAZIONE COMPLETA

→ `docs/PROGETTO_VITAEOLOGY_COMPLETO.md`

---

*Ultimo aggiornamento: 20 Gennaio 2026*
