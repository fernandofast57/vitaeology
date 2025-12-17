-- ============================================================
-- SISTEMA RUOLI E AUTORIZZAZIONI - VITAEOLOGY
-- ============================================================
-- Migrazione: 001_roles_permissions_system.sql
-- Data: 2024-12-17
-- Descrizione: Crea il sistema completo di ruoli e permessi
-- ============================================================

-- ============================================================
-- 1. TABELLA ROLES - Definizione ruoli disponibili
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  level INTEGER DEFAULT 0,  -- Livello gerarchico (admin=100, moderator=50, etc.)
  is_system BOOLEAN DEFAULT FALSE,  -- Ruoli di sistema non eliminabili
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice per ricerca veloce per nome
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- ============================================================
-- 2. TABELLA PERMISSIONS - Definizione permessi granulari
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,  -- es: 'admin.dashboard.view'
  display_name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,  -- Categoria per raggruppamento (admin, exercises, ai_coach, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice per ricerca per categoria
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);

-- ============================================================
-- 3. TABELLA ROLE_PERMISSIONS - Associazione N:N ruoli-permessi
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Indici per JOIN veloci
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

-- ============================================================
-- 4. AGGIORNA TABELLA PROFILES - Aggiungi riferimento ruolo
-- ============================================================
-- Aggiungi colonna role_id se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role_id UUID REFERENCES roles(id);
  END IF;
END $$;

-- Indice per ricerca utenti per ruolo
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role_id);

-- ============================================================
-- 5. INSERISCI RUOLI DI SISTEMA
-- ============================================================
INSERT INTO roles (name, display_name, description, level, is_system) VALUES
  ('super_admin', 'Super Amministratore', 'Accesso completo a tutte le funzionalita del sistema', 100, TRUE),
  ('admin', 'Amministratore', 'Gestione utenti, contenuti e configurazioni', 90, TRUE),
  ('moderator', 'Moderatore', 'Revisione contenuti e supporto utenti', 50, TRUE),
  ('premium', 'Utente Premium', 'Accesso completo a tutti i contenuti e funzionalita premium', 30, TRUE),
  ('free', 'Utente Free', 'Accesso limitato alle funzionalita base', 10, TRUE)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  level = EXCLUDED.level;

-- ============================================================
-- 6. INSERISCI PERMESSI DI SISTEMA
-- ============================================================

