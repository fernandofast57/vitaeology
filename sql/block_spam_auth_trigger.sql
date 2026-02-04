-- Trigger per bloccare email spam su auth.users
-- Pattern: >3 punti nella parte locale + <15 lettere

-- 1. Funzione di validazione email
CREATE OR REPLACE FUNCTION auth.validate_email_not_spam()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  local_part TEXT;
  dot_count INT;
  letter_count INT;
  domain TEXT;
BEGIN
  -- Estrai parte locale e dominio
  local_part := split_part(LOWER(NEW.email), '@', 1);
  domain := split_part(LOWER(NEW.email), '@', 2);

  -- Conta i punti nella parte locale
  dot_count := LENGTH(local_part) - LENGTH(REPLACE(local_part, '.', ''));

  -- Conta le lettere (solo a-z)
  letter_count := LENGTH(REGEXP_REPLACE(local_part, '[^a-zA-Z]', '', 'g'));

  -- Pattern 1: >3 punti E <15 lettere (pattern CLAUDE.md)
  IF dot_count > 3 AND letter_count < 15 THEN
    RAISE EXCEPTION 'Registrazione non consentita. Usa un indirizzo email valido.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Pattern 2: 3 punti E <10 lettere (più restrittivo)
  IF dot_count >= 3 AND letter_count < 10 THEN
    RAISE EXCEPTION 'Registrazione non consentita. Usa un indirizzo email valido.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Pattern 3: 6+ punti (sempre sospetto)
  IF dot_count >= 6 THEN
    RAISE EXCEPTION 'Registrazione non consentita. Usa un indirizzo email valido.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Pattern 4: Punti consecutivi
  IF local_part LIKE '%..%' THEN
    RAISE EXCEPTION 'Formato email non valido.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Pattern 5: Domini disposable comuni
  IF domain IN (
    'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.org',
    '10minutemail.com', '10minutemail.net', 'mailinator.com', 'maildrop.cc',
    'throwaway.email', 'fakeinbox.com', 'trashmail.com', 'getnada.com',
    'mohmal.com', 'tempail.com', 'emailondeck.com', 'dispostable.com',
    'yopmail.com', 'sharklasers.com', 'grr.la', 'guerrillamailblock.com',
    'pokemail.net', 'spam4.me', 'trash-mail.com', 'mytemp.email',
    'tmpmail.org', 'tmpmail.net', 'tempr.email', 'discard.email'
  ) THEN
    RAISE EXCEPTION 'Domini email temporanei non consentiti.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Email valida, procedi
  RETURN NEW;
END;
$$;

-- 2. Crea trigger su auth.users
DROP TRIGGER IF EXISTS block_spam_emails_trigger ON auth.users;

CREATE TRIGGER block_spam_emails_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.validate_email_not_spam();

-- 3. Commento per documentazione
COMMENT ON FUNCTION auth.validate_email_not_spam() IS
'Blocca registrazioni con email spam. Pattern: >3 punti + <15 lettere, domini disposable.
Creato per risolvere problema bounce email segnalato da Supabase (Gen 2026).';
