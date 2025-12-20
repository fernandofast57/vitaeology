-- =====================================================
-- AI Coach Implicit Signals Table
-- Traccia segnali impliciti di soddisfazione/insoddisfazione
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_coach_implicit_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,

  signal_type VARCHAR(50) NOT NULL CHECK (signal_type IN (
    'reformulated_question',
    'abandoned_conversation',
    'long_pause_before_reply',
    'immediate_new_question',
    'completed_exercise',
    'skipped_exercise',
    'returned_to_topic',
    'escalation_requested'
  )),

  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes per performance
CREATE INDEX IF NOT EXISTS idx_signals_conversation ON ai_coach_implicit_signals(conversation_id);
CREATE INDEX IF NOT EXISTS idx_signals_user ON ai_coach_implicit_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON ai_coach_implicit_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_created ON ai_coach_implicit_signals(created_at DESC);

-- RLS
ALTER TABLE ai_coach_implicit_signals ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo i propri segnali
CREATE POLICY "Users can view own signals" ON ai_coach_implicit_signals
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: sistema può inserire segnali
CREATE POLICY "Service can insert signals" ON ai_coach_implicit_signals
  FOR INSERT WITH CHECK (true);

-- Policy: admin può vedere tutti
CREATE POLICY "Admin can view all signals" ON ai_coach_implicit_signals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = true OR role_id IN (SELECT id FROM roles WHERE level >= 40))
    )
  );

-- Commento tabella
COMMENT ON TABLE ai_coach_implicit_signals IS 'Traccia segnali impliciti di soddisfazione/insoddisfazione utente nelle conversazioni AI Coach';
COMMENT ON COLUMN ai_coach_implicit_signals.signal_type IS 'Tipo di segnale: reformulated_question (utente riformula domanda = possibile insoddisfazione), abandoned_conversation (conversazione abbandonata), long_pause_before_reply (pausa lunga prima di rispondere), immediate_new_question (nuova domanda immediata = possibile insoddisfazione), completed_exercise (esercizio completato = soddisfazione), skipped_exercise (esercizio saltato), returned_to_topic (ritorno su argomento = interesse), escalation_requested (richiesta escalation)';
