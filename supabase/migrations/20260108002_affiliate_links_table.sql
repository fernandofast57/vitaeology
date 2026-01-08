-- ============================================================================
-- MIGRAZIONE: affiliate_links
-- Descrizione: Link tracciati generati dagli affiliati
-- Data: 08/01/2026
-- Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Framework 4P/12F
-- ============================================================================

-- P1 ISTITUZIONE: Sistema di generazione e tracking link

CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relazione con affiliato
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  
  -- Destinazione del link
  -- challenge_type: leadership, ostacoli, microfelicita
  -- destination: challenge, pricing, homepage
  destination_type TEXT NOT NULL DEFAULT 'challenge'
    CHECK (destination_type IN ('challenge', 'pricing', 'homepage', 'libro')),
  challenge_type TEXT
    CHECK (challenge_type IS NULL OR challenge_type IN ('leadership', 'ostacoli', 'microfelicita')),
  
  -- URL completo generato (es: vitaeology.com/challenge/leadership?ref=AFF-ABC123)
  url_generato TEXT NOT NULL,
  
  -- Parametri UTM opzionali
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  
  -- Nome personalizzato per identificare il link
  nome_link TEXT,
  
  -- P2 PRODOTTO: Metriche del link (cache)
  totale_click INTEGER DEFAULT 0,
  totale_conversioni INTEGER DEFAULT 0,
  ultimo_click_at TIMESTAMPTZ,
  
  -- Stato link
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per query frequenti
CREATE INDEX idx_affiliate_links_affiliate ON public.affiliate_links(affiliate_id);
CREATE INDEX idx_affiliate_links_destination ON public.affiliate_links(destination_type, challenge_type);
CREATE INDEX idx_affiliate_links_active ON public.affiliate_links(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_affiliate_links_click ON public.affiliate_links(totale_click DESC);

-- Trigger updated_at
CREATE TRIGGER on_affiliate_links_updated
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_affiliates_updated_at();

-- Funzione per costruire URL affiliato
CREATE OR REPLACE FUNCTION public.build_affiliate_url(
  p_ref_code TEXT,
  p_destination_type TEXT,
  p_challenge_type TEXT DEFAULT NULL,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  base_url TEXT := 'https://vitaeology.com';
  full_url TEXT;
  params TEXT[];
BEGIN
  -- Costruisce path base
  CASE p_destination_type
    WHEN 'challenge' THEN
      IF p_challenge_type IS NOT NULL THEN
        full_url := base_url || '/challenge/' || p_challenge_type;
      ELSE
        full_url := base_url || '/challenge/leadership';
      END IF;
    WHEN 'pricing' THEN
      full_url := base_url || '/pricing';
    WHEN 'libro' THEN
      full_url := base_url || '/libro/leadership';
    ELSE
      full_url := base_url;
  END CASE;
  
  -- Aggiunge parametri
  params := ARRAY['ref=' || p_ref_code];
  
  IF p_utm_source IS NOT NULL THEN
    params := array_append(params, 'utm_source=' || p_utm_source);
  END IF;
  IF p_utm_medium IS NOT NULL THEN
    params := array_append(params, 'utm_medium=' || p_utm_medium);
  END IF;
  IF p_utm_campaign IS NOT NULL THEN
    params := array_append(params, 'utm_campaign=' || p_utm_campaign);
  END IF;
  
  full_url := full_url || '?' || array_to_string(params, '&');
  
  RETURN full_url;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

-- Affiliati vedono solo i propri link
CREATE POLICY "Affiliates can view own links"
  ON public.affiliate_links FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
    OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Affiliati possono creare link
CREATE POLICY "Affiliates can create links"
  ON public.affiliate_links FOR INSERT
  WITH CHECK (
    affiliate_id IN (
      SELECT id FROM public.affiliates 
      WHERE user_id = auth.uid() AND stato = 'active'
    )
  );

-- Affiliati possono aggiornare i propri link
CREATE POLICY "Affiliates can update own links"
  ON public.affiliate_links FOR UPDATE
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

-- Affiliati possono disattivare (non eliminare) i propri link
CREATE POLICY "Affiliates can delete own links"
  ON public.affiliate_links FOR DELETE
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
    OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- COMMENTI DOCUMENTAZIONE
-- ============================================================================
COMMENT ON TABLE public.affiliate_links IS 'Link tracciati generati dagli affiliati';
COMMENT ON COLUMN public.affiliate_links.destination_type IS 'Tipo destinazione: challenge, pricing, homepage, libro';
COMMENT ON COLUMN public.affiliate_links.challenge_type IS 'Tipo challenge se destination=challenge';
COMMENT ON COLUMN public.affiliate_links.url_generato IS 'URL completo con ref code e UTM params';

