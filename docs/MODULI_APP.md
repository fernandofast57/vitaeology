# Moduli Applicazione Vitaeology

**Ultimo aggiornamento:** 25 Gennaio 2026

---

## 1. PAGINE (~80)

### Pagine Pubbliche
| File | Descrizione |
|------|-------------|
| `page.tsx` | Homepage principale |
| `pricing/page.tsx` | Pagina prezzi |
| `privacy/page.tsx` | Privacy policy |
| `terms/page.tsx` | Termini di servizio |
| `contact/page.tsx` | Pagina contatti |
| `beta/page.tsx` | Pagina beta testing |

### Pagine Autenticazione
| File | Descrizione |
|------|-------------|
| `auth/login/page.tsx` | Login utenti |
| `auth/signup/page.tsx` | Registrazione utenti |
| `auth/forgot-password/page.tsx` | Recupero password |
| `auth/reset-password/page.tsx` | Reset password |
| `auth/callback/route.ts` | OAuth callback |
| `auth/signout/route.ts` | Logout |

### Pagine Dashboard Utente
| File | Descrizione |
|------|-------------|
| `dashboard/page.tsx` | Dashboard principale |
| `dashboard/layout.tsx` | Layout dashboard |
| `dashboard/challenges/page.tsx` | Sfide dell'utente |
| `dashboard/leadership/page.tsx` | Dati leadership |
| `dashboard/microfelicita/page.tsx` | Micro-felicità |
| `dashboard/ostacoli/page.tsx` | Ostacoli superati |
| `profile/page.tsx` | Profilo utente |
| `progress/page.tsx` | Progresso generale |
| `results/page.tsx` | Risultati assessment |
| `subscription/page.tsx` | Gestione sottoscrizione |
| `subscription/success/page.tsx` | Conferma sottoscrizione |

### Pagine Assessment
| File | Descrizione |
|------|-------------|
| `assessment/leadership/page.tsx` | Assessment leadership (72 domande) |
| `assessment/leadership/results/page.tsx` | Risultati leadership |
| `assessment/microfelicita/page.tsx` | Assessment microfelicità (47 domande) |
| `assessment/microfelicita/results/page.tsx` | Risultati microfelicità |
| `assessment/risolutore/page.tsx` | Assessment problem-solving (48 domande) |
| `assessment/risolutore/results/page.tsx` | Risultati problem-solving |

### Pagine Sfide (Challenge)
| File | Descrizione |
|------|-------------|
| `challenge/leadership/page.tsx` | Landing sfida leadership |
| `challenge/leadership/layout.tsx` | Layout sfida leadership |
| `challenge/microfelicita/page.tsx` | Landing sfida microfelicità |
| `challenge/microfelicita/layout.tsx` | Layout sfida microfelicità |
| `challenge/ostacoli/page.tsx` | Landing sfida ostacoli |
| `challenge/ostacoli/layout.tsx` | Layout sfida ostacoli |
| `challenge/[type]/day/[day]/page.tsx` | Pagina giorno sfida (1-7) |
| `challenge/[type]/complete/page.tsx` | Completamento sfida |

### Pagine Esercizi
| File | Descrizione |
|------|-------------|
| `exercises/page.tsx` | Libreria esercizi (126 totali) |
| `exercises/[exerciseId]/page.tsx` | Dettaglio esercizio |

### Pagine Libri
| File | Descrizione |
|------|-------------|
| `libro/page.tsx` | Catalogo libri |
| `libro/[slug]/page.tsx` | Dettaglio libro |
| `libro/[slug]/grazie/page.tsx` | Pagina ringraziamento post-acquisto |

### Pagine Admin (18)
| File | Descrizione |
|------|-------------|
| `admin/page.tsx` | Dashboard admin |
| `admin/layout.tsx` | Layout admin |
| `admin/ab-testing/page.tsx` | A/B testing |
| `admin/affiliates/page.tsx` | Gestione affiliati |
| `admin/ai-coach/page.tsx` | AI Coach admin |
| `admin/analytics/page.tsx` | Analytics |
| `admin/api-costs/page.tsx` | Costi API |
| `admin/awareness/page.tsx` | Livelli awareness |
| `admin/behavioral/page.tsx` | Analytics comportamentale |
| `admin/beta-testing/page.tsx` | Gestione beta testers |
| `admin/challenges/page.tsx` | Gestione sfide |
| `admin/corrections/page.tsx` | Correzioni suggerite |
| `admin/feedback-patterns/page.tsx` | Pattern feedback |
| `admin/funnel/page.tsx` | Analisi funnel |
| `admin/health/page.tsx` | Health check sistema |
| `admin/monitoring/page.tsx` | Monitoraggio sistema |
| `admin/performance/page.tsx` | Metriche performance |
| `admin/quality-audit/page.tsx` | Audit qualità |
| `admin/users/page.tsx` | Gestione utenti |

