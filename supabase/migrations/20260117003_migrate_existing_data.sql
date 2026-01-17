-- ============================================================
-- MIGRAZIONE DATI ESISTENTI → NUOVO SCHEMA
-- ============================================================
-- Migra: profiles.current_path → user_pathways
-- Migra: assessment_access → user_pathways
-- Migra: affiliates (consulente) → consultant_certifications
-- ============================================================

-- ============================================================
-- 1. MIGRAZIONE profiles.current_path → user_pathways
-- ============================================================
-- Mantiene compatibilità: current_path resta in profiles

DO $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Migra utenti con current_path impostato
  INSERT INTO user_pathways (user_id, pathway_id, access_type, is_active, started_at)
  SELECT DISTINCT
    p.id,
    pw.id,
    CASE
      WHEN p.subscription_tier IN ('leader', 'mentor') THEN 'subscription'
      ELSE 'trial'
    END,
    true,
    p.created_at
  FROM profiles p
  JOIN pathways pw ON pw.slug = CASE p.current_path
    WHEN 'leadership' THEN 'leadership'
    WHEN 'problemi' THEN 'risolutore'
    WHEN 'benessere' THEN 'microfelicita'
    ELSE p.current_path
  END
  WHERE p.current_path IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM user_pathways up
      WHERE up.user_id = p.id AND up.pathway_id = pw.id
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Migrati % record da profiles.current_path a user_pathways', v_count;
END $$;

-- ============================================================
-- 2. MIGRAZIONE assessment_access → user_pathways
-- ============================================================
-- assessment_access traccia accesso a singoli assessment
-- Convertiamo in accesso ai percorsi corrispondenti

DO $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Migra accessi assessment → percorsi
  INSERT INTO user_pathways (user_id, pathway_id, access_type, is_active, started_at, expires_at)
  SELECT DISTINCT
    aa.user_id,
    pw.id,
    aa.access_source,
    true,
    aa.granted_at,
    aa.expires_at
  FROM assessment_access aa
  JOIN pathways pw ON pw.slug = CASE aa.assessment_type
    WHEN 'lite' THEN 'leadership'
    WHEN 'leadership' THEN 'leadership'
    WHEN 'risolutore' THEN 'risolutore'
    WHEN 'microfelicita' THEN 'microfelicita'
    ELSE NULL
  END
  WHERE pw.id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM user_pathways up
      WHERE up.user_id = aa.user_id AND up.pathway_id = pw.id
    )
  ON CONFLICT (user_id, pathway_id) DO UPDATE SET
    -- Se accesso esistente, aggiorna solo se il nuovo è "più forte"
    access_type = CASE
      WHEN EXCLUDED.access_type = 'subscription' THEN 'subscription'
      WHEN user_pathways.access_type = 'subscription' THEN 'subscription'
      WHEN EXCLUDED.access_type = 'book_purchase' THEN 'book_purchase'
      WHEN user_pathways.access_type = 'book_purchase' THEN 'book_purchase'
      ELSE EXCLUDED.access_type
    END,
    expires_at = CASE
      WHEN EXCLUDED.expires_at IS NULL THEN NULL
      WHEN user_pathways.expires_at IS NULL THEN NULL
      WHEN EXCLUDED.expires_at > user_pathways.expires_at THEN EXCLUDED.expires_at
      ELSE user_pathways.expires_at
    END,
    updated_at = NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Migrati % record da assessment_access a user_pathways', v_count;
END $$;

-- ============================================================
-- 3. MIGRAZIONE subscription utenti → user_pathways
-- ============================================================
-- Leader: accesso a 1 percorso
-- Mentor: accesso a tutti e 3 i percorsi

DO $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Leader: assicura accesso al percorso current_path
  -- (già gestito in step 1)

  -- Mentor: assicura accesso a TUTTI i percorsi
  INSERT INTO user_pathways (user_id, pathway_id, access_type, is_active, started_at)
  SELECT
    p.id,
    pw.id,
    'subscription',
    true,
    p.created_at
  FROM profiles p
  CROSS JOIN pathways pw
  WHERE p.subscription_tier = 'mentor'
    AND pw.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM user_pathways up
      WHERE up.user_id = p.id AND up.pathway_id = pw.id
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Creati % accessi percorso per utenti Mentor', v_count;
END $$;

-- ============================================================
-- 4. MIGRAZIONE consulenti da affiliates → consultant_certifications
-- ============================================================

