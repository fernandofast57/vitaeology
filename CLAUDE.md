# CLAUDE.md - Istruzioni Complete per Claude Code
## Progetto: Vitaeology - Leadership Development Platform

**Versione:** 3.4
**Ultimo aggiornamento:** 6 Febbraio 2026
**Owner:** Fernando Marongiu

---

## CONTESTO PROGETTO

Vitaeology è una **piattaforma SaaS completa** per lo sviluppo della leadership destinata a imprenditori italiani (35-55 anni).

### Stack, Integrazioni e Variabili Ambiente

| Tecnologia | Versione | Uso | Env Var |
|------------|----------|-----|---------|
| Next.js | 14.x | App Router, SSR | - |
| TypeScript | 5.x | Tipizzazione strict | - |
| Supabase | - | PostgreSQL + Auth + RLS | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Tailwind CSS | 3.x | Styling | - |
| Stripe | - | Pagamenti subscription + one-time | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` |
| Anthropic Claude | - | AI Coach Fernando | `ANTHROPIC_API_KEY` |
| OpenAI | - | Embeddings RAG (3 libri) | `OPENAI_API_KEY` |
| Resend | - | Email automation | `RESEND_API_KEY` |
| Vercel | - | Hosting + Cron | `CRON_SECRET`, `NEXT_PUBLIC_APP_URL` |
| Microsoft Clarity | - | Session recording | ID: v4dg8tygen |

**PDF Libri (server-side only, MAI esporre):** `PDF_URL_LEADERSHIP`, `PDF_URL_RISOLUTORE`, `PDF_URL_MICROFELICITA`

---

## DATI BIOGRAFICI FERNANDO MARONGIU (OBBLIGATORIO)

**⚠️ SEMPRE verificare le età quando si scrive contenuto su Fernando!**

### Riferimento Rapido
| Dato | Valore |
|------|--------|
| **Anno di nascita** | 1957 |
| **Età attuale (2026)** | 68-69 anni |

### Calcolo Età per Anno
```
Età = Anno evento - 1957
```

### Eventi Chiave nelle Storie
| Anno | Età Fernando | Evento/Storia |
|------|--------------|---------------|
| 1973 | **16 anni** | Inizio "anni perduti" (Microfelicità) |
| 1982 | **25 anni** | Fine "anni perduti" |
| 1989 | **32 anni** | Cabina telefonica #1: chiedere permesso a manager (Leadership) |
| 1992 | **35 anni** | Covey "7 Habits" pubblicato in italiano |
| 1993 | **36 anni** | Cabina telefonica #2: tessera ristoranti "TheFork" (Ostacoli) |
| Primi 2000 | ~45 anni | Fallimento energie rinnovabili |
| 2007 | **50 anni** | Ingresso settore oro/gioielleria |
| 2024 | **67 anni** | Fondazione Vitaeology |
| 2026 | **68-69 anni** | Oggi |

### Due Episodi Cabina Telefonica (NON confondere!)
1. **1989 (Leadership)**: Parlava con un manager, chiedeva "il permesso" di essere riconosciuto come persona lungimirante. Sensazione di essere relegato a comprimario.
2. **1993 (Ostacoli)**: Progetto tessera ristoranti (precursore TheFork). Settimane a chiamare ristoranti da cabina telefonica.

### Regola
```
❌ MAI inventare età senza calcolare: Anno - 1957
✅ SEMPRE verificare: "Nel [ANNO] avevo [ANNO - 1957] anni"
```

---

## PRINCIPI FONDAMENTALI (OBBLIGATORI)

### 0. Framework dei 4 Prodotti (Fondamento)

Ogni sistema di produzione genera **4 prodotti fondamentali**, ciascuno governato da **3 fattori**:

| # | Prodotto | In Vitaeology |
|---|----------|---------------|
| **P1** | L'istituzione di ciò che produce | Piattaforma (Challenge, Assessment, Esercizi) |
| **P2** | Il prodotto generato | Trasformazione utente (risultati, consapevolezza) |
| **P3** | La riparazione di ciò che produce | Bug fix, UX improvements |
| **P4** | La correzione del prodotto generato | **AI Coach Fernando** (on-demand) |

**I 3 Fattori:** Quantità, Qualità, Viability → **12 Fattori di Produzione**

```
⚠️ NON confondere i 4 prodotti tra loro.
P4 (AI Coach) vive sulla Dashboard, disponibile ON-DEMAND.
MAI proporre P4 ai punti STOP dove l'utente deve ricevere P2.
```

---

### 0.1 Filosofia: Conoscenza → Esperienza → Consapevolezza

| Passaggio | Significato | In Vitaeology |
|-----------|-------------|---------------|
| **CONOSCENZA** | Sapere teorico | Challenge 7 giorni, libri |
| **ESPERIENZA** | Sapere applicato | Esercizi, assessment |
| **CONSAPEVOLEZZA** | Sapere integrato | Equilibrio, profondità |

```
HOMEPAGE → Landing (Leadership | Ostacoli | Microfelicità)
  → Challenge 7gg (CONOSCENZA + ESPERIENZA)
    → Assessment + Esercizi (CONSAPEVOLEZZA)
