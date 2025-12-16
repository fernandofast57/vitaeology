-- =============================================
-- VITAEOLOGY v2 - SEZIONE 4/8
-- Tabella EXERCISES_V2
-- Eseguire DOPO sezione 3
-- =============================================

DROP TABLE IF EXISTS exercises_v2 CASCADE;

CREATE TABLE exercises_v2 (
  id SERIAL PRIMARY KEY,
  
  -- Identificazione
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),
  title TEXT NOT NULL,
  subtitle TEXT,
  
  -- Collegamento a caratteristica
  characteristic_slug VARCHAR(50) NOT NULL REFERENCES characteristics(slug),
  
  -- Categorizzazione
  pillar VARCHAR(20) NOT NULL CHECK (pillar IN ('Vision', 'Action', 'Relations', 'Adaptation')),
  exercise_type VARCHAR(20) NOT NULL CHECK (exercise_type IN ('riconoscimento', 'espansione', 'sfida', 'integrazione')),
  difficulty_level VARCHAR(20) DEFAULT 'base' CHECK (difficulty_level IN ('base', 'intermedio', 'avanzato')),
  quarter VARCHAR(5) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  
  -- Tempo stimato
  estimated_time_minutes INTEGER DEFAULT 30,
  
  -- Contenuto Validante
  intro_validante TEXT NOT NULL,
  
  -- Le 3 Fasi (ESSERE → FARE → AVERE)
  phase_1_recognition JSONB NOT NULL,
  phase_2_pattern JSONB NOT NULL,
  phase_3_expansion JSONB NOT NULL,
  
  -- Output richiesto
  deliverable TEXT NOT NULL,
  
  -- Riflessione
  reflection_prompts TEXT[] NOT NULL DEFAULT '{}',
  
  -- Risposta se non completa (validante)
  failure_response TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(week_number)
);

-- Indici
CREATE INDEX idx_exercises_v2_week ON exercises_v2(week_number);
CREATE INDEX idx_exercises_v2_characteristic ON exercises_v2(characteristic_slug);
CREATE INDEX idx_exercises_v2_type ON exercises_v2(exercise_type);
CREATE INDEX idx_exercises_v2_quarter ON exercises_v2(quarter);
CREATE INDEX idx_exercises_v2_pillar ON exercises_v2(pillar);

-- Trigger
CREATE TRIGGER update_exercises_v2_updated_at
    BEFORE UPDATE ON exercises_v2
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verifica
DO $$ BEGIN RAISE NOTICE '✅ Sezione 4/8 completata: Tabella exercises_v2 creata'; END $$;
