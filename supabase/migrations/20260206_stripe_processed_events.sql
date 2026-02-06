-- C12 fix: Tabella per idempotency Stripe webhook events
-- Previene il processamento duplicato degli stessi eventi Stripe

CREATE TABLE IF NOT EXISTS public.stripe_processed_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: solo service role puo accedere
ALTER TABLE public.stripe_processed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.stripe_processed_events
  FOR ALL USING (auth.role() = 'service_role');

-- Index per lookup veloce su event_id
CREATE INDEX IF NOT EXISTS idx_stripe_processed_events_event_id
  ON public.stripe_processed_events(event_id);

-- Cleanup automatico: elimina eventi piu vecchi di 30 giorni (opzionale, via cron)
-- DELETE FROM public.stripe_processed_events WHERE processed_at < now() - interval '30 days';