```

```
❌ MAI solo teoria senza applicazione pratica
❌ MAI esercizi senza spiegazione del "perché"
✅ SEMPRE collegare sapere → fare → essere consapevoli
```

---

### 1. Principio Validante: AVERE vs ESSERE/FARE (ESSENZIALE)

**AVERE/NON AVERE implicano LIBERTÀ di scelta.**
ESSERE/FARE mettono il soggetto alla mercé del giudizio.

```
✅ "Hai già...", "Possiedi...", "Puoi scegliere di..."
❌ "Ti manca...", "Non hai...", "Sei/Non sei...", "Fai/Non fai..."
```

| ❌ Sbagliato | ✅ Corretto |
|-------------|-------------|
| "Non sei un vero leader" | "Hai capacità di leadership — puoi scegliere come usarle" |
| "Ti manca la visione" | "Hai una visione — puoi ampliarla se vuoi" |
| "Devi migliorare" | "Hai risorse che puoi attivare" |

**L'utente POSSIEDE GIÀ tutte le capacità. Ha la LIBERTÀ di riconoscerle.**

---

### 2. User Agency e Regole Copy

L'utente è **AGENTE attivo**, non paziente passivo. Mai prescrizioni dirette.

> **Riferimento completo:** `docs/REGOLA_COPY_AUTODETERMINAZIONE.md`, `docs/STILE_VITAEOLOGY.md`

| ❌ Proibito | ✅ Alternativa |
|-------------|----------------|
| "per caso" | "reagendo senza direzione" |
| "Ti manca un pezzo" | "C'è un pezzo che potresti non aver ancora riconosciuto" |
| "Devi sviluppare X" | "Puoi scegliere di espandere X" |

**Checklist Copy:**
```
□ Evitato "per caso" e derivati?
□ Validato lo stato dell'utente (non diagnosticato)?
□ Usato linguaggio AVERE (non ESSERE/FARE)?
□ Riconosciuto capacità esistenti?
□ Evitato valutazioni ("Bravo!", "Complimenti!")?
```

---

### 2.1 Scala di Consapevolezza Vitaeology (55 livelli)

> **Implementazione:** `src/lib/awareness/types.ts`

La scala va da **-34 (Inesistenza)** a **+21 (Sorgente)**. **Non esiste livello 0.**

#### SOTTO NECESSITÀ DI CAMBIARE (-34 → -7)

| Livello | Nome | Livello | Nome |
|---------|------|---------|------|
| -34 | Inesistenza | -20 | Dualità |
| -33 | Disconnessione | -19 | Distacco |
| -32 | Non causatività | -18 | Oblio |
| -31 | Criminalità | -17 | Catatonia |
| -30 | Dissociazione | -16 | Shock |
| -29 | Dispersione | -15 | Isteria |
| -28 | Erosione | -14 | Illusione Ingannevole |
| -27 | Fissità | -13 | Irrealtà |
| -26 | Glee | -12 | Disastro |
| -25 | Esaltazione | -11 | Introversione |
| -24 | Masochismo | -10 | Intontimento |
| -23 | Sadismo | -9 | Sofferenza |
| -22 | Allucinazione | -8 | Disperazione |
| -21 | Segretezza | **-7** | **ROVINA** ← Entry Point |

#### TRANSIZIONE: Challenge 7 Giorni (-6 → -1)

| Livello | Nome | Giorno Challenge |
|---------|------|------------------|
| -6 | Effetto | Giorno 1-2 |
| -5 | Paura di Peggiorare | Giorno 3-4 |
| -4 | Necessità di Cambiare | Giorno 5-6 |
| -3 | Richiesta | — |
| -2 | Speranza | — |
| **-1** | **Aiuto** | **Giorno 7** ← Target |

#### PERCORSO VITAEOLOGY (1 → 21)

| Livello | Nome | Livello | Nome |
|---------|------|---------|------|
| 1 | Riconoscimento | 12 | Produzione |
| 2 | Comunicazione | 13 | Risultato |
| 3 | Percezione | 14 | Correzione |
| 4 | Orientamento | 15 | Capacità |
| 5 | Comprensioni | 16 | Scopi |
| 6 | Illuminazione | 17 | Clearing |
| 7 | Energia | 18 | Realizzazione |
| 8 | Aggiustamento | 19 | Condizioni |
| 9 | Corpo | 20 | Esistenza |
| 10 | Predizione | **21** | **Sorgente** |
| 11 | Attività | | |

#### Zone Vitaeology

| Zona | Livelli | Fase |
|------|---------|------|
| Sotto Necessità | -34 → -7 | Entry Point (ADS/Challenge) |
| Transizione | -6 → -1 | Challenge 7 Giorni |
| Riconoscimento | 1 → 6 | Assessment + Primi Esercizi |
| Trasformazione | 7 → 14 | Esercizi Avanzati |
| Padronanza | 15 → 21 | Mentor/Mastermind |

---

### 3. AI Coach = FERNANDO (mai Marco)
```
✅ "Sono Fernando, il tuo AI Coach"
❌ "Sono Marco" (ERRORE CRITICO)
```

### 4. Principio STOP → START (Customer Journey)

```
Ogni STOP deve avere UNA CTA chiara che motiva al SÌ verso il prossimo START.
NO opzioni multiple che creano incertezza decisionale.
```

| Contesto | AI Coach | Motivo |
|----------|----------|--------|
| **Dashboard** | ✅ SÌ | Hub neutro, l'utente sceglie |
| **Assessment/Challenge/Exercise Complete** | ❌ NO | CTA chiara verso prossimo step |
| **Email transazionali** | ❌ NO | CTA diretta all'azione |

---

### 5. Framework Verifica Comprensione (FORMAZIONE)

#### Le 3 Barriere alla Comprensione

| Barriera | Come Prevenire |
|----------|----------------|
| **Parola mal compresa** | Spiegare OGNI termine non comune |
| **Mancanza di concretezza** | SEMPRE esempi dalla vita reale |
| **Gradiente saltato** | Progressione graduale |

#### I 3 Livelli di Comprensione

| Livello | Cosa | Domanda Verifica |
|---------|------|------------------|
| **DATI STABILI** | Il "COSA" | "Cos'è [X]?" |
| **DOINGNESS** | Il "COME" | "Come si fa [X]?" |
| **TEORIA** | Il "PERCHÉ" | "Perché funziona [X]?" |

---

### 6. Struttura Esercizio Vincolante (OBBLIGATORIA)

> **⚠️ REGOLA INDEROGABILE:** Ogni esercizio DEVE seguire questa struttura.

```typescript
interface ExerciseComplete {
  // IDENTIFICAZIONE
  id: string;
  week_number: number;              // 1-52
  title: string;
  subtitle: string;
  characteristic_slug: string;

