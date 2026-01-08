-- ============================================================================
-- MIGRAZIONE: affiliate_clicks
-- Descrizione: Tracking click sui link affiliato
-- Data: 08/01/2026
-- Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Framework 4P/12F
-- Cookie duration: 90 giorni (come da guida affiliati)
-- ============================================================================

-- P1 ISTITUZIONE: Sistema tracking click

CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relazione con affiliato (denormalizzato per performance)
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ref_code TEXT NOT NULL,
  
  -- Link specifico cliccato (opzionale se click diretto su ref code)
  link_id UUID REFERENCES public.affiliate_links(id) ON DELETE SET NULL,
  
  -- Identificatore visitatore (fingerprint anonimizzato per GDPR)
  visitor_id TEXT NOT NULL,
  
  -- Cookie reference salvato (per attribuzione conversione)
  cookie_id TEXT NOT NULL UNIQUE,
  cookie_expires_at TIMESTAMPTZ NOT NULL, -- 90 giorni da click
  
  -- IP anonimizzato (solo primi 3 ottetti per GDPR)
  ip_anonymized TEXT,
  
  -- User Agent per analytics
  user_agent TEXT,
  
  -- Pagina di destinazione
  landing_page TEXT NOT NULL,
  challenge_type TEXT,
  
  -- Parametri UTM catturati
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  
  -- Referrer (da dove arriva il click)
  referrer_url TEXT,
  
  -- Geolocalizzazione approssimativa
  country_code TEXT,
  region TEXT,
  
  -- Device info
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser TEXT,
  os TEXT,
  
  -- P2 PRODOTTO: Stato conversione
  -- 'click' -> 'signup' -> 'challenge_complete' -> 'converted'
  stato_conversione TEXT DEFAULT 'click'
    CHECK (stato_conversione IN ('click', 'signup', 'challenge_started', 'challenge_complete', 'converted', 'expired')),
  
  -- Riferimenti a conversione (se avvenuta)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID, -- riferimento a subscriptions
  commissione_id UUID, -- riferimento a affiliate_commissions
  
  -- Timestamps
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  signup_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per query frequenti
CREATE INDEX idx_affiliate_clicks_affiliate ON public.affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_ref_code ON public.affiliate_clicks(ref_code);
CREATE INDEX idx_affiliate_clicks_cookie ON public.affiliate_clicks(cookie_id);
CREATE INDEX idx_affiliate_clicks_visitor ON public.affiliate_clicks(visitor_id);
CREATE INDEX idx_affiliate_clicks_stato ON public.affiliate_clicks(stato_conversione);
CREATE INDEX idx_affiliate_clicks_date ON public.affiliate_clicks(clicked_at DESC);
CREATE INDEX idx_affiliate_clicks_expires ON public.affiliate_clicks(cookie_expires_at) 
  WHERE stato_conversione = 'click';

-- Indice per query sui cookie (senza NOW() che non è IMMUTABLE)
-- La verifica scadenza va fatta nella query, non nell'indice
CREATE INDEX idx_affiliate_clicks_active_cookies ON public.affiliate_clicks(cookie_id, affiliate_id, cookie_expires_at)
  WHERE stato_conversione NOT IN ('expired', 'converted');

-- Funzione per verificare se cookie è ancora valido
CREATE OR REPLACE FUNCTION public.get_valid_affiliate_cookie(p_cookie_id TEXT)
RETURNS TABLE (
  affiliate_id UUID,
  ref_code TEXT,
  click_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.affiliate_id,
    c.ref_code,
    c.id as click_id
  FROM public.affiliate_clicks c
  WHERE c.cookie_id = p_cookie_id
    AND c.cookie_expires_at > NOW()
    AND c.stato_conversione IN ('click', 'signup', 'challenge_started', 'challenge_complete')
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Funzione per trovare affiliato da visitor_id (fallback se no cookie)
CREATE OR REPLACE FUNCTION public.get_affiliate_from_visitor(p_visitor_id TEXT)
RETURNS TABLE (
  affiliate_id UUID,
  ref_code TEXT,
  click_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.affiliate_id,
    c.ref_code,
    c.id as click_id
  FROM public.affiliate_clicks c
  WHERE c.visitor_id = p_visitor_id
    AND c.cookie_expires_at > NOW()
    AND c.stato_conversione IN ('click', 'signup', 'challenge_started', 'challenge_complete')
  ORDER BY c.clicked_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Cron job per marcare cookie scaduti (da schedulare)
-- Questo può essere chiamato da un Vercel cron job giornaliero
CREATE OR REPLACE FUNCTION public.expire_old_affiliate_cookies()
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.affiliate_clicks
  SET stato_conversione = 'expired'
  WHERE cookie_expires_at < NOW()
    AND stato_conversione IN ('click', 'signup', 'challenge_started', 'challenge_complete');
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Affiliati vedono i click sui propri link
CREATE POLICY "Affiliates can view own clicks"
  ON public.affiliate_clicks FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
    OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Solo sistema può inserire click (via API con service role)
CREATE POLICY "System can insert clicks"
  ON public.affiliate_clicks FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Solo sistema può aggiornare stato conversione
CREATE POLICY "System can update clicks"
  ON public.affiliate_clicks FOR UPDATE
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- COMMENTI DOCUMENTAZIONE
-- ============================================================================
COMMENT ON TABLE public.affiliate_clicks IS 'Tracking click link affiliato - Cookie 90 giorni';
COMMENT ON COLUMN public.affiliate_clicks.cookie_id IS 'ID univoco cookie per attribuzione conversione';
COMMENT ON COLUMN public.affiliate_clicks.cookie_expires_at IS 'Scadenza cookie: 90 giorni da click';
COMMENT ON COLUMN public.affiliate_clicks.stato_conversione IS 'Funnel: click->signup->challenge->converted';
COMMENT ON COLUMN public.affiliate_clicks.ip_anonymized IS 'IP troncato per GDPR compliance';

