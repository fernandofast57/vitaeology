# CLAUDE.md - Istruzioni Complete per Claude Code
## Progetto: Vitaeology - Leadership Development Platform

**Versione:** 2.2
**Ultimo aggiornamento:** 12 Gennaio 2026
**Owner:** Fernando Marongiu

---

## CONTESTO PROGETTO

Vitaeology è una **piattaforma SaaS completa** per lo sviluppo della leadership destinata a imprenditori italiani (35-55 anni).

### Stack Tecnologico
| Tecnologia | Versione | Uso |
|------------|----------|-----|
| Next.js | 14.x | App Router, SSR |
| TypeScript | 5.x | Tipizzazione strict |
| Supabase | - | PostgreSQL + Auth + RLS |
| Tailwind CSS | 3.x | Styling |
| Stripe | - | Pagamenti subscription + one-time |
| Anthropic Claude | - | AI Coach |
| OpenAI | - | Embeddings RAG |
| Resend | - | Email automation |
| Vercel | - | Hosting + Cron |

### Integrazioni Attive
- **ANTHROPIC_API_KEY** → AI Coach Fernando
- **OPENAI_API_KEY** → Embeddings per RAG (3 libri)
- **STRIPE_SECRET_KEY** → Pagamenti
- **RESEND_API_KEY** → Email challenge
- **SUPABASE** → Database + Auth

---

## PRINCIPI FONDAMENTALI (OBBLIGATORI)

### 0. Framework dei 4 Prodotti (Fondamento)

Ogni sistema di produzione genera **4 prodotti fondamentali**, ciascuno governato da **3 fattori**:

#### I 4 Prodotti

| # | Prodotto | Definizione | In Vitaeology |
|---|----------|-------------|---------------|
| **P1** | L'istituzione di ciò che produce | Il sistema/macchina che genera | Piattaforma (Challenge, Assessment, Esercizi) |
| **P2** | Il prodotto generato | L'output creato | Trasformazione utente (risultati, completamenti, consapevolezza) |
| **P3** | La riparazione di ciò che produce | Manutenzione del sistema | Bug fix, UX improvements, ottimizzazioni |
| **P4** | La correzione del prodotto generato | Correzione dell'output | **AI Coach Fernando** (supporto on-demand) |

#### I 3 Fattori (per ogni prodotto)

| Fattore | Significato | Domanda Guida |
|---------|-------------|---------------|
| **Quantità** | Ammontare | "Quanto ne produciamo?" |
| **Qualità** | Grado di perfezione | "Quanto è ben fatto?" |
| **Viability** | Longevità, utilità, desiderabilità | "Quanto dura e serve?" |

**Totale: 4 Prodotti × 3 Fattori = 12 Fattori di Produzione**

#### Regola Critica
```
NON confondere i 4 prodotti tra loro.
Ogni prodotto ha il suo contesto e momento.
```

#### Applicazione a Vitaeology

```
P1 (Sistema)     → Costruisce i funnel e le funzionalità
P2 (Output)      → Consegnato all'utente ai punti STOP
P3 (Manutenzione)→ Migliora il sistema nel tempo
P4 (Correzione)  → Disponibile ON-DEMAND, non imposto
```

**Errore tipico:** Trattare P4 (AI Coach) come P2 (output da consumare), proponendolo ai punti STOP dove l'utente deve ricevere il suo output, non una correzione.

**Soluzione:** AI Coach (P4) vive sulla Dashboard, disponibile quando l'utente SCEGLIE di correggere/migliorare il suo percorso.

---

### 1. Principio Validante
```
✅ SEMPRE: "dove già operi", "puoi espandere", "riconosci"
❌ MAI: "ti manca", "area debole", "devi migliorare"
```
L'utente **POSSIEDE GIÀ** tutte le capacità di leadership.

### 2. User Agency
- L'utente è **AGENTE attivo**, non paziente passivo
- Mai prescrizioni dirette ("devi fare X")
- Sempre domande e facilitazione

### 3. Sequenza ESSERE → FARE → AVERE
- Prima identità (chi sei)
- Poi comportamento (cosa fai)
- Poi risultato (cosa ottieni)