DO $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Migra affiliati con abbonamento_utente = 'consulente'
  INSERT INTO consultant_certifications (
    user_id,
    status,
    certification_level,
    certified_at,
    license_agreement_signed,
    license_agreement_signed_at,
    notes
  )
  SELECT
    a.user_id,
    'active',
    'base',
    a.created_at,
    true,
    a.created_at,
    'Migrato da affiliates.abbonamento_utente = consulente'
  FROM affiliates a
  WHERE a.abbonamento_utente = 'consulente'
    AND NOT EXISTS (
      SELECT 1 FROM consultant_certifications cc
      WHERE cc.user_id = a.user_id
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Migrati % consulenti da affiliates a consultant_certifications', v_count;
END $$;

-- ============================================================
-- 5. AGGIORNA PROGRESSO ESERCIZI IN user_pathways
-- ============================================================

DO $$
BEGIN
  -- Calcola e aggiorna progresso per ogni user_pathway
  UPDATE user_pathways up
  SET
    exercises_completed = subq.completed_count,
    exercises_total = subq.total_count,
    progress_percentage = CASE
      WHEN subq.total_count > 0
      THEN LEAST(100, (subq.completed_count * 100 / subq.total_count))
      ELSE 0
    END,
    completed_at = CASE
      WHEN subq.completed_count >= subq.total_count AND subq.total_count > 0
      THEN NOW()
      ELSE NULL
    END
  FROM (
    SELECT
      up2.user_id,
      up2.pathway_id,
      COUNT(CASE WHEN uep.status = 'completed' THEN 1 END) AS completed_count,
      COUNT(e.id) AS total_count
    FROM user_pathways up2
    JOIN pathways p ON p.id = up2.pathway_id
    LEFT JOIN exercises e ON e.book_slug = p.slug AND e.is_active = true
    LEFT JOIN user_exercise_progress uep ON uep.user_id = up2.user_id AND uep.exercise_id = e.id
    GROUP BY up2.user_id, up2.pathway_id
  ) subq
  WHERE up.user_id = subq.user_id
    AND up.pathway_id = subq.pathway_id;

  RAISE NOTICE 'Aggiornato progresso esercizi in user_pathways';
END $$;

-- ============================================================
-- 6. FUNZIONE SYNC: Mantiene profiles.current_path sincronizzato
-- ============================================================
-- Per backward compatibility durante transizione

CREATE OR REPLACE FUNCTION sync_current_path_from_user_pathways()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando user_pathways cambia, aggiorna profiles.current_path
  -- con il percorso più recente attivo
  UPDATE profiles p
  SET current_path = (
    SELECT pw.slug
    FROM user_pathways up
    JOIN pathways pw ON pw.id = up.pathway_id
    WHERE up.user_id = NEW.user_id
      AND up.is_active = true
    ORDER BY up.updated_at DESC
    LIMIT 1
  )
  WHERE p.id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_current_path ON user_pathways;
CREATE TRIGGER trigger_sync_current_path
  AFTER INSERT OR UPDATE ON user_pathways
  FOR EACH ROW
  EXECUTE FUNCTION sync_current_path_from_user_pathways();

-- ============================================================
-- 7. FUNZIONE HELPER: Ottieni percorso corrente (backward compat)
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_current_path(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_path TEXT;
BEGIN
  -- Prima prova da user_pathways (nuovo schema)
  SELECT pw.slug INTO v_path
  FROM user_pathways up
  JOIN pathways pw ON pw.id = up.pathway_id
  WHERE up.user_id = p_user_id
    AND up.is_active = true
  ORDER BY up.updated_at DESC
  LIMIT 1;

  -- Fallback a profiles.current_path (vecchio schema)
  IF v_path IS NULL THEN
    SELECT current_path INTO v_path
    FROM profiles
    WHERE id = p_user_id;
  END IF;

  RETURN v_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- REPORT MIGRAZIONE
-- ============================================================

DO $$
DECLARE
  v_pathways_count INTEGER;
  v_user_pathways_count INTEGER;
  v_consultants_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_pathways_count FROM pathways;
  SELECT COUNT(*) INTO v_user_pathways_count FROM user_pathways;
  SELECT COUNT(*) INTO v_consultants_count FROM consultant_certifications WHERE status = 'active';

  RAISE NOTICE '============================================';
  RAISE NOTICE 'REPORT MIGRAZIONE COMPLETATA';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Percorsi creati: %', v_pathways_count;
  RAISE NOTICE 'User-Pathways creati: %', v_user_pathways_count;
  RAISE NOTICE 'Consulenti certificati: %', v_consultants_count;
  RAISE NOTICE '============================================';
END $$;

-- ============================================================
-- COMMENTI
-- ============================================================

COMMENT ON FUNCTION get_user_current_path IS 'Ottiene percorso corrente utente - compatibile con vecchio e nuovo schema';
COMMENT ON FUNCTION sync_current_path_from_user_pathways IS 'Sync trigger: mantiene profiles.current_path aggiornato per backward compatibility';
