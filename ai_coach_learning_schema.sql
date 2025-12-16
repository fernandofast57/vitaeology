-- =============================================
-- VITAEOLOGY AI COACH LEARNING SYSTEM
-- Database Schema per Supabase
-- =============================================
-- Versione: 1.0
-- Data: 16 Dicembre 2025
-- Framework: 4 Prodotti / 12 Fattori
-- =============================================

-- Abilita estensione UUID se non già presente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELLA: ai_coach_conversations
-- Traccia tutte le conversazioni con l'AI Coach
-- Prodotto 2: Quantità conversazioni
-- =============================================
CREATE TABLE IF NOT EXISTS ai_coach_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contesto
  session_id UUID NOT NULL,
  current_path VARCHAR(20) CHECK (current_path IN ('leadership', 'problemi', 'benessere')),
  exercise_id INTEGER, -- REFERENCES exercises_v2(id) se esiste
  
  -- Messaggio utente
  user_message TEXT NOT NULL,
  user_message_tokens INTEGER,
  
  -- Risposta AI
  ai_response TEXT NOT NULL,
  ai_response_tokens INTEGER,
  
  -- RAG utilizzato
  rag_chunks_used UUID[],
  rag_similarity_scores FLOAT[],
  
  -- Metriche tempo (Prodotto 1: Viability)
  response_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes per performance
CREATE INDEX IF NOT EXISTS idx_conversations_user ON ai_coach_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON ai_coach_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON ai_coach_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_path ON ai_coach_conversations(current_path);

-- =============================================
-- TABELLA: ai_coach_feedback
-- Feedback esplicito degli utenti
-- Prodotto 2: Qualità (rating) / Prodotto 4: trigger correzioni
-- =============================================
CREATE TABLE IF NOT EXISTS ai_coach_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Feedback quantitativo
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_helpful BOOLEAN,
  
  -- Feedback qualitativo
  comment TEXT,
  
  -- Categorizzazione (per analisi pattern)
  issue_category VARCHAR(50) CHECK (issue_category IN (
    'non_pertinente',
    'troppo_generico', 
    'troppo_lungo',
    'tono_sbagliato',
    'non_validante',
    'confuso',
    'altro'
  )),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_conversation ON ai_coach_feedback(conversation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON ai_coach_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON ai_coach_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_helpful ON ai_coach_feedback(is_helpful);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON ai_coach_feedback(created_at);

-- =============================================
-- TABELLA: ai_coach_implicit_signals
-- Segnali impliciti comportamento utente
-- Prodotto 2: Viability / Prodotto 4: trigger correzioni
-- =============================================
CREATE TABLE IF NOT EXISTS ai_coach_implicit_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  
  -- Tipo segnale
  signal_type VARCHAR(50) NOT NULL CHECK (signal_type IN (
    'reformulated_question',
    'abandoned_conversation',
    'long_pause_before_reply',
    'immediate_new_question',
    'completed_exercise',
    'skipped_exercise',
    'returned_to_topic',
    'escalation_requested'
  )),
  
  -- Metadata aggiuntiva
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_signals_conversation ON ai_coach_implicit_signals(conversation_id);
CREATE INDEX IF NOT EXISTS idx_signals_user ON ai_coach_implicit_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON ai_coach_implicit_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_created ON ai_coach_implicit_signals(created_at);

-- =============================================
-- TABELLA: ai_coach_patterns
-- Pattern ricorrenti identificati
-- Prodotto 4: Correzione automatica
-- =============================================
CREATE TABLE IF NOT EXISTS ai_coach_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificazione pattern
  pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN (
    'unanswered_question',
    'negative_feedback_cluster',
    'reformulation_trigger',
    'abandonment_trigger',
    'success_pattern'
  )),
  
  -- Descrizione
  pattern_description TEXT NOT NULL,
  pattern_keywords TEXT[],
  
  -- Embedding per similarity search
  pattern_embedding vector(1536),
  
  -- Metriche (Prodotto 4: Quantità)
  occurrence_count INTEGER DEFAULT 1,
  first_occurrence TIMESTAMPTZ DEFAULT NOW(),
  last_occurrence TIMESTAMPTZ DEFAULT NOW(),
  
  -- Esempi
  example_conversation_ids UUID[],
  
  -- Stato workflow
  status VARCHAR(20) DEFAULT 'identified' CHECK (status IN (
    'identified',
    'auto_corrected',
    'pending_review',
    'approved',
    'rejected',
    'resolved'
  )),
  
  -- Azioni
  suggested_action TEXT,
  applied_action TEXT,
  
  -- Soglia per auto-correzione
  auto_correct_threshold INTEGER DEFAULT 5,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patterns_type ON ai_coach_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_status ON ai_coach_patterns(status);
