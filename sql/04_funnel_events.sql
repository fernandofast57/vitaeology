-- =============================================
-- BLOCCO 4/7: TABELLA FUNNEL_EVENTS
-- Esegui dopo blocco 3
-- =============================================

CREATE TABLE IF NOT EXISTS public.funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  anonymous_email TEXT,
  event_type VARCHAR(50) NOT NULL,
  funnel VARCHAR(20) NOT NULL CHECK (funnel IN ('leadership', 'problemi', 'benessere')),
  lead_magnet_slug VARCHAR(50) REFERENCES public.lead_magnets(slug),
  metadata JSONB DEFAULT '{}',
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  referral_code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT must_have_identifier CHECK (
    user_id IS NOT NULL OR anonymous_email IS NOT NULL
  )
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_funnel_events_user 
  ON public.funnel_events(user_id);

CREATE INDEX IF NOT EXISTS idx_funnel_events_email 
  ON public.funnel_events(anonymous_email);

CREATE INDEX IF NOT EXISTS idx_funnel_events_type 
  ON public.funnel_events(event_type);

CREATE INDEX IF NOT EXISTS idx_funnel_events_funnel 
  ON public.funnel_events(funnel);

CREATE INDEX IF NOT EXISTS idx_funnel_events_created 
  ON public.funnel_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_funnel_events_referral 
  ON public.funnel_events(referral_code);

-- Verifica
SELECT COUNT(*) as columns_count 
FROM information_schema.columns 
WHERE table_name = 'funnel_events';
