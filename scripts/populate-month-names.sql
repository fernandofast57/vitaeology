-- =====================================================
-- Popola month_name per esercizi Risolutore e Microfelicità
-- =====================================================

-- RISOLUTORE (24 esercizi)
-- Core: week 1-12 (12)
-- Challenge followup: week 13-19 (7)
-- Advanced: week 20-24 (5)

UPDATE exercises SET month_name = 'I 3 Filtri'
WHERE book_slug = 'risolutore'
  AND week_number BETWEEN 1 AND 4;

UPDATE exercises SET month_name = 'I 3 Traditori'
WHERE book_slug = 'risolutore'
  AND week_number BETWEEN 5 AND 8;

UPDATE exercises SET month_name = 'Metodo 5 Minuti'
WHERE book_slug = 'risolutore'
  AND week_number BETWEEN 9 AND 12;

UPDATE exercises SET month_name = 'Consolidamento Challenge'
WHERE book_slug = 'risolutore'
  AND week_number BETWEEN 13 AND 19;

UPDATE exercises SET month_name = 'Esercizi Avanzati'
WHERE book_slug = 'risolutore'
  AND week_number BETWEEN 20 AND 24;

-- MICROFELICITÀ (24 esercizi)
-- Core: week 1-10 (10)
-- Challenge followup: week 11-17 (7)
-- Advanced: week 18-24 (7)

UPDATE exercises SET month_name = 'Il Metodo R.A.D.A.R.'
WHERE book_slug = 'microfelicita'
  AND week_number BETWEEN 1 AND 5;

UPDATE exercises SET month_name = 'I 5 Canali Sensoriali'
WHERE book_slug = 'microfelicita'
  AND week_number BETWEEN 6 AND 10;

UPDATE exercises SET month_name = 'Consolidamento Challenge'
WHERE book_slug = 'microfelicita'
  AND week_number BETWEEN 11 AND 17;

UPDATE exercises SET month_name = 'Esercizi Avanzati'
WHERE book_slug = 'microfelicita'
  AND week_number BETWEEN 18 AND 24;

-- Fallback: qualsiasi esercizio senza month_name
UPDATE exercises SET month_name = 'Altri Esercizi'
WHERE (month_name IS NULL OR month_name = '')
  AND book_slug IN ('risolutore', 'microfelicita');
