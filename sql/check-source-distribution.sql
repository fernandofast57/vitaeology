SELECT source_type, COUNT(*) as count
FROM exercises
WHERE book_slug = 'leadership'
GROUP BY source_type
ORDER BY source_type;
