-- STEP 2: Tabella domande (solo struttura)
CREATE TABLE IF NOT EXISTS risolutore_questions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  dimension_code VARCHAR(2) NOT NULL REFERENCES risolutore_dimensions(code),
  question_text TEXT NOT NULL,
  scoring_type VARCHAR(10) NOT NULL CHECK (scoring_type IN ('direct', 'inverse')),
  order_index INTEGER NOT NULL,
  level_group INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
