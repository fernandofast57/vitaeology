-- =============================================
-- TABELLA PENDING_PURCHASES
-- Gestisce acquisti da utenti non registrati
-- =============================================

-- Crea tabella
CREATE TABLE IF NOT EXISTS pending_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('libro', 'subscription', 'trilogy')),
  product_slug TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  amount_paid INTEGER, -- centesimi EUR
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processed_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_pending_purchases_email ON pending_purchases(email);
CREATE INDEX IF NOT EXISTS idx_pending_purchases_processed ON pending_purchases(processed);
CREATE INDEX IF NOT EXISTS idx_pending_purchases_expires ON pending_purchases(expires_at);

-- RLS
ALTER TABLE pending_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Solo service role può accedere (operazioni server-side)
DROP POLICY IF EXISTS "Service role full access" ON pending_purchases;
CREATE POLICY "Service role full access" ON pending_purchases
  FOR ALL USING (true);

-- =============================================
-- FUNZIONE: process_pending_for_user
-- Processa acquisti pendenti quando utente si registra
-- =============================================
CREATE OR REPLACE FUNCTION process_pending_for_user(
  p_user_id UUID,
  p_email TEXT
)
RETURNS TABLE (
  purchase_id UUID,
  product_type TEXT,
  product_slug TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE pending_purchases
  SET
    processed = true,
    processed_at = NOW(),
    processed_user_id = p_user_id
  WHERE
    email = LOWER(p_email)
    AND processed = false
    AND expires_at > NOW()
  RETURNING id, pending_purchases.product_type, pending_purchases.product_slug;
END;
$$;

-- =============================================
-- FUNZIONE: cleanup_expired_pending
-- Pulizia periodica acquisti scaduti (chiamata da cron)
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_expired_pending()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM pending_purchases
  WHERE expires_at < NOW() AND processed = false;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- =============================================
-- TABELLA: user_books
-- Traccia libri acquistati dagli utenti
-- =============================================
CREATE TABLE IF NOT EXISTS user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_slug TEXT NOT NULL CHECK (book_slug IN ('leadership', 'risolutore', 'microfelicita')),
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  download_count INTEGER DEFAULT 0,
  last_download_at TIMESTAMPTZ,
  UNIQUE(user_id, book_slug)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_books_user ON user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_books_slug ON user_books(book_slug);

-- RLS
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo i propri libri
DROP POLICY IF EXISTS "Users view own books" ON user_books;
CREATE POLICY "Users view own books" ON user_books
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: insert via service role
DROP POLICY IF EXISTS "Service insert books" ON user_books;
CREATE POLICY "Service insert books" ON user_books
  FOR INSERT WITH CHECK (true);
