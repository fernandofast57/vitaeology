-- =============================================
-- MIGRATION: Fix match_book_chunks con book_title
-- Data: 15 Dicembre 2025
-- Scopo: Filtra per book_title invece di book_id
-- =============================================

CREATE OR REPLACE FUNCTION match_book_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_book_title text DEFAULT NULL
)
RETURNS TABLE (
  id integer,
  book_title varchar,
  chapter varchar,
  section varchar,
  content text,
  chunk_type varchar,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bk.id,
    bk.book_title,
    bk.chapter,
    bk.section,
    bk.content,
    bk.chunk_type,
    1 - (bk.embedding <=> query_embedding) as similarity
  FROM book_knowledge bk
  WHERE 1 - (bk.embedding <=> query_embedding) > match_threshold
    AND (filter_book_title IS NULL OR bk.book_title = filter_book_title)
  ORDER BY bk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
