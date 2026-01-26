-- ============================================================
-- FIX: Rimuovi SECURITY DEFINER da tutte le views
-- Questo fa sì che le views rispettino RLS dell'utente corrente
-- ============================================================

-- Metodo: ALTER VIEW ... SET (security_invoker = on)
-- Funziona su PostgreSQL 15+ (Supabase lo supporta)

ALTER VIEW IF EXISTS public.awareness_progression_30d SET (security_invoker = on);
ALTER VIEW IF EXISTS public.exercises_stats SET (security_invoker = on);
ALTER VIEW IF EXISTS public.active_consultants SET (security_invoker = on);
ALTER VIEW IF EXISTS public.affiliate_payouts_summary SET (security_invoker = on);
ALTER VIEW IF EXISTS public.user_authorization SET (security_invoker = on);
ALTER VIEW IF EXISTS public.best_variant_per_challenge SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_comprensione_analysis SET (security_invoker = on);
ALTER VIEW IF EXISTS public.user_exercises_with_progress SET (security_invoker = on);
ALTER VIEW IF EXISTS public.challenge_discovery_analytics SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_affiliates_sequence_ready SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_affiliates_email_data SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_monitoring_current_state SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_audit_weekly_summary SET (security_invoker = on);
ALTER VIEW IF EXISTS public.campaign_performance SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_affiliati_commissioni SET (security_invoker = on);
ALTER VIEW IF EXISTS public.affiliate_conversions_summary SET (security_invoker = on);
ALTER VIEW IF EXISTS public.admin_dashboard_summary SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_metrics_last_24h SET (security_invoker = on);
ALTER VIEW IF EXISTS public.user_challenges_view SET (security_invoker = on);
ALTER VIEW IF EXISTS public.challenge_completion_funnel SET (security_invoker = on);
ALTER VIEW IF EXISTS public.challenge_day_stats SET (security_invoker = on);
ALTER VIEW IF EXISTS public.exercises_by_path SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_affiliates_need_t1 SET (security_invoker = on);
ALTER VIEW IF EXISTS public.ab_test_performance SET (security_invoker = on);
ALTER VIEW IF EXISTS public.ai_coach_weekly_metrics SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_top_patterns SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_affiliates_inactive SET (security_invoker = on);
ALTER VIEW IF EXISTS public.awareness_level_distribution SET (security_invoker = on);
ALTER VIEW IF EXISTS public.user_awareness_summary SET (security_invoker = on);
