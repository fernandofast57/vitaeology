-- Tabella per codici OTP di verifica email
-- Sistema anti-spam: Turnstile + OTP 6 cifre

-- 1. Crea tabella
CREATE TABLE IF NOT EXISTS public.auth_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata per tracking
  ip_address TEXT,
  user_agent TEXT
);

-- 2. Abilita RLS
ALTER TABLE public.auth_verification_codes ENABLE ROW LEVEL SECURITY;

-- 3. Policy: solo service role può accedere (API backend)
CREATE POLICY "Service role full access" ON public.auth_verification_codes
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Indici per performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON public.auth_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON public.auth_verification_codes(expires_at);

-- 5. Funzione per pulire codici scaduti (chiamata periodicamente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.auth_verification_codes
  WHERE expires_at < NOW() - INTERVAL '1 hour';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 6. Commento documentazione
COMMENT ON TABLE public.auth_verification_codes IS
'Codici OTP per verifica email durante registrazione. Timeout 15 min, max 3 tentativi.';
