-- Policy UPDATE per user_books: permette aggiornamento download_count e last_download_at
-- Necessaria per l'endpoint /api/libro/download (auth mode)

-- Verifica se la policy esiste già prima di crearla
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_books'
    AND policyname = 'Users update own book downloads'
  ) THEN
    EXECUTE 'CREATE POLICY "Users update own book downloads" ON user_books
      FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
END
$$;
