-- ============================================================================
-- MIGRAZIONE: affiliate_payouts
-- Descrizione: Richieste di pagamento dagli affiliati
-- Data: 08/01/2026
-- Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Framework 4P/12F
-- Soglia minima default: €50
-- ============================================================================

-- P2 PRODOTTO: Pagamenti agli affiliati

CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relazione con affiliato
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  
  -- Importo richiesto/pagato
  importo_richiesto_euro DECIMAL(10,2) NOT NULL,
  importo_pagato_euro DECIMAL(10,2),
  
  -- Metodo pagamento utilizzato
  metodo_payout TEXT NOT NULL
    CHECK (metodo_payout IN ('bonifico', 'paypal', 'stripe')),
  
  -- Dettagli pagamento
  iban_utilizzato TEXT,
  paypal_email_utilizzato TEXT,
  stripe_transfer_id TEXT,
  
  -- Riferimento bancario/transazione
  riferimento_pagamento TEXT,
  
  -- Stato payout
  stato TEXT NOT NULL DEFAULT 'pending'
    CHECK (stato IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Motivo se fallito/cancellato
  motivo_stato TEXT,
  
  -- Periodo coperto (commissioni incluse)
  periodo_da DATE,
  periodo_a DATE,
  
  -- Numero commissioni incluse
  numero_commissioni INTEGER DEFAULT 0,
  
  -- Documenti (fattura affiliato se richiesta)
  fattura_affiliato_url TEXT,
  ricevuta_pagamento_url TEXT,
  
  -- Note admin
  note_admin TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  richiesto_at TIMESTAMPTZ DEFAULT NOW(),
  approvato_at TIMESTAMPTZ,
  approvato_da UUID REFERENCES auth.users(id),
  processing_at TIMESTAMPTZ,
  completato_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Indici per query frequenti
CREATE INDEX idx_affiliate_payouts_affiliate ON public.affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_stato ON public.affiliate_payouts(stato);
CREATE INDEX idx_affiliate_payouts_date ON public.affiliate_payouts(created_at DESC);
CREATE INDEX idx_affiliate_payouts_pending ON public.affiliate_payouts(stato)
  WHERE stato IN ('pending', 'processing');

-- Funzione per creare richiesta payout
CREATE OR REPLACE FUNCTION public.create_affiliate_payout_request(
  p_affiliate_id UUID,
  p_metodo TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_affiliate RECORD;
  v_payout_id UUID;
  v_importo DECIMAL(10,2);
  v_num_commissioni INTEGER;
BEGIN
  -- Recupera dati affiliato
  SELECT * INTO v_affiliate
  FROM public.affiliates
  WHERE id = p_affiliate_id;
  
  IF v_affiliate IS NULL THEN
    RAISE EXCEPTION 'Affiliato non trovato';
  END IF;
  
  -- Verifica saldo disponibile
  IF v_affiliate.saldo_disponibile_euro < v_affiliate.soglia_payout_euro THEN
    RAISE EXCEPTION 'Saldo insufficiente. Minimo richiesto: €%', v_affiliate.soglia_payout_euro;
  END IF;
  
  -- Verifica stato affiliato
  IF v_affiliate.stato != 'active' THEN
    RAISE EXCEPTION 'Affiliato non attivo';
  END IF;
  
  -- Verifica no payout pending
  IF EXISTS (
    SELECT 1 FROM public.affiliate_payouts
    WHERE affiliate_id = p_affiliate_id
      AND stato IN ('pending', 'processing')
  ) THEN
    RAISE EXCEPTION 'Esiste già una richiesta payout in corso';
  END IF;
  
  -- Calcola importo e commissioni
  SELECT 
    COALESCE(SUM(importo_commissione_euro), 0),
    COUNT(*)
  INTO v_importo, v_num_commissioni
  FROM public.affiliate_commissions
  WHERE affiliate_id = p_affiliate_id
    AND stato = 'approved'
    AND payout_id IS NULL;
  
  IF v_importo <= 0 THEN
    RAISE EXCEPTION 'Nessuna commissione disponibile per payout';
  END IF;
  
  -- Crea payout request
  INSERT INTO public.affiliate_payouts (
    affiliate_id,
    importo_richiesto_euro,
    metodo_payout,
    iban_utilizzato,
    paypal_email_utilizzato,
    numero_commissioni,
    periodo_da,
    periodo_a,
    stato
  )
  SELECT
    p_affiliate_id,
    v_importo,
    COALESCE(p_metodo, v_affiliate.metodo_payout),
    v_affiliate.iban,
    v_affiliate.paypal_email,
    v_num_commissioni,
    MIN(c.created_at)::DATE,
    MAX(c.created_at)::DATE,
    'pending'
  FROM public.affiliate_commissions c
  WHERE c.affiliate_id = p_affiliate_id
    AND c.stato = 'approved'
    AND c.payout_id IS NULL
  RETURNING id INTO v_payout_id;
  
  -- Associa commissioni al payout
  UPDATE public.affiliate_commissions
  SET payout_id = v_payout_id
  WHERE affiliate_id = p_affiliate_id
    AND stato = 'approved'
    AND payout_id IS NULL;
  
  RETURN v_payout_id;
END;
$$ LANGUAGE plpgsql;

-- Funzione per completare payout
CREATE OR REPLACE FUNCTION public.complete_affiliate_payout(
  p_payout_id UUID,
  p_riferimento TEXT,
  p_importo_effettivo DECIMAL(10,2) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payout RECORD;
BEGIN
  -- Recupera payout
  SELECT * INTO v_payout
  FROM public.affiliate_payouts
  WHERE id = p_payout_id;
  
  IF v_payout IS NULL THEN
    RAISE EXCEPTION 'Payout non trovato';
  END IF;
  
  IF v_payout.stato != 'processing' THEN
    RAISE EXCEPTION 'Payout non in stato processing';
  END IF;
  
  -- Aggiorna payout
  UPDATE public.affiliate_payouts
  SET 
    stato = 'completed',
    importo_pagato_euro = COALESCE(p_importo_effettivo, v_payout.importo_richiesto_euro),
    riferimento_pagamento = p_riferimento,
    completato_at = NOW()
  WHERE id = p_payout_id;
  
  -- Aggiorna commissioni associate
  UPDATE public.affiliate_commissions
  SET 
    stato = 'paid',
    paid_at = NOW()
  WHERE payout_id = p_payout_id;
  
  -- Aggiorna saldo affiliato
  UPDATE public.affiliates
  SET 
    saldo_disponibile_euro = saldo_disponibile_euro - COALESCE(p_importo_effettivo, v_payout.importo_richiesto_euro),
    totale_pagato_euro = totale_pagato_euro + COALESCE(p_importo_effettivo, v_payout.importo_richiesto_euro)
  WHERE id = v_payout.affiliate_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Funzione per cancellare payout
CREATE OR REPLACE FUNCTION public.cancel_affiliate_payout(
  p_payout_id UUID,
  p_motivo TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payout RECORD;
BEGIN
  SELECT * INTO v_payout
  FROM public.affiliate_payouts
  WHERE id = p_payout_id;
  
  IF v_payout IS NULL THEN
    RAISE EXCEPTION 'Payout non trovato';
  END IF;
  
  IF v_payout.stato NOT IN ('pending', 'processing') THEN
    RAISE EXCEPTION 'Payout non cancellabile (stato: %)', v_payout.stato;
  END IF;
  
  -- Aggiorna payout
  UPDATE public.affiliate_payouts
  SET 
    stato = 'cancelled',
    motivo_stato = p_motivo,
    cancelled_at = NOW()
  WHERE id = p_payout_id;
  
  -- Rilascia commissioni (tornano disponibili)
  UPDATE public.affiliate_commissions
  SET payout_id = NULL
  WHERE payout_id = p_payout_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- View per riepilogo payouts
CREATE OR REPLACE VIEW public.affiliate_payouts_summary AS
SELECT 
  a.id AS affiliate_id,
  a.email,
  a.nome,
  a.cognome,
  a.categoria,
  a.saldo_disponibile_euro,
  a.totale_pagato_euro,
  COUNT(p.id) FILTER (WHERE p.stato = 'completed') AS payouts_completati,
  COUNT(p.id) FILTER (WHERE p.stato IN ('pending', 'processing')) AS payouts_in_corso,
  MAX(p.completato_at) AS ultimo_payout_at
FROM public.affiliates a
LEFT JOIN public.affiliate_payouts p ON a.id = p.affiliate_id
GROUP BY a.id;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Affiliati vedono i propri payouts
CREATE POLICY "Affiliates can view own payouts"
  ON public.affiliate_payouts FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
    OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Affiliati possono richiedere payout (insert)
CREATE POLICY "Affiliates can request payouts"
  ON public.affiliate_payouts FOR INSERT
  WITH CHECK (
    affiliate_id IN (
      SELECT id FROM public.affiliates 
      WHERE user_id = auth.uid() AND stato = 'active'
    )
  );

-- Solo admin può aggiornare payouts
CREATE POLICY "Only admins can update payouts"
  ON public.affiliate_payouts FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- COMMENTI DOCUMENTAZIONE
-- ============================================================================
COMMENT ON TABLE public.affiliate_payouts IS 'Richieste pagamento affiliati - Soglia minima €50';
COMMENT ON COLUMN public.affiliate_payouts.stato IS 'pending->processing->completed (o failed/cancelled)';
COMMENT ON COLUMN public.affiliate_payouts.metodo_payout IS 'bonifico, paypal, stripe';