### 4. AI Coach = FERNANDO (mai Marco)
```
✅ "Sono Fernando, il tuo AI Coach"
❌ "Sono Marco" (ERRORE CRITICO)
```

### 5. Principio STOP → START (Customer Journey)

Il Customer Journey segue cicli **START → CHANGE → STOP**:
- **START**: L'utente inizia un'azione (es. inizia assessment)
- **CHANGE**: L'utente è nel processo (es. risponde alle domande)
- **STOP**: L'utente completa l'azione (es. vede i risultati)

#### Regola Fondamentale
```
Ogni STOP deve avere UNA CTA chiara che motiva al SÌ verso il prossimo START.
NO opzioni multiple che creano incertezza decisionale.
```

#### AI Coach Fernando: Dove SÌ e Dove NO

| Contesto | AI Coach | Motivo |
|----------|----------|--------|
| **Dashboard** | ✅ SÌ | Hub neutro, l'utente sceglie |
| **Assessment Results** | ❌ NO | CTA chiara: "Inizia Esercizio" |
| **Challenge Day 1-7** | ❌ NO | Focus sul contenuto strutturato |
| **Challenge Complete** | ❌ NO | CTA chiara: "Fai Assessment" |
| **Subscription Success** | ❌ NO | CTA chiara: "Vai alla Dashboard" |
| **Exercise Complete** | ❌ NO | CTA chiara: "Prossimo Esercizio" |
| **Email transazionali** | ❌ NO | CTA diretta all'azione |

#### Perché NO ai punti STOP?
1. **AI Coach è conversazione aperta** → Gli STOP richiedono direzione precisa
2. **Crea attrito decisionale** → "Clicco esercizi O parlo con Fernando?"
3. **Lo STOP deve motivare UN solo SÌ** → Non dare alternative ambigue

#### Esempio Corretto
```
STOP: Assessment Results
  ❌ "Parla con Fernando dei tuoi risultati" (ambiguo)
  ✅ "Inizia l'Esercizio per la tua Area di Crescita" (azione chiara)
```

---

## STRUTTURA PROGETTO COMPLETA

### Pagine (35+)

```
src/app/
├── page.tsx                     # Homepage
├── auth/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── dashboard/
│   ├── layout.tsx               # Layout con sidebar
│   └── page.tsx                 # Dashboard principale
│
├── assessment/
│   └── lite/
│       ├── page.tsx             # 72 domande scala 1-5
│       └── results/page.tsx     # Risultati radar chart
│
├── exercises/
│   ├── page.tsx                 # Lista 52 esercizi
│   └── [exerciseId]/page.tsx    # Dettaglio esercizio
│
├── challenge/                   # FUNNEL 7 GIORNI
│   ├── leadership/page.tsx      # Landing A/B (amber)
│   ├── ostacoli/page.tsx        # Landing A/B (emerald)
│   ├── microfelicita/page.tsx   # Landing A/B (violet)
│   └── [type]/
│       ├── day/[day]/page.tsx   # Contenuto giorno 1-7
│       └── complete/page.tsx    # Completamento
│
├── libro/                       # SALES FUNNEL LIBRI
│   └── [slug]/
│       ├── page.tsx             # Landing libro (leadership|risolutore|microfelicita)
│       ├── AcquistaButton.tsx   # Bottone checkout
│       └── grazie/page.tsx      # Thank you post-acquisto
│
├── admin/                       # ADMIN PANEL (9 pagine)
│   ├── layout.tsx
│   ├── users/page.tsx
│   ├── analytics/page.tsx
│   ├── ai-coach/page.tsx
│   ├── api-costs/page.tsx
│   ├── performance/page.tsx
│   ├── quality-audit/page.tsx
│   ├── feedback-patterns/page.tsx
│   ├── corrections/page.tsx
│   └── ab-testing/page.tsx
│
├── profile/page.tsx
├── progress/page.tsx
├── results/page.tsx
├── pricing/page.tsx
├── subscription/page.tsx
├── contact/page.tsx
├── terms/page.tsx
└── privacy/page.tsx
```

### API Endpoints (38+)

