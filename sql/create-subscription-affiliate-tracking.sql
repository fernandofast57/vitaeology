-- ============================================================================
-- TABELLA: subscription_affiliate_tracking
-- Descrizione: Traccia associazione subscription -> affiliato per rinnovi
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_affiliate_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  affiliate_click_id UUID REFERENCES public.affiliate_clicks(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, stripe_subscription_id)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_sub_aff_tracking_user ON public.subscription_affiliate_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_aff_tracking_subscription ON public.subscription_affiliate_tracking(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_aff_tracking_affiliate ON public.subscription_affiliate_tracking(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_sub_aff_tracking_active ON public.subscription_affiliate_tracking(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE public.subscription_affiliate_tracking ENABLE ROW LEVEL SECURITY;

-- Solo service role può gestire questa tabella
CREATE POLICY "Service role only"
  ON public.subscription_affiliate_tracking
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

COMMENT ON TABLE public.subscription_affiliate_tracking IS 'Traccia associazione subscription->affiliato per commissioni ricorrenti';
