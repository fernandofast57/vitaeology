-- =====================================================
-- VITAEOLOGY - AGGIORNAMENTO STRUTTURA COMMISSIONI
-- =====================================================
-- Data: 08 Gennaio 2026
-- Conformità: VITAEOLOGY_MEGA_PROMPT v4.3
-- Descrizione: Commissioni basate su livello utente + bonus performance
-- =====================================================

-- =====================================================
-- 1. AGGIORNA ENUM CATEGORIA (se necessario)
-- =====================================================
-- Le categorie esistenti (BASE, PRO, PARTNER, SUPER) rimangono
-- ma ora sono CALCOLATE, non assegnate manualmente

-- =====================================================
-- 2. AGGIUNGI COLONNE PER TRACKING ABBONAMENTO
-- =====================================================
-- NOTE: La tabella affiliates usa:
--   - totale_clienti_attivi (non clienti_attivi)
--   - saldo_disponibile_euro (non saldo_disponibile)
--   - totale_commissioni_euro (non totale_guadagnato)
--   - commissione_percentuale è INTEGER (non DECIMAL)

ALTER TABLE affiliates
ADD COLUMN IF NOT EXISTS abbonamento_utente VARCHAR(20) DEFAULT 'leader',
ADD COLUMN IF NOT EXISTS commissione_base DECIMAL(5,2) DEFAULT 25.00,
ADD COLUMN IF NOT EXISTS bonus_performance DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS bonus_milestone_mensile DECIMAL(10,2) DEFAULT 0.00;

-- Constraint per abbonamento_utente
ALTER TABLE affiliates 
DROP CONSTRAINT IF EXISTS affiliates_abbonamento_utente_check;

ALTER TABLE affiliates 
ADD CONSTRAINT affiliates_abbonamento_utente_check 
CHECK (abbonamento_utente IN ('leader', 'mentor', 'mastermind', 'consulente'));

COMMENT ON COLUMN affiliates.abbonamento_utente IS 'Livello abbonamento utente: leader, mentor, mastermind, consulente';
COMMENT ON COLUMN affiliates.commissione_base IS 'Commissione base derivata da abbonamento: 25%, 30%, 35%, 40%';
COMMENT ON COLUMN affiliates.bonus_performance IS 'Bonus performance: +3% (10+ clienti), +5% (30+ clienti)';
COMMENT ON COLUMN affiliates.bonus_milestone_mensile IS 'Bonus mensile milestone: €500 (50 clienti), €1000 (100 clienti)';

-- =====================================================
-- 3. TABELLA BONUS MILESTONE
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_milestone_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  milestone_type VARCHAR(50) NOT NULL, -- 'prima_vendita', '50_clienti', '100_clienti'
  importo DECIMAL(10,2) NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(affiliate_id, milestone_type)
);

CREATE INDEX IF NOT EXISTS idx_milestone_bonuses_affiliate ON affiliate_milestone_bonuses(affiliate_id);

COMMENT ON TABLE affiliate_milestone_bonuses IS 'Tracking bonus milestone raggiunti dagli affiliati';

-- =====================================================
-- 4. FUNZIONE: CALCOLA COMMISSIONE BASE DA ABBONAMENTO
-- =====================================================

CREATE OR REPLACE FUNCTION get_commissione_base_da_abbonamento(p_abbonamento VARCHAR)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  RETURN CASE p_abbonamento
    WHEN 'leader' THEN 25.00
    WHEN 'mentor' THEN 30.00
    WHEN 'mastermind' THEN 35.00
    WHEN 'consulente' THEN 40.00
    ELSE 25.00
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_commissione_base_da_abbonamento IS 'Restituisce commissione base in base al livello abbonamento';

-- =====================================================
-- 5. FUNZIONE: CALCOLA BONUS PERFORMANCE
-- =====================================================

CREATE OR REPLACE FUNCTION get_bonus_performance(p_clienti_attivi INTEGER)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  RETURN CASE
    WHEN p_clienti_attivi >= 30 THEN 5.00
    WHEN p_clienti_attivi >= 10 THEN 3.00
    ELSE 0.00
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_bonus_performance IS 'Restituisce bonus performance: +3% (10+ clienti), +5% (30+ clienti)';

