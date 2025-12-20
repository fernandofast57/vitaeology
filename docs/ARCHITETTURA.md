# VITAEOLOGY - Documentazione Architettura

> Piattaforma SaaS per lo sviluppo della leadership destinata a imprenditori italiani
> **Stack:** Next.js 14, TypeScript, Supabase, Tailwind CSS, Stripe, Vercel

---

## 🔌 API ROUTES

| Percorso | Metodi | Funzionalità |
|----------|--------|--------------|
| `/api/ai-coach/route.ts` | POST | Chat principale con Fernando AI Coach |
| `/api/ai-coach/history/route.ts` | GET | Storico conversazioni utente |
| `/api/ai-coach/conversations/route.ts` | GET/DELETE | Gestione conversazioni |
| `/api/ai-coach/edit/route.ts` | POST | Modifica messaggio utente |
| `/api/ai-coach/reformulate/route.ts` | POST | Riformulazione risposta AI |
| `/api/ai-coach/feedback/route.ts` | POST | Feedback su risposte AI |
| `/api/ai-coach/export/route.ts` | GET | Export conversazione (PDF/TXT) |
| `/api/ai-coach/signals/route.ts` | GET | Segnali comportamentali utente |
| `/api/ai-coach/cron/daily-metrics/route.ts` | POST | Cron metriche giornaliere |
| `/api/ai-coach/cron/weekly-report/route.ts` | POST | Cron report settimanale |
| `/api/recommendations/route.ts` | GET/POST | Raccomandazioni esercizi personalizzate |
| `/api/coach/feedback/route.ts` | POST | Feedback coach legacy |
| `/api/stripe/checkout/route.ts` | POST | Creazione sessione Stripe Checkout |
| `/api/stripe/webhook/route.ts` | POST | Webhook eventi Stripe |
| `/api/stripe/portal/route.ts` | POST | Portale gestione abbonamento |
| `/api/admin/ai-coach/dashboard/route.ts` | GET | Dashboard metriche AI Coach |
| `/api/admin/ai-coach/patterns/route.ts` | GET | Pattern conversazionali |
| `/api/admin/ai-coach/reports/route.ts` | GET | Report AI Coach |
| `/api/admin/analytics/route.ts` | GET | Analytics generali |
| `/api/admin/api-costs/route.ts` | GET | Costi API Claude |
| `/api/admin/performance/route.ts` | GET | Metriche tempi risposta |
| `/api/admin/users/route.ts` | GET | Lista utenti |
| `/api/admin/users/[userId]/role/route.ts` | PATCH | Modifica ruolo utente |
| `/api/admin/feedback-patterns/route.ts` | GET | Pattern feedback negativi |
| `/api/admin/quality-audit/route.ts` | GET/POST | Audit qualità risposte |
| `/api/admin/corrections/route.ts` | GET/POST | Correzioni prompt AI |

---

## 📄 PAGINE

### Pubbliche
| Percorso | Componente | Descrizione |
|----------|------------|-------------|
| `/page.tsx` | HomePage | Landing page principale |
| `/pricing/page.tsx` | PricingPage | Piani e prezzi |
| `/contact/page.tsx` | ContactPage | Modulo contatto |
| `/terms/page.tsx` | TermsPage | Termini di servizio |
| `/privacy/page.tsx` | PrivacyPage | Privacy policy |

### Autenticazione
| Percorso | Componente | Descrizione |
|----------|------------|-------------|
| `/auth/login/page.tsx` | LoginPage | Login utente |
| `/auth/signup/page.tsx` | SignupPage | Registrazione |
| `/auth/forgot-password/page.tsx` | ForgotPasswordPage | Reset password richiesta |
| `/auth/reset-password/page.tsx` | ResetPasswordPage | Reset password form |

### Dashboard Utente
| Percorso | Componente | Descrizione |
|----------|------------|-------------|
| `/dashboard/page.tsx` | DashboardPage | Dashboard principale con raccomandazioni |
| `/test/page.tsx` | TestPage | Assessment 240 domande |
| `/results/page.tsx` | ResultsPage | Risultati assessment con radar chart |
| `/exercises/page.tsx` | ExercisesPage | Lista 52 esercizi |
| `/exercises/[exerciseId]/page.tsx` | ExerciseDetailPage | Dettaglio singolo esercizio |
| `/progress/page.tsx` | ProgressPage | Progressi utente |
| `/profile/page.tsx` | ProfilePage | Profilo e impostazioni |
| `/subscription/page.tsx` | SubscriptionPage | Gestione abbonamento |

