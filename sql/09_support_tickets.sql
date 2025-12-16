-- =============================================
-- BLOCCO 9/12: SUPPORT_TICKETS
-- Priorità: 🔴 ALTA (Prima del Lancio)
-- Riferimento: CONTROL_TOWER PARTE 4.2
-- =============================================

-- Tabella principale ticket
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Contenuto
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Categorizzazione
  category VARCHAR(30) 
    CHECK (category IN ('technical', 'billing', 'content', 'account', 'other')),
  priority VARCHAR(10) DEFAULT 'normal' 
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'open' 
    CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  
  -- Assegnazione
  assigned_to UUID REFERENCES public.profiles(id),
  
  -- Timestamps eventi
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Feedback
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  satisfaction_comment TEXT,
  
  -- Metadata
  source VARCHAR(20) DEFAULT 'web' 
    CHECK (source IN ('web', 'email', 'chat', 'phone')),
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON public.support_tickets(created_at DESC);

-- Tabella messaggi ticket
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Contenuto
  message TEXT NOT NULL,
  
  -- Tipo
  is_internal BOOLEAN DEFAULT FALSE, -- Note interne staff, non visibili a utente
  
  -- Allegati (URL file)
  attachments TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_ticket ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.ticket_messages(created_at);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ticket_updated ON public.support_tickets;
CREATE TRIGGER trigger_ticket_updated
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_timestamp();

-- Trigger per first_response_at
CREATE OR REPLACE FUNCTION set_first_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Se è il primo messaggio non dell'utente e first_response_at è NULL
  IF NEW.sender_id != (SELECT user_id FROM public.support_tickets WHERE id = NEW.ticket_id) THEN
    UPDATE public.support_tickets 
    SET first_response_at = NOW() 
    WHERE id = NEW.ticket_id AND first_response_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_first_response ON public.ticket_messages;
CREATE TRIGGER trigger_first_response
  AFTER INSERT ON public.ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_first_response();

-- Verifica
SELECT 
  'support_tickets' as table_name, 
  COUNT(*) as columns 
FROM information_schema.columns 
WHERE table_name = 'support_tickets'
UNION ALL
SELECT 
  'ticket_messages', 
  COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'ticket_messages';
