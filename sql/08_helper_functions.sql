-- =============================================
-- VITAEOLOGY v2 - SEZIONE 8/8
-- FUNZIONI HELPER
-- Eseguire DOPO sezione 7
-- =============================================

-- Funzione: Ottieni prossimo esercizio per utente
CREATE OR REPLACE FUNCTION get_next_exercise_for_user(p_user_id UUID)
RETURNS TABLE (
  exercise_id INTEGER,
  week_number INTEGER,
  title TEXT,
  characteristic_slug VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.week_number,
    e.title,
    e.characteristic_slug
  FROM exercises_v2 e
  WHERE e.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM user_exercise_progress_v2 uep
      WHERE uep.exercise_id = e.id 
        AND uep.user_id = p_user_id
        AND uep.status = 'completed'
    )
  ORDER BY e.week_number
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Calcola completamento per pilastro
CREATE OR REPLACE FUNCTION get_pillar_completion(p_user_id UUID, p_pillar VARCHAR(20))
RETURNS TABLE (
  total_exercises BIGINT,
  completed_exercises BIGINT,
  completion_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(e.id) as total_exercises,
    COUNT(CASE WHEN uep.status = 'completed' THEN 1 END) as completed_exercises,
    ROUND(
      (COUNT(CASE WHEN uep.status = 'completed' THEN 1 END)::NUMERIC / 
       NULLIF(COUNT(e.id), 0)::NUMERIC) * 100, 
      2
    ) as completion_percentage
  FROM exercises_v2 e
  LEFT JOIN user_exercise_progress_v2 uep 
    ON e.id = uep.exercise_id AND uep.user_id = p_user_id
  WHERE e.pillar = p_pillar AND e.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica finale
DO $$ BEGIN 
  RAISE NOTICE '✅ Sezione 8/8 completata: Funzioni helper create';
  RAISE NOTICE '🎉 SCHEMA VITAEOLOGY v2 COMPLETATO!';
END $$;
