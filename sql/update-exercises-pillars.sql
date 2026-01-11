-- Assegna pilastri e difficoltà agli esercizi Leadership per mese/settimana
-- Struttura: 52 settimane con progressione di difficoltà

-- GENNAIO (Settimane 1-4): Fondamenta - ESSERE
UPDATE exercises SET
  pillar_primary = 'ESSERE',
  difficulty_level = 'base',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 1 AND 4;

-- FEBBRAIO (Settimane 5-8): Comunicazione - SENTIRE
UPDATE exercises SET
  pillar_primary = 'SENTIRE',
  difficulty_level = 'base',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 5 AND 8;

-- MARZO (Settimane 9-13): Decisioni - PENSARE
UPDATE exercises SET
  pillar_primary = 'PENSARE',
  difficulty_level = 'base',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 9 AND 13;

-- APRILE (Settimane 14-17): Influenza - SENTIRE
UPDATE exercises SET
  pillar_primary = 'SENTIRE',
  difficulty_level = 'intermedio',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 14 AND 17;

-- MAGGIO (Settimane 18-22): Innovazione - PENSARE
UPDATE exercises SET
  pillar_primary = 'PENSARE',
  difficulty_level = 'intermedio',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 18 AND 22;

-- GIUGNO (Settimane 23-26): Crescita - ESSERE
UPDATE exercises SET
  pillar_primary = 'ESSERE',
  difficulty_level = 'intermedio',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 23 AND 26;

-- LUGLIO (Settimane 27-30): Strategia - PENSARE
UPDATE exercises SET
  pillar_primary = 'PENSARE',
  difficulty_level = 'intermedio',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 27 AND 30;

-- AGOSTO (Settimane 31-35): Resilienza - ESSERE
UPDATE exercises SET
  pillar_primary = 'ESSERE',
  difficulty_level = 'intermedio',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 31 AND 35;

-- SETTEMBRE (Settimane 36-39): Execution - AGIRE
UPDATE exercises SET
  pillar_primary = 'AGIRE',
  difficulty_level = 'intermedio',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 36 AND 39;

-- OTTOBRE (Settimane 40-44): Team - SENTIRE
UPDATE exercises SET
  pillar_primary = 'SENTIRE',
  difficulty_level = 'intermedio',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 40 AND 44;

-- NOVEMBRE (Settimane 45-48): Legacy - AGIRE
UPDATE exercises SET
  pillar_primary = 'AGIRE',
  difficulty_level = 'avanzato',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 45 AND 48;

-- DICEMBRE (Settimane 49-52): Integrazione - ESSERE
UPDATE exercises SET
  pillar_primary = 'ESSERE',
  difficulty_level = 'avanzato',
  source_type = 'original'
WHERE book_slug = 'leadership' AND week_number BETWEEN 49 AND 52;

-- Verifica distribuzione
SELECT
  pillar_primary,
  difficulty_level,
  COUNT(*) as count,
  MIN(week_number) as from_week,
  MAX(week_number) as to_week
FROM exercises
WHERE book_slug = 'leadership'
GROUP BY pillar_primary, difficulty_level
ORDER BY MIN(week_number);