  // CATEGORIZZAZIONE
  pillar: 'Vision' | 'Action' | 'Relations' | 'Adaptation';
  exercise_type: 'riconoscimento' | 'espansione' | 'sfida' | 'integrazione';
  difficulty_level: 'base' | 'intermedio' | 'avanzato';
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  estimated_time_minutes: number;

  // PREVENZIONE 3 BARRIERE
  glossary: { term: string; definition: string; example: string; }[];
  concrete_examples: { situation: string; application: string; }[];
  prerequisites: string[];

  // LIVELLO 1: DATI STABILI (COSA)
  key_concepts: { concept: string; definition: string; why_important: string; }[];

  // LIVELLO 2: DOINGNESS (COME)
  intro_validante: string;
  phase_1_recognition: { title: string; being_focus: string; prompt: string; instructions: string[]; };
  phase_2_pattern: { title: string; doing_focus: string; prompt: string; guiding_questions: string[]; };
  phase_3_expansion: { title: string; having_focus: string; prompt: string; action_steps: string[]; };
  deliverable: string;

  // LIVELLO 3: TEORIA (PERCHÉ)
  why_it_works: { principle: string; explanation: string; scientific_basis?: string; };

  // VERIFICA + SUPPORTO
  reflection_prompts: { level: 'dati_stabili' | 'doingness' | 'teoria'; question: string; }[];
  failure_response: string;
  ai_coach_hints: string[];
}
```

#### Validazione Obbligatoria

```
✅ PREVENZIONE BARRIERE
□ Glossary con definizione + esempio?
□ Almeno 2 concrete_examples?
□ Prerequisites chiari?

