# Vitaeology - Struttura Applicazione

> Ultimo aggiornamento: 12/01/2026

## Indice

- [Pagine Frontend](#pagine-frontend)
- [API Endpoints](#api-endpoints)
- [Componenti](#componenti)
- [Librerie](#librerie)
- [Flussi Principali](#flussi-principali)

---

## Pagine Frontend

| Route | Tipo | Auth | Descrizione |
|-------|------|------|-------------|
| `/` | Server | 🌐 | Homepage principale con presentazione Vitaeology |
| `/admin` | Server | 🔒 | Dashboard amministrazione principale |
| `/admin/ab-testing` | Client | 🔒 | Gestione test A/B varianti landing |
| `/admin/ai-coach` | Client | 🔒 | Monitoraggio e statistiche AI Coach |
| `/admin/analytics` | Client | 🔒 | Analytics generali piattaforma |
| `/admin/api-costs` | Client | 🔒 | Monitoraggio costi API Claude/OpenAI |
| `/admin/behavioral` | Client | 🔒 | Dashboard tracking comportamentale |
| `/admin/challenges` | Client | 🔒 | Gestione challenge 7 giorni |
| `/admin/corrections` | Client | 🔒 | Gestione correzioni AI Coach |
| `/admin/feedback-patterns` | Client | 🔒 | Pattern feedback utenti |
| `/admin/funnel` | Client | 🔒 |  |
| `/admin/performance` | Client | 🔒 | Metriche performance sistema |
| `/admin/quality-audit` | Client | 🔒 | Audit qualità risposte AI (7 score: 4 principi + 3 comprensione) |
| `/admin/users` | Client | 🔒 | Gestione utenti e ruoli |
| `/assessment/lite` | Client | 🌐 | Assessment Leadership 72 domande |
| `/assessment/lite/results` | Client | 🌐 | Risultati assessment Leadership |
| `/assessment/microfelicita` | Client | 🌐 | Assessment Microfelicità 47 domande |
| `/assessment/microfelicita/results` | Client | 🌐 | Risultati assessment Microfelicità |
| `/assessment/risolutore` | Client | 🌐 | Assessment Risolutore 47 domande |
| `/assessment/risolutore/results` | Client | 🌐 | Risultati assessment Risolutore |
| `/auth/forgot-password` | Client | 🌐 | Recupero password dimenticata |
| `/auth/login` | Client | 🌐 | Login utenti |
| `/auth/reset-password` | Client | 🌐 | Reset password con token |
| `/auth/signup` | Client | 🌐 | Registrazione nuovi utenti |
| `/challenge/[type]/complete` | Client | 🔒 | Pagina completamento challenge |
| `/challenge/[type]/day/[day]` | Client | 🔒 | Contenuto giornaliero challenge |
| `/challenge/leadership` | Client | 🌐 | Landing challenge Leadership 7 giorni |
| `/challenge/microfelicita` | Client | 🌐 | Landing challenge Microfelicità 7 giorni |
| `/challenge/ostacoli` | Client | 🌐 | Landing challenge Ostacoli 7 giorni |
| `/contact` | Client | 🌐 | Pagina contatti |
| `/dashboard` | Client | 🔒 | Dashboard utente principale |
| `/exercises` | Server | 🔒 | Lista esercizi disponibili |
| `/exercises/[exerciseId]` | Server | 🔒 | Dettaglio singolo esercizio |
| `/libro/[slug]` | Server | 🌐 | Landing page acquisto libro |
| `/libro/[slug]/grazie` | Server | 🌐 | Thank you page post-acquisto |
| `/pricing` | Server | 🌐 | Pagina prezzi e piani |
| `/privacy` | Server | 🌐 | Privacy policy |
| `/profile` | Client | 🔒 | Profilo utente |
| `/progress` | Client | 🔒 | Progresso percorso utente |
| `/results` | Client | 🔒 | Risultati assessment utente |
| `/subscription` | Client | 🔒 | Gestione abbonamento |
| `/terms` | Server | 🌐 | Termini e condizioni |
| `/test` | Client | 🔒 | Pagina test sviluppo |

### Legenda
- 🔒 Richiede autenticazione
- 🌐 Pubblica
- Client = Rendering lato client
- Server = Rendering lato server

---

## API Endpoints

### /api/admin

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/admin/ai-coach/dashboard` | GET | Stats dashboard AI Coach |
| `/api/admin/ai-coach/patterns` | POST | Gestione pattern riconosciuti |
| `/api/admin/ai-coach/reports` | POST | Generazione report AI Coach |
| `/api/admin/analytics` | GET | Dati analytics aggregati |
| `/api/admin/api-costs` | GET | Costi API per periodo |
| `/api/admin/behavioral-analytics` | GET | Analytics comportamentali dettagliati |
| `/api/admin/behavioral-stats` | GET | Statistiche behavioral aggregate |
| `/api/admin/corrections` | GET, POST, DELETE, PATCH | CRUD correzioni risposte |
| `/api/admin/feedback-patterns` | GET, PATCH | Pattern feedback utenti |
| `/api/admin/funnel-analysis` | GET |  |
| `/api/admin/performance` | GET | Metriche performance |
| `/api/admin/quality-audit` | GET, POST | Audit qualità risposte (7 score + analisi automatica) |
| `/api/admin/users` | GET | Lista utenti |
| `/api/admin/users/[userId]/role` | PUT, DELETE | Modifica ruolo utente |

### /api/ai-coach

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/ai-coach` | POST | Endpoint principale chat AI Coach |
| `/api/ai-coach/conversations` | GET, DELETE | Gestione conversazioni |
| `/api/ai-coach/cron/combined` | GET | Cron job combinato |
| `/api/ai-coach/cron/daily-metrics` | GET, POST | Metriche giornaliere |
| `/api/ai-coach/cron/weekly-report` | GET, POST | Report settimanale |
| `/api/ai-coach/edit` | POST | Modifica messaggio AI |
| `/api/ai-coach/export` | GET | Export conversazioni |
| `/api/ai-coach/feedback` | POST | Feedback su risposte AI |
| `/api/ai-coach/history` | GET | Storico conversazioni |
| `/api/ai-coach/reformulate` | POST | Riformulazione risposta |
| `/api/ai-coach/signals` | POST | Segnali impliciti utente |

### /api/analytics

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/analytics/behavioral` | POST | Raccolta eventi behavioral |

### /api/assessment

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/assessment/answer` | POST | Salva risposta assessment |
| `/api/assessment/complete` | POST | Completa assessment |
| `/api/assessment/microfelicita/answer` | POST | Risposta Microfelicità |
| `/api/assessment/microfelicita/complete` | POST | Completa Microfelicità |
| `/api/assessment/microfelicita/questions` | GET | Domande Microfelicità |
| `/api/assessment/microfelicita/results/[id]` | GET | Risultati Microfelicità |
| `/api/assessment/microfelicita/session` | POST | Sessione Microfelicità |
| `/api/assessment/questions` | GET | Domande Leadership |
| `/api/assessment/results/[id]` | GET | Risultati Leadership |
| `/api/assessment/risolutore/answer` | POST | Risposta Risolutore |
| `/api/assessment/risolutore/complete` | POST | Completa Risolutore |
| `/api/assessment/risolutore/questions` | GET | Domande Risolutore |
| `/api/assessment/risolutore/results/[id]` | GET | Risultati Risolutore |
| `/api/assessment/risolutore/session` | POST | Sessione Risolutore |
| `/api/assessment/session` | GET, DELETE | Gestione sessione assessment |

### /api/callback

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/auth/callback` | GET | Callback OAuth Supabase |

### /api/challenge

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/challenge/check-unlock` | GET, POST | Verifica sblocco giorno |
| `/api/challenge/complete-day` | POST | Completa giorno challenge |
| `/api/challenge/feedback` | GET, POST |  |
| `/api/challenge/subscribe` | POST | Iscrizione challenge |
| `/og/challenge/[type]` | GET | Generazione immagine OG |

### /api/coach

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/coach/feedback` | GET, POST | Feedback coach |

### /api/cron

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/cron/challenge-emails` | GET, POST | Invio email challenge |
| `/api/cron/send-challenge-emails` | GET | Trigger email challenge |

### /api/exercises

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/exercises/recommendations` | GET |  |
| `/api/exercises/recommended` | GET |  |

### /api/libro

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/libro/checkout` | POST | Checkout acquisto libro |

### /api/recommendations

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/recommendations` | GET, POST | Raccomandazioni esercizi |

### /api/signout

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/auth/signout` | POST | Logout utente |

### /api/stripe

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/stripe/checkout` | POST | Checkout Stripe |
| `/api/stripe/portal` | POST | Portal gestione Stripe |
| `/api/stripe/webhook` | POST | Webhook Stripe |

### /api/test-post

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/test-post` | GET, POST | Endpoint test |

---

## Componenti

### admin

- `TwelveFactorsGrid`

### ai-coach

- `ChatWidget`
- `ConversationHistory`
- `ExportButton`

### assessment

- `MicrofelicitaQuestionCard`
- `ProgressBar`
- `QuestionCard`
- `ResultsRadar`
- `RisolutoreQuestionCard`

### behavioral

- `EngagementBadge`
- `ExitIntentPopup`
- `index`
- `ReturnVisitorBanner`

### challenge

- `DiscoveryConfirmation`

### charts

- `LeadershipRadarChart`

### dashboard

- `AssessmentCard`
- `AssessmentsOverview`
- `ExercisesCard`
- `index`
- `MiniRadarPreview`
- `QuickStats`
- `RecentActivity`
- `RecommendedExercises`
- `TrialBanner`
- `WelcomeHero`

### exercises

- `ExerciseDetail`
- `ExercisesHeader`
- `ExercisesList`
- `LockedExerciseView`

### layout

- `DashboardHeader`
- `Sidebar`

### ui

- `Breadcrumb`

---

## Librerie

### admin

- `verify-admin`

### ai-coach

- `daily-metrics`
- `email-report`
- `implicit-signals`
- `pattern-autocorrection`
- `pattern-recognition`
- `system-prompt`
- `types`
- `user-memory`
- `weekly-report`

### analytics

- `behavioral`

### assessment-access.ts

- `assessment-access`

### assessment-scoring.ts

- `assessment-scoring`

### auth

- `authorization`
- `feature-gates`
- `permissions`

### challenge

- `day-content`
- `discovery-data`

### email

- `challenge-day-templates`
- `challenge-emails`
- `send-book-email`

### microfelicita-scoring.ts

- `microfelicita-scoring`

### rag.ts

- `rag`

### risolutore-scoring.ts

- `risolutore-scoring`

### services

- `concretezza-check` - Analisi CONCRETEZZA (esempi, metafore, scenari)
- `correction-suggestion`
- `exercise-recommendation`
- `graduality-check` - Analisi GRADUALITÀ (sequenza logica)
- `parole-check` - Analisi PAROLE (termini tecnici, acronimi, anglicismi)
- `pattern-detection`

### stripe

- `process-pending-purchases`

### supabase

- `assessment`
- `client`
- `exercises`
- `microfelicita`
- `middleware`
- `risolutore`
- `server`

### types

- `exercises`
- `roles`

### utils

- `index`

---

## Flussi Principali

### 1. Challenge 7 Giorni

```
/challenge/[type]        → Landing page con form iscrizione
    ↓ POST /api/challenge/subscribe
    ↓ Welcome email (Resend)
    ↓
/challenge/[type]/day/[1-7]  → Contenuto giornaliero
    ↓ POST /api/challenge/complete-day
    ↓ Email giorno successivo
    ↓
/challenge/[type]/complete   → Pagina completamento
    ↓ Accesso assessment sbloccato
```

### 2. Assessment

```
/assessment/lite              → Assessment Leadership (72 domande)
/assessment/risolutore        → Assessment Risolutore (47 domande)
/assessment/microfelicita     → Assessment Microfelicità (47 domande)
    ↓ POST /api/assessment/[type]/session
    ↓ POST /api/assessment/[type]/answer (per ogni risposta)
    ↓ POST /api/assessment/[type]/complete
    ↓
/assessment/[type]/results    → Risultati con radar chart
```

### 3. AI Coach

```
/dashboard                    → Widget chat AI Coach
    ↓ POST /api/ai-coach      → Claude API + RAG
    ↓ Analisi COMPRENSIONE automatica (3 check)
    ↓ Memoria conversazione salvata
```

### 3.1 Principio Comprensione - 3 Difficoltà

L'AI Coach analizza automaticamente ogni risposta per 3 aspetti:

| Difficoltà | Check | Score | Cosa Misura |
|------------|-------|-------|-------------|
| **PAROLE** | `parole-check.ts` | 0-100 | Termini tecnici spiegati, acronimi espansi, anglicismi evitati |
| **CONCRETEZZA** | `concretezza-check.ts` | 0-100 | Esempi concreti, metafore, scenari dalla vita reale |
| **GRADUALITÀ** | `graduality-check.ts` | 0-100 | Sequenza logica, concetti introdotti prima di usarli |

```
Risposta AI Coach
    ↓ checkParole()       → parole_score
    ↓ checkConcretezza()  → concretezza_score
    ↓ checkGraduality()   → graduality_score
    ↓ Salvataggio in ai_coach_conversations
    ↓
/admin/quality-audit          → Revisione manuale con 7 rating stars
```

### 4. Acquisto Libri

```
/libro/[slug]                 → Landing libro
    ↓ POST /api/libro/checkout
    ↓ Stripe Checkout
    ↓
/libro/[slug]/grazie          → Thank you page
```

---

## Statistiche

- **Pagine totali:** 43
- **API endpoints:** 59
- **Componenti:** 32
- **Librerie:** 41 (inclusi 3 check comprensione)

---

*Documentazione generata automaticamente da `scripts/generate-app-structure.js`*
