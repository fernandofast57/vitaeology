# VALUE LADDER - STATO IMPLEMENTAZIONE

**Data:** 28 Dicembre 2024

---

## DIAGRAMMA VALUE LADDER

```
                    ┌─────────────────────────────────────────────────────┐
                    │              PARTNER ELITE (€9.997/anno)            │  ← Fase 2
                    │  Licenza territoriale, Revenue share                │
                    └─────────────────────────────────────────────────────┘
                                            ▲
                    ┌─────────────────────────────────────────────────────┐
                    │              MASTERMIND (€2.997/anno)               │  ← Fase 2
                    │  Gruppo 24 persone, 2 live/mese, Ritiro annuale     │
                    └─────────────────────────────────────────────────────┘
                                            ▲
                    ┌─────────────────────────────────────────────────────┐
                    │            COACHING 1:1 (€997-1.997)                │  ← Fase 2
                    │  3-6 sessioni con Fernando, Piano custom            │
                    └─────────────────────────────────────────────────────┘
                                            ▲
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                              MENTOR (€490/anno)                                       │
│  • AI Coach 50 msg/giorno  • Esercizi avanzati  • 3 percorsi  • Q&A live mensile     │
│  • TUTTI GLI ASSESSMENT                                                               │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                            ▲
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                              LEADER (€149/anno)                                       │
│  • AI Coach 20 msg/giorno  • 52 esercizi settimanali  • Report PDF                   │
│  • TUTTI GLI ASSESSMENT                                                               │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                            ▲
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                              EXPLORER (€0 - Gratuito)                                 │
│  • AI Coach 5 msg/giorno  • 10 esercizi base  • Report base                          │
│  • ASSESSMENT: solo quelli sbloccati (libro o challenge)                              │
└───────────────────────────────────────────────────────────────────────────────────────┘
                        ▲                                   ▲
         ┌──────────────┴──────────────┐     ┌──────────────┴──────────────┐
         │      LIBRO (€9.90)          │     │    CHALLENGE (Gratuita)     │
         │  Sblocca 1 assessment       │     │  7 giorni → 1 assessment    │
         └─────────────────────────────┘     └─────────────────────────────┘
                        ▲                                   ▲
         ┌──────────────┴───────────────────────────────────┴──────────────┐
         │                      LANDING PAGE                                │
         │            /libro/[slug]  o  /challenge/[type]                   │
         └─────────────────────────────────────────────────────────────────┘
```

---

## MAPPING PRODOTTI → ASSESSMENT

| Prodotto | Tipo | Assessment Sbloccato |
|----------|------|---------------------|
| Libro "Leadership Autentica" | `leadership` | `lite` (72 domande) |
| Libro "Oltre gli Ostacoli" | `risolutore` | `risolutore` (48 domande) |
| Libro "Microfelicità Digitale" | `microfelicita` | `microfelicita` (47 domande) |
| Challenge "Leadership Autentica" | `leadership-autentica` | `lite` |
| Challenge "Oltre gli Ostacoli" | `oltre-ostacoli` | `risolutore` |
| Challenge "Microfelicità" | `microfelicita` | `microfelicita` |
| Subscription Leader/Mentor | - | **TUTTI** |

---

## STATO IMPLEMENTAZIONE

### ✅ IMPLEMENTATO

| Componente | File | Stato |
|------------|------|-------|
| Tabella `assessment_access` | `sql/assessment-access.sql` | ✅ |
| Helper TypeScript | `src/lib/assessment-access.ts` | ✅ |
| Grant su acquisto libro | `src/app/api/stripe/webhook/route.ts` | ✅ |
| Grant su subscription | `src/app/api/stripe/webhook/route.ts` | ✅ |
| Grant su challenge completata | `src/app/api/challenge/complete-day/route.ts` | ✅ |
| Protezione API Risolutore | `src/app/api/assessment/risolutore/session/route.ts` | ✅ |
| Protezione API Microfelicità | `src/app/api/assessment/microfelicita/session/route.ts` | ✅ |
| UI blocco Risolutore | `src/app/assessment/risolutore/page.tsx` | ✅ |
| UI blocco Microfelicità | `src/app/assessment/microfelicita/page.tsx` | ✅ |

