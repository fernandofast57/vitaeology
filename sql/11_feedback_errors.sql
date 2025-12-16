-- =============================================
-- BLOCCO 11/12: USER_FEEDBACK + ERROR_LOGS
-- Priorità: 🟡 MEDIA (Primi mesi)
-- Riferimento: CONTROL_TOWER PARTE 4.1 e 4.2
-- =============================================

-- ===== USER_FEEDBACK =====
-- Per NPS, CSAT, feature requests, bug reports

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Tipo feedback
  feedback_type VARCHAR(30) NOT NULL
    CHECK (feedback_type IN ('nps', 'csat', 'feature_request', 'bug_report', 'general', 'testimonial')),
  
  -- Punteggio (quando applicabile)
  score INTEGER, -- NPS: 0-10, CSAT: 1-5
  
  -- Contenuto
  comment TEXT,
  
  -- Contesto: dove/quando è stato raccolto
  context VARCHAR(50), 
  -- Valori: 'post_assessment', 'post_exercise', 'post_support', 'monthly_survey', 'cancellation', 'spontaneous'
  
  -- Metadata
  page_url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Status (per feature requests)
  status VARCHAR(20) DEFAULT 'received'
    CHECK (status IN ('received', 'reviewing', 'planned', 'implemented', 'declined')),
  
  -- Follow-up
  admin_notes TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.user_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_score ON public.user_feedback(score);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.user_feedback(created_at DESC);

-- RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own feedback" ON public.user_feedback;
CREATE POLICY "Users can view own feedback"
  ON public.user_feedback FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create feedback" ON public.user_feedback;
CREATE POLICY "Users can create feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admin can view all feedback" ON public.user_feedback;
CREATE POLICY "Admin can view all feedback"
  ON public.user_feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'Admin'
    )
  );

-- ===== ERROR_LOGS =====
-- Per debug e monitoraggio errori applicazione

CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Classificazione
  error_type VARCHAR(50) NOT NULL,
  -- Valori: 'api_error', 'auth_error', 'payment_error', 'database_error', 'ai_error', 'validation_error', 'unknown'
  
  error_code VARCHAR(20), -- es. '500', 'STRIPE_DECLINED', 'AUTH_EXPIRED'
  
  -- Dettagli
  message TEXT NOT NULL,
  stack_trace TEXT,
  
  -- Contesto
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  url TEXT,
  method VARCHAR(10), -- GET, POST, etc.
  request_body JSONB,
  
  -- Ambiente
  environment VARCHAR(20) DEFAULT 'production'
    CHECK (environment IN ('development', 'staging', 'production')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  -- Può contenere: browser, os, ip (anonimizzato), session_id
  
  -- Risoluzione
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per query frequenti
CREATE INDEX IF NOT EXISTS idx_errors_type ON public.error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_code ON public.error_logs(error_code);
CREATE INDEX IF NOT EXISTS idx_errors_user ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_errors_created ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_errors_unresolved ON public.error_logs(is_resolved) WHERE is_resolved = FALSE;

-- RLS: solo Admin può vedere/gestire error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage error logs" ON public.error_logs;
CREATE POLICY "Admin can manage error logs"
  ON public.error_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'Admin'
    )
  );

-- Policy per inserimento da API (senza auth)
DROP POLICY IF EXISTS "System can insert errors" ON public.error_logs;
CREATE POLICY "System can insert errors"
  ON public.error_logs FOR INSERT
  WITH CHECK (true);

-- Verifica
SELECT 
  'user_feedback' as table_name, 
  COUNT(*) as columns 
FROM information_schema.columns 
WHERE table_name = 'user_feedback'
UNION ALL
SELECT 
  'error_logs', 
  COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'error_logs';
