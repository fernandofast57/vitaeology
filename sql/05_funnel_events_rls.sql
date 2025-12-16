-- =============================================
-- BLOCCO 5/7: RLS FUNNEL_EVENTS
-- Esegui dopo blocco 4
-- =============================================

-- Abilita RLS
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo propri eventi
DROP POLICY IF EXISTS "Users can view own funnel events" ON public.funnel_events;
CREATE POLICY "Users can view own funnel events"
  ON public.funnel_events FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: admin vede tutto
DROP POLICY IF EXISTS "Admins can view all funnel events" ON public.funnel_events;
CREATE POLICY "Admins can view all funnel events"
  ON public.funnel_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'Admin'
    )
  );

-- Policy: insert aperto per tracking anonimo
DROP POLICY IF EXISTS "Anyone can insert funnel events" ON public.funnel_events;
CREATE POLICY "Anyone can insert funnel events"
  ON public.funnel_events FOR INSERT
  WITH CHECK (true);

-- Verifica
SELECT policyname FROM pg_policies 
WHERE tablename = 'funnel_events';
