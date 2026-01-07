-- Fix per subscribers esistenti senza last_email_sent_at
-- Questi utenti non riceveranno email finché non vengono "inizializzati"

-- Imposta last_email_sent_at per utenti che hanno ricevuto welcome email
-- ma non è stata registrata nel database
-- Li mettiamo come se avessero ricevuto welcome 3 ore fa così il cron
-- invierà Day 1 al prossimo ciclo

UPDATE challenge_subscribers
SET
  last_email_sent_at = subscribed_at,  -- Usa la data di iscrizione come "welcome sent"
  last_email_type = 'welcome',
  current_day = 1  -- Pronti per ricevere Day 1
WHERE
  last_email_sent_at IS NULL
  AND status = 'active';

-- Verifica risultato
SELECT
  email,
  challenge,
  current_day,
  last_email_sent_at,
  last_email_type,
  status
FROM challenge_subscribers
ORDER BY subscribed_at DESC;
