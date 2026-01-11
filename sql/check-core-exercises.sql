SELECT week_number, title, pillar_primary, source_type
FROM exercises
WHERE book_slug = 'leadership' AND source_type = 'core'
ORDER BY week_number;
