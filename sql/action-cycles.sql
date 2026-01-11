-- ============================================================
-- ACTION CYCLES - Sistema START:CHANGE:STOP
-- ============================================================
-- Ogni ciclo ha: START (proposta) → CHANGE (pratica) → STOP (conseguimento)
-- Lo STOP di un ciclo propone il prossimo START
-- I micro-cicli (esercizi) compongono i macro-cicli (percorsi caratteristica)

-- Tabella principale cicli
CREATE TABLE IF NOT EXISTS public.action_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo ciclo
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('macro', 'micro')),

  -- Per micro-cicli: collegamento a esercizio
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,

  -- Per macro-cicli: caratteristica/area target
  target_characteristic TEXT,

  -- Percorso (leadership, ostacoli, microfelicita)
  path_type TEXT NOT NULL CHECK (path_type IN ('leadership', 'ostacoli', 'microfelicita')),

  -- Gerarchia: micro-cicli appartengono a un macro-ciclo
  parent_cycle_id UUID REFERENCES public.action_cycles(id) ON DELETE SET NULL,

  -- Fase corrente del ciclo
  current_phase TEXT NOT NULL DEFAULT 'start' CHECK (current_phase IN ('start', 'change', 'stop')),

  -- START: proposta e reasoning
  start_proposal TEXT,           -- Cosa viene proposto
  start_reasoning TEXT,          -- Perché questo ciclo
  started_at TIMESTAMPTZ,

  -- CHANGE: pratica in corso
  change_notes TEXT,             -- Note durante la pratica
  change_started_at TIMESTAMPTZ,

  -- STOP: conseguimento
  stop_achievement TEXT,         -- Descrizione conseguimento
  stop_achievement_type TEXT CHECK (stop_achievement_type IN ('micro', 'macro', 'milestone')),
  stop_radar_delta JSONB,        -- Delta radar (prima/dopo)
  stop_reflection TEXT,          -- Riflessione utente
  stop_next_proposal TEXT,       -- Proposta prossimo ciclo (il prossimo START)
  stopped_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_action_cycles_user_id ON public.action_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_action_cycles_path_type ON public.action_cycles(path_type);
CREATE INDEX IF NOT EXISTS idx_action_cycles_parent ON public.action_cycles(parent_cycle_id);
CREATE INDEX IF NOT EXISTS idx_action_cycles_phase ON public.action_cycles(current_phase);
CREATE INDEX IF NOT EXISTS idx_action_cycles_exercise ON public.action_cycles(exercise_id);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_action_cycles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS action_cycles_updated_at ON public.action_cycles;
CREATE TRIGGER action_cycles_updated_at
  BEFORE UPDATE ON public.action_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_action_cycles_updated_at();

-- RLS Policies
ALTER TABLE public.action_cycles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cycles" ON public.action_cycles;
CREATE POLICY "Users can view own cycles" ON public.action_cycles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cycles" ON public.action_cycles;
CREATE POLICY "Users can insert own cycles" ON public.action_cycles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cycles" ON public.action_cycles;
CREATE POLICY "Users can update own cycles" ON public.action_cycles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TABELLA CONSEGUIMENTI (Achievements)
-- ============================================================
-- Traccia tutti i conseguimenti (micro e macro) dell'utente

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collegamento al ciclo che ha generato il conseguimento
  cycle_id UUID REFERENCES public.action_cycles(id) ON DELETE SET NULL,

  -- Tipo conseguimento
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('micro', 'macro', 'milestone')),

  -- Dettagli
  title TEXT NOT NULL,
  description TEXT,
  path_type TEXT NOT NULL CHECK (path_type IN ('leadership', 'ostacoli', 'microfelicita')),

  -- Caratteristica migliorata (se applicabile)
  characteristic TEXT,

  -- Prova del conseguimento
  evidence_type TEXT CHECK (evidence_type IN ('radar_delta', 'reflection', 'exercise_complete', 'assessment_complete')),
  evidence_data JSONB,

  -- Per macro-conseguimenti: quanti micro lo compongono
  micro_count INTEGER DEFAULT 0,

  -- Celebrazione mostrata all'utente?
  celebrated BOOLEAN DEFAULT FALSE,
  celebrated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON public.user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_path ON public.user_achievements(path_type);

-- RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FUNZIONI HELPER
-- ============================================================

