-- Struttura books
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'books' ORDER BY ordinal_position;

-- Struttura characteristics
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'characteristics' ORDER BY ordinal_position;

-- Struttura user_assessments
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'user_assessments' ORDER BY ordinal_position;

-- Struttura user_assessments_v2
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'user_assessments_v2' ORDER BY ordinal_position;

-- Struttura characteristic_scores
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'characteristic_scores' ORDER BY ordinal_position;