✅ 3 LIVELLI
□ Key concepts con why_important?
□ Phase 1-2-3 complete con instructions/steps concreti?
□ Why it works con principle + explanation?

✅ LINGUAGGIO VALIDANTE
□ Intro presume capacità esistente (mai deficit)?
□ Failure response validante (non giudicante)?
```

---

## STRUTTURA PROGETTO

### Pagine Principali (65+)

| Area | Pagine | Path |
|------|--------|------|
| Auth | 4 | `/auth/login`, `/signup`, `/forgot-password`, `/reset-password` |
| Dashboard | 1 | `/dashboard` |
| Assessment | 6 | `/assessment/{leadership,risolutore,microfelicita}/[results]` |
| Exercises | 2 | `/exercises`, `/exercises/[id]` |
| Challenge | 6 | `/challenge/{leadership,ostacoli,microfelicita}`, `/[type]/day/[N]`, `/[type]/grazie` |
| Libro | 6 | `/libro/{leadership,risolutore,microfelicita,trilogia}/[grazie]` |
| Admin | 18 | `/admin/*` (users, analytics, ai-coach, beta-testing, etc.) |
| Beta | 1 | `/beta` |
| Affiliate | 8 | `/affiliate/*` (dashboard, links, payouts, leaderboard, etc.) |
| Altri | 8 | `/profile`, `/progress`, `/results`, `/pricing`, `/subscription`, `/contact`, `/terms`, `/privacy` |

### API Endpoints (95+)

| Area | Endpoints | Base Path |
|------|-----------|-----------|
| AI Coach | 10 | `/api/ai-coach/*` |
| Assessment | 5 | `/api/assessment/*` |
| Stripe | 3 | `/api/stripe/*` |
| Challenge | 3 | `/api/challenge/*` |
| Libro | 2 | `/api/libro/*` |
| Cron | 4 | `/api/cron/*` |
| Admin | 3+ | `/api/admin/*` |

### Librerie Chiave (src/lib/)

| Cartella | Contenuto |
|----------|-----------|
| `ai-coach/` | types, system-prompt, user-memory, pattern-recognition |
| `supabase/` | client, server, middleware |
| `challenge/` | day-content, discovery-data |
| `email/` | challenge-day-templates |
| `libro/` | download-token (JWT), watermark-pdf (pdf-lib) |
| `awareness/` | types (scala 55 livelli) |

---

## I 3 LIBRI / PERCORSI

| Libro | Slug | Colore | Prezzo |
|-------|------|--------|--------|
| Leadership Autentica | `leadership` | Oro #D4AF37 | €9.90 |
| Oltre gli Ostacoli | `risolutore` | Verde #10B981 | €9.90 |
| Microfelicità Digitale | `microfelicita` | Viola #8B5CF6 | €9.90 |
| **Trilogia Bundle** | `trilogia` | Multi | €24.90 |

### Protezione PDF

- **Signed URL (JWT 24h)** via `src/lib/libro/download-token.ts`
- **Watermark personalizzato** (nome+email) via `src/lib/libro/watermark-pdf.ts`
- **Rate limit:** Max 20 download per libro per utente
- **Endpoint:** `/api/libro/download?token=<JWT>` o `?book=<slug>` (auth mode)

---

## I 4 PILASTRI (24 Caratteristiche)

| Pilastro | Nome IT | Colore | Caratteristiche |
|----------|---------|--------|-----------------|
| ESSERE | Visione | #3B82F6 (blu) | 6 |
| SENTIRE | Relazioni | #10B981 (verde) | 6 |
| PENSARE | Adattamento | #8B5CF6 (viola) | 6 |
| AGIRE | Azione | #F59E0B (arancione) | 6 |

---

## PATH/SLUG NAMING CONVENTIONS (OBBLIGATORIO)

> **⚠️ FONTE UNICA DI VERITÀ:** `src/lib/path-mappings.ts`

| Percorso | Frontend URL | Database | Challenge DB | RAG Legacy |
|----------|--------------|----------|--------------|------------|
| Leadership Autentica | `leadership` | `leadership` | `leadership-autentica` | `leadership` |
| Oltre gli Ostacoli | `ostacoli` | `risolutore` | `oltre-ostacoli` | `problemi` |
| Microfelicità | `microfelicita` | `microfelicita` | `microfelicita` | `benessere` |

```typescript
// ✅ CORRETTO
import { FRONTEND_TO_DATABASE, toFrontendSlug } from '@/lib/path-mappings';

// ❌ SBAGLIATO
const map = { ostacoli: 'risolutore' };  // MAI mappature locali!
```

---

## REGOLE TECNICHE CHALLENGE (CONTRATTO)

> **Principio guida:** L'utente è AGENTE ATTIVO. La progressione dipende dalle SUE azioni.

### 1. Semantica `current_day` (FONTE DI VERITÀ UNICA)

| Valore | Significato |
|--------|-------------|
| `0` | Iscritto, nessun giorno completato |
| `N` | Day N completato |
| `7` | Challenge completata |

```
⚠️ current_day = ULTIMO GIORNO COMPLETATO dall'utente
NON "prossimo da fare", NON "ultimo email inviato"
```

### 2. Tabelle Database

| Tabella | Fonte di verità per |
|---------|---------------------|
| `challenge_subscribers` | Stato iscrizione, `current_day`, status |
| `challenge_day_completions` | Timestamp completamento |
| `challenge_discovery_responses` | Risposte discovery |

### 3. Logica Sblocco Giorni

```typescript
const isUnlocked = (dayNumber: number, currentDay: number, isSubscribed: boolean) => {
  if (!isSubscribed) return false;
  if (dayNumber === 1) return true;
  return dayNumber <= currentDay + 1;
};
```

| `current_day` | Day 1 | Day 2 | Day 3 | Day 4-7 |
|---------------|-------|-------|-------|---------|
| 0 | 🔓 | 🔒 | 🔒 | 🔒 |
| 1 | ✅ | 🔓 | 🔒 | 🔒 |
| 2 | ✅ | ✅ | 🔓 | 🔒 |

### 4. API Contracts

#### POST `/api/challenge/subscribe`
```typescript
// INPUT: { email, nome, challenge, variant }
// AZIONI:
// 1. Crea record con current_day: 0, status: 'active'
// 2. Invia welcome email
// OUTPUT: { success: true, subscriberId }
```

#### POST `/api/challenge/complete-day`
```typescript
// INPUT: { email, challengeType, dayNumber, responses }
// VALIDAZIONI: iscritto + giorno sbloccato + non già completato
// AZIONI:
// 1. Salva in challenge_day_completions
// 2. Aggiorna current_day: dayNumber (NON dayNumber+1!)
// 3. Se day 7: status: 'completed'
// OUTPUT: { success: true, nextDay, isCompleted }
```

#### Cron `/api/cron/send-challenge-emails`
```typescript
// Il cron invia email del giorno SUCCESSIVO solo DOPO che l'utente
// ha completato il giorno corrente. L'utente controlla la progressione.
```

### 5. Autenticazione e Accesso

| Pagina | Auth | Iscrizione |
|--------|------|------------|
| `/challenge/[type]` (landing) | ❌ | ❌ |
| `/challenge/[type]/day/[N]` | ✅ | ✅ |
| `/challenge/[type]/grazie` | ✅ | ✅ |

### 6. Checklist Implementazione

```
□ current_day interpretato come "ultimo completato"?
□ Subscribe setta current_day: 0?
□ Complete-day setta current_day: dayNumber?
□ Day page verifica iscrizione PRIMA di mostrare contenuto?
□ Cron rispetta user agency?
```

---

## SISTEMA ASSESSMENT

| Assessment | Domande | Dimensioni |
|------------|---------|------------|
| **Leadership** | 72 | 24 caratteristiche (4 pilastri) |
| **Risolutore** | 48 | 3 Filtri (Pattern, Segnali, Risorse) |
| **Microfelicità** | 47 | 5 fasi R.A.D.A.R. |

- **Scala 1-5:** Quasi mai → Costantemente
- **Tabelle:** `assessment_questions_v2`, `user_assessments_v2`, `user_answers_v2`, `characteristic_scores`

---

## SISTEMA AI COACH FERNANDO

> **Documento completo:** `docs/AI_COACH_SYSTEM.md`

```
ChatWidget → /api/ai-coach → Claude API → RAG (book_chunks) + User Memory
```

### System Prompt (Estratto)
```
Sei Fernando Marongiu. Le persone hanno già dentro di sé le capacità di leadership.
Non devono "acquisirle" - devono RICONOSCERLE e ESPANDERLE.
```

### Esercizi nel Database (126 totali)

| Percorso | Fondamentali | Applicazione | Mentor | Totale |
|----------|--------------|--------------|--------|--------|
| Leadership | 4 | 52 | 8 | 64 |
| Risolutore | 4 | 24 | 3 | 31 |
| Microfelicità | 4 | 24 | 3 | 31 |

```
⚠️ NON esiste percorso sequenziale. AI Fernando PROPONE l'esercizio
giusto per quella persona in quel momento, basandosi sull'assessment.
```

---

## DESIGN SYSTEM

```css
/* Colori Primari */
--petrol-600: #0A2540;     /* Blu Petrolio - Primary */
--gold-500: #F4B942;       /* Oro - Accent */

