SELECT book_slug, COUNT(*) as totale
FROM exercises
GROUP BY book_slug
ORDER BY book_slug;
