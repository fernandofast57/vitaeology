-- ============================================================
-- FIX RLS - Vitaeology
-- Data: 2024-12-23
-- ============================================================

-- ============================================================
-- SEZIONE 1: TABELLE REFERENCE (pubblico read-only)
-- ============================================================

-- assessment_questions - già ha policy ma RLS disabilitato
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

-- books - tabella libri reference
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SEZIONE 2: TABELLE ADMIN-ONLY
-- Pattern: service_role full access + admin read
-- Usa: is_admin = true OR role_id in roles con level >= 80
-- ============================================================

-- ai_coach_metrics_daily
ALTER TABLE public.ai_coach_metrics_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access metrics" ON public.ai_coach_metrics_daily;
CREATE POLICY "Service role full access metrics"
ON public.ai_coach_metrics_daily FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can view metrics" ON public.ai_coach_metrics_daily;
CREATE POLICY "Admin can view metrics"
ON public.ai_coach_metrics_daily FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role_id IN (SELECT roles.id FROM roles WHERE roles.level >= 80))
  )
);

-- ai_coach_prompt_versions
ALTER TABLE public.ai_coach_prompt_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access prompt_versions" ON public.ai_coach_prompt_versions;
CREATE POLICY "Service role full access prompt_versions"
ON public.ai_coach_prompt_versions FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can manage prompt versions" ON public.ai_coach_prompt_versions;
CREATE POLICY "Admin can manage prompt versions"
ON public.ai_coach_prompt_versions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role_id IN (SELECT roles.id FROM roles WHERE roles.level >= 80))
  )
);

-- ai_coach_rag_suggestions
ALTER TABLE public.ai_coach_rag_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access rag_suggestions" ON public.ai_coach_rag_suggestions;
CREATE POLICY "Service role full access rag_suggestions"
ON public.ai_coach_rag_suggestions FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can manage rag suggestions" ON public.ai_coach_rag_suggestions;
CREATE POLICY "Admin can manage rag suggestions"
ON public.ai_coach_rag_suggestions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role_id IN (SELECT roles.id FROM roles WHERE roles.level >= 80))
  )
);

-- ai_coach_weekly_reports
ALTER TABLE public.ai_coach_weekly_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access weekly_reports" ON public.ai_coach_weekly_reports;
CREATE POLICY "Service role full access weekly_reports"
ON public.ai_coach_weekly_reports FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can view weekly reports" ON public.ai_coach_weekly_reports;
CREATE POLICY "Admin can view weekly reports"
ON public.ai_coach_weekly_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role_id IN (SELECT roles.id FROM roles WHERE roles.level >= 80))
  )
);

-- email_sequences
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access email_sequences" ON public.email_sequences;
CREATE POLICY "Service role full access email_sequences"
ON public.email_sequences FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can manage email sequences" ON public.email_sequences;
CREATE POLICY "Admin can manage email sequences"
ON public.email_sequences FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role_id IN (SELECT roles.id FROM roles WHERE roles.level >= 80))
  )
);

-- lead_magnets
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access lead_magnets" ON public.lead_magnets;
CREATE POLICY "Service role full access lead_magnets"
ON public.lead_magnets FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can manage lead magnets" ON public.lead_magnets;
CREATE POLICY "Admin can manage lead magnets"
ON public.lead_magnets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role_id IN (SELECT roles.id FROM roles WHERE roles.level >= 80))
  )
);

-- Utenti possono vedere lead magnet attivi
DROP POLICY IF EXISTS "Anyone can view active lead magnets" ON public.lead_magnets;
CREATE POLICY "Anyone can view active lead magnets"
ON public.lead_magnets FOR SELECT
USING (is_active = true);

-- subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access subscription_plans" ON public.subscription_plans;
CREATE POLICY "Service role full access subscription_plans"
ON public.subscription_plans FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Admin can manage subscription plans"
ON public.subscription_plans FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role_id IN (SELECT roles.id FROM roles WHERE roles.level >= 80))
  )
);

-- Utenti possono vedere piani attivi
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);
