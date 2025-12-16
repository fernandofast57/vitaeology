-- =============================================
-- BLOCCO 3/7: TABELLA LEAD_MAGNETS
-- Esegui dopo blocco 2
-- =============================================

CREATE TABLE IF NOT EXISTS public.lead_magnets (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  funnel VARCHAR(20) NOT NULL CHECK (funnel IN ('leadership', 'problemi', 'benessere')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('quiz', 'pdf', 'audio')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert dei 3 lead magnet
INSERT INTO public.lead_magnets (slug, funnel, type, title, description) VALUES
  ('quiz-leadership', 'leadership', 'quiz', 
   'Quale delle 24 caratteristiche possiedi già?', 
   'Quiz interattivo 5 minuti - Scopri il tuo punto di forza nella leadership')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.lead_magnets (slug, funnel, type, title, description) VALUES
  ('pdf-problemi', 'problemi', 'pdf', 
   'I 3 Filtri del Risolutore', 
   'PDF 12 pagine - Il framework per affrontare qualsiasi ostacolo')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.lead_magnets (slug, funnel, type, title, description) VALUES
  ('audio-benessere', 'benessere', 'audio', 
   'Meditazione R.A.D.A.R.', 
   'MP3 10 minuti - Tecnica guidata per ritrovare equilibrio')
ON CONFLICT (slug) DO NOTHING;

-- Verifica
SELECT slug, funnel, type FROM public.lead_magnets;
