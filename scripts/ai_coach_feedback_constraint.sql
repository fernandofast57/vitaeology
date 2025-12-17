-- Aggiunge unique constraint per permettere upsert del feedback
-- Un utente puo dare un solo feedback per conversazione

-- Prima rimuovi eventuali duplicati (tieni il piu recente)
DELETE FROM ai_coach_feedback a
USING ai_coach_feedback b
WHERE a.conversation_id = b.conversation_id
  AND a.user_id = b.user_id
  AND a.created_at < b.created_at;

-- Poi aggiungi il constraint
ALTER TABLE ai_coach_feedback
ADD CONSTRAINT ai_coach_feedback_unique_per_user
UNIQUE (conversation_id, user_id);
