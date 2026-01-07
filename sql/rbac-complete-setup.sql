-- ============================================================================
-- RBAC COMPLETE SETUP
-- Sistema Ruoli, Permessi e Autorizzazioni Completo
-- ============================================================================

-- 1. TABELLA ROLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserisci ruoli di sistema
INSERT INTO public.roles (name, display_name, description, level, is_system) VALUES
  ('super_admin', 'Super Admin', 'Accesso totale al sistema', 100, true),
  ('content_admin', 'Content Admin', 'Gestione contenuti e esercizi', 80, true),
  ('tech_admin', 'Tech Admin', 'Gestione tecnica e sistema', 80, true),
  ('tester_staff', 'Tester Staff', 'Tester interno con accesso avanzato', 60, true),
  ('consultant_tech', 'Consulente Tech', 'Consulente esterno tecnico', 50, false),
  ('consultant_comm', 'Consulente Comm', 'Consulente esterno comunicazione', 50, false),
  ('tester_avanzato', 'Tester Avanzato', 'Tester con accesso feature beta', 40, false),
  ('tester_base', 'Tester Base', 'Tester base', 30, false)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  level = EXCLUDED.level;

-- 2. TABELLA PERMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserisci permessi
INSERT INTO public.permissions (name, display_name, description, category) VALUES
  -- Admin Dashboard
  ('admin.dashboard.view', 'View Admin Dashboard', 'Accesso alla dashboard admin', 'admin'),
  ('admin.dashboard.metrics', 'View Metrics', 'Visualizzazione metriche avanzate', 'admin'),
  ('admin.dashboard.export', 'Export Data', 'Esportazione dati', 'admin'),
  -- Gestione Utenti
  ('users.view', 'View Users', 'Visualizzazione lista utenti', 'users'),
  ('users.edit', 'Edit Users', 'Modifica profili utenti', 'users'),
  ('users.delete', 'Delete Users', 'Eliminazione utenti', 'users'),
  ('users.roles.assign', 'Assign Roles', 'Assegnazione ruoli', 'users'),
  ('users.impersonate', 'Impersonate Users', 'Accesso come altro utente', 'users'),
  -- Esercizi
  ('exercises.view.all', 'View All Exercises', 'Visualizza tutti gli esercizi', 'exercises'),
  ('exercises.create', 'Create Exercises', 'Creazione nuovi esercizi', 'exercises'),
  ('exercises.edit', 'Edit Exercises', 'Modifica esercizi esistenti', 'exercises'),
  ('exercises.delete', 'Delete Exercises', 'Eliminazione esercizi', 'exercises'),
  ('exercises.publish', 'Publish Exercises', 'Pubblicazione esercizi', 'exercises'),
  -- AI Coach
  ('ai_coach.use', 'Use AI Coach', 'Utilizzo AI Coach base', 'ai_coach'),
  ('ai_coach.unlimited', 'Unlimited AI Coach', 'AI Coach senza limiti', 'ai_coach'),
  ('ai_coach.admin', 'AI Coach Admin', 'Amministrazione AI Coach', 'ai_coach'),
  ('ai_coach.prompts.edit', 'Edit Prompts', 'Modifica prompt sistema', 'ai_coach'),
  ('ai_coach.rag.manage', 'Manage RAG', 'Gestione knowledge base RAG', 'ai_coach'),
  -- Contenuti
  ('content.premium', 'Premium Content', 'Accesso contenuti premium', 'content'),
  ('content.advanced', 'Advanced Content', 'Accesso contenuti avanzati', 'content'),
  ('content.create', 'Create Content', 'Creazione contenuti', 'content'),
  ('content.edit', 'Edit Content', 'Modifica contenuti', 'content'),
  -- Sistema
  ('system.settings', 'System Settings', 'Modifica impostazioni sistema', 'system'),
  ('system.logs', 'View Logs', 'Visualizzazione log sistema', 'system'),
  ('system.maintenance', 'Maintenance Mode', 'Attivazione maintenance mode', 'system')
ON CONFLICT (name) DO NOTHING;

-- 3. TABELLA ROLE_PERMISSIONS (M:N)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Assegna permessi ai ruoli
-- Super Admin: tutti i permessi
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Content Admin: gestione contenuti e esercizi
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'content_admin'
  AND p.name IN (
    'admin.dashboard.view', 'admin.dashboard.metrics',
    'exercises.view.all', 'exercises.create', 'exercises.edit', 'exercises.publish',
    'content.premium', 'content.advanced', 'content.create', 'content.edit',
    'ai_coach.use', 'ai_coach.unlimited'
  )
ON CONFLICT DO NOTHING;

