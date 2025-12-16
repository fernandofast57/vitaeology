-- =============================================
-- MIGRATION: Aggiunge current_path a profiles
-- Data: 15 Dicembre 2025
-- Scopo: Filtrare RAG per percorso attivo
-- =============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_path TEXT
DEFAULT 'leadership'
CHECK (current_path IN ('leadership', 'problemi', 'benessere'));

CREATE INDEX IF NOT EXISTS idx_profiles_current_path
ON public.profiles(current_path);

COMMENT ON COLUMN public.profiles.current_path IS
'Percorso attivo: leadership, problemi, benessere. Filtra contenuti RAG.';

-- Mapping percorsi → book_id:
-- 'leadership' → 'leadership-autentica'
-- 'problemi'   → 'oltre-ostacoli'
-- 'benessere'  → 'microfelicita'
