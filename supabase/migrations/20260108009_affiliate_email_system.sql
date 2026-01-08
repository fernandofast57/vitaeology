-- =====================================================
-- VITAEOLOGY - SISTEMA EMAIL AFFILIATI
-- =====================================================
-- Data: 08 Gennaio 2026
-- Conformità: VITAEOLOGY_MEGA_PROMPT v4.3
-- Descrizione: Tabelle e funzioni per gestione email affiliati
-- =====================================================

-- =====================================================
-- 1. TABELLA LOG EMAIL INVIATE
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  email_type VARCHAR(10) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB,

  CONSTRAINT valid_email_type CHECK (
    email_type IN ('T1', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7',
                   'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'E1')
  )
);

CREATE INDEX IF NOT EXISTS idx_affiliate_email_log_affiliate ON affiliate_email_log(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_email_log_type ON affiliate_email_log(email_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_email_log_sent_at ON affiliate_email_log(sent_at);

COMMENT ON TABLE affiliate_email_log IS 'Log di tutte le email inviate agli affiliati';

-- =====================================================
-- 2. TABELLA STATO SEQUENZA EMAIL
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_email_sequence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  sequence_completed BOOLEAN DEFAULT FALSE,
  sequence_skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(affiliate_id)
);

CREATE INDEX IF NOT EXISTS idx_affiliate_email_sequence_step ON affiliate_email_sequence(current_step);

COMMENT ON TABLE affiliate_email_sequence IS 'Stato della sequenza di sviluppo D1-D7 per ogni affiliato';

-- =====================================================
-- 3. FUNZIONE: CHECK SE PUÒ INVIARE PROSSIMA EMAIL
-- =====================================================

CREATE OR REPLACE FUNCTION can_send_next_sequence_email(p_affiliate_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_record RECORD;
BEGIN
  SELECT * INTO v_record
  FROM affiliate_email_sequence
  WHERE affiliate_id = p_affiliate_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF v_record.sequence_completed OR v_record.sequence_skipped THEN
    RETURN FALSE;
  END IF;

  IF v_record.current_step >= 7 THEN
    RETURN FALSE;
  END IF;

  -- Almeno 2 giorni dall'ultima email
  IF v_record.last_email_sent_at IS NOT NULL
     AND v_record.last_email_sent_at > NOW() - INTERVAL '2 days' THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_send_next_sequence_email IS 'Verifica se un affiliato può ricevere la prossima email della sequenza';

-- =====================================================
-- 4. FUNZIONE: AVANZA SEQUENZA
-- =====================================================

CREATE OR REPLACE FUNCTION advance_sequence_step(p_affiliate_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_new_step INTEGER;
BEGIN
  UPDATE affiliate_email_sequence
  SET
    current_step = current_step + 1,
    last_email_sent_at = NOW(),
    sequence_completed = (current_step + 1 >= 7)
  WHERE affiliate_id = p_affiliate_id
  RETURNING current_step INTO v_new_step;

  RETURN v_new_step;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION advance_sequence_step IS 'Avanza lo step della sequenza email per un affiliato';

-- =====================================================
-- 5. FUNZIONE: CREA RECORD SEQUENZA
-- =====================================================

CREATE OR REPLACE FUNCTION create_affiliate_email_sequence(p_affiliate_id UUID)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO affiliate_email_sequence (affiliate_id, current_step, last_email_sent_at)
  VALUES (p_affiliate_id, 0, NOW())
  ON CONFLICT (affiliate_id) DO NOTHING
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_affiliate_email_sequence IS 'Crea record sequenza per nuovo affiliato';

-- =====================================================
-- 6. FUNZIONE: LOG EMAIL INVIATA
-- =====================================================

CREATE OR REPLACE FUNCTION log_affiliate_email(
  p_affiliate_id UUID,
  p_email_type VARCHAR(10),
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO affiliate_email_log (affiliate_id, email_type, metadata)
  VALUES (p_affiliate_id, p_email_type, p_metadata)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_affiliate_email IS 'Registra una email inviata nel log';

-- =====================================================
-- 7. FUNZIONE: CHECK HA RICEVUTO EMAIL TIPO
-- =====================================================

CREATE OR REPLACE FUNCTION has_received_email_type(
  p_affiliate_id UUID,
  p_email_type VARCHAR(10),
  p_days_ago INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  IF p_days_ago IS NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM affiliate_email_log
      WHERE affiliate_id = p_affiliate_id AND email_type = p_email_type
    ) INTO v_exists;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM affiliate_email_log
      WHERE affiliate_id = p_affiliate_id
        AND email_type = p_email_type
        AND sent_at > NOW() - (p_days_ago || ' days')::INTERVAL
    ) INTO v_exists;
  END IF;

  RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION has_received_email_type IS 'Verifica se un affiliato ha ricevuto un tipo di email';

-- =====================================================
-- 8. VIEW: DATI AFFILIATI PER EMAIL
-- =====================================================

CREATE OR REPLACE VIEW v_affiliates_email_data AS
SELECT
  a.id AS affiliate_id,
  a.email,
  a.nome,
  a.ref_code,
  a.abbonamento_utente,
  a.commissione_base,
  a.bonus_performance,
  (a.commissione_base + a.bonus_performance) AS commissione_totale,
  a.totale_clienti_attivi AS clienti_attivi,
  a.saldo_disponibile_euro AS saldo_disponibile,
  a.created_at AS affiliate_created_at,

  -- Dati esperienza utente
  p.created_at AS user_created_at,
  EXTRACT(DAY FROM NOW() - p.created_at)::INTEGER AS giorni_iscrizione,

  -- Conteggi esercizi e conversazioni
  COALESCE(
    (SELECT COUNT(*) FROM user_exercise_progress uep WHERE uep.user_id = a.user_id AND uep.status = 'completed'),
    0
  )::INTEGER AS esercizi_completati,
  COALESCE(
    (SELECT COUNT(*) FROM ai_coach_conversations acc WHERE acc.user_id = a.user_id),
    0
  )::INTEGER AS conversazioni_coach,

  -- Stato sequenza
  COALESCE(es.current_step, 0) AS sequence_step,
  COALESCE(es.sequence_completed, FALSE) AS sequence_completed,
  COALESCE(es.sequence_skipped, FALSE) AS sequence_skipped,
  es.last_email_sent_at,

  -- Ultimo click
  (SELECT MAX(created_at) FROM affiliate_clicks WHERE affiliate_id = a.id) AS last_click_at

FROM affiliates a
JOIN profiles p ON a.user_id = p.id
LEFT JOIN affiliate_email_sequence es ON es.affiliate_id = a.id
WHERE a.stato = 'active';

COMMENT ON VIEW v_affiliates_email_data IS 'Vista con tutti i dati necessari per personalizzare le email affiliati';

-- =====================================================
-- 9. VIEW: AFFILIATI CHE NECESSITANO T1
-- =====================================================

CREATE OR REPLACE VIEW v_affiliates_need_t1 AS
SELECT a.id, a.email, a.nome, a.ref_code
FROM affiliates a
WHERE a.stato = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM affiliate_email_log ael
    WHERE ael.affiliate_id = a.id AND ael.email_type = 'T1'
  );

COMMENT ON VIEW v_affiliates_need_t1 IS 'Affiliati attivi che non hanno ancora ricevuto email T1';

-- =====================================================
-- 10. VIEW: AFFILIATI IN SEQUENZA DA PROCESSARE
-- =====================================================

CREATE OR REPLACE VIEW v_affiliates_sequence_ready AS
SELECT
  es.affiliate_id,
  es.current_step,
  es.last_email_sent_at,
  (es.current_step + 1) AS next_step
FROM affiliate_email_sequence es
JOIN affiliates a ON a.id = es.affiliate_id
WHERE es.sequence_completed = FALSE
  AND es.sequence_skipped = FALSE
  AND es.current_step < 7
  AND a.stato = 'active'
  AND (
    es.last_email_sent_at IS NULL
    OR es.last_email_sent_at < NOW() - INTERVAL '2 days'
  );

COMMENT ON VIEW v_affiliates_sequence_ready IS 'Affiliati pronti per ricevere la prossima email della sequenza';

-- =====================================================
-- 11. VIEW: AFFILIATI INATTIVI PER E1
-- =====================================================

CREATE OR REPLACE VIEW v_affiliates_inactive AS
SELECT
  a.id AS affiliate_id,
  a.email,
  a.nome,
  a.ref_code,
  (SELECT MAX(created_at) FROM affiliate_clicks WHERE affiliate_id = a.id) AS last_click_at
FROM affiliates a
JOIN affiliate_email_sequence es ON es.affiliate_id = a.id
WHERE a.stato = 'active'
  AND es.sequence_completed = TRUE
  AND (
    SELECT MAX(created_at) FROM affiliate_clicks WHERE affiliate_id = a.id
  ) < NOW() - INTERVAL '14 days'
  AND NOT EXISTS (
    SELECT 1 FROM affiliate_email_log ael
    WHERE ael.affiliate_id = a.id
      AND ael.email_type = 'E1'
      AND ael.sent_at > NOW() - INTERVAL '30 days'
  );

COMMENT ON VIEW v_affiliates_inactive IS 'Affiliati inattivi da 14+ giorni che non hanno ricevuto E1 negli ultimi 30';

-- =====================================================
-- 12. RLS POLICIES
-- =====================================================

ALTER TABLE affiliate_email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_email_sequence ENABLE ROW LEVEL SECURITY;

-- Policy per affiliate_email_log
CREATE POLICY "Affiliates can view own email log" ON affiliate_email_log
  FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage email log" ON affiliate_email_log
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy per affiliate_email_sequence
CREATE POLICY "Affiliates can view own sequence" ON affiliate_email_sequence
  FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage sequences" ON affiliate_email_sequence
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- RIEPILOGO EMAIL
-- =====================================================
/*
TIPI EMAIL:
- T1: Benvenuto affiliato (immediato)
- D1-D7: Sequenza sviluppo (ogni 2 giorni)
- N1: Primo click ricevuto
- N2: Prima vendita (+€25 bonus)
- N3: Nuova commissione
- N4: Bonus performance sbloccato
- N5: Milestone raggiunto
- N6: Payout disponibile
- N7: Payout completato
- E1: Reminder inattività (14 giorni)

LOGICA SEQUENZA:
- Nuovo affiliato → T1 immediato + crea record sequenza
- Ogni 2 giorni → D1, D2, D3, D4, D5, D6, D7
- Dopo D7 → sequence_completed = TRUE

LOGICA INATTIVITÀ:
- 14 giorni senza click + sequenza completata → E1
- Max 1 E1 ogni 30 giorni
*/
