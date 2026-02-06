-- ============================================================================
-- ANTI-SPAM SYSTEM - Database Schema
-- Creato: 6 Febbraio 2026
-- Descrizione: Tabelle per logging, monitoring e quarantena spam
-- ============================================================================

-- ============================================================================
-- B1: SIGNUP ATTEMPTS TABLE
-- Traccia TUTTI i tentativi di registrazione (successi e fallimenti)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.signup_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dati del tentativo
  email text NOT NULL,
  name text,
  ip_address text,
  user_agent text,

  -- Risultati validazione
  turnstile_passed boolean DEFAULT false,
  email_valid boolean DEFAULT true,
  name_suspicion_score integer DEFAULT 0,

  -- Esito
  blocked boolean DEFAULT false,
  block_reason text,
  success boolean DEFAULT false,

  -- Fonte del tentativo
  source text NOT NULL CHECK (source IN ('signup', 'challenge', 'affiliate', 'beta', 'contact', 'forgot_password')),

  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- RLS: solo service_role può leggere/scrivere
ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on signup_attempts"
  ON public.signup_attempts
  FOR ALL
  USING (auth.role() = 'service_role');

-- Indici per query di monitoring
CREATE INDEX IF NOT EXISTS idx_signup_attempts_created
  ON public.signup_attempts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_signup_attempts_ip
  ON public.signup_attempts(ip_address);

CREATE INDEX IF NOT EXISTS idx_signup_attempts_email
  ON public.signup_attempts(email);

CREATE INDEX IF NOT EXISTS idx_signup_attempts_blocked
  ON public.signup_attempts(blocked)
  WHERE blocked = true;

CREATE INDEX IF NOT EXISTS idx_signup_attempts_source
  ON public.signup_attempts(source);

-- ============================================================================
-- C1: SPAM STATUS IN PROFILES
-- Aggiunge colonna per quarantena utenti sospetti
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'spam_status'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN spam_status text DEFAULT 'clean'
    CHECK (spam_status IN ('clean', 'quarantined', 'confirmed_spam', 'verified'));

    COMMENT ON COLUMN public.profiles.spam_status IS
      'Stato spam: clean=normale, quarantined=sospetto, confirmed_spam=spam confermato, verified=verificato manualmente';
  END IF;
END $$;

-- Indice per query sullo spam status
CREATE INDEX IF NOT EXISTS idx_profiles_spam_status
  ON public.profiles(spam_status)
  WHERE spam_status != 'clean';

-- ============================================================================
-- C2: IP BLOCKLIST TABLE
-- Blocco temporaneo IP sospetti (max 24h, auto-scade)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ip_blocklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  ip_address text NOT NULL UNIQUE,

  -- Dettagli blocco
  blocked_until timestamptz NOT NULL,
  reason text NOT NULL,
  blocked_by text DEFAULT 'system', -- 'system' o 'admin'

  -- Stats
  attempt_count integer DEFAULT 1,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: solo service_role può leggere/scrivere
ALTER TABLE public.ip_blocklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on ip_blocklist"
  ON public.ip_blocklist
  FOR ALL
  USING (auth.role() = 'service_role');

-- Indice per lookup rapido IP
CREATE INDEX IF NOT EXISTS idx_ip_blocklist_ip
  ON public.ip_blocklist(ip_address);

-- Indice per pulizia scaduti
CREATE INDEX IF NOT EXISTS idx_ip_blocklist_expiry
  ON public.ip_blocklist(blocked_until);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Funzione per verificare se un IP è bloccato
CREATE OR REPLACE FUNCTION public.is_ip_blocked(check_ip text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.ip_blocklist
    WHERE ip_address = check_ip
    AND blocked_until > now()
  );
END;
$$;

-- Funzione per bloccare un IP (upsert)
CREATE OR REPLACE FUNCTION public.block_ip(
  p_ip_address text,
  p_reason text,
  p_hours integer DEFAULT 24,
  p_blocked_by text DEFAULT 'system'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.ip_blocklist (ip_address, blocked_until, reason, blocked_by, attempt_count)
  VALUES (p_ip_address, now() + (p_hours || ' hours')::interval, p_reason, p_blocked_by, 1)
  ON CONFLICT (ip_address) DO UPDATE SET
    blocked_until = GREATEST(ip_blocklist.blocked_until, now() + (p_hours || ' hours')::interval),
    reason = p_reason,
    attempt_count = ip_blocklist.attempt_count + 1,
    updated_at = now();
END;
$$;

-- Funzione per pulire IP scaduti (da chiamare periodicamente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_ip_blocks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.ip_blocklist WHERE blocked_until < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- VIEWS PER MONITORING (con security_invoker)
-- ============================================================================

-- Vista per statistiche spam ultime 24h
CREATE OR REPLACE VIEW public.spam_stats_24h
WITH (security_invoker = on) AS
SELECT
  source,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE blocked = true) as blocked_count,
  COUNT(*) FILTER (WHERE success = true) as success_count,
  AVG(name_suspicion_score) as avg_suspicion_score,
  COUNT(DISTINCT ip_address) as unique_ips
FROM public.signup_attempts
WHERE created_at > now() - interval '24 hours'
GROUP BY source;

-- Vista per IP sospetti (più di 3 tentativi in 1 ora)
CREATE OR REPLACE VIEW public.suspicious_ips
WITH (security_invoker = on) AS
SELECT
  ip_address,
  COUNT(*) as attempt_count,
  COUNT(*) FILTER (WHERE blocked = true) as blocked_count,
  MAX(created_at) as last_attempt,
  array_agg(DISTINCT source) as sources
FROM public.signup_attempts
WHERE created_at > now() - interval '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 3
ORDER BY attempt_count DESC;

-- ============================================================================
-- GRANTS (per service_role)
-- ============================================================================

GRANT ALL ON public.signup_attempts TO service_role;
GRANT ALL ON public.ip_blocklist TO service_role;
GRANT EXECUTE ON FUNCTION public.is_ip_blocked TO service_role;
GRANT EXECUTE ON FUNCTION public.block_ip TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_ip_blocks TO service_role;
GRANT SELECT ON public.spam_stats_24h TO service_role;
GRANT SELECT ON public.suspicious_ips TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.signup_attempts IS
  'Log di tutti i tentativi di registrazione per monitoring anti-spam';

COMMENT ON TABLE public.ip_blocklist IS
  'Lista IP bloccati temporaneamente (max 24h, auto-scade)';

COMMENT ON FUNCTION public.is_ip_blocked IS
  'Verifica se un IP è attualmente bloccato';

COMMENT ON FUNCTION public.block_ip IS
  'Blocca un IP per N ore (default 24h). Usa upsert per estendere blocchi esistenti.';
