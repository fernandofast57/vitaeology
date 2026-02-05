# VITAEOLOGY - DOCUMENTAZIONE COMPLETA DEL PROGETTO

**Versione:** 3.0
**Data:** 5 Febbraio 2026
**Owner:** Fernando Marongiu
**Stack:** Next.js 14 + TypeScript + Supabase + Stripe + Claude AI + Resend

---

## INDICE

1. [Panoramica Progetto](#1-panoramica-progetto)
2. [Architettura Tecnica](#2-architettura-tecnica)
3. [Struttura File Completa](#3-struttura-file-completa)
4. [Pagine e Routes (35+)](#4-pagine-e-routes)
5. [Componenti React (24+)](#5-componenti-react)
6. [API Endpoints (38+)](#6-api-endpoints)
7. [Database Schema](#7-database-schema)
8. [Sistema Assessment](#8-sistema-assessment)
9. [Sistema AI Coach Fernando](#9-sistema-ai-coach-fernando)
10. [Sistema Challenge (Funnel 7 Giorni)](#10-sistema-challenge)
11. [Sistema Email Resend](#11-sistema-email-resend)
12. [Sistema Libri e Pagamenti](#12-sistema-libri-e-pagamenti)
13. [Sistema Protezione PDF](#13-sistema-protezione-pdf)
14. [Admin Panel](#14-admin-panel)
15. [Design System](#15-design-system)
16. [Variabili Ambiente](#16-variabili-ambiente)
17. [Script e Utility](#17-script-e-utility)
18. [Deployment](#18-deployment)

---

## 1. PANORAMICA PROGETTO

### 1.1 Cos'è Vitaeology

Vitaeology è una **piattaforma SaaS per lo sviluppo della leadership** destinata a imprenditori italiani (35-55 anni). Il progetto integra:

- **Assessment psicometrici** (3 assessment: Leadership 72, Risolutore 48, Microfelicità 47)
- **AI Coach personalizzato** (Fernando) basato su Claude con RAG
- **52 esercizi settimanali** con tracking progressi
- **3 Challenge gratuite** (funnel 7 giorni con email automation)
- **3 Libri digitali** in vendita (lead magnet)
- **Sistema subscription** a 3 tier

### 1.2 Principi Fondamentali (OBBLIGATORI)

```
1. PRINCIPIO VALIDANTE
   - MAI linguaggio deficit ("ti manca", "area debole")
   - SEMPRE linguaggio validante ("dove già operi", "puoi espandere")
   - L'utente POSSIEDE GIÀ tutte le capacità

2. USER AGENCY
   - L'utente è AGENTE attivo, non paziente passivo
   - Mai prescrizioni dirette ("devi fare X")
   - Sempre domande e facilitazione

3. SEQUENZA ESSERE → FARE → AVERE
   - Prima identità, poi comportamento, poi risultato

4. NOME AI COACH
   - Il nome è FERNANDO, mai Marco (errore critico)
```

### 1.3 I 3 Libri / Percorsi

| Libro | Slug | Colore | Focus |
|-------|------|--------|-------|
| Leadership Autentica | `leadership` | Oro #D4AF37 | 24 caratteristiche leadership |
| Oltre gli Ostacoli | `risolutore` / `ostacoli` | Verde #10B981 | Problem solving, Framework CAMBIA |
| Microfelicità Digitale | `microfelicita` | Viola #8B5CF6 | Benessere, Sistema R.A.D.A.R. |

### 1.4 I 4 Pilastri

| Pilastro | Nome IT | Colore | Caratteristiche |
|----------|---------|--------|-----------------|
| ESSERE | Visione | Blu #3B82F6 | 6 caratteristiche |
| SENTIRE | Relazioni | Verde #10B981 | 6 caratteristiche |
| PENSARE | Adattamento | Viola #8B5CF6 | 6 caratteristiche |
| AGIRE | Azione | Arancione #F59E0B | 6 caratteristiche |

**Totale: 24 caratteristiche di leadership**

---

## 2. ARCHITETTURA TECNICA

### 2.1 Stack Tecnologico

| Layer | Tecnologia | Versione |
|-------|------------|----------|
| Frontend | Next.js (App Router) | 14.2.x |
| Linguaggio | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Database | PostgreSQL (Supabase) | 15.x |
| Auth | Supabase Auth | - |
| AI | Anthropic Claude API | claude-3-sonnet |
| Embeddings | OpenAI | text-embedding-3-small |
| Pagamenti | Stripe | - |
| Email | Resend | - |
| Hosting | Vercel | - |
| Vector Search | pgvector (Supabase) | - |

### 2.2 Integrazioni Esterne

| Servizio | Funzione | Endpoint/SDK |
|----------|----------|--------------|
| Anthropic | AI Coach conversazioni | `@anthropic-ai/sdk` |
| OpenAI | Embeddings per RAG | `openai` |
| Supabase | DB + Auth + Storage | `@supabase/supabase-js` |
| Stripe | Pagamenti subscription + one-time | `stripe` |
| Resend | Email transazionali + marketing | `resend` |
| Vercel | Hosting + Cron jobs | Vercel CLI |

---

## 3. STRUTTURA FILE COMPLETA

```
vitaeology-Claude_Project/
├── .claude/                          # Claude Code config
│   └── settings.local.json
├── .env.local                        # Variabili ambiente (NON COMMITTARE)
├── .eslintrc.json                    # ESLint config
├── .gitignore
├── CLAUDE.md                         # Istruzioni per Claude Code
├── package.json
├── tailwind.config.ts
├── tsconfig.json
│
├── docs/                             # DOCUMENTAZIONE
│   └── PROGETTO_VITAEOLOGY_COMPLETO.md  # QUESTO FILE
│
├── public/                           # Asset statici
│   ├── logo-horizontal.svg
│   ├── logo-horizontal-white.svg
│   ├── logo-icon.svg
│   └── og-image.png
│
├── src/
│   ├── app/                          # PAGES (Next.js App Router)
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Homepage
│   │   ├── globals.css               # Stili globali
│   │   │
│   │   ├── auth/                     # Autenticazione
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── dashboard/                # Dashboard utente
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── exercises/                # Esercizi
│   │   │   ├── page.tsx
│   │   │   └── [exerciseId]/page.tsx
│   │   │
│   │   ├── assessment/               # Assessment (3 percorsi)
│   │   │   ├── leadership/
│   │   │   │   ├── page.tsx
│   │   │   │   └── results/page.tsx
│   │   │   ├── risolutore/
│   │   │   │   ├── page.tsx
│   │   │   │   └── results/page.tsx
│   │   │   └── microfelicita/
│   │   │       ├── page.tsx
│   │   │       └── results/page.tsx
│   │   │
│   │   ├── challenge/                # Challenge 7 giorni
│   │   │   ├── leadership/page.tsx
│   │   │   ├── ostacoli/page.tsx
│   │   │   ├── microfelicita/page.tsx
│   │   │   └── [type]/
│   │   │       ├── day/[day]/page.tsx
│   │   │       └── complete/page.tsx
│   │   │
│   │   ├── libro/                    # Landing libri
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       ├── AcquistaButton.tsx
│   │   │       └── grazie/page.tsx
│   │   │
│   │   ├── admin/                    # Admin panel
│   │   │   ├── layout.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── ai-coach/page.tsx
│   │   │   ├── api-costs/page.tsx
│   │   │   ├── performance/page.tsx
│   │   │   ├── quality-audit/page.tsx
│   │   │   ├── feedback-patterns/page.tsx
│   │   │   ├── corrections/page.tsx
│   │   │   └── ab-testing/page.tsx
│   │   │
│   │   ├── profile/page.tsx
│   │   ├── progress/page.tsx
│   │   ├── results/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── subscription/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── test/page.tsx
│   │   │
│   │   └── api/                      # API ROUTES
│   │       ├── ai-coach/
│   │       │   ├── route.ts
│   │       │   ├── conversations/route.ts
│   │       │   ├── feedback/route.ts
│   │       │   ├── edit/route.ts
│   │       │   ├── reformulate/route.ts
│   │       │   ├── history/route.ts
│   │       │   ├── export/route.ts
│   │       │   ├── signals/route.ts
│   │       │   └── cron/
│   │       │       ├── daily-metrics/route.ts
│   │       │       ├── weekly-report/route.ts
│   │       │       └── combined/route.ts
│   │       │
│   │       ├── admin/
│   │       │   ├── users/route.ts
│   │       │   ├── analytics/route.ts
│   │       │   ├── api-costs/route.ts
│   │       │   ├── performance/route.ts
│   │       │   └── ai-coach/
│   │       │       ├── dashboard/route.ts
│   │       │       ├── patterns/route.ts
│   │       │       └── reports/route.ts
│   │       │
│   │       ├── assessment/
│   │       │   ├── questions/route.ts
│   │       │   ├── session/route.ts
│   │       │   ├── answer/route.ts
│   │       │   ├── complete/route.ts
│   │       │   └── results/[id]/route.ts
│   │       │
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts
│   │       │   ├── portal/route.ts
│   │       │   └── webhook/route.ts
│   │       │
│   │       ├── challenge/
│   │       │   ├── subscribe/route.ts
│   │       │   ├── complete-day/route.ts
│   │       │   └── check-unlock/route.ts
│   │       │
│   │       ├── libro/
│   │       │   ├── checkout/route.ts
│   │       │   └── download/route.ts     # Download protetto con watermark
│   │       │
│   │       ├── recommendations/route.ts
│   │       │
│   │       └── cron/
│   │           └── send-challenge-emails/route.ts
│   │
│   ├── components/                   # COMPONENTI REACT
│   │   ├── ai-coach/
│   │   │   ├── ChatWidget.tsx
│   │   │   ├── ConversationHistory.tsx
│   │   │   └── ExportButton.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── WelcomeHero.tsx
│   │   │   ├── AssessmentCard.tsx
│   │   │   ├── QuickStats.tsx
│   │   │   ├── TrialBanner.tsx
│   │   │   ├── MiniRadarPreview.tsx
│   │   │   ├── ExercisesCard.tsx
│   │   │   ├── RecommendedExercises.tsx
│   │   │   └── RecentActivity.tsx
│   │   │
│   │   ├── assessment/
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ResultsRadar.tsx
│   │   │
│   │   ├── charts/
│   │   │   └── LeadershipRadarChart.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── DashboardHeader.tsx
│   │   │
│   │   ├── exercises/
│   │   │   ├── ExercisesHeader.tsx
│   │   │   ├── ExercisesList.tsx
│   │   │   ├── ExerciseDetail.tsx
│   │   │   └── LockedExerciseView.tsx
│   │   │
│   │   ├── challenge/
│   │   │   └── DiscoveryConfirmation.tsx
│   │   │
│   │   ├── libro/
│   │   │   └── DownloadBookButton.tsx    # Bottone download protetto
│   │   │
│   │   └── ui/
│   │       └── Breadcrumb.tsx
│   │
│   ├── lib/                          # LIBRERIE E SERVIZI
│   │   ├── ai-coach/
│   │   │   ├── types.ts
│   │   │   ├── system-prompt.ts
│   │   │   ├── user-memory.ts
│   │   │   ├── pattern-recognition.ts
│   │   │   ├── pattern-autocorrection.ts
│   │   │   ├── implicit-signals.ts
│   │   │   ├── daily-metrics.ts
│   │   │   ├── weekly-report.ts
│   │   │   └── email-report.ts
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   ├── exercises.ts
│   │   │   └── assessment.ts
│   │   │
│   │   ├── services/
│   │   │   ├── exercise-recommendation.ts
│   │   │   ├── pattern-detection.ts
│   │   │   └── correction-suggestion.ts
│   │   │
│   │   ├── types/
│   │   │   ├── roles.ts
│   │   │   └── exercises.ts
│   │   │
│   │   ├── challenge/
│   │   │   ├── day-content.ts
│   │   │   └── discovery-data.ts
│   │   │
│   │   ├── email/
│   │   │   ├── challenge-day-templates.ts
│   │   │   └── send-book-email.ts        # Email consegna libri con signed URL
│   │   │
│   │   ├── libro/
│   │   │   ├── download-token.ts         # JWT per download protetto (24h)
│   │   │   └── watermark-pdf.ts          # Watermark PDF con nome/email
│   │   │
│   │   ├── auth/
│   │   │   └── permissions.ts
│   │   │
│   │   ├── admin/
│   │   │   └── verify-admin.ts
│   │   │
│   │   ├── rag.ts
│   │   ├── assessment-scoring.ts
│   │   └── utils/index.ts
│   │
│   ├── data/                         # DATI STATICI
│   │   └── libri.ts
│   │
│   ├── config/                       # CONFIGURAZIONI
│   │   └── pricing.ts
│   │
│   └── hooks/                        # REACT HOOKS
│       └── useDiscoveryProgress.ts
│
├── scripts/                          # SCRIPT UTILITY
│   ├── run-sql.js
│   ├── 03_generate_embeddings.js
│   ├── 04_import_to_supabase.js
│   ├── verify_ai_coach_tables.js
│   ├── check-users.js
│   ├── check-conversations.js
│   └── [40+ altri script]
│
├── sql/                              # MIGRAZIONI SQL
│   ├── 01_trigger_function.sql
│   ├── 02_characteristics_table.sql
│   ├── 03_characteristics_data.sql
│   ├── 04_exercises_table.sql
│   ├── 05_user_progress_table.sql
│   ├── 06_rls_policies.sql
│   ├── user_books_update_policy.sql  # RLS UPDATE per download count
│   └── [40+ altri file SQL]
│
├── sql_exercises/                    # SEED ESERCIZI
│   ├── Q1_exercises_01-13.sql
│   ├── Q2_exercises_14-26.sql
│   ├── Q3_exercises_27-39.sql
│   └── Q4_exercises_40-52.sql
│
└── supabase/                         # SUPABASE CONFIG
    ├── schema.sql
    ├── seed_assessment_questions.sql
    ├── seed_52_exercises_final.sql
    └── migrations/
```

---

## 4. PAGINE E ROUTES

### 4.1 Pagine Pubbliche

| Route | File | Descrizione |
|-------|------|-------------|
| `/` | `page.tsx` | Homepage con hero, features, pilastri |
| `/auth/login` | `auth/login/page.tsx` | Form login |
| `/auth/signup` | `auth/signup/page.tsx` | Form registrazione |
| `/auth/forgot-password` | `auth/forgot-password/page.tsx` | Richiesta reset password |
| `/auth/reset-password` | `auth/reset-password/page.tsx` | Conferma reset password |
| `/pricing` | `pricing/page.tsx` | Pagina prezzi 3 tier |
| `/contact` | `contact/page.tsx` | Contatti |
| `/terms` | `terms/page.tsx` | Termini di servizio |
| `/privacy` | `privacy/page.tsx` | Privacy policy |

### 4.2 Challenge (Funnel Gratuito)

| Route | File | Descrizione |
|-------|------|-------------|
| `/challenge/leadership` | `challenge/leadership/page.tsx` | Landing A/B Leadership |
| `/challenge/ostacoli` | `challenge/ostacoli/page.tsx` | Landing A/B Ostacoli |
| `/challenge/microfelicita` | `challenge/microfelicita/page.tsx` | Landing A/B Microfelicità |
| `/challenge/[type]/day/[day]` | `challenge/[type]/day/[day]/page.tsx` | Contenuto giorno 1-7 |
| `/challenge/[type]/complete` | `challenge/[type]/complete/page.tsx` | Pagina completamento |

### 4.3 Libri (Sales Funnel)

| Route | File | Descrizione |
|-------|------|-------------|
| `/libro/leadership` | `libro/[slug]/page.tsx` | Landing libro Leadership |
| `/libro/risolutore` | `libro/[slug]/page.tsx` | Landing libro Risolutore |
| `/libro/microfelicita` | `libro/[slug]/page.tsx` | Landing libro Microfelicità |
| `/libro/[slug]/grazie` | `libro/[slug]/grazie/page.tsx` | Thank you post-acquisto |

### 4.4 Dashboard (Autenticato)

| Route | File | Descrizione |
|-------|------|-------------|
| `/dashboard` | `dashboard/page.tsx` | Dashboard principale |
| `/exercises` | `exercises/page.tsx` | Lista 52 esercizi |
| `/exercises/[id]` | `exercises/[exerciseId]/page.tsx` | Dettaglio esercizio |
| `/assessment/leadership` | `assessment/leadership/page.tsx` | Assessment Leadership 72 domande |
| `/assessment/leadership/results` | `assessment/leadership/results/page.tsx` | Risultati Leadership |
| `/assessment/risolutore` | `assessment/risolutore/page.tsx` | Assessment Risolutore 48 domande |
| `/assessment/risolutore/results` | `assessment/risolutore/results/page.tsx` | Risultati Risolutore |
| `/assessment/microfelicita` | `assessment/microfelicita/page.tsx` | Assessment Microfelicità 47 domande |
| `/assessment/microfelicita/results` | `assessment/microfelicita/results/page.tsx` | Risultati Microfelicità |
| `/profile` | `profile/page.tsx` | Profilo utente |
| `/progress` | `progress/page.tsx` | Progressi |
| `/results` | `results/page.tsx` | Risultati con radar chart |

### 4.5 Admin Panel

| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/users` | `admin/users/page.tsx` | Gestione utenti |
| `/admin/analytics` | `admin/analytics/page.tsx` | Analytics funnel |
| `/admin/ai-coach` | `admin/ai-coach/page.tsx` | Monitoring AI Coach |
| `/admin/api-costs` | `admin/api-costs/page.tsx` | Costi API |
| `/admin/performance` | `admin/performance/page.tsx` | Performance |
| `/admin/quality-audit` | `admin/quality-audit/page.tsx` | Quality audit |
| `/admin/feedback-patterns` | `admin/feedback-patterns/page.tsx` | Pattern feedback |
| `/admin/corrections` | `admin/corrections/page.tsx` | Auto-correzioni |
| `/admin/ab-testing` | `admin/ab-testing/page.tsx` | A/B testing |

---

## 5. COMPONENTI REACT

### 5.1 AI Coach

| Componente | File | Descrizione |
|------------|------|-------------|
| `ChatWidget` | `ai-coach/ChatWidget.tsx` | Widget chat principale |
| `ConversationHistory` | `ai-coach/ConversationHistory.tsx` | Storico conversazioni |
| `ExportButton` | `ai-coach/ExportButton.tsx` | Export PDF/JSON |

### 5.2 Dashboard

| Componente | File | Descrizione |
|------------|------|-------------|
| `WelcomeHero` | `dashboard/WelcomeHero.tsx` | Hero benvenuto personalizzato |
| `AssessmentCard` | `dashboard/AssessmentCard.tsx` | Card stato assessment |
| `QuickStats` | `dashboard/QuickStats.tsx` | Statistiche rapide |
| `TrialBanner` | `dashboard/TrialBanner.tsx` | Banner trial 14 giorni |
| `MiniRadarPreview` | `dashboard/MiniRadarPreview.tsx` | Mini radar chart |
| `ExercisesCard` | `dashboard/ExercisesCard.tsx` | Card esercizi |
| `RecommendedExercises` | `dashboard/RecommendedExercises.tsx` | Esercizi raccomandati |
| `RecentActivity` | `dashboard/RecentActivity.tsx` | Attività recente |

### 5.3 Assessment

| Componente | File | Descrizione |
|------------|------|-------------|
| `QuestionCard` | `assessment/QuestionCard.tsx` | Card singola domanda |
| `ProgressBar` | `assessment/ProgressBar.tsx` | Barra progresso |
| `ResultsRadar` | `assessment/ResultsRadar.tsx` | Radar chart risultati |

### 5.4 Layout

| Componente | File | Descrizione |
|------------|------|-------------|
| `Sidebar` | `layout/Sidebar.tsx` | Sidebar navigazione |
| `DashboardHeader` | `layout/DashboardHeader.tsx` | Header dashboard |

### 5.5 Esercizi

| Componente | File | Descrizione |
|------------|------|-------------|
| `ExercisesList` | `exercises/ExercisesList.tsx` | Lista esercizi filtrabili |
| `ExerciseDetail` | `exercises/ExerciseDetail.tsx` | Dettaglio esercizio |
| `LockedExerciseView` | `exercises/LockedExerciseView.tsx` | Vista esercizio bloccato |

### 5.6 Challenge

| Componente | File | Descrizione |
|------------|------|-------------|
| `DiscoveryConfirmation` | `challenge/DiscoveryConfirmation.tsx` | Quiz A/B/C discovery |

### 5.7 Libro

| Componente | File | Descrizione |
|------------|------|-------------|
| `DownloadBookButton` | `libro/DownloadBookButton.tsx` | Bottone download PDF protetto con verifica ownership |

---

## 6. API ENDPOINTS

### 6.1 AI Coach

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/ai-coach` | Chat principale con Claude |
| GET | `/api/ai-coach/conversations` | Lista conversazioni |
| POST | `/api/ai-coach/feedback` | Salva feedback |
| POST | `/api/ai-coach/edit` | Modifica messaggio |
| POST | `/api/ai-coach/reformulate` | Riformulazione |
| GET | `/api/ai-coach/history` | Storico paginato |
| POST | `/api/ai-coach/export` | Export PDF/JSON |
| POST | `/api/ai-coach/signals` | Track segnali impliciti |

### 6.2 Assessment

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/assessment/questions` | Recupera 72 domande |
| POST | `/api/assessment/session` | Crea/recupera sessione |
| POST | `/api/assessment/answer` | Salva risposta |
| POST | `/api/assessment/complete` | Completa assessment |
| GET | `/api/assessment/results/[id]` | Risultati |

### 6.3 Stripe

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/stripe/checkout` | Crea checkout session |
| POST | `/api/stripe/portal` | Customer portal |
| POST | `/api/stripe/webhook` | Webhook Stripe |

### 6.4 Challenge

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/challenge/subscribe` | Iscrizione challenge |
| POST | `/api/challenge/complete-day` | Completa giorno |
| POST | `/api/challenge/check-unlock` | Verifica sblocco |

### 6.5 Libri

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/libro/checkout` | Checkout libro singolo |
| GET | `/api/libro/download?token=xxx` | Download PDF con signed URL (da email) |
| GET | `/api/libro/download?book=slug` | Download PDF con auth session (da dashboard) |

### 6.6 Cron Jobs

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/cron/send-challenge-emails` | Email challenge giornaliere |
| POST | `/api/ai-coach/cron/daily-metrics` | Metriche giornaliere |
| POST | `/api/ai-coach/cron/weekly-report` | Report settimanale |

### 6.7 Admin

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/admin/users` | Lista utenti |
| GET | `/api/admin/analytics` | Dati analytics |
| GET | `/api/admin/api-costs` | Costi API |
| GET | `/api/admin/performance` | Performance |

---

## 7. DATABASE SCHEMA

### 7.1 Tabelle Principali

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',  -- free, leader, mentor
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT UNIQUE,
  current_path TEXT,  -- leadership, problemi, benessere
  is_admin BOOLEAN DEFAULT false,
  role_id UUID REFERENCES roles,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
```

#### characteristics (24 righe)
```sql
CREATE TABLE characteristics (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books,
  pillar TEXT,  -- ESSERE, SENTIRE, PENSARE, AGIRE
  name TEXT,
  name_familiar TEXT,  -- slug
  description TEXT,
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true
);
```

#### assessment_questions (167 righe totali)
```sql
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY,
  book_id UUID,
  characteristic_id UUID REFERENCES characteristics,
  question_text TEXT,
  question_type TEXT,  -- passive, interlocutory, active, standard
  scoring_type TEXT,   -- direct, inverse
  order_index INTEGER,
  code TEXT
);
```

#### exercises (52 righe)
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY,
  week_number INTEGER,  -- 1-52
  characteristic_id UUID REFERENCES characteristics,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  slug TEXT,
  exercise_type TEXT,
  difficulty_level TEXT,  -- base, intermedio, avanzato
  estimated_time_minutes INTEGER,
  content TEXT,
  action_items JSONB,
  is_active BOOLEAN DEFAULT true
);
```

#### user_exercise_progress
```sql
CREATE TABLE user_exercise_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  exercise_id UUID REFERENCES exercises,
  status TEXT,  -- not_started, in_progress, completed
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0
);
```

#### ai_coach_conversations
```sql
CREATE TABLE ai_coach_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  role TEXT,  -- user, assistant
  content TEXT,
  exercise_id UUID,
  context_type TEXT,  -- assessment, exercise, general
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### challenge_subscribers
```sql
CREATE TABLE challenge_subscribers (
  id UUID PRIMARY KEY,
  email TEXT,
  nome TEXT,
  challenge TEXT,  -- leadership-autentica, oltre-ostacoli, microfelicita
  variant TEXT,  -- A, B, C
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  subscribed_at TIMESTAMPTZ,
  current_day INTEGER DEFAULT 0,
  status TEXT,  -- active, completed, unsubscribed
  last_email_sent_at TIMESTAMPTZ,
  last_email_type TEXT,
  completed_at TIMESTAMPTZ,
  converted_to_assessment BOOLEAN DEFAULT false
);
```

#### book_chunks (RAG)
```sql
CREATE TABLE book_chunks (
  id UUID PRIMARY KEY,
  book_title TEXT,
  chapter TEXT,
  section TEXT,
  content TEXT,
  chunk_type TEXT,
  keywords TEXT[],
  embedding VECTOR(1536),  -- OpenAI embedding
  current_path TEXT,
  created_at TIMESTAMPTZ
);
```

### 7.2 RLS (Row Level Security)

Tutte le tabelle hanno RLS attivo:
- Utenti vedono solo i propri dati
- Admin può vedere tutto
- Service role bypassa RLS

---

## 8. SISTEMA ASSESSMENT

### 8.1 I 3 Assessment (per Percorso)

| Assessment | Domande | Percorso | Struttura |
|------------|---------|----------|-----------|
| **Leadership** | 72 | Leadership Autentica | 24 caratteristiche × 3 domande |
| **Risolutore** | 48 | Oltre gli Ostacoli | 3 Filtri (Pattern, Segnali, Risorse) |
| **Microfelicità** | 47 | Microfelicità Digitale | 5 fasi R.A.D.A.R. |

**Parametri comuni:**
- Scala risposta: 1-5 (Quasi mai → Costantemente)
- Scoring: Direct + Inverse

### 8.2 Flusso Assessment

```
1. GET /api/assessment/questions
   → Recupera 72 domande ordinate

2. POST /api/assessment/session
   → Crea sessione o recupera esistente

3. POST /api/assessment/answer (×72)
   → Salva ogni risposta con normalizzazione

4. POST /api/assessment/complete
   → Calcola scores per caratteristica
   → Calcola scores per pilastro
   → Salva risultati

5. GET /api/assessment/results/[id]
   → Recupera risultati con breakdown
```

### 8.3 Calcolo Punteggi

```typescript
// File: src/lib/assessment-scoring.ts

// Normalizzazione (scala 1-5)
function normalizeScore(rawScore: number, scoringType: 'direct' | 'inverse') {
  if (scoringType === 'inverse') {
    return 6 - rawScore;  // 1→5, 2→4, 3→3, 4→2, 5→1
  }
  return rawScore;
}

// Score caratteristica = media risposte normalizzate (3 domande)
// Score pilastro = media caratteristiche del pilastro (6 caratteristiche)
// Score totale = media tutti i pilastri
```

---

## 9. SISTEMA AI COACH FERNANDO

### 9.1 Architettura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   ChatWidget    │────▶│  /api/ai-coach   │────▶│  Claude API     │
│   (Frontend)    │     │  (Route Handler) │     │  (Anthropic)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   RAG System     │
                        │  (OpenAI Embed)  │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  book_chunks     │
                        │  (Supabase)      │
                        └──────────────────┘
```

### 9.2 System Prompt (Estratto)

```typescript
// File: src/lib/ai-coach/system-prompt.ts

const FERNANDO_SYSTEM_PROMPT = `
Sei Fernando Marongiu, autore della trilogia "Rivoluzione Aurea":
- "Leadership Autentica"
- "Oltre gli Ostacoli"
- "Microfelicità Digitale"

PRINCIPIO FONDAMENTALE:
Le persone hanno già dentro di sé le capacità di leadership.
Non devono "acquisirle" - devono RICONOSCERLE e ESPANDERLE.

LINGUAGGIO VALIDANTE (OBBLIGATORIO):
✅ "Dove già operi con questa capacità?"
✅ "In quali momenti emerge naturalmente?"
✅ "Come puoi espandere quello che già fai?"
❌ MAI: "Ti manca", "Devi migliorare", "Punto debole"

STRUMENTI INVISIBILI:
1. Bersaglio vs Sorgente (passivo vs agente)
2. R.A.D.A.R. (da Microfelicità)
3. 24 Caratteristiche (da Leadership Autentica)
4. Framework CAMBIA (da Oltre gli Ostacoli)

SAFETY PROTOCOL:
Se menziona suicidio/autolesionismo → Risposta hotline immediata
`;
```

### 9.3 RAG System

```typescript
// File: src/lib/rag.ts

async function getRAGContextWithMetadata(query: string, currentPath: string) {
  // 1. Genera embedding della query
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });

  // 2. Cerca chunks simili nel DB
  const { data: chunks } = await supabase.rpc('match_book_chunks', {
    query_embedding: embedding.data[0].embedding,
    match_threshold: 0.3,
    match_count: 3,
    filter_path: currentPath  // leadership, problemi, benessere
  });

  // 3. Restituisce contesto per il prompt
  return {
    context: chunks.map(c => c.content).join('\n\n'),
    chunkIds: chunks.map(c => c.id),
    similarityScores: chunks.map(c => c.similarity)
  };
}
```

### 9.4 User Memory

```typescript
// File: src/lib/ai-coach/user-memory.ts

interface UserMemory {
  communication_style: 'directive' | 'socratic' | 'storytelling';
  preferred_response_length: 'brief' | 'moderate' | 'detailed';
  common_challenges: string[];
  successful_approaches: string[];
  trigger_topics: string[];
  personality_traits: Record<string, any>;
}
```

### 9.5 Segnali Impliciti

| Segnale | Threshold | Significato |
|---------|-----------|-------------|
| `long_pause` | > 5 min | Utente sta riflettendo |
| `immediate_reply` | < 30 sec | Risposta impulsiva |
| `message_edit` | entro 5 min | Riformulazione pensiero |
| `reformulation` | stessa domanda 2x | Non ha capito risposta |

---

## 10. SISTEMA CHALLENGE

### 10.1 Struttura 3 Challenge

| Challenge | Slug | Colore | Giorni |
|-----------|------|--------|--------|
| Leadership Autentica | `leadership` | Amber | 7 |
| Oltre gli Ostacoli | `ostacoli` | Emerald | 7 |
| Microfelicità | `microfelicita` | Violet | 7 |

### 10.2 A/B Testing (3 Varianti per Challenge)

```typescript
// File: src/app/challenge/leadership/page.tsx

const VARIANTS = {
  A: {
    headline: "Il Leader che Cerchi È Già Dentro di Te",
    subheadline: "In 7 giorni imparerai a riconoscere...",
    cta: "Inizia la Challenge Gratuita"
  },
  B: {
    headline: "Smetti di Cercare. Inizia a Riconoscere.",
    subheadline: "7 giorni per vedere il leader autentico...",
    cta: "Inizia Ora"
  },
  C: {
    headline: "Riconosci il Leader che Sei Già",
    subheadline: "Le capacità che cerchi le hai già...",
    cta: "Voglio Iniziare"
  }
};
```

### 10.3 Contenuti 7 Giorni

```typescript
// File: src/lib/challenge/day-content.ts

// Ogni giorno contiene:
interface DayContent {
  title: string;
  subtitle: string;
  principle: string;
  sections: Array<{
    icon?: string;
    title: string;
    content: string;
    highlights?: string[];
  }>;
  exercise: {
    instruction: string;
    steps?: string[];
    duration?: string;
  };
  keyTakeaway: string;
}
```

### 10.4 Domande Discovery (63 totali)

```typescript
// File: src/lib/challenge/discovery-data.ts

// 3 challenge × 7 giorni × 3 domande = 63 domande
// Formato A/B/C (non scala 1-5)

interface DiscoveryQuestion {
  text: string;
  options: Array<{
    value: 'A' | 'B' | 'C';
    text: string;
  }>;
}
```

### 10.5 Flusso Utente Challenge

```
1. Landing /challenge/leadership
   ↓ Form (email, nome)
2. POST /api/challenge/subscribe
   ↓ Salva in challenge_subscribers
3. Email Welcome (Resend)
   ↓
4. [Ogni giorno per 7 giorni]
   ↓ Email Day Content
   ↓ Utente visita /challenge/leadership/day/1
   ↓ Legge contenuto + fa esercizio
   ↓ Risponde 3 domande Discovery (A/B/C)
   ↓ POST /api/challenge/complete-day
   ↓ Sblocca giorno successivo
   ↓
5. Giorno 7 completato
   ↓
6. /challenge/leadership/complete
   ↓ CTA → Assessment o Acquisto Libro
```

---

## 11. SISTEMA EMAIL RESEND

### 11.1 Template Email (1000+ righe)

```typescript
// File: src/lib/email/challenge-day-templates.ts

// 5 tipi di email:
// 1. Welcome (iscrizione)
// 2. Day Content (giorni 1-7)
// 3. Reminder (48h inattività)
// 4. Force Advance (72h inattività)
// 5. Recovery (3 giorni post-challenge)
```

### 11.2 Contenuti Email per Challenge

| Challenge | Giorni | Email Contenuto |
|-----------|--------|-----------------|
| Leadership | 7 | Salvadanaio bucato, Parabrezza sporco, Batteria telefono, etc. |
| Ostacoli | 7 | Rubinetto che perde, Frigo vuoto, 3 Traditori, etc. |
| Microfelicità | 7 | 50 momenti, R.A.D.A.R., 5 canali, etc. |

### 11.3 Cron Job Email

```typescript
// File: src/app/api/cron/send-challenge-emails/route.ts

// Eseguito ogni giorno alle 8:00 UTC
// Logica:
// 1. REMINDER 48h → Utenti inattivi dopo email day_content
// 2. FORCE ADVANCE 72h → Auto-sblocco giorno successivo
// 3. RECOVERY 3 giorni → Post-challenge senza conversione
```

### 11.4 Configurazione Resend

```typescript
await resend.emails.send({
  from: 'Fernando <fernando@vitaeology.com>',
  replyTo: 'fernando@vitaeology.com',
  to: subscriber.email,
  subject: emailContent.subject,
  html: emailContent.html,
  tags: [
    { name: 'challenge', value: 'challenge-leadership' },
    { name: 'email_type', value: 'day_content' },
    { name: 'day', value: '1' }
  ]
});
```

---

## 12. SISTEMA LIBRI E PAGAMENTI

### 12.1 Dati Libri

```typescript
// File: src/data/libri.ts

export const LIBRI = {
  leadership: {
    slug: 'leadership',
    titolo: 'Leadership Autentica',
    sottotitolo: 'Come Sviluppare le 24 Caratteristiche del Genio',
    prezzo: 9.90,
    stripePriceId: 'price_leadership',
    coloreAccent: '#0F4C81',
    painPoints: [...],
    benefici: [...],
    capitoli: [...],
    cosaImparerai: [...],
    autore: { nome, bio, credenziali },
    garanzia: '30 giorni soddisfatti o rimborsati'
  },
  risolutore: { ... },
  microfelicita: { ... }
};
```

### 12.2 Checkout Libro (One-Time)

```typescript
// File: src/app/api/libro/checkout/route.ts

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: libro.titolo,
        description: libro.sottotitolo
      },
      unit_amount: Math.round(libro.prezzo * 100)  // centesimi
    },
    quantity: 1
  }],
  mode: 'payment',
  success_url: `${APP_URL}/libro/${slug}/grazie?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${APP_URL}/libro/${slug}?canceled=true`
});
```

### 12.3 Subscription Tier

| Tier | Prezzo | Stripe Price ID | Features |
|------|--------|-----------------|----------|
| Explorer | €0 | - | Assessment, 5 AI msg/day, 10 esercizi |
| Leader | €149/anno | `STRIPE_PRICE_LEADER_ANNUAL` | 52 esercizi, AI illimitato |
| Mentor | €490/anno | `STRIPE_PRICE_MENTOR_ANNUAL` | 3 percorsi, Q&A live |

### 12.4 Webhook Stripe

```typescript
// File: src/app/api/stripe/webhook/route.ts

// Eventi gestiti:
// - checkout.session.completed → Aggiorna subscription_tier
// - customer.subscription.updated → Aggiorna status
// - customer.subscription.deleted → Downgrade a free
// - invoice.payment_failed → Notifica admin
```

---

## 13. SISTEMA PROTEZIONE PDF

### 13.1 Architettura

Il sistema protegge i PDF dei 3 libri con:
1. **Signed URL (24h)** - Link temporaneo firmato con JWT, scade dopo 24 ore
2. **Watermark personalizzato** - Nome + email dell'acquirente su ogni pagina

```
ACQUISTO STRIPE
    │
    ▼
Webhook → sendBookEmail()
    │
    ▼
Genera JWT (24h) → URL: /api/libro/download?token=xxx
    │
    ▼
Email con link protetto (URL originale PDF MAI esposto)

UTENTE CLICCA LINK EMAIL
    │
    ▼
/api/libro/download?token=xxx
    │
    ▼
Valida JWT → Fetch PDF server-side → Watermark → Stream al browser
    │
    ▼
PDF con "Copia personale di [Nome] - [email]" su ogni pagina
```

### 13.2 Componenti

| File | Funzione |
|------|----------|
| `src/lib/libro/download-token.ts` | Genera/verifica JWT con `jose` |
| `src/lib/libro/watermark-pdf.ts` | Watermark PDF con `pdf-lib` |
| `src/app/api/libro/download/route.ts` | Endpoint download (token + auth mode) |
| `src/components/libro/DownloadBookButton.tsx` | Componente client per download |
| `src/lib/email/send-book-email.ts` | Email con signed URL |

### 13.3 Token JWT

```typescript
// Generazione token (24h default)
const token = await generateDownloadToken({
  email: 'user@example.com',
  name: 'Mario Rossi',
  bookSlug: 'leadership',
  expiresInSeconds: 86400  // 24h
});

// Payload JWT
{
  sub: email,       // Subject = email acquirente
  name: 'Mario',    // Nome per watermark
  book: 'leadership',
  iat: timestamp,
  exp: timestamp + 24h
}

// Signing key: CRON_SECRET (env var esistente)
```

### 13.4 Watermark PDF

```typescript
// Watermark su ogni pagina
// Posizione: centro pagina, rotazione 45°
// Opacità: 0.12 (visibile ma non invasivo)
// Font: Helvetica (built-in pdf-lib)

// Riga 1: "Copia personale di [Nome]" (36pt)
// Riga 2: "[email]" (22pt)
// Colore: grigio rgb(0.6, 0.6, 0.6)
```

### 13.5 Modalità Download

| Modalità | URL | Autenticazione | Uso |
|----------|-----|----------------|-----|
| **Token** | `?token=xxx` | JWT firmato | Link in email (24h) |
| **Auth** | `?book=slug` | Cookie Supabase | Dashboard, pagina grazie |

### 13.6 Rate Limiting

- Max 20 download per libro per utente
- Conteggio in `user_books.download_count`
- Superato limite → errore 429 con suggerimento contatto supporto

### 13.7 Sicurezza

| Aspetto | Protezione |
|---------|------------|
| URL originale PDF | MAI esposto al client (solo server-side) |
| Token scaduto | Redirect a login con messaggio amichevole |
| Ownership | Verifica `user_books` per auth mode |
| Tracciabilità | Watermark con dati acquirente |
| Distribuzione illecita | PDF tracciabile a persona specifica |

### 13.8 Dipendenze

```json
{
  "pdf-lib": "^1.17.1",  // Manipolazione PDF pura JS
  "jose": "^5.x"         // JWT signing/verification
}
```

---

## 14. ADMIN PANEL

### 14.1 Pagine Admin (9 totali)

| Pagina | Route | Funzione |
|--------|-------|----------|
| Users | `/admin/users` | Gestione utenti, tier, ruoli |
| Analytics | `/admin/analytics` | Funnel, retention, churn |
| AI Coach | `/admin/ai-coach` | Monitoring conversazioni |
| API Costs | `/admin/api-costs` | Costi OpenAI, Anthropic, Stripe |
| Performance | `/admin/performance` | Response times, error rates |
| Quality Audit | `/admin/quality-audit` | Audit qualità AI |
| Feedback Patterns | `/admin/feedback-patterns` | Pattern nei feedback |
| Corrections | `/admin/corrections` | Auto-correzioni suggerite |
| A/B Testing | `/admin/ab-testing` | Risultati test varianti |

### 14.2 Protezione Admin

```typescript
// File: src/lib/admin/verify-admin.ts

async function verifyAdmin(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated', status: 401 };

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, role_id')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return { error: 'Not authorized', status: 403 };

  return { user, profile };
}
```

---

## 15. DESIGN SYSTEM

### 15.1 Palette Colori

```css
/* Colori Primari */
--petrol-600: #0A2540;     /* Blu Petrolio - Primary */
--gold-500: #F4B942;       /* Oro - Accent */

/* Pilastri */
--pillar-being: #3B82F6;   /* Blu - Essere/Visione */
--pillar-feeling: #10B981; /* Verde - Sentire/Relazioni */
--pillar-thinking: #8B5CF6;/* Viola - Pensare/Adattamento */
--pillar-acting: #F59E0B;  /* Arancione - Agire/Azione */

/* Challenge */
--challenge-leadership: #D4AF37;  /* Amber */
--challenge-ostacoli: #10B981;    /* Emerald */
--challenge-microfelicita: #8B5CF6; /* Violet */

/* Neutrali */
--neutral-pearl: #E8E8E8;
--charcoal-gray: #2C3E50;
```

### 15.2 Typography

```typescript
// tailwind.config.ts

fontFamily: {
  sans: ['Inter', 'sans-serif'],           // Body text
  display: ['Stoke', 'serif'],             // Headings
  brand: ['Stoke', 'Crimson Text', 'serif'] // Logo/Brand
}
```

### 15.3 Componenti CSS

```css
/* src/app/globals.css */

.btn-primary {
  @apply bg-petrol-600 text-white px-6 py-3 rounded-lg
         font-semibold hover:bg-petrol-700 transition-colors;
}

.btn-secondary {
  @apply bg-gold-500 text-petrol-600 px-6 py-3 rounded-lg
         font-semibold hover:bg-gold-400 transition-colors;
}

.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6;
}
```

---

## 16. VARIABILI AMBIENTE

### 16.1 File .env.local (Template)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PRICE_LEADER_ANNUAL=price_xxx
STRIPE_PRICE_MENTOR_ANNUAL=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-xxx

# OpenAI (Embeddings)
OPENAI_API_KEY=sk-xxx
OPENAI_ORG_ID=org-xxx

# Resend (Email)
RESEND_API_KEY=re_xxx
RESEND_AUDIENCE_ID=aud_xxx  # Opzionale

# Cron Jobs
CRON_SECRET=xxx

# PDF Libri (URL storage, usati solo server-side)
PDF_URL_LEADERSHIP=https://xxx.supabase.co/storage/v1/object/public/books/Leadership.pdf
PDF_URL_RISOLUTORE=https://xxx.supabase.co/storage/v1/object/public/books/Risolutore.pdf
PDF_URL_MICROFELICITA=https://xxx.supabase.co/storage/v1/object/public/books/Microfelicita.pdf

# App
NEXT_PUBLIC_APP_URL=https://vitaeology.com
```

### 16.2 Variabili Vercel

Tutte le variabili sopra devono essere configurate anche in Vercel Dashboard → Settings → Environment Variables.

---

## 17. SCRIPT E UTILITY

### 17.1 Script Principali

| Script | Comando | Descrizione |
|--------|---------|-------------|
| `run-sql.js` | `node scripts/run-sql.js file.sql` | Esegue SQL su Supabase |
| `03_generate_embeddings.js` | `node scripts/03_generate_embeddings.js` | Genera embeddings libri |
| `04_import_to_supabase.js` | `node scripts/04_import_to_supabase.js` | Importa embeddings |
| `verify_ai_coach_tables.js` | `node scripts/verify_ai_coach_tables.js` | Verifica schema AI Coach |
| `check-users.js` | `node scripts/check-users.js` | Lista utenti |
| `check-conversations.js` | `node scripts/check-conversations.js` | Lista conversazioni |

### 17.2 Comandi NPM

```bash
npm run dev          # Avvia dev server
npm run build        # Build produzione
npm run lint         # ESLint
npm run start        # Avvia produzione
npm install          # Installa dipendenze
```

---

## 18. DEPLOYMENT

### 18.1 Vercel Configuration

```json
// vercel.json (se necessario)
{
  "crons": [
    {
      "path": "/api/cron/send-challenge-emails",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/ai-coach/cron/daily-metrics",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 18.2 Deploy Steps

```bash
1. git add .
2. git commit -m "Deploy: descrizione"
3. git push origin main
4. Vercel auto-deploys from main branch
```

### 18.3 Post-Deploy Checklist

- [ ] Variabili ambiente configurate
- [ ] Webhook Stripe configurato
- [ ] DNS verificato
- [ ] SSL attivo
- [ ] Cron jobs verificati
- [ ] Email Resend testate

---

## APPENDICE A: STATISTICHE PROGETTO

| Metrica | Valore |
|---------|--------|
| Pagine Next.js | 35+ |
| API Routes | 40+ |
| Componenti React | 25+ |
| Tabelle Database | 18+ |
| File SQL | 50+ |
| Script Utility | 45+ |
| Domande Assessment | 167 (72+48+47) |
| Esercizi | 52 |
| Caratteristiche | 24 |
| Libri | 3 |
| Challenge | 3 × 7 giorni |
| Template Email | 21 + 4 system |
| Linee Codice | ~15.000+ |

---

## APPENDICE B: CHANGELOG

### v3.0 (5 Febbraio 2026)
- **Sistema Protezione PDF** con signed URL (24h) + watermark personalizzato
- Nuove dipendenze: `pdf-lib`, `jose`
- Nuovo endpoint `/api/libro/download` (token + auth mode)
- Componente `DownloadBookButton` per download da dashboard/grazie
- Email libro con link protetto invece di URL diretto
- Rate limiting download (max 20 per libro)

### v2.0 (20 Gennaio 2026)
- Aggiornamento documentazione completa
- Allineamento con stato attuale del progetto

### v1.0 (26 Dicembre 2024)
- Documentazione iniziale completa
- Tutte le funzionalità core implementate
- Sistema Challenge con A/B testing
- Email automation Resend
- Admin panel completo

---

**Documento creato da:** Claude Code
**Ultima modifica:** 5 Febbraio 2026
**Prossima revisione:** Al prossimo major update
