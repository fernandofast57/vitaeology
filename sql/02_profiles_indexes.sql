-- =============================================
-- BLOCCO 2/7: INDICI PROFILES
-- Esegui dopo blocco 1
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_lead_source 
  ON public.profiles(lead_source);

CREATE INDEX IF NOT EXISTS idx_profiles_first_funnel 
  ON public.profiles(first_funnel);

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code 
  ON public.profiles(referral_code);

CREATE INDEX IF NOT EXISTS idx_profiles_converted_at 
  ON public.profiles(converted_to_customer_at);

-- Verifica
SELECT indexname FROM pg_indexes 
WHERE tablename = 'profiles' AND indexname LIKE 'idx_profiles_%';