### Pagine Affiliate
| File | Descrizione |
|------|-------------|
| `affiliate/page.tsx` | Dashboard affiliate |
| `affiliate/dashboard/page.tsx` | Dashboard dettagliato |
| `affiliate/links/page.tsx` | Gestione link |
| `affiliate/termini/page.tsx` | Termini affiliate |

---

## 2. API ENDPOINTS (~100)

### AI Coach Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/ai-coach` | POST | Chat principale con Claude |
| `/api/ai-coach/conversations` | GET | Lista conversazioni |
| `/api/ai-coach/history` | GET | Storico conversazioni paginato |
| `/api/ai-coach/feedback` | POST | Feedback messaggio |
| `/api/ai-coach/signals` | POST | Segnali impliciti |
| `/api/ai-coach/edit` | POST | Modifica messaggio |
| `/api/ai-coach/reformulate` | POST | Riformula risposta |
| `/api/ai-coach/export` | POST | Esporta conversazioni |
| `/api/ai-coach/cron/daily-metrics` | GET | Metriche giornaliere |
| `/api/ai-coach/cron/weekly-report` | GET | Report settimanale |
| `/api/ai-coach/cron/combined` | GET | Cron combinato |

### Assessment Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/assessment/questions` | GET | Domande assessment leadership |
| `/api/assessment/session` | POST | Crea/recupera sessione |
| `/api/assessment/answer` | POST | Salva risposta |
| `/api/assessment/complete` | POST | Completa assessment |
| `/api/assessment/results/[id]` | GET | Recupera risultati |
| `/api/assessment/export` | POST | Esporta assessment |
| `/api/assessment/microfelicita/*` | * | Endpoint microfelicità |
| `/api/assessment/risolutore/*` | * | Endpoint risolutore |

### Challenge Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/challenge/subscribe` | POST | Iscrizione sfida |
| `/api/challenge/complete-day` | POST | Completa giorno sfida |
| `/api/challenge/feedback` | POST | Feedback sfida |
| `/api/challenge/check-unlock` | POST | Verifica sblocchi |
| `/api/challenge/mini-profile` | GET | Mini profilo challenge |

### Stripe Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/stripe/checkout` | POST | Crea checkout session |
| `/api/stripe/portal` | POST | Portale cliente Stripe |
| `/api/stripe/webhook` | POST | Webhook Stripe |

### Libro Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/libro/checkout` | POST | Checkout libro |
| `/api/libro/bump-checkout` | POST | Bump offer checkout |
| `/api/libro/attiva` | POST | Attiva codice libro |

### Exercises Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/exercises/complete` | POST | Completa esercizio |
| `/api/exercises/recommended` | GET | Esercizi consigliati |
| `/api/exercises/completion-stats` | GET | Statistiche completamento |

### Admin Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/admin/users` | GET/POST | Gestione utenti |
| `/api/admin/users/[userId]/role` | PUT | Cambio ruolo utente |
| `/api/admin/analytics` | GET | Dati analytics |
| `/api/admin/affiliates` | GET | Gestione affiliati |
| `/api/admin/affiliates/payouts` | POST | Pagamenti affiliati |
| `/api/admin/ai-coach/dashboard` | GET | Dashboard AI coach |
| `/api/admin/ai-coach/patterns` | GET | Pattern AI coach |
| `/api/admin/ai-coach/reports` | GET | Report AI coach |
| `/api/admin/api-costs` | GET | Costi API |
| `/api/admin/awareness` | GET | Dati awareness |
| `/api/admin/behavioral-analytics` | GET | Analytics comportamentale |
| `/api/admin/corrections` | GET/POST | Correzioni suggerite |
| `/api/admin/error-report` | GET | Report errori |
| `/api/admin/feedback-patterns` | GET | Pattern feedback |
| `/api/admin/funnel-analysis` | GET | Analisi funnel |
| `/api/admin/health` | GET | Health check |
| `/api/admin/monitoring` | GET | Monitoraggio |
| `/api/admin/performance` | GET | Performance metrics |
| `/api/admin/quality-audit` | GET | Audit qualità |
| `/api/admin/trigger-cron` | POST | Trigger cron jobs |