CREATE INDEX IF NOT EXISTS idx_patterns_count ON ai_coach_patterns(occurrence_count);
CREATE INDEX IF NOT EXISTS idx_patterns_embedding ON ai_coach_patterns 
  USING ivfflat (pattern_embedding vector_cosine_ops) WITH (lists = 100);

-- =============================================
-- TABELLA: ai_coach_prompt_versions
-- Versioning del prompt system
-- Prodotto 1: Istituzione / Prodotto 3: Riparazione
-- =============================================
CREATE TABLE IF NOT EXISTS ai_coach_prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Versione
  version_number SERIAL,
  version_label VARCHAR(50),
  
  -- Contenuto prompt
  system_prompt TEXT NOT NULL,
  
  -- Modifiche
  changes_description TEXT,
  changes_reason TEXT,
  source_pattern_id UUID REFERENCES ai_coach_patterns(id),
  
  -- Stato
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Metriche pre/post (Prodotto 3: Qualità)
  metrics_before JSONB,
  metrics_after JSONB,
  
  -- Approvazione
  approved_by VARCHAR(100),
  approved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solo una versione attiva alla volta
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_active 
  ON ai_coach_prompt_versions(is_active) WHERE is_active = TRUE;

-- =============================================
-- TABELLA: ai_coach_rag_suggestions
-- Suggerimenti per nuovi chunks RAG
-- Prodotto 3: Riparazione Istituzione
-- =============================================
CREATE TABLE IF NOT EXISTS ai_coach_rag_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Origine
  source_pattern_id UUID REFERENCES ai_coach_patterns(id),
  source_conversation_ids UUID[],
  
  -- Suggerimento
  suggested_content TEXT NOT NULL,
  suggested_keywords TEXT[],
  suggested_book VARCHAR(50) CHECK (suggested_book IN ('leadership', 'problemi', 'benessere')),
  
  -- Stato
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'implemented',
    'rejected'
  )),
  
  -- Se implementato
  implemented_chunk_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ
);

-- =============================================
-- TABELLA: ai_coach_metrics_daily
-- Metriche giornaliere aggregate (12 Fattori)
-- =============================================
CREATE TABLE IF NOT EXISTS ai_coach_metrics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  
  -- PRODOTTO 1: ISTITUZIONE
  p1_quantity_components INTEGER,
  p1_quality_principle_adherence FLOAT,
  p1_viability_api_cost DECIMAL(10,2),
  p1_viability_avg_response_time INTEGER,
  
  -- PRODOTTO 2: PRODOTTO GENERATO  
  p2_quantity_conversations INTEGER,
  p2_quantity_messages INTEGER,
  p2_quality_avg_rating FLOAT,
  p2_quality_helpful_ratio FLOAT,
  p2_viability_exercise_completion_rate FLOAT,
  p2_viability_user_return_rate FLOAT,
  
  -- PRODOTTO 3: RIPARAZIONE
  p3_quantity_improvements INTEGER,
  p3_quality_improvement_effectiveness FLOAT,
  p3_viability_avg_implementation_time INTEGER,
  
  -- PRODOTTO 4: CORREZIONE
  p4_quantity_patterns_corrected INTEGER,
  p4_quality_error_reduction_rate FLOAT,
  p4_viability_prevention_rate FLOAT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index per query temporali
CREATE INDEX IF NOT EXISTS idx_metrics_date ON ai_coach_metrics_daily(date);

-- =============================================
-- TABELLA: ai_coach_weekly_reports
-- Report settimanali per Fernando
-- Prodotto 3: Output per revisione
-- =============================================
CREATE TABLE IF NOT EXISTS ai_coach_weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Periodo
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  
  -- Contenuto report (struttura JSON documentata)
  report_content JSONB NOT NULL,
  
  -- Stato revisione
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'reviewed',
    'actioned'
  )),
  
  -- Azioni prese
  actions_taken JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Unique per periodo
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reports_period 
  ON ai_coach_weekly_reports(week_start, week_end);

