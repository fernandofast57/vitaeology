# Vitaeology - Struttura Applicazione

> Generato automaticamente il 07/01/2026

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
| `/` | Server | 🌐 | |
| `/admin` | Server | 🌐 | |
| `/admin/ab-testing` | Client | 🌐 | |
| `/admin/ai-coach` | Client | 🌐 | |
| `/admin/analytics` | Client | 🌐 | |
| `/admin/api-costs` | Client | 🌐 | |
| `/admin/behavioral` | Client | 🌐 | |
| `/admin/challenges` | Client | 🌐 | |
| `/admin/corrections` | Client | 🌐 | |
| `/admin/feedback-patterns` | Client | 🌐 | |
| `/admin/performance` | Client | 🌐 | |
| `/admin/quality-audit` | Client | 🌐 | |
| `/admin/users` | Client | 🌐 | |
| `/assessment/lite` | Client | 🌐 | |
| `/assessment/lite/results` | Client | 🌐 | |
| `/assessment/microfelicita` | Client | 🌐 | |
| `/assessment/microfelicita/results` | Client | 🌐 | |
| `/assessment/risolutore` | Client | 🌐 | |
| `/assessment/risolutore/results` | Client | 🌐 | |
| `/auth/forgot-password` | Client | 🌐 | |
| `/auth/login` | Client | 🌐 | |
| `/auth/reset-password` | Client | 🌐 | |
| `/auth/signup` | Client | 🌐 | |
| `/challenge/[type]/complete` | Client | 🔒 | |
| `/challenge/[type]/day/[day]` | Client | 🔒 | |
| `/challenge/leadership` | Client | 🌐 | |
| `/challenge/microfelicita` | Client | 🌐 | |
| `/challenge/ostacoli` | Client | 🌐 | |
| `/contact` | Client | 🌐 | |
| `/dashboard` | Client | 🔒 | |
| `/exercises` | Server | 🔒 | |
| `/exercises/[exerciseId]` | Server | 🔒 | |
| `/libro/[slug]` | Server | 🌐 | |
| `/libro/[slug]/grazie` | Server | 🌐 | |
| `/pricing` | Server | 🌐 | |
| `/privacy` | Server | 🌐 | |
| `/profile` | Client | 🔒 | |
| `/progress` | Client | 🔒 | |
| `/results` | Client | 🔒 | |
| `/subscription` | Client | 🔒 | |
| `/terms` | Server | 🌐 | |
| `/test` | Client | 🔒 | |

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
| `/api/admin/ai-coach/dashboard` | GET | |
| `/api/admin/ai-coach/patterns` | POST | |
| `/api/admin/ai-coach/reports` | POST | |
| `/api/admin/analytics` | GET | |
| `/api/admin/api-costs` | GET | |
| `/api/admin/behavioral-analytics` | GET | |
| `/api/admin/behavioral-stats` | GET | |
| `/api/admin/corrections` | GET, POST, DELETE, PATCH | |
| `/api/admin/feedback-patterns` | GET, PATCH | |
| `/api/admin/performance` | GET | |
| `/api/admin/quality-audit` | GET, POST | |
| `/api/admin/users` | GET | |
| `/api/admin/users/[userId]/role` | PUT, DELETE | |

### /api/ai-coach

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/ai-coach` | POST | |
| `/api/ai-coach/conversations` | GET, DELETE | |
| `/api/ai-coach/cron/combined` | GET | |
| `/api/ai-coach/cron/daily-metrics` | GET, POST | |
| `/api/ai-coach/cron/weekly-report` | GET, POST | |
| `/api/ai-coach/edit` | POST | |
| `/api/ai-coach/export` | GET | |
| `/api/ai-coach/feedback` | POST | |
| `/api/ai-coach/history` | GET | |
| `/api/ai-coach/reformulate` | POST | |
| `/api/ai-coach/signals` | POST | |

### /api/analytics

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/analytics/behavioral` | POST | |

### /api/assessment

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/assessment/answer` | POST | |
| `/api/assessment/complete` | POST | |
| `/api/assessment/microfelicita/answer` | POST | |
| `/api/assessment/microfelicita/complete` | POST | |
| `/api/assessment/microfelicita/questions` | GET | |
| `/api/assessment/microfelicita/results/[id]` | GET | |
| `/api/assessment/microfelicita/session` | POST | |
| `/api/assessment/questions` | GET | |
| `/api/assessment/results/[id]` | GET | |
| `/api/assessment/risolutore/answer` | POST | |
| `/api/assessment/risolutore/complete` | POST | |
| `/api/assessment/risolutore/questions` | GET | |
| `/api/assessment/risolutore/results/[id]` | GET | |
| `/api/assessment/risolutore/session` | POST | |
| `/api/assessment/session` | GET, DELETE | |

### /api/callback

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/auth/callback` | GET | |

### /api/challenge

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/challenge/check-unlock` | GET, POST | |
| `/api/challenge/complete-day` | POST | |
| `/api/challenge/subscribe` | POST | |
| `/og/challenge/[type]` | GET | |

### /api/coach

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/coach/feedback` | GET, POST | |

### /api/cron

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/cron/challenge-emails` | GET, POST | |
| `/api/cron/send-challenge-emails` | GET | |

### /api/libro

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/libro/checkout` | POST | |

### /api/recommendations

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/recommendations` | GET, POST | |

### /api/signout

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/auth/signout` | POST | |

### /api/stripe

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/stripe/checkout` | POST | |
| `/api/stripe/portal` | POST | |
| `/api/stripe/webhook` | POST | |

### /api/test-post

| Endpoint | Metodi | Descrizione |
|----------|--------|-------------|
| `/api/test-post` | GET, POST | |

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

- `correction-suggestion`
- `exercise-recommendation`
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
    ↓ Memoria conversazione salvata
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

- **Pagine totali:** 42
- **API endpoints:** 55
- **Componenti:** 32
- **Librerie:** 38

---

*Documentazione generata automaticamente da `scripts/generate-app-structure.js`*
