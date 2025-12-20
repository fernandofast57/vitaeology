-- =====================================================
-- QUALITY AUDIT - Functions & Views Migration
-- Helper functions per dashboard valutazione qualità AI Coach
-- =====================================================

-- ============================================================
-- 1. FUNCTION: increment_pattern_counter
-- Incrementa contatori pattern e ricalcola false_positive_rate
-- ============================================================

CREATE OR REPLACE FUNCTION increment_pattern_counter(
    p_pattern_id UUID,
    p_field TEXT
)
RETURNS VOID AS $$
DECLARE
    v_times_detected INTEGER;
    v_times_rejected INTEGER;
    v_new_fpr DECIMAL(5,4);
BEGIN
    -- Validazione campo
    IF p_field NOT IN ('times_detected', 'times_confirmed', 'times_rejected') THEN
        RAISE EXCEPTION 'Campo non valido: %. Usa times_detected, times_confirmed o times_rejected', p_field;
    END IF;

    -- Incrementa il campo specificato
    IF p_field = 'times_detected' THEN
        UPDATE ai_coach_patterns
        SET
            times_detected = times_detected + 1,
            last_detected_at = NOW(),
            updated_at = NOW()
        WHERE id = p_pattern_id;

    ELSIF p_field = 'times_confirmed' THEN
        UPDATE ai_coach_patterns
        SET
            times_confirmed = times_confirmed + 1,
            updated_at = NOW()
        WHERE id = p_pattern_id;

    ELSIF p_field = 'times_rejected' THEN
        UPDATE ai_coach_patterns
        SET
            times_rejected = times_rejected + 1,
            updated_at = NOW()
        WHERE id = p_pattern_id;
    END IF;

    -- Ricalcola false_positive_rate
    SELECT times_detected, times_rejected
    INTO v_times_detected, v_times_rejected
    FROM ai_coach_patterns
    WHERE id = p_pattern_id;

    IF v_times_detected > 0 THEN
        v_new_fpr := v_times_rejected::DECIMAL / v_times_detected;
    ELSE
        v_new_fpr := 0;
    END IF;

    UPDATE ai_coach_patterns
    SET false_positive_rate = v_new_fpr
    WHERE id = p_pattern_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permessi
GRANT EXECUTE ON FUNCTION increment_pattern_counter TO authenticated;

-- ============================================================
-- 2. FUNCTION: sample_conversations_for_audit
-- Campiona conversazioni con logica di priorità
-- ============================================================

