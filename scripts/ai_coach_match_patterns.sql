-- Funzione per trovare pattern simili usando vector similarity
-- Richiede estensione pgvector

CREATE OR REPLACE FUNCTION match_patterns(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  pattern_type varchar(50),
  pattern_description text,
  pattern_keywords text[],
  occurrence_count integer,
  first_occurrence timestamptz,
  last_occurrence timestamptz,
  example_conversation_ids uuid[],
  status varchar(20),
  suggested_action text,
  applied_action text,
  auto_correct_threshold integer,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.pattern_type,
    p.pattern_description,
    p.pattern_keywords,
    p.occurrence_count,
    p.first_occurrence,
    p.last_occurrence,
    p.example_conversation_ids,
    p.status,
    p.suggested_action,
    p.applied_action,
    p.auto_correct_threshold,
    p.created_at,
    p.updated_at,
    1 - (p.pattern_embedding <=> query_embedding) AS similarity
  FROM ai_coach_patterns p
  WHERE
    p.pattern_embedding IS NOT NULL
    AND (filter_type IS NULL OR p.pattern_type = filter_type)
    AND p.status IN ('identified', 'pending_review')
    AND 1 - (p.pattern_embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Commento documentazione
COMMENT ON FUNCTION match_patterns IS 'Trova pattern simili usando similarita coseno con pgvector';
