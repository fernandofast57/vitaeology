-- STEP 2: Tabella domande Microfelicità (solo struttura)
CREATE TABLE IF NOT EXISTS microfelicita_questions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  dimension_code VARCHAR(3) NOT NULL REFERENCES microfelicita_dimensions(code),
  question_text TEXT NOT NULL,
  scoring_type VARCHAR(10) NOT NULL CHECK (scoring_type IN ('direct', 'inverse')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
