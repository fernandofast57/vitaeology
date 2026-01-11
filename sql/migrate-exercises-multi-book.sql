-- Migrazione tabella exercises per supporto multi-libro
-- Aggiunge colonne per Risolutore e Microfelicità

-- 1. Aggiungi nuove colonne
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS book_slug TEXT DEFAULT 'leadership',
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'original' CHECK (source_type IN ('original', 'ai_generated', 'user_suggested')),
ADD COLUMN IF NOT EXISTS pillar_primary TEXT CHECK (pillar_primary IN ('ESSERE', 'SENTIRE', 'PENSARE', 'AGIRE')),
ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 3),
ADD COLUMN IF NOT EXISTS min_assessment_score INTEGER,
ADD COLUMN IF NOT EXISTS created_from_feedback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS feedback_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS effectiveness_score DECIMAL(3,2);

-- 2. Indici per performance
CREATE INDEX IF NOT EXISTS idx_exercises_book ON exercises(book_slug);
CREATE INDEX IF NOT EXISTS idx_exercises_source ON exercises(source_type);
CREATE INDEX IF NOT EXISTS idx_exercises_pillar ON exercises(pillar_primary);

-- 3. Aggiorna esercizi esistenti come Leadership
UPDATE exercises SET book_slug = 'leadership' WHERE book_slug IS NULL;

-- 4. Verifica struttura
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'exercises'
ORDER BY ordinal_position;
