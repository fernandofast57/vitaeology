-- =============================================
-- MIGRATION: Aggiorna match_book_chunks con filtro
-- Data: 15 Dicembre 2025
-- Scopo: Filtrare risultati RAG per book_id
-- =============================================

CREATE OR REPLACE FUNCTION match_book_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_book_id text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  book_id text,
  book_title text,
  chapter text,
  section text,
  content text,
  content_type text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bk.id,
    bk.book_id,
    bk.book_title,
    bk.chapter,
    bk.section,
    bk.content,
    bk.content_type,
    1 - (bk.embedding <=> query_embedding) as similarity
  FROM book_knowledge bk
  WHERE 1 - (bk.embedding <=> query_embedding) > match_threshold
    AND (filter_book_id IS NULL OR bk.book_id = filter_book_id)
  ORDER BY bk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
