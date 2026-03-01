-- Migrazione: Coda eventi Notion + tabella idempotenza
-- Supporta il sistema di integrazione piattaforma → Notion (Team Agentico)

-- ============================================================================
-- CODA EVENTI
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notion_event_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_id text NOT NULL UNIQUE,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz DEFAULT now(),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Indice per il cron processor (eventi pronti)
CREATE INDEX IF NOT EXISTS idx_notion_queue_pending
  ON public.notion_event_queue(status, next_retry_at)
  WHERE status IN ('pending', 'failed');

-- Indice per cleanup eventi completati
CREATE INDEX IF NOT EXISTS idx_notion_queue_completed
  ON public.notion_event_queue(completed_at)
  WHERE status = 'completed';

-- RLS: solo service role
ALTER TABLE public.notion_event_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on notion_event_queue"
  ON public.notion_event_queue
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- TABELLA IDEMPOTENZA (come stripe_processed_events)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notion_processed_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notion_processed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on notion_processed_events"
  ON public.notion_processed_events
  FOR ALL USING (auth.role() = 'service_role');
