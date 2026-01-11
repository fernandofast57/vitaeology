-- Verifica distribuzione pilastri e difficoltà
SELECT
  pillar_primary,
  difficulty_level,
  COUNT(*) as count,
  MIN(week_number) as from_week,
  MAX(week_number) as to_week
FROM exercises
WHERE book_slug = 'leadership'
GROUP BY pillar_primary, difficulty_level
ORDER BY MIN(week_number);
