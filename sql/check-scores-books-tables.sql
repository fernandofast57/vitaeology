-- Tabella characteristic_scores
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'characteristic_scores' ORDER BY ordinal_position;

-- Tabella books
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'books' ORDER BY ordinal_position;

-- Tabella challenge_subscribers
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'challenge_subscribers' ORDER BY ordinal_position;
