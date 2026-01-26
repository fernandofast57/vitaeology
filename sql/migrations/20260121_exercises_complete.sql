-- =============================================
-- VITAEOLOGY - MIGRATION: EXERCISES COMPLETE
-- Data: 21 Gennaio 2026
-- Conforme a CLAUDE.md v2.6 - Framework Verifica Comprensione
-- =============================================
--
-- Questa migration crea la tabella exercises_complete che supporta:
-- - 3 Livelli di esercizio (fondamentale, applicazione, mentor)
-- - 3 Percorsi (leadership, risolutore, microfelicita)
-- - Prevenzione 3 Barriere (glossary, concrete_examples, prerequisites)
-- - 3 Livelli Comprensione (key_concepts, phases, why_it_works)
-- - 114 esercizi totali
--
-- =============================================

-- Inizio transazione
BEGIN;

-- =============================================
-- SEZIONE 1: DROP VECCHIE STRUTTURE (se esistono)
-- =============================================

-- Nota: manteniamo la tabella exercises legacy per retrocompatibilità
-- La nuova tabella exercises_complete sarà la fonte primaria

DROP TABLE IF EXISTS exercises_complete CASCADE;
DROP TABLE IF EXISTS user_exercise_progress_v2 CASCADE;

-- =============================================
-- SEZIONE 2: TIPI ENUM
-- =============================================

-- Drop existing types if they exist
DO $$ BEGIN
  DROP TYPE IF EXISTS exercise_level CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TYPE IF EXISTS exercise_target CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TYPE IF EXISTS comprehension_level CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TYPE IF EXISTS exercise_type_complete CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create enum types
CREATE TYPE exercise_level AS ENUM ('fondamentale', 'applicazione', 'mentor');
CREATE TYPE exercise_target AS ENUM ('leader', 'mentor', 'all');
CREATE TYPE comprehension_level AS ENUM ('dati_stabili', 'doingness', 'teoria');
CREATE TYPE exercise_type_complete AS ENUM (
  'riflessione',
  'azione',
  'sfida',
  'analisi',
  'feedback',
  'pianificazione',
  'fondamentale',
  'facilitazione'
);

-- =============================================
-- SEZIONE 3: TABELLA EXERCISES_COMPLETE
-- =============================================

