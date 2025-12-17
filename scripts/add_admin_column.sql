-- Aggiunge colonna is_admin alla tabella profiles
-- Solo Fernando (e futuri admin) avranno accesso alla dashboard admin

-- Aggiungi colonna
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Imposta Fernando come admin
UPDATE profiles
SET is_admin = TRUE
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'fernando@vitaeology.com'
);

-- Verifica
SELECT id, full_name, is_admin
FROM profiles
WHERE is_admin = TRUE;
