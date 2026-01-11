-- Verifica subscription_start_date
SELECT
  id,
  email,
  subscription_tier,
  subscription_start_date,
  created_at,
  CASE
    WHEN subscription_start_date IS NOT NULL THEN
      FLOOR(EXTRACT(EPOCH FROM (NOW() - subscription_start_date)) / (7 * 24 * 60 * 60)) + 1
    ELSE 1
  END as current_week
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
