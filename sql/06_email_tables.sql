-- =============================================
-- BLOCCO 6/7: TABELLE EMAIL
-- Esegui dopo blocco 5
-- =============================================

-- Tabella sequenze email
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id SERIAL PRIMARY KEY,
  funnel VARCHAR(20) NOT NULL CHECK (funnel IN ('leadership', 'problemi', 'benessere')),
  sequence_position INTEGER NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  trigger_event VARCHAR(50) NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  template_id VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(funnel, sequence_position)
);

-- Tabella tracking invii
CREATE TABLE IF NOT EXISTS public.email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email_address TEXT NOT NULL,
  sequence_id INTEGER REFERENCES public.email_sequences(id),
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  provider_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici email_sends
CREATE INDEX IF NOT EXISTS idx_email_sends_user 
  ON public.email_sends(user_id);

CREATE INDEX IF NOT EXISTS idx_email_sends_status 
  ON public.email_sends(status);

-- RLS email_sends
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email sends" ON public.email_sends;
CREATE POLICY "Users can view own email sends"
  ON public.email_sends FOR SELECT
  USING (auth.uid() = user_id);

-- Verifica
SELECT 'email_sequences' as table_name, COUNT(*) as count FROM public.email_sequences
UNION ALL
SELECT 'email_sends', COUNT(*) FROM public.email_sends;
