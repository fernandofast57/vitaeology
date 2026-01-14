-- =====================================================
-- SISTEMA DI MONITORAGGIO 4P×3F (12 Fattori)
-- Framework: 4 Prodotti × 3 Fattori (Quantità, Qualità, Viability)
-- =====================================================

-- Tabella principale per le metriche dei 12 fattori
CREATE TABLE IF NOT EXISTS system_metrics_12f (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('realtime', 'hourly', 'daily', 'weekly')),

  -- P1: Sistema (Istituzione di ciò che produce)
  p1_quantity_services_active INT,           -- Servizi funzionanti (0-6)
  p1_quality_uptime_percent DECIMAL(5,2),    -- % uptime nelle ultime 24h
  p1_viability_api_cost_eur DECIMAL(10,4),   -- Costo API periodo (EUR)
  p1_viability_avg_latency_ms INT,           -- Latenza media (ms)

  -- P2: Output (Prodotto generato - trasformazione utente)
  p2_quantity_conversations INT,             -- Conversazioni AI Coach
  p2_quantity_exercises_completed INT,       -- Esercizi completati
  p2_quantity_assessments_completed INT,     -- Assessment completati
  p2_quality_avg_rating DECIMAL(3,2),        -- Rating medio 1-5
  p2_quality_completion_rate DECIMAL(5,2),   -- % completamento esercizi
  p2_viability_user_retention DECIMAL(5,2),  -- % utenti ritornati (7 giorni)
  p2_viability_challenge_conversion DECIMAL(5,2), -- % challenge→assessment

  -- P3: Manutenzione (Riparazione di ciò che produce)
  p3_quantity_deploys INT,                   -- Deploy nel periodo
  p3_quantity_errors_fixed INT,              -- Errori risolti (da error_alerts)
  p3_quality_fix_effectiveness DECIMAL(5,2), -- % fix che hanno funzionato
  p3_viability_mttr_hours DECIMAL(8,2),      -- Mean Time To Recovery (ore)

  -- P4: Correzione (Correzione del prodotto generato - AI Coach)
  p4_quantity_patterns_detected INT,         -- Pattern identificati
  p4_quantity_patterns_corrected INT,        -- Pattern auto-corretti
  p4_quality_correction_effectiveness DECIMAL(5,2), -- % correzioni efficaci
  p4_viability_prevention_rate DECIMAL(5,2), -- % errori prevenuti

  -- Metadata
  alerts_triggered JSONB DEFAULT '[]'::jsonb,
  check_details JSONB DEFAULT '{}'::jsonb,   -- Dettagli servizi individuali
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per query per tipo e data
CREATE INDEX IF NOT EXISTS idx_metrics_12f_type_date
ON system_metrics_12f(metric_type, measured_at DESC);

-- Indice per query temporali
CREATE INDEX IF NOT EXISTS idx_metrics_12f_measured_at
ON system_metrics_12f(measured_at DESC);

-- =====================================================
-- SCHEDULER STATE (Stato per scheduling adattivo)
-- =====================================================

