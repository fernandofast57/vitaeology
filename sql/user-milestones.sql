-- ============================================================================
-- MIGRAZIONE: user_milestones
-- Descrizione: Sistema milestone per tracciare progressi utente
-- Data: 11/01/2026
-- Framework: Evangelista Vitaeology - Sistema Progressi
-- ============================================================================

-- Tabella milestone utente
CREATE TABLE IF NOT EXISTS public.user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relazione con utente
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo milestone (es. 'first_assessment', 'exercises_10', 'month_active')
  milestone_type TEXT NOT NULL,

  -- Percorso associato (leadership, ostacoli, microfelicita, global)
  path_type TEXT NOT NULL CHECK (path_type IN ('leadership', 'ostacoli', 'microfelicita', 'global')),

  -- Dati specifici della milestone (es. { "pillar": "ESSERE", "score": 85 })
  milestone_data JSONB DEFAULT '{}',

  -- Quando raggiunta
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Se l'utente è stato notificato
  notified BOOLEAN DEFAULT FALSE,

  -- Timestamp creazione
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: un utente può raggiungere ogni milestone una sola volta per path
  UNIQUE(user_id, milestone_type, path_type)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index per query frequenti (milestone utente)
CREATE INDEX IF NOT EXISTS idx_milestones_user
  ON public.user_milestones(user_id);

-- Index per query per path
CREATE INDEX IF NOT EXISTS idx_milestones_user_path
  ON public.user_milestones(user_id, path_type);

-- Index per milestone non notificate
CREATE INDEX IF NOT EXISTS idx_milestones_unnotified
  ON public.user_milestones(user_id, notified)
  WHERE notified = FALSE;

-- Index per tipo milestone
CREATE INDEX IF NOT EXISTS idx_milestones_type
  ON public.user_milestones(milestone_type);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Abilita RLS
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;

-- Policy: Utenti possono vedere le proprie milestone
CREATE POLICY "Users can view own milestones"
  ON public.user_milestones
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role full access (per sistema automatico)
CREATE POLICY "Service role full access milestones"
  ON public.user_milestones
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- TABELLA DEFINIZIONE MILESTONE
-- ============================================================================

