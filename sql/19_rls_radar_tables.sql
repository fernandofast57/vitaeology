-- =====================================================
-- RLS Policies per tabelle Radar (Framework Evangelista)
--
-- Tabelle:
-- - user_radar_snapshots
-- - ai_exercise_recommendations
-- =====================================================

-- =====================================================
-- user_radar_snapshots RLS
-- =====================================================

-- Abilita RLS (ignora errore se già abilitato)
ALTER TABLE user_radar_snapshots ENABLE ROW LEVEL SECURITY;

-- Drop policies esistenti per evitare conflitti
DROP POLICY IF EXISTS "Users can view own snapshots" ON user_radar_snapshots;
DROP POLICY IF EXISTS "Users can insert own snapshots" ON user_radar_snapshots;
DROP POLICY IF EXISTS "Users can update own snapshots" ON user_radar_snapshots;
DROP POLICY IF EXISTS "Users can delete own snapshots" ON user_radar_snapshots;

-- Policy SELECT: utenti vedono solo i propri snapshot
CREATE POLICY "Users can view own snapshots" ON user_radar_snapshots
  FOR SELECT USING (auth.uid() = user_id);

-- Policy INSERT: utenti possono inserire solo per se stessi
CREATE POLICY "Users can insert own snapshots" ON user_radar_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE: utenti possono aggiornare solo i propri
CREATE POLICY "Users can update own snapshots" ON user_radar_snapshots
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy DELETE: utenti possono eliminare solo i propri
CREATE POLICY "Users can delete own snapshots" ON user_radar_snapshots
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ai_exercise_recommendations RLS
-- =====================================================

-- Abilita RLS (ignora errore se già abilitato)
ALTER TABLE ai_exercise_recommendations ENABLE ROW LEVEL SECURITY;

-- Drop policies esistenti per evitare conflitti
DROP POLICY IF EXISTS "Users can view own recommendations" ON ai_exercise_recommendations;
DROP POLICY IF EXISTS "Users can insert own recommendations" ON ai_exercise_recommendations;
DROP POLICY IF EXISTS "Users can update own recommendations" ON ai_exercise_recommendations;
DROP POLICY IF EXISTS "Users can delete own recommendations" ON ai_exercise_recommendations;

-- Policy SELECT: utenti vedono solo le proprie raccomandazioni
CREATE POLICY "Users can view own recommendations" ON ai_exercise_recommendations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy INSERT: utenti possono inserire solo per se stessi
CREATE POLICY "Users can insert own recommendations" ON ai_exercise_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE: utenti possono aggiornare solo le proprie
CREATE POLICY "Users can update own recommendations" ON ai_exercise_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy DELETE: utenti possono eliminare solo le proprie
CREATE POLICY "Users can delete own recommendations" ON ai_exercise_recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- Verifica
-- =====================================================
-- Per verificare le policies create, esegui in Supabase:
-- SELECT tablename, policyname, cmd FROM pg_policies
-- WHERE tablename IN ('user_radar_snapshots', 'ai_exercise_recommendations');
