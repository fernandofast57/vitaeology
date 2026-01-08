-- ============================================================================
-- MIGRATION: Fix Commission Calculation
-- Aggiorna create_affiliate_commission_from_stripe per usare la nuova
-- struttura commissioni (calcola_commissione_affiliato)
-- ============================================================================

-- Aggiorna la funzione per usare la nuova logica commissioni
CREATE OR REPLACE FUNCTION public.create_affiliate_commission_from_stripe(
  p_affiliate_id UUID,
  p_click_id UUID,
  p_customer_user_id UUID,
  p_customer_email TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_invoice_id TEXT,
  p_prodotto TEXT,
  p_prezzo_euro DECIMAL(10,2),
  p_tipo TEXT DEFAULT 'initial'
)
RETURNS UUID AS $$
DECLARE
  v_commission_id UUID;
  v_percentuale INTEGER;
  v_importo DECIMAL(10,2);
  v_commissione_result RECORD;
BEGIN
  -- Usa la NUOVA funzione calcola_commissione_affiliato
  SELECT * INTO v_commissione_result
  FROM public.calcola_commissione_affiliato(p_affiliate_id, p_prezzo_euro);

  v_percentuale := v_commissione_result.percentuale_totale;
  v_importo := v_commissione_result.importo_commissione;

  -- Inserisci commissione
  INSERT INTO public.affiliate_commissions (
    affiliate_id,
    click_id,
    customer_user_id,
    customer_email,
    stripe_subscription_id,
    stripe_invoice_id,
    prodotto,
    prezzo_prodotto_euro,
    percentuale_commissione,
    percentuale_applicata, -- Nuovo campo migration 008
    importo_commissione_euro,
    tipo,
    stato
  ) VALUES (
    p_affiliate_id,
    p_click_id,
    p_customer_user_id,
    p_customer_email,
    p_stripe_subscription_id,
    p_stripe_invoice_id,
    p_prodotto,
    p_prezzo_euro,
    v_percentuale,
    v_percentuale, -- Salva anche in percentuale_applicata
    v_importo,
    p_tipo,
    'pending'
  )
  RETURNING id INTO v_commission_id;

  -- Aggiorna metriche affiliate
  UPDATE public.affiliates
  SET
    totale_commissioni_euro = totale_commissioni_euro + v_importo,
    saldo_disponibile_euro = saldo_disponibile_euro + v_importo,
    totale_conversioni = totale_conversioni + 1,
    updated_at = NOW()
  WHERE id = p_affiliate_id;

  -- Se tipo = initial, incrementa clienti attivi e verifica bonus
  IF p_tipo = 'initial' THEN
    UPDATE public.affiliates
    SET totale_clienti_attivi = totale_clienti_attivi + 1
    WHERE id = p_affiliate_id;

    -- Aggiorna metriche commissione (bonus_performance)
    PERFORM public.aggiorna_metriche_affiliato(p_affiliate_id);

    -- Verifica e assegna bonus milestone
    PERFORM public.check_and_assign_milestone_bonus(p_affiliate_id);
  END IF;

  RETURN v_commission_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.create_affiliate_commission_from_stripe IS
'Crea commissione da webhook Stripe usando la nuova struttura commissioni (base + bonus)';

-- ============================================================================
-- Verifica che calcola_commissione_affiliato esista
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'calcola_commissione_affiliato'
  ) THEN
    RAISE EXCEPTION 'ERRORE: La funzione calcola_commissione_affiliato non esiste! Esegui prima migration 008.';
  END IF;
END $$;