-- =============================================
-- TABELLA: ai_coach_user_memory
-- Memoria per-utente (personalizzazione)
-- Prodotto 2: Viability (personalizzazione)
-- =============================================
CREATE TABLE IF NOT EXISTS ai_coach_user_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Preferenze apprese
  communication_style VARCHAR(50) CHECK (communication_style IN (
    'diretto', 'elaborato', 'esempi_pratici'
  )),
  preferred_response_length VARCHAR(20) CHECK (preferred_response_length IN (
    'breve', 'medio', 'dettagliato'
  )),
  
  -- Pattern utente
  common_challenges TEXT[],
  successful_approaches TEXT[],
  trigger_topics TEXT[],
  
  -- Contesto persistente
  key_context JSONB DEFAULT '{}',
  
  -- Note Coach
  coach_notes TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_memory_user ON ai_coach_user_memory(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- ai_coach_conversations
ALTER TABLE ai_coach_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own conversations" ON ai_coach_conversations;
CREATE POLICY "Users can view own conversations"
  ON ai_coach_conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON ai_coach_conversations;
CREATE POLICY "Users can insert own conversations"
  ON ai_coach_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ai_coach_feedback
ALTER TABLE ai_coach_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own feedback" ON ai_coach_feedback;
CREATE POLICY "Users can view own feedback"
  ON ai_coach_feedback FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own feedback" ON ai_coach_feedback;
CREATE POLICY "Users can insert own feedback"
  ON ai_coach_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feedback" ON ai_coach_feedback;
CREATE POLICY "Users can update own feedback"
  ON ai_coach_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- ai_coach_implicit_signals
ALTER TABLE ai_coach_implicit_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own signals" ON ai_coach_implicit_signals;
CREATE POLICY "Users can view own signals"
  ON ai_coach_implicit_signals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert signals" ON ai_coach_implicit_signals;
CREATE POLICY "System can insert signals"
  ON ai_coach_implicit_signals FOR INSERT
  WITH CHECK (true); -- Backend inserisce via service_role

-- ai_coach_user_memory
ALTER TABLE ai_coach_user_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own memory" ON ai_coach_user_memory;
CREATE POLICY "Users can view own memory"
  ON ai_coach_user_memory FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage memory" ON ai_coach_user_memory;
CREATE POLICY "System can manage memory"
  ON ai_coach_user_memory FOR ALL
  USING (true); -- Backend gestisce via service_role

-- =============================================
-- FUNZIONI HELPER
-- =============================================

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per ai_coach_patterns
DROP TRIGGER IF EXISTS update_patterns_updated_at ON ai_coach_patterns;
CREATE TRIGGER update_patterns_updated_at
    BEFORE UPDATE ON ai_coach_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger per ai_coach_user_memory
DROP TRIGGER IF EXISTS update_user_memory_updated_at ON ai_coach_user_memory;
CREATE TRIGGER update_user_memory_updated_at
    BEFORE UPDATE ON ai_coach_user_memory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNZIONE: Incrementa contatore pattern
-- =============================================
CREATE OR REPLACE FUNCTION increment_pattern_count(pattern_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE ai_coach_patterns
    SET 
        occurrence_count = occurrence_count + 1,
        last_occurrence = NOW()
    WHERE id = pattern_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNZIONE: Calcola metriche giornaliere
-- =============================================
CREATE OR REPLACE FUNCTION calculate_daily_metrics(target_date DATE)
RETURNS void AS $$
DECLARE
    v_p2_conversations INTEGER;
    v_p2_messages INTEGER;
    v_p2_avg_rating FLOAT;
    v_p2_helpful_ratio FLOAT;
    v_p4_patterns_corrected INTEGER;
BEGIN
    -- Conta conversazioni
    SELECT COUNT(DISTINCT session_id)
    INTO v_p2_conversations
    FROM ai_coach_conversations
    WHERE DATE(created_at) = target_date;
    
    -- Conta messaggi
    SELECT COUNT(*)
    INTO v_p2_messages
    FROM ai_coach_conversations
    WHERE DATE(created_at) = target_date;
    
    -- Rating medio
    SELECT AVG(rating)
    INTO v_p2_avg_rating
    FROM ai_coach_feedback f
    JOIN ai_coach_conversations c ON f.conversation_id = c.id
    WHERE DATE(c.created_at) = target_date AND f.rating IS NOT NULL;
    
    -- Ratio helpful
    SELECT 
        CASE WHEN COUNT(*) > 0 
        THEN COUNT(*) FILTER (WHERE is_helpful = true)::FLOAT / COUNT(*)
        ELSE NULL END
    INTO v_p2_helpful_ratio
    FROM ai_coach_feedback f
    JOIN ai_coach_conversations c ON f.conversation_id = c.id
    WHERE DATE(c.created_at) = target_date AND f.is_helpful IS NOT NULL;
    
    -- Pattern corretti
    SELECT COUNT(*)
    INTO v_p4_patterns_corrected
    FROM ai_coach_patterns
    WHERE DATE(updated_at) = target_date 
    AND status = 'auto_corrected';
    
    -- Insert o update metriche
    INSERT INTO ai_coach_metrics_daily (
        date,
        p2_quantity_conversations,
        p2_quantity_messages,
        p2_quality_avg_rating,
        p2_quality_helpful_ratio,
        p4_quantity_patterns_corrected
    ) VALUES (
        target_date,
        v_p2_conversations,
        v_p2_messages,
        v_p2_avg_rating,
        v_p2_helpful_ratio,
        v_p4_patterns_corrected
    )
    ON CONFLICT (date) DO UPDATE SET
        p2_quantity_conversations = EXCLUDED.p2_quantity_conversations,
        p2_quantity_messages = EXCLUDED.p2_quantity_messages,
        p2_quality_avg_rating = EXCLUDED.p2_quality_avg_rating,
        p2_quality_helpful_ratio = EXCLUDED.p2_quality_helpful_ratio,
        p4_quantity_patterns_corrected = EXCLUDED.p4_quantity_patterns_corrected;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEW: Dashboard metriche settimanali
-- =============================================
CREATE OR REPLACE VIEW ai_coach_weekly_metrics AS
SELECT 
    DATE_TRUNC('week', date) AS week_start,
    -- Prodotto 2
    SUM(p2_quantity_conversations) AS total_conversations,
    SUM(p2_quantity_messages) AS total_messages,
    AVG(p2_quality_avg_rating) AS avg_rating,
    AVG(p2_quality_helpful_ratio) AS helpful_ratio,
    -- Prodotto 4
    SUM(p4_quantity_patterns_corrected) AS patterns_corrected
FROM ai_coach_metrics_daily
GROUP BY DATE_TRUNC('week', date)
ORDER BY week_start DESC;

-- =============================================
-- GRANT per service_role
-- =============================================
-- Le tabelle di sistema (patterns, metrics, reports, prompt_versions)
-- sono accessibili solo via service_role key dal backend

GRANT ALL ON ai_coach_patterns TO service_role;
GRANT ALL ON ai_coach_prompt_versions TO service_role;
GRANT ALL ON ai_coach_rag_suggestions TO service_role;
GRANT ALL ON ai_coach_metrics_daily TO service_role;
GRANT ALL ON ai_coach_weekly_reports TO service_role;

-- =============================================
-- COMMENTI DOCUMENTAZIONE
-- =============================================
COMMENT ON TABLE ai_coach_conversations IS 'Prodotto 2: Traccia output generati (conversazioni)';
COMMENT ON TABLE ai_coach_feedback IS 'Prodotto 4: Input per correzione (feedback esplicito)';
COMMENT ON TABLE ai_coach_implicit_signals IS 'Prodotto 4: Input per correzione (segnali impliciti)';
COMMENT ON TABLE ai_coach_patterns IS 'Prodotto 4: Pattern identificati per correzione automatica';
COMMENT ON TABLE ai_coach_prompt_versions IS 'Prodotto 1/3: Versioning istituzione e riparazioni';
COMMENT ON TABLE ai_coach_rag_suggestions IS 'Prodotto 3: Suggerimenti per espansione knowledge base';
COMMENT ON TABLE ai_coach_metrics_daily IS '12 Fattori: Metriche giornaliere aggregate';
COMMENT ON TABLE ai_coach_weekly_reports IS 'Prodotto 3: Report settimanali per revisione Fernando';
COMMENT ON TABLE ai_coach_user_memory IS 'Prodotto 2 Viability: Personalizzazione per utente';
