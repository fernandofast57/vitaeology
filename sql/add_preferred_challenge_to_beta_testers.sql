-- Aggiunge colonna preferred_challenge alla tabella beta_testers
-- Per tracciare da quale challenge ADS l'utente è arrivato

ALTER TABLE beta_testers
ADD COLUMN IF NOT EXISTS preferred_challenge TEXT;

-- Commento esplicativo
COMMENT ON COLUMN beta_testers.preferred_challenge IS
'Challenge da cui arriva il beta tester via ADS: leadership-autentica|oltre-ostacoli|microfelicita';

-- Verifica
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'beta_testers'
AND column_name = 'preferred_challenge';
