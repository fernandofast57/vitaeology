-- ============================================================================
-- MIGRAZIONE: affiliate_stats_functions
-- Descrizione: Funzioni per statistiche e dashboard affiliati
-- Data: 08/01/2026
-- Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Framework 4P/12F
-- ============================================================================

-- P3 RIPARAZIONE: Monitoring e reporting sistema affiliati

-- ============================================================================
-- 1. FUNZIONE: Statistiche affiliato singolo
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_affiliate_stats(p_affiliate_id UUID)
RETURNS TABLE (
  -- Info base
  affiliate_id UUID,
  ref_code TEXT,
  categoria TEXT,
  commissione_percentuale INTEGER,
  stato TEXT,
  -- Metriche click
  click_totali BIGINT,
  click_ultimi_30_giorni BIGINT,
  click_oggi BIGINT,
  -- Metriche conversione
  signups_totali BIGINT,
  challenge_completate BIGINT,
  conversioni_totali BIGINT,
  -- Tassi conversione
  tasso_click_to_signup NUMERIC,
  tasso_signup_to_sale NUMERIC,
  -- Metriche finanziarie
  commissioni_totali DECIMAL(10,2),
  commissioni_pending DECIMAL(10,2),
  commissioni_pagate DECIMAL(10,2),
  saldo_disponibile DECIMAL(10,2),
  -- Clienti
  clienti_attivi INTEGER,
  clienti_totali BIGINT,
  -- Performance
  valore_medio_cliente DECIMAL(10,2),
  ultima_conversione_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH click_stats AS (
    SELECT 
      COUNT(*) AS totali,
      COUNT(*) FILTER (WHERE clicked_at > NOW() - INTERVAL '30 days') AS ultimi_30,
      COUNT(*) FILTER (WHERE clicked_at > CURRENT_DATE) AS oggi
    FROM public.affiliate_clicks
    WHERE affiliate_id = p_affiliate_id
  ),
  conversion_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE stato_conversione IN ('signup', 'challenge_started', 'challenge_complete', 'converted')) AS signups,
      COUNT(*) FILTER (WHERE stato_conversione IN ('challenge_complete', 'converted')) AS challenge_done,
      COUNT(*) FILTER (WHERE stato_conversione = 'converted') AS converted
    FROM public.affiliate_clicks
    WHERE affiliate_id = p_affiliate_id
  ),
  commission_stats AS (
    SELECT 
      COALESCE(SUM(importo_commissione_euro), 0) AS totali,
      COALESCE(SUM(importo_commissione_euro) FILTER (WHERE stato IN ('pending', 'approved')), 0) AS pending,
      COALESCE(SUM(importo_commissione_euro) FILTER (WHERE stato = 'paid'), 0) AS pagate,
      COUNT(DISTINCT customer_user_id) AS clienti_unici,
      MAX(created_at) AS ultima
    FROM public.affiliate_commissions
    WHERE affiliate_id = p_affiliate_id
  )
  SELECT 
    a.id,
    a.ref_code,
    a.categoria,
    a.commissione_percentuale,
    a.stato,
    -- Click
    cs.totali,
    cs.ultimi_30,
    cs.oggi,
    -- Conversioni
    cvs.signups,
    cvs.challenge_done,
    cvs.converted,
    -- Tassi
    CASE WHEN cs.totali > 0 THEN ROUND(cvs.signups::NUMERIC / cs.totali * 100, 2) ELSE 0 END,
    CASE WHEN cvs.signups > 0 THEN ROUND(cvs.converted::NUMERIC / cvs.signups * 100, 2) ELSE 0 END,
    -- Finanziarie
    cms.totali,
    cms.pending,
    cms.pagate,
    a.saldo_disponibile_euro,
    -- Clienti
    a.totale_clienti_attivi,
    cms.clienti_unici,
    -- Performance
    CASE WHEN cms.clienti_unici > 0 THEN ROUND(cms.totali / cms.clienti_unici, 2) ELSE 0 END,
    cms.ultima
  FROM public.affiliates a
  CROSS JOIN click_stats cs
  CROSS JOIN conversion_stats cvs
  CROSS JOIN commission_stats cms
  WHERE a.id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. FUNZIONE: Leaderboard affiliati
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_affiliate_leaderboard(
  p_periodo TEXT DEFAULT 'month', -- 'week', 'month', 'quarter', 'year', 'all'
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  posizione INTEGER,
  affiliate_id UUID,
  ref_code TEXT,
  nome TEXT,
  categoria TEXT,
  commissioni_periodo DECIMAL(10,2),
  clienti_periodo BIGINT,
  click_periodo BIGINT
) AS $$
DECLARE
  v_data_inizio TIMESTAMPTZ;
