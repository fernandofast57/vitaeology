-- =============================================
-- BLOCCO 10/12: RLS SUPPORT_TICKETS
-- Esegui dopo blocco 9
-- =============================================

-- Abilita RLS su entrambe le tabelle
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- ===== POLICIES SUPPORT_TICKETS =====

-- Utenti vedono solo i propri ticket
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Utenti possono creare ticket
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Utenti possono aggiornare solo alcuni campi dei propri ticket
DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;
CREATE POLICY "Users can update own tickets"
  ON public.support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

-- Staff (Admin/Operator) vede tutti i ticket
DROP POLICY IF EXISTS "Staff can view all tickets" ON public.support_tickets;
CREATE POLICY "Staff can view all tickets"
  ON public.support_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type IN ('Admin', 'Operator')
    )
  );

-- Staff può modificare tutti i ticket
DROP POLICY IF EXISTS "Staff can update all tickets" ON public.support_tickets;
CREATE POLICY "Staff can update all tickets"
  ON public.support_tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type IN ('Admin', 'Operator')
    )
  );

-- ===== POLICIES TICKET_MESSAGES =====

-- Utenti vedono messaggi dei propri ticket (esclusi interni)
DROP POLICY IF EXISTS "Users can view own ticket messages" ON public.ticket_messages;
CREATE POLICY "Users can view own ticket messages"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    )
    AND is_internal = FALSE
  );

-- Utenti possono creare messaggi nei propri ticket
DROP POLICY IF EXISTS "Users can create messages in own tickets" ON public.ticket_messages;
CREATE POLICY "Users can create messages in own tickets"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

-- Staff vede tutti i messaggi (inclusi interni)
DROP POLICY IF EXISTS "Staff can view all messages" ON public.ticket_messages;
CREATE POLICY "Staff can view all messages"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type IN ('Admin', 'Operator')
    )
  );

-- Staff può creare messaggi in qualsiasi ticket
DROP POLICY IF EXISTS "Staff can create messages" ON public.ticket_messages;
CREATE POLICY "Staff can create messages"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type IN ('Admin', 'Operator')
    )
  );

-- Verifica policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('support_tickets', 'ticket_messages')
ORDER BY tablename, policyname;
