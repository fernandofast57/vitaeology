-- =============================================
-- VITAEOLOGY v2 - SEZIONE 7/8
-- VISTE UTILI
-- Eseguire DOPO sezione 6
-- =============================================

-- Vista: Caratteristiche con conteggio esercizi
CREATE OR REPLACE VIEW characteristics_with_exercise_count AS
SELECT 
  c.*,
  COUNT(e.id) as exercise_count
FROM characteristics c
LEFT JOIN exercises_v2 e ON c.slug = e.characteristic_slug
GROUP BY c.id;

-- Vista: Progressi utente con dettagli esercizio
CREATE OR REPLACE VIEW user_progress_detailed AS
SELECT 
  uep.*,
  e.week_number,
  e.title as exercise_title,
  e.characteristic_slug,
  e.pillar,
  e.quarter,
  c.name_familiar as characteristic_name
FROM user_exercise_progress_v2 uep
JOIN exercises_v2 e ON uep.exercise_id = e.id
JOIN characteristics c ON e.characteristic_slug = c.slug;

-- Verifica
DO $$ BEGIN RAISE NOTICE '✅ Sezione 7/8 completata: Viste create'; END $$;
