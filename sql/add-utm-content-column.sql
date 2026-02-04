-- Aggiunge colonna utm_content per tracking varianti ads
-- Necessario per distinguere quale variante dell'ad ha generato la conversione

-- challenge_subscribers
ALTER TABLE public.challenge_subscribers
ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- ab_test_events
ALTER TABLE public.ab_test_events
ADD COLUMN IF NOT EXISTS utm_content TEXT;
