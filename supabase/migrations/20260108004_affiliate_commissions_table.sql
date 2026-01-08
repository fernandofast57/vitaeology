-- ============================================================================
-- MIGRAZIONE: affiliate_commissions
-- Descrizione: Commissioni generate dagli affiliati
-- Data: 08/01/2026
-- Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Framework 4P/12F
-- Struttura commissioni:
--   BASE: 30% | PRO: 35% | PARTNER: 40% | SUPER: 40% + €500/mese
-- ============================================================================

-- P2 PRODOTTO: Commissioni generate

CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relazioni
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  click_id UUID REFERENCES public.affiliate_clicks(id) ON DELETE SET NULL,
  
  -- Cliente che ha generato la commissione
  customer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  
  -- Riferimento Stripe
  stripe_subscription_id TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Prodotto acquistato
  prodotto TEXT NOT NULL
    CHECK (prodotto IN ('leader', 'mentor', 'coaching', 'mastermind', 'corporate')),
  
  -- Importi
  prezzo_prodotto_euro DECIMAL(10,2) NOT NULL,
  percentuale_commissione INTEGER NOT NULL, -- 30, 35, 40
  importo_commissione_euro DECIMAL(10,2) NOT NULL,
  
  -- Tipo commissione
  tipo TEXT NOT NULL DEFAULT 'initial'
    CHECK (tipo IN ('initial', 'recurring', 'bonus', 'upgrade')),
  
  -- Periodo di riferimento (per commissioni ricorrenti)
  periodo_inizio DATE,
  periodo_fine DATE,
  
  -- Stato commissione
  stato TEXT NOT NULL DEFAULT 'pending'
    CHECK (stato IN ('pending', 'approved', 'paid', 'cancelled', 'refunded')),
  
  -- Riferimento payout (quando pagata)
  payout_id UUID, -- riferimento a affiliate_payouts
  
  -- Note
  note TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Indici per query frequenti
CREATE INDEX idx_affiliate_commissions_affiliate ON public.affiliate_commissions(affiliate_id);
CREATE INDEX idx_affiliate_commissions_customer ON public.affiliate_commissions(customer_user_id);
CREATE INDEX idx_affiliate_commissions_stato ON public.affiliate_commissions(stato);
CREATE INDEX idx_affiliate_commissions_tipo ON public.affiliate_commissions(tipo);
CREATE INDEX idx_affiliate_commissions_date ON public.affiliate_commissions(created_at DESC);
CREATE INDEX idx_affiliate_commissions_stripe ON public.affiliate_commissions(stripe_subscription_id);
CREATE INDEX idx_affiliate_commissions_pending ON public.affiliate_commissions(affiliate_id, stato)
  WHERE stato IN ('pending', 'approved');

-- Funzione per calcolare commissione in base a categoria affiliato
CREATE OR REPLACE FUNCTION public.calculate_affiliate_commission(
  p_affiliate_id UUID,
  p_prezzo_prodotto DECIMAL(10,2)
)
RETURNS TABLE (
  percentuale INTEGER,
  importo DECIMAL(10,2)
) AS $$
DECLARE
  v_percentuale INTEGER;
