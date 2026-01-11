-- =====================================================
-- MIGRAZIONE: Aggiorna schema exercises per 3 libri
-- Data: 7 Gennaio 2026
-- =====================================================

-- Aggiungi colonna challenge_day (unica mancante)
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS challenge_day INTEGER;

-- Vincoli di validazione (ignora se esistono)
DO $$
BEGIN
  -- Vincolo source_type
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_source_type') THEN
    ALTER TABLE exercises
    ADD CONSTRAINT chk_source_type
    CHECK (source_type IN ('core', 'challenge_followup', 'advanced', 'standard', 'original'));
  END IF;

  -- Vincolo challenge_day
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_challenge_day') THEN
    ALTER TABLE exercises
    ADD CONSTRAINT chk_challenge_day
    CHECK (challenge_day IS NULL OR (challenge_day BETWEEN 1 AND 7));
  END IF;

  -- Vincolo pillar
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_pillar') THEN
    ALTER TABLE exercises
    ADD CONSTRAINT chk_pillar
    CHECK (pillar_primary IS NULL OR pillar_primary IN ('ESSERE', 'SENTIRE', 'PENSARE', 'AGIRE'));
  END IF;
END $$;

-- Indici per performance query (IF NOT EXISTS già usato prima)
CREATE INDEX IF NOT EXISTS idx_exercises_book ON exercises(book_slug);
CREATE INDEX IF NOT EXISTS idx_exercises_source ON exercises(source_type);
CREATE INDEX IF NOT EXISTS idx_exercises_pillar ON exercises(pillar_primary);
CREATE INDEX IF NOT EXISTS idx_exercises_challenge_day ON exercises(challenge_day);

-- Verifica finale
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'exercises'
ORDER BY ordinal_position;