-- Funzione: Crea nuovo micro-ciclo (START)
CREATE OR REPLACE FUNCTION create_micro_cycle(
  p_user_id UUID,
  p_exercise_id UUID,
  p_path_type TEXT,
  p_proposal TEXT,
  p_reasoning TEXT,
  p_parent_cycle_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_cycle_id UUID;
BEGIN
  INSERT INTO public.action_cycles (
    user_id,
    cycle_type,
    exercise_id,
    path_type,
    parent_cycle_id,
    current_phase,
    start_proposal,
    start_reasoning,
    started_at
  ) VALUES (
    p_user_id,
    'micro',
    p_exercise_id,
    p_path_type,
    p_parent_cycle_id,
    'start',
    p_proposal,
    p_reasoning,
    NOW()
  )
  RETURNING id INTO v_cycle_id;

  RETURN v_cycle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Avanza ciclo a CHANGE
CREATE OR REPLACE FUNCTION advance_cycle_to_change(
  p_cycle_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.action_cycles
  SET
    current_phase = 'change',
    change_started_at = NOW()
  WHERE id = p_cycle_id
    AND current_phase = 'start';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Completa ciclo (STOP) con conseguimento
CREATE OR REPLACE FUNCTION complete_cycle_with_achievement(
  p_cycle_id UUID,
  p_achievement TEXT,
  p_reflection TEXT,
  p_radar_delta JSONB,
  p_next_proposal TEXT
)
RETURNS UUID AS $$
DECLARE
  v_cycle RECORD;
  v_achievement_id UUID;
BEGIN
  -- Recupera info ciclo
  SELECT * INTO v_cycle FROM public.action_cycles WHERE id = p_cycle_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ciclo non trovato';
  END IF;

  -- Aggiorna ciclo a STOP
  UPDATE public.action_cycles
  SET
    current_phase = 'stop',
    stop_achievement = p_achievement,
    stop_achievement_type = 'micro',
    stop_radar_delta = p_radar_delta,
    stop_reflection = p_reflection,
    stop_next_proposal = p_next_proposal,
    stopped_at = NOW()
  WHERE id = p_cycle_id;

  -- Crea record conseguimento
  INSERT INTO public.user_achievements (
    user_id,
    cycle_id,
    achievement_type,
    title,
    description,
    path_type,
    evidence_type,
    evidence_data
  ) VALUES (
    v_cycle.user_id,
    p_cycle_id,
    'micro',
    p_achievement,
    p_reflection,
    v_cycle.path_type,
    'exercise_complete',
    jsonb_build_object(
      'exercise_id', v_cycle.exercise_id,
      'radar_delta', p_radar_delta
    )
  )
  RETURNING id INTO v_achievement_id;

  RETURN v_achievement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Conta micro-conseguimenti per macro-ciclo
CREATE OR REPLACE FUNCTION count_micro_achievements(
  p_user_id UUID,
  p_path_type TEXT,
  p_characteristic TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.user_achievements
  WHERE user_id = p_user_id
    AND path_type = p_path_type
    AND achievement_type = 'micro'
    AND (p_characteristic IS NULL OR characteristic = p_characteristic);

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Verifica se è tempo di macro-conseguimento
CREATE OR REPLACE FUNCTION check_macro_achievement(
  p_user_id UUID,
  p_path_type TEXT,
  p_characteristic TEXT,
  p_threshold INTEGER DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
  v_micro_count INTEGER;
  v_has_macro BOOLEAN;
BEGIN
  -- Conta micro-conseguimenti per questa caratteristica
  v_micro_count := count_micro_achievements(p_user_id, p_path_type, p_characteristic);

  -- Verifica se esiste già un macro-conseguimento
  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements
    WHERE user_id = p_user_id
      AND path_type = p_path_type
      AND characteristic = p_characteristic
      AND achievement_type = 'macro'
  ) INTO v_has_macro;

  -- Se raggiunta soglia e non esiste macro, restituisci true
  RETURN (v_micro_count >= p_threshold AND NOT v_has_macro);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.action_cycles TO authenticated;
GRANT ALL ON public.user_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION create_micro_cycle TO authenticated;
GRANT EXECUTE ON FUNCTION advance_cycle_to_change TO authenticated;
GRANT EXECUTE ON FUNCTION complete_cycle_with_achievement TO authenticated;
GRANT EXECUTE ON FUNCTION count_micro_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION check_macro_achievement TO authenticated;
