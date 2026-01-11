# AUDIT FLUSSI UTENTE - VITAEOLOGY

**Data:** 10 Gennaio 2026
**Versione:** 1.0
**Metodologia:** START → CHANGE → STOP

---

## RIEPILOGO ESECUTIVO

| Flusso | Status | Completezza | Blocchi |
|--------|--------|-------------|---------|
| 1. Acquisizione | ✅ OK | 100% | 0 |
| 2. Challenge 7 Giorni | ✅ OK | 100% | 0 |
| 3. Conversione | ✅ OK | 95% | 1 minore |
| 4. Assessment | ✅ OK | 100% | 0 |
| 5. Esercizi | ✅ OK | 100% | 0 |
| 6. AI Coach | ⚠️ PARZIALE | 70% | 2 |

---

## FLUSSO 1: ACQUISIZIONE (Visitatore → Lead)

### Mappa Flusso
```
START: Visitatore arriva su Vitaeology
  ↓
  ├─ Homepage (/)
  │    ├─ CTA "Inizia Gratis" → /auth/signup
  │    └─ CTA Challenge → /challenge/[type]
  │
  ├─ Landing Challenge (/challenge/leadership)
  │    └─ Form iscrizione → /api/challenge/subscribe
  │           ↓
  │    Welcome Email + Day 1
  │
  └─ Landing Libro (/libro/[slug])
       └─ Checkout Stripe → /libro/[slug]/grazie
             ↓
       Email con PDF

CHANGE: Visitatore diventa Lead (email catturata)

STOP: Lead nel sistema con:
  - Email in challenge_subscribers
  - Oppure acquisto libro in Stripe
  - Oppure account creato in profiles
```

### Entry Points
| Entry Point | URL | Status |
|-------------|-----|--------|
| Homepage | `/` | ✅ |
| Challenge Leadership | `/challenge/leadership` | ✅ |
| Challenge Ostacoli | `/challenge/ostacoli` | ✅ |
| Challenge Microfelicità | `/challenge/microfelicita` | ✅ |
| Libro Leadership | `/libro/leadership` | ✅ |
| Libro Risolutore | `/libro/risolutore` | ✅ |
| Libro Microfelicità | `/libro/microfelicita` | ✅ |
| Pricing | `/pricing` | ✅ |

### Valutazione
- **Completezza:** 100%
- **Blocchi:** 0
- **Note:** Tutti gli entry point hanno CTA chiare e flusso completo

---

## FLUSSO 2: CHALLENGE 7 GIORNI (Lead → Utente Consapevole)

### Mappa Flusso
```
START: Lead si iscrive alla Challenge
  ↓
/api/challenge/subscribe
  ↓
Welcome Email (Resend)
  ↓
[Cron 8:00 UTC] /api/cron/challenge-emails
  ↓
Day 1 → Day 7 Emails
  │
  ├─ /challenge/[type]/day/1
  │    └─ 3 Discovery Questions (A/B/C)
  │         ↓
  │    Salvataggio in challenge_discovery_responses
  │
  ├─ ... (Days 2-6)
  │
  └─ /challenge/[type]/day/7
       ↓
CHANGE: Utente completa 7 giorni
  ↓
/challenge/[type]/complete
  │
  ├─ Mini-Profilo (calcolato da 21 risposte)
  ├─ Feedback form
  └─ Next Steps:
       ├─ "Fai il Test" → /assessment/[type]
       ├─ "Esercizi" → /exercises
       └─ "AI Coach" → /dashboard

STOP: Utente con mini-profilo completato
```

### Email Automation
| Email | Trigger | Status |
|-------|---------|--------|
| Welcome | Iscrizione | ✅ |
| Day 1-7 | Cron 8:00 UTC | ✅ |
| Reminder | 48h inattività | ✅ |
| Force Advance | 72h inattività | ✅ |
| Recovery | 3 giorni post | ✅ |

### Handoff alla Fine
| Next Step | Destinazione | Status |
|-----------|--------------|--------|
| Assessment Leadership | `/assessment/lite` | ✅ |
| Assessment Risolutore | `/assessment/risolutore` | ✅ |
| Assessment Microfelicità | `/assessment/microfelicita` | ✅ |
| Esercizi | `/exercises` | ✅ |
| AI Coach | `/dashboard` (ChatWidget) | ✅ |

### Valutazione
- **Completezza:** 100%
- **Blocchi:** 0
- **Note:** Flusso completo con mini-profilo al termine

---

## FLUSSO 3: CONVERSIONE (Utente Gratuito → Abbonato)

### Mappa Flusso
```
START: Utente Explorer (gratuito)
  ↓
Limitazioni:
  - 5 messaggi AI/giorno
  - 10 esercizi accessibili
  - Assessment base
  ↓
Trigger Upgrade:
  ├─ TrialBanner (dashboard) → /pricing
  ├─ Esercizio bloccato → /pricing
  ├─ Libro landing → Checkout bump offer
  │
/pricing
  ├─ Explorer (€0) ← corrente
  ├─ Leader (€149/anno) ← target
  └─ Mentor (€490/anno)
  ↓
CTA "Inizia Ora" → /api/stripe/checkout
  ↓
Stripe Checkout Session
  ↓
Pagamento completato
  ↓
Webhook /api/stripe/webhook
  ↓
CHANGE: profiles.subscription_tier = 'leader'

STOP: Utente Leader con accesso completo
```

