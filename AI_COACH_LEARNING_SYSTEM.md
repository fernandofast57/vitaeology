# AI COACH LEARNING SYSTEM
## Sistema di Apprendimento Continuo basato su 4 Prodotti e 12 Fattori

**Versione:** 1.0  
**Data:** 16 Dicembre 2025  
**Owner:** Fernando Marongiu  
**Status:** Architettura approvata - da implementare

---

## 1. FRAMEWORK CONCETTUALE

### 1.1 I 4 Prodotti Applicati all'AI Coach

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PRODOTTO 1: ISTITUZIONE                                                │
│  ─────────────────────────────────────────────────────────────────────  │
│  COS'È: Il sistema AI Coach (prompt, RAG, configurazione)               │
│  AUTOMAZIONE: Manuale (modifiche strategiche richiedono visione)        │
│                                                                         │
│  Componenti:                                                            │
│  • Prompt system (personalità, regole, principi)                        │
│  • Knowledge base RAG (565 chunks dai 3 libri)                          │
│  • Configurazione parametri (temperature, max_tokens, etc.)             │
│  • Regole di business (Principio Validante, User Agency)                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PRODOTTO 2: PRODOTTO GENERATO                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│  COS'È: Le risposte agli utenti                                         │
│  AUTOMAZIONE: Automatico (già operativo)                                │
│                                                                         │
│  Output:                                                                 │
│  • Conversazioni con utenti                                             │
│  • Risposte a domande                                                   │
│  • Supporto durante esercizi                                            │
│  • Celebrazioni e validazioni                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PRODOTTO 3: RIPARAZIONE ISTITUZIONE                                    │
│  ─────────────────────────────────────────────────────────────────────  │
│  COS'È: Miglioramento del sistema                                       │
│  AUTOMAZIONE: Semi-automatico (AI propone, Fernando approva)            │
│  FREQUENZA: Settimanale                                                 │
│                                                                         │
│  Azioni:                                                                 │
│  • Aggiornamento prompt system                                          │
│  • Aggiunta nuovi chunks RAG                                            │
│  • Modifica regole di business                                          │
│  • Ottimizzazione parametri                                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PRODOTTO 4: CORREZIONE PRODOTTO GENERATO                               │
│  ─────────────────────────────────────────────────────────────────────  │
│  COS'È: Raffinamento delle risposte                                     │
│  AUTOMAZIONE: Automatico con soglie                                     │
│  FREQUENZA: Real-time + batch giornaliero                               │
│                                                                         │
│  Azioni:                                                                 │
│  • Pattern negativi frequenti → esempio aggiunto al prompt              │
│  • Domande senza risposta → flag per nuovo chunk RAG                    │
│  • Personalizzazione per utente → memoria conversazione                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 I 12 Fattori di Misurazione

| Prodotto | Quantità | Qualità | Viability |
|----------|----------|---------|-----------|
| **1. Istituzione** | N° componenti sistema (prompt, chunks, regole) | Aderenza ai principi (Validante, Agency, Comprensione) | Manutenibilità, scalabilità, costo API |
| **2. Prodotto Generato** | N° conversazioni/giorno, N° messaggi | Rating medio utente, % risposte utili | Tasso completamento esercizi, retention |
| **3. Riparazione** | N° miglioramenti/settimana | % miglioramenti efficaci (pre/post) | Tempo medio implementazione |
| **4. Correzione** | N° pattern corretti automaticamente | Riduzione errori ripetuti | Prevenzione errori futuri (trend) |

---

## 2. ARCHITETTURA TECNICA

### 2.1 Schema dei Due Cicli

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CICLO VELOCE (Real-time)                        │
│                         Prodotto 4: Correzione                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
    ▼                               ▼                               ▼
┌─────────┐                   ┌─────────┐                     ┌─────────┐
│FEEDBACK │                   │ SEGNALI │                     │ PATTERN │
│ESPLICITO│                   │IMPLICITI│                     │RICORRENTI│
└─────────┘                   └─────────┘                     └─────────┘
    │                               │                               │
    │ 👍👎 rating                   │ riformula domanda             │ >5 occorrenze
    │ commento utente               │ abbandona conversazione       │ stesso errore
    │                               │ tempo risposta lungo          │
    │                               │                               │
    └───────────────────────────────┼───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     AZIONI AUTOMATICHE        │
                    │  (soglia superata = azione)   │
                    └───────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │ Aggiungi      │       │ Flag per      │       │ Memoria       │
    │ esempio al    │       │ nuovo chunk   │       │ utente        │
    │ prompt        │       │ RAG           │       │ (preferenze)  │
    └───────────────┘       └───────────────┘       └───────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         CICLO LENTO (Settimanale)                       │
