-- Aggiunge subscription_start_date a profiles
-- Per calcolare la settimana corrente nel sistema 52 esercizi

-- 1. Aggiungi colonna
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;

-- 2. Popola per utenti esistenti (usa created_at come fallback)
UPDATE profiles
SET subscription_start_date = created_at
WHERE subscription_start_date IS NULL;

-- 3. Funzione trigger per nuovi utenti
CREATE OR REPLACE FUNCTION set_subscription_start()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_start_date IS NULL THEN
    NEW.subscription_start_date := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger
DROP TRIGGER IF EXISTS trigger_subscription_start ON profiles;
CREATE TRIGGER trigger_subscription_start
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_subscription_start();

-- 5. Verifica
SELECT id, email, subscription_tier, subscription_start_date, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