CREATE TABLE exercises_complete (
  -- === IDENTIFICAZIONE ===
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE,                    -- Es: "L-F1", "MT-2", "FP-1"
  week_number INTEGER CHECK (week_number BETWEEN 1 AND 52),
  title TEXT NOT NULL,
  subtitle TEXT,

  -- === CATEGORIZZAZIONE ===
  book_slug VARCHAR(50) NOT NULL CHECK (book_slug IN ('leadership', 'risolutore', 'microfelicita')),
  characteristic_slug VARCHAR(50),            -- Collegamento a caratteristica (opzionale)
  dimension_code VARCHAR(10),                 -- Codice dimensione assessment (es: FP, FS, RR)

  pillar VARCHAR(20) CHECK (pillar IN ('Vision', 'Action', 'Relations', 'Adaptation')),
  pillar_it VARCHAR(20) CHECK (pillar_it IN ('ESSERE', 'SENTIRE', 'PENSARE', 'AGIRE')),

  exercise_type exercise_type_complete NOT NULL,
  difficulty_level VARCHAR(20) DEFAULT 'base' CHECK (difficulty_level IN ('base', 'intermedio', 'avanzato')),
  estimated_time_minutes INTEGER DEFAULT 30 CHECK (estimated_time_minutes > 0),

  -- === LIVELLO E TARGET ===
  level exercise_level NOT NULL DEFAULT 'applicazione',
  target exercise_target NOT NULL DEFAULT 'leader',
  quarter VARCHAR(5) CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),

  -- === PREVENZIONE 3 BARRIERE ===
  -- BARRIERA 1: Parole mal comprese
  glossary JSONB NOT NULL DEFAULT '[]',
  -- Formato: [{"term": "...", "definition": "...", "example": "..."}]

  -- BARRIERA 2: Mancanza concretezza
  concrete_examples JSONB NOT NULL DEFAULT '[]',
  -- Formato: [{"situation": "...", "application": "..."}]

  -- BARRIERA 3: Gradiente saltato
  prerequisites TEXT[] DEFAULT '{}',
  -- Lista di prerequisiti (esercizi/concetti che devono essere già compresi)

  -- === LIVELLO 1: DATI STABILI (COSA) ===
  key_concepts JSONB NOT NULL DEFAULT '[]',
  -- Formato: [{"concept": "...", "definition": "...", "why_important": "..."}]

  -- === LIVELLO 2: DOINGNESS (COME) ===
  intro_validante TEXT NOT NULL,              -- Intro che PRESUME la capacità esistente

  phase_1_recognition JSONB NOT NULL DEFAULT '{}',
  -- Formato: {"title": "...", "being_focus": "...", "prompt": "...", "instructions": ["..."]}

  phase_2_pattern JSONB NOT NULL DEFAULT '{}',
  -- Formato: {"title": "...", "doing_focus": "...", "prompt": "...", "guiding_questions": ["..."]}

  phase_3_expansion JSONB NOT NULL DEFAULT '{}',
  -- Formato: {"title": "...", "having_focus": "...", "prompt": "...", "action_steps": ["..."]}

  deliverable TEXT NOT NULL,                  -- Output tangibile richiesto

  -- === LIVELLO 3: TEORIA (PERCHÉ) ===
  why_it_works JSONB NOT NULL DEFAULT '{}',
  -- Formato: {"principle": "...", "explanation": "...", "scientific_basis": "..."}

  -- === VERIFICA COMPRENSIONE ===
  reflection_prompts JSONB NOT NULL DEFAULT '[]',
  -- Formato: [{"level": "dati_stabili|doingness|teoria", "question": "..."}]

  -- === SUPPORTO ===
  failure_response TEXT,                      -- Risposta validante se non completa
  ai_coach_hints TEXT[] DEFAULT '{}',         -- Suggerimenti per AI Coach Fernando

  -- === METADATA ===
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',

  -- === TIMESTAMPS ===
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commenti sulla tabella
COMMENT ON TABLE exercises_complete IS 'Esercizi Vitaeology conformi a CLAUDE.md v2.6 - Framework Verifica Comprensione';
COMMENT ON COLUMN exercises_complete.code IS 'Codice univoco esercizio (es: L-F1 = Leadership Fondamentale 1)';
COMMENT ON COLUMN exercises_complete.level IS 'fondamentale: comprensione base | applicazione: pratica personale | mentor: facilitazione';
COMMENT ON COLUMN exercises_complete.target IS 'leader: tier Leader+ | mentor: solo tier Mentor | all: tutti';
COMMENT ON COLUMN exercises_complete.glossary IS 'Termini da definire per prevenire parola mal compresa';
COMMENT ON COLUMN exercises_complete.concrete_examples IS 'Esempi concreti per prevenire mancanza concretezza';
COMMENT ON COLUMN exercises_complete.prerequisites IS 'Esercizi/concetti prerequisiti per prevenire gradiente saltato';
COMMENT ON COLUMN exercises_complete.key_concepts IS 'Concetti chiave (DATI STABILI - COSA)';
COMMENT ON COLUMN exercises_complete.intro_validante IS 'Introduzione che presume la capacità già esistente';
COMMENT ON COLUMN exercises_complete.phase_1_recognition IS 'Fase ESSERE - Riconoscimento';
COMMENT ON COLUMN exercises_complete.phase_2_pattern IS 'Fase FARE - Pattern';
COMMENT ON COLUMN exercises_complete.phase_3_expansion IS 'Fase AVERE - Espansione';
COMMENT ON COLUMN exercises_complete.why_it_works IS 'Spiegazione teorica (TEORIA - PERCHÉ)';
COMMENT ON COLUMN exercises_complete.reflection_prompts IS 'Domande di verifica per i 3 livelli di comprensione';

