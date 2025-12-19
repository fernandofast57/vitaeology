-- =============================================
-- MIGRAZIONE: Aggiunta tracking costi API
-- Traccia modello usato e costo per ogni conversazione
-- =============================================

-- Aggiungi colonne per tracking costi API
ALTER TABLE ai_coach_conversations
ADD COLUMN IF NOT EXISTS model_used VARCHAR(50),
ADD COLUMN IF NOT EXISTS api_cost_usd DECIMAL(10, 6);

-- Indici per query analytics
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON ai_coach_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_api_cost ON ai_coach_conversations(api_cost_usd) WHERE api_cost_usd IS NOT NULL;

-- Commenti esplicativi
COMMENT ON COLUMN ai_coach_conversations.model_used IS 'Modello Claude usato (es. claude-sonnet-4-20250514)';
COMMENT ON COLUMN ai_coach_conversations.api_cost_usd IS 'Costo API in USD per questa conversazione';
