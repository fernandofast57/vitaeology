-- =====================================================
-- SCHEMA DATABASE: Challenge Discovery Responses
-- Per tracciare risposte A/B/C ai quiz giornalieri Day 1-7
-- =====================================================

-- Challenge Discovery Responses
CREATE TABLE IF NOT EXISTS challenge_discovery_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('leadership', 'ostacoli', 'microfelicita')),
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 3),
  response TEXT NOT NULL CHECK (response IN ('A', 'B', 'C')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_type, day_number, question_number)
);

-- Index per analytics
CREATE INDEX IF NOT EXISTS idx_discovery_analytics
ON challenge_discovery_responses(challenge_type, day_number, response);

-- Index per lookup utente
CREATE INDEX IF NOT EXISTS idx_discovery_user
ON challenge_discovery_responses(user_id, challenge_type);

-- RLS
ALTER TABLE challenge_discovery_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert own responses
CREATE POLICY "Users can insert own responses"
ON challenge_discovery_responses
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view own responses
CREATE POLICY "Users can view own responses"
ON challenge_discovery_responses
FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update own responses
CREATE POLICY "Users can update own responses"
ON challenge_discovery_responses
FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Service role full access
CREATE POLICY "Service role full access discovery"
ON challenge_discovery_responses
FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- VISTA: Analytics per tipo risposta
-- =====================================================

CREATE OR REPLACE VIEW challenge_discovery_analytics AS
SELECT
  challenge_type,
  day_number,
  question_number,
  response,
  COUNT(*) as response_count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER (PARTITION BY challenge_type, day_number, question_number) * 100, 1) as percentage
FROM challenge_discovery_responses
GROUP BY challenge_type, day_number, question_number, response
ORDER BY challenge_type, day_number, question_number, response;

-- =====================================================
-- VISTA: Progresso utente per challenge
-- =====================================================

CREATE OR REPLACE VIEW challenge_user_progress AS
SELECT
  user_id,
  challenge_type,
  COUNT(DISTINCT day_number) as days_completed,
  MAX(day_number) as last_day_completed,
  COUNT(*) as total_responses,
  MIN(created_at) as started_at,
  MAX(created_at) as last_activity
FROM challenge_discovery_responses
GROUP BY user_id, challenge_type;

-- =====================================================
-- FUNZIONE: Calcola profilo discovery utente
-- =====================================================

CREATE OR REPLACE FUNCTION get_discovery_profile(p_user_id UUID, p_challenge_type TEXT)
RETURNS TABLE (
  dominant_response TEXT,
  a_count INTEGER,
  b_count INTEGER,
  c_count INTEGER,
  completion_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN a.cnt >= b.cnt AND a.cnt >= c.cnt THEN 'A'
      WHEN b.cnt >= a.cnt AND b.cnt >= c.cnt THEN 'B'
      ELSE 'C'
    END as dominant_response,
    a.cnt as a_count,
    b.cnt as b_count,
    c.cnt as c_count,
    ROUND((a.cnt + b.cnt + c.cnt)::NUMERIC / 21 * 100, 1) as completion_percentage
  FROM
    (SELECT COUNT(*) as cnt FROM challenge_discovery_responses WHERE user_id = p_user_id AND challenge_type = p_challenge_type AND response = 'A') a,
    (SELECT COUNT(*) as cnt FROM challenge_discovery_responses WHERE user_id = p_user_id AND challenge_type = p_challenge_type AND response = 'B') b,
    (SELECT COUNT(*) as cnt FROM challenge_discovery_responses WHERE user_id = p_user_id AND challenge_type = p_challenge_type AND response = 'C') c;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
