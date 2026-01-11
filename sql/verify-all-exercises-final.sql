-- Riepilogo finale tutti gli esercizi per book e source_type
SELECT
  book_slug,
  source_type,
  COUNT(*) as count
FROM exercises
GROUP BY book_slug, source_type
ORDER BY book_slug, source_type;