-- Tabella con le definizioni delle milestone (per reference)
CREATE TABLE IF NOT EXISTS public.milestone_definitions (
  id SERIAL PRIMARY KEY,

  -- Codice milestone (es. 'first_assessment', 'exercises_10')
  code TEXT NOT NULL UNIQUE,

  -- Percorso (leadership, ostacoli, microfelicita, global)
  path_type TEXT NOT NULL CHECK (path_type IN ('leadership', 'ostacoli', 'microfelicita', 'global')),

  -- Categoria (assessment, exercises, time, mastery, special)
  category TEXT NOT NULL CHECK (category IN ('assessment', 'exercises', 'time', 'mastery', 'special')),

  -- Nome visualizzato
  name TEXT NOT NULL,

  -- Descrizione
  description TEXT NOT NULL,

  -- Icona/Emoji
  icon TEXT DEFAULT '🏆',

  -- Punti esperienza associati
  xp_reward INTEGER DEFAULT 0,

  -- Ordine di visualizzazione
  display_order INTEGER DEFAULT 0,

  -- Attivo
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INSERT MILESTONE DEFINITIONS
-- ============================================================================

-- GLOBAL MILESTONES
INSERT INTO public.milestone_definitions (code, path_type, category, name, description, icon, xp_reward, display_order) VALUES
('welcome', 'global', 'special', 'Benvenuto', 'Ti sei iscritto a Vitaeology', '👋', 10, 1),
('profile_complete', 'global', 'special', 'Profilo Completo', 'Hai completato il tuo profilo', '✨', 20, 2),
('first_chat', 'global', 'special', 'Prima Conversazione', 'Hai parlato con Fernando per la prima volta', '💬', 15, 3)
ON CONFLICT (code) DO NOTHING;

-- LEADERSHIP MILESTONES
INSERT INTO public.milestone_definitions (code, path_type, category, name, description, icon, xp_reward, display_order) VALUES
-- Assessment
('first_assessment_leadership', 'leadership', 'assessment', 'Prima Valutazione', 'Hai completato il tuo primo assessment di leadership', '📊', 50, 10),
('all_pillars_above_50', 'leadership', 'assessment', 'Equilibrio Raggiunto', 'Tutti i 4 pilastri sono sopra il 50%', '⚖️', 100, 11),
('all_pillars_above_70', 'leadership', 'assessment', 'Leader in Crescita', 'Tutti i 4 pilastri sono sopra il 70%', '📈', 200, 12),

-- Exercises
('exercises_1_leadership', 'leadership', 'exercises', 'Primo Passo', 'Hai completato il tuo primo esercizio', '👣', 20, 20),
('exercises_5_leadership', 'leadership', 'exercises', 'Praticante', 'Hai completato 5 esercizi', '🎯', 50, 21),
('exercises_10_leadership', 'leadership', 'exercises', 'Dedicato', 'Hai completato 10 esercizi', '💪', 100, 22),
('exercises_25_leadership', 'leadership', 'exercises', 'Esperto', 'Hai completato 25 esercizi', '🏅', 250, 23),
('exercises_52_leadership', 'leadership', 'exercises', 'Maestro Annuale', 'Hai completato tutti i 52 esercizi', '🏆', 500, 24),

-- Time
('week_1_leadership', 'leadership', 'time', 'Prima Settimana', 'Una settimana di pratica', '📅', 30, 30),
('month_1_leadership', 'leadership', 'time', 'Primo Mese', 'Un mese di impegno costante', '🌙', 75, 31),
('month_3_leadership', 'leadership', 'time', 'Trimestre Attivo', 'Tre mesi di crescita', '🌟', 150, 32),
('month_6_leadership', 'leadership', 'time', 'Semestre di Eccellenza', 'Sei mesi di dedizione', '⭐', 300, 33),

-- Mastery (caratteristiche a 80%+)
('mastery_motivazione', 'leadership', 'mastery', 'Maestro della Motivazione', 'Motivazione al 80%+', '🔥', 80, 40),
('mastery_coraggio', 'leadership', 'mastery', 'Maestro del Coraggio', 'Coraggio al 80%+', '🦁', 80, 41),
('mastery_empatia', 'leadership', 'mastery', 'Maestro dell''Empatia', 'Empatia al 80%+', '💗', 80, 42),
('mastery_creativita', 'leadership', 'mastery', 'Maestro della Creatività', 'Creatività al 80%+', '🎨', 80, 43)
ON CONFLICT (code) DO NOTHING;

-- OSTACOLI MILESTONES
INSERT INTO public.milestone_definitions (code, path_type, category, name, description, icon, xp_reward, display_order) VALUES
-- Assessment
('first_assessment_ostacoli', 'ostacoli', 'assessment', 'Consapevolezza Iniziale', 'Hai completato il tuo primo assessment Risolutore', '🔍', 50, 10),
('level_3_risolutore', 'ostacoli', 'assessment', 'Risolutore Intermedio', 'Hai raggiunto il livello 3', '📈', 100, 11),
('level_5_risolutore', 'ostacoli', 'assessment', 'Risolutore Esperto', 'Hai raggiunto il livello 5', '🎖️', 200, 12),

-- Exercises
('exercises_1_ostacoli', 'ostacoli', 'exercises', 'Primo Ostacolo', 'Hai affrontato il tuo primo esercizio', '🚧', 20, 20),
('exercises_5_ostacoli', 'ostacoli', 'exercises', 'Risolutore Attivo', 'Hai completato 5 esercizi', '🔧', 50, 21),
('exercises_10_ostacoli', 'ostacoli', 'exercises', 'Problem Solver', 'Hai completato 10 esercizi', '🛠️', 100, 22),
('exercises_24_ostacoli', 'ostacoli', 'exercises', 'Maestro Risolutore', 'Hai completato tutti i 24 esercizi', '🏆', 300, 23),

-- Filtri (6 filtri risolutivi)
('filter_dati', 'ostacoli', 'mastery', 'Detective dei Dati', 'Hai padroneggiato il filtro dei Dati', '🔢', 60, 40),
('filter_segnali', 'ostacoli', 'mastery', 'Antenna dei Segnali', 'Hai padroneggiato il filtro dei Segnali', '📡', 60, 41),
('filter_risorse', 'ostacoli', 'mastery', 'Radar delle Risorse', 'Hai padroneggiato il filtro delle Risorse', '📦', 60, 42),

-- Traditori (6 traditori silenziosi)
('traitor_fretta', 'ostacoli', 'mastery', 'Domatore della Fretta', 'Hai riconosciuto e gestito la Fretta', '⏱️', 60, 50),
('traitor_abitudine', 'ostacoli', 'mastery', 'Spezza Abitudini', 'Hai riconosciuto e gestito l''Abitudine', '🔄', 60, 51),
('traitor_ego', 'ostacoli', 'mastery', 'Domatore dell''Ego', 'Hai riconosciuto e gestito l''Ego', '👤', 60, 52)
ON CONFLICT (code) DO NOTHING;

-- MICROFELICITA MILESTONES
INSERT INTO public.milestone_definitions (code, path_type, category, name, description, icon, xp_reward, display_order) VALUES
-- Assessment
('first_assessment_microfelicita', 'microfelicita', 'assessment', 'Esploratore Felice', 'Hai completato il tuo primo assessment', '🌈', 50, 10),
('praticante_esperto', 'microfelicita', 'assessment', 'Praticante Esperto', 'Hai raggiunto il profilo Esperto', '🎓', 100, 11),
('praticante_maestro', 'microfelicita', 'assessment', 'Maestro della Felicità', 'Hai raggiunto il profilo Maestro', '✨', 200, 12),

-- Exercises
('exercises_1_microfelicita', 'microfelicita', 'exercises', 'Prima Gioia', 'Hai completato il tuo primo esercizio', '😊', 20, 20),
('exercises_5_microfelicita', 'microfelicita', 'exercises', 'Cercatore di Gioia', 'Hai completato 5 esercizi', '🌸', 50, 21),
('exercises_10_microfelicita', 'microfelicita', 'exercises', 'Coltivatore Felice', 'Hai completato 10 esercizi', '🌻', 100, 22),
('exercises_24_microfelicita', 'microfelicita', 'exercises', 'Maestro della Microfelicità', 'Hai completato tutti i 24 esercizi', '🏆', 300, 23),

-- R.A.D.A.R. phases (5 fasi)
('radar_riconoscimento', 'microfelicita', 'mastery', 'Maestro del Riconoscimento', 'Hai padroneggiato la fase Riconoscimento', '👁️', 60, 40),
('radar_amplificazione', 'microfelicita', 'mastery', 'Maestro dell''Amplificazione', 'Hai padroneggiato la fase Amplificazione', '🔊', 60, 41),
('radar_documentazione', 'microfelicita', 'mastery', 'Maestro della Documentazione', 'Hai padroneggiato la fase Documentazione', '📝', 60, 42),
('radar_ancora', 'microfelicita', 'mastery', 'Maestro dell''Ancoraggio', 'Hai padroneggiato la fase Ancoraggio', '⚓', 60, 43),
('radar_ripetizione', 'microfelicita', 'mastery', 'Maestro della Ripetizione', 'Hai padroneggiato la fase Ripetizione', '🔁', 60, 44),

-- Sabotatori (5 sabotatori)
('saboteur_minimizzazione', 'microfelicita', 'mastery', 'Anti-Minimizzatore', 'Hai superato la Minimizzazione', '🚫', 60, 50),
('saboteur_autointerruzione', 'microfelicita', 'mastery', 'Flusso Continuo', 'Hai superato l''Auto-Interruzione', '🌊', 60, 51),
('saboteur_cambio_fuoco', 'microfelicita', 'mastery', 'Focus Stabile', 'Hai superato il Cambio di Fuoco', '🎯', 60, 52),
('saboteur_anticipo', 'microfelicita', 'mastery', 'Presente Consapevole', 'Hai superato l''Anticipo Protettivo', '🧘', 60, 53),
('saboteur_correzione', 'microfelicita', 'mastery', 'Accettazione Emotiva', 'Hai superato la Correzione Emotiva', '💚', 60, 54)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- FUNZIONI HELPER
-- ============================================================================

-- Funzione per verificare se utente ha una milestone
CREATE OR REPLACE FUNCTION has_milestone(
  p_user_id UUID,
  p_milestone_type TEXT,
  p_path_type TEXT DEFAULT 'global'
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_milestones
    WHERE user_id = p_user_id
      AND milestone_type = p_milestone_type
      AND path_type = p_path_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per assegnare una milestone (se non già presente)
CREATE OR REPLACE FUNCTION award_milestone(
  p_user_id UUID,
  p_milestone_type TEXT,
  p_path_type TEXT DEFAULT 'global',
  p_milestone_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_milestone_id UUID;
BEGIN
  -- Inserisci solo se non esiste già
  INSERT INTO public.user_milestones (user_id, milestone_type, path_type, milestone_data)
  VALUES (p_user_id, p_milestone_type, p_path_type, p_milestone_data)
  ON CONFLICT (user_id, milestone_type, path_type) DO NOTHING
  RETURNING id INTO v_milestone_id;

  RETURN v_milestone_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere milestone non notificate
CREATE OR REPLACE FUNCTION get_unnotified_milestones(p_user_id UUID)
RETURNS TABLE (
  milestone_id UUID,
  milestone_type TEXT,
  path_type TEXT,
  milestone_data JSONB,
  achieved_at TIMESTAMPTZ,
  definition_name TEXT,
  definition_description TEXT,
  definition_icon TEXT,
  xp_reward INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    um.id,
    um.milestone_type,
    um.path_type,
    um.milestone_data,
    um.achieved_at,
    md.name,
    md.description,
    md.icon,
    md.xp_reward
  FROM public.user_milestones um
  LEFT JOIN public.milestone_definitions md ON um.milestone_type = md.code
  WHERE um.user_id = p_user_id
    AND um.notified = FALSE
  ORDER BY um.achieved_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per marcare milestone come notificata
CREATE OR REPLACE FUNCTION mark_milestone_notified(p_milestone_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_milestones
  SET notified = TRUE
  WHERE id = p_milestone_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per contare XP totali utente
CREATE OR REPLACE FUNCTION get_user_total_xp(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total_xp INTEGER;
BEGIN
  SELECT COALESCE(SUM(md.xp_reward), 0)
  INTO v_total_xp
  FROM public.user_milestones um
  JOIN public.milestone_definitions md ON um.milestone_type = md.code
  WHERE um.user_id = p_user_id;

  RETURN v_total_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTI DOCUMENTAZIONE
-- ============================================================================

COMMENT ON TABLE public.user_milestones IS 'Milestone raggiunte dagli utenti - Sistema Progressi Vitaeology';
COMMENT ON TABLE public.milestone_definitions IS 'Definizioni delle milestone disponibili';
COMMENT ON COLUMN public.user_milestones.milestone_type IS 'Codice univoco della milestone';
COMMENT ON COLUMN public.user_milestones.path_type IS 'Percorso: leadership, ostacoli, microfelicita, global';
COMMENT ON COLUMN public.user_milestones.milestone_data IS 'Dati specifici (es. punteggio raggiunto)';
COMMENT ON FUNCTION has_milestone IS 'Verifica se utente ha una specifica milestone';
COMMENT ON FUNCTION award_milestone IS 'Assegna milestone a utente (idempotente)';
COMMENT ON FUNCTION get_unnotified_milestones IS 'Ottiene milestone non ancora notificate';
COMMENT ON FUNCTION get_user_total_xp IS 'Calcola XP totali utente dalle milestone';
