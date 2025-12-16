-- =============================================
-- VITAEOLOGY v2 - SEZIONE 2/8
-- Tabella CHARACTERISTICS (struttura)
-- Eseguire DOPO sezione 1
-- =============================================

-- Drop se esiste (solo in development)
DROP TABLE IF EXISTS characteristics CASCADE;

CREATE TABLE characteristics (
  id SERIAL PRIMARY KEY,
  
  -- Identificazione
  slug VARCHAR(50) UNIQUE NOT NULL,
  name_familiar TEXT NOT NULL,
  name_barrios TEXT NOT NULL,
  
  -- Categorizzazione
  pillar VARCHAR(20) NOT NULL CHECK (pillar IN ('Vision', 'Action', 'Relations', 'Adaptation')),
  pillar_order INTEGER NOT NULL CHECK (pillar_order BETWEEN 1 AND 6),
  
  -- Descrizioni
  description_short TEXT,
  description_long TEXT,
  description_validante TEXT NOT NULL,
  
  -- Assessment
  assessment_intro TEXT,
  
  -- Visualizzazione
  color_hex VARCHAR(7),
  icon_name VARCHAR(50),
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX idx_characteristics_pillar ON characteristics(pillar);
CREATE INDEX idx_characteristics_slug ON characteristics(slug);
CREATE INDEX idx_characteristics_sort ON characteristics(sort_order);

-- Trigger
CREATE TRIGGER update_characteristics_updated_at
    BEFORE UPDATE ON characteristics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verifica
DO $$ BEGIN RAISE NOTICE '✅ Sezione 2/8 completata: Tabella characteristics creata'; END $$;
