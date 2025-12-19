-- =============================================
-- MIGRAZIONE: Aggiunta colonna reformulation_count
-- Per tracciare quante volte una risposta è stata riformulata
-- =============================================

-- Aggiungi colonna reformulation_count alla tabella ai_coach_conversations
ALTER TABLE ai_coach_conversations
ADD COLUMN IF NOT EXISTS reformulation_count INTEGER DEFAULT 0;

-- Aggiungi colonna original_response per salvare la risposta originale prima della riformulazione
ALTER TABLE ai_coach_conversations
ADD COLUMN IF NOT EXISTS original_response TEXT;

-- Commento esplicativo
COMMENT ON COLUMN ai_coach_conversations.reformulation_count IS 'Numero di volte che la risposta AI è stata riformulata (max 2)';
COMMENT ON COLUMN ai_coach_conversations.original_response IS 'Risposta originale prima di qualsiasi riformulazione';