│                         Prodotto 3: Riparazione                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   AGGREGAZIONE SETTIMANALE    │
                    │   (batch ogni Domenica)       │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │       REPORT GENERATO         │
                    │                               │
                    │  • Top 10 domande problematiche│
                    │  • Suggerimenti modifica prompt│
                    │  • Analisi trend soddisfazione │
                    │  • Metriche 12 fattori        │
                    │  • Confronto settimana prec.  │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     DASHBOARD FERNANDO        │
                    │                               │
                    │  [Approva] [Rifiuta] [Modifica]│
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   IMPLEMENTAZIONE APPROVATA   │
                    │                               │
                    │  • Aggiorna prompt system     │
                    │  • Aggiungi chunks RAG        │
                    │  • Modifica parametri         │
                    └───────────────────────────────┘
```

---

## 3. DATABASE SCHEMA

### 3.1 Nuove Tabelle per Sistema Apprendimento

```sql
-- =============================================
-- TABELLA: ai_coach_conversations
-- Traccia tutte le conversazioni con l'AI Coach
-- =============================================
CREATE TABLE ai_coach_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contesto
  session_id UUID NOT NULL, -- raggruppa messaggi stessa sessione
  current_path VARCHAR(20) CHECK (current_path IN ('leadership', 'problemi', 'benessere')),
  exercise_id INTEGER REFERENCES exercises_v2(id),
  
  -- Messaggio utente
  user_message TEXT NOT NULL,
  user_message_tokens INTEGER,
  
  -- Risposta AI
  ai_response TEXT NOT NULL,
  ai_response_tokens INTEGER,
  
  -- RAG utilizzato
  rag_chunks_used UUID[], -- IDs dei chunks usati per questa risposta
  rag_similarity_scores FLOAT[], -- scores corrispondenti
  
  -- Metriche tempo
  response_time_ms INTEGER, -- tempo generazione risposta
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_user ON ai_coach_conversations(user_id);
CREATE INDEX idx_conversations_session ON ai_coach_conversations(session_id);
CREATE INDEX idx_conversations_created ON ai_coach_conversations(created_at);
CREATE INDEX idx_conversations_path ON ai_coach_conversations(current_path);

-- =============================================
-- TABELLA: ai_coach_feedback
-- Feedback esplicito degli utenti (Prodotto 4 - Quantità/Qualità)
-- =============================================
CREATE TABLE ai_coach_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Feedback
  rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- 1-5 stelle o null
  is_helpful BOOLEAN, -- 👍 true, 👎 false, null = non votato
  
  -- Feedback testuale (opzionale)
  comment TEXT,
  
  -- Categorizzazione automatica del problema (se negativo)
  issue_category VARCHAR(50), -- 'non_pertinente', 'troppo_generico', 'tono_sbagliato', 'non_validante', 'altro'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feedback_conversation ON ai_coach_feedback(conversation_id);
CREATE INDEX idx_feedback_user ON ai_coach_feedback(user_id);
CREATE INDEX idx_feedback_rating ON ai_coach_feedback(rating);
CREATE INDEX idx_feedback_helpful ON ai_coach_feedback(is_helpful);

-- =============================================
-- TABELLA: ai_coach_implicit_signals
-- Segnali impliciti comportamento utente (Prodotto 4 - Viability)
-- =============================================
CREATE TABLE ai_coach_implicit_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  
  -- Tipo segnale
  signal_type VARCHAR(50) NOT NULL CHECK (signal_type IN (
    'reformulated_question',    -- utente ha riformulato la domanda
    'abandoned_conversation',   -- utente ha abbandonato senza risposta
    'long_pause_before_reply',  -- >5 minuti prima di rispondere
    'immediate_new_question',   -- nuova domanda <30 sec (non soddisfatto)
    'completed_exercise',       -- ha completato esercizio dopo supporto
    'skipped_exercise',         -- ha saltato esercizio dopo supporto
    'returned_to_topic',        -- è tornato su stesso argomento
    'escalation_requested'      -- ha chiesto di parlare con umano
  )),
  
  -- Metadata
  metadata JSONB, -- dati aggiuntivi specifici per tipo segnale
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_signals_conversation ON ai_coach_implicit_signals(conversation_id);
CREATE INDEX idx_signals_user ON ai_coach_implicit_signals(user_id);
CREATE INDEX idx_signals_type ON ai_coach_implicit_signals(signal_type);
CREATE INDEX idx_signals_created ON ai_coach_implicit_signals(created_at);

