-- Struttura tabella
SELECT column_name FROM information_schema.columns
WHERE table_name = 'challenge_subscribers' ORDER BY ordinal_position;

-- Dati esempio
SELECT * FROM challenge_subscribers LIMIT 5;
