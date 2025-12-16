-- =============================================
-- BLOCCO 12/12: PRODUCTION_METRICS (12 FATTORI)
-- Priorità: 🟡 MEDIA (Dashboard Admin)
-- Riferimento: CONTROL_TOWER PARTE 4.3 e 5.1
-- =============================================

-- Tabella metriche 12 fattori
CREATE TABLE IF NOT EXISTS public.production_metrics (
  id SERIAL PRIMARY KEY,
  
  -- Periodo
  period_type VARCHAR(10) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- ===== PRODOTTO 1: ISTITUZIONE =====
  -- Quantità
  p1_qty_funnels_active INTEGER,
  p1_qty_email_sequences_active INTEGER,
  p1_qty_exercises_published INTEGER,
  -- Qualità
  p1_qal_conversion_landing_lead DECIMAL(5,2), -- %
  p1_qal_conversion_lead_book DECIMAL(5,2),    -- %
  p1_qal_conversion_book_core DECIMAL(5,2),    -- %
  -- Viability
  p1_via_infra_cost_eur DECIMAL(10,2),
  p1_via_maintenance_hours DECIMAL(5,1),
  p1_via_tech_debt_ratio DECIMAL(5,2), -- %
  
  -- ===== PRODOTTO 2: GENERATO =====
  -- Quantità
  p2_qty_new_leads INTEGER,
  p2_qty_new_customers INTEGER,
  p2_qty_assessments_completed INTEGER,
  p2_qty_exercises_completed INTEGER,
  p2_qty_ai_conversations INTEGER,
  -- Qualità
  p2_qal_assessment_completion_rate DECIMAL(5,2), -- %
  p2_qal_exercise_completion_rate DECIMAL(5,2),   -- %
  p2_qal_ai_conversations_per_user DECIMAL(5,2),
  -- Viability
  p2_via_ltv_avg DECIMAL(10,2),      -- €
  p2_via_churn_rate DECIMAL(5,2),    -- %
  p2_via_mrr DECIMAL(10,2),          -- €
  p2_via_arr DECIMAL(12,2),          -- €
  
  -- ===== PRODOTTO 3: RIPARAZIONE =====
  -- Quantità
  p3_qty_bugs_resolved INTEGER,
  p3_qty_ab_tests_completed INTEGER,
  p3_qty_deployments INTEGER,
  -- Qualità
  p3_qal_bug_resolution_hours DECIMAL(5,1),
  p3_qal_deploy_success_rate DECIMAL(5,2), -- %
  p3_qal_test_coverage DECIMAL(5,2),       -- %
  -- Viability
  p3_via_uptime_percentage DECIMAL(5,2),   -- %
  p3_via_errors_per_day DECIMAL(5,1),
  p3_via_lcp_seconds DECIMAL(4,2),         -- secondi
  
  -- ===== PRODOTTO 4: CORREZIONE =====
  -- Quantità
  p4_qty_tickets_opened INTEGER,
  p4_qty_tickets_resolved INTEGER,
  p4_qty_churn_interventions INTEGER,
  p4_qty_users_recovered INTEGER,
  -- Qualità
  p4_qal_ticket_response_hours DECIMAL(5,1),
  p4_qal_nps_score DECIMAL(4,1),           -- -100 a +100
  p4_qal_csat_percentage DECIMAL(5,2),     -- %
  -- Viability
  p4_via_retention_after_support DECIMAL(5,2), -- %
  p4_via_cost_per_ticket DECIMAL(6,2),         -- €
  p4_via_self_service_rate DECIMAL(5,2),       -- %
  
  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_by VARCHAR(50) DEFAULT 'system', -- 'system' o user_id
  notes TEXT,
  
  UNIQUE(period_type, period_start)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_metrics_period ON public.production_metrics(period_type, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_monthly ON public.production_metrics(period_start DESC) WHERE period_type = 'monthly';

-- RLS: solo Admin può vedere/gestire metriche
ALTER TABLE public.production_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage metrics" ON public.production_metrics;
CREATE POLICY "Admin can manage metrics"
  ON public.production_metrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'Admin'
    )
  );

-- ===== VIEW DASHBOARD RAPIDA =====
CREATE OR REPLACE VIEW public.admin_dashboard_summary AS
SELECT 
  period_start as "Periodo",
  
  -- Headline
  p2_qty_new_leads as "Lead",
  p2_qty_new_customers as "Clienti",
  p2_via_mrr as "MRR €",
  
  -- Health P1
  CASE 
    WHEN p1_qal_conversion_landing_lead >= 25 THEN '🟢'
    WHEN p1_qal_conversion_landing_lead >= 15 THEN '🟡'
    ELSE '🔴'
  END as "Conv%",
  
  -- Health P2
  CASE 
    WHEN p2_via_churn_rate <= 5 THEN '🟢'
    WHEN p2_via_churn_rate <= 10 THEN '🟡'
    ELSE '🔴'
  END as "Churn",
  
  -- Health P3
  CASE 
    WHEN p3_via_uptime_percentage >= 99.5 THEN '🟢'
    WHEN p3_via_uptime_percentage >= 99 THEN '🟡'
    ELSE '🔴'
  END as "Uptime",
  
  -- Health P4
  CASE 
    WHEN p4_qal_nps_score >= 40 THEN '🟢'
    WHEN p4_qal_nps_score >= 20 THEN '🟡'
    ELSE '🔴'
  END as "NPS"