-- =============================================
-- TABELLA: ai_coach_patterns
-- Pattern ricorrenti identificati (Prodotto 4 - Correzione automatica)
-- =============================================
CREATE TABLE ai_coach_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificazione pattern
  pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN (
    'unanswered_question',      -- domanda frequente senza buona risposta
    'negative_feedback_cluster', -- cluster di feedback negativi simili
    'reformulation_trigger',    -- trigger che causa riformulazione
    'abandonment_trigger',      -- trigger che causa abbandono
    'success_pattern'           -- pattern che genera feedback positivo
  )),
  
  -- Descrizione pattern
  pattern_description TEXT NOT NULL,
  pattern_keywords TEXT[], -- parole chiave associate
  
  -- Metriche
  occurrence_count INTEGER DEFAULT 1,
  first_occurrence TIMESTAMPTZ DEFAULT NOW(),
  last_occurrence TIMESTAMPTZ DEFAULT NOW(),
  
  -- Esempi
  example_conversation_ids UUID[], -- max 5 esempi
  
  -- Stato
  status VARCHAR(20) DEFAULT 'identified' CHECK (status IN (
    'identified',    -- identificato, non ancora processato
    'auto_corrected', -- corretto automaticamente (soglia superata)
    'pending_review', -- in attesa revisione Fernando
    'approved',       -- approvato e implementato
    'rejected',       -- rifiutato
    'resolved'        -- risolto (non più ricorrente)
  )),
  
  -- Azione suggerita/applicata
  suggested_action TEXT,
  applied_action TEXT,
  
  -- Soglie
  auto_correct_threshold INTEGER DEFAULT 5, -- occorrenze per auto-correzione
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_patterns_type ON ai_coach_patterns(pattern_type);
CREATE INDEX idx_patterns_status ON ai_coach_patterns(status);
CREATE INDEX idx_patterns_count ON ai_coach_patterns(occurrence_count);

-- =============================================
-- TABELLA: ai_coach_prompt_versions
-- Versioning del prompt system (Prodotto 1 - Istituzione)
-- =============================================
CREATE TABLE ai_coach_prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Versione
  version_number INTEGER NOT NULL,
  version_label VARCHAR(50), -- es: "v4.2.1", "post-fix-tono"
  
  -- Contenuto
  system_prompt TEXT NOT NULL,
  
  -- Modifiche
  changes_description TEXT,
  changes_reason TEXT, -- pattern_id che ha causato modifica
  
  -- Stato
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Metriche pre/post (compilate dopo periodo test)
  metrics_before JSONB, -- metriche settimana prima
  metrics_after JSONB,  -- metriche settimana dopo
  
  -- Approvazione
  approved_by VARCHAR(100), -- 'auto' o 'fernando'
  approved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solo una versione attiva alla volta
CREATE UNIQUE INDEX idx_prompt_active ON ai_coach_prompt_versions(is_active) WHERE is_active = TRUE;

-- =============================================
-- TABELLA: ai_coach_rag_suggestions
-- Suggerimenti per nuovi chunks RAG (Prodotto 3)
-- =============================================
CREATE TABLE ai_coach_rag_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Origine
  source_pattern_id UUID REFERENCES ai_coach_patterns(id),
  source_conversation_ids UUID[],
  
  -- Suggerimento
  suggested_content TEXT NOT NULL,
  suggested_keywords TEXT[],
  suggested_book VARCHAR(50), -- 'leadership', 'problemi', 'benessere'
  
  -- Stato
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',    -- in attesa revisione
    'approved',   -- approvato, da implementare
    'implemented', -- chunk creato
    'rejected'    -- rifiutato
  )),
  
  -- Se implementato
  implemented_chunk_id UUID, -- riferimento a book_knowledge
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ
);

