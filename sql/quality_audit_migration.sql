-- =====================================================
-- QUALITY AUDIT - Migration
-- Tabella e RPC per valutazione qualità risposte AI Coach
-- =====================================================

-- 1. Tabella ai_coach_quality_audits
CREATE TABLE IF NOT EXISTS ai_coach_quality_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_coach_conversations(id) ON DELETE CASCADE,
    auditor_id UUID NOT NULL REFERENCES auth.users(id),

    -- Punteggi 1-5 per ogni principio
    score_validante INTEGER CHECK (score_validante >= 1 AND score_validante <= 5),
    score_user_agency INTEGER CHECK (score_user_agency >= 1 AND score_user_agency <= 5),
    score_comprensione INTEGER CHECK (score_comprensione >= 1 AND score_comprensione <= 5),
    score_conoscenza_operativa INTEGER CHECK (score_conoscenza_operativa >= 1 AND score_conoscenza_operativa <= 5),

    -- Score medio calcolato
    score_medio DECIMAL(3,2) GENERATED ALWAYS AS (
        (COALESCE(score_validante, 0) + COALESCE(score_user_agency, 0) +
         COALESCE(score_comprensione, 0) + COALESCE(score_conoscenza_operativa, 0)) / 4.0
    ) STORED,

    -- Problemi identificati (array di stringhe)
    issues TEXT[] DEFAULT '{}',

    -- Note libere
    notes TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_quality_audits_conversation ON ai_coach_quality_audits(conversation_id);
CREATE INDEX IF NOT EXISTS idx_quality_audits_auditor ON ai_coach_quality_audits(auditor_id);
CREATE INDEX IF NOT EXISTS idx_quality_audits_created ON ai_coach_quality_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quality_audits_score ON ai_coach_quality_audits(score_medio DESC);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_quality_audit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quality_audit_updated ON ai_coach_quality_audits;
CREATE TRIGGER trigger_quality_audit_updated
    BEFORE UPDATE ON ai_coach_quality_audits
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_audit_timestamp();

-- 2. RPC per campionamento conversazioni da valutare
-- Seleziona conversazioni random non ancora auditate, con priorità a quelle recenti
CREATE OR REPLACE FUNCTION sample_conversations_for_audit(
    p_limit INTEGER DEFAULT 10,
    p_days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
    id UUID,
    session_id UUID,
    user_id UUID,
    user_message TEXT,
    ai_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    tokens_used INTEGER,
    already_audited BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.session_id,
        c.user_id,
        c.user_message,
        c.ai_response,
        c.created_at,
        c.tokens_used,
        EXISTS(SELECT 1 FROM ai_coach_quality_audits a WHERE a.conversation_id = c.id) as already_audited
    FROM ai_coach_conversations c
    WHERE
        c.created_at >= NOW() - (p_days_back || ' days')::INTERVAL
        AND c.ai_response IS NOT NULL
        AND c.ai_response != ''
        AND NOT EXISTS(SELECT 1 FROM ai_coach_quality_audits a WHERE a.conversation_id = c.id)
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC per statistiche settimanali
CREATE OR REPLACE FUNCTION get_quality_audit_summary(
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    total_audits BIGINT,
    avg_score DECIMAL(3,2),
    excellent_count BIGINT,
    needs_improvement_count BIGINT,
    audits_by_day JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_stats AS (
        SELECT
            DATE(created_at) as audit_date,
            COUNT(*) as daily_count,
            AVG(score_medio) as daily_avg
        FROM ai_coach_quality_audits
        WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
        GROUP BY DATE(created_at)
        ORDER BY audit_date
    )
    SELECT
        (SELECT COUNT(*) FROM ai_coach_quality_audits
         WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL) as total_audits,

        (SELECT ROUND(AVG(score_medio)::DECIMAL, 2) FROM ai_coach_quality_audits
         WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL) as avg_score,

        (SELECT COUNT(*) FROM ai_coach_quality_audits
         WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
         AND score_medio >= 4.0) as excellent_count,

        (SELECT COUNT(*) FROM ai_coach_quality_audits
         WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
         AND score_medio < 3.0) as needs_improvement_count,

        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object(
                'date', audit_date,
                'count', daily_count,
                'avg', ROUND(daily_avg::DECIMAL, 2)
            ) ORDER BY audit_date)
            FROM daily_stats),
            '[]'::jsonb
        ) as audits_by_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC per audit recenti
CREATE OR REPLACE FUNCTION get_recent_audits(
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    score_medio DECIMAL(3,2),
    issues TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    user_message_preview TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.conversation_id,
        a.score_medio,
        a.issues,
        a.created_at,
        LEFT(c.user_message, 60) as user_message_preview
    FROM ai_coach_quality_audits a
    JOIN ai_coach_conversations c ON c.id = a.conversation_id
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Policy RLS (solo admin possono accedere)
ALTER TABLE ai_coach_quality_audits ENABLE ROW LEVEL SECURITY;

-- Policy per lettura - solo admin
CREATE POLICY "Admin can read audits" ON ai_coach_quality_audits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Policy per inserimento - solo admin
CREATE POLICY "Admin can insert audits" ON ai_coach_quality_audits
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Policy per update - solo admin (e solo propri audit)
CREATE POLICY "Admin can update own audits" ON ai_coach_quality_audits
    FOR UPDATE
    USING (
        auditor_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- 6. Grant permessi sulle funzioni
GRANT EXECUTE ON FUNCTION sample_conversations_for_audit TO authenticated;
GRANT EXECUTE ON FUNCTION get_quality_audit_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_audits TO authenticated;

-- =====================================================
-- FINE MIGRATION
-- =====================================================