-- =============================================
-- SEZIONE 4: INDICI
-- =============================================

-- Indici principali
CREATE INDEX idx_exercises_complete_book ON exercises_complete(book_slug);
CREATE INDEX idx_exercises_complete_level ON exercises_complete(level);
CREATE INDEX idx_exercises_complete_target ON exercises_complete(target);
CREATE INDEX idx_exercises_complete_type ON exercises_complete(exercise_type);
CREATE INDEX idx_exercises_complete_difficulty ON exercises_complete(difficulty_level);
CREATE INDEX idx_exercises_complete_week ON exercises_complete(week_number);
CREATE INDEX idx_exercises_complete_characteristic ON exercises_complete(characteristic_slug);
CREATE INDEX idx_exercises_complete_dimension ON exercises_complete(dimension_code);
CREATE INDEX idx_exercises_complete_pillar ON exercises_complete(pillar);
CREATE INDEX idx_exercises_complete_active ON exercises_complete(is_active);

-- Indice composto per query comuni
CREATE INDEX idx_exercises_complete_book_level ON exercises_complete(book_slug, level);
CREATE INDEX idx_exercises_complete_book_target ON exercises_complete(book_slug, target);
CREATE INDEX idx_exercises_complete_level_target ON exercises_complete(level, target);

-- Indice GIN per ricerca full-text su titolo
CREATE INDEX idx_exercises_complete_title_search ON exercises_complete USING gin(to_tsvector('italian', title));

-- Indici GIN per campi JSONB
CREATE INDEX idx_exercises_complete_glossary ON exercises_complete USING gin(glossary);
CREATE INDEX idx_exercises_complete_key_concepts ON exercises_complete USING gin(key_concepts);
CREATE INDEX idx_exercises_complete_tags ON exercises_complete USING gin(tags);

-- =============================================
-- SEZIONE 5: TRIGGER UPDATED_AT
-- =============================================

-- Funzione per aggiornare updated_at (se non esiste già)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per exercises_complete
DROP TRIGGER IF EXISTS update_exercises_complete_updated_at ON exercises_complete;
CREATE TRIGGER update_exercises_complete_updated_at
  BEFORE UPDATE ON exercises_complete
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEZIONE 6: ROW LEVEL SECURITY
-- =============================================

-- Abilita RLS
ALTER TABLE exercises_complete ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere gli esercizi attivi
DROP POLICY IF EXISTS "Anyone can view active exercises" ON exercises_complete;
CREATE POLICY "Anyone can view active exercises"
  ON exercises_complete FOR SELECT
  USING (is_active = TRUE);

-- Policy: Solo admin possono modificare
DROP POLICY IF EXISTS "Only admins can modify exercises" ON exercises_complete;
CREATE POLICY "Only admins can modify exercises"
  ON exercises_complete FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- =============================================
-- SEZIONE 7: TABELLA PROGRESSO UTENTE (V2)
-- =============================================

CREATE TABLE user_exercise_progress_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises_complete(id) ON DELETE CASCADE,

  -- Status
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Contenuto utente
  notes TEXT,
  reflection_answers JSONB DEFAULT '{}',
  -- Formato: {"question_index": "answer", ...}

  action_checklist JSONB DEFAULT '[]',
  -- Formato: [{"id": "...", "text": "...", "completed": true/false}]

  -- Valutazioni
  rating_difficulty INTEGER CHECK (rating_difficulty BETWEEN 1 AND 5),
  rating_usefulness INTEGER CHECK (rating_usefulness BETWEEN 1 AND 5),
  feedback TEXT,

  -- NUOVO: Tracking comprensione per livello
  comprehension_verified JSONB DEFAULT '{"dati_stabili": false, "doingness": false, "teoria": false}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint unico
  UNIQUE(user_id, exercise_id)
);

