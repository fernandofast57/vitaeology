-- Fix per subscriber con vecchio formato last_email_type
-- Converte day_1, day_2, ... day_7 a 'day_content' per coerenza con il cron

-- Prima verifica quanti record da aggiornare
SELECT email, challenge, current_day, last_email_type, status
FROM challenge_subscribers
WHERE last_email_type LIKE 'day_%'
  AND last_email_type != 'day_content'
  AND last_email_type != 'day_unlock';

-- Aggiorna al formato corretto
UPDATE challenge_subscribers
SET last_email_type = 'day_content'
WHERE last_email_type LIKE 'day_%'
  AND last_email_type != 'day_content'
  AND last_email_type != 'day_unlock';

-- Verifica risultato
SELECT email, challenge, current_day, last_email_type, status
FROM challenge_subscribers
ORDER BY subscribed_at DESC;