-- =============================================
-- TABELLA: ai_coach_metrics_daily
-- Metriche giornaliere aggregate (12 Fattori)
-- =============================================
CREATE TABLE ai_coach_metrics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  
  -- PRODOTTO 1: ISTITUZIONE
  p1_quantity_components INTEGER, -- n° componenti sistema
  p1_quality_principle_adherence FLOAT, -- % risposte aderenti ai principi (sampling)
  p1_viability_api_cost DECIMAL(10,2), -- costo API giornaliero
  p1_viability_avg_response_time INTEGER, -- tempo medio risposta ms
  
  -- PRODOTTO 2: PRODOTTO GENERATO  
  p2_quantity_conversations INTEGER, -- n° conversazioni
  p2_quantity_messages INTEGER, -- n° messaggi totali
  p2_quality_avg_rating FLOAT, -- rating medio (1-5)
  p2_quality_helpful_ratio FLOAT, -- % risposte utili (👍)
  p2_viability_exercise_completion_rate FLOAT, -- % esercizi completati dopo supporto
  p2_viability_user_return_rate FLOAT, -- % utenti che tornano
  
  -- PRODOTTO 3: RIPARAZIONE
  p3_quantity_improvements INTEGER, -- n° miglioramenti applicati
  p3_quality_improvement_effectiveness FLOAT, -- % miglioramenti efficaci
  p3_viability_avg_implementation_time INTEGER, -- ore medie implementazione
  
  -- PRODOTTO 4: CORREZIONE
  p4_quantity_patterns_corrected INTEGER, -- n° pattern corretti
  p4_quality_error_reduction_rate FLOAT, -- % riduzione errori ripetuti
  p4_viability_prevention_rate FLOAT, -- % errori prevenuti vs nuovi
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index per query temporali
CREATE INDEX idx_metrics_date ON ai_coach_metrics_daily(date);

-- =============================================
-- TABELLA: ai_coach_weekly_reports
-- Report settimanali per Fernando (Prodotto 3)
-- =============================================
CREATE TABLE ai_coach_weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Periodo
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  
  -- Contenuto report
  report_content JSONB NOT NULL,
  /*
  Struttura:
  {
    "summary": {
      "total_conversations": 150,
      "avg_rating": 4.2,
      "trend_vs_last_week": "+0.3"
    },
    "top_issues": [
      {"description": "...", "count": 12, "suggested_fix": "..."},
      ...
    ],
    "suggested_prompt_changes": [
      {"change": "...", "reason": "...", "expected_impact": "..."},
      ...
    ],
    "suggested_rag_additions": [
      {"content": "...", "keywords": [...], "reason": "..."},
      ...
    ],
    "metrics_12_factors": {
      "p1_quantity": ...,
      ...
    },
    "comparison_last_week": {...}
  }
  */
  
  -- Stato revisione
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',   -- in attesa revisione Fernando
    'reviewed',  -- revisionato
    'actioned'   -- azioni implementate
  )),
  
  -- Azioni prese
  actions_taken JSONB, -- log delle azioni approvate/rifiutate
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Index
CREATE UNIQUE INDEX idx_weekly_reports_period ON ai_coach_weekly_reports(week_start, week_end);

-- =============================================
-- TABELLA: ai_coach_user_memory
-- Memoria per-utente (personalizzazione)
-- =============================================
CREATE TABLE ai_coach_user_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferenze apprese
  communication_style VARCHAR(50), -- 'diretto', 'elaborato', 'esempi_pratici'
  preferred_response_length VARCHAR(20), -- 'breve', 'medio', 'dettagliato'
  
  -- Pattern utente
  common_challenges TEXT[], -- sfide ricorrenti
  successful_approaches TEXT[], -- approcci che hanno funzionato
  trigger_topics TEXT[], -- argomenti che causano difficoltà
  
  -- Contesto persistente
  key_context JSONB, -- informazioni chiave da ricordare
  /*
  {
    "azienda": "PMI manifatturiera",
    "ruolo": "CEO",
    "team_size": 15,
    "sfida_principale": "delega",
    "punto_forza": "visione"
  }
  */
  
  -- Note Coach
  coach_notes TEXT[], -- note che il coach "ricorda"
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Index
CREATE INDEX idx_user_memory_user ON ai_coach_user_memory(user_id);
```

### 3.2 Row Level Security (RLS)

```sql
-- RLS per ai_coach_conversations
ALTER TABLE ai_coach_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON ai_coach_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON ai_coach_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS per ai_coach_feedback
ALTER TABLE ai_coach_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON ai_coach_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON ai_coach_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS per ai_coach_user_memory
ALTER TABLE ai_coach_user_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memory"
  ON ai_coach_user_memory FOR SELECT
  USING (auth.uid() = user_id);

