-- =============================================
-- INDEXES
-- =============================================

-- ai_coach_conversations
CREATE INDEX IF NOT EXISTS idx_conv_user ON ai_coach_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_session ON ai_coach_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conv_created ON ai_coach_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conv_path ON ai_coach_conversations(current_path);

-- ai_coach_feedback
CREATE INDEX IF NOT EXISTS idx_fb_conversation ON ai_coach_feedback(conversation_id);
CREATE INDEX IF NOT EXISTS idx_fb_user ON ai_coach_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_fb_rating ON ai_coach_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_fb_helpful ON ai_coach_feedback(is_helpful);
CREATE INDEX IF NOT EXISTS idx_fb_created ON ai_coach_feedback(created_at);

-- ai_coach_implicit_signals
CREATE INDEX IF NOT EXISTS idx_sig_conversation ON ai_coach_implicit_signals(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sig_user ON ai_coach_implicit_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_sig_type ON ai_coach_implicit_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_sig_created ON ai_coach_implicit_signals(created_at);

-- ai_coach_patterns
CREATE INDEX IF NOT EXISTS idx_pat_type ON ai_coach_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_pat_status ON ai_coach_patterns(status);
CREATE INDEX IF NOT EXISTS idx_pat_count ON ai_coach_patterns(occurrence_count);

-- ai_coach_prompt_versions
CREATE UNIQUE INDEX IF NOT EXISTS idx_pv_active ON ai_coach_prompt_versions(is_active) WHERE is_active = TRUE;

-- ai_coach_metrics_daily
CREATE INDEX IF NOT EXISTS idx_md_date ON ai_coach_metrics_daily(date);

-- ai_coach_weekly_reports
CREATE UNIQUE INDEX IF NOT EXISTS idx_wr_period ON ai_coach_weekly_reports(week_start, week_end);

-- ai_coach_user_memory
CREATE INDEX IF NOT EXISTS idx_um_user ON ai_coach_user_memory(user_id);

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
  WITH CHECK (true);

-- ai_coach_user_memory
ALTER TABLE ai_coach_user_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own memory" ON ai_coach_user_memory;
CREATE POLICY "Users can view own memory"
  ON ai_coach_user_memory FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage memory" ON ai_coach_user_memory;
CREATE POLICY "System can manage memory"
  ON ai_coach_user_memory FOR ALL
  USING (true);

-- =============================================
-- FUNZIONI HELPER
-- =============================================

-- Funzione per aggiornare updated_at
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
CREATE OR REPLACE FUNCTION increment_pattern_count(p_pattern_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE ai_coach_patterns
    SET
        occurrence_count = occurrence_count + 1,
        last_occurrence = NOW()
    WHERE id = p_pattern_id;
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
    SELECT COUNT(DISTINCT session_id) INTO v_p2_conversations
    FROM ai_coach_conversations WHERE DATE(created_at) = target_date;

    SELECT COUNT(*) INTO v_p2_messages
    FROM ai_coach_conversations WHERE DATE(created_at) = target_date;

    SELECT AVG(rating) INTO v_p2_avg_rating
    FROM ai_coach_feedback f
    JOIN ai_coach_conversations c ON f.conversation_id = c.id
    WHERE DATE(c.created_at) = target_date AND f.rating IS NOT NULL;

    SELECT CASE WHEN COUNT(*) > 0
        THEN COUNT(*) FILTER (WHERE is_helpful = true)::FLOAT / COUNT(*)
        ELSE NULL END INTO v_p2_helpful_ratio
    FROM ai_coach_feedback f
    JOIN ai_coach_conversations c ON f.conversation_id = c.id
    WHERE DATE(c.created_at) = target_date AND f.is_helpful IS NOT NULL;

    SELECT COUNT(*) INTO v_p4_patterns_corrected
    FROM ai_coach_patterns
    WHERE DATE(updated_at) = target_date AND status = 'auto_corrected';

    INSERT INTO ai_coach_metrics_daily (
        date, p2_quantity_conversations, p2_quantity_messages,
        p2_quality_avg_rating, p2_quality_helpful_ratio, p4_quantity_patterns_corrected
    ) VALUES (
        target_date, v_p2_conversations, v_p2_messages,
        v_p2_avg_rating, v_p2_helpful_ratio, v_p4_patterns_corrected
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
    SUM(p2_quantity_conversations) AS total_conversations,
    SUM(p2_quantity_messages) AS total_messages,
    AVG(p2_quality_avg_rating) AS avg_rating,
    AVG(p2_quality_helpful_ratio) AS helpful_ratio,
    SUM(p4_quantity_patterns_corrected) AS patterns_corrected
FROM ai_coach_metrics_daily
GROUP BY DATE_TRUNC('week', date)
ORDER BY week_start DESC;

-- =============================================
-- GRANT per service_role
-- =============================================
GRANT ALL ON ai_coach_patterns TO service_role;
GRANT ALL ON ai_coach_prompt_versions TO service_role;
GRANT ALL ON ai_coach_rag_suggestions TO service_role;
GRANT ALL ON ai_coach_metrics_daily TO service_role;
GRANT ALL ON ai_coach_weekly_reports TO service_role;

-- =============================================
-- COMMENTI DOCUMENTAZIONE
-- =============================================
COMMENT ON TABLE ai_coach_conversations IS 'Prodotto 2: Traccia output generati';
COMMENT ON TABLE ai_coach_feedback IS 'Prodotto 4: Input per correzione (feedback esplicito)';
COMMENT ON TABLE ai_coach_implicit_signals IS 'Prodotto 4: Input per correzione (segnali impliciti)';
COMMENT ON TABLE ai_coach_patterns IS 'Prodotto 4: Pattern identificati per correzione automatica';
COMMENT ON TABLE ai_coach_prompt_versions IS 'Prodotto 1/3: Versioning istituzione';
COMMENT ON TABLE ai_coach_rag_suggestions IS 'Prodotto 3: Suggerimenti RAG';
COMMENT ON TABLE ai_coach_metrics_daily IS '12 Fattori: Metriche giornaliere';
COMMENT ON TABLE ai_coach_weekly_reports IS 'Prodotto 3: Report settimanali';
COMMENT ON TABLE ai_coach_user_memory IS 'Prodotto 2 Viability: Personalizzazione';
