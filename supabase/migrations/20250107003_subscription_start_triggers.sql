-- =====================================================
-- MIGRAZIONE: Trigger per subscription_start_date
-- Data: 7 Gennaio 2026
-- Scopo: Gestione automatica subscription_start_date
-- =====================================================

-- Popola per utenti esistenti che non hanno ancora la data
UPDATE profiles
SET subscription_start_date = created_at
WHERE subscription_start_date IS NULL;

-- Funzione per impostare automaticamente subscription_start_date su INSERT
CREATE OR REPLACE FUNCTION set_subscription_start_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_start_date IS NULL THEN
    NEW.subscription_start_date := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger su INSERT
DROP TRIGGER IF EXISTS trigger_set_subscription_start ON profiles;
CREATE TRIGGER trigger_set_subscription_start
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_subscription_start_date();

-- Funzione per aggiornare subscription_start_date quando upgrade da free
CREATE OR REPLACE FUNCTION update_subscription_start_on_upgrade()
RETURNS TRIGGER AS $$
BEGIN
  -- Se passa da free/explorer a pagante E subscription_start_date è la data di creazione
  IF (OLD.subscription_tier IN ('free', 'explorer') OR OLD.subscription_tier IS NULL)
     AND NEW.subscription_tier IN ('leader', 'mentor', 'mastermind')
     AND (OLD.subscription_start_date IS NULL OR OLD.subscription_start_date = OLD.created_at)
  THEN
    NEW.subscription_start_date := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger su UPDATE subscription_tier
DROP TRIGGER IF EXISTS trigger_subscription_upgrade ON profiles;
CREATE TRIGGER trigger_subscription_upgrade
  BEFORE UPDATE OF subscription_tier ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_start_on_upgrade();

-- Indice per query
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_start
ON profiles(subscription_start_date);

-- Commento documentazione
COMMENT ON COLUMN profiles.subscription_start_date IS 'Data inizio subscription per calcolo settimana nel percorso 52 settimane';

-- Verifica
SELECT id, email, subscription_tier, subscription_start_date, created_at
FROM profiles
LIMIT 5;
