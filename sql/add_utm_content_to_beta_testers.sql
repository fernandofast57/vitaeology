-- Aggiunge colonna utm_content alla tabella beta_testers
-- Per tracciare quale creatività ADS ha convertito (emotivo/pratico/domanda)

ALTER TABLE beta_testers
ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Commento esplicativo
COMMENT ON COLUMN beta_testers.utm_content IS
'Creatività ADS: leadership_emotivo|leadership_pratico|leadership_domanda|ostacoli_*|microfelicita_*';

-- Verifica
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'beta_testers'
AND column_name = 'utm_content';
