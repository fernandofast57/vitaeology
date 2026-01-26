-- =====================================================
-- SYSTEM LOGS - Event Logging per Vitaeology
-- Complementa system_metrics_12f con logging dettagliato
-- =====================================================

-- Tabella principale per i log di sistema
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Identificazione del servizio
  service VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,

  -- Risultato dell'operazione
  status VARCHAR(20) NOT NULL,
  status_code INTEGER,

  -- Dettagli operazione
  message TEXT,
  metadata JSONB,

  -- Informazioni errore (se presente)
  error_message TEXT,
  error_stack TEXT,

  -- Metriche performance
  duration_ms INTEGER,

  -- Constraint per validazione
  CONSTRAINT valid_service CHECK (service IN ('cron', 'email', 'api', 'auth', 'coach')),
  CONSTRAINT valid_status CHECK (status IN ('success', 'error', 'warning'))
);

-- Indici per query performanti
CREATE INDEX IF NOT EXISTS idx_system_logs_service ON system_logs(service);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_status ON system_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_logs_service_action ON system_logs(service, action);

-- Indice per errori recenti (query frequente)
CREATE INDEX IF NOT EXISTS idx_system_logs_errors
  ON system_logs(created_at DESC)
  WHERE status = 'error';

-- RLS Policies
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Service role può inserire (usato dai cron/API)
DROP POLICY IF EXISTS "Service role can insert logs" ON system_logs;
CREATE POLICY "Service role can insert logs" ON system_logs
  FOR INSERT
  WITH CHECK (true);

-- Service role può leggere tutto
DROP POLICY IF EXISTS "Service role can read logs" ON system_logs;
CREATE POLICY "Service role can read logs" ON system_logs
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Admin possono leggere (per dashboard)
DROP POLICY IF EXISTS "Admin can read logs" ON system_logs;
CREATE POLICY "Admin can read logs" ON system_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'Admin'
    )
  );

-- =====================================================
-- VISTE UTILI
-- =====================================================

-- Vista: Statistiche ultime 24 ore per servizio
CREATE OR REPLACE VIEW v_system_logs_24h
WITH (security_invoker = on) AS
SELECT
  service,
  COUNT(*) FILTER (WHERE status = 'success') as successes,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  COUNT(*) FILTER (WHERE status = 'warning') as warnings,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'success')::numeric /
    NULLIF(COUNT(*), 0) * 100,
    1
  ) as success_rate,
  AVG(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) as avg_duration_ms,
  MAX(created_at) as last_log
FROM system_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY service;

-- Vista: Errori recenti (ultimi 7 giorni)
CREATE OR REPLACE VIEW v_recent_errors
WITH (security_invoker = on) AS
SELECT
  id,
  service,
  action,
  error_message,
  metadata,
  created_at
FROM system_logs
WHERE status = 'error'
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 100;

-- =====================================================
-- FUNZIONE: Pulizia log vecchi (eseguire mensilmente)
-- =====================================================

CREATE OR REPLACE FUNCTION fn_cleanup_old_logs(p_days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM system_logs
  WHERE created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Log della pulizia stessa
  INSERT INTO system_logs (service, action, status, message, metadata)
  VALUES (
    'cron',
    'cleanup_logs',
    'success',
    'Pulizia log completata',
    jsonb_build_object('deleted_count', v_deleted, 'days_kept', p_days_to_keep)
  );

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICA CREAZIONE
-- =====================================================

SELECT
  'system_logs' as table_name,
  COUNT(*) as columns
FROM information_schema.columns
WHERE table_name = 'system_logs'
AND table_schema = 'public';
