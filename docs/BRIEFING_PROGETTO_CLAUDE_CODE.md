# VITAEOLOGY - Briefing Progetto per Claude Code

> Ultimo aggiornamento: 5 Febbraio 2026
> Proprietario: Fernando Fiorenza / HZ Holding s.r.l. (Milano)

---

## 1. COS'È VITAEOLOGY

Vitaeology è una piattaforma web di sviluppo leadership per **imprenditori e manager italiani** (35-55 anni). Non è un corso tradizionale: l'utente **ha già le capacità** e la piattaforma lo aiuta a **riconoscerle e attivarle**. Questa filosofia si chiama **Principio Validante** e deve permeare tutto il codice, l'UI e i copy.

**Differenza chiave rispetto ai competitor:** non si insegna nulla di nuovo, si attivano capacità già possedute. Il linguaggio non è mai da "deficit" ("ti manca", "devi imparare") ma sempre da "scoperta" ("riconosci", "attiva", "il leader che già sei").

---

## 2. STACK TECNICO

| Componente | Tecnologia |
|---|---|
| Framework | Next.js 14.x (App Router) |
| Auth + DB | Supabase (PostgreSQL + RLS) |
| Pagamenti | Stripe (checkout + portal + webhook) |
| Email | Resend |
| AI Coach | Claude API + RAG (966 chunks da 3 libri LaTeX) |
| PDF Protection | pdf-lib (watermark) + jose (JWT signed URLs) |
| Video | HeyGen (produzione esterna, embed nelle challenge) |
| Session Recording | Microsoft Clarity (ID: v4dg8tygen) |
| CAPTCHA | Cloudflare Turnstile |
| Hosting | Vercel |
| Font | Stoke (titoli), Inter (body) |

### Script principali

```bash
npm run dev          # Server sviluppo
npm run build        # Build produzione
npm run update-rag   # Aggiorna chunks RAG da LaTeX
npm run test:critical # Test critici pre-deploy
```

---

## 3. I TRE PERCORSI (CHALLENGE)

Ogni percorso ha un colore, una challenge gratuita di 7 giorni, un assessment, un libro e un set di esercizi.

| Percorso | Colore | HEX | URL Challenge | Focus |
|---|---|---|---|---|
| **Leadership Autentica** | Oro/Ambra | #F4B942 | `/challenge/leadership` | Stile di leadership personale |
| **Oltre gli Ostacoli** | Smeraldo | #10B981 | `/challenge/ostacoli` | Trasformare problemi in opportunità (Metodo 3 Filtri) |
| **Microfelicità** | Viola | #8B5CF6 | `/challenge/microfelicita` | Benessere quotidiano (Metodo RADAR) |

### Flusso Challenge 7 Giorni

```
/challenge/[type]              → Landing page pubblica con form (solo email + nome opzionale)
    ↓ POST /api/challenge/subscribe
    ↓ Welcome email (Resend)
    ↓
/challenge/[type]/day/[1-7]    → Contenuto giornaliero (auth required)
    ↓ POST /api/challenge/complete-day
    ↓ Email giorno successivo (cron)
    ↓
/challenge/[type]/complete     → Pagina completamento
    ↓ Sblocca assessment corrispondente
```

Ogni challenge include 7 email giornaliere con contenuto + esercizio pratico + quiz discovery A/B/C (3 domande/giorno = 21 totali).

---

## 4. PALETTE COLORI BRAND

| Nome | HEX | Uso |
|---|---|---|
| Blu Petrolio | #0A2540 | Sfondo principale, testi |
| Oro | #F4B942 | CTA, accenti, highlight |
| Bianco | #FFFFFF | Background, contrasto |
| Grigio chiaro | #F5F5F5 | Sfondi secondari |
| Grigio testo | #4A5568 | Body text |
| Verde successo | #48BB78 | Conferme, check |
| Rosso errore | #E53E3E | Alert, errori |