### Admin
| Percorso | Componente | Descrizione |
|----------|------------|-------------|
| `/admin/ai-coach/page.tsx` | AICoachDashboard | Dashboard principale AI Coach |
| `/admin/analytics/page.tsx` | AnalyticsPage | Analytics utilizzo |
| `/admin/api-costs/page.tsx` | ApiCostsPage | Monitoraggio costi API |
| `/admin/performance/page.tsx` | PerformancePage | Tempi risposta P50/P90/P99 |
| `/admin/users/page.tsx` | UsersPage | Gestione utenti e ruoli |
| `/admin/corrections/page.tsx` | CorrectionsPage | Correzioni prompt |
| `/admin/feedback-patterns/page.tsx` | FeedbackPatternsPage | Pattern feedback negativi |
| `/admin/quality-audit/page.tsx` | QualityAuditPage | Audit qualità risposte |

---

## 🧩 COMPONENTI

### Layout
| Percorso | Componente | Descrizione |
|----------|------------|-------------|
| `components/layout/Sidebar.tsx` | Sidebar | Navigazione laterale dashboard |
| `components/layout/DashboardHeader.tsx` | DashboardHeader | Header con user info e menu mobile |

### Dashboard
| Percorso | Componente | Descrizione |
|----------|------------|-------------|
| `components/dashboard/WelcomeHero.tsx` | WelcomeHero | Benvenuto personalizzato |
| `components/dashboard/QuickStats.tsx` | QuickStats | Statistiche rapide |
| `components/dashboard/TrialBanner.tsx` | TrialBanner | Banner trial periodo |
| `components/dashboard/AssessmentCard.tsx` | AssessmentCard | Card stato assessment |
| `components/dashboard/MiniRadarPreview.tsx` | MiniRadarPreview | Anteprima radar 4 pillar |
| `components/dashboard/ExercisesCard.tsx` | ExercisesCard | Card progressi esercizi |
| `components/dashboard/RecommendedExercises.tsx` | RecommendedExercises | Esercizi raccomandati personalizzati |
| `components/dashboard/RecentActivity.tsx` | RecentActivity | Attività recente |

### Esercizi
| Percorso | Componente | Descrizione |
|----------|------------|-------------|
| `components/exercises/ExercisesHeader.tsx` | ExercisesHeader | Header pagina esercizi |
| `components/exercises/ExercisesList.tsx` | ExercisesList | Lista esercizi con filtri |
| `components/exercises/ExerciseDetail.tsx` | ExerciseDetail | Dettaglio esercizio con step |
| `components/exercises/LockedExerciseView.tsx` | LockedExerciseView | Vista esercizio bloccato (premium) |

### AI Coach
| Percorso | Componente | Descrizione |
|----------|------------|-------------|
| `components/ai-coach/ChatWidget.tsx` | ChatWidget | Widget chat Fernando AI Coach |
| `components/ai-coach/ConversationHistory.tsx` | ConversationHistory | Storico conversazioni |
| `components/ai-coach/ExportButton.tsx` | ExportButton | Esporta conversazione |

### Charts
| Percorso | Componente | Descrizione |
|----------|------------|-------------|
| `components/charts/LeadershipRadarChart.tsx` | LeadershipRadarChart | Radar chart 24 caratteristiche |

### UI
| Percorso | Componente | Descrizione |
|----------|------------|-------------|
| `components/ui/Breadcrumb.tsx` | Breadcrumb | Navigazione breadcrumb |

---

## ⚙️ SERVIZI

### AI Coach
| Percorso | Export | Funzionalità |
|----------|--------|--------------|
| `lib/ai-coach/system-prompt.ts` | buildSystemPrompt | Costruisce prompt sistema Fernando |
| `lib/ai-coach/types.ts` | UserContext, Message, etc. | Tipi TypeScript AI Coach |
| `lib/ai-coach/user-memory.ts` | loadUserMemory, saveUserMemory | Memoria conversazionale utente |
| `lib/ai-coach/pattern-recognition.ts` | detectPatterns | Riconoscimento pattern comportamentali |
| `lib/ai-coach/daily-metrics.ts` | generateDailyMetrics | Metriche giornaliere AI |
| `lib/ai-coach/weekly-report.ts` | generateWeeklyReport | Report settimanale |
| `lib/ai-coach/email-report.ts` | sendEmailReport | Invio report via email |

