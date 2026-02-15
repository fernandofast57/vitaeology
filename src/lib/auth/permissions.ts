/**
 * Sistema Autorizzazioni - Utility Functions
 *
 * Gestisce la verifica permessi per:
 * - ADMIN/STAFF: basata su roles + permissions
 * - CLIENTI: basata su subscription_tier
 */

import { getServiceClient } from '@/lib/supabase/service';
import { createClient as createServerClient } from '@/lib/supabase/server';
import {
  Role,
  RoleName,
  PermissionName,
  SubscriptionTier,
  SUBSCRIPTION_TIERS,
  AuthorizationContext,
  RolePermissionCheck,
  FeatureAccessCheck,
} from '@/lib/types/roles';

// ============================================================
// CARICAMENTO CONTESTO AUTORIZZAZIONE
// ============================================================

/**
 * Carica il contesto completo di autorizzazione per un utente
 */
export async function getAuthorizationContext(
  userId: string
): Promise<AuthorizationContext | null> {
  const supabase = getServiceClient();

  // Carica profilo con ruolo
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      subscription_tier,
      is_admin,
      role_id,
      roles (
        id,
        name,
        display_name,
        description,
        level,
        is_system
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('Errore caricamento profilo:', error);
    return null;
  }

  // Carica permessi se ha un ruolo
  let permissions: PermissionName[] = [];

  if (profile.role_id) {
    const { data: perms } = await supabase
      .from('role_permissions')
      .select(`
        permissions (name)
      `)
      .eq('role_id', profile.role_id);

    if (perms) {
      permissions = perms.map(p => (p.permissions as any).name as PermissionName);
    }
  }

  const role = profile.roles as unknown as Role | null;
  const subscriptionTier = (profile.subscription_tier || 'explorer') as SubscriptionTier;

  return {
    userId: profile.id,
    email: profile.email,
    role,
    permissions,
    subscriptionTier,
    subscriptionConfig: SUBSCRIPTION_TIERS[subscriptionTier] || SUBSCRIPTION_TIERS.explorer,
    isAdmin: profile.is_admin || (role?.level ?? 0) >= 80,
    isStaff: role !== null && (role.level ?? 0) >= 40,
    isClient: role === null,
  };
}

/**
 * Carica contesto dalla sessione corrente (per Server Components/API)
 */
export async function getAuthContextFromSession(): Promise<AuthorizationContext | null> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    return getAuthorizationContext(user.id);
  } catch (error) {
    console.error('Errore caricamento contesto sessione:', error);
    return null;
  }
}

// ============================================================
// VERIFICA PERMESSI (ADMIN/STAFF)
// ============================================================

/**
 * Verifica se un utente ha un permesso specifico
 */
export async function checkPermission(
  userId: string,
  permission: PermissionName
): Promise<RolePermissionCheck> {
  const context = await getAuthorizationContext(userId);

  if (!context) {
    return { hasPermission: false, reason: 'Utente non trovato' };
  }

  // Super admin ha sempre tutti i permessi
  if (context.role?.name === 'super_admin') {
    return { hasPermission: true };
  }

  // Verifica permesso specifico
  if (context.permissions.includes(permission)) {
    return { hasPermission: true };
  }

  return {
    hasPermission: false,
    reason: `Permesso '${permission}' non assegnato al ruolo ${context.role?.display_name || 'utente'}`,
  };
}

/**
 * Verifica multipli permessi (AND - tutti richiesti)
 */
export async function checkPermissions(
  userId: string,
  permissions: PermissionName[]
): Promise<RolePermissionCheck> {
  const context = await getAuthorizationContext(userId);

  if (!context) {
    return { hasPermission: false, reason: 'Utente non trovato' };
  }

  // Super admin ha sempre tutti i permessi
  if (context.role?.name === 'super_admin') {
    return { hasPermission: true };
  }

  const missingPermissions = permissions.filter(p => !context.permissions.includes(p));

  if (missingPermissions.length === 0) {
    return { hasPermission: true };
  }

  return {
    hasPermission: false,
    reason: `Permessi mancanti: ${missingPermissions.join(', ')}`,
  };
}

/**
 * Verifica almeno uno dei permessi (OR)
 */
export async function checkAnyPermission(
  userId: string,
  permissions: PermissionName[]
): Promise<RolePermissionCheck> {
  const context = await getAuthorizationContext(userId);

  if (!context) {
    return { hasPermission: false, reason: 'Utente non trovato' };
  }

  // Super admin ha sempre tutti i permessi
  if (context.role?.name === 'super_admin') {
    return { hasPermission: true };
  }

  const hasAny = permissions.some(p => context.permissions.includes(p));

  if (hasAny) {
    return { hasPermission: true };
  }

  return {
    hasPermission: false,
    reason: `Nessuno dei permessi richiesti: ${permissions.join(', ')}`,
  };
}

// ============================================================
// VERIFICA LIVELLO RUOLO
// ============================================================

/**
 * Verifica se l'utente ha un livello di ruolo minimo
 */
export async function checkRoleLevel(
  userId: string,
  minLevel: number
): Promise<RolePermissionCheck> {
  const context = await getAuthorizationContext(userId);

  if (!context) {
    return { hasPermission: false, reason: 'Utente non trovato' };
  }

  const userLevel = context.role?.level ?? 0;

  if (userLevel >= minLevel) {
    return { hasPermission: true };
  }

  return {
    hasPermission: false,
    reason: `Livello ruolo insufficiente (richiesto: ${minLevel}, attuale: ${userLevel})`,
  };
}

