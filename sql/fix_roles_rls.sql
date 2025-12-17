-- ============================================
-- FIX: Rimuovi policy RLS ricorsiva su roles
-- ============================================
-- Problema: "infinite recursion detected in policy for relation roles"
-- Causa: La policy SELECT su roles probabilmente fa riferimento a se stessa
-- ============================================

-- 1. Disabilita temporaneamente RLS su roles
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- 2. Elimina tutte le policy esistenti su roles
DROP POLICY IF EXISTS "Roles are viewable by everyone" ON roles;
DROP POLICY IF EXISTS "Roles viewable by authenticated" ON roles;
DROP POLICY IF EXISTS "roles_select_policy" ON roles;
DROP POLICY IF EXISTS "Allow read access to roles" ON roles;
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;

-- 3. Ricrea policy SEMPLICE (senza ricorsione)
-- I ruoli sono pubblici in lettura - non serve controllare chi legge
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_public_read" ON roles
  FOR SELECT
  USING (true);  -- Tutti possono leggere i ruoli

-- 4. Solo super admin può modificare i ruoli (via service_role)
-- Non serve policy INSERT/UPDATE/DELETE per utenti normali

-- 5. Verifica
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'roles';
