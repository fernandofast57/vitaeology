-- Verifica trigger subscription_start_date
SELECT
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'profiles'
AND trigger_name LIKE '%subscription%';

-- Verifica funzioni trigger
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%subscription%';

-- Verifica dati popolati
SELECT
  COUNT(*) as total_profiles,
  COUNT(subscription_start_date) as with_start_date,
  COUNT(*) - COUNT(subscription_start_date) as without_start_date
FROM profiles;
