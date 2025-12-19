-- =============================================
-- MIGRAZIONE: Aggiunta colonne per editing messaggi
-- Permette agli utenti di modificare le proprie domande
-- =============================================

-- Aggiungi colonne per tracking delle modifiche ai messaggi utente
ALTER TABLE ai_coach_conversations
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS original_content TEXT,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- Commenti esplicativi
COMMENT ON COLUMN ai_coach_conversations.edited_at IS 'Timestamp della modifica del messaggio';
COMMENT ON COLUMN ai_coach_conversations.original_content IS 'Contenuto originale prima della modifica';
COMMENT ON COLUMN ai_coach_conversations.is_edited IS 'True se il messaggio utente è stato modificato';