### Affiliate Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/affiliate` | GET | Info affiliate |
| `/api/affiliate/register` | POST | Registrazione affiliate |
| `/api/affiliate/links` | GET/POST | Gestione link |
| `/api/affiliate/track` | POST | Tracking affiliato |
| `/api/affiliate/stats` | GET | Statistiche affiliate |
| `/api/affiliate/commissions` | GET | Commissioni |
| `/api/affiliate/payouts` | GET/POST | Pagamenti |
| `/api/affiliate/emails/send` | POST | Invio email |

### Beta Testing Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/beta/apply` | POST | Candidatura beta |
| `/api/beta/testers` | GET | Lista beta testers |
| `/api/beta/testers/[id]` | GET/PUT | Dettaglio tester |
| `/api/beta/feedback` | GET/POST | Feedback beta |
| `/api/beta/feedback/[id]` | GET | Dettaglio feedback |
| `/api/beta/stats` | GET | Statistiche beta |

### Altri Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/radar/snapshot` | GET | Snapshot radar |
| `/api/radar/history` | GET | Storico radar |
| `/api/radar/comparison` | GET | Confronto radar |
| `/api/analytics/behavioral` | POST | Analytics comportamentale |
| `/api/awareness/calculate` | POST | Calcola livello awareness |
| `/api/coach/feedback` | POST | Feedback coach |
| `/api/recommendations` | GET | Raccomandazioni |
| `/api/cycles` | GET | Cicli d'azione |
| `/api/milestones` | GET | Traguardi |

