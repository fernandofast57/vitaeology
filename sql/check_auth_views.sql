SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public'
AND definition ILIKE '%auth.users%'