-- =====================================================
-- 6. FUNZIONE: CALCOLA BONUS MILESTONE MENSILE
-- =====================================================

CREATE OR REPLACE FUNCTION get_bonus_milestone_mensile(p_clienti_attivi INTEGER)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN CASE
    WHEN p_clienti_attivi >= 100 THEN 1000.00
    WHEN p_clienti_attivi >= 50 THEN 500.00
    ELSE 0.00
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_bonus_milestone_mensile IS 'Restituisce bonus mensile: €500 (50 clienti), €1000 (100 clienti)';

-- =====================================================
-- 7. FUNZIONE: CALCOLA COMMISSIONE TOTALE
-- =====================================================

CREATE OR REPLACE FUNCTION calcola_commissione_affiliato(
  p_affiliate_id UUID,
  p_importo_vendita DECIMAL(10,2)
)
RETURNS TABLE (
  commissione_percentuale DECIMAL(5,2),
  commissione_euro DECIMAL(10,2),
  dettaglio JSONB
) AS $$
DECLARE
  v_abbonamento VARCHAR(20);
  v_clienti_attivi INTEGER;
  v_base DECIMAL(5,2);
  v_bonus_perf DECIMAL(5,2);
  v_totale_perc DECIMAL(5,2);
  v_commissione DECIMAL(10,2);
