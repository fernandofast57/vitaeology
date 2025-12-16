-- =============================================
-- BLOCCO 1/7: ESTENSIONE PROFILES
-- Esegui per primo
-- =============================================

-- Campi origine lead
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  lead_source VARCHAR(50) DEFAULT NULL;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  first_funnel VARCHAR(20) DEFAULT NULL;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  lead_magnet_type VARCHAR(20) DEFAULT NULL;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  lead_magnet_downloaded_at TIMESTAMPTZ DEFAULT NULL;

-- Campi UTM tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  utm_source VARCHAR(100) DEFAULT NULL;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  utm_medium VARCHAR(100) DEFAULT NULL;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  utm_campaign VARCHAR(100) DEFAULT NULL;

-- Campi affiliazione e conversione
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  referral_code VARCHAR(50) DEFAULT NULL;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  converted_to_customer_at TIMESTAMPTZ DEFAULT NULL;

-- Verifica
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN 
('lead_source', 'first_funnel', 'referral_code');