BEGIN
  -- Recupera percentuale commissione dell'affiliato
  SELECT commissione_percentuale INTO v_percentuale
  FROM public.affiliates
  WHERE id = p_affiliate_id;
  
  IF v_percentuale IS NULL THEN
    v_percentuale := 30; -- Default BASE
  END IF;
  
  RETURN QUERY SELECT v_percentuale, ROUND(p_prezzo_prodotto * v_percentuale / 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Funzione per creare commissione da Stripe webhook
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
BEGIN
  -- Calcola commissione
  SELECT percentuale, importo INTO v_percentuale, v_importo
  FROM public.calculate_affiliate_commission(p_affiliate_id, p_prezzo_euro);
  
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
    v_importo,
    p_tipo,
    'pending' -- Commissioni iniziano come pending per review
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
  
  -- Se tipo = initial, incrementa clienti attivi
  IF p_tipo = 'initial' THEN
    UPDATE public.affiliates
    SET totale_clienti_attivi = totale_clienti_attivi + 1
    WHERE id = p_affiliate_id;
    
    -- Verifica upgrade categoria
    PERFORM public.check_affiliate_category_upgrade(p_affiliate_id);
  END IF;
  
  RETURN v_commission_id;
END;
$$ LANGUAGE plpgsql;

-- Funzione per verificare e applicare upgrade categoria
CREATE OR REPLACE FUNCTION public.check_affiliate_category_upgrade(p_affiliate_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_clienti INTEGER;
  v_categoria_attuale TEXT;
  v_nuova_categoria TEXT;
  v_nuova_percentuale INTEGER;
  v_nuovo_bonus INTEGER;
BEGIN
  -- Recupera dati affiliato
  SELECT totale_clienti_attivi, categoria 
  INTO v_clienti, v_categoria_attuale
  FROM public.affiliates
  WHERE id = p_affiliate_id;
  
  -- Determina nuova categoria
  IF v_clienti >= 100 THEN
    v_nuova_categoria := 'SUPER';
    v_nuova_percentuale := 40;
    v_nuovo_bonus := 500;
  ELSIF v_clienti >= 50 THEN
    v_nuova_categoria := 'PARTNER';
    v_nuova_percentuale := 40;
    v_nuovo_bonus := 0;
  ELSIF v_clienti >= 10 THEN
    v_nuova_categoria := 'PRO';
    v_nuova_percentuale := 35;
    v_nuovo_bonus := 0;
  ELSE
    v_nuova_categoria := 'BASE';
    v_nuova_percentuale := 30;
    v_nuovo_bonus := 0;
  END IF;
  
  -- Applica upgrade se categoria diversa
  IF v_nuova_categoria != v_categoria_attuale THEN
    UPDATE public.affiliates
    SET 
      categoria = v_nuova_categoria,
      commissione_percentuale = v_nuova_percentuale,
      bonus_mensile_euro = v_nuovo_bonus,
      ultimo_upgrade_categoria = NOW()
    WHERE id = p_affiliate_id;
    
    RETURN v_nuova_categoria;
  END IF;
  
  RETURN v_categoria_attuale;
END;
$$ LANGUAGE plpgsql;

-- Funzione per gestire refund (annulla commissione)
CREATE OR REPLACE FUNCTION public.handle_affiliate_commission_refund(
  p_stripe_subscription_id TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_affected INTEGER := 0;
  v_commission RECORD;
BEGIN
  -- Trova commissioni da questo subscription
  FOR v_commission IN
    SELECT * FROM public.affiliate_commissions
    WHERE stripe_subscription_id = p_stripe_subscription_id
      AND stato IN ('pending', 'approved')
  LOOP
    -- Marca come refunded
    UPDATE public.affiliate_commissions
    SET 
      stato = 'refunded',
      refunded_at = NOW()
    WHERE id = v_commission.id;
    
    -- Aggiorna saldo affiliato
    UPDATE public.affiliates
    SET 
      saldo_disponibile_euro = saldo_disponibile_euro - v_commission.importo_commissione_euro,
      totale_clienti_attivi = GREATEST(0, totale_clienti_attivi - 1)
    WHERE id = v_commission.affiliate_id;
    
    v_affected := v_affected + 1;
  END LOOP;
  
  RETURN v_affected;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Affiliati vedono le proprie commissioni
CREATE POLICY "Affiliates can view own commissions"
  ON public.affiliate_commissions FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
    OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Solo sistema può inserire/aggiornare commissioni
CREATE POLICY "System can insert commissions"
  ON public.affiliate_commissions FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "System can update commissions"
  ON public.affiliate_commissions FOR UPDATE
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- COMMENTI DOCUMENTAZIONE
-- ============================================================================
COMMENT ON TABLE public.affiliate_commissions IS 'Commissioni affiliate - 30-40% ricorrente';
COMMENT ON COLUMN public.affiliate_commissions.tipo IS 'initial=primo acquisto, recurring=rinnovo, bonus=extra, upgrade=passaggio tier';
COMMENT ON COLUMN public.affiliate_commissions.stato IS 'pending->approved->paid (o cancelled/refunded)';
COMMENT ON COLUMN public.affiliate_commissions.percentuale_commissione IS 'BASE=30, PRO=35, PARTNER/SUPER=40';