CREATE OR REPLACE FUNCTION sample_conversations_for_audit(
    sample_size INTEGER DEFAULT 10
)
RETURNS TABLE (
    conversation_id UUID,
    message_id UUID,
    ai_response TEXT,
    user_message TEXT,
    user_rating INTEGER,
    feedback_type TEXT,
    priority_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH
    -- Priorità 1: thumbs_down ultimi 7 giorni non ancora auditati
    priority_1 AS (
        SELECT
            c.id as conv_id,
            c.id as msg_id,
            c.ai_response,
            c.user_message,
            c.user_rating,
            c.feedback_type,
            1 as priority,
            c.created_at
        FROM ai_coach_conversations c
        WHERE c.feedback_type = 'thumbs_down'
          AND c.created_at >= NOW() - INTERVAL '7 days'
          AND c.ai_response IS NOT NULL
          AND c.ai_response != ''
          AND NOT EXISTS (
              SELECT 1 FROM ai_coach_quality_audits a
              WHERE a.conversation_id = c.id
          )
        ORDER BY c.created_at DESC
        LIMIT sample_size
    ),

    -- Priorità 2: rating 1-2 ultimi 7 giorni
    priority_2 AS (
        SELECT
            c.id as conv_id,
            c.id as msg_id,
            c.ai_response,
            c.user_message,
            c.user_rating,
            c.feedback_type,
            2 as priority,
            c.created_at
        FROM ai_coach_conversations c
        WHERE c.user_rating IN (1, 2)
          AND c.created_at >= NOW() - INTERVAL '7 days'
          AND c.ai_response IS NOT NULL
          AND c.ai_response != ''
          AND NOT EXISTS (
              SELECT 1 FROM ai_coach_quality_audits a
              WHERE a.conversation_id = c.id
          )
          AND c.id NOT IN (SELECT conv_id FROM priority_1)
        ORDER BY c.user_rating ASC, c.created_at DESC
        LIMIT sample_size
    ),

    -- Priorità 3: campione random (ultimi 14 giorni)
    priority_3 AS (
        SELECT
            c.id as conv_id,
            c.id as msg_id,
            c.ai_response,
            c.user_message,
            c.user_rating,
            c.feedback_type,
            3 as priority,
            c.created_at
        FROM ai_coach_conversations c
        WHERE c.created_at >= NOW() - INTERVAL '14 days'
          AND c.ai_response IS NOT NULL
          AND c.ai_response != ''
          AND NOT EXISTS (
              SELECT 1 FROM ai_coach_quality_audits a
              WHERE a.conversation_id = c.id
          )
          AND c.id NOT IN (SELECT conv_id FROM priority_1)
          AND c.id NOT IN (SELECT conv_id FROM priority_2)
        ORDER BY RANDOM()
        LIMIT sample_size
    ),

    -- Combina tutte le priorità
    all_samples AS (
        SELECT * FROM priority_1
        UNION ALL
        SELECT * FROM priority_2
        UNION ALL
        SELECT * FROM priority_3
    )

    SELECT
        conv_id as conversation_id,
        msg_id as message_id,
        all_samples.ai_response,
        all_samples.user_message,
        all_samples.user_rating,
        all_samples.feedback_type,
        priority as priority_level,
        all_samples.created_at
    FROM all_samples
    ORDER BY priority ASC, created_at DESC
    LIMIT sample_size;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permessi
GRANT EXECUTE ON FUNCTION sample_conversations_for_audit TO authenticated;

-- ============================================================
-- 3. VIEW: v_audit_weekly_summary
-- Riepilogo settimanale audit con medie per principio
-- ============================================================

DROP VIEW IF EXISTS v_audit_weekly_summary;

CREATE VIEW v_audit_weekly_summary AS
SELECT
    DATE_TRUNC('week', created_at)::DATE as week_start,
    COUNT(*) as total_audits,

    -- Score medio globale
    ROUND(AVG(score_medio)::DECIMAL, 2) as avg_score,

    -- Media per ogni principio
    ROUND(AVG(score_validante)::DECIMAL, 2) as avg_validante,
    ROUND(AVG(score_user_agency)::DECIMAL, 2) as avg_agency,
    ROUND(AVG(score_comprensione)::DECIMAL, 2) as avg_comprensione,
    ROUND(AVG(score_conoscenza_operativa)::DECIMAL, 2) as avg_operativa,

    -- Conteggi per categoria
    COUNT(*) FILTER (WHERE score_medio < 3.0) as needs_action_count,
    COUNT(*) FILTER (WHERE score_medio >= 4.0) as excellent_count,
    COUNT(*) FILTER (WHERE score_medio < 3.0) as poor_count,

    -- Min/Max per range
    MIN(score_medio) as min_score,
    MAX(score_medio) as max_score,

    -- Distribuzione issues (top 3 più frequenti)
    (
        SELECT ARRAY_AGG(issue ORDER BY cnt DESC)
        FROM (
            SELECT UNNEST(issues) as issue, COUNT(*) as cnt
            FROM ai_coach_quality_audits sub
            WHERE DATE_TRUNC('week', sub.created_at) = DATE_TRUNC('week', ai_coach_quality_audits.created_at)
            GROUP BY issue
            LIMIT 3
        ) top_issues
    ) as top_issues_week

FROM ai_coach_quality_audits
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

-- Grant permessi sulla view
GRANT SELECT ON v_audit_weekly_summary TO authenticated;

-- ============================================================
-- 4. VIEW: v_top_patterns
-- Pattern più rilevati con statistiche
-- ============================================================

DROP VIEW IF EXISTS v_top_patterns;

CREATE VIEW v_top_patterns AS
SELECT
    p.id,
    p.pattern_type,
    p.pattern_name,
    p.description,
    p.severity,
    p.times_detected,
    p.times_confirmed,
    p.times_rejected,
    p.false_positive_rate,
    p.last_detected_at,
    p.is_active,
    p.created_at,
    p.updated_at,

    -- Calcoli derivati
    CASE
        WHEN p.times_detected > 0 THEN
            ROUND((p.times_confirmed::DECIMAL / p.times_detected) * 100, 1)
        ELSE 0
    END as confirmation_rate_pct,

    CASE
        WHEN p.times_detected > 0 THEN
            ROUND((p.times_rejected::DECIMAL / p.times_detected) * 100, 1)
        ELSE 0
    END as rejection_rate_pct,

    -- Classificazione affidabilità
    CASE
        WHEN p.times_detected >= 20 AND p.false_positive_rate < 0.1 THEN 'high'
        WHEN p.times_detected >= 10 AND p.false_positive_rate < 0.25 THEN 'medium'
        WHEN p.times_detected >= 5 THEN 'low'
        ELSE 'insufficient_data'
    END as reliability_level,

    -- Trend recente (rilevazioni ultima settimana vs precedente)
    -- Questo è un placeholder, in produzione si userebbe una subquery con date
    CASE
        WHEN p.last_detected_at >= NOW() - INTERVAL '7 days' THEN 'active'
        WHEN p.last_detected_at >= NOW() - INTERVAL '30 days' THEN 'moderate'
        ELSE 'dormant'
    END as activity_status

FROM ai_coach_patterns p
WHERE p.is_active = true
ORDER BY p.times_detected DESC, p.last_detected_at DESC NULLS LAST;

-- Grant permessi sulla view
GRANT SELECT ON v_top_patterns TO authenticated;

-- ============================================================
-- 5. FUNCTION: get_audit_stats_by_period
-- Statistiche audit per periodo personalizzato
-- ============================================================

CREATE OR REPLACE FUNCTION get_audit_stats_by_period(
    p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    period_start DATE,
    period_end DATE,
    total_audits BIGINT,
    avg_score DECIMAL(3,2),
    avg_validante DECIMAL(3,2),
    avg_agency DECIMAL(3,2),
    avg_comprensione DECIMAL(3,2),
    avg_operativa DECIMAL(3,2),
    excellent_pct DECIMAL(5,2),
    poor_pct DECIMAL(5,2),
    top_issues TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH audit_data AS (
        SELECT
            a.score_medio,
            a.score_validante,
            a.score_user_agency,
            a.score_comprensione,
            a.score_conoscenza_operativa,
            a.issues
        FROM ai_coach_quality_audits a
        WHERE a.created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    issue_counts AS (
        SELECT
            UNNEST(issues) as issue,
            COUNT(*) as cnt
        FROM audit_data
        GROUP BY issue
        ORDER BY cnt DESC
        LIMIT 5
    )
    SELECT
        p_start_date as period_start,
        p_end_date as period_end,
        COUNT(*)::BIGINT as total_audits,
        ROUND(AVG(score_medio)::DECIMAL, 2) as avg_score,
        ROUND(AVG(score_validante)::DECIMAL, 2) as avg_validante,
        ROUND(AVG(score_user_agency)::DECIMAL, 2) as avg_agency,
        ROUND(AVG(score_comprensione)::DECIMAL, 2) as avg_comprensione,
        ROUND(AVG(score_conoscenza_operativa)::DECIMAL, 2) as avg_operativa,
        CASE
            WHEN COUNT(*) > 0 THEN
                ROUND((COUNT(*) FILTER (WHERE score_medio >= 4.0)::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0
        END as excellent_pct,
        CASE
            WHEN COUNT(*) > 0 THEN
                ROUND((COUNT(*) FILTER (WHERE score_medio < 3.0)::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0
        END as poor_pct,
        COALESCE(
            (SELECT ARRAY_AGG(issue ORDER BY cnt DESC) FROM issue_counts),
            '{}'::TEXT[]
        ) as top_issues
    FROM audit_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permessi
GRANT EXECUTE ON FUNCTION get_audit_stats_by_period TO authenticated;

-- ============================================================
-- 6. FUNCTION: get_auditor_leaderboard
-- Classifica auditor per volume e qualità
-- ============================================================

CREATE OR REPLACE FUNCTION get_auditor_leaderboard(
    p_days INTEGER DEFAULT 30,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    auditor_id UUID,
    auditor_email TEXT,
    total_audits BIGINT,
    avg_time_per_audit INTERVAL,
    consistency_score DECIMAL(3,2),
    last_audit_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.auditor_id,
        COALESCE(p.email, 'Unknown') as auditor_email,
        COUNT(*)::BIGINT as total_audits,
        -- Placeholder per tempo medio (richiede tracking timestamps inizio/fine)
        INTERVAL '5 minutes' as avg_time_per_audit,
        -- Consistency: quanto variano i punteggi dell'auditor (bassa varianza = alta consistency)
        CASE
            WHEN COUNT(*) >= 5 THEN
                GREATEST(0, 5.0 - COALESCE(STDDEV(a.score_medio), 0))::DECIMAL(3,2)
            ELSE NULL
        END as consistency_score,
        MAX(a.created_at) as last_audit_at
    FROM ai_coach_quality_audits a
    LEFT JOIN profiles p ON p.id = a.auditor_id
    WHERE a.created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY a.auditor_id, p.email
    ORDER BY COUNT(*) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permessi
GRANT EXECUTE ON FUNCTION get_auditor_leaderboard TO authenticated;

-- ============================================================
-- 7. INDEX per performance query audit
-- ============================================================

-- Index per ricerche temporali
CREATE INDEX IF NOT EXISTS idx_quality_audits_created_week
ON ai_coach_quality_audits (DATE_TRUNC('week', created_at));

-- Index per score ranges
CREATE INDEX IF NOT EXISTS idx_quality_audits_score_range
ON ai_coach_quality_audits (score_medio)
WHERE score_medio IS NOT NULL;

-- Index per auditor + data
CREATE INDEX IF NOT EXISTS idx_quality_audits_auditor_date
ON ai_coach_quality_audits (auditor_id, created_at DESC);

-- Index per conversazioni con feedback negativo (per sampling)
CREATE INDEX IF NOT EXISTS idx_conversations_negative_feedback
ON ai_coach_conversations (created_at DESC)
WHERE feedback_type = 'thumbs_down' OR user_rating IN (1, 2);

-- ============================================================
-- FINE MIGRATION
-- ============================================================

COMMENT ON FUNCTION increment_pattern_counter IS 'Incrementa contatori pattern e ricalcola false_positive_rate';
COMMENT ON FUNCTION sample_conversations_for_audit IS 'Campiona conversazioni per audit con priorità: thumbs_down > rating basso > random';
COMMENT ON VIEW v_audit_weekly_summary IS 'Riepilogo settimanale audit con medie per principio';
COMMENT ON VIEW v_top_patterns IS 'Pattern più rilevati con statistiche di affidabilità';
COMMENT ON FUNCTION get_audit_stats_by_period IS 'Statistiche audit per periodo personalizzato';
COMMENT ON FUNCTION get_auditor_leaderboard IS 'Classifica auditor per volume e consistency';
