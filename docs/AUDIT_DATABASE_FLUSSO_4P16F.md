# AUDIT DATABASE - Framework Flusso 4P/16F

**Data:** 11 Gennaio 2026
**Versione:** 1.0

---

## TABELLE VERIFICATE

| Tabella Attesa | Tabella Reale | Status | Campi Chiave | Usata in API |
|----------------|---------------|--------|--------------|--------------|
| profiles | `profiles` | ✅ | id, email, full_name, subscription_tier, subscription_status, stripe_customer_id, current_path | /api/ai-coach, /api/stripe/*, /api/admin/* |
| challenge_subscribers | `challenge_subscribers` | ✅ | id, email, nome, challenge, variant, current_day, status, converted_to_assessment, converted_to_subscription | /api/challenge/subscribe, /api/cron/send-challenge-emails |
| challenge_responses | `challenge_discovery_responses` | ✅ | id, user_id, challenge_type, day_number, question_number, response (A/B/C) | /api/challenge/check-unlock, /api/challenge/mini-profile |
| assessment_results | `user_assessments` + `characteristic_scores` | ✅ | user_assessments: id, user_id, book_id, status, total_score; characteristic_scores: assessment_id, characteristic_id, score_percentage | /api/assessment/*, /api/exercises/recommended |
| exercise_completions | `user_exercise_progress` | ✅ | id, user_id, exercise_id, status, notes, rating, started_at, completed_at, reflection_answers, rating_difficulty, rating_usefulness, feedback | /api/exercises/completion-stats, /lib/supabase/exercises |
| chat_messages | `ai_coach_conversations` | ✅ | id, user_id, session_id, current_path, user_message, ai_response, rag_chunks_used, response_time_ms, model_used, api_cost_usd | /api/ai-coach/route, /api/ai-coach/conversations, /api/ai-coach/history |
| subscriptions | `profiles` (colonne integrate) | ✅ | subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_start_date | /api/stripe/webhook, /api/stripe/checkout |
| affiliates | `affiliates` | ✅ | id, user_id, email, nome, ref_code, categoria, commissione_percentuale, stato, totale_clienti_attivi, saldo_disponibile_euro | /api/affiliate/*, /api/admin/affiliates |

---

## TABELLE CORRELATE (Completezza Schema)

### Challenge System
| Tabella | Status | Descrizione |
|---------|--------|-------------|
| `challenge_subscribers` | ✅ | Iscritti + tracking A/B |
| `challenge_discovery_responses` | ✅ | Quiz discovery Day 1-7 |
| `challenge_day_completions` | ✅ | Completamenti giornalieri |
| `challenge_feedback` | ✅ | Feedback fine challenge |
| `challenge_email_events` | ✅ | Tracking email inviate |
| `ab_test_events` | ✅ | Eventi A/B testing |

### Assessment System
| Tabella | Status | Descrizione |
|---------|--------|-------------|
| `assessment_questions` | ✅ | 167 domande (72+48+47) |
| `user_assessments` | ✅ | Sessioni assessment |
| `user_answers` | ✅ | Risposte utente |
| `characteristic_scores` | ✅ | Punteggi caratteristiche |
| `characteristics` | ✅ | 24 caratteristiche |
| `user_assessments_v2` | ✅ | V2 multi-assessment |

### Exercise System
| Tabella | Status | Descrizione |
|---------|--------|-------------|
| `exercises` | ✅ | 52+ esercizi |
| `user_exercise_progress` | ✅ | Progresso utente |
| `exercise_feedback` | ✅ | Feedback esercizi |

### AI Coach System
| Tabella | Status | Descrizione |
|---------|--------|-------------|
| `ai_coach_conversations` | ✅ | Messaggi chat |
| `ai_coach_feedback` | ✅ | Feedback su risposte |
| `ai_coach_implicit_signals` | ✅ | Segnali impliciti |
| `ai_coach_patterns` | ✅ | Pattern riconosciuti |
| `ai_coach_user_memory` | ✅ | Memoria utente |
| `ai_coach_daily_usage` | ✅ | Limiti giornalieri |
| `ai_coach_quality_audits` | ✅ | Audit qualità |
| `ai_coach_auto_corrections` | ✅ | Correzioni automatiche |

### Affiliate System
| Tabella | Status | Descrizione |
|---------|--------|-------------|
| `affiliates` | ✅ | Profili affiliati |
| `affiliate_links` | ✅ | Link tracking |
| `affiliate_clicks` | ✅ | Click tracking |
| `affiliate_commissions` | ✅ | Commissioni |
| `affiliate_payouts` | ✅ | Pagamenti |
| `subscription_affiliate_tracking` | ✅ | Attribuzione subscription |

---

## STOP POINTS - DETTAGLIO SALVATAGGIO

| # | STOP | Status | Salva dati in | Campi salvati |
|---|------|--------|---------------|---------------|
| 1 | **Challenge Complete** | ✅ | `challenge_subscribers` | status='completed', completed_at, converted_to_assessment |
| | | | `challenge_day_completions` | day_number=7, completed_at |
| | | | `challenge_feedback` | rating, feedback_text, would_recommend |
| | | | `ab_test_events` | event_type='completed' |
| 2 | **Assessment Results** | ✅ | `user_assessments` | status='completed', completed_at, total_score |
| | | | `user_answers` | answer, points_earned per ogni domanda |
| | | | `characteristic_scores` | total_points, max_points, score_percentage per caratteristica |
| 3 | **Esercizio Complete** | ✅ | `user_exercise_progress` | status='completed', completed_at, notes, reflection_answers, rating_difficulty, rating_usefulness, feedback |
| 4 | **Chat AI (wrap-up)** | ✅ | `ai_coach_conversations` | user_message, ai_response, response_time_ms, rag_chunks_used, api_cost_usd |
| | | | `ai_coach_feedback` | (opzionale) rating, is_helpful, comment |

---

## INCONSISTENZE/PROBLEMI RILEVATI

### 1. Naming Inconsistencies
| Problema | Dettaglio |
|----------|-----------|
| ⚠️ `challenge_responses` vs `challenge_discovery_responses` | Il framework 4P/16F usa "challenge_responses", il DB usa "challenge_discovery_responses" |
| ⚠️ `exercise_completions` vs `user_exercise_progress` | Nome diverso, stesso scopo |
| ⚠️ `chat_messages` vs `ai_coach_conversations` | Nome diverso, stesso scopo |
| ⚠️ `assessment_results` vs split tables | Distribuito su `user_assessments` + `characteristic_scores` |

### 2. Schema Split
| Problema | Dettaglio |
|----------|-----------|
| ℹ️ Assessment v1 vs v2 | Esistono sia `user_assessments` che `user_assessments_v2` - possibile confusione |
| ℹ️ Exercises v1 vs v2 | Schema originale + versione v2 per multi-book |

### 3. Missing Relations
| Problema | Dettaglio |
|----------|-----------|
| ⚠️ `ai_coach_conversations.exercise_id` | Commentato come "REFERENCES exercises_v2(id) se esiste" - FK non enforce |

### 4. Data Integrity
| Problema | Dettaglio |
|----------|-----------|
| ✅ RLS attivo | Tutte le tabelle principali hanno RLS abilitato |
| ✅ Triggers | updated_at triggers presenti dove necessario |
| ✅ Indexes | Indici ottimizzati per query frequenti |

---

## FLUSSO DATI PER STOP POINT

### STOP 1: Challenge Complete
```
User completa Day 7
    ↓
POST /api/challenge/complete-day
    ↓
┌─────────────────────────────────────┐
│ challenge_subscribers               │
│ - status = 'completed'              │
│ - completed_at = NOW()              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ challenge_day_completions           │
│ - day_number = 7                    │
│ - completed_at = NOW()              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ ab_test_events                      │
│ - event_type = 'challenge_completed'│
└─────────────────────────────────────┘
    ↓
[Utente redirectato a /challenge/[type]/complete]
    ↓
POST /api/challenge/feedback (opzionale)
    ↓
┌─────────────────────────────────────┐
│ challenge_feedback                  │
│ - rating, feedback_text             │
└─────────────────────────────────────┘
```

### STOP 2: Assessment Results
```
User risponde a domanda 72
    ↓
POST /api/assessment/answer
    ↓
┌─────────────────────────────────────┐
│ user_answers                        │
│ - assessment_id, question_id        │
│ - answer, points_earned             │
└─────────────────────────────────────┘
    ↓
POST /api/assessment/complete
    ↓
┌─────────────────────────────────────┐
│ user_assessments                    │
│ - status = 'completed'              │
│ - completed_at, total_score         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ characteristic_scores               │
│ - 24 righe (una per caratteristica) │
│ - score_percentage calcolato        │
└─────────────────────────────────────┘
    ↓
[Redirect a /assessment/leadership/results]
```

### STOP 3: Exercise Complete
```
User clicca "Segna come Completato"
    ↓
completeExercise() in /lib/supabase/exercises.ts
    ↓
┌─────────────────────────────────────┐
│ user_exercise_progress              │
│ - status = 'completed'              │
│ - completed_at = NOW()              │
│ - notes, reflection_answers         │
│ - rating_difficulty, rating_useful  │
│ - feedback                          │
└─────────────────────────────────────┘
    ↓
[ExerciseCompletionCard mostrato]
    ↓
GET /api/exercises/completion-stats
    ↓
[Next exercise suggerito]
```

### STOP 4: Chat AI Wrap-up
```
User dice "grazie" / "ciao"
    ↓
POST /api/ai-coach
    ↓
isClosingMessage() → true
    ↓
closingHint aggiunto al system prompt
    ↓
Claude genera wrap-up con:
- Riepilogo tema
- Azione concreta 24-48h
- Esercizio suggerito
    ↓
┌─────────────────────────────────────┐
│ ai_coach_conversations              │
│ - user_message = "grazie"           │
│ - ai_response = wrap-up completo    │
│ - response_time_ms, api_cost_usd    │
└─────────────────────────────────────┘
```

---

## VISTE ANALITICHE DISPONIBILI

| Vista | Tabella Source | Descrizione |
|-------|----------------|-------------|
| `ab_test_performance` | ab_test_events | Performance per variante A/B/C |
| `campaign_performance` | ab_test_events | Performance per UTM campaign |
| `best_variant_per_challenge` | ab_test_events | Migliore variante per challenge |
| `challenge_discovery_analytics` | challenge_discovery_responses | Analytics risposte quiz |
| `challenge_user_progress` | challenge_discovery_responses | Progresso utente per challenge |
| `v_top_patterns` | ai_coach_patterns | Pattern più frequenti |
| `v_affiliates_email_data` | affiliates | Dati per email affiliati |
| `v_affiliates_inactive` | affiliates | Affiliati inattivi |

---

## FUNZIONI DATABASE UTILI

| Funzione | Input | Output | Uso |
|----------|-------|--------|-----|
| `get_discovery_profile` | user_id, challenge_type | dominant_response, a/b/c_count, completion_% | Mini-profilo discovery |
| `track_challenge_pageview` | challenge, utm_* | variant assegnata | A/B test page view |
| `check_ai_coach_limit` | user_id, daily_limit | can_send, current_count | Limiti AI Coach |
| `increment_daily_usage` | user_id | new_count | Incremento utilizzo |
| `generate_affiliate_ref_code` | - | ref_code | Generazione codice affiliato |

---

## PROSSIMI PASSI (Prioritizzati)

### Alta Priorità
1. ✅ **STOP 3 - Exercise Completion** - Implementato ExerciseCompletionCard
2. ✅ **STOP 4 - AI Coach Wrap-up** - Implementato closing detection + wrap-up instructions

### Media Priorità
3. ⬜ **Standardizzare naming** - Creare alias/views per coerenza con framework 4P/16F
4. ⬜ **Unificare Assessment v1/v2** - Migrare a schema unificato
5. ⬜ **Dashboard Analytics STOP** - Vista aggregata tutti gli STOP points

### Bassa Priorità
6. ⬜ **Enforce FK ai_coach_conversations.exercise_id** - Aggiungere foreign key
7. ⬜ **Cleanup tabelle legacy** - Rimuovere tabelle v1 dopo migrazione

---

## METRICHE CHIAVE PER STOP

| STOP | Metrica Principale | Come Calcolarla |
|------|-------------------|-----------------|
| 1 - Challenge | Completion Rate | `COUNT(status='completed') / COUNT(*)` su challenge_subscribers |
| 2 - Assessment | Completion Rate | `COUNT(status='completed') / COUNT(*)` su user_assessments |
| 3 - Exercise | Exercises/User | `AVG(COUNT(*) GROUP BY user_id)` su user_exercise_progress WHERE status='completed' |
| 4 - AI Coach | Messages/Session | `COUNT(*) GROUP BY session_id` su ai_coach_conversations |

---

## QUERY VERIFICHE RAPIDE

```sql
-- Verifica STOP 1: Challenge completate
SELECT challenge, status, COUNT(*)
FROM challenge_subscribers
GROUP BY challenge, status;

-- Verifica STOP 2: Assessment completati
SELECT status, COUNT(*)
FROM user_assessments
GROUP BY status;

-- Verifica STOP 3: Esercizi completati
SELECT status, COUNT(*)
FROM user_exercise_progress
GROUP BY status;

-- Verifica STOP 4: Conversazioni AI
SELECT DATE(created_at), COUNT(*)
FROM ai_coach_conversations
GROUP BY DATE(created_at)
ORDER BY 1 DESC LIMIT 7;
```

---

*Documento generato automaticamente - Vitaeology Framework 4P/16F*
