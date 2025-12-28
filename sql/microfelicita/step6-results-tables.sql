-- STEP 6: Tabelle per risultati e risposte Microfelicità
CREATE TABLE IF NOT EXISTS microfelicita_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE,
  dimension_code VARCHAR(3) NOT NULL REFERENCES microfelicita_dimensions(code),
  score DECIMAL(4,2) NOT NULL,
  percentage INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, dimension_code)
);

-- Tabella per il profilo praticante (3 livelli padroneggiati)
CREATE TABLE IF NOT EXISTS microfelicita_level_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE UNIQUE,
  profile_type VARCHAR(20) NOT NULL CHECK (profile_type IN ('principiante', 'praticante', 'esperto')),
  level1_score INTEGER NOT NULL,
  level2_score INTEGER NOT NULL,
  level3_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS microfelicita_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES microfelicita_questions(id),
  raw_score INTEGER NOT NULL CHECK (raw_score BETWEEN 0 AND 2),
  normalized_score INTEGER NOT NULL CHECK (normalized_score BETWEEN 0 AND 2),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);