-- Admin access per tabelle di sistema
-- (patterns, metrics, reports, prompt_versions, rag_suggestions)
-- Accessibili solo via service_role key (backend)
```

---

## 4. LOGICA DI BUSINESS

### 4.1 Ciclo Veloce - Correzione Automatica (Prodotto 4)

```typescript
// /src/lib/ai-coach/learning/fast-cycle.ts

interface ConversationAnalysis {
  conversationId: string;
  userId: string;
  userMessage: string;
  aiResponse: string;
  feedback?: {
    isHelpful: boolean;
    rating?: number;
    comment?: string;
  };
  implicitSignals: ImplicitSignal[];
}

// Eseguito dopo ogni feedback o segnale implicito
async function processFastCycle(analysis: ConversationAnalysis) {
  
  // 1. Identifica pattern
  const pattern = await identifyPattern(analysis);
  
  if (pattern) {
    // 2. Incrementa contatore
    await incrementPatternCount(pattern.id);
    
    // 3. Verifica soglia auto-correzione
    if (pattern.occurrence_count >= pattern.auto_correct_threshold) {
      
      // 4. Applica correzione automatica
      if (pattern.pattern_type === 'negative_feedback_cluster') {
        await addExampleToPrompt(pattern);
      } 
      else if (pattern.pattern_type === 'unanswered_question') {
        await flagForRagAddition(pattern);
      }
      
      // 5. Aggiorna stato
      await updatePatternStatus(pattern.id, 'auto_corrected');
      
      // 6. Log per report settimanale
      await logAutoCorrection(pattern);
    }
  }
  
  // 7. Aggiorna memoria utente se applicabile
  await updateUserMemory(analysis);
}

// Identificazione pattern basata su embedding similarity
async function identifyPattern(analysis: ConversationAnalysis): Promise<Pattern | null> {
  
  // Genera embedding del messaggio utente
  const embedding = await generateEmbedding(analysis.userMessage);
  
  // Cerca pattern simili esistenti
  const similarPatterns = await searchSimilarPatterns(embedding, 0.85);
  
  if (similarPatterns.length > 0) {
    return similarPatterns[0];
  }
  
  // Se feedback negativo, crea nuovo pattern
  if (analysis.feedback?.isHelpful === false || analysis.feedback?.rating <= 2) {
    return await createNewPattern(analysis);
  }
  
  return null;
}
```

### 4.2 Ciclo Lento - Report Settimanale (Prodotto 3)

```typescript
// /src/lib/ai-coach/learning/slow-cycle.ts

// Eseguito ogni Domenica alle 23:00 (cron job)
async function generateWeeklyReport(): Promise<WeeklyReport> {
  
  const weekStart = getLastSunday();
  const weekEnd = getToday();
  
  // 1. Aggrega metriche 12 fattori
  const metrics = await aggregateWeeklyMetrics(weekStart, weekEnd);
  
  // 2. Identifica top issues
  const topIssues = await getTopPatterns({
    status: ['identified', 'auto_corrected'],
    minOccurrences: 3,
    limit: 10
  });
  
  // 3. Genera suggerimenti prompt
  const promptSuggestions = await generatePromptSuggestions(topIssues);
  
  // 4. Genera suggerimenti RAG
  const ragSuggestions = await generateRagSuggestions(topIssues);
  
  // 5. Confronta con settimana precedente
  const comparison = await compareWithLastWeek(metrics);
  
  // 6. Componi report
  const report: WeeklyReport = {
    summary: {
      total_conversations: metrics.p2_quantity_conversations,
      avg_rating: metrics.p2_quality_avg_rating,
      trend_vs_last_week: comparison.rating_trend,
      highlight: generateHighlight(metrics, comparison)
    },
    top_issues: topIssues.map(issue => ({
      description: issue.pattern_description,
      count: issue.occurrence_count,
      impact: calculateImpact(issue),
      suggested_fix: issue.suggested_action
    })),
    suggested_prompt_changes: promptSuggestions,
    suggested_rag_additions: ragSuggestions,
    metrics_12_factors: metrics,
    comparison_last_week: comparison
  };
  
  // 7. Salva report
  await saveWeeklyReport(weekStart, weekEnd, report);
  
  // 8. Notifica Fernando
  await sendNotification('fernando@vitaeology.com', {
    subject: `Vitaeology AI Coach - Report Settimanale ${formatDate(weekStart)}`,
    body: formatReportEmail(report)
  });
  
  return report;
}