-- Tech Admin: gestione tecnica
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'tech_admin'
  AND p.name IN (
    'admin.dashboard.view', 'admin.dashboard.metrics', 'admin.dashboard.export',
    'users.view', 'users.edit',
    'ai_coach.admin', 'ai_coach.prompts.edit', 'ai_coach.rag.manage',
    'system.settings', 'system.logs'
  )
ON CONFLICT DO NOTHING;

-- Tester Staff: accesso avanzato per test
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'tester_staff'
  AND p.name IN (
    'admin.dashboard.view',
    'exercises.view.all',
    'content.premium', 'content.advanced',
    'ai_coach.use', 'ai_coach.unlimited'
  )
ON CONFLICT DO NOTHING;

-- 4. AGGIORNA PROFILES per foreign key a roles
-- ============================================================================
-- Aggiungi constraint se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_role_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_id_fkey
    FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN
  NULL; -- Ignora se già esiste
END $$;

-- 5. FUNZIONE per verificare permessi
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_user_id UUID,
  p_permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := false;
BEGIN
  -- Check if super_admin or is_admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = p_user_id
      AND (p.is_admin = true OR r.name = 'super_admin')
  ) INTO v_has_permission;

  IF v_has_permission THEN
    RETURN true;
  END IF;

  -- Check specific permission via role
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions perm ON rp.permission_id = perm.id
    WHERE p.id = p_user_id
      AND perm.name = p_permission_name
  ) INTO v_has_permission;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNZIONE per verificare livello ruolo minimo
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_has_role_level(
  p_user_id UUID,
  p_min_level INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_level INTEGER := 0;
BEGIN
  SELECT COALESCE(r.level, 0)
  INTO v_user_level
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = p_user_id;

  -- is_admin equivale a level 80+
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_admin = true) THEN
    v_user_level := GREATEST(v_user_level, 80);
  END IF;

  RETURN v_user_level >= p_min_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNZIONE per verificare subscription tier
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_has_tier_level(
  p_user_id UUID,
  p_min_tier TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_tier TEXT;
  v_tier_levels JSONB := '{
    "explorer": 10,
    "leader": 20,
    "mentor": 30,
    "mastermind": 40,
    "partner_elite": 50
  }'::JSONB;
  v_user_level INTEGER;
  v_min_level INTEGER;
BEGIN
  SELECT subscription_tier INTO v_user_tier
  FROM public.profiles
  WHERE id = p_user_id;

  v_user_level := COALESCE((v_tier_levels->>v_user_tier)::INTEGER, 10);
  v_min_level := COALESCE((v_tier_levels->>p_min_tier)::INTEGER, 10);

  RETURN v_user_level >= v_min_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. VIEW per profilo utente con ruolo e permessi
-- ============================================================================
CREATE OR REPLACE VIEW public.user_authorization AS
SELECT
  p.id as user_id,
  p.email,
  p.full_name,
  p.is_admin,
  p.subscription_tier,
  r.name as role_name,
  r.display_name as role_display_name,
  r.level as role_level,
  COALESCE(
    (SELECT array_agg(perm.name)
     FROM public.role_permissions rp
     JOIN public.permissions perm ON rp.permission_id = perm.id
     WHERE rp.role_id = r.id),
    ARRAY[]::TEXT[]
  ) as permissions
FROM public.profiles p
LEFT JOIN public.roles r ON p.role_id = r.id;

-- 9. RLS per nuove tabelle
-- ============================================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Roles: leggibili da tutti, modificabili solo da admin
CREATE POLICY "Roles viewable by authenticated" ON public.roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Roles editable by admin" ON public.roles
  FOR ALL TO authenticated
  USING (public.user_has_role_level(auth.uid(), 80));

-- Permissions: leggibili da tutti, modificabili solo da super_admin
CREATE POLICY "Permissions viewable by authenticated" ON public.permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permissions editable by super_admin" ON public.permissions
  FOR ALL TO authenticated
  USING (public.user_has_role_level(auth.uid(), 100));

-- Role_permissions: leggibili da admin, modificabili solo da super_admin
CREATE POLICY "Role_permissions viewable by admin" ON public.role_permissions
  FOR SELECT TO authenticated
  USING (public.user_has_role_level(auth.uid(), 40));

CREATE POLICY "Role_permissions editable by super_admin" ON public.role_permissions
  FOR ALL TO authenticated
  USING (public.user_has_role_level(auth.uid(), 100));

-- 10. Assegna ruolo super_admin a Fernando
-- ============================================================================
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'super_admin'),
    is_admin = true
WHERE email = 'fernando@vitaeology.com';
