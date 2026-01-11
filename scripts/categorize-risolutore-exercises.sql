-- =====================================================
-- SCRIPT: Categorizza 24 esercizi Risolutore
-- Data: 7 Gennaio 2026
-- =====================================================

-- ═══════════════════════════════════════════════════
-- ESERCIZI "CORE" (12 totali - Filtri + Traditori + Metodo 5 Minuti)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET source_type = 'core'
WHERE book_slug = 'risolutore' AND week_number BETWEEN 1 AND 12;

-- ═══════════════════════════════════════════════════
-- ESERCIZI "CHALLENGE_FOLLOWUP" (7 - Consolidamenti)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET source_type = 'challenge_followup'
WHERE book_slug = 'risolutore' AND week_number BETWEEN 13 AND 19;

-- ═══════════════════════════════════════════════════
-- ESERCIZI "ADVANCED" (5 - Fine percorso)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET source_type = 'advanced'
WHERE book_slug = 'risolutore' AND week_number BETWEEN 20 AND 24;

-- ═══════════════════════════════════════════════════
-- Verifica risultato
-- ═══════════════════════════════════════════════════
SELECT source_type, COUNT(*) as count
FROM exercises
WHERE book_slug = 'risolutore'
GROUP BY source_type
ORDER BY source_type;