/**
 * Verifica se l'utente è admin (level >= 80)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const result = await checkRoleLevel(userId, 80);
  return result.hasPermission;
}

/**
 * Verifica se l'utente è super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const context = await getAuthorizationContext(userId);
  return context?.role?.name === 'super_admin';
}

/**
 * Verifica se l'utente è staff (level >= 40)
 */
export async function isStaff(userId: string): Promise<boolean> {
  const result = await checkRoleLevel(userId, 40);
  return result.hasPermission;
}

// ============================================================
// VERIFICA SUBSCRIPTION (CLIENTI)
// ============================================================

/**
 * Verifica se il cliente ha un tier minimo
 */
export async function checkSubscriptionTier(
  userId: string,
  minTier: SubscriptionTier
): Promise<FeatureAccessCheck> {
  const context = await getAuthorizationContext(userId);

  if (!context) {
    return { hasAccess: false, reason: 'Utente non trovato' };
  }

  // Staff/Admin hanno sempre accesso
  if (context.isStaff) {
    return { hasAccess: true };
  }

  const requiredLevel = SUBSCRIPTION_TIERS[minTier].level;
  const userLevel = context.subscriptionConfig.level;

  if (userLevel >= requiredLevel) {
    return { hasAccess: true };
  }

  return {
    hasAccess: false,
    reason: `Abbonamento ${context.subscriptionConfig.display_name} insufficiente`,
    upgradeRequired: minTier,
  };
}

/**
 * Verifica accesso a contenuti premium
 */
export async function canAccessPremiumContent(userId: string): Promise<FeatureAccessCheck> {
  const context = await getAuthorizationContext(userId);

  if (!context) {
    return { hasAccess: false, reason: 'Utente non trovato' };
  }

  // Staff/Admin hanno sempre accesso
  if (context.isStaff) {
    return { hasAccess: true };
  }

  if (context.subscriptionConfig.features.premium_content) {
    return { hasAccess: true };
  }

  return {
    hasAccess: false,
    reason: 'Contenuti premium non inclusi nel piano attuale',
    upgradeRequired: 'mentor',
  };
}

/**
 * Verifica limite messaggi AI Coach
 */
export async function checkAICoachLimit(
  userId: string,
  currentCount: number
): Promise<FeatureAccessCheck> {
  const context = await getAuthorizationContext(userId);

  if (!context) {
    return { hasAccess: false, reason: 'Utente non trovato' };
  }

  // Staff/Admin hanno sempre accesso illimitato
  if (context.isStaff) {
    return { hasAccess: true };
  }

  const limit = context.subscriptionConfig.features.ai_coach_messages_per_day;

  if (limit === 'unlimited' || currentCount < limit) {
    return { hasAccess: true };
  }

  return {
    hasAccess: false,
    reason: `Limite giornaliero raggiunto (${limit} messaggi)`,
    upgradeRequired: 'mastermind',
  };
}

// ============================================================
// GESTIONE RUOLI (ADMIN ONLY)
// ============================================================

/**
 * Assegna un ruolo a un utente (richiede permesso users.roles.assign)
 */
export async function assignRole(
  adminUserId: string,
  targetUserId: string,
  roleName: RoleName
): Promise<{ success: boolean; error?: string }> {
  // Verifica permesso admin
  const permCheck = await checkPermission(adminUserId, 'users.roles.assign');
  if (!permCheck.hasPermission) {
    return { success: false, error: permCheck.reason };
  }

  const supabase = getServiceClient();

  // Trova il ruolo
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id, level')
    .eq('name', roleName)
    .single();

  if (roleError || !role) {
    return { success: false, error: 'Ruolo non trovato' };
  }

  // Verifica che l'admin possa assegnare questo ruolo (solo ruoli di livello inferiore)
  const adminContext = await getAuthorizationContext(adminUserId);
  if (!adminContext || (adminContext.role?.level ?? 0) <= role.level) {
    // Eccezione per super_admin
    if (adminContext?.role?.name !== 'super_admin') {
      return { success: false, error: 'Non puoi assegnare un ruolo di livello superiore o uguale al tuo' };
    }
  }

  // Assegna il ruolo
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role_id: role.id })
    .eq('id', targetUserId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

/**
 * Rimuove il ruolo da un utente (lo rende cliente normale)
 */
export async function removeRole(
  adminUserId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  // Verifica permesso admin
  const permCheck = await checkPermission(adminUserId, 'users.roles.assign');
  if (!permCheck.hasPermission) {
    return { success: false, error: permCheck.reason };
  }

  const supabase = getServiceClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role_id: null })
    .eq('id', targetUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================
// HELPER PER API ROUTES
// ============================================================

import { NextResponse } from 'next/server';

/**
 * Middleware helper per proteggere API routes con permessi
 */
export async function requirePermission(
  permission: PermissionName
): Promise<{ authorized: true; context: AuthorizationContext } | { authorized: false; response: NextResponse }> {
  const context = await getAuthContextFromSession();

  if (!context) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Non autenticato' }, { status: 401 }),
    };
  }

  // Super admin bypass
  if (context.role?.name === 'super_admin') {
    return { authorized: true, context };
  }

  if (!context.permissions.includes(permission)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: `Permesso '${permission}' richiesto` },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, context };
}

/**
 * Middleware helper per proteggere API routes con livello ruolo minimo
 */
export async function requireRoleLevel(
  minLevel: number
): Promise<{ authorized: true; context: AuthorizationContext } | { authorized: false; response: NextResponse }> {
  const context = await getAuthContextFromSession();

  if (!context) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Non autenticato' }, { status: 401 }),
    };
  }

  const userLevel = context.role?.level ?? 0;

  if (userLevel < minLevel) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: `Livello ruolo insufficiente (richiesto: ${minLevel})` },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, context };
}
