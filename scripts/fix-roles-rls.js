/**
 * Fix RLS ricorsivo sulla tabella roles
 * Esegue SQL via Supabase REST API
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

async function fixRolesRLS() {
  console.log('🔧 Fixing roles RLS via direct SQL...\n');
  console.log('SUPABASE_URL:', SUPABASE_URL);

  // Prima creiamo la funzione exec_sql se non esiste
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;

  // Usa il Management API per creare la funzione
  const mgmtResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'GET',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  console.log('API Status:', mgmtResponse.status);

  // Test diretto: prova a leggere le policy esistenti
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Verifica lo stato attuale
  const { data: roles, error } = await supabase
    .from('roles')
    .select('*');

  console.log('\nRuoli nel database:', roles?.length || 0);
  if (error) console.log('Errore:', error.message);

  console.log('\n⚠️  Per eseguire il fix RLS, devi:');
  console.log('1. Vai su Supabase Dashboard → SQL Editor');
  console.log('2. Incolla ed esegui questo SQL:\n');
  console.log('------------------------------------------');
  console.log(`
-- Disabilita RLS temporaneamente
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- Elimina tutte le policy esistenti
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'roles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON roles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Riabilita RLS con policy semplice
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Crea policy semplice senza ricorsione
CREATE POLICY "roles_public_read" ON roles
  FOR SELECT
  USING (true);

-- Verifica
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'roles';
  `);
  console.log('------------------------------------------');
}

fixRolesRLS().catch(console.error);
