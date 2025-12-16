-- =============================================
-- VITAEOLOGY RAG - Schema per Book Knowledge
-- Eseguire su Supabase SQL Editor
-- =============================================

-- Abilita estensione pgvector se non esiste
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabella principale per i chunk dei libri
CREATE TABLE IF NOT EXISTS book_knowledge (
  id SERIAL PRIMARY KEY,
  book_title VARCHAR(200) NOT NULL,
  chapter VARCHAR(200),
  section VARCHAR(200),
  content TEXT NOT NULL,
  chunk_type VARCHAR(50) DEFAULT 'paragraph',
  keywords TEXT[] DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per ricerca
CREATE INDEX IF NOT EXISTS idx_book_knowledge_book ON book_knowledge(book_title);
CREATE INDEX IF NOT EXISTS idx_book_knowledge_type ON book_knowledge(chunk_type);
CREATE INDEX IF NOT EXISTS idx_book_knowledge_keywords ON book_knowledge USING GIN(keywords);

-- Indice per similarity search con pgvector
CREATE INDEX IF NOT EXISTS idx_book_knowledge_embedding ON book_knowledge
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_book_knowledge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_book_knowledge_timestamp ON book_knowledge;
CREATE TRIGGER trigger_book_knowledge_timestamp
  BEFORE UPDATE ON book_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_book_knowledge_timestamp();

-- Funzione per similarity search
CREATE OR REPLACE FUNCTION match_book_chunks(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id INT,
  book_title VARCHAR(200),
  chapter VARCHAR(200),
  section VARCHAR(200),
  content TEXT,
  chunk_type VARCHAR(50),
  keywords TEXT[],
  similarity FLOAT
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
    bk.keywords,
    1 - (bk.embedding <=> query_embedding) AS similarity
  FROM book_knowledge bk
  WHERE 1 - (bk.embedding <=> query_embedding) > match_threshold
  ORDER BY bk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- RLS Policies (lettura pubblica per ora)
ALTER TABLE book_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to book_knowledge"
  ON book_knowledge FOR SELECT
  USING (true);

-- Verifica
DO $$ BEGIN
  RAISE NOTICE 'Schema book_knowledge creato con successo!';
END $$;
