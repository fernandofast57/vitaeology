-- =============================================
-- BLOCCO 8/12: SUBSCRIPTION_PLANS
-- Priorità: 🔴 ALTA (Prima del Lancio)
-- Riferimento: CONTROL_TOWER PARTE 4, STRATEGIA v2 PARTE 1.2
-- =============================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  
  -- Pricing
  price_eur DECIMAL(10,2) NOT NULL,
  interval VARCHAR(10) NOT NULL CHECK (interval IN ('month', 'year', 'once')),
  
  -- Stripe Integration
  stripe_price_id VARCHAR(100), -- es. price_1234567890
  stripe_product_id VARCHAR(100),
  
  -- Value Ladder Level
  value_ladder_level INTEGER NOT NULL CHECK (value_ladder_level BETWEEN 1 AND 8),
  
  -- Features (JSON array)
  features JSONB DEFAULT '[]',
  -- Esempio: ["1 percorso", "52 esercizi", "AI Coach"]
  
  -- Percorsi inclusi
  paths_included TEXT[] DEFAULT '{}',
  -- Valori: 'leadership', 'problemi', 'benessere'
  
  -- Limiti
  max_ai_conversations_month INTEGER, -- NULL = illimitato
  community_access VARCHAR(20) DEFAULT 'none' 
    CHECK (community_access IN ('none', 'base', 'advanced', 'mastermind')),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE, -- Visibile in pricing page
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert piani Value Ladder
INSERT INTO public.subscription_plans 
  (name, slug, price_eur, interval, value_ladder_level, features, paths_included, community_access, max_ai_conversations_month)
VALUES
  ('Trial', 'trial', 0, 'once', 1, 
   '["7 giorni accesso", "1 percorso preview", "5 domande AI Coach"]'::jsonb,
   ARRAY['leadership'], 'none', 5),
   
  ('Core', 'core', 149, 'year', 3,
   '["1 percorso completo", "52 esercizi settimanali", "AI Coach illimitato", "Assessment completo", "Radar chart", "Community base"]'::jsonb,
   ARRAY['leadership'], 'base', NULL),
   
  ('Premium', 'premium', 490, 'year', 4,
   '["3 percorsi completi", "AI Coach cross-pollination", "Q&A mensile live", "Community avanzata", "Badge Praticante Completo"]'::jsonb,
   ARRAY['leadership', 'problemi', 'benessere'], 'advanced', NULL),
   
  ('Coaching Starter', 'coaching-starter', 997, 'once', 5,
   '["3 sessioni 1:1 con Fernando", "Assessment personalizzato", "Piano azione custom", "Supporto email", "Premium incluso 3 mesi"]'::jsonb,
   ARRAY['leadership', 'problemi', 'benessere'], 'advanced', NULL),
   
  ('Coaching Intensive', 'coaching-intensive', 1997, 'once', 5,
   '["6 sessioni 1:1 con Fernando", "Assessment approfondito", "Piano azione dettagliato", "Supporto email prioritario", "Premium incluso 6 mesi"]'::jsonb,
   ARRAY['leadership', 'problemi', 'benessere'], 'advanced', NULL),
   
  ('Mastermind', 'mastermind', 2997, 'year', 6,
   '["Gruppo max 24 persone", "2 live/mese con Fernando", "Ritiro annuale", "Hot seat rotativo", "Canale privato", "Tutti i livelli inclusi"]'::jsonb,
   ARRAY['leadership', 'problemi', 'benessere'], 'mastermind', NULL),
   
  ('Consulente Tecnico', 'consulente-tecnico', 2997, 'once', 7,
   '["Certificazione metodologia", "Dashboard consulente", "Compenso €50/sessione", "Formazione continua", "Badge verificato"]'::jsonb,
   ARRAY['leadership', 'problemi', 'benessere'], 'mastermind', NULL),
   
  ('Consulente Commerciale', 'consulente-commerciale', 1497, 'once', 7,
   '["Link affiliato", "Dashboard conversioni", "Commissioni 20-25%", "Kit marketing", "Gruppo affiliati"]'::jsonb,
   ARRAY['leadership', 'problemi', 'benessere'], 'advanced', NULL),
   
  ('Partner Elite', 'partner-elite', 9997, 'year', 8,
   '["Licenza territoriale", "Sub-consulenti", "Workshop locali", "Revenue share", "Formazione esclusiva"]'::jsonb,
   ARRAY['leadership', 'problemi', 'benessere'], 'mastermind', NULL)

ON CONFLICT (slug) DO NOTHING;

-- Indici
CREATE INDEX IF NOT EXISTS idx_plans_level ON public.subscription_plans(value_ladder_level);
CREATE INDEX IF NOT EXISTS idx_plans_active ON public.subscription_plans(is_active);

-- Verifica
SELECT name, price_eur, value_ladder_level FROM public.subscription_plans ORDER BY value_ladder_level;
