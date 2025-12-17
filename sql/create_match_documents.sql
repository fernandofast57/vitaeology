-- ============================================
-- Funzione match_documents per RAG
-- Ricerca semantica con pgvector
-- ============================================

-- Assicurati che pgvector sia abilitato
CREATE EXTENSION IF NOT EXISTS vector;

-- Funzione per ricerca semantica
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  chapter text,
  section text,
  book_title text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bk.id,
    bk.content,
    bk.chapter,
    bk.section,
    bk.book_title,
    1 - (bk.embedding <=> query_embedding) AS similarity
  FROM book_knowledge bk
  WHERE 1 - (bk.embedding <=> query_embedding) > match_threshold
  ORDER BY bk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Verifica
SELECT 'match_documents function created successfully' AS status;
