-- Aggiunge policy SELECT per utenti autenticati su challenge_subscribers
-- L'utente può leggere solo i propri record (match su user_id)
-- Necessaria per: useDiscoveryProgress hook, complete page, dashboard challenges

-- Policy basata su user_id (sicura, non falsificabile)
CREATE POLICY "Authenticated users can read own subscribers"
  ON challenge_subscribers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy UPDATE per permettere al client di aggiornare i propri record
-- Necessaria per: complete-day flow lato client (se serve in futuro)
CREATE POLICY "Authenticated users can update own subscribers"
  ON challenge_subscribers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