BEGIN
  -- Ottieni dati affiliato
  SELECT
    a.abbonamento_utente,
    a.totale_clienti_attivi
  INTO v_abbonamento, v_clienti_attivi
  FROM affiliates a
  WHERE a.id = p_affiliate_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Affiliato non trovato: %', p_affiliate_id;
  END IF;
  
  -- Calcola componenti
  v_base := get_commissione_base_da_abbonamento(v_abbonamento);
  v_bonus_perf := get_bonus_performance(v_clienti_attivi);
  v_totale_perc := v_base + v_bonus_perf;
  
  -- Cap al 45% massimo
  IF v_totale_perc > 45.00 THEN
    v_totale_perc := 45.00;
  END IF;
  
  v_commissione := ROUND(p_importo_vendita * v_totale_perc / 100, 2);
  
  RETURN QUERY SELECT 
    v_totale_perc,
    v_commissione,
    jsonb_build_object(
      'abbonamento', v_abbonamento,
      'clienti_attivi', v_clienti_attivi,
      'commissione_base', v_base,
      'bonus_performance', v_bonus_perf,
      'percentuale_totale', v_totale_perc
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calcola_commissione_affiliato IS 'Calcola commissione totale per una vendita specifica';

-- =====================================================
-- 8. FUNZIONE: AGGIORNA METRICHE AFFILIATO
-- =====================================================

CREATE OR REPLACE FUNCTION aggiorna_metriche_affiliato(p_affiliate_id UUID)
RETURNS VOID AS $$
DECLARE
  v_clienti_attivi INTEGER;
  v_abbonamento VARCHAR(20);
  v_totale_perc INTEGER;
BEGIN
  -- Conta clienti attivi (utenti con subscription attive portati dall'affiliato)
  -- Usa profiles.subscription_status invece della tabella subscriptions
  SELECT COUNT(DISTINCT sat.user_id)
  INTO v_clienti_attivi
  FROM subscription_affiliate_tracking sat
  JOIN profiles p ON sat.user_id = p.id
  WHERE sat.affiliate_id = p_affiliate_id
    AND p.subscription_status = 'active';

  -- Ottieni abbonamento utente affiliato
  SELECT
    CASE
      WHEN p.subscription_tier = 'mentor' THEN 'mentor'
      WHEN p.subscription_tier = 'mastermind' THEN 'mastermind'
      WHEN p.is_consultant = TRUE THEN 'consulente'
      ELSE 'leader'
    END
  INTO v_abbonamento
  FROM affiliates a
  JOIN profiles p ON a.user_id = p.id
  WHERE a.id = p_affiliate_id;

  -- Calcola percentuale totale (INTEGER per compatibilità con colonna esistente)
  v_totale_perc := FLOOR(get_commissione_base_da_abbonamento(COALESCE(v_abbonamento, 'leader')) + get_bonus_performance(COALESCE(v_clienti_attivi, 0)));

  -- Aggiorna affiliato (usa nomi colonne corretti)
  UPDATE affiliates
  SET
    totale_clienti_attivi = COALESCE(v_clienti_attivi, 0),
    abbonamento_utente = COALESCE(v_abbonamento, 'leader'),
    commissione_base = get_commissione_base_da_abbonamento(COALESCE(v_abbonamento, 'leader')),
    bonus_performance = get_bonus_performance(COALESCE(v_clienti_attivi, 0)),
    bonus_milestone_mensile = get_bonus_milestone_mensile(COALESCE(v_clienti_attivi, 0)),
    commissione_percentuale = v_totale_perc,
    -- Aggiorna anche categoria per retrocompatibilità
    categoria = CASE
      WHEN COALESCE(v_abbonamento, 'leader') = 'consulente' THEN 'SUPER'
      WHEN COALESCE(v_abbonamento, 'leader') = 'mastermind' THEN 'PARTNER'
      WHEN COALESCE(v_abbonamento, 'leader') = 'mentor' THEN 'PRO'
      ELSE 'BASE'
    END,
    updated_at = NOW()
  WHERE id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION aggiorna_metriche_affiliato IS 'Aggiorna tutte le metriche e commissioni di un affiliato';

-- =====================================================
-- 9. FUNZIONE: CHECK E ASSEGNA BONUS MILESTONE
-- =====================================================

CREATE OR REPLACE FUNCTION check_and_assign_milestone_bonus(p_affiliate_id UUID)
RETURNS TABLE (
  milestone_type VARCHAR(50),
  importo DECIMAL(10,2),
  is_new BOOLEAN
) AS $$
DECLARE
  v_clienti_attivi INTEGER;
  v_ha_commissioni BOOLEAN;
  v_milestone RECORD;
BEGIN
  -- Ottieni dati affiliato
  SELECT a.totale_clienti_attivi
  INTO v_clienti_attivi
  FROM affiliates a
  WHERE a.id = p_affiliate_id;
  
  -- Check se ha almeno una commissione (per bonus prima vendita)
  SELECT EXISTS(
    SELECT 1 FROM affiliate_commissions 
    WHERE affiliate_id = p_affiliate_id AND stato != 'cancelled'
  ) INTO v_ha_commissioni;
  
  -- Check Prima Vendita (€25 una tantum)
  IF v_ha_commissioni THEN
    INSERT INTO affiliate_milestone_bonuses (affiliate_id, milestone_type, importo, is_recurring)
    VALUES (p_affiliate_id, 'prima_vendita', 25.00, FALSE)
    ON CONFLICT (affiliate_id, milestone_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT 'prima_vendita'::VARCHAR(50), 25.00::DECIMAL(10,2), TRUE;
    END IF;
  END IF;
  
  -- Check 50 Clienti (€500/mese)
  IF v_clienti_attivi >= 50 THEN
    INSERT INTO affiliate_milestone_bonuses (affiliate_id, milestone_type, importo, is_recurring)
    VALUES (p_affiliate_id, '50_clienti', 500.00, TRUE)
    ON CONFLICT (affiliate_id, milestone_type) DO NOTHING;
    
    IF FOUND THEN
      RETURN QUERY SELECT '50_clienti'::VARCHAR(50), 500.00::DECIMAL(10,2), TRUE;
    END IF;
  END IF;
  
  -- Check 100 Clienti (€1000/mese, sostituisce 50)
  IF v_clienti_attivi >= 100 THEN
    -- Aggiorna da 50 a 100
    UPDATE affiliate_milestone_bonuses
    SET milestone_type = '100_clienti', importo = 1000.00
    WHERE affiliate_id = p_affiliate_id AND milestone_type = '50_clienti';
    
    IF NOT FOUND THEN
      INSERT INTO affiliate_milestone_bonuses (affiliate_id, milestone_type, importo, is_recurring)
      VALUES (p_affiliate_id, '100_clienti', 1000.00, TRUE)
      ON CONFLICT (affiliate_id, milestone_type) DO NOTHING;
    END IF;
    
    IF FOUND THEN
      RETURN QUERY SELECT '100_clienti'::VARCHAR(50), 1000.00::DECIMAL(10,2), TRUE;
    END IF;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_and_assign_milestone_bonus IS 'Verifica e assegna bonus milestone automaticamente';

-- =====================================================
-- 10. TRIGGER: AGGIORNA COMMISSIONI SU CAMBIO SUBSCRIPTION
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_update_affiliate_on_profile_subscription_change()
RETURNS TRIGGER AS $$
DECLARE
  v_affiliate_id UUID;
BEGIN
  -- Trova affiliato collegato a questo utente (l'affiliato stesso)
  SELECT id INTO v_affiliate_id
  FROM affiliates
  WHERE user_id = NEW.id;

  IF v_affiliate_id IS NOT NULL THEN
    PERFORM aggiorna_metriche_affiliato(v_affiliate_id);
  END IF;

  -- Aggiorna anche affiliati che hanno portato questo utente
  FOR v_affiliate_id IN
    SELECT DISTINCT sat.affiliate_id
    FROM subscription_affiliate_tracking sat
    WHERE sat.user_id = NEW.id
  LOOP
    PERFORM aggiorna_metriche_affiliato(v_affiliate_id);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_affiliate_on_profile_subscription ON profiles;

CREATE TRIGGER trg_update_affiliate_on_profile_subscription
AFTER UPDATE OF subscription_status, subscription_tier ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_update_affiliate_on_profile_subscription_change();

-- =====================================================
-- 11. AGGIORNA AFFILIATI ESISTENTI
-- =====================================================

-- Aggiorna tutti gli affiliati esistenti con la nuova logica
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM affiliates WHERE stato = 'active'
  LOOP
    PERFORM aggiorna_metriche_affiliato(r.id);
    PERFORM check_and_assign_milestone_bonus(r.id);
  END LOOP;
END $$;

-- =====================================================
-- 12. VIEW: AFFILIATI CON DETTAGLIO COMMISSIONI
-- =====================================================

CREATE OR REPLACE VIEW v_affiliati_commissioni AS
SELECT
  a.id,
  a.ref_code,
  a.email,
  a.nome,
  a.cognome,
  a.abbonamento_utente,
  a.totale_clienti_attivi AS clienti_attivi,
  a.commissione_base,
  a.bonus_performance,
  (a.commissione_base + a.bonus_performance) AS commissione_totale_percentuale,
  a.bonus_milestone_mensile,
  a.saldo_disponibile_euro AS saldo_disponibile,
  a.totale_commissioni_euro AS totale_guadagnato,
  a.categoria,
  a.stato,
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object(
      'tipo', milestone_type,
      'importo', importo,
      'ricorrente', is_recurring,
      'data', achieved_at
    ))
    FROM affiliate_milestone_bonuses mb
    WHERE mb.affiliate_id = a.id),
    '[]'::jsonb
  ) AS milestones_raggiunti
FROM affiliates a
WHERE a.stato = 'active';

COMMENT ON VIEW v_affiliati_commissioni IS 'Vista dettagliata affiliati con breakdown commissioni';

-- =====================================================
-- RIEPILOGO STRUTTURA COMMISSIONI
-- =====================================================
/*
COMMISSIONE BASE (da abbonamento utente):
- Leader (€149/anno)    → 25%
- Mentor (€490/anno)    → 30%
- Mastermind (€2,997)   → 35%
- Consulente            → 40%

BONUS PERFORMANCE (da clienti attivi):
- 10+ clienti           → +3%
- 30+ clienti           → +5%

BONUS MILESTONE:
- Prima vendita         → €25 una tantum
- 50 clienti attivi     → €500/mese ricorrente
- 100 clienti attivi    → €1,000/mese ricorrente

MASSIMO: 45% (cap)

PARAMETRI:
- Cookie: 90 giorni
- Ricorrenza: A vita
- Cooling-off: 30 giorni
- Payout minimo: €50
*/