/* Pilastri */
--pillar-being: #3B82F6;   /* Blu - Visione */
--pillar-feeling: #10B981; /* Verde - Relazioni */
--pillar-thinking: #8B5CF6;/* Viola - Adattamento */
--pillar-acting: #F59E0B;  /* Arancione - Azione */
```

**Typography:** Stoke (headings), Inter (body)

---

## DATABASE (Supabase)

### Tabelle Principali

| Tabella | Descrizione |
|---------|-------------|
| `profiles` | Profili utente (extends auth.users) |
| `characteristics` | 24 caratteristiche leadership |
| `exercises` | 52 esercizi settimanali |
| `ai_coach_conversations` | Storico chat AI |
| `challenge_subscribers` | Iscritti challenge |
| `book_chunks` | Chunks RAG con embeddings |
| `user_books` | Libri acquistati + download count |
| `beta_testers` | Candidature beta tester |

**RLS attivo:** Ogni utente vede solo i propri dati.

---

## VALUE LADDER (8 Livelli)

| Livello | Nome | Prezzo | Status |
|---------|------|--------|--------|
| L1 | Lead Magnet (Challenge) | €0 | ✅ Produzione |
| L2 | Libro singolo / Trilogia | €9.90 / €24.90 | ✅ Produzione |
| L3 | Core (Leader) | €149/anno | ✅ Produzione |
| L4 | Premium (Mentor) | €490/anno | ✅ Produzione |
| L5 | Coaching 1:1 | €997-1.997 | 🔸 Fase 2 |
| L6 | Mastermind | €2.997/anno | 🔸 Fase 2 |
| L7 | Consulente (Tecnico/Commerciale) | €2.997 / €1.497 | 🔸 Fase 2 |
| L8 | Partner Elite | €9.997/anno | 🔸 Fase 2 |

> **Stub Fase 2:** Codice commentato in `src/config/pricing.ts` (linee 177-237)

### TODO Fase 2 (L5-L8)

| Livello | Requisiti Principali |
|---------|---------------------|
| L5 | Creare Stripe product, landing /coaching-1-1, booking system |
| L6 | Stripe subscription, email template, /subscription page |
| L7 | 2 varianti Stripe, landing /diventa-consulente, dashboard commissioni |
| L8 | Stripe subscription, esclusività territoriale, contratto franchising |

### Sistema Affiliati ✅

Tutte le 8 pagine `/affiliate/*` implementate con resources-data.ts e training-content.ts.

---

## KPI TARGET

| Passaggio | Target |
|-----------|--------|
| Ads → Landing (CTR) | >1.5% |
| Landing → Lead | >25% |
| Lead → Libro | >5% |
| Free → Core | 20-25% |
| Core → Premium | 15% |
| Core → Referral attivo | 10% |
| Churn annuale | <30% |
| LTV/CAC | >5x |

---

## LANDING PAGE - STRUTTURA STANDARD

### Above the fold
- Video Hero (autoplay muted)
- Headline = Hook ADS (**message match**)
- Form (SOLO email + nome opzionale)
- CTA: Oro (#F4B942) su Blu (#0A2540)

### Headlines Approvate
- **Leadership:** "Il leader che cerchi è già dentro di te"
- **Ostacoli:** "I tuoi ostacoli nascondono la tua prossima svolta"
- **Microfelicità:** "La felicità che cerchi è già nella tua giornata"

---

## COMANDI UTILI

```bash
npm run dev          # Avvia dev server
npm run build        # Build produzione
npm run lint         # ESLint
node scripts/security-audit.js  # ⚠️ PRIMA DI OGNI DEPLOY
```

---

## SAFETY PROTOCOLS

```
🚨 Se l'utente menziona suicidio/autolesionismo:
Non sono qualificato per gestire situazioni di crisi.
Contatta IMMEDIATAMENTE:
• EMERGENZE: 112
• Telefono Amico: 199 284 284
• Samaritans Onlus: 800 86 00 22
```

---

## SICUREZZA DATABASE (OBBLIGATORIO)

> **⚠️ La sicurezza deve essere BY DESIGN, non BY FIX.**

### Regole Inderogabili

```
❌ MAI creare views senza SECURITY INVOKER
❌ MAI creare tabelle senza RLS + policies
❌ MAI esporre auth.users in views/funzioni public
❌ MAI usare SECURITY DEFINER senza necessità documentata
```

### Template VIEW
```sql
-- ✅ CORRETTO
CREATE VIEW public.my_view
WITH (security_invoker = on) AS
SELECT ...;
```

### Template TABELLA
```sql
CREATE TABLE public.my_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own data" ON public.my_table
  FOR ALL USING (auth.uid() = user_id);
```

### Template SERVICE ROLE
```sql
CREATE POLICY "Service role full access" ON public.my_system_table
  FOR ALL USING (auth.role() = 'service_role');
```

### Checklist Pre-Deploy

```
□ Eseguito scripts/security-audit.js?
□ Nuove views con security_invoker = on?
□ Nuove tabelle con RLS + policies?
□ Nessuna view espone auth.users?
```

---

## PROTOCOLLO MANUTENZIONE

### Inizio Sessione
```bash
curl -s "https://www.vitaeology.com/api/cron/monitoring" \
  -H "Authorization: Bearer $CRON_SECRET"
```
Verifica: `success: true`, `isAnomaly: false`

### Durante Modifiche
```bash
npm run lint && npm run build  # DEVONO passare
```

### Calendario Manutenzione

| Frequenza | Attività |
|-----------|----------|
| **Pre-deploy** | `npm run lint && npm run build` + security-audit.js |
| **Lunedì** | Review errori Vercel |
| **1° del mese** | Pulizia log, `npm audit`, aggiorna dipendenze |
| **Trimestrale** | Audit completo architettura |

### Cron Jobs

| Endpoint | Schedule | Descrizione |
|----------|----------|-------------|
| `/api/cron/monitoring` | `*/15 * * * *` | Health check |
| `/api/cron/challenge-emails` | `0 8 * * *` | Email challenge |
| `/api/cron/affiliate-emails` | `0 9 * * *` | Email affiliati |
| `/api/ai-coach/cron/combined` | `0 23 * * *` | Metriche AI |

**⚠️** I cron usano `CRON_SECRET`. Route `/api/cron/*` pubbliche nel middleware.

### Pattern Spam Challenge

Email spam: **punti random** nel nome (es. `s.hi.nz.y@gmail.com`)
```javascript
// Detect: più di 3 punti + meno di 15 lettere
const dots = (local.match(/\./g) || []).length;
const letters = local.replace(/[^a-zA-Z]/g, '').length;
return dots > 3 && letters < 15;
```

---

## DOCUMENTAZIONE

### Documenti Autoritativi

| File | Autorità su |
|------|-------------|
| `docs/ARCHITETTURA_DASHBOARD_VITAEOLOGY_DEFINITIVA.md` | Tier, flussi, dashboard, certificazione |
| `docs/AI_COACH_SYSTEM.md` | AI Coach, compliance, 126 esercizi |
| `docs/CUSTOMER_JOURNEY_VITAEOLOGY_COMPLETO.pdf` | Customer Journey, Value Ladder |

### Riferimento

| File | Contenuto |
|------|-----------|
| `docs/PROGETTO_VITAEOLOGY_COMPLETO.md` | Documentazione tecnica master |
| `docs/DATABASE_SCHEMA.md` | Schema DB completo |
| `docs/ESERCIZI_STRUTTURA_COMPLETA.md` | Struttura 126 esercizi |

---

## NOTE PER CLAUDE CODE

1. **LEGGI** `docs/ARCHITETTURA_DASHBOARD_VITAEOLOGY_DEFINITIVA.md` per logiche di business
2. **IN CASO DI CONFLITTO** tra documenti, ARCHITETTURA_DASHBOARD prevale
3. Usa `'use client'` per componenti interattivi
4. TypeScript strict sempre
5. Tailwind per styling, no CSS separato
6. Commenta in italiano
7. **Linguaggio validante** in tutto il codice UI/UX

---

## RIEPILOGO FUNZIONALITÀ

| Area | Status |
|------|--------|
| 3 Assessment | ✅ |
| AI Coach Fernando + RAG | ✅ |
| 126 Esercizi | ✅ |
| 3 Challenge (7 giorni) A/B | ✅ |
| 63 Domande Discovery | ✅ |
| 21 Template Email | ✅ |
| 3 Landing Libri + Trilogia | ✅ |
| PDF Protection (JWT + Watermark) | ✅ |
| Sistema Affiliati (8 pagine) | ✅ |
| Beta Testing System | ✅ |
| Admin Panel (18 pagine) | ✅ |
| Stripe Payments | ✅ |
| Microsoft Clarity | ✅ |
