-- =====================================================
-- SCRIPT: Categorizza 24 esercizi Microfelicità
-- Data: 7 Gennaio 2026
-- =====================================================

-- ═══════════════════════════════════════════════════
-- ESERCIZI "CORE" (10 totali - R.A.D.A.R. + 5 Canali)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET source_type = 'core'
WHERE book_slug = 'microfelicita' AND week_number BETWEEN 1 AND 10;

-- ═══════════════════════════════════════════════════
-- ESERCIZI "CHALLENGE_FOLLOWUP" (7 - Consolidamenti)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET source_type = 'challenge_followup'
WHERE book_slug = 'microfelicita' AND week_number BETWEEN 11 AND 17;

-- ═══════════════════════════════════════════════════
-- ESERCIZI "ADVANCED" (7 - Fine percorso)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET source_type = 'advanced'
WHERE book_slug = 'microfelicita' AND week_number BETWEEN 18 AND 24;

-- ═══════════════════════════════════════════════════
-- Verifica risultato
-- ═══════════════════════════════════════════════════
SELECT source_type, COUNT(*) as count
FROM exercises
WHERE book_slug = 'microfelicita'
GROUP BY source_type
ORDER BY source_type;