```
src/app/api/
├── ai-coach/
│   ├── route.ts                 # POST - Chat principale Claude
│   ├── conversations/route.ts   # GET - Lista conversazioni
│   ├── feedback/route.ts        # POST - Feedback messaggio
│   ├── edit/route.ts            # POST - Modifica messaggio
│   ├── reformulate/route.ts     # POST - Riformulazione
│   ├── history/route.ts         # GET - Storico paginato
│   ├── export/route.ts          # POST - Export PDF/JSON
│   ├── signals/route.ts         # POST - Segnali impliciti
│   └── cron/
│       ├── daily-metrics/route.ts
│       └── weekly-report/route.ts
│
├── assessment/
│   ├── questions/route.ts       # GET - 72 domande
│   ├── session/route.ts         # POST - Crea/recupera sessione
│   ├── answer/route.ts          # POST - Salva risposta
│   ├── complete/route.ts        # POST - Completa assessment
│   └── results/[id]/route.ts    # GET - Risultati
│
├── stripe/
│   ├── checkout/route.ts        # POST - Checkout subscription
│   ├── portal/route.ts          # POST - Customer portal
│   └── webhook/route.ts         # POST - Webhook Stripe
│
├── challenge/
│   ├── subscribe/route.ts       # POST - Iscrizione + welcome email
│   ├── complete-day/route.ts    # POST - Completa giorno
│   └── check-unlock/route.ts    # POST - Verifica sblocco
│
├── libro/
│   └── checkout/route.ts        # POST - Checkout libro singolo
│
├── recommendations/route.ts     # GET - Esercizi raccomandati
│
├── cron/
│   └── send-challenge-emails/route.ts  # Cron giornaliero
│
└── admin/
    ├── users/route.ts
    ├── analytics/route.ts
    └── ai-coach/dashboard/route.ts
```

### Componenti (24+)

```
src/components/
├── ai-coach/
│   ├── ChatWidget.tsx           # Widget chat principale
│   ├── ConversationHistory.tsx  # Storico conversazioni
│   └── ExportButton.tsx         # Export PDF/JSON
│
├── dashboard/
│   ├── WelcomeHero.tsx          # Hero benvenuto
│   ├── AssessmentCard.tsx       # Card assessment
│   ├── QuickStats.tsx           # Statistiche rapide
│   ├── TrialBanner.tsx          # Banner trial
│   ├── MiniRadarPreview.tsx     # Mini radar chart
│   ├── ExercisesCard.tsx        # Card esercizi
│   ├── RecommendedExercises.tsx # Esercizi raccomandati
│   └── RecentActivity.tsx       # Attività recente
│
├── assessment/
│   ├── QuestionCard.tsx         # Card domanda
│   ├── ProgressBar.tsx          # Barra progresso
│   └── ResultsRadar.tsx         # Radar risultati
│
├── charts/
│   └── LeadershipRadarChart.tsx # Radar chart Recharts
│
├── layout/
│   ├── Sidebar.tsx              # Sidebar navigazione
│   └── DashboardHeader.tsx      # Header
│
├── exercises/
│   ├── ExercisesList.tsx        # Lista esercizi
│   ├── ExerciseDetail.tsx       # Dettaglio
│   └── LockedExerciseView.tsx   # Vista bloccata
│
└── challenge/
    └── DiscoveryConfirmation.tsx # Quiz A/B/C
```

### Librerie (src/lib/)

```
src/lib/
├── ai-coach/
│   ├── types.ts                 # Interfacce TypeScript
│   ├── system-prompt.ts         # Prompt Fernando completo
│   ├── user-memory.ts           # Memoria personalizzazione
│   ├── pattern-recognition.ts   # Pattern detection
│   ├── implicit-signals.ts      # Segnali impliciti
│   ├── daily-metrics.ts         # Metriche giornaliere
│   └── weekly-report.ts         # Report settimanale
│
├── supabase/
│   ├── client.ts                # Client browser
│   ├── server.ts                # Client server
│   └── middleware.ts            # Auth middleware
│
├── services/
│   └── exercise-recommendation.ts # Raccomandazioni esercizi
│
├── challenge/
│   ├── day-content.ts           # Contenuti 7 giorni (×3 challenge)
│   └── discovery-data.ts        # 63 domande discovery A/B/C
│
├── email/
│   └── challenge-day-templates.ts # 21 template email + system emails
│
├── rag.ts                       # RAG System (OpenAI embeddings)
├── assessment-scoring.ts        # Calcolo punteggi assessment
│
├── types/
│   ├── roles.ts                 # RBAC + subscription tiers
│   └── exercises.ts             # Tipi esercizi
│
└── data/
    └── libri.ts                 # Dati 3 libri
```

