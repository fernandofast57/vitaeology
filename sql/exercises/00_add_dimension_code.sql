-- ============================================================
-- MIGRAZIONE: Aggiunge dimension_code alla tabella exercises
-- Eseguire PRIMA degli insert degli esercizi
-- ============================================================

-- 1. Aggiungi colonna dimension_code
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS dimension_code VARCHAR(3);

-- 2. Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_exercises_dimension_code ON exercises(dimension_code);

-- 3. Crea indice composito per query frequenti
CREATE INDEX IF NOT EXISTS idx_exercises_book_dimension ON exercises(book_slug, dimension_code);

-- 4. Commento sulla colonna
COMMENT ON COLUMN exercises.dimension_code IS 'Codice dimensione assessment (es: FP, FS, RR, SM, L1). Usato per mappare esercizi ai risultati assessment.';

-- 5. Verifica struttura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'exercises'
AND column_name IN ('dimension_code', 'book_slug', 'pillar_primary')
ORDER BY ordinal_position;

-- ============================================================
-- MAPPING DIMENSIONI → PILASTRI (Reference)
-- ============================================================
--
-- RISOLUTORE (7 dimensioni):
-- FP (Detective Pattern)    → PENSARE
-- FS (Antenna Segnali)      → SENTIRE
-- FR (Radar Risorse)        → AGIRE
-- TP (Paralizzante)         → PENSARE
-- TT (Timoroso)             → SENTIRE
-- TC (Procrastinatore)      → AGIRE
-- SR (Scala Risolutore)     → ESSERE
--
-- MICROFELICITA (13 dimensioni):
-- RR (Rileva)               → SENTIRE
-- RA (Accogli)              → ESSERE
-- RD (Distingui)            → PENSARE
-- RM (Amplifica)            → SENTIRE
-- RS (Resta)                → ESSERE
-- SM (Minimizzazione)       → PENSARE
-- SA (Anticipo)             → SENTIRE
-- SI (Auto-Interruzione)    → PENSARE
-- SC (Cambio Fuoco)         → SENTIRE
-- SE (Correzione Emotiva)   → ESSERE
-- L1 (Campo Interno)        → ESSERE
-- L2 (Spazio Relazionale)   → SENTIRE
-- L3 (Campo Contesti)       → AGIRE
-- ============================================================
