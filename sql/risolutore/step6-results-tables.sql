-- STEP 6: Tabelle per risultati e risposte
CREATE TABLE IF NOT EXISTS risolutore_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE,
  dimension_code VARCHAR(2) NOT NULL REFERENCES risolutore_dimensions(code),
  score DECIMAL(4,2) NOT NULL,
  percentage INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, dimension_code)
);

CREATE TABLE IF NOT EXISTS risolutore_level_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE UNIQUE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  level_name VARCHAR(50) NOT NULL,
  level_description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risolutore_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES risolutore_questions(id),
  raw_score INTEGER NOT NULL CHECK (raw_score BETWEEN 0 AND 2),
  normalized_score INTEGER NOT NULL CHECK (normalized_score BETWEEN 0 AND 2),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);