// Genera suggerimenti per modifiche prompt
async function generatePromptSuggestions(issues: Pattern[]): Promise<PromptSuggestion[]> {
  
  const suggestions: PromptSuggestion[] = [];
  
  for (const issue of issues) {
    if (issue.pattern_type === 'negative_feedback_cluster') {
      
      // Analizza i feedback negativi
      const feedbacks = await getFeedbacksForPattern(issue.id);
      
      // Genera suggerimento usando AI
      const suggestion = await generateSuggestionWithAI({
        issue_description: issue.pattern_description,
        example_conversations: issue.example_conversation_ids,
        feedback_comments: feedbacks.map(f => f.comment).filter(Boolean),
        current_prompt: await getCurrentPrompt()
      });
      
      suggestions.push({
        change: suggestion.proposed_change,
        reason: issue.pattern_description,
        expected_impact: suggestion.expected_improvement,
        confidence: suggestion.confidence_score,
        pattern_id: issue.id
      });
    }
  }
  
  return suggestions;
}
```

### 4.3 Aggiornamento Metriche Giornaliere

```typescript
// /src/lib/ai-coach/learning/metrics.ts

// Eseguito ogni giorno alle 00:00 (cron job)
async function calculateDailyMetrics(): Promise<void> {
  
  const yesterday = getYesterday();
  
  // PRODOTTO 1: ISTITUZIONE
  const p1_metrics = {
    quantity_components: await countSystemComponents(),
    quality_principle_adherence: await samplePrincipleAdherence(yesterday, 50),
    viability_api_cost: await calculateApiCost(yesterday),
    viability_avg_response_time: await avgResponseTime(yesterday)
  };
  
  // PRODOTTO 2: PRODOTTO GENERATO
  const p2_metrics = {
    quantity_conversations: await countConversations(yesterday),
    quantity_messages: await countMessages(yesterday),
    quality_avg_rating: await avgRating(yesterday),
    quality_helpful_ratio: await helpfulRatio(yesterday),
    viability_exercise_completion_rate: await exerciseCompletionRate(yesterday),
    viability_user_return_rate: await userReturnRate(yesterday)
  };
  
  // PRODOTTO 3: RIPARAZIONE
  const p3_metrics = {
    quantity_improvements: await countImprovements(yesterday),
    quality_improvement_effectiveness: await improvementEffectiveness(yesterday),
    viability_avg_implementation_time: await avgImplementationTime(yesterday)
  };
  
  // PRODOTTO 4: CORREZIONE
  const p4_metrics = {
    quantity_patterns_corrected: await countPatternsCorrected(yesterday),
    quality_error_reduction_rate: await errorReductionRate(yesterday),
    viability_prevention_rate: await preventionRate(yesterday)
  };
  
  // Salva metriche
  await saveDailyMetrics(yesterday, {
    ...p1_metrics,
    ...p2_metrics,
    ...p3_metrics,
    ...p4_metrics
  });
}

