-- Verifica stato month_name
SELECT book_slug,
       COUNT(*) as total,
       SUM(CASE WHEN month_name IS NOT NULL AND month_name != '' THEN 1 ELSE 0 END) as with_month,
       SUM(CASE WHEN month_name IS NULL OR month_name = '' THEN 1 ELSE 0 END) as without_month
FROM exercises
GROUP BY book_slug;

-- Dettaglio week_number e source_type per risolutore
SELECT week_number, source_type, title, month_name
FROM exercises
WHERE book_slug = 'risolutore'
ORDER BY week_number, source_type;

-- Dettaglio week_number e source_type per microfelicita
SELECT week_number, source_type, title, month_name
FROM exercises
WHERE book_slug = 'microfelicita'
ORDER BY week_number, source_type;
