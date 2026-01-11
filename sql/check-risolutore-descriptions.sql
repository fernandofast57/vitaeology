-- Verifica se le description sono popolate
SELECT week_number, title,
  CASE WHEN description IS NULL THEN 'NULL'
       WHEN LENGTH(description) < 50 THEN 'BREVE'
       ELSE 'OK' END as desc_status,
  LENGTH(description) as desc_length
FROM exercises
WHERE book_slug = 'risolutore'
ORDER BY week_number;