// Verifica aderenza ai principi (sampling)
async function samplePrincipleAdherence(date: Date, sampleSize: number): Promise<number> {
  
  // Prendi sample random di conversazioni
  const conversations = await getRandomConversations(date, sampleSize);
  
  let adherentCount = 0;
  
  for (const conv of conversations) {
    // Verifica principi con AI
    const check = await checkPrincipleAdherence(conv.ai_response, {
      principio_validante: true,
      user_agency: true,
      comprensione: true,
      conoscenza_operativa: true
    });
    
    if (check.all_principles_met) {
      adherentCount++;
    }
  }
  
  return adherentCount / sampleSize;
}
```

---

## 5. INTERFACCIA FERNANDO

### 5.1 Dashboard Report Settimanale

```
┌─────────────────────────────────────────────────────────────────────────┐
│  VITAEOLOGY AI COACH - Report Settimanale                               │
│  Periodo: 9-15 Dicembre 2025                                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  📊 RIEPILOGO                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Conversazioni: 147 (+12% vs settimana prec.)                           │
│  Rating medio: 4.3/5 ⭐ (+0.2)                                          │
│  Risposte utili: 89% 👍                                                 │
│  Esercizi completati dopo supporto: 78%                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  ⚠️ TOP 5 ISSUES DA RISOLVERE                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. "Risposte troppo lunghe quando utente è frustrato" (8 occorrenze)   │
│     [Vedi esempi] [Approva fix suggerito] [Modifica] [Ignora]          │
│                                                                         │
│  2. "Manca contenuto su delega in contesto familiare" (6 occorrenze)    │
│     [Vedi esempi] [Aggiungi chunk RAG] [Modifica] [Ignora]             │
│                                                                         │
│  3. "Tono percepito come giudicante su esercizio coraggio" (5 occ.)     │
│     [Vedi esempi] [Approva fix suggerito] [Modifica] [Ignora]          │
│                                                                         │
│  4. ...                                                                  │
│  5. ...                                                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  ✅ CORREZIONI AUTOMATICHE APPLICATE (soglia >5)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  • Aggiunto esempio "risposta breve se utente frustrato" al prompt      │
│  • Flaggato per RAG: "esempi delega con figli adolescenti"              │
│  • Pattern "domanda su orari esercizi" → risposta standard aggiunta     │
│                                                                         │
│  [Rivedi tutte] [Annulla ultima]                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  📈 12 FATTORI - TREND SETTIMANALE                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PRODOTTO 1 (Istituzione)           PRODOTTO 2 (Generato)               │
│  ├─ Quantità: 568 componenti        ├─ Quantità: 147 conv. ↑           │
│  ├─ Qualità: 94% aderenza ↑         ├─ Qualità: 4.3/5 rating ↑        │
│  └─ Viability: €45 costo →          └─ Viability: 78% completion →     │
│                                                                         │
│  PRODOTTO 3 (Riparazione)           PRODOTTO 4 (Correzione)             │
│  ├─ Quantità: 3 miglioramenti       ├─ Quantità: 12 pattern ↑          │
│  ├─ Qualità: 100% efficaci          ├─ Qualità: -15% errori ↑          │
│  └─ Viability: 2h media impl.       └─ Viability: 85% prevenzione      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🎯 AZIONI SUGGERITE QUESTA SETTIMANA                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  □ Approvare 2 modifiche prompt (issue #1 e #3)                         │
│  □ Scrivere 1 nuovo chunk RAG su delega familiare                       │
│  □ Rivedere 3 conversazioni flaggate come "escalation"                  │
│                                                                         │
│  Tempo stimato: 45 minuti                                               │
│                                                                         │
│  [Inizia revisione]                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. IMPLEMENTAZIONE - ROADMAP

### Fase 1: Database (Settimana 1)
- [ ] Creare tabelle SQL in Supabase
- [ ] Configurare RLS policies
- [ ] Creare indexes
- [ ] Test connessione

### Fase 2: Raccolta Dati (Settimana 2)
- [ ] Integrare logging conversazioni
- [ ] Aggiungere UI feedback (👍👎)
- [ ] Implementare tracking segnali impliciti
- [ ] Test raccolta dati

### Fase 3: Ciclo Veloce (Settimana 3)
- [ ] Implementare identificazione pattern
- [ ] Logica auto-correzione con soglie
- [ ] Memoria utente
- [ ] Test end-to-end

### Fase 4: Ciclo Lento (Settimana 4)
- [ ] Cron job metriche giornaliere
- [ ] Cron job report settimanale
- [ ] Dashboard Fernando
- [ ] Email notifiche
- [ ] Test completo

### Fase 5: Refinement (Settimana 5+)
- [ ] Tuning soglie auto-correzione
- [ ] Ottimizzazione query
- [ ] Monitoraggio metriche
- [ ] Iterazioni basate su feedback

---

## 7. CHECKLIST CONFORMITÀ

### Aderenza MEGA_PROMPT v4.2
- [x] Sistema rispetta Principio Validante
- [x] Sistema rispetta User Agency
- [x] Sistema rispetta Comprensione
- [x] Sistema rispetta Conoscenza Operativa
- [x] Correzioni automatiche verificano aderenza principi

### Aderenza Framework 4 Prodotti / 12 Fattori
- [x] Tutti e 4 i prodotti mappati
- [x] Tutti e 12 i fattori misurati
- [x] Bilanciamento Quantità/Qualità/Viability per ogni prodotto
- [x] Ciclo veloce per Prodotto 4
- [x] Ciclo lento per Prodotto 3
- [x] Fernando mantiene controllo su Prodotto 1

---

**FINE DOCUMENTO**

**Data:** 16 Dicembre 2025  
**Versione:** 1.0  
**Status:** Architettura completa - pronta per implementazione