**CTA standard:** Oro (#F4B942) su sfondo Blu (#0A2540).

---

## 5. ARCHITETTURA PAGINE

### Pagine pubbliche

| Route | Tipo | Descrizione |
|---|---|---|
| `/` | Server | Homepage |
| `/challenge/leadership` | Client | Landing challenge Leadership |
| `/challenge/ostacoli` | Client | Landing challenge Ostacoli |
| `/challenge/microfelicita` | Client | Landing challenge Microfelicità |
| `/assessment/leadership` | Client | Assessment Leadership (72 domande) |
| `/assessment/risolutore` | Client | Assessment Risolutore (47 domande) |
| `/assessment/microfelicita` | Client | Assessment Microfelicità (47 domande) |
| `/assessment/*/results` | Client | Risultati assessment (radar chart) |
| `/libro/[slug]` | Server | Landing libro (leadership, risolutore, microfelicita) |
| `/libro/[slug]/grazie` | Server | Thank you post-acquisto |
| `/pricing` | Server | Prezzi e piani |
| `/affiliate` | Client | Landing affiliati |
| `/beta` | Client | Landing beta tester |
| `/contact` | Client | Contatti |
| `/privacy` | Server | Privacy policy |
| `/terms` | Server | Termini |

### Pagine autenticazione

| Route | Tipo | Descrizione |
|---|---|---|
| `/auth/login` | Client | Login |
| `/auth/signup` | Client | Registrazione |
| `/auth/forgot-password` | Client | Recupero password |
| `/auth/reset-password` | Client | Reset password |
| `/auth/verify` | Client | Verifica email |

### Pagine autenticate

| Route | Tipo | Descrizione |
|---|---|---|
| `/dashboard` | Client | Dashboard utente (redirect a percorso) |
| `/dashboard/leadership` | Client | Dashboard percorso Leadership |
| `/dashboard/ostacoli` | Client | Dashboard percorso Ostacoli |
| `/dashboard/microfelicita` | Client | Dashboard percorso Microfelicità |
| `/dashboard/challenges` | Client | Vista challenge nella dashboard |
| `/challenge/[type]/day/[day]` | Client | Contenuto giornaliero challenge |
| `/challenge/[type]/complete` | Client | Completamento challenge |
| `/challenge/[type]/grazie` | Client | Thank you post-challenge |
| `/exercises` | Server | Lista esercizi |
| `/exercises/[exerciseId]` | Server | Singolo esercizio |
| `/profile` | Client | Profilo utente |
| `/progress` | Client | Progresso percorso |
| `/results` | Client | Risultati assessment |
| `/subscription` | Client | Gestione abbonamento |
| `/subscription/success` | Client | Successo abbonamento |
| `/affiliate/dashboard` | Client | Dashboard affiliato |
| `/affiliate/links` | Client | Gestione link affiliato |
| `/affiliate/termini` | Client | Termini affiliazione |

### Pagine admin

| Route | Descrizione |
|---|---|
| `/admin` | Dashboard amministrazione |
| `/admin/ab-testing` | Gestione A/B test landing |
| `/admin/affiliates` | Gestione affiliati |
| `/admin/ai-coach` | Stats AI Coach |
| `/admin/analytics` | Analytics generali |
| `/admin/api-costs` | Costi API Claude/OpenAI |
| `/admin/awareness` | Awareness level tracking |
| `/admin/behavioral` | Tracking comportamentale |
| `/admin/beta-testing` | Gestione beta tester |
| `/admin/challenges` | Gestione challenge |
| `/admin/corrections` | Correzioni AI Coach |
| `/admin/feedback-patterns` | Pattern feedback |
| `/admin/funnel` | Funnel analysis |
| `/admin/health` | System health check |
| `/admin/monitoring` | Monitoraggio sistema |
| `/admin/performance` | Performance sistema |
| `/admin/quality-audit` | Audit qualità risposte AI (7 score: 4 principi + 3 comprensione) |
| `/admin/users` | Gestione utenti e ruoli |

---

## 6. API ENDPOINTS (95+)

### Challenge

| Endpoint | Metodi | Descrizione |
|---|---|---|
| `/api/challenge/subscribe` | POST | Iscrizione challenge |
| `/api/challenge/complete-day` | POST | Completa giorno |
| `/api/challenge/feedback` | GET, POST | Feedback challenge |
| `/api/challenge/mini-profile` | POST | Mini-profile da discovery |
| `/api/challenge/beta-feedback` | POST | Feedback beta tester |
| `/og/challenge/[type]` | GET | Immagine OG dinamica |

### Assessment

| Endpoint | Metodi | Descrizione |
|---|---|---|
| `/api/assessment/questions` | GET | Domande Leadership |
| `/api/assessment/answer` | POST | Salva risposta |
| `/api/assessment/complete` | POST | Completa assessment |
| `/api/assessment/results/[id]` | GET | Risultati |
| `/api/assessment/session` | GET, DELETE | Gestione sessione |
| `/api/assessment/export` | GET, POST | Export risultati |
| `/api/assessment/microfelicita/*` | vari | Stessa struttura per Microfelicità |
| `/api/assessment/risolutore/*` | vari | Stessa struttura per Risolutore |

### AI Coach

| Endpoint | Metodi | Descrizione |
|---|---|---|
| `/api/ai-coach` | POST | Chat principale (Claude API + RAG) |
| `/api/ai-coach/conversations` | GET, DELETE | Gestione conversazioni |
| `/api/ai-coach/history` | GET | Storico |
| `/api/ai-coach/feedback` | POST | Feedback su risposte |
| `/api/ai-coach/edit` | POST | Modifica messaggio |
| `/api/ai-coach/reformulate` | POST | Riformulazione |
| `/api/ai-coach/signals` | POST | Segnali impliciti utente |
| `/api/ai-coach/export` | GET | Export conversazioni |
| `/api/ai-coach/cron/*` | GET, POST | Metriche giornaliere, report settimanali |

### Affiliati

| Endpoint | Metodi | Descrizione |
|---|---|---|
| `/api/affiliate/register` | POST | Richiesta affiliazione |
| `/api/affiliate/route` | GET | Dati dashboard |
| `/api/affiliate/links` | GET, POST | Gestione link |
| `/api/affiliate/stats` | GET | Statistiche |
| `/api/affiliate/payouts` | POST | Richiesta pagamento |
| `/api/affiliate/track` | POST | Tracking click |
| `/api/affiliate/commissions` | POST | Calcolo commissioni |
| `/api/affiliate/emails/send` | POST | Invio email affiliati |

### Admin

| Endpoint | Metodi | Descrizione |
|---|---|---|
| `/api/admin/quality-audit` | GET, POST | Audit qualità (7 score + analisi automatica) |
| `/api/admin/corrections` | GET, POST, DELETE, PATCH | CRUD correzioni risposte |
| `/api/admin/users` | GET | Lista utenti |
| `/api/admin/users/[userId]/role` | PUT, DELETE | Modifica ruolo |
| `/api/admin/analytics` | GET | Analytics aggregati |
| `/api/admin/performance` | GET | Metriche performance |
| `/api/admin/behavioral-*` | GET | Analytics comportamentali |
| `/api/admin/ai-coach/*` | vari | Dashboard, pattern, report AI |
| `/api/admin/api-costs` | GET | Costi API |
| `/api/admin/feedback-patterns` | GET, PATCH | Pattern feedback |

### Pagamenti e Libri

| Endpoint | Metodi | Descrizione |
|---|---|---|
| `/api/stripe/checkout` | POST | Checkout Stripe |
| `/api/stripe/portal` | POST | Portal gestione |
| `/api/stripe/webhook` | POST | Webhook Stripe |
| `/api/libro/checkout` | POST | Checkout acquisto libro |
| `/api/libro/download` | GET | Download PDF protetto (token o auth) |
| `/api/libro/attiva` | POST | Attivazione libro da QR code |
| `/api/libro/bump-checkout` | POST | Upsell checkout (Leader bundle) |

### Cron Jobs

| Endpoint | Descrizione |
|---|---|
| `/api/cron/challenge-emails` | Invio email challenge giornaliere |
| `/api/cron/affiliate-emails` | Invio email affiliati |
| `/api/cron/monitoring` | Health check sistema |
| `/api/cron/beta-approval` | Approvazione automatica beta tester |
| `/api/cron/beta-premium-expiry` | Scadenza premium beta |

### Beta Testing

| Endpoint | Metodi | Descrizione |
|---|---|---|
| `/api/beta/apply` | POST | Candidatura beta tester |
| `/api/beta/testers` | GET | Lista beta tester |
| `/api/beta/feedback` | POST | Feedback beta tester |
| `/api/beta/stats` | GET | Statistiche beta |

### Exercises e Progress

| Endpoint | Metodi | Descrizione |
|---|---|---|
| `/api/exercises/recommended` | GET | Esercizi raccomandati |
| `/api/exercises/complete` | POST | Completa esercizio |
| `/api/exercises/completion-stats` | GET | Statistiche completamento |
| `/api/recommendations` | GET | Raccomandazioni personalizzate |

### Radar e Tracking

| Endpoint | Metodi | Descrizione |
|---|---|---|
| `/api/radar/history` | GET | Storico radar chart |
| `/api/radar/snapshot` | POST | Snapshot radar |
| `/api/radar/comparison` | GET | Confronto radar nel tempo |
| `/api/cycles` | GET | Action cycles |
| `/api/milestones` | GET | Milestone tracking |
| `/api/awareness/calculate` | GET, POST | Calcolo awareness level |

### Auth

| Endpoint | Descrizione |
|---|---|
| `/api/auth/signup` | Registrazione |
| `/api/auth/verify-otp` | Verifica OTP |
| `/auth/callback` | Callback OAuth Supabase |

---

## 7. COMPONENTI PRINCIPALI (50+)

### Dashboard utente
`WelcomeHero`, `QuickStats`, `AssessmentsOverview`, `AssessmentCard`, `MiniRadarPreview`, `RecentActivity`, `RecommendedExercises`, `ExercisesCard`, `TrialBanner`, `PathDashboard`, `DashboardByPath`, `PathwaysOverview`, `AchievementCard`

### AI Coach
`ChatWidget`, `ConversationHistory`, `ExportButton`

### Assessment
`QuestionCard`, `MicrofelicitaQuestionCard`, `RisolutoreQuestionCard`, `ProgressBar`, `ResultsRadar`, `ExportAssessmentButton`

### Exercises
`ExerciseDetail`, `ExercisesHeader`, `ExercisesList`, `ExerciseCompletionCard`, `LockedExerciseView`

### Milestones e Progress
`MilestoneCard`, `MilestonesList`, `MilestonesWidget`, `MilestoneToast`

### Challenge
`DiscoveryConfirmation`, `MiniProfileChart`, `VideoPlaceholder`, `LandingVideoPlayer`

### Behavioral
`EngagementBadge`, `ExitIntentPopup`, `ReturnVisitorBanner`

### Admin
`TwelveFactorsGrid`

### Layout
`DashboardHeader`, `Sidebar`, `Breadcrumb`

### Charts
`LeadershipRadarChart`, `RadarComparison`

### Libro
`DownloadBookButton`

### Tracking e Utility
`ConversionTracker`, `FeedbackWidget`, `JsonLd`, `Turnstile`

---

## 8. LIBRERIE E SERVIZI INTERNI (60+)

### AI Coach (lib/ai-coach/)
`system-prompt`, `user-memory`, `pattern-recognition`, `pattern-autocorrection`, `implicit-signals`, `daily-metrics`, `weekly-report`, `email-report`, `types`, `exercise-suggestions`, `adaptive-path`

### Servizi qualità (lib/services/)

Il sistema analizza automaticamente ogni risposta dell'AI Coach per 3 aspetti della "Comprensione":

| Servizio | Check | Cosa misura |
|---|---|---|
| `parole-check.ts` | PAROLE | Termini tecnici spiegati, acronimi espansi, anglicismi evitati |
| `concretezza-check.ts` | CONCRETEZZA | Esempi concreti, metafore, scenari reali |
| `graduality-check.ts` | GRADUALITÀ | Sequenza logica, concetti introdotti prima di usarli |
| `correction-suggestion.ts` | - | Suggerimenti di correzione |
| `exercise-recommendation.ts` | - | Raccomandazioni esercizi personalizzate |
| `pattern-detection.ts` | - | Rilevamento pattern feedback |

### Libro (lib/libro/)
`download-token.ts` (JWT generation/verification), `watermark-pdf.ts` (PDF watermarking)

### Scoring
`assessment-scoring.ts`, `microfelicita-scoring.ts`, `risolutore-scoring.ts`

### Auth e permessi (lib/auth/)
`authorization.ts`, `permissions.ts`, `feature-gates.ts`

### Admin (lib/admin/)
`verify-admin.ts`

### Supabase (lib/supabase/)
`client.ts`, `server.ts`, `middleware.ts`, `assessment.ts`, `exercises.ts`, `microfelicita.ts`, `risolutore.ts`

### Email (lib/email/)
`challenge-day-templates.ts`, `challenge-emails.ts`, `send-book-email.ts`, `affiliate-emails.ts`, `subscription-emails.ts`, `beta-tester-emails.ts`

### Milestones e Progress (lib/milestones/)
Sistema di milestone tracking per gamification del percorso

### Awareness (lib/awareness/)
Sistema di calcolo awareness level basato su progress

### Monitoring (lib/monitoring/)
Sistema di monitoraggio e health check

### Types (lib/types/)
`roles.ts` (RBAC + subscription tiers), `exercises.ts`

### Challenge (lib/challenge/)
`day-content.ts`, `discovery-data.ts` (63 domande discovery)

### Analytics (lib/analytics/)
`behavioral.ts`

### Altro
`rag.ts` (966 chunks da 3 libri), `action-cycles.ts`, `challenges.ts`, `pathways.ts`, `consultant-certification.ts`, `schema-org.ts` (SEO), `rate-limiter.ts`, `error-alerts.ts`, `system-logger.ts`, `security.ts`, `turnstile.ts`

---

## 9. VALUE LADDER (8 LIVELLI)

La strategia commerciale segue il modello Russell Brunson:

| Livello | Nome | Prezzo | Include |
|---|---|---|---|
| L1 | Lead Magnet | €0 | Challenge gratuita 7 giorni + sequenza email |
| L2 | Libro | €24,90 fisico / €9,90 ebook | Libro + QR code → accesso Explorer gratuito |
| L3 | Core (Leader) | €149/anno | 1 percorso completo, 52 esercizi, AI Coach illimitato, Q&A mensili |
| L4 | Premium (Mentor) | €490/anno | 3 percorsi + 2 sessioni 1:1 con Fernando |
| L5 | Coaching 1:1 | €997-1.997 | 3-6 sessioni individuali (60 min) |
| L6 | Mastermind | €2.997/anno | Gruppo max 24, 2 live/mese, ritiro annuale |
| L7A | Consulente Tecnico | €2.997 una tantum | Certifica altri, facilita workshop |
| L7B | Consulente Commerciale | €1.497 una tantum | Vende, commissioni 25-45% a vita |
| L8 | Partner Elite | €9.997/anno | Mini-franchising, esclusività territoriale |

---

## 10. CUSTOMER JOURNEY

```
ADS/Organic → Landing Challenge → Iscrizione (Lead)
    ↓
Challenge 7 giorni (email + contenuto quotidiano)
    ↓
Completamento → Assessment sbloccato
    ↓
Assessment (radar chart risultati)
    ↓
Offerta libro correlato (€9,90-24,90)
    ↓
Upgrade a Leader (€149/anno) → Dashboard, esercizi, AI Coach
    ↓
Upgrade a Mentor (€490/anno) → 3 percorsi + sessioni 1:1
    ↓
High-ticket / Affiliato / Consulente
```

### Touchpoint tecnici

| Fase | Pagine | Trigger |
|---|---|---|
| Scoperta | Homepage, Landing Challenge | Form iscrizione |
| Lead | `/challenge/[type]/day/[1-7]` | Completamento 7 giorni |
| Conversione | `/pricing`, Stripe checkout | Pagamento |
| Cliente | `/dashboard`, `/exercises`, AI Coach | Uso continuativo |
| Evangelista | `/affiliate`, `/affiliate/dashboard` | Condivisione link |

---

## 11. KPI TARGET

| Passaggio | Target |
|---|---|
| Ads → Landing (CTR) | >1.5% |
| Landing → Lead (Conversione) | >25% |
| Lead → Libro (Acquisto) | >5% |
| Free → Core (Upgrade) | 20-25% |
| Core → Premium | 15% |
| Core → Referral attivo | 10% |
| Churn annuale | <30% |
| LTV/CAC | >5x |

---

## 12. PRINCIPI FILOSOFICI (DA RISPETTARE NEL CODICE)

### 12.1 Principio Validante
L'utente HA GIÀ le capacità. Non deve acquisirle, deve RICONOSCERLE.

**Nel codice/UI:**
- SÌ: "Riconoscere", "Attivare", "Scoprire", "Il leader che già sei"
- NO: "Mancanza", "Deficit", "Problema", "Devi imparare", "Ti manca"
- Mai claim non verificabili: "Garantito", "Segreto", "100% successo"
- Mai americanismi motivazionali: "Spacca!", "Sei un campione!"

### 12.2 Framework Comprensione (ARC)

Ogni contenuto (incluse risposte AI Coach) deve superare 3 barriere:

1. **PAROLE:** Ogni termine non comune deve essere spiegato o sostituito con equivalente familiare
2. **CONCRETEZZA:** Ogni concetto astratto deve avere un paragone con realtà conoscibili
3. **GRADUALITÀ:** Progressione dal semplice al complesso, un passo alla volta

### 12.3 ESSERE / FARE / AVERE

Sono condizioni di esistenza. L'enfasi va sempre su AVERE (possedere capacità) piuttosto che NON AVERE. La libertà sta nella possibilità stessa di AVERE o NON AVERE, senza giudizio sull'identità (ESSERE) o sul comportamento (FARE).

### 12.4 Framework 4 Prodotti / 12 Fattori

Ogni sistema produttivo ha 4 prodotti, ciascuno governato da 3 fattori:

| Prodotto | Significato | Esempio App |
|---|---|---|
| P1: Istituzione | Ciò che produce | Infrastruttura, setup, deploy |
| P2: Prodotto Generato | Output prodotto | Pagine, risposte AI, assessment |
| P3: Riparazione | Correzione del produttore | Bug fix, ottimizzazione, monitoring |
| P4: Correzione Output | Correzione dell'output | A/B test, quality audit, feedback |

Fattori per ciascun prodotto:
- **Quantità:** Volume, numero, frequenza
- **Qualità:** Precisione, efficacia, perfezione
- **Viabilità:** Sostenibilità, longevità, scalabilità

---

## 13. LANDING PAGE - STRUTTURA STANDARD

### Above the fold (critico per conversione)
- Video Hero (autoplay muted)
- Headline = Hook del Video Hero = Hook ADS (**message match**)
- Subheadline = Beneficio principale
- Form (SOLO email + nome opzionale)
- CTA Button: Oro (#F4B942) su Blu (#0A2540)

### Below the fold
- Cosa ricevi (3-5 bullet)
- Chi è Fernando (credibilità: "50 anni di esperienza imprenditoriale")
- FAQ (3-4 obiezioni comuni)
- CTA secondaria (ripetizione)

### Headlines approvate
- Leadership: **"Il leader che cerchi è già dentro di te"**
- Ostacoli: **"I tuoi ostacoli nascondono la tua prossima svolta"**
- Microfelicità: **"La felicità che cerchi è già nella tua giornata"**

---

## 14. SISTEMA AFFILIATI

| Funzionalità | Endpoint | Stato |
|---|---|---|
| Landing affiliazione | `/affiliate` | ✅ |
| Application form | POST `/api/affiliate/register` | ✅ |
| Dashboard affiliato | `/affiliate/dashboard` | ✅ |
| Gestione link | GET/POST `/api/affiliate/links` | ✅ |
| Tracking click | POST `/api/affiliate/track` | ✅ |
| Statistiche | GET `/api/affiliate/stats` | ✅ |
| Calcolo commissioni | POST `/api/affiliate/commissions` | ✅ |
| Richiesta pagamento | POST `/api/affiliate/payouts` | ✅ |
| Email affiliati | POST `/api/affiliate/emails/send` | ✅ |
| Termini affiliazione | `/affiliate/termini` | ✅ |

Commissioni: 25-45% a vita (variano per livello consulente).

---

## 15. STATISTICHE PROGETTO

| Metrica | Valore |
|---|---|
| Pagine totali | 65+ |
| API endpoints | 95+ |
| Componenti React | 50+ |
| Librerie interne | 60+ |
| RAG chunks | 966 (da 3 libri LaTeX) |
| Check comprensione | 3 (parole, concretezza, gradualità) |
| Assessment questions | Leadership 72, Risolutore 47, Microfelicità 47 |
| Esercizi totali | 126 (12 Fondamentali + 100 Applicazione + 14 Mentor) |

---

## 16. STATO ATTUALE (Febbraio 2026)

### Core Features (Completi)
- **Infrastruttura tecnica:** Completa (Supabase, API routes, admin dashboard 18 pagine)
- **3 Challenge:** Contenuti pronti, email automation, quiz discovery A/B/C
- **3 Assessment:** Funzionanti con radar chart ed export
- **AI Coach Fernando:** Operativo con RAG (966 chunks), quality audit, pattern recognition
- **Pagamenti Stripe:** Checkout + webhook + portal + libri + upsell bump
- **Email Resend:** Challenge emails, affiliate emails, subscription emails, beta emails
- **PDF Protection:** Signed URL (24h) + watermark personalizzato
- **Sistema Affiliati:** Completo con dashboard, tracking, commissioni

### Sistemi Avanzati (Completi)
- **Beta Testing:** Sistema completo con applicazione, approvazione, feedback, stats
- **Milestone System:** Gamification del percorso con achievement tracking
- **Awareness Level:** Calcolo livello di consapevolezza basato su progress
- **Radar Comparison:** Confronto temporale risultati assessment
- **Action Cycles:** Cicli di azione per esercizi

### Analytics & Monitoring
- **Microsoft Clarity:** Session recording attivo
- **Health Monitoring:** Sistema di health check e alerting
- **Behavioral Analytics:** Tracking comportamentale utenti
- **Quality Audit:** Audit automatico risposte AI Coach (7 score)

---

## 17. DOCUMENTI CORRELATI

| Documento | Contenuto |
|---|---|
| `CLAUDE.md` | Istruzioni operative per Claude Code (v3.1) |
| `docs/ARCHITETTURA_DASHBOARD_VITAEOLOGY_DEFINITIVA.md` | Architettura ufficiale (AUTOREVOLE) |
| `docs/AI_COACH_SYSTEM.md` | System prompt Fernando, safety protocols |
| `docs/PROGETTO_VITAEOLOGY_COMPLETO.md` | Documentazione tecnica master |
| `docs/PROGETTO_TESTING_UMANO_BEST_PRACTICE.md` | Best practice beta testing |
| `docs/DATABASE_SCHEMA.md` | Schema DB completo |
| `docs/ESERCIZI_STRUTTURA_COMPLETA.md` | Struttura 126 esercizi |

---

## 18. CHANGELOG BRIEFING

| Data | Versione | Modifiche |
|---|---|---|
| 5 Feb 2026 | 1.1 | Allineato con codebase reale: statistiche aggiornate (65+ pagine, 95+ API, 50+ componenti, 60+ librerie), aggiunti sistemi non documentati (milestones, awareness, beta testing), fix naming (`/assessment/leadership` non "lite"), aggiunta sezione Auth pages |