### Trigger Points Upgrade
| Trigger | Componente | Link | Status |
|---------|------------|------|--------|
| Trial Banner | `TrialBanner.tsx` | `/pricing` | ✅ |
| Esercizio Locked | `LockedExerciseView.tsx` | `/pricing` | ✅ |
| Lista Esercizi | `ExercisesList.tsx` | `/pricing` | ✅ |
| Header Esercizi | `ExercisesHeader.tsx` | `/pricing` | ✅ |
| Libro Bump Offer | `BumpOfferWrapper.tsx` | Checkout | ✅ |

### Problemi Identificati
| # | Problema | Severità | Soluzione |
|---|----------|----------|-----------|
| 1 | Post-checkout redirect | Minore | Dopo Stripe checkout, l'utente torna a `/subscription` ma potrebbe essere più chiaro tornare a `/dashboard` con messaggio di benvenuto |

### Valutazione
- **Completezza:** 95%
- **Blocchi:** 1 minore
- **Note:** Manca un messaggio di benvenuto post-upgrade chiaro

---

## FLUSSO 4: ASSESSMENT (Abbonato → Utente con Mappa)

### Mappa Flusso
```
START: Utente accede all'Assessment
  ↓
3 Assessment disponibili:
  ├─ Leadership LITE (/assessment/lite) - 72 domande
  ├─ Risolutore (/assessment/risolutore) - 47 domande
  └─ Microfelicità (/assessment/microfelicita) - 48 domande
  ↓
Pagina Assessment:
  - Scala 1-5 per ogni domanda
  - Progress bar
  - Salvataggio progressivo
  ↓
/api/assessment/answer (per ogni risposta)
  ↓
/api/assessment/complete
  ↓
CHANGE: Assessment completato
  ↓
/assessment/[type]/results?id=[assessmentId]
  │
  ├─ Radar Chart 4 Pilastri
  ├─ Breakdown 24 caratteristiche
  ├─ Export PDF
  └─ Next Steps:
       ├─ "Vai alla Dashboard" → /dashboard
       └─ "Esplora Esercizi" → /exercises

STOP: Utente con mappa leadership completa
```

### Assessment Disponibili
| Assessment | URL | Domande | Output |
|------------|-----|---------|--------|
| Leadership LITE | `/assessment/lite` | 72 | Radar 4 pilastri + 24 caratteristiche |
| Risolutore | `/assessment/risolutore` | 47 | 3 filtri percezione |
| Microfelicità | `/assessment/microfelicita` | 48 | 5 fasi R.A.D.A.R. |

### Handoff Post-Risultati
| CTA | Destinazione | Status |
|-----|--------------|--------|
| Dashboard | `/dashboard` | ✅ |
| Esercizi | `/exercises` | ✅ |
| Export PDF | API export | ✅ |

### Valutazione
- **Completezza:** 100%
- **Blocchi:** 0
- **Note:** Flusso completo con risultati visualizzati e CTA chiare

---

## FLUSSO 5: ESERCIZI (Utente con Mappa → Utente che Pratica)

### Mappa Flusso
```
START: Utente accede agli Esercizi
  ↓
/exercises
  │
  ├─ ExercisesHeader (filtri, stats)
  ├─ ExercisesList (52 esercizi)
  │    ├─ Filtro per book_slug (current_path)
  │    ├─ Status: completed, in_progress, not_started
  │    └─ Lock per tier inferiore
  │
  └─ /exercises/[exerciseId]
       ├─ Dettaglio esercizio
       ├─ Contenuto guidato
       └─ "Segna come completato"
            ↓
       user_exercise_progress.status = 'completed'

CHANGE: Utente completa esercizi settimanali
  ↓
Dashboard aggiornata con:
  - ExercisesCard (stats)
  - RecommendedExercises (prossimi consigliati)
  - QuickStats (completionRate)

STOP: Utente che pratica regolarmente
```

### Raccomandazioni Intelligenti
| Componente | Funzione | Status |
|------------|----------|--------|
| `RecommendedExercises.tsx` | Suggerimenti basati su assessment | ✅ |
| `/api/recommendations` | Algoritmo raccomandazione | ✅ |
| `exercise-recommendation.ts` | Logica priorità aree | ✅ |

### Gating per Tier
| Tier | Esercizi Accessibili |
|------|---------------------|
| Explorer | 10 (basic) |
| Leader | 52 (tutti) |
| Mentor | 52 + coaching |

### Valutazione
- **Completezza:** 100%
- **Blocchi:** 0
- **Note:** Sistema raccomandazioni funzionante, gating corretto

---

## FLUSSO 6: AI COACH FERNANDO (Utente con Dubbio → Utente con Chiarezza)

