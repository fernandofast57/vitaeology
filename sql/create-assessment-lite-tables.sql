-- ============================================================
-- ASSESSMENT LITE - Tabelle per risposte e risultati
-- Data: 2024-12-26
-- ============================================================

-- 1. Assessment sessions
CREATE TABLE IF NOT EXISTS public.user_assessments_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type VARCHAR(20) NOT NULL DEFAULT 'lite' CHECK (assessment_type IN ('lite', 'full')),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_question_index INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_assessments_v2_user ON user_assessments_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_v2_status ON user_assessments_v2(status);

-- 2. Individual answers
CREATE TABLE IF NOT EXISTS public.user_assessment_answers_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES assessment_questions_v2(id),
  raw_score INTEGER NOT NULL CHECK (raw_score BETWEEN 1 AND 5),
  normalized_score INTEGER NOT NULL CHECK (normalized_score BETWEEN 1 AND 5),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_v2_assessment ON user_assessment_answers_v2(assessment_id);

-- 3. Calculated results per characteristic
CREATE TABLE IF NOT EXISTS public.user_assessment_results_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE,
  characteristic_id INTEGER NOT NULL REFERENCES characteristics_v2(id),
  average_score DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, characteristic_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_results_v2_assessment ON user_assessment_results_v2(assessment_id);

-- 4. RLS Policies
ALTER TABLE public.user_assessments_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessment_answers_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessment_results_v2 ENABLE ROW LEVEL SECURITY;

-- user_assessments_v2
DROP POLICY IF EXISTS "Users can view own assessments" ON public.user_assessments_v2;
CREATE POLICY "Users can view own assessments"
ON public.user_assessments_v2 FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own assessments" ON public.user_assessments_v2;
CREATE POLICY "Users can create own assessments"
ON public.user_assessments_v2 FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessments" ON public.user_assessments_v2;
CREATE POLICY "Users can update own assessments"
ON public.user_assessments_v2 FOR UPDATE
USING (auth.uid() = user_id);

-- user_assessment_answers_v2
DROP POLICY IF EXISTS "Users can view own answers" ON public.user_assessment_answers_v2;
CREATE POLICY "Users can view own answers"
ON public.user_assessment_answers_v2 FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_assessments_v2
    WHERE id = assessment_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert own answers" ON public.user_assessment_answers_v2;
CREATE POLICY "Users can insert own answers"
ON public.user_assessment_answers_v2 FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_assessments_v2
    WHERE id = assessment_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update own answers" ON public.user_assessment_answers_v2;
CREATE POLICY "Users can update own answers"
ON public.user_assessment_answers_v2 FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_assessments_v2
    WHERE id = assessment_id AND user_id = auth.uid()
  )
);

-- user_assessment_results_v2
DROP POLICY IF EXISTS "Users can view own results" ON public.user_assessment_results_v2;
CREATE POLICY "Users can view own results"
ON public.user_assessment_results_v2 FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_assessments_v2
    WHERE id = assessment_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert own results" ON public.user_assessment_results_v2;
CREATE POLICY "Users can insert own results"
ON public.user_assessment_results_v2 FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_assessments_v2
    WHERE id = assessment_id AND user_id = auth.uid()
  )
);
