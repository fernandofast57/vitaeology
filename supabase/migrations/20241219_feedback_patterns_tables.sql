-- =====================================================
-- FEEDBACK PATTERNS - Tables Migration
-- Tabelle per detection automatica pattern da thumbs down
-- =====================================================

-- ============================================================
-- 1. TABELLA: ai_coach_patterns
-- Pattern di problemi identificati nelle risposte AI
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_coach_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificazione pattern
    pattern_type TEXT NOT NULL CHECK (pattern_type IN (
        'troppo_lungo',
        'manca_validazione',
        'troppo_prescrittivo',
        'linguaggio_complesso',
        'off_topic',
        'tono_giudicante',
        'cita_fonti',
        'non_risponde',
        'altro'
    )),
    pattern_name TEXT NOT NULL,
    description TEXT,

    -- Severità
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Configurazione detection
    trigger_phrases TEXT[] DEFAULT '{}',
    regex_patterns TEXT[] DEFAULT '{}',
    min_confidence DECIMAL(3,2) DEFAULT 0.6,

    -- Suggerimenti correzione
    suggested_fix TEXT,

    -- Statistiche
    times_detected INTEGER DEFAULT 0,
    times_confirmed INTEGER DEFAULT 0,
    times_rejected INTEGER DEFAULT 0,
    false_positive_rate DECIMAL(5,4) DEFAULT 0,
    last_detected_at TIMESTAMP WITH TIME ZONE,

    -- Stato
    is_active BOOLEAN DEFAULT true,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_patterns_type ON ai_coach_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_active ON ai_coach_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_patterns_severity ON ai_coach_patterns(severity);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_patterns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_patterns_updated ON ai_coach_patterns;
CREATE TRIGGER trigger_patterns_updated
    BEFORE UPDATE ON ai_coach_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_patterns_timestamp();

-- ============================================================
-- 2. TABELLA: ai_coach_pattern_matches
-- Match rilevati tra conversazioni e pattern
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_coach_pattern_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Riferimenti
    pattern_id UUID NOT NULL REFERENCES ai_coach_patterns(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES ai_coach_conversations(id) ON DELETE CASCADE,

    -- Match details
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    matched_text TEXT,
    feedback_type TEXT, -- thumbs_down, low_rating, etc.

    -- Review status
    reviewed BOOLEAN DEFAULT false,
    confirmed BOOLEAN, -- null = not reviewed, true = correct match, false = false positive
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_matches_pattern ON ai_coach_pattern_matches(pattern_id);
CREATE INDEX IF NOT EXISTS idx_matches_conversation ON ai_coach_pattern_matches(conversation_id);
CREATE INDEX IF NOT EXISTS idx_matches_reviewed ON ai_coach_pattern_matches(reviewed);
CREATE INDEX IF NOT EXISTS idx_matches_created ON ai_coach_pattern_matches(created_at DESC);

-- Unique constraint: un pattern per conversazione
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_unique
ON ai_coach_pattern_matches(pattern_id, conversation_id);

-- ============================================================
-- 3. TABELLA: ai_coach_auto_corrections
-- Correzioni automatiche applicate
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_coach_auto_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Riferimento pattern
    pattern_id UUID REFERENCES ai_coach_patterns(id) ON DELETE SET NULL,

    -- Tipo correzione
    correction_type TEXT NOT NULL CHECK (correction_type IN (
        'prompt_adjustment',
        'add_rag_chunk',
        'flag_for_review',
        'other'
    )),

    -- Contenuto
    description TEXT NOT NULL,
    content TEXT, -- Il contenuto della correzione (prompt snippet, RAG chunk, etc.)

    -- Efficacia
    effectiveness_score DECIMAL(3,2), -- 0-1, calcolato dopo applicazione
    effectiveness_trend DECIMAL(4,3), -- positivo = miglioramento
    last_evaluated_at TIMESTAMP WITH TIME ZONE,

    -- Stato
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'approved',
        'auto_applied',
        'rejected'
    )),
    applied_count INTEGER DEFAULT 0,

    -- Approvazione
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_corrections_pattern ON ai_coach_auto_corrections(pattern_id);
CREATE INDEX IF NOT EXISTS idx_corrections_type ON ai_coach_auto_corrections(correction_type);
CREATE INDEX IF NOT EXISTS idx_corrections_status ON ai_coach_auto_corrections(status);

-- ============================================================
-- 4. SEED: Pattern di esempio
-- ============================================================

