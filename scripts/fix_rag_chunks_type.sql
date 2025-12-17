-- Fix: Cambia rag_chunks_used da UUID[] a TEXT[]
-- I chunk ID nella tabella book_knowledge sono INTEGER, non UUID

ALTER TABLE ai_coach_conversations
ALTER COLUMN rag_chunks_used TYPE TEXT[]
USING rag_chunks_used::TEXT[];