FROM public.production_metrics
WHERE period_type = 'monthly'
ORDER BY period_start DESC
LIMIT 6;

-- ===== FUNZIONE CALCOLO METRICHE MENSILI =====
-- Uso: SELECT calculate_monthly_metrics(2026, 4);

CREATE OR REPLACE FUNCTION public.calculate_monthly_metrics(
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TEXT AS $$
DECLARE
  v_start DATE := make_date(p_year, p_month, 1);
  v_end DATE := (make_date(p_year, p_month, 1) + INTERVAL '1 month')::DATE;
  v_result TEXT;
BEGIN
  INSERT INTO public.production_metrics (
    period_type, period_start, period_end,
    
    -- P1
    p1_qty_funnels_active,
    p1_qty_email_sequences_active,
    p1_qal_conversion_landing_lead,
    p1_qal_conversion_lead_book,
    
    -- P2
    p2_qty_new_leads,
    p2_qty_new_customers,
    p2_qty_assessments_completed,
    p2_qal_assessment_completion_rate,
    p2_via_churn_rate,
    p2_via_mrr,
    
    -- P4
    p4_qty_tickets_opened,
    p4_qty_tickets_resolved
  )
  SELECT
    'monthly',
    v_start,
    v_end,
    
    -- P1: Istituzione
    (SELECT COUNT(*) FROM public.lead_magnets WHERE is_active = true),
    (SELECT COUNT(*) FROM public.email_sequences WHERE is_active = true),
    (SELECT 
      ROUND(
        COUNT(*) FILTER (WHERE event_type = 'lead_magnet_request')::numeric / 
        NULLIF(COUNT(*) FILTER (WHERE event_type = 'landing_view'), 0) * 100, 
      2)
      FROM public.funnel_events 
      WHERE created_at >= v_start AND created_at < v_end
    ),
    (SELECT 
      ROUND(
        COUNT(*) FILTER (WHERE event_type = 'book_purchase')::numeric / 
        NULLIF(COUNT(*) FILTER (WHERE event_type = 'lead_magnet_request'), 0) * 100, 
      2)
      FROM public.funnel_events 
      WHERE created_at >= v_start AND created_at < v_end
    ),
    
    -- P2: Generato
    (SELECT COUNT(*) FROM public.profiles 
      WHERE lead_magnet_downloaded_at >= v_start 
      AND lead_magnet_downloaded_at < v_end),
    (SELECT COUNT(*) FROM public.subscriptions 
      WHERE created_at >= v_start 
      AND created_at < v_end 
      AND status = 'Active'),
    (SELECT COUNT(*) FROM public.completed_tests 
      WHERE test_completion_date >= v_start 
      AND test_completion_date < v_end 
      AND test_status = 'Completed'),
    (SELECT 
      ROUND(
        COUNT(*) FILTER (WHERE test_status = 'Completed')::numeric / 
        NULLIF(COUNT(*), 0) * 100, 
      2)
      FROM public.completed_tests 
      WHERE test_start_date >= v_start AND test_start_date < v_end
    ),
    (SELECT 
      ROUND(
        COUNT(*) FILTER (WHERE cancelled_date >= v_start AND cancelled_date < v_end)::numeric / 
        NULLIF(COUNT(*) FILTER (WHERE created_at < v_start AND status = 'Active'), 0) * 100, 
      2)
      FROM public.subscriptions
    ),
    (SELECT COALESCE(SUM(
      CASE 
        WHEN plan_type = 'Core' THEN 12.42
        WHEN plan_type = 'Premium' THEN 40.83
        WHEN plan_type = 'Mastermind' THEN 249.75
        ELSE 0 
      END
    ), 0) FROM public.subscriptions WHERE status = 'Active'),
    
    -- P4: Correzione
    (SELECT COUNT(*) FROM public.support_tickets 
      WHERE created_at >= v_start AND created_at < v_end),
    (SELECT COUNT(*) FROM public.support_tickets 
      WHERE resolved_at >= v_start AND resolved_at < v_end)
    
  ON CONFLICT (period_type, period_start) 
  DO UPDATE SET
    p1_qty_funnels_active = EXCLUDED.p1_qty_funnels_active,
    p1_qty_email_sequences_active = EXCLUDED.p1_qty_email_sequences_active,
    p1_qal_conversion_landing_lead = EXCLUDED.p1_qal_conversion_landing_lead,
    p1_qal_conversion_lead_book = EXCLUDED.p1_qal_conversion_lead_book,
    p2_qty_new_leads = EXCLUDED.p2_qty_new_leads,
    p2_qty_new_customers = EXCLUDED.p2_qty_new_customers,
    p2_qty_assessments_completed = EXCLUDED.p2_qty_assessments_completed,
    p2_qal_assessment_completion_rate = EXCLUDED.p2_qal_assessment_completion_rate,
    p2_via_churn_rate = EXCLUDED.p2_via_churn_rate,
    p2_via_mrr = EXCLUDED.p2_via_mrr,
    p4_qty_tickets_opened = EXCLUDED.p4_qty_tickets_opened,
    p4_qty_tickets_resolved = EXCLUDED.p4_qty_tickets_resolved,
    calculated_at = NOW();
  
  v_result := 'Metriche calcolate per ' || to_char(v_start, 'YYYY-MM');
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica
SELECT 
  'production_metrics' as table_name, 
  COUNT(*) as columns 
FROM information_schema.columns 
WHERE table_name = 'production_metrics';
