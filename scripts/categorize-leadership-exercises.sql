-- =====================================================
-- SCRIPT: Categorizza 52 esercizi Leadership
-- Data: 7 Gennaio 2026
-- Logica: Basato su 52-esercizi-vitaeology.docx
-- =====================================================

-- Reset a 'standard' prima di categorizzare
UPDATE exercises SET source_type = 'standard'
WHERE book_slug = 'leadership';

-- ═══════════════════════════════════════════════════
-- ESERCIZI "CORE" PRIORITARI (10 totali)
-- Questi vengono raccomandati per primi ai nuovi utenti
-- ═══════════════════════════════════════════════════
UPDATE exercises SET source_type = 'core'
WHERE book_slug = 'leadership' AND week_number IN (
  -- ESSERE: Autoconsapevolezza (1), Visione (13)
  1, 13,
  -- SENTIRE: Empatia (5), Ascolto (8)
  5, 8,
  -- PENSARE: Decisionalità (9), Responsabilità (10), Pensiero Strategico (27)
  9, 10, 27,
  -- AGIRE: Focus (36), Disciplina (37), Efficienza (39)
  36, 37, 39
);

-- ═══════════════════════════════════════════════════
-- ESERCIZI "CHALLENGE_FOLLOWUP" (7 - Consolidamenti post-Challenge)
-- Settimane tra i core iniziali, consolidano i concetti della Challenge
-- ═══════════════════════════════════════════════════
UPDATE exercises SET source_type = 'challenge_followup'
WHERE book_slug = 'leadership' AND week_number IN (
  2, 3, 4, 6, 7, 11, 12
);

-- ═══════════════════════════════════════════════════
-- ESERCIZI "ADVANCED" (Settimane 49-52)
-- Richiedono completamento prerequisiti
-- ═══════════════════════════════════════════════════
UPDATE exercises SET source_type = 'advanced'
WHERE book_slug = 'leadership' AND week_number >= 49;

-- ═══════════════════════════════════════════════════
-- Verifica risultato
-- ═══════════════════════════════════════════════════
SELECT
  source_type,
  COUNT(*) as count,
  array_agg(week_number ORDER BY week_number) as weeks
FROM exercises
WHERE book_slug = 'leadership'
GROUP BY source_type
ORDER BY source_type;
