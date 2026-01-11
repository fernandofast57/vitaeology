-- Query per ottenere dati per test milestone
SELECT
  u.id as user_id,
  u.email,
  e.id as exercise_id,
  e.title as exercise_title,
  e.book_slug
FROM auth.users u
CROSS JOIN (
  SELECT id, title, book_slug
  FROM exercises
  WHERE is_active = true
  LIMIT 1
) e
LIMIT 1;
