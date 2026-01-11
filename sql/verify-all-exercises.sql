-- Verifica tutti gli esercizi per libro
SELECT book_slug, COUNT(*) as total,
       COUNT(CASE WHEN difficulty_level = 'base' THEN 1 END) as base,
       COUNT(CASE WHEN difficulty_level = 'intermedio' THEN 1 END) as intermedio,
       COUNT(CASE WHEN difficulty_level = 'avanzato' THEN 1 END) as avanzato
FROM exercises
GROUP BY book_slug
ORDER BY book_slug;