### ✅ IMPLEMENTATO (28 Dicembre 2024)

| Componente | File | Stato |
|------------|------|-------|
| **Assessment LITE** | `src/app/api/assessment/session/route.ts` | ✅ |
| **UI blocco LITE** | `src/app/assessment/lite/page.tsx` | ✅ |
| **AI Coach limite msg** | `sql/ai-coach-daily-usage.sql` + `/api/ai-coach/route.ts` | ✅ |
| **Esercizi per tier** | `src/app/exercises/page.tsx` + `[exerciseId]/page.tsx` | ✅ |

### ❌ DA IMPLEMENTARE

| Componente | Descrizione | Priorità |
|------------|-------------|----------|
| **Dashboard accessi** | Mostrare quali assessment sono sbloccati | BASSA |

---

## LOGICA DI ACCESSO PROPOSTA

### Assessment

```
ASSESSMENT LITE (Leadership):
├── Explorer SENZA sblocco → ❌ Bloccato (CTA: libro/challenge)
├── Explorer CON sblocco (libro/challenge) → ✅ Accesso
├── Leader → ✅ Accesso (subscription include tutto)
└── Mentor → ✅ Accesso

ASSESSMENT RISOLUTORE:
├── Explorer SENZA sblocco → ❌ Bloccato
├── Explorer CON sblocco → ✅ Accesso
├── Leader → ✅ Accesso
└── Mentor → ✅ Accesso

ASSESSMENT MICROFELICITÀ:
├── Explorer SENZA sblocco → ❌ Bloccato
├── Explorer CON sblocco → ✅ Accesso
├── Leader → ✅ Accesso
└── Mentor → ✅ Accesso
```

### AI Coach

```
Explorer: 5 messaggi/giorno
Leader: 20 messaggi/giorno (o illimitato come da doc?)
Mentor: 50 messaggi/giorno
Mastermind+: Illimitato
```

### Esercizi

```
Explorer: 10 esercizi base (week 1-10)
Leader: 52 esercizi (tutti)
Mentor: 52 esercizi + contenuti avanzati
```

---

## AZIONI COMPLETATE (28 Dicembre 2024)

### ✅ 1. Assessment LITE Protetto
- `src/app/api/assessment/session/route.ts` - Aggiunto controllo accesso con `checkAssessmentAccess()`
- `src/app/assessment/lite/page.tsx` - Aggiunta UI ACCESS_DENIED con CTA libro/challenge

### ✅ 2. Limite AI Coach Implementato
- `sql/ai-coach-daily-usage.sql` - Tabella e funzioni PostgreSQL per tracking
- `src/app/api/ai-coach/route.ts` - Verifica limite pre-messaggio, incremento post-risposta
- Limiti: Explorer=5, Leader=20, Mentor=50, Mastermind+=illimitato

### ✅ 3. Filtro Esercizi per Tier
- Già implementato in `src/app/exercises/page.tsx` e `[exerciseId]/page.tsx`
- Usa `SUBSCRIPTION_TIERS[tier].features.exercises_access`
- Mostra `LockedExerciseView` per esercizi bloccati

### ⏳ 4. Dashboard Accessi (BASSA PRIORITÀ)
```typescript
// src/components/dashboard/AssessmentsOverview.tsx
// Mostrare stato accesso (sbloccato/bloccato) per ogni assessment
```

---

## NOTE

- La tabella `assessment_access` supporta già:
  - `book_purchase` - accesso permanente
  - `challenge_complete` - accesso permanente
  - `subscription` - accesso legato a subscription attiva
  - `trial` - accesso temporaneo con scadenza
  - `admin_grant` - assegnato manualmente

- Per subscription cancellate, l'accesso rimane (sono record permanenti)
  - Opzionale: rimuovere accessi `subscription` quando subscription cancellata

---

*Ultimo aggiornamento: 28 Dicembre 2024 - Value Ladder implementato (3/4 priorità completate)*
