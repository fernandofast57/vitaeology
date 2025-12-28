-- STEP 7: RLS e Indici Microfelicità

-- Abilita RLS
ALTER TABLE microfelicita_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE microfelicita_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE microfelicita_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE microfelicita_level_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE microfelicita_answers ENABLE ROW LEVEL SECURITY;

-- Policy lettura pubblica
DROP POLICY IF EXISTS "Dimensioni MF leggibili da tutti" ON microfelicita_dimensions;
CREATE POLICY "Dimensioni MF leggibili da tutti" ON microfelicita_dimensions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Domande MF leggibili da tutti" ON microfelicita_questions;
CREATE POLICY "Domande MF leggibili da tutti" ON microfelicita_questions FOR SELECT USING (true);

-- Policy risultati
DROP POLICY IF EXISTS "Risultati MF visibili al proprietario" ON microfelicita_results;
CREATE POLICY "Risultati MF visibili al proprietario" ON microfelicita_results
  FOR SELECT USING (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Risultati MF inseribili dal proprietario" ON microfelicita_results;
CREATE POLICY "Risultati MF inseribili dal proprietario" ON microfelicita_results
  FOR INSERT WITH CHECK (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

-- Policy livello
DROP POLICY IF EXISTS "Livello MF visibile al proprietario" ON microfelicita_level_results;
CREATE POLICY "Livello MF visibile al proprietario" ON microfelicita_level_results
  FOR SELECT USING (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Livello MF inseribile dal proprietario" ON microfelicita_level_results;
CREATE POLICY "Livello MF inseribile dal proprietario" ON microfelicita_level_results
  FOR INSERT WITH CHECK (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

-- Policy risposte
DROP POLICY IF EXISTS "Risposte MF visibili al proprietario" ON microfelicita_answers;
CREATE POLICY "Risposte MF visibili al proprietario" ON microfelicita_answers
  FOR SELECT USING (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Risposte MF inseribili dal proprietario" ON microfelicita_answers;
CREATE POLICY "Risposte MF inseribili dal proprietario" ON microfelicita_answers
  FOR INSERT WITH CHECK (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Risposte MF aggiornabili dal proprietario" ON microfelicita_answers;
CREATE POLICY "Risposte MF aggiornabili dal proprietario" ON microfelicita_answers
  FOR UPDATE USING (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

-- Indici
CREATE INDEX IF NOT EXISTS idx_microfelicita_questions_dimension ON microfelicita_questions(dimension_code);
CREATE INDEX IF NOT EXISTS idx_microfelicita_results_assessment ON microfelicita_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_microfelicita_level_results_assessment ON microfelicita_level_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_microfelicita_answers_assessment ON microfelicita_answers(assessment_id);
