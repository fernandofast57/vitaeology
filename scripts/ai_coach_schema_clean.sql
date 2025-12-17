-- =============================================
-- VITAEOLOGY AI COACH LEARNING SYSTEM
-- Schema pulito con gestione conflitti
-- =============================================

-- Abilita estensione UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop e ricrea tabelle
DROP TABLE IF EXISTS ai_coach_weekly_reports CASCADE;
DROP TABLE IF EXISTS ai_coach_metrics_daily CASCADE;
DROP TABLE IF EXISTS ai_coach_rag_suggestions CASCADE;
DROP TABLE IF EXISTS ai_coach_prompt_versions CASCADE;
DROP TABLE IF EXISTS ai_coach_patterns CASCADE;
DROP TABLE IF EXISTS ai_coach_implicit_signals CASCADE;
DROP TABLE IF EXISTS ai_coach_feedback CASCADE;
DROP TABLE IF EXISTS ai_coach_user_memory CASCADE;
DROP TABLE IF EXISTS ai_coach_conversations CASCADE;
DROP VIEW IF EXISTS ai_coach_weekly_metrics CASCADE;

-- =============================================
-- TABELLA: ai_coach_conversations
-- =============================================
CREATE TABLE ai_coach_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  current_path VARCHAR(20) CHECK (current_path IN ('leadership', 'problemi', 'benessere')),
  exercise_id INTEGER,
  user_message TEXT NOT NULL,
  user_message_tokens INTEGER,
  ai_response TEXT NOT NULL,
  ai_response_tokens INTEGER,
  rag_chunks_used UUID[],
  rag_similarity_scores FLOAT[],
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELLA: ai_coach_feedback
-- =============================================
CREATE TABLE ai_coach_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_helpful BOOLEAN,
  comment TEXT,
  issue_category VARCHAR(50) CHECK (issue_category IN (
    'non_pertinente', 'troppo_generico', 'troppo_lungo',
    'tono_sbagliato', 'non_validante', 'confuso', 'altro'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELLA: ai_coach_implicit_signals
-- =============================================
CREATE TABLE ai_coach_implicit_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  signal_type VARCHAR(50) NOT NULL CHECK (signal_type IN (
    'reformulated_question', 'abandoned_conversation', 'long_pause_before_reply',
    'immediate_new_question', 'completed_exercise', 'skipped_exercise',
    'returned_to_topic', 'escalation_requested'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELLA: ai_coach_patterns
-- =============================================
CREATE TABLE ai_coach_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN (
    'unanswered_question', 'negative_feedback_cluster', 'reformulation_trigger',
    'abandonment_trigger', 'success_pattern'
  )),
  pattern_description TEXT NOT NULL,
  pattern_keywords TEXT[],
  pattern_embedding vector(1536),
  occurrence_count INTEGER DEFAULT 1,
  first_occurrence TIMESTAMPTZ DEFAULT NOW(),
  last_occurrence TIMESTAMPTZ DEFAULT NOW(),
  example_conversation_ids UUID[],
  status VARCHAR(20) DEFAULT 'identified' CHECK (status IN (
    'identified', 'auto_corrected', 'pending_review', 'approved', 'rejected', 'resolved'
  )),
  suggested_action TEXT,
  applied_action TEXT,
  auto_correct_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELLA: ai_coach_prompt_versions
-- =============================================
CREATE TABLE ai_coach_prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_number SERIAL,
  version_label VARCHAR(50),
  system_prompt TEXT NOT NULL,
  changes_description TEXT,
  changes_reason TEXT,
  source_pattern_id UUID REFERENCES ai_coach_patterns(id),
  is_active BOOLEAN DEFAULT FALSE,
  metrics_before JSONB,
  metrics_after JSONB,
  approved_by VARCHAR(100),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELLA: ai_coach_rag_suggestions
-- =============================================
CREATE TABLE ai_coach_rag_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_pattern_id UUID REFERENCES ai_coach_patterns(id),
  source_conversation_ids UUID[],
  suggested_content TEXT NOT NULL,
  suggested_keywords TEXT[],
  suggested_book VARCHAR(50) CHECK (suggested_book IN ('leadership', 'problemi', 'benessere')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'implemented', 'rejected'
  )),
  implemented_chunk_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ
);

-- =============================================
-- TABELLA: ai_coach_metrics_daily
-- =============================================
CREATE TABLE ai_coach_metrics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  p1_quantity_components INTEGER,
  p1_quality_principle_adherence FLOAT,
  p1_viability_api_cost DECIMAL(10,2),
  p1_viability_avg_response_time INTEGER,
  p2_quantity_conversations INTEGER,
  p2_quantity_messages INTEGER,
  p2_quality_avg_rating FLOAT,
  p2_quality_helpful_ratio FLOAT,
  p2_viability_exercise_completion_rate FLOAT,
  p2_viability_user_return_rate FLOAT,
  p3_quantity_improvements INTEGER,
  p3_quality_improvement_effectiveness FLOAT,
  p3_viability_avg_implementation_time INTEGER,
  p4_quantity_patterns_corrected INTEGER,
  p4_quality_error_reduction_rate FLOAT,
  p4_viability_prevention_rate FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELLA: ai_coach_weekly_reports
-- =============================================
CREATE TABLE ai_coach_weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  report_content JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned')),
  actions_taken JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- =============================================
-- TABELLA: ai_coach_user_memory
-- =============================================
CREATE TABLE ai_coach_user_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  communication_style VARCHAR(50) CHECK (communication_style IN ('diretto', 'elaborato', 'esempi_pratici')),
  preferred_response_length VARCHAR(20) CHECK (preferred_response_length IN ('breve', 'medio', 'dettagliato')),
  common_challenges TEXT[],
  successful_approaches TEXT[],
  trigger_topics TEXT[],
  key_context JSONB DEFAULT '{}',
  coach_notes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
