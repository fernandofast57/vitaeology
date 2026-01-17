-- ============================================================
-- PATHWAYS: Tabella percorsi dinamici
-- ============================================================
-- Sostituisce il campo hardcoded profiles.current_path
-- Supporta: bundle multipli, nuovi percorsi senza migration
-- ============================================================

-- Tabella percorsi (3 iniziali, espandibile)
CREATE TABLE IF NOT EXISTS pathways (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  book_title TEXT, -- Titolo libro associato
  color_hex TEXT DEFAULT '#0A2540',
  icon_name TEXT DEFAULT 'book',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_pathways_slug ON pathways(slug);
CREATE INDEX IF NOT EXISTS idx_pathways_active ON pathways(is_active) WHERE is_active = true;

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_pathways_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pathways_updated_at ON pathways;
CREATE TRIGGER trigger_pathways_updated_at
  BEFORE UPDATE ON pathways
  FOR EACH ROW
  EXECUTE FUNCTION update_pathways_updated_at();

-- Popola con i 3 percorsi esistenti
INSERT INTO pathways (slug, name, description, book_title, color_hex, icon_name, order_index, is_active)
VALUES
  ('leadership', 'Leadership Autentica', 'Sviluppa le tue capacità di leadership attraverso i 4 pilastri: Visione, Relazioni, Adattamento, Azione', 'Leadership Autentica', '#D4AF37', 'crown', 1, true),
  ('risolutore', 'Oltre gli Ostacoli', 'Diventa un Risolutore: padroneggia i 3 Filtri, supera i 3 Traditori, applica il Metodo 5 Minuti', 'Oltre gli Ostacoli', '#10B981', 'shield', 2, true),
  ('microfelicita', 'Microfelicità Digitale', 'Coltiva micro-momenti di benessere con il metodo R.A.D.A.R. e neutralizza i 5 Sabotatori', 'Microfelicità Digitale', '#8B5CF6', 'heart', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- USER_PATHWAYS: Relazione Many-to-Many utente ↔ percorso
-- ============================================================
-- Un utente può avere accesso a 1, 2 o 3 percorsi
-- Traccia progresso e stato per ogni percorso

CREATE TABLE IF NOT EXISTS user_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pathway_id INTEGER NOT NULL REFERENCES pathways(id) ON DELETE CASCADE,

  -- Stato accesso
  access_type TEXT NOT NULL DEFAULT 'subscription' CHECK (access_type IN (
    'subscription',    -- Accesso da subscription Leader/Mentor
    'book_purchase',   -- Accesso da acquisto libro
    'challenge_complete', -- Accesso da challenge completata
    'admin_grant',     -- Accesso manuale admin
    'trial'            -- Accesso trial temporaneo
  )),

  -- Stato percorso
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Progresso (0-100)
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  exercises_completed INTEGER DEFAULT 0,
  exercises_total INTEGER DEFAULT 0,

  -- Assessment collegato
  last_assessment_id UUID, -- Riferimento all'ultimo assessment per questo percorso
  last_assessment_at TIMESTAMPTZ,

  -- Metadata
  expires_at TIMESTAMPTZ, -- NULL se permanente
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Vincoli
  UNIQUE(user_id, pathway_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_pathways_user ON user_pathways(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pathways_pathway ON user_pathways(pathway_id);
CREATE INDEX IF NOT EXISTS idx_user_pathways_active ON user_pathways(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_pathways_user_active ON user_pathways(user_id, is_active) WHERE is_active = true;

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_user_pathways_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_pathways_updated_at ON user_pathways;
CREATE TRIGGER trigger_user_pathways_updated_at
  BEFORE UPDATE ON user_pathways
  FOR EACH ROW
  EXECUTE FUNCTION update_user_pathways_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pathways ENABLE ROW LEVEL SECURITY;

-- Pathways: tutti possono leggere i percorsi attivi
CREATE POLICY "pathways_select_active" ON pathways
  FOR SELECT USING (is_active = true);

-- Pathways: solo admin possono modificare
CREATE POLICY "pathways_admin_all" ON pathways
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- User Pathways: utenti vedono solo i propri
CREATE POLICY "user_pathways_select_own" ON user_pathways
  FOR SELECT USING (user_id = auth.uid());

-- User Pathways: utenti possono aggiornare solo i propri (progresso)
CREATE POLICY "user_pathways_update_own" ON user_pathways
  FOR UPDATE USING (user_id = auth.uid());

-- User Pathways: solo sistema può inserire (via service role)
CREATE POLICY "user_pathways_insert_service" ON user_pathways
  FOR INSERT WITH CHECK (true); -- Gestito da service role

-- User Pathways: admin può tutto
CREATE POLICY "user_pathways_admin_all" ON user_pathways
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================
-- FUNZIONI HELPER
-- ============================================================

-- Ottieni percorsi attivi di un utente
CREATE OR REPLACE FUNCTION get_user_active_pathways(p_user_id UUID)
RETURNS TABLE (
  pathway_id INTEGER,
  pathway_slug TEXT,
  pathway_name TEXT,
  access_type TEXT,
  progress_percentage INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.slug,
    p.name,
    up.access_type,
    up.progress_percentage,
    up.started_at,
    up.completed_at
  FROM user_pathways up
  JOIN pathways p ON p.id = up.pathway_id
  WHERE up.user_id = p_user_id
    AND up.is_active = true
    AND p.is_active = true
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  ORDER BY p.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica se utente ha accesso a un percorso
CREATE OR REPLACE FUNCTION user_has_pathway_access(p_user_id UUID, p_pathway_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_pathways up
    JOIN pathways p ON p.id = up.pathway_id
    WHERE up.user_id = p_user_id
      AND p.slug = p_pathway_slug
      AND up.is_active = true
      AND (up.expires_at IS NULL OR up.expires_at > NOW())
  ) INTO v_has_access;

  RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assegna percorso a utente
CREATE OR REPLACE FUNCTION grant_pathway_access(
  p_user_id UUID,
  p_pathway_slug TEXT,
  p_access_type TEXT DEFAULT 'subscription'
)
RETURNS UUID AS $$
DECLARE
  v_pathway_id INTEGER;
  v_user_pathway_id UUID;
  v_exercises_total INTEGER;
BEGIN
  -- Trova pathway
  SELECT id INTO v_pathway_id
  FROM pathways
  WHERE slug = p_pathway_slug AND is_active = true;

  IF v_pathway_id IS NULL THEN
    RAISE EXCEPTION 'Pathway % not found or inactive', p_pathway_slug;
  END IF;

  -- Conta esercizi totali per questo percorso
  SELECT COUNT(*) INTO v_exercises_total
  FROM exercises
  WHERE book_slug = p_pathway_slug AND is_active = true;

  -- Inserisci o aggiorna
  INSERT INTO user_pathways (
    user_id, pathway_id, access_type, is_active,
    started_at, exercises_total
  )
  VALUES (
    p_user_id, v_pathway_id, p_access_type, true,
    NOW(), COALESCE(v_exercises_total, 0)
  )
  ON CONFLICT (user_id, pathway_id) DO UPDATE SET
    is_active = true,
    access_type = EXCLUDED.access_type,
    updated_at = NOW()
  RETURNING id INTO v_user_pathway_id;

  RETURN v_user_pathway_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aggiorna progresso percorso
CREATE OR REPLACE FUNCTION update_pathway_progress(
  p_user_id UUID,
  p_pathway_slug TEXT,
  p_exercises_completed INTEGER DEFAULT NULL,
  p_progress_percentage INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_pathways up
  SET
    exercises_completed = COALESCE(p_exercises_completed, up.exercises_completed),
    progress_percentage = COALESCE(p_progress_percentage, up.progress_percentage),
    completed_at = CASE
      WHEN COALESCE(p_progress_percentage, up.progress_percentage) >= 100
      THEN COALESCE(up.completed_at, NOW())
      ELSE up.completed_at
    END,
    updated_at = NOW()
  FROM pathways p
  WHERE up.pathway_id = p.id
    AND up.user_id = p_user_id
    AND p.slug = p_pathway_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMMENTI
-- ============================================================

COMMENT ON TABLE pathways IS 'Percorsi formativi dinamici (Leadership, Ostacoli, Microfelicità + futuri)';
COMMENT ON TABLE user_pathways IS 'Relazione Many-to-Many utente ↔ percorso con tracking progresso';
COMMENT ON COLUMN user_pathways.access_type IS 'Come l''utente ha ottenuto accesso: subscription, book_purchase, challenge_complete, admin_grant, trial';
COMMENT ON COLUMN user_pathways.progress_percentage IS 'Progresso 0-100% calcolato da esercizi completati';