### Mappa Flusso
```
START: Utente ha una domanda/dubbio
  ↓
Accesso al ChatWidget:
  ├─ /dashboard ← ChatWidget presente
  └─ /results ← ChatWidget presente
  ↓
ChatWidget.tsx (floating button)
  ↓
/api/ai-coach (POST)
  │
  ├─ System Prompt (Fernando persona)
  ├─ RAG System (3 libri)
  ├─ User Memory (personalizzazione)
  └─ Pattern Recognition
  ↓
CHANGE: Risposta personalizzata
  ↓
Utente può:
  ├─ Continuare conversazione
  ├─ Dare feedback (👍/👎)
  ├─ Richiedere riformulazione
  └─ Esportare (PDF/JSON)

STOP: Utente con chiarezza/direzione
```

### Punti di Accesso ChatWidget
| Pagina | ChatWidget | Status |
|--------|------------|--------|
| `/dashboard` | ✅ Presente | ✅ |
| `/results` | ✅ Presente | ✅ |
| `/exercises` | ❌ Assente | ⚠️ |
| `/assessment/*` | ❌ Assente | ⚠️ |
| `/challenge/*` | ❌ Assente | ⚠️ |

### Problemi Identificati
| # | Problema | Severità | Impatto |
|---|----------|----------|---------|
| 1 | ChatWidget solo su 2 pagine | Media | Utente non può accedere a Fernando durante esercizi/assessment |
| 2 | Nessun link diretto a AI Coach | Media | L'utente deve tornare in dashboard per parlare con Fernando |

### Funzionalità AI Coach
| Feature | Endpoint | Status |
|---------|----------|--------|
| Chat principale | `POST /api/ai-coach` | ✅ |
| Storico conversazioni | `GET /api/ai-coach/history` | ✅ |
| Feedback messaggio | `POST /api/ai-coach/feedback` | ✅ |
| Modifica messaggio | `POST /api/ai-coach/edit` | ✅ |
| Riformulazione | `POST /api/ai-coach/reformulate` | ✅ |
| Export | `POST /api/ai-coach/export` | ✅ |
| Segnali impliciti | `POST /api/ai-coach/signals` | ✅ |
| RAG (3 libri) | pgvector search | ✅ |
| User Memory | ai_coach_user_memory | ✅ |

### Valutazione
- **Completezza:** 70%
- **Blocchi:** 2 (medi)
- **Note:** Funzionalità complete ma accessibilità limitata

---

## RIEPILOGO PROBLEMI E RACCOMANDAZIONI

### Problemi Critici (0)
Nessuno.

### Problemi Medi (3)
| # | Flusso | Problema | Raccomandazione |
|---|--------|----------|-----------------|
| 1 | AI Coach | ChatWidget assente su `/exercises` | Aggiungere ChatWidget per supporto durante esercizi |
| 2 | AI Coach | ChatWidget assente durante assessment | Considerare supporto durante compilazione |
| 3 | AI Coach | Nessun link diretto menu | Aggiungere voce "AI Coach" nella Sidebar |

### Problemi Minori (1)
| # | Flusso | Problema | Raccomandazione |
|---|--------|----------|-----------------|
| 1 | Conversione | Redirect post-checkout | Mostrare messaggio benvenuto su `/dashboard` dopo upgrade |

---

## HANDOFF MATRIX

### Da Challenge Complete a...
| Destinazione | Link | Status |
|--------------|------|--------|
| Assessment LITE | `/assessment/lite` | ✅ |
| Assessment Risolutore | `/assessment/risolutore` | ✅ |
| Assessment Microfelicità | `/assessment/microfelicita` | ✅ |
| Esercizi | `/exercises` | ✅ |
| AI Coach (via Dashboard) | `/dashboard` | ✅ |

### Da Assessment Results a...
| Destinazione | Link | Status |
|--------------|------|--------|
| Dashboard | `/dashboard` | ✅ |
| Esercizi | `/exercises` | ✅ |

### Da Esercizi a...
| Destinazione | Link | Status |
|--------------|------|--------|
| Altri esercizi | `/exercises/[id]` | ✅ |
| Pricing (se locked) | `/pricing` | ✅ |
| Dashboard | via Sidebar | ✅ |

### Da Dashboard a...
| Destinazione | Link | Status |
|--------------|------|--------|
| Assessment | Card Assessment | ✅ |
| Esercizi | Card Esercizi | ✅ |
| Risultati | Mini Radar | ✅ |
| AI Coach | ChatWidget | ✅ |

---

## CONCLUSIONE

**L'applicativo Vitaeology ha flussi utente ben strutturati** con:

- ✅ 6 flussi principali mappati
- ✅ Entry point multipli funzionanti
- ✅ Handoff chiari tra sezioni
- ✅ Email automation completa
- ✅ Gating per tier corretto

**Aree di miglioramento:**
1. Estendere la presenza del ChatWidget Fernando a più pagine
2. Aggiungere link diretto a AI Coach nella navigazione
3. Migliorare feedback post-upgrade

**Stato complessivo: OPERATIVO** con opportunità di ottimizzazione UX.