### Cron Endpoints
| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/cron/send-challenge-emails` | GET | Invio email sfide (8:00 UTC) |
| `/api/cron/challenge-emails` | GET | Email sfide legacy |
| `/api/cron/affiliate-emails` | GET | Email affiliati |
| `/api/cron/monitoring` | GET | Monitoraggio cron |

---

## 3. COMPONENTI (~50)

### AI Coach Components
| File | Descrizione |
|------|-------------|
| `ai-coach/ChatWidget.tsx` | Widget chat principale |
| `ai-coach/ConversationHistory.tsx` | Storico conversazioni |
| `ai-coach/ExportButton.tsx` | Pulsante esportazione |

### Assessment Components
| File | Descrizione |
|------|-------------|
| `assessment/QuestionCard.tsx` | Carta domanda base |
| `assessment/RisolutoreQuestionCard.tsx` | Carta domanda risolutore |
| `assessment/MicrofelicitaQuestionCard.tsx` | Carta domanda microfelicità |
| `assessment/ProgressBar.tsx` | Barra progresso |
| `assessment/ResultsRadar.tsx` | Radar risultati |
| `assessment/ExportAssessmentButton.tsx` | Esporta assessment |

### Dashboard Components
| File | Descrizione |
|------|-------------|
| `dashboard/WelcomeHero.tsx` | Hero benvenuto |
| `dashboard/QuickStats.tsx` | Statistiche veloci |
| `dashboard/AssessmentCard.tsx` | Carta assessment |
| `dashboard/AssessmentsOverview.tsx` | Overview assessment |
| `dashboard/ExercisesCard.tsx` | Carta esercizi |
| `dashboard/AchievementCard.tsx` | Carta achievement |
| `dashboard/RecentActivity.tsx` | Attività recente |
| `dashboard/RadarComparison.tsx` | Confronto radar |
| `dashboard/MiniRadarPreview.tsx` | Preview radar mini |
| `dashboard/MilestonesWidget.tsx` | Widget traguardi |
| `dashboard/RecommendedExercises.tsx` | Esercizi consigliati |
| `dashboard/TrialBanner.tsx` | Banner trial |
| `dashboard/PathDashboard.tsx` | Dashboard percorso |
| `dashboard/PathwaysOverview.tsx` | Overview percorsi |
| `dashboard/DashboardByPath.tsx` | Dashboard per percorso |

### Challenge Components
| File | Descrizione |
|------|-------------|
| `challenge/DiscoveryConfirmation.tsx` | Conferma scoperta (quiz A/B/C) |
| `challenge/MiniProfileChart.tsx` | Chart profilo mini |
| `challenge/VideoPlaceholder.tsx` | Placeholder video |

### Exercises Components
| File | Descrizione |
|------|-------------|
| `exercises/ExercisesList.tsx` | Lista esercizi |
| `exercises/ExercisesHeader.tsx` | Header esercizi |
| `exercises/ExerciseDetail.tsx` | Dettaglio esercizio |
| `exercises/ExerciseCompletionCard.tsx` | Carta completamento |
| `exercises/LockedExerciseView.tsx` | Vista esercizio bloccato |

### Chart Components
| File | Descrizione |
|------|-------------|
| `charts/LeadershipRadarChart.tsx` | Radar chart leadership (Recharts) |

### Layout Components
| File | Descrizione |
|------|-------------|
| `layout/DashboardHeader.tsx` | Header dashboard |
| `layout/Sidebar.tsx` | Sidebar navigazione |

### Libro Components
| File | Descrizione |
|------|-------------|
| `libro/BumpOfferModal.tsx` | Modal bump offer |

### Behavioral Components
| File | Descrizione |
|------|-------------|
| `behavioral/ExitIntentPopup.tsx` | Popup exit intent |
| `behavioral/EngagementBadge.tsx` | Badge engagement |
| `behavioral/ReturnVisitorBanner.tsx` | Banner visitatori di ritorno |

### Milestones Components
| File | Descrizione |
|------|-------------|
| `milestones/MilestoneCard.tsx` | Carta traguardo |
| `milestones/MilestonesList.tsx` | Lista traguardi |
| `milestones/MilestoneToast.tsx` | Toast notifica traguardo |

### UI Components
| File | Descrizione |
|------|-------------|
| `ui/Breadcrumb.tsx` | Breadcrumb navigazione |
| `ui/FeedbackWidget.tsx` | Widget feedback |

### Admin Components
| File | Descrizione |
|------|-------------|
| `admin/TwelveFactorsGrid.tsx` | Griglia 12 fattori |

### SEO Components
| File | Descrizione |
|------|-------------|
| `seo/JsonLd.tsx` | Schema.org JSON-LD |

---

## 4. LIBRERIE E SERVIZI (src/lib/)

### Supabase
| File | Descrizione |
|------|-------------|
| `supabase/client.ts` | Client Supabase lato client |
| `supabase/server.ts` | Client Supabase lato server |
| `supabase/middleware.ts` | Middleware autenticazione |
| `supabase/assessment.ts` | Query assessment |
| `supabase/exercises.ts` | Query esercizi |
| `supabase/microfelicita.ts` | Query microfelicità |
| `supabase/risolutore.ts` | Query risolutore |

### AI Coach
| File | Descrizione |
|------|-------------|
| `ai-coach/types.ts` | Tipi dati AI coach |
| `ai-coach/system-prompt.ts` | System prompt Claude (Fernando) |
| `ai-coach/user-memory.ts` | Memoria utente personalizzazione |
| `ai-coach/pattern-recognition.ts` | Riconoscimento pattern |
| `ai-coach/pattern-autocorrection.ts` | Autocorrezione pattern |
| `ai-coach/implicit-signals.ts` | Segnali impliciti utente |
| `ai-coach/daily-metrics.ts` | Metriche giornaliere |
| `ai-coach/weekly-report.ts` | Report settimanale |
| `ai-coach/email-report.ts` | Email report |
| `ai-coach/exercise-suggestions.ts` | Suggerimenti esercizi |
| `ai-coach/adaptive-path.ts` | Percorso adattivo |

### Auth
| File | Descrizione |
|------|-------------|
| `auth/permissions.ts` | Permessi utenti |
| `auth/authorization.ts` | Autorizzazione |
| `auth/feature-gates.ts` | Feature flag |

### Admin
| File | Descrizione |
|------|-------------|
| `admin/verify-admin.ts` | Verifica permessi admin |

### Awareness
| File | Descrizione |
|------|-------------|
| `awareness/types.ts` | Tipi awareness |
| `awareness/index.ts` | Export barrel |
| `awareness/calculate-level.ts` | Calcola livello awareness |
| `awareness/update-level.ts` | Aggiorna livello |
| `awareness/indicators.ts` | Indicatori awareness |

### Challenge
| File | Descrizione |
|------|-------------|
| `challenge/discovery-data.ts` | 63 domande discovery (A/B/C) |
| `challenge/day-content.ts` | Contenuto 7 giorni (×3 challenge) |

### Email
| File | Descrizione |
|------|-------------|
| `email/challenge-emails.ts` | Invio email sfide |
| `email/challenge-day-templates.ts` | 21 template email giornalieri |
| `email/subscription-emails.ts` | Email sottoscrizione |
| `email/affiliate-emails.ts` | Email affiliate |
| `email/send-book-email.ts` | Invio email libro |

### Services
| File | Descrizione |
|------|-------------|
| `services/pattern-detection.ts` | Rilevamento pattern feedback |
| `services/correction-suggestion.ts` | Suggerimenti correzione AI |
| `services/exercise-recommendation.ts` | Raccomandazioni esercizi |
| `services/graduality-check.ts` | Verifica gradualità contenuti |
| `services/parole-check.ts` | Verifica parole chiave |
| `services/concretezza-check.ts` | Verifica concretezza |

### Analytics
| File | Descrizione |
|------|-------------|
| `analytics/behavioral.ts` | Analytics comportamentale |

### Monitoring
| File | Descrizione |
|------|-------------|
| `monitoring/scheduler.ts` | Scheduler cron jobs |
| `monitoring/metrics-12f.ts` | Metriche 12 fattori |
| `monitoring/thresholds.ts` | Soglie monitoraggio |

### Stripe
| File | Descrizione |
|------|-------------|
| `stripe/process-pending-purchases.ts` | Elabora acquisti pendenti |

### Milestones
| File | Descrizione |
|------|-------------|
| `milestones/types.ts` | Tipi traguardi |
| `milestones/index.ts` | Export barrel |
| `milestones/service.ts` | Servizio traguardi |

### Core Libraries
| File | Descrizione |
|------|-------------|
| `rag.ts` | RAG retrieval (OpenAI embeddings + pgvector) |
| `error-alerts.ts` | Sistema alert errori (email) |
| `pathways.ts` | Percorsi di apprendimento |
| `challenges.ts` | Gestione sfide |
| `action-cycles.ts` | Cicli d'azione |
| `consultant-certification.ts` | Certificazione consulente |
| `assessment-scoring.ts` | Calcolo punteggi assessment |
| `assessment-access.ts` | Accesso assessment |
| `microfelicita-scoring.ts` | Scoring microfelicità |
| `risolutore-scoring.ts` | Scoring risolutore |
| `schema-org.ts` | Schema.org markup SEO |
| `utils/index.ts` | Funzioni utility |

### Types
| File | Descrizione |
|------|-------------|
| `types/exercises.ts` | Definizioni tipi esercizi |
| `types/roles.ts` | Tipi ruoli e subscription tiers |

---

## 5. CUSTOM HOOKS (src/hooks/)

| File | Descrizione |
|------|-------------|
| `useAuthorization.tsx` | Hook gestione permessi utente |
| `useBehavioralTracking.ts` | Hook tracking comportamentale |
| `useDiscoveryProgress.ts` | Hook progresso sfide discovery |

---

## 6. DATA STATICI (src/data/)

| File | Descrizione |
|------|-------------|
| `libri.ts` | Catalogo 3 libri (Leadership, Ostacoli, Microfelicità) |

---

## 7. RIEPILOGO STATISTICHE

| Categoria | Quantità |
|-----------|----------|
| **Pagine** | ~80 |
| **API Endpoints** | ~100 |
| **Componenti React** | ~50 |
| **Moduli lib** | ~70 |
| **Custom Hooks** | 3 |
| **File dati** | 1 |
| **Definizioni tipi** | 2 |

---

## 8. ARCHITETTURA PRINCIPALE

```
src/
├── app/                    # Next.js App Router
│   ├── (pages)/           # Route pages
│   ├── api/               # API endpoints
│   └── layout.tsx         # Root layout
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities e servizi
│   ├── supabase/         # Database client
│   ├── ai-coach/         # AI Coach system
│   ├── auth/             # Authentication
│   ├── email/            # Email templates
│   ├── services/         # Business logic
│   └── types/            # TypeScript types
└── data/                  # Static data
```

---

## 9. INTEGRAZIONI ESTERNE

| Servizio | Utilizzo |
|----------|----------|
| **Supabase** | Database PostgreSQL + Auth + RLS |
| **Anthropic Claude** | AI Coach Fernando |
| **OpenAI** | Embeddings per RAG |
| **Stripe** | Pagamenti subscription + one-time |
| **Resend** | Email automation |
| **Vercel** | Hosting + Cron jobs |