-- Permessi Admin Dashboard
INSERT INTO permissions (name, display_name, description, category) VALUES
  ('admin.dashboard.view', 'Visualizza Dashboard Admin', 'Accesso alla dashboard amministrativa', 'admin'),
  ('admin.dashboard.metrics', 'Visualizza Metriche', 'Accesso alle metriche e statistiche', 'admin'),
  ('admin.dashboard.export', 'Esporta Dati', 'Possibilita di esportare dati in CSV/JSON', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Permessi Gestione Utenti
INSERT INTO permissions (name, display_name, description, category) VALUES
  ('users.view', 'Visualizza Utenti', 'Vedere lista utenti registrati', 'users'),
  ('users.edit', 'Modifica Utenti', 'Modificare profili utenti', 'users'),
  ('users.delete', 'Elimina Utenti', 'Eliminare account utenti', 'users'),
  ('users.roles.assign', 'Assegna Ruoli', 'Assegnare ruoli agli utenti', 'users'),
  ('users.impersonate', 'Impersona Utente', 'Accedere come altro utente per debug', 'users')
ON CONFLICT (name) DO NOTHING;

-- Permessi Esercizi
INSERT INTO permissions (name, display_name, description, category) VALUES
  ('exercises.view.all', 'Visualizza Tutti Esercizi', 'Accesso a tutti gli esercizi senza restrizioni', 'exercises'),
  ('exercises.create', 'Crea Esercizi', 'Creare nuovi esercizi', 'exercises'),
  ('exercises.edit', 'Modifica Esercizi', 'Modificare esercizi esistenti', 'exercises'),
  ('exercises.delete', 'Elimina Esercizi', 'Eliminare esercizi', 'exercises'),
  ('exercises.publish', 'Pubblica Esercizi', 'Pubblicare/depubblicare esercizi', 'exercises')
ON CONFLICT (name) DO NOTHING;

-- Permessi AI Coach
INSERT INTO permissions (name, display_name, description, category) VALUES
  ('ai_coach.use', 'Usa AI Coach', 'Accesso al coach AI Fernando', 'ai_coach'),
  ('ai_coach.unlimited', 'AI Coach Illimitato', 'Nessun limite messaggi AI Coach', 'ai_coach'),
  ('ai_coach.admin', 'Gestisci AI Coach', 'Accesso admin AI Coach (patterns, reports)', 'ai_coach'),
  ('ai_coach.prompts.edit', 'Modifica Prompt', 'Modificare i prompt del sistema AI', 'ai_coach'),
  ('ai_coach.rag.manage', 'Gestisci RAG', 'Gestire contenuti knowledge base', 'ai_coach')
ON CONFLICT (name) DO NOTHING;

-- Permessi Contenuti
INSERT INTO permissions (name, display_name, description, category) VALUES
  ('content.premium', 'Contenuti Premium', 'Accesso a contenuti premium', 'content'),
  ('content.advanced', 'Contenuti Avanzati', 'Accesso a esercizi e contenuti avanzati', 'content'),
  ('content.create', 'Crea Contenuti', 'Creare nuovi contenuti', 'content'),
  ('content.edit', 'Modifica Contenuti', 'Modificare contenuti esistenti', 'content')
ON CONFLICT (name) DO NOTHING;

-- Permessi Sistema
INSERT INTO permissions (name, display_name, description, category) VALUES
  ('system.settings', 'Impostazioni Sistema', 'Accesso alle impostazioni di sistema', 'system'),
  ('system.logs', 'Visualizza Log', 'Accesso ai log di sistema', 'system'),
  ('system.maintenance', 'Manutenzione', 'Eseguire operazioni di manutenzione', 'system')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 7. ASSEGNA PERMESSI AI RUOLI
-- ============================================================

-- Super Admin: TUTTI i permessi
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin: Quasi tutti i permessi (escluso impersonate e system.maintenance)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.name NOT IN ('users.impersonate', 'system.maintenance')
ON CONFLICT DO NOTHING;

-- Moderator: Permessi di visualizzazione e gestione contenuti
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'moderator'
  AND p.name IN (
    'admin.dashboard.view',
    'admin.dashboard.metrics',
    'users.view',
    'exercises.view.all',
    'exercises.edit',
    'ai_coach.use',
    'ai_coach.unlimited',
    'ai_coach.admin',
    'content.premium',
    'content.advanced'
  )
ON CONFLICT DO NOTHING;

-- Premium: Accesso completo a contenuti e AI Coach
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'premium'
  AND p.name IN (
    'exercises.view.all',
    'ai_coach.use',
    'ai_coach.unlimited',
    'content.premium',
    'content.advanced'
  )
ON CONFLICT DO NOTHING;

-- Free: Accesso base
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'free'
  AND p.name IN (
    'ai_coach.use'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. MIGRA UTENTI ESISTENTI AI NUOVI RUOLI
-- ============================================================

-- Gli admin esistenti (is_admin = true) diventano super_admin
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'super_admin')
WHERE is_admin = TRUE AND role_id IS NULL;

-- Gli altri utenti diventano 'free' di default
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'free')
WHERE role_id IS NULL;

-- ============================================================
-- 9. FUNZIONI HELPER PER VERIFICA PERMESSI
-- ============================================================

-- Funzione: Verifica se un utente ha un permesso specifico
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_permission_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM profiles pr
    JOIN role_permissions rp ON pr.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE pr.id = p_user_id
      AND p.name = p_permission_name
  ) INTO v_has_permission;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Ottieni tutti i permessi di un utente
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  permission_name VARCHAR,
  permission_category VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.name, p.category
  FROM profiles pr
  JOIN role_permissions rp ON pr.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE pr.id = p_user_id
  ORDER BY p.category, p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Ottieni ruolo utente con dettagli
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TABLE (
  role_name VARCHAR,
  role_display_name VARCHAR,
  role_level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name, r.display_name, r.level
  FROM profiles pr
  JOIN roles r ON pr.role_id = r.id
  WHERE pr.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Abilita RLS sulle nuove tabelle
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere ruoli e permessi
CREATE POLICY "Roles are viewable by everyone" ON roles
  FOR SELECT USING (true);

CREATE POLICY "Permissions are viewable by everyone" ON permissions
  FOR SELECT USING (true);

CREATE POLICY "Role permissions are viewable by everyone" ON role_permissions
  FOR SELECT USING (true);

-- Policy: Solo admin possono modificare ruoli e permessi
CREATE POLICY "Only admins can modify roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.level >= 90
    )
  );

CREATE POLICY "Only admins can modify permissions" ON permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.level >= 90
    )
  );

CREATE POLICY "Only admins can modify role_permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.level >= 90
    )
  );

-- ============================================================
-- 11. TRIGGER PER UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS roles_updated_at ON roles;
CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FINE MIGRAZIONE
-- ============================================================
