-- =============================================
-- VITAEOLOGY AI COACH LEARNING SYSTEM
-- Parte 1: Drop tabelle esistenti e ricrea
-- =============================================

-- Abilita estensione UUID se non già presente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tabelle esistenti (in ordine corretto per dipendenze)
DROP TABLE IF EXISTS ai_coach_weekly_reports CASCADE;
DROP TABLE IF EXISTS ai_coach_metrics_daily CASCADE;
DROP TABLE IF EXISTS ai_coach_rag_suggestions CASCADE;
DROP TABLE IF EXISTS ai_coach_prompt_versions CASCADE;
DROP TABLE IF EXISTS ai_coach_patterns CASCADE;
DROP TABLE IF EXISTS ai_coach_implicit_signals CASCADE;
DROP TABLE IF EXISTS ai_coach_feedback CASCADE;
DROP TABLE IF EXISTS ai_coach_user_memory CASCADE;
DROP TABLE IF EXISTS ai_coach_conversations CASCADE;

-- Drop views se esistono
DROP VIEW IF EXISTS ai_coach_weekly_metrics;

-- Drop functions se esistono
DROP FUNCTION IF EXISTS increment_pattern_count(UUID);
DROP FUNCTION IF EXISTS calculate_daily_metrics(DATE);
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