-- Indici per progresso
CREATE INDEX idx_user_progress_v2_user ON user_exercise_progress_v2(user_id);
CREATE INDEX idx_user_progress_v2_exercise ON user_exercise_progress_v2(exercise_id);
CREATE INDEX idx_user_progress_v2_status ON user_exercise_progress_v2(status);
CREATE INDEX idx_user_progress_v2_user_status ON user_exercise_progress_v2(user_id, status);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_user_progress_v2_updated_at ON user_exercise_progress_v2;
CREATE TRIGGER update_user_progress_v2_updated_at
  BEFORE UPDATE ON user_exercise_progress_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS per progresso
ALTER TABLE user_exercise_progress_v2 ENABLE ROW LEVEL SECURITY;

-- Policy: Utenti vedono solo il proprio progresso
DROP POLICY IF EXISTS "Users can view own progress" ON user_exercise_progress_v2;
CREATE POLICY "Users can view own progress"
  ON user_exercise_progress_v2 FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Utenti possono modificare solo il proprio progresso
DROP POLICY IF EXISTS "Users can modify own progress" ON user_exercise_progress_v2;
CREATE POLICY "Users can modify own progress"
  ON user_exercise_progress_v2 FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Admin possono vedere tutto
DROP POLICY IF EXISTS "Admins can view all progress" ON user_exercise_progress_v2;
CREATE POLICY "Admins can view all progress"
  ON user_exercise_progress_v2 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- =============================================
-- SEZIONE 8: VISTE UTILI
-- =============================================

-- Vista: Esercizi con conteggio per categoria
DROP VIEW IF EXISTS exercises_stats;
CREATE VIEW exercises_stats AS
SELECT
  book_slug,
  level,
  target,
  difficulty_level,
  COUNT(*) as count
FROM exercises_complete
WHERE is_active = TRUE
GROUP BY book_slug, level, target, difficulty_level
ORDER BY book_slug, level, target, difficulty_level;

-- Vista: Esercizi per percorso con dettagli
DROP VIEW IF EXISTS exercises_by_path;
CREATE VIEW exercises_by_path AS
SELECT
  e.id,
  e.code,
  e.title,
  e.subtitle,
  e.book_slug,
  e.level,
  e.target,
  e.difficulty_level,
  e.exercise_type,
  e.estimated_time_minutes,
  e.pillar_it,
  e.week_number,
  e.sort_order,
  jsonb_array_length(e.glossary) as glossary_count,
  jsonb_array_length(e.concrete_examples) as examples_count,
  jsonb_array_length(e.key_concepts) as concepts_count,
  jsonb_array_length(e.reflection_prompts) as prompts_count,
  e.is_active
FROM exercises_complete e
WHERE e.is_active = TRUE
ORDER BY e.book_slug, e.level, e.sort_order;

-- Vista: Progresso utente con dettagli esercizio
DROP VIEW IF EXISTS user_exercises_with_progress;
CREATE VIEW user_exercises_with_progress AS
SELECT
  e.*,
  p.user_id,
  p.status,
  p.started_at,
  p.completed_at,
  p.comprehension_verified,
  p.rating_difficulty,
  p.rating_usefulness
FROM exercises_complete e
LEFT JOIN user_exercise_progress_v2 p ON e.id = p.exercise_id
WHERE e.is_active = TRUE;

-- =============================================
-- SEZIONE 9: FUNZIONI HELPER
-- =============================================

-- Funzione: Ottieni esercizi per utente con accesso basato su tier
CREATE OR REPLACE FUNCTION get_exercises_for_user(
  p_user_id UUID,
  p_book_slug VARCHAR DEFAULT NULL,
  p_level exercise_level DEFAULT NULL
)
RETURNS TABLE (
  exercise_id UUID,
  code VARCHAR,
  title TEXT,
  level exercise_level,
  target exercise_target,
  has_access BOOLEAN,
  progress_status VARCHAR
) AS $$
DECLARE
  v_user_tier VARCHAR;
