-- 6.1 Trova book_id per leadership
SELECT id, slug, title FROM books WHERE slug IN ('leadership', 'lite', 'leadership-autentica');

-- 6.2 Verifica assessment esistenti (per utente test)
SELECT ua.id, ua.user_id, ua.status, b.slug as book_slug, ua.completed_at
FROM user_assessments ua
LEFT JOIN books b ON ua.book_id = b.id
LIMIT 10;

-- Verifica user_assessments_v2
SELECT id, user_id, assessment_type, status, completed_at
FROM user_assessments_v2
LIMIT 10;

-- 6.3 Verifica caratteristiche e pillar
SELECT id, name, pillar FROM characteristics ORDER BY pillar, id LIMIT 24;

-- 6.4 Verifica punteggi esistenti
SELECT cs.id, cs.assessment_id, c.name, c.pillar, cs.raw_score
FROM characteristic_scores cs
JOIN characteristics c ON cs.characteristic_id = c.id
LIMIT 20;
