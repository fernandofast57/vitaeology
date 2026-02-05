-- High Ticket Purchases Table
-- Per tracciare acquisti one-time di Coaching e Advisory

CREATE TABLE IF NOT EXISTS public.high_ticket_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type text NOT NULL CHECK (product_type IN ('coaching', 'advisory')),
  stripe_session_id text,
  stripe_payment_intent text,
  amount_paid numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'refunded')),
  purchased_at timestamptz NOT NULL DEFAULT now(),

  -- Coaching specifico
  sessions_total integer DEFAULT 12,
  sessions_used integer DEFAULT 0,
  coaching_start_date date,
  coaching_end_date date,

  -- Advisory specifico
  advisory_year integer,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(user_id, product_type)
);

-- RLS
ALTER TABLE public.high_ticket_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo i propri acquisti
CREATE POLICY "Users can view own high ticket purchases" ON public.high_ticket_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: service role può fare tutto
CREATE POLICY "Service role full access" ON public.high_ticket_purchases
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_high_ticket_user_id ON public.high_ticket_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_high_ticket_product_type ON public.high_ticket_purchases(product_type);
CREATE INDEX IF NOT EXISTS idx_high_ticket_status ON public.high_ticket_purchases(status);

-- Trigger per updated_at
CREATE TRIGGER update_high_ticket_updated_at
  BEFORE UPDATE ON public.high_ticket_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commento
COMMENT ON TABLE public.high_ticket_purchases IS 'Traccia acquisti high-ticket one-time: 1:1 Coaching (€4,997) e Advisory Board (€12,000)';
