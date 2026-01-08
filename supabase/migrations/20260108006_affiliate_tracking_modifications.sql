-- ============================================================================
-- MIGRAZIONE: affiliate_tracking_modifications
-- Descrizione: Modifiche tabelle esistenti per referral tracking
-- Data: 08/01/2026
-- Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Framework 4P/12F
-- ============================================================================

-- P1 ISTITUZIONE: Integrazione tracking referral nelle tabelle esistenti

-- ============================================================================
-- 1. MODIFICA challenge_subscribers
-- ============================================================================
-- Aggiungi colonne per tracciare referral nelle iscrizioni challenge

ALTER TABLE public.challenge_subscribers 
ADD COLUMN IF NOT EXISTS referral_code TEXT;

ALTER TABLE public.challenge_subscribers 
ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL;

ALTER TABLE public.challenge_subscribers 
ADD COLUMN IF NOT EXISTS affiliate_click_id UUID REFERENCES public.affiliate_clicks(id) ON DELETE SET NULL;

-- Indice per query referral
CREATE INDEX IF NOT EXISTS idx_challenge_subscribers_referral 
ON public.challenge_subscribers(referral_code) 
WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_challenge_subscribers_affiliate 
ON public.challenge_subscribers(affiliate_id) 
WHERE affiliate_id IS NOT NULL;

-- Commento
COMMENT ON COLUMN public.challenge_subscribers.referral_code IS 'Codice referral affiliato (es: AFF-ABC123)';
COMMENT ON COLUMN public.challenge_subscribers.affiliate_id IS 'ID affiliato che ha portato questo lead';
COMMENT ON COLUMN public.challenge_subscribers.affiliate_click_id IS 'ID click che ha generato questa iscrizione';

-- ============================================================================
-- 2. MODIFICA profiles (se esiste)
-- ============================================================================
-- Aggiungi tracking referral per utenti registrati

DO $$
BEGIN
  -- Verifica se la tabella profiles esiste
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    
    -- Aggiungi colonne referral
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS referral_code TEXT;
    
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS referred_by_affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL;
    
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS affiliate_click_id UUID REFERENCES public.affiliate_clicks(id) ON DELETE SET NULL;
    
    -- Indice
    CREATE INDEX IF NOT EXISTS idx_profiles_referral 
    ON public.profiles(referral_code) 
    WHERE referral_code IS NOT NULL;
    
    CREATE INDEX IF NOT EXISTS idx_profiles_referred_by 
    ON public.profiles(referred_by_affiliate_id) 
    WHERE referred_by_affiliate_id IS NOT NULL;
    
    -- Commenti
    COMMENT ON COLUMN public.profiles.referral_code IS 'Codice referral usato alla registrazione';
    COMMENT ON COLUMN public.profiles.referred_by_affiliate_id IS 'Affiliato che ha portato questo utente';
    
  END IF;
END $$;

-- ============================================================================
-- 3. CREA TABELLA subscriptions_affiliate_tracking (se subscriptions non modificabile)
-- ============================================================================
-- Tabella di join per tracciare quali subscription provengono da affiliati

