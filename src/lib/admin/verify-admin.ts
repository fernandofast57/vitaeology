/**
 * Utility per verificare permessi admin/staff
 *
 * USA IL NUOVO SISTEMA RUOLI:
 * - super_admin (100): accesso totale
 * - content_admin (80): gestione contenuti
 * - tech_admin (80): gestione tecnica
 * - consultant_tech (40): consulente tecnico
 * - consultant_comm (40): consulente comunicazione
 */

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { PermissionName, RoleName, AuthorizationContext } from '@/lib/types/roles';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// VERIFICA RUOLO BASE
// ============================================================

/**
 * Verifica se un userId ha un ruolo admin (level >= 80)
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      is_admin,
      role_id,
      roles (level)
    `)
    .eq('id', userId)
    .single();

  // Compatibilità: controlla is_admin O livello ruolo >= 80
  const roleLevel = (profile?.roles as any)?.level ?? 0;
  return profile?.is_admin === true || roleLevel >= 80;
}

/**
 * Verifica se un userId è staff (level >= 40)
 */
export async function isUserStaff(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      role_id,
      roles (level)
    `)
    .eq('id', userId)
    .single();

  const roleLevel = (profile?.roles as any)?.level ?? 0;
  return roleLevel >= 40;
}

/**
 * Ottieni il nome del ruolo di un utente
 */
export async function getUserRoleName(userId: string): Promise<RoleName | null> {
  const supabase = getSupabaseClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      roles (name)
    `)
    .eq('id', userId)
    .single();

  return (profile?.roles as any)?.name ?? null;
}

// ============================================================
// VERIFICA PERMESSI SPECIFICI
// ============================================================

/**
 * Verifica se un utente ha un permesso specifico
 */
export async function userHasPermission(
  userId: string,
  permission: PermissionName
): Promise<boolean> {
  const supabase = getSupabaseClient();

  // Prima verifica se è super_admin (ha tutti i permessi)
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      role_id,
      roles (name, level)
    `)
    .eq('id', userId)
    .single();

  const roleName = (profile?.roles as any)?.name;

  // Super admin ha sempre tutti i permessi
  if (roleName === 'super_admin') {
    return true;
  }

  // Altrimenti verifica permesso specifico
  if (!profile?.role_id) {
    return false;
  }

  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select(`
      permissions!inner (name)
    `)
    .eq('role_id', profile.role_id);

  const permissions = rolePerms?.map(rp => (rp.permissions as any).name) ?? [];
  return permissions.includes(permission);
}

/**
 * Ottieni tutti i permessi di un utente
 */
export async function getUserPermissions(userId: string): Promise<PermissionName[]> {
  const supabase = getSupabaseClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', userId)
    .single();

  if (!profile?.role_id) {
    return [];
  }

  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select(`
      permissions!inner (name)
    `)
    .eq('role_id', profile.role_id);

  return rolePerms?.map(rp => (rp.permissions as any).name as PermissionName) ?? [];
}

// ============================================================
// VERIFICA DA API REQUEST
// ============================================================

export interface AdminVerifyResult {
  isAdmin: true;
  userId: string;
  roleName: RoleName | null;
  roleLevel: number;
  permissions: PermissionName[];
}

export interface AdminVerifyError {
  isAdmin: false;
  response: NextResponse;
}

/**
 * Verifica admin da API request (usa cookies della sessione)
 * Richiede livello ruolo >= 80 (admin)
 */
export async function verifyAdminFromRequest(): Promise<AdminVerifyResult | AdminVerifyError> {
  return verifyRoleLevelFromRequest(80, 'admin');
}

/**
 * Verifica staff da API request (usa cookies della sessione)
 * Richiede livello ruolo >= 40 (staff/consulenti)
 */
export async function verifyStaffFromRequest(): Promise<AdminVerifyResult | AdminVerifyError> {
  return verifyRoleLevelFromRequest(40, 'staff');
}

/**
 * Verifica livello ruolo minimo da API request
 */
export async function verifyRoleLevelFromRequest(
  minLevel: number,
  levelName: string = 'richiesto'
): Promise<AdminVerifyResult | AdminVerifyError> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { error: 'Non autenticato' },
          { status: 401 }
        ),
      };
    }

    // Carica profilo con ruolo e permessi
    const serviceClient = getSupabaseClient();

    const { data: profile } = await serviceClient
      .from('profiles')
      .select(`
        is_admin,
        role_id,
        roles (name, level)
      `)
      .eq('id', user.id)
      .single();

    const roleLevel = (profile?.roles as any)?.level ?? 0;
    const roleName = (profile?.roles as any)?.name ?? null;

    // Verifica livello (o is_admin legacy per compatibilità)
    if (roleLevel < minLevel && !profile?.is_admin) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { error: `Non autorizzato - accesso ${levelName} richiesto (livello ${minLevel}+)` },
          { status: 403 }
        ),
      };
    }

    // Carica permessi
    const permissions = await getUserPermissions(user.id);

    return {
      isAdmin: true,
      userId: user.id,
      roleName,
      roleLevel,
      permissions,
    };
  } catch (error) {
    console.error('Errore verifica ruolo:', error);
    return {
      isAdmin: false,
      response: NextResponse.json(
        { error: 'Errore verifica autorizzazione' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Verifica permesso specifico da API request
 */
export async function verifyPermissionFromRequest(
  permission: PermissionName
): Promise<AdminVerifyResult | AdminVerifyError> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { error: 'Non autenticato' },
          { status: 401 }
        ),
      };
    }

    // Verifica permesso
    const hasPermission = await userHasPermission(user.id, permission);

    if (!hasPermission) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { error: `Permesso '${permission}' richiesto` },
          { status: 403 }
        ),
      };
    }

    // Carica info complete
    const serviceClient = getSupabaseClient();
    const { data: profile } = await serviceClient
      .from('profiles')
      .select(`roles (name, level)`)
      .eq('id', user.id)
      .single();

    const permissions = await getUserPermissions(user.id);

    return {
      isAdmin: true,
      userId: user.id,
      roleName: (profile?.roles as any)?.name ?? null,
      roleLevel: (profile?.roles as any)?.level ?? 0,
      permissions,
    };
  } catch (error) {
    console.error('Errore verifica permesso:', error);
    return {
      isAdmin: false,
      response: NextResponse.json(
        { error: 'Errore verifica autorizzazione' },
        { status: 500 }
      ),
    };
  }
}

// ============================================================
// HELPER LEGACY (compatibilità)
// ============================================================

/**
 * Lista email admin hardcoded (fallback)
 * @deprecated Usa il sistema ruoli invece
 */
const ADMIN_EMAILS = [
  'fernando@vitaeology.com',
];

/**
 * @deprecated Usa isUserAdmin() invece
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * @deprecated Usa isUserAdmin() invece
 */
export async function isEmailAdmin(email: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  // Trova user id dalla email in profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (!profile) return false;

  return isUserAdmin(profile.id);
}
