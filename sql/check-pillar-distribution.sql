SELECT pillar_primary, source_type, COUNT(*) as count
FROM exercises
WHERE book_slug = 'leadership'
GROUP BY pillar_primary, source_type
ORDER BY pillar_primary, source_type;