CREATE TABLE IF NOT EXISTS monitoring_schedule_state (
  check_type TEXT PRIMARY KEY,  -- 'health' | 'p2' | 'p4' | 'report'

  -- Timing
  last_check_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ,

  -- Stato anomalie
  consecutive_anomalies INT DEFAULT 0,
  consecutive_normal INT DEFAULT 0,
  is_anomaly_mode BOOLEAN DEFAULT FALSE,

  -- Intervalli (millisecondi)
  base_interval_ms INT NOT NULL,
  anomaly_interval_ms INT NOT NULL,
  current_interval_ms INT NOT NULL,
  backoff_multiplier DECIMAL(3,2) DEFAULT 1.0,

  -- Ultimo risultato
  last_status TEXT CHECK (last_status IN ('ok', 'warning', 'critical', 'error')),
  last_error TEXT,

  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserisci configurazione iniziale scheduler
INSERT INTO monitoring_schedule_state (
  check_type,
  base_interval_ms,
  anomaly_interval_ms,
  current_interval_ms,
  last_check_at
) VALUES
  ('health', 900000, 120000, 900000, NOW()),      -- 15min base, 2min anomalia
  ('p4', 3600000, 600000, 3600000, NOW()),        -- 1h base, 10min anomalia
  ('p2', 14400000, 1800000, 14400000, NOW()),     -- 4h base, 30min anomalia
  ('report', 604800000, 86400000, 604800000, NOW()) -- 7d base, 1d anomalia
ON CONFLICT (check_type) DO NOTHING;

-- =====================================================
-- ALERT LOG (Storico alert inviati)
-- =====================================================

CREATE TABLE IF NOT EXISTS monitoring_alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  alert_type TEXT NOT NULL,           -- 'p1_health' | 'p2_engagement' | etc.
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),

  metric_name TEXT NOT NULL,          -- Nome della metrica che ha triggerato
  threshold_value DECIMAL,            -- Soglia configurata
  actual_value DECIMAL,               -- Valore rilevato

  message TEXT NOT NULL,              -- Messaggio alert
  email_sent BOOLEAN DEFAULT FALSE,   -- Email inviata?

  resolved_at TIMESTAMPTZ,            -- Quando è stato risolto
  resolution_notes TEXT,              -- Note risoluzione

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_log_type_date
ON monitoring_alerts_log(alert_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_log_unresolved
ON monitoring_alerts_log(resolved_at) WHERE resolved_at IS NULL;

-- =====================================================
-- VISTA: Ultimo stato per ogni tipo di check
-- =====================================================

CREATE OR REPLACE VIEW v_monitoring_current_state AS
SELECT
  s.check_type,
  s.last_check_at,
  s.next_check_at,
  s.is_anomaly_mode,
  s.current_interval_ms,
  s.last_status,
  s.consecutive_anomalies,
  EXTRACT(EPOCH FROM (NOW() - s.last_check_at)) * 1000 AS ms_since_last_check,
  CASE
    WHEN EXTRACT(EPOCH FROM (NOW() - s.last_check_at)) * 1000 >= s.current_interval_ms
    THEN TRUE
    ELSE FALSE
  END AS should_run_now
FROM monitoring_schedule_state s;

-- =====================================================
-- VISTA: Metriche ultime 24h aggregate
-- =====================================================

CREATE OR REPLACE VIEW v_metrics_last_24h AS
SELECT
  -- P1 Aggregati
  AVG(p1_quantity_services_active) AS avg_services_active,
  AVG(p1_quality_uptime_percent) AS avg_uptime,
  SUM(p1_viability_api_cost_eur) AS total_api_cost,
  AVG(p1_viability_avg_latency_ms) AS avg_latency,

  -- P2 Aggregati
  SUM(p2_quantity_conversations) AS total_conversations,
  SUM(p2_quantity_exercises_completed) AS total_exercises,
  AVG(p2_quality_avg_rating) AS avg_rating,
  AVG(p2_quality_completion_rate) AS avg_completion_rate,

  -- P4 Aggregati
  SUM(p4_quantity_patterns_detected) AS total_patterns_detected,
  SUM(p4_quantity_patterns_corrected) AS total_patterns_corrected,

  -- Conteggi
  COUNT(*) AS check_count,
  MAX(measured_at) AS last_measurement
FROM system_metrics_12f
WHERE measured_at > NOW() - INTERVAL '24 hours';

-- =====================================================
-- FUNZIONE: Determina se un check deve essere eseguito
-- =====================================================

CREATE OR REPLACE FUNCTION fn_should_run_check(p_check_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_state monitoring_schedule_state%ROWTYPE;
  v_ms_elapsed BIGINT;
BEGIN
  SELECT * INTO v_state
  FROM monitoring_schedule_state
  WHERE check_type = p_check_type;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Calcola millisecondi trascorsi
  v_ms_elapsed := EXTRACT(EPOCH FROM (NOW() - v_state.last_check_at)) * 1000;

  RETURN v_ms_elapsed >= v_state.current_interval_ms;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNZIONE: Aggiorna stato dopo check
-- =====================================================

CREATE OR REPLACE FUNCTION fn_update_check_state(
  p_check_type TEXT,
  p_status TEXT,
  p_is_anomaly BOOLEAN,
  p_error TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_state monitoring_schedule_state%ROWTYPE;
  v_new_interval INT;
  v_new_backoff DECIMAL;
BEGIN
  SELECT * INTO v_state
  FROM monitoring_schedule_state
  WHERE check_type = p_check_type;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Calcola nuovo intervallo basato su anomalia
  IF p_is_anomaly THEN
    -- Anomalia: riduci intervallo, reset backoff
    v_new_interval := v_state.anomaly_interval_ms;
    v_new_backoff := 1.0;

    UPDATE monitoring_schedule_state SET
      last_check_at = NOW(),
      next_check_at = NOW() + (v_new_interval || ' milliseconds')::INTERVAL,
      consecutive_anomalies = consecutive_anomalies + 1,
      consecutive_normal = 0,
      is_anomaly_mode = TRUE,
      current_interval_ms = v_new_interval,
      backoff_multiplier = v_new_backoff,
      last_status = p_status,
      last_error = p_error,
      updated_at = NOW()
    WHERE check_type = p_check_type;
  ELSE
    -- Normale: incrementa backoff gradualmente (max 2x)
    v_new_backoff := LEAST(v_state.backoff_multiplier * 1.1, 2.0);
    v_new_interval := LEAST(
      (v_state.base_interval_ms * v_new_backoff)::INT,
      v_state.base_interval_ms * 2
    );

    UPDATE monitoring_schedule_state SET
      last_check_at = NOW(),
      next_check_at = NOW() + (v_new_interval || ' milliseconds')::INTERVAL,
      consecutive_anomalies = 0,
      consecutive_normal = consecutive_normal + 1,
      is_anomaly_mode = CASE
        WHEN consecutive_normal >= 3 THEN FALSE
        ELSE is_anomaly_mode
      END,
      current_interval_ms = v_new_interval,
      backoff_multiplier = v_new_backoff,
      last_status = p_status,
      last_error = NULL,
      updated_at = NOW()
    WHERE check_type = p_check_type;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS Policies (Admin only)
-- =====================================================

ALTER TABLE system_metrics_12f ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_schedule_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts_log ENABLE ROW LEVEL SECURITY;

-- Policy: Solo service role può leggere/scrivere
CREATE POLICY "Service role full access on metrics" ON system_metrics_12f
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on schedule" ON monitoring_schedule_state
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on alerts" ON monitoring_alerts_log
  FOR ALL USING (auth.role() = 'service_role');