BEGIN
  -- Ottieni il tier dell'utente
  SELECT COALESCE(subscription_tier, 'challenge') INTO v_user_tier
  FROM profiles
  WHERE id = p_user_id;

  RETURN QUERY
  SELECT
    e.id as exercise_id,
    e.code,
    e.title,
    e.level,
    e.target,
    CASE
      WHEN e.target = 'all' THEN TRUE
      WHEN e.target = 'leader' AND v_user_tier IN ('leader', 'mentor') THEN TRUE
      WHEN e.target = 'mentor' AND v_user_tier = 'mentor' THEN TRUE
      ELSE FALSE
    END as has_access,
    COALESCE(p.status, 'not_started') as progress_status
  FROM exercises_complete e
  LEFT JOIN user_exercise_progress_v2 p ON e.id = p.exercise_id AND p.user_id = p_user_id
  WHERE e.is_active = TRUE
    AND (p_book_slug IS NULL OR e.book_slug = p_book_slug)
    AND (p_level IS NULL OR e.level = p_level)
  ORDER BY e.book_slug, e.level, e.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Conta esercizi completati per livello di comprensione
CREATE OR REPLACE FUNCTION get_comprehension_stats(p_user_id UUID)
RETURNS TABLE (
  book_slug VARCHAR,
  level exercise_level,
  total_exercises BIGINT,
  completed_exercises BIGINT,
  dati_stabili_verified BIGINT,
  doingness_verified BIGINT,
  teoria_verified BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.book_slug,
    e.level,
    COUNT(e.id) as total_exercises,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_exercises,
    COUNT(CASE WHEN (p.comprehension_verified->>'dati_stabili')::boolean = true THEN 1 END) as dati_stabili_verified,
    COUNT(CASE WHEN (p.comprehension_verified->>'doingness')::boolean = true THEN 1 END) as doingness_verified,
    COUNT(CASE WHEN (p.comprehension_verified->>'teoria')::boolean = true THEN 1 END) as teoria_verified
  FROM exercises_complete e
  LEFT JOIN user_exercise_progress_v2 p ON e.id = p.exercise_id AND p.user_id = p_user_id
  WHERE e.is_active = TRUE
  GROUP BY e.book_slug, e.level
  ORDER BY e.book_slug, e.level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Valida struttura esercizio (per admin)
CREATE OR REPLACE FUNCTION validate_exercise_structure(p_exercise_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_exercise exercises_complete;
  v_errors TEXT[] := '{}';
  v_warnings TEXT[] := '{}';
  v_reflection_levels TEXT[];
BEGIN
  SELECT * INTO v_exercise FROM exercises_complete WHERE id = p_exercise_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'errors', ARRAY['Esercizio non trovato']);
  END IF;

  -- PREVENZIONE BARRIERE
  IF jsonb_array_length(v_exercise.glossary) = 0 THEN
    v_warnings := array_append(v_warnings, 'Glossario vuoto - verificare termini');
  END IF;

  IF jsonb_array_length(v_exercise.concrete_examples) < 2 THEN
    v_errors := array_append(v_errors, 'Servono almeno 2 esempi concreti');
  END IF;

  -- DATI STABILI
  IF jsonb_array_length(v_exercise.key_concepts) = 0 THEN
    v_errors := array_append(v_errors, 'Mancano i concetti chiave');
  END IF;

  -- DOINGNESS
  IF v_exercise.intro_validante IS NULL OR v_exercise.intro_validante = '' THEN
    v_errors := array_append(v_errors, 'Manca intro validante');
  END IF;

  IF v_exercise.phase_1_recognition->>'instructions' IS NULL THEN
    v_errors := array_append(v_errors, 'Fase 1 senza istruzioni');
  END IF;

  IF v_exercise.phase_2_pattern->>'guiding_questions' IS NULL THEN
    v_errors := array_append(v_errors, 'Fase 2 senza domande guida');
  END IF;

  IF v_exercise.phase_3_expansion->>'action_steps' IS NULL THEN
    v_errors := array_append(v_errors, 'Fase 3 senza passi azione');
  END IF;

  IF v_exercise.deliverable IS NULL OR v_exercise.deliverable = '' THEN
    v_errors := array_append(v_errors, 'Manca deliverable');
  END IF;

  -- TEORIA
  IF v_exercise.why_it_works->>'principle' IS NULL OR v_exercise.why_it_works->>'explanation' IS NULL THEN
    v_errors := array_append(v_errors, 'Manca spiegazione teorica');
  END IF;

  -- VERIFICA COMPRENSIONE
  SELECT array_agg(DISTINCT r->>'level')
  INTO v_reflection_levels
  FROM jsonb_array_elements(v_exercise.reflection_prompts) r;

  IF NOT 'dati_stabili' = ANY(v_reflection_levels) THEN
    v_errors := array_append(v_errors, 'Manca domanda per Dati Stabili');
  END IF;

  IF NOT 'doingness' = ANY(v_reflection_levels) THEN
    v_errors := array_append(v_errors, 'Manca domanda per Doingness');
  END IF;

  IF NOT 'teoria' = ANY(v_reflection_levels) THEN
    v_errors := array_append(v_errors, 'Manca domanda per Teoria');
  END IF;

  -- SUPPORTO
  IF v_exercise.failure_response IS NULL OR v_exercise.failure_response = '' THEN
    v_warnings := array_append(v_warnings, 'Manca risposta per fallimento');
  END IF;

  RETURN jsonb_build_object(
    'valid', array_length(v_errors, 1) IS NULL OR array_length(v_errors, 1) = 0,
    'errors', v_errors,
    'warnings', v_warnings
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEZIONE 10: GRANT PERMISSIONS
-- =============================================

-- Permessi per utenti autenticati
GRANT SELECT ON exercises_complete TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_exercise_progress_v2 TO authenticated;
GRANT SELECT ON exercises_stats TO authenticated;
GRANT SELECT ON exercises_by_path TO authenticated;
GRANT SELECT ON user_exercises_with_progress TO authenticated;
GRANT EXECUTE ON FUNCTION get_exercises_for_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_comprehension_stats TO authenticated;

-- Permessi per service role (admin)
GRANT ALL ON exercises_complete TO service_role;
GRANT ALL ON user_exercise_progress_v2 TO service_role;
GRANT EXECUTE ON FUNCTION validate_exercise_structure TO service_role;

-- =============================================
-- SEZIONE 11: VERIFICA FINALE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=============================================';
  RAISE NOTICE 'MIGRATION COMPLETATA: exercises_complete';
  RAISE NOTICE '=============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tabelle create:';
  RAISE NOTICE '  - exercises_complete (esercizi conformi CLAUDE.md v2.6)';
  RAISE NOTICE '  - user_exercise_progress_v2 (progresso con comprensione)';
  RAISE NOTICE '';
  RAISE NOTICE 'Viste create:';
  RAISE NOTICE '  - exercises_stats';
  RAISE NOTICE '  - exercises_by_path';
  RAISE NOTICE '  - user_exercises_with_progress';
  RAISE NOTICE '';
  RAISE NOTICE 'Funzioni create:';
  RAISE NOTICE '  - get_exercises_for_user(user_id, book_slug, level)';
  RAISE NOTICE '  - get_comprehension_stats(user_id)';
  RAISE NOTICE '  - validate_exercise_structure(exercise_id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Prossimi passi:';
  RAISE NOTICE '  1. Eseguire seed dei 114 esercizi';
  RAISE NOTICE '  2. Migrare dati da exercises legacy';
  RAISE NOTICE '';
END $$;

-- Commit transazione
COMMIT;
