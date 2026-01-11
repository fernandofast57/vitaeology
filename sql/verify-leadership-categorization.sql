-- Verifica categorizzazione Leadership per source_type
SELECT
  source_type,
  COUNT(*) as count,
  array_agg(week_number ORDER BY week_number) as weeks
FROM exercises
WHERE book_slug = 'leadership'
GROUP BY source_type
ORDER BY source_type;

-- Verifica distribuzione per pillar
SELECT
  pillar_primary,
  source_type,
  COUNT(*) as count
FROM exercises
WHERE book_slug = 'leadership'
GROUP BY pillar_primary, source_type
ORDER BY pillar_primary, source_type;
