SELECT week_number, title, LEFT(description, 80) as desc_preview
FROM exercises
WHERE book_slug = 'microfelicita'
ORDER BY week_number;
