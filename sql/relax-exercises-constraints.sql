-- Rilassa vincoli tabella exercises per supportare inserimento semplificato
-- Le colonne opzionali avranno default

-- Rendi opzionali le colonne non essenziali
ALTER TABLE exercises ALTER COLUMN book_id DROP NOT NULL;
ALTER TABLE exercises ALTER COLUMN characteristic_slug DROP NOT NULL;
ALTER TABLE exercises ALTER COLUMN exercise_type DROP NOT NULL;
ALTER TABLE exercises ALTER COLUMN month_name DROP NOT NULL;
ALTER TABLE exercises ALTER COLUMN instructions DROP NOT NULL;
ALTER TABLE exercises ALTER COLUMN deliverable DROP NOT NULL;
ALTER TABLE exercises ALTER COLUMN sort_order DROP NOT NULL;

-- Aggiungi default
ALTER TABLE exercises ALTER COLUMN exercise_type SET DEFAULT 'riflessione';
ALTER TABLE exercises ALTER COLUMN month_name SET DEFAULT '';
ALTER TABLE exercises ALTER COLUMN instructions SET DEFAULT '';
ALTER TABLE exercises ALTER COLUMN deliverable SET DEFAULT '';
ALTER TABLE exercises ALTER COLUMN sort_order SET DEFAULT 0;
ALTER TABLE exercises ALTER COLUMN characteristic_slug SET DEFAULT '';

-- Verifica
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exercises'
  AND column_name IN ('book_id', 'characteristic_slug', 'exercise_type', 'month_name', 'instructions', 'deliverable', 'sort_order');