BEGIN
  -- Calcola data inizio periodo
  v_data_inizio := CASE p_periodo
    WHEN 'week' THEN NOW() - INTERVAL '7 days'
    WHEN 'month' THEN NOW() - INTERVAL '30 days'
    WHEN 'quarter' THEN NOW() - INTERVAL '90 days'
    WHEN 'year' THEN NOW() - INTERVAL '365 days'
    ELSE '1970-01-01'::TIMESTAMPTZ
  END;
  
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(c.importo_commissione_euro), 0) DESC)::INTEGER AS posizione,
    a.id,
    a.ref_code,
    a.nome,
    a.categoria,
    COALESCE(SUM(c.importo_commissione_euro), 0)::DECIMAL(10,2),
    COUNT(DISTINCT c.customer_user_id)::BIGINT,
    (SELECT COUNT(*) FROM public.affiliate_clicks cl 
     WHERE cl.affiliate_id = a.id AND cl.clicked_at >= v_data_inizio)::BIGINT
  FROM public.affiliates a
  LEFT JOIN public.affiliate_commissions c 
    ON a.id = c.affiliate_id 
    AND c.created_at >= v_data_inizio
  WHERE a.stato = 'active'
  GROUP BY a.id
  ORDER BY COALESCE(SUM(c.importo_commissione_euro), 0) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. FUNZIONE: Statistiche globali admin
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_affiliate_program_stats()
RETURNS TABLE (
  -- Affiliati
  affiliati_totali BIGINT,
  affiliati_attivi BIGINT,
  affiliati_pending BIGINT,
  -- Per categoria
  affiliati_base BIGINT,
  affiliati_pro BIGINT,
  affiliati_partner BIGINT,
  affiliati_super BIGINT,
  -- Click e conversioni
  click_totali BIGINT,
  click_mese_corrente BIGINT,
  conversioni_totali BIGINT,
  conversioni_mese_corrente BIGINT,
  -- Finanziarie
  commissioni_generate DECIMAL(10,2),
  commissioni_mese_corrente DECIMAL(10,2),
  commissioni_pending DECIMAL(10,2),
  commissioni_pagate DECIMAL(10,2),
  -- Performance
  tasso_conversione_medio NUMERIC,
  valore_medio_conversione DECIMAL(10,2),
  -- Trend
  crescita_click_percentuale NUMERIC,
  crescita_commissioni_percentuale NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH aff_counts AS (
    SELECT 
      COUNT(*) AS totali,
      COUNT(*) FILTER (WHERE stato = 'active') AS attivi,
      COUNT(*) FILTER (WHERE stato = 'pending') AS pending,
      COUNT(*) FILTER (WHERE categoria = 'BASE') AS base,
      COUNT(*) FILTER (WHERE categoria = 'PRO') AS pro,
      COUNT(*) FILTER (WHERE categoria = 'PARTNER') AS partner,
      COUNT(*) FILTER (WHERE categoria = 'SUPER') AS super
    FROM public.affiliates
  ),
  click_counts AS (
    SELECT 
      COUNT(*) AS totali,
      COUNT(*) FILTER (WHERE clicked_at >= DATE_TRUNC('month', NOW())) AS mese,
      COUNT(*) FILTER (WHERE stato_conversione = 'converted') AS conversioni,
      COUNT(*) FILTER (WHERE stato_conversione = 'converted' AND clicked_at >= DATE_TRUNC('month', NOW())) AS conv_mese,
      COUNT(*) FILTER (WHERE clicked_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' 
                        AND clicked_at < DATE_TRUNC('month', NOW())) AS click_mese_prec
    FROM public.affiliate_clicks
  ),
  comm_stats AS (
    SELECT 
      COALESCE(SUM(importo_commissione_euro), 0) AS totali,
      COALESCE(SUM(importo_commissione_euro) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW())), 0) AS mese,
      COALESCE(SUM(importo_commissione_euro) FILTER (WHERE stato IN ('pending', 'approved')), 0) AS pending,
      COALESCE(SUM(importo_commissione_euro) FILTER (WHERE stato = 'paid'), 0) AS pagate,
      COALESCE(AVG(importo_commissione_euro), 0) AS media,
      COALESCE(SUM(importo_commissione_euro) FILTER (
        WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' 
        AND created_at < DATE_TRUNC('month', NOW())
      ), 0) AS mese_prec
    FROM public.affiliate_commissions
  )
  SELECT 
    ac.totali,
    ac.attivi,
    ac.pending,
    ac.base,
    ac.pro,
    ac.partner,
    ac.super,
    cc.totali,
    cc.mese,
    cc.conversioni,
    cc.conv_mese,
    cs.totali,
    cs.mese,
    cs.pending,
    cs.pagate,
    CASE WHEN cc.totali > 0 THEN ROUND(cc.conversioni::NUMERIC / cc.totali * 100, 2) ELSE 0 END,
    cs.media::DECIMAL(10,2),
    -- Crescita click
    CASE WHEN cc.click_mese_prec > 0 
      THEN ROUND((cc.mese - cc.click_mese_prec)::NUMERIC / cc.click_mese_prec * 100, 2) 
      ELSE 0 END,
    -- Crescita commissioni
    CASE WHEN cs.mese_prec > 0 
      THEN ROUND((cs.mese - cs.mese_prec)::NUMERIC / cs.mese_prec * 100, 2) 
      ELSE 0 END
  FROM aff_counts ac
  CROSS JOIN click_counts cc
  CROSS JOIN comm_stats cs;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. FUNZIONE: Report performance per periodo
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_affiliate_performance_report(
  p_affiliate_id UUID,
  p_data_inizio DATE,
  p_data_fine DATE
)
RETURNS TABLE (
  giorno DATE,
  click INTEGER,
  signups INTEGER,
  conversioni INTEGER,
  commissioni DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(p_data_inizio, p_data_fine, '1 day'::INTERVAL)::DATE AS giorno
  ),
  daily_clicks AS (
    SELECT 
      clicked_at::DATE AS giorno,
      COUNT(*) AS click,
      COUNT(*) FILTER (WHERE stato_conversione IN ('signup', 'challenge_started', 'challenge_complete', 'converted')) AS signups,
      COUNT(*) FILTER (WHERE stato_conversione = 'converted') AS conversioni
    FROM public.affiliate_clicks
    WHERE affiliate_id = p_affiliate_id
      AND clicked_at::DATE BETWEEN p_data_inizio AND p_data_fine
    GROUP BY clicked_at::DATE
  ),
  daily_commissions AS (
    SELECT 
      created_at::DATE AS giorno,
      SUM(importo_commissione_euro) AS commissioni
    FROM public.affiliate_commissions
    WHERE affiliate_id = p_affiliate_id
      AND created_at::DATE BETWEEN p_data_inizio AND p_data_fine
    GROUP BY created_at::DATE
  )
  SELECT 
    ds.giorno,
    COALESCE(dc.click, 0)::INTEGER,
    COALESCE(dc.signups, 0)::INTEGER,
    COALESCE(dc.conversioni, 0)::INTEGER,
    COALESCE(dco.commissioni, 0)::DECIMAL(10,2)
  FROM date_series ds
  LEFT JOIN daily_clicks dc ON ds.giorno = dc.giorno
  LEFT JOIN daily_commissions dco ON ds.giorno = dco.giorno
  ORDER BY ds.giorno;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. TRIGGER: Aggiorna metriche cache su nuova commissione
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_affiliate_metrics_on_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- Ricalcola metriche affiliate
  UPDATE public.affiliates
  SET 
    totale_commissioni_euro = (
      SELECT COALESCE(SUM(importo_commissione_euro), 0)
      FROM public.affiliate_commissions
      WHERE affiliate_id = NEW.affiliate_id
    ),
    saldo_disponibile_euro = (
      SELECT COALESCE(SUM(importo_commissione_euro), 0)
      FROM public.affiliate_commissions
      WHERE affiliate_id = NEW.affiliate_id
        AND stato IN ('pending', 'approved')
        AND payout_id IS NULL
    ),
    totale_conversioni = (
      SELECT COUNT(*)
      FROM public.affiliate_commissions
      WHERE affiliate_id = NEW.affiliate_id
    ),
    updated_at = NOW()
  WHERE id = NEW.affiliate_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_commission_change
  AFTER INSERT OR UPDATE ON public.affiliate_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliate_metrics_on_commission();