INSERT INTO ai_coach_patterns (pattern_type, pattern_name, description, severity, trigger_phrases, suggested_fix)
VALUES
    ('troppo_lungo', 'Risposta eccessivamente lunga', 'La risposta supera i 500 parole senza necessità', 'medium',
     ARRAY['tuttavia', 'inoltre', 'in aggiunta', 'd''altra parte'],
     'Sintetizzare la risposta mantenendo i punti chiave. Max 300 parole.'),

    ('manca_validazione', 'Manca riconoscimento risorse', 'Non riconosce le capacità già presenti nell''utente', 'high',
     ARRAY['dovresti', 'ti manca', 'non hai', 'il problema è'],
     'Iniziare riconoscendo ciò che l''utente già fa bene.'),

    ('troppo_prescrittivo', 'Tono prescrittivo', 'Dà ordini invece di facilitare la riflessione', 'high',
     ARRAY['devi', 'è necessario che', 'assolutamente', 'obbligatorio'],
     'Usare domande aperte invece di imperativi.'),

    ('linguaggio_complesso', 'Linguaggio troppo tecnico', 'Usa termini accademici non accessibili', 'medium',
     ARRAY['paradigma', 'framework', 'implementare', 'ottimizzare', 'scalare'],
     'Sostituire con termini comuni dalla vita quotidiana.'),

    ('cita_fonti', 'Cita fonti esterne', 'Menziona autori, libri o teorie invece di applicare la conoscenza', 'medium',
     ARRAY['secondo', 'come dice', 'la ricerca mostra', 'gli studi dimostrano'],
     'Applicare la conoscenza senza citare fonti.'),

    ('tono_giudicante', 'Tono giudicante', 'Esprime giudizi sulle scelte dell''utente', 'critical',
     ARRAY['sbagliato', 'errore', 'non avresti dovuto', 'purtroppo'],
     'Mantenere neutralità e curiosità genuina.')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. RLS Policies
-- ============================================================

ALTER TABLE ai_coach_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_pattern_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_auto_corrections ENABLE ROW LEVEL SECURITY;

-- Patterns: solo admin possono leggere/modificare
CREATE POLICY "Admin can manage patterns" ON ai_coach_patterns
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR role_id IN (
                SELECT id FROM roles WHERE level >= 80
            ))
        )
    );

-- Matches: solo admin
CREATE POLICY "Admin can manage matches" ON ai_coach_pattern_matches
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR role_id IN (
                SELECT id FROM roles WHERE level >= 80
            ))
        )
    );

-- Corrections: solo admin
CREATE POLICY "Admin can manage corrections" ON ai_coach_auto_corrections
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR role_id IN (
                SELECT id FROM roles WHERE level >= 80
            ))
        )
    );

-- ============================================================
-- 6. FUNCTION: detect_patterns_in_conversation
-- Rileva pattern in una conversazione (chiamata dopo thumbs_down)
-- ============================================================

CREATE OR REPLACE FUNCTION detect_patterns_in_conversation(
    p_conversation_id UUID,
    p_feedback_type TEXT DEFAULT 'thumbs_down'
)
RETURNS INTEGER AS $$
DECLARE
    v_ai_response TEXT;
    v_pattern RECORD;
    v_phrase TEXT;
    v_match_count INTEGER := 0;
    v_confidence DECIMAL(3,2);
    v_matched_text TEXT;
BEGIN
    -- Ottieni risposta AI
    SELECT ai_response INTO v_ai_response
    FROM ai_coach_conversations
    WHERE id = p_conversation_id;

    IF v_ai_response IS NULL THEN
        RETURN 0;
    END IF;

    -- Lowercase per matching
    v_ai_response := LOWER(v_ai_response);

    -- Loop su tutti i pattern attivi
    FOR v_pattern IN
        SELECT id, pattern_type, trigger_phrases, min_confidence
        FROM ai_coach_patterns
        WHERE is_active = true
    LOOP
        v_confidence := 0;
        v_matched_text := '';

        -- Check trigger phrases
        IF v_pattern.trigger_phrases IS NOT NULL THEN
            FOREACH v_phrase IN ARRAY v_pattern.trigger_phrases
            LOOP
                IF v_ai_response LIKE '%' || LOWER(v_phrase) || '%' THEN
                    v_confidence := v_confidence + 0.2;
                    v_matched_text := v_matched_text || v_phrase || ', ';
                END IF;
            END LOOP;
        END IF;

        -- Pattern specifici
        IF v_pattern.pattern_type = 'troppo_lungo' AND LENGTH(v_ai_response) > 2000 THEN
            v_confidence := v_confidence + 0.4;
        END IF;

        -- Se confidence supera soglia, crea match
        IF v_confidence >= COALESCE(v_pattern.min_confidence, 0.6) THEN
            -- Insert match (ignora duplicati)
            INSERT INTO ai_coach_pattern_matches (
                pattern_id,
                conversation_id,
                confidence,
                matched_text,
                feedback_type
            )
            VALUES (
                v_pattern.id,
                p_conversation_id,
                LEAST(v_confidence, 1.0),
                RTRIM(v_matched_text, ', '),
                p_feedback_type
            )
            ON CONFLICT (pattern_id, conversation_id) DO NOTHING;

            -- Incrementa times_detected
            UPDATE ai_coach_patterns
            SET
                times_detected = times_detected + 1,
                last_detected_at = NOW()
            WHERE id = v_pattern.id;

            v_match_count := v_match_count + 1;
        END IF;
    END LOOP;

    RETURN v_match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant
GRANT EXECUTE ON FUNCTION detect_patterns_in_conversation TO authenticated;

-- ============================================================
-- FINE MIGRATION
-- ============================================================

COMMENT ON TABLE ai_coach_patterns IS 'Pattern di problemi identificati nelle risposte AI Coach';
COMMENT ON TABLE ai_coach_pattern_matches IS 'Match tra conversazioni e pattern rilevati';
COMMENT ON TABLE ai_coach_auto_corrections IS 'Correzioni automatiche suggerite/applicate';
COMMENT ON FUNCTION detect_patterns_in_conversation IS 'Rileva pattern problematici in una conversazione dopo feedback negativo';
