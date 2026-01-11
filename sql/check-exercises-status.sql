-- Verifica stato attuale esercizi per libro
SELECT
  book_slug,
  COUNT(*) as totale,
  COUNT(pillar_primary) as con_pillar,
  COUNT(CASE WHEN source_type != 'standard' AND source_type != 'original' THEN 1 END) as categorizzati
FROM exercises
GROUP BY book_slug
ORDER BY book_slug;
