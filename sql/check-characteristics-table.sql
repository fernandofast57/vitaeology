-- Tabella caratteristiche (per pillar)
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'characteristics' ORDER BY ordinal_position;
