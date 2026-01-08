-- ============================================================================
-- MIGRAZIONE: affiliates
-- Descrizione: Tabella principale profilo affiliati
-- Data: 08/01/2026
-- Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Framework 4P/12F
-- ============================================================================

-- P1 ISTITUZIONE: Creare la struttura che produrrà affiliati attivi

-- Tabella principale affiliati
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relazione con utente (opzionale - affiliato può non essere utente)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Dati identificativi
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  cognome TEXT,
  
  -- Codice affiliato univoco (es: AFF-ABC123)
  ref_code TEXT UNIQUE NOT NULL,
  
  -- Categoria affiliato (BASE, PRO, PARTNER, SUPER)
  categoria TEXT NOT NULL DEFAULT 'BASE' 
    CHECK (categoria IN ('BASE', 'PRO', 'PARTNER', 'SUPER')),
  
  -- Commissioni percentuali per categoria
  -- BASE: 30%, PRO: 35%, PARTNER: 40%, SUPER: 40% + bonus
  commissione_percentuale INTEGER NOT NULL DEFAULT 30
    CHECK (commissione_percentuale BETWEEN 15 AND 50),
  
  -- Bonus mensile per SUPER affiliati (€500/mese)
  bonus_mensile_euro INTEGER DEFAULT 0,
  
  -- Stato affiliato
  stato TEXT NOT NULL DEFAULT 'pending'
    CHECK (stato IN ('pending', 'active', 'suspended', 'terminated')),
  
  -- Dati contatto/promozione
  sito_web TEXT,
  canali_promozione TEXT[], -- ['social', 'blog', 'email', 'youtube', 'podcast']
  note_admin TEXT,
  
  -- Metodo pagamento preferito
  metodo_payout TEXT DEFAULT 'bonifico'
    CHECK (metodo_payout IN ('bonifico', 'paypal', 'stripe')),
  iban TEXT,
  paypal_email TEXT,
  
  -- Soglia minima payout (€50 default)
  soglia_payout_euro INTEGER DEFAULT 50,
  
  -- P2 PRODOTTO: Metriche aggregate (cache per performance)
  -- Aggiornate da trigger/cron
  totale_clienti_attivi INTEGER DEFAULT 0,
  totale_click INTEGER DEFAULT 0,
  totale_conversioni INTEGER DEFAULT 0,
  totale_commissioni_euro DECIMAL(10,2) DEFAULT 0,
  totale_pagato_euro DECIMAL(10,2) DEFAULT 0,
  saldo_disponibile_euro DECIMAL(10,2) DEFAULT 0,
  
  -- P3 RIPARAZIONE: Data ultimo upgrade categoria
  ultimo_upgrade_categoria TIMESTAMPTZ,
  
  -- Percorso formativo (6 fasi Jim Edwards)
  fase_training INTEGER DEFAULT 0 CHECK (fase_training BETWEEN 0 AND 6),
  training_completato_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approvato_at TIMESTAMPTZ,
  approvato_da UUID REFERENCES auth.users(id),
  
  -- Termini accettati
  termini_accettati BOOLEAN DEFAULT FALSE,
  termini_accettati_at TIMESTAMPTZ
);

-- Indici per performance query frequenti
CREATE INDEX idx_affiliates_ref_code ON public.affiliates(ref_code);
CREATE INDEX idx_affiliates_email ON public.affiliates(email);
CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_categoria ON public.affiliates(categoria);
CREATE INDEX idx_affiliates_stato ON public.affiliates(stato);
CREATE INDEX idx_affiliates_totale_clienti ON public.affiliates(totale_clienti_attivi DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.handle_affiliates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_affiliates_updated
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_affiliates_updated_at();

-- Funzione per generare ref_code univoco
CREATE OR REPLACE FUNCTION public.generate_affiliate_ref_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Genera codice: AFF- + 6 caratteri alfanumerici
    new_code := 'AFF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Verifica unicità
    SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE ref_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger per auto-generare ref_code se non fornito
CREATE OR REPLACE FUNCTION public.set_affiliate_ref_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ref_code IS NULL OR NEW.ref_code = '' THEN
    NEW.ref_code := public.generate_affiliate_ref_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_affiliates_before_insert
  BEFORE INSERT ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_affiliate_ref_code();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Affiliati possono vedere il proprio profilo
CREATE POLICY "Affiliates can view own profile"
  ON public.affiliates FOR SELECT
  USING (
    auth.uid() = user_id 
    OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Affiliati possono aggiornare alcuni campi del proprio profilo
CREATE POLICY "Affiliates can update own profile"
  ON public.affiliates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Solo admin possono inserire (registrazione via API con service role)
CREATE POLICY "Only admins can insert affiliates"
  ON public.affiliates FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Solo admin possono eliminare
CREATE POLICY "Only admins can delete affiliates"
  ON public.affiliates FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- COMMENTI DOCUMENTAZIONE
-- ============================================================================
COMMENT ON TABLE public.affiliates IS 'Profili affiliati Vitaeology - Framework 4P/12F';
COMMENT ON COLUMN public.affiliates.ref_code IS 'Codice referral univoco (es: AFF-ABC123)';
COMMENT ON COLUMN public.affiliates.categoria IS 'BASE=30%, PRO=35%, PARTNER=40%, SUPER=40%+bonus';
COMMENT ON COLUMN public.affiliates.fase_training IS 'Progresso percorso 6 fasi Jim Edwards (0-6)';
COMMENT ON COLUMN public.affiliates.totale_clienti_attivi IS 'Cache: clienti attivi per upgrade categoria';

-- ============================================================================
-- SEED DATI TEST (solo ambiente development)
-- ============================================================================
-- INSERT INTO public.affiliates (email, nome, cognome, stato)
-- VALUES ('test@affiliato.it', 'Mario', 'Rossi', 'active');