### Servizi Core
| Percorso | Export | Funzionalità |
|----------|--------|--------------|
| `lib/services/exercise-recommendation.ts` | ExerciseRecommendationService | Raccomandazioni esercizi personalizzate |
| `lib/services/pattern-detection.ts` | PatternDetectionService | Rilevamento pattern feedback |
| `lib/services/correction-suggestion.ts` | CorrectionSuggestionService | Suggerimenti correzioni prompt |
| `lib/rag.ts` | queryRAG | Sistema RAG per contesto |

### Supabase
| Percorso | Export | Funzionalità |
|----------|--------|--------------|
| `lib/supabase/client.ts` | createClient | Client Supabase browser |
| `lib/supabase/server.ts` | createServerClient | Client Supabase server |
| `lib/supabase/middleware.ts` | updateSession | Middleware auth |
| `lib/supabase/exercises.ts` | getExercises, getExerciseById | Query esercizi |

### Auth & Admin
| Percorso | Export | Funzionalità |
|----------|--------|--------------|
| `lib/auth/permissions.ts` | checkPermission, PERMISSIONS | Sistema permessi RBAC |
| `lib/admin/verify-admin.ts` | verifyAdmin | Verifica ruolo admin |
| `lib/types/roles.ts` | Role, RoleLevel | Tipi ruoli utente |
| `lib/types/exercises.ts` | Exercise, ExerciseProgress | Tipi esercizi |

### Utilities
| Percorso | Export | Funzionalità |
|----------|--------|--------------|
| `lib/utils/index.ts` | cn, formatDate, etc. | Utility generiche |

---

## 🗄️ DATABASE

### Tabelle Principali
| Tabella | Descrizione |
|---------|-------------|
| `profiles` | Profili utente (extends auth.users) |
| `books` | Libri/corsi disponibili |
| `characteristics` | 24 caratteristiche leadership |
| `assessment_questions` | 240 domande assessment |
| `user_assessments` | Sessioni assessment utenti |
| `user_answers` | Risposte utenti |
| `characteristic_scores` | Punteggi per caratteristica |
| `exercises` | 52 esercizi settimanali |
| `user_exercise_progress` | Progressi esercizi utente |

### Tabelle AI Coach
| Tabella | Descrizione |
|---------|-------------|
| `ai_coach_conversations` | Conversazioni chat |
| `ai_coach_feedback` | Feedback su risposte |
| `ai_coach_feedback_patterns` | Pattern feedback aggregati |
| `ai_coach_pattern_corrections` | Correzioni prompt |
| `ai_coach_daily_metrics` | Metriche giornaliere |
| `ai_coach_usage_logs` | Log utilizzo API |
| `ai_coach_implicit_signals` | Segnali impliciti soddisfazione/insoddisfazione |

#### Tipi Segnali Impliciti (`ai_coach_implicit_signals.signal_type`)
| Tipo | Descrizione | Indica |
|------|-------------|--------|
| `reformulated_question` | Utente riformula la domanda | Insoddisfazione |
| `abandoned_conversation` | Conversazione abbandonata | Insoddisfazione |
| `long_pause_before_reply` | Pausa lunga prima di rispondere | Neutro/Riflessione |
| `immediate_new_question` | Nuova domanda immediata | Insoddisfazione |
| `completed_exercise` | Esercizio completato | Soddisfazione |
| `skipped_exercise` | Esercizio saltato | Disinteresse |
| `returned_to_topic` | Ritorno su argomento | Interesse |
| `escalation_requested` | Richiesta escalation | Insoddisfazione |

### Tabelle Sistema
| Tabella | Descrizione |
|---------|-------------|
| `roles` | Definizione ruoli (user, staff, admin, owner) |
| `role_permissions` | Permessi per ruolo |
| `subscription_plans` | Piani abbonamento |
| `lead_magnets` | Lead magnet downloads |
| `funnel_events` | Eventi funnel marketing |
| `support_tickets` | Ticket supporto |
| `email_sequences` | Sequenze email |
| `email_sends` | Log invii email |

### Tabelle RAG
| Tabella | Descrizione |
|---------|-------------|
| `rag_documents` | Documenti knowledge base |
| `rag_embeddings` | Embeddings vettoriali |

### Funzioni Database
| Funzione | Descrizione |
|----------|-------------|
| `handle_new_user()` | Trigger creazione profilo su signup |
| `match_documents()` | Ricerca semantica RAG |
| `get_feedback_patterns()` | Aggregazione pattern feedback |
| `get_quality_metrics()` | Metriche qualità AI |
| `suggest_corrections()` | Suggerimenti correzioni |