-- ============================================================================
-- 6. TRIGGER: Aggiorna contatore click
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_affiliate_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.affiliates
  SET 
    totale_click = totale_click + 1,
    updated_at = NOW()
  WHERE id = NEW.affiliate_id;
  
  -- Aggiorna anche il link se specificato
  IF NEW.link_id IS NOT NULL THEN
    UPDATE public.affiliate_links
    SET 
      totale_click = totale_click + 1,
      ultimo_click_at = NOW()
    WHERE id = NEW.link_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_affiliate_click_insert
  AFTER INSERT ON public.affiliate_clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliate_click_count();

-- ============================================================================
-- 7. CRON: Ricalcolo metriche (da schedulare giornalmente)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.recalculate_all_affiliate_metrics()
RETURNS INTEGER AS $$
DECLARE
  v_affected INTEGER := 0;
BEGIN
  -- Ricalcola clienti attivi per ogni affiliato
  UPDATE public.affiliates a
  SET totale_clienti_attivi = (
    SELECT COUNT(DISTINCT customer_user_id)
    FROM public.affiliate_commissions c
    WHERE c.affiliate_id = a.id
      AND c.tipo = 'initial'
      AND c.stato NOT IN ('cancelled', 'refunded')
  );
  
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  
  -- Verifica upgrade categorie
  PERFORM public.check_affiliate_category_upgrade(id)
  FROM public.affiliates
  WHERE stato = 'active';
  
  RETURN v_affected;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.recalculate_all_affiliate_metrics IS 'Cron job giornaliero per ricalcolo metriche affiliate';

