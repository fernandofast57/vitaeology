-- STEP 7: Aggiorna constraint su user_assessments_v2
ALTER TABLE user_assessments_v2
  DROP CONSTRAINT IF EXISTS user_assessments_v2_assessment_type_check;

ALTER TABLE user_assessments_v2
  ADD CONSTRAINT user_assessments_v2_assessment_type_check
  CHECK (assessment_type IN ('lite', 'full', 'risolutore', 'microfelicita'));