### Viste
| Vista | Descrizione |
|-------|-------------|
| `v_user_assessment_summary` | Riepilogo assessment utente |
| `v_pillar_scores` | Punteggi aggregati per pillar |
| `v_exercise_recommendations` | Esercizi raccomandati |

---

## 🔗 NAVIGAZIONE ADMIN

Route linkate nella sidebar admin:
- `/admin/ai-coach` - Dashboard principale
- `/admin/users` - Gestione utenti

Route accessibili da dashboard:
- `/admin/analytics` - Analytics utilizzo
- `/admin/api-costs` - Monitoraggio costi
- `/admin/performance` - Tempi risposta
- `/admin/corrections` - Correzioni prompt
- `/admin/feedback-patterns` - Pattern feedback
- `/admin/quality-audit` - Audit qualità

---

## ✅ FUNZIONALITÀ COMPLETE

### Assessment
- [x] Assessment 240 domande con salvataggio progressi
- [x] Calcolo punteggi per 24 caratteristiche
- [x] Calcolo punteggi per 4 pillar (ESSERE, SENTIRE, PENSARE, AGIRE)
- [x] Radar chart risultati
- [x] Storico assessment

### Esercizi
- [x] 52 esercizi settimanali
- [x] Sistema raccomandazioni personalizzate basato su assessment
- [x] Filtri per pillar, tipo, difficoltà
- [x] Tracciamento progressi (in_progress, completed)
- [x] Note e valutazione esercizi

### AI Coach (Fernando)
- [x] Chat in tempo reale con Claude API
- [x] Sistema RAG per contesto
- [x] Memoria conversazionale per utente
- [x] Principi validanti (no linguaggio deficit)
- [x] Safety protocols (crisi, suicidio)
- [x] Modifica messaggi utente
- [x] Riformulazione risposte
- [x] Feedback thumbs up/down
- [x] Export conversazioni
- [x] Storico conversazioni

### Admin
- [x] Dashboard metriche AI Coach
- [x] Monitoraggio costi API
- [x] Metriche performance (P50, P90, P99)
- [x] Gestione utenti e ruoli
- [x] Pattern feedback negativi
- [x] Sistema correzioni prompt
- [x] Audit qualità risposte

### Autenticazione & Pagamenti
- [x] Login/Signup con Supabase Auth
- [x] Reset password
- [x] Integrazione Stripe Checkout
- [x] Webhook Stripe per abbonamenti
- [x] Portale gestione abbonamento
- [x] Sistema ruoli (user, staff, admin, owner)

### UI/UX
- [x] Dashboard responsive
- [x] Sidebar navigazione
- [x] Breadcrumb navigazione
- [x] Layout differenziato per stato assessment
- [x] Loading states e skeleton
- [x] Error handling

---

## ⏳ DA IMPLEMENTARE/VERIFICARE

### Funzionalità Core
- [ ] Notifiche push/email per reminder esercizi
- [ ] Gamification (badge, streak, punti)
- [ ] Community/Forum utenti
- [ ] Calendario esercizi integrato

### AI Coach
- [ ] Voice input/output
- [ ] Immagini in chat
- [ ] Suggerimenti proattivi
- [ ] Coaching calls scheduling

### Admin
- [ ] Export report PDF
- [ ] A/B testing prompt
- [ ] Dashboard revenue
- [ ] Gestione contenuti (CMS)

### Integrazioni
- [ ] Calendario Google/Outlook
- [ ] Slack/Teams notifications
- [ ] Zapier/Make webhooks
- [ ] Mobile app (React Native)

### Performance
- [ ] Caching Redis per sessioni
- [ ] CDN per assets statici
- [ ] Image optimization
- [ ] Edge functions per latenza

---

## 📝 NOTE

### Convenzioni Naming
- **Pillar IT→EN:** ESSERE→Vision, SENTIRE→Relations, PENSARE→Action, AGIRE→Adaptation
- **AI Coach:** Nome ufficiale "Fernando" (mai "Marco")
- **Linguaggio:** Sempre validante, mai deficit-based

### Variabili Ambiente Richieste
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Limiti e Soglie
- Assessment: 240 domande
- Esercizi: 52 totali
- Caratteristiche: 24 (6 per pillar)
- Response time target: P90 < 5s
- Costi API alert: > €500/mese

### Struttura Ruoli
| Ruolo | Level | Permessi |
|-------|-------|----------|
| user | 10 | Base utente |
| staff | 30 | View analytics |
| admin | 40 | Full admin access |
| owner | 50 | System owner |
