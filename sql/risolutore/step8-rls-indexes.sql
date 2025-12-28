-- STEP 8: RLS e Indici

-- Abilita RLS
ALTER TABLE risolutore_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risolutore_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risolutore_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE risolutore_level_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE risolutore_answers ENABLE ROW LEVEL SECURITY;

-- Policy lettura pubblica
DROP POLICY IF EXISTS "Dimensioni leggibili da tutti" ON risolutore_dimensions;
CREATE POLICY "Dimensioni leggibili da tutti" ON risolutore_dimensions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Domande leggibili da tutti" ON risolutore_questions;
CREATE POLICY "Domande leggibili da tutti" ON risolutore_questions FOR SELECT USING (true);

-- Policy risultati
DROP POLICY IF EXISTS "Risultati visibili al proprietario" ON risolutore_results;
CREATE POLICY "Risultati visibili al proprietario" ON risolutore_results
  FOR SELECT USING (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Risultati inseribili dal proprietario" ON risolutore_results;
CREATE POLICY "Risultati inseribili dal proprietario" ON risolutore_results
  FOR INSERT WITH CHECK (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

-- Policy livello
DROP POLICY IF EXISTS "Livello visibile al proprietario" ON risolutore_level_results;
CREATE POLICY "Livello visibile al proprietario" ON risolutore_level_results
  FOR SELECT USING (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Livello inseribile dal proprietario" ON risolutore_level_results;
CREATE POLICY "Livello inseribile dal proprietario" ON risolutore_level_results
  FOR INSERT WITH CHECK (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

-- Policy risposte
DROP POLICY IF EXISTS "Risposte visibili al proprietario" ON risolutore_answers;
CREATE POLICY "Risposte visibili al proprietario" ON risolutore_answers
  FOR SELECT USING (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Risposte inseribili dal proprietario" ON risolutore_answers;
CREATE POLICY "Risposte inseribili dal proprietario" ON risolutore_answers
  FOR INSERT WITH CHECK (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Risposte aggiornabili dal proprietario" ON risolutore_answers;
CREATE POLICY "Risposte aggiornabili dal proprietario" ON risolutore_answers
  FOR UPDATE USING (assessment_id IN (SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()));

-- Indici
CREATE INDEX IF NOT EXISTS idx_risolutore_questions_dimension ON risolutore_questions(dimension_code);
CREATE INDEX IF NOT EXISTS idx_risolutore_results_assessment ON risolutore_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_risolutore_level_results_assessment ON risolutore_level_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_risolutore_answers_assessment ON risolutore_answers(assessment_id);
