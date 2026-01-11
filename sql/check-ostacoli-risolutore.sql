SELECT week_number, title, source_type, pillar_primary
FROM exercises
WHERE book_slug IN ('ostacoli', 'risolutore')
ORDER BY week_number
LIMIT 30;