CREATE TABLE IF NOT EXISTS public.subscription_affiliate_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Riferimenti
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  
  -- Tracking affiliato
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL,
  affiliate_click_id UUID REFERENCES public.affiliate_clicks(id) ON DELETE SET NULL,
  referral_code TEXT,
  
  -- Stato
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_subscription_affiliate_tracking_user 
ON public.subscription_affiliate_tracking(user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_affiliate_tracking_stripe 
ON public.subscription_affiliate_tracking(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscription_affiliate_tracking_affiliate 
ON public.subscription_affiliate_tracking(affiliate_id)
WHERE affiliate_id IS NOT NULL;

-- RLS
ALTER TABLE public.subscription_affiliate_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription tracking"
  ON public.subscription_affiliate_tracking FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "System can insert subscription tracking"
  ON public.subscription_affiliate_tracking FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "System can update subscription tracking"
  ON public.subscription_affiliate_tracking FOR UPDATE
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

COMMENT ON TABLE public.subscription_affiliate_tracking IS 'Tracking affiliato per subscription Stripe';

-- ============================================================================
-- 4. FUNZIONE HELPER: Trova affiliato da referral code
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_affiliate_by_ref_code(p_ref_code TEXT)
RETURNS TABLE (
  affiliate_id UUID,
  email TEXT,
  nome TEXT,
  categoria TEXT,
  commissione_percentuale INTEGER,
  stato TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.email,
    a.nome,
    a.categoria,
    a.commissione_percentuale,
    a.stato
  FROM public.affiliates a
  WHERE a.ref_code = p_ref_code
    AND a.stato = 'active'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. FUNZIONE: Registra referral su iscrizione challenge
-- ============================================================================

CREATE OR REPLACE FUNCTION public.track_challenge_subscription_referral(
  p_subscriber_id UUID,
  p_ref_code TEXT,
  p_cookie_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_affiliate_id UUID;
  v_click_id UUID;
BEGIN
  -- Cerca affiliato da ref_code
  SELECT id INTO v_affiliate_id
  FROM public.affiliates
  WHERE ref_code = p_ref_code AND stato = 'active';
  
  IF v_affiliate_id IS NULL THEN
    RETURN FALSE; -- Ref code non valido
  END IF;
  
  -- Cerca click da cookie se fornito
  IF p_cookie_id IS NOT NULL THEN
    SELECT id INTO v_click_id
    FROM public.affiliate_clicks
    WHERE cookie_id = p_cookie_id
      AND affiliate_id = v_affiliate_id
      AND cookie_expires_at > NOW()
    LIMIT 1;
  END IF;
  
  -- Aggiorna subscriber con referral
  UPDATE public.challenge_subscribers
  SET 
    referral_code = p_ref_code,
    affiliate_id = v_affiliate_id,
    affiliate_click_id = v_click_id
  WHERE id = p_subscriber_id;
  
  -- Aggiorna click status se trovato
  IF v_click_id IS NOT NULL THEN
    UPDATE public.affiliate_clicks
    SET 
      stato_conversione = 'signup',
      signup_at = NOW()
    WHERE id = v_click_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. VIEW: Conversioni affiliate aggregate
-- ============================================================================

CREATE OR REPLACE VIEW public.affiliate_conversions_summary AS
SELECT 
  a.id AS affiliate_id,
  a.ref_code,
  a.nome,
  a.email,
  a.categoria,
  a.stato,
  -- Metriche challenge
  COUNT(DISTINCT cs.id) AS challenge_signups,
  COUNT(DISTINCT cs.id) FILTER (WHERE cs.status = 'completed') AS challenge_completions,
  -- Metriche subscription
  COUNT(DISTINCT sat.id) AS subscriptions_totali,
  COUNT(DISTINCT sat.id) FILTER (WHERE sat.is_active) AS subscriptions_attive,
  -- Commissioni
  COALESCE(SUM(ac.importo_commissione_euro), 0) AS totale_commissioni,
  COALESCE(SUM(ac.importo_commissione_euro) FILTER (WHERE ac.stato = 'paid'), 0) AS commissioni_pagate,
  COALESCE(SUM(ac.importo_commissione_euro) FILTER (WHERE ac.stato IN ('pending', 'approved')), 0) AS commissioni_pending
FROM public.affiliates a
LEFT JOIN public.challenge_subscribers cs ON a.id = cs.affiliate_id
LEFT JOIN public.subscription_affiliate_tracking sat ON a.id = sat.affiliate_id
LEFT JOIN public.affiliate_commissions ac ON a.id = ac.affiliate_id
GROUP BY a.id;

COMMENT ON VIEW public.affiliate_conversions_summary IS 'Riepilogo conversioni per affiliato';

-- ============================================================================
-- 7. TRIGGER: Aggiorna click status quando challenge subscriber cambia stato
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_affiliate_click_on_challenge_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Se subscriber ha un affiliate_click_id, aggiorna stato
  IF NEW.affiliate_click_id IS NOT NULL THEN
    
    -- Challenge started
    IF NEW.current_day > 0 AND OLD.current_day = 0 THEN
      UPDATE public.affiliate_clicks
      SET stato_conversione = 'challenge_started'
      WHERE id = NEW.affiliate_click_id
        AND stato_conversione IN ('click', 'signup');
    END IF;
    
    -- Challenge completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      UPDATE public.affiliate_clicks
      SET stato_conversione = 'challenge_complete'
      WHERE id = NEW.affiliate_click_id
        AND stato_conversione IN ('click', 'signup', 'challenge_started');
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verifica se la colonna current_day esiste prima di creare trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'challenge_subscribers' 
    AND column_name = 'current_day'
  ) THEN
    DROP TRIGGER IF EXISTS on_challenge_subscriber_progress ON public.challenge_subscribers;
    CREATE TRIGGER on_challenge_subscriber_progress
      AFTER UPDATE ON public.challenge_subscribers
      FOR EACH ROW
      EXECUTE FUNCTION public.update_affiliate_click_on_challenge_progress();
  END IF;
END $$;