---

## I 3 LIBRI / PERCORSI

| Libro | Slug | Colore | Prezzo |
|-------|------|--------|--------|
| Leadership Autentica | `leadership` | Oro #D4AF37 | €9.90 |
| Oltre gli Ostacoli | `risolutore` | Verde #10B981 | €9.90 |
| Microfelicità Digitale | `microfelicita` | Viola #8B5CF6 | €9.90 |

---

## I 4 PILASTRI (24 Caratteristiche)

| Pilastro | Nome IT | Colore | Caratteristiche |
|----------|---------|--------|-----------------|
| ESSERE | Visione | #3B82F6 (blu) | 6 |
| SENTIRE | Relazioni | #10B981 (verde) | 6 |
| PENSARE | Adattamento | #8B5CF6 (viola) | 6 |
| AGIRE | Azione | #F59E0B (arancione) | 6 |

**Totale: 24 caratteristiche di leadership**

---

## SISTEMA CHALLENGE (Funnel 7 Giorni)

### 3 Challenge con A/B Testing

| Challenge | URL | Colore | Varianti |
|-----------|-----|--------|----------|
| Leadership Autentica | `/challenge/leadership` | Amber | A/B/C |
| Oltre gli Ostacoli | `/challenge/ostacoli` | Emerald | A/B/C |
| Microfelicità | `/challenge/microfelicita` | Violet | A/B/C |

### Flusso
```
1. Landing con A/B testing → Form iscrizione
2. POST /api/challenge/subscribe → Salva + Welcome email
3. [7 giorni] Email contenuto → /challenge/[type]/day/[1-7]
4. Quiz discovery 3 domande A/B/C per giorno
5. Completamento → CTA Assessment/Libro
```

### Email System (Resend)
- **21 template** contenuto (7 giorni × 3 challenge)
- **Reminder** (48h inattività)
- **Force Advance** (72h inattività)
- **Recovery** (3 giorni post-challenge)
- **Cron job:** `/api/cron/send-challenge-emails` (8:00 UTC)

---

## SISTEMA ASSESSMENT

### Assessment LITE
- **72 domande** (3 per caratteristica × 24 caratteristiche)
- **Scala 1-5:** Quasi mai → Costantemente
- **Scoring:** Direct + Inverse
- **Output:** Radar chart 4 pilastri + breakdown 24 caratteristiche

### Tabelle DB
- `assessment_questions` (72/240 righe)
- `user_assessments` (sessioni)
- `user_answers` (risposte)
- `characteristic_scores` (punteggi)

---

## SISTEMA AI COACH FERNANDO

### Architettura
```
ChatWidget → /api/ai-coach → Claude API
                ↓
            RAG System → book_chunks (pgvector)
                ↓
            User Memory → ai_coach_user_memory
```

### System Prompt (Estratto)
```
Sei Fernando Marongiu, autore della trilogia "Rivoluzione Aurea".
Le persone hanno già dentro di sé le capacità di leadership.
Non devono "acquisirle" - devono RICONOSCERLE e ESPANDERLE.
```

### User Memory
- `communication_style`: directive | socratic | storytelling
- `preferred_response_length`: brief | moderate | detailed
- `common_challenges[]`
- `successful_approaches[]`
- `trigger_topics[]`

### RAG (3 Libri)
- Embeddings: OpenAI `text-embedding-3-small`
- Vector search: pgvector su Supabase
- Filter per `current_path`: leadership | problemi | benessere

---

## DESIGN SYSTEM

### Colori Primari
```css
--petrol-600: #0A2540;     /* Blu Petrolio - Primary */
--gold-500: #F4B942;       /* Oro - Accent */
```

### Pilastri
```css
--pillar-being: #3B82F6;   /* Blu - Visione */
--pillar-feeling: #10B981; /* Verde - Relazioni */
--pillar-thinking: #8B5CF6;/* Viola - Adattamento */
--pillar-acting: #F59E0B;  /* Arancione - Azione */
```

### Typography
- **Display/Headings:** Stoke (serif)
- **Body:** Inter (sans-serif)

### Classi CSS Globali
```css
.btn-primary    /* bg-petrol-600 text-white */
.btn-secondary  /* bg-gold-500 text-petrol-600 */
.card           /* bg-white rounded-xl shadow-sm border */
```

---

## DATABASE (Supabase)

### Tabelle Principali
| Tabella | Righe | Descrizione |
|---------|-------|-------------|
| `profiles` | N | Profili utente (extends auth.users) |
| `characteristics` | 24 | Caratteristiche leadership |
| `assessment_questions` | 72/240 | Domande assessment |
| `exercises` | 52 | Esercizi settimanali |
| `user_exercise_progress` | N | Progresso esercizi |
| `ai_coach_conversations` | N | Storico chat AI |
| `ai_coach_user_memory` | N | Memoria personalizzazione |
| `challenge_subscribers` | N | Iscritti challenge |
| `challenge_discovery_responses` | N | Risposte quiz A/B/C |
| `book_chunks` | N | Chunks RAG con embeddings |

### RLS Attivo
Ogni utente vede solo i propri dati.

---

## SUBSCRIPTION TIERS

| Tier | Prezzo | Features |
|------|--------|----------|
| Explorer | €0 | Assessment, 5 AI msg/day, 10 esercizi |
| Leader | €149/anno | 52 esercizi, AI illimitato |
| Mentor | €490/anno | 3 percorsi, Q&A live |

---

## VARIABILI AMBIENTE (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_LEADER_ANNUAL=
STRIPE_PRICE_MENTOR_ANNUAL=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Email
RESEND_API_KEY=

# Cron
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## COMANDI UTILI

```bash
npm run dev          # Avvia dev server
npm run build        # Build produzione
npm run lint         # ESLint

# Script utility
node scripts/run-sql.js sql/file.sql
node scripts/verify_ai_coach_tables.js
```

---

## SAFETY PROTOCOLS

Se l'utente menziona suicidio/autolesionismo:

```
🚨 Non sono qualificato per gestire situazioni di crisi.
Contatta IMMEDIATAMENTE:
• EMERGENZE: 112
• Telefono Amico: 199 284 284
• Samaritans Onlus: 800 86 00 22
```

---

## DOCUMENTAZIONE DETTAGLIATA

Per documentazione completa, consulta `/docs`:

| File | Contenuto |
|------|-----------|
| `docs/PROGETTO_VITAEOLOGY_COMPLETO.md` | Documentazione master (1300+ righe) |
| `docs/DATABASE_SCHEMA.md` | Schema DB completo |
| `docs/QUICK_REFERENCE.md` | Riferimento rapido |

---

## NOTE PER CLAUDE CODE

1. **LEGGI SEMPRE** `/docs/PROGETTO_VITAEOLOGY_COMPLETO.md` prima di modifiche major
2. Usa `'use client'` per componenti interattivi
3. TypeScript strict sempre
4. Tailwind per styling, no CSS separato
5. Commenta in italiano
6. **Linguaggio validante** in tutto il codice UI/UX

---

## RIEPILOGO FUNZIONALITÀ

| Area | Status | File |
|------|--------|------|
| Assessment LITE (72 domande) | ✅ | `src/app/assessment/lite/` |
| AI Coach Fernando + RAG | ✅ | `src/lib/ai-coach/` |
| 52 Esercizi + Raccomandazioni | ✅ | `src/app/exercises/` |
| 3 Challenge (7 giorni) A/B | ✅ | `src/app/challenge/` |
| 63 Domande Discovery | ✅ | `src/lib/challenge/discovery-data.ts` |
| 21 Template Email | ✅ | `src/lib/email/` |
| Cron Email Resend | ✅ | `src/app/api/cron/` |
| 3 Landing Libri | ✅ | `src/app/libro/` |
| Dashboard completa | ✅ | `src/app/dashboard/` |
| Admin Panel (9 pagine) | ✅ | `src/app/admin/` |
| Stripe Payments | ✅ | `src/app/api/stripe/` |
| User Memory AI | ✅ | `src/lib/ai-coach/user-memory.ts` |
| Pattern Recognition | ✅ | `src/lib/ai-coach/pattern-recognition.ts` |
