/**
 * Server-side Authorization Utility
 *
 * Funzioni per verificare permessi, ruoli e subscription tier lato server.
 * Usare in API routes e Server Components.
 */

import { createClient } from '@/lib/supabase/server';
import { PermissionName, SubscriptionTier, SUBSCRIPTION_TIERS } from '@/lib/types/roles';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthorizationContext {
  userId: string;
  email: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
  subscriptionTier: SubscriptionTier;
  roleName: string | null;
  roleLevel: number;
  permissions: string[];
}

export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
  context?: AuthorizationContext;
}

// ============================================================================
// GET AUTHORIZATION CONTEXT
// ============================================================================

/**
 * Ottiene il contesto di autorizzazione completo per l'utente corrente
 */
export async function getAuthorizationContext(): Promise<AuthorizationContext | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: authData } = await supabase
    .from('user_authorization')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!authData) {
    // Utente autenticato ma senza profilo completo
    return {
      userId: user.id,
      email: user.email || '',
      isAdmin: false,
      isAuthenticated: true,
      subscriptionTier: 'explorer',
      roleName: null,
      roleLevel: 0,
      permissions: [],
    };
  }

  return {
    userId: user.id,
    email: authData.email || user.email || '',
    isAdmin: authData.is_admin || authData.role_level >= 80,
    isAuthenticated: true,
    subscriptionTier: authData.subscription_tier || 'explorer',
    roleName: authData.role_name,
    roleLevel: authData.role_level || 0,
    permissions: authData.permissions || [],
  };
}

// ============================================================================
// PERMISSION CHECKS
// ============================================================================

/**
 * Verifica se l'utente ha un permesso specifico
 */
export async function hasPermission(permission: PermissionName): Promise<boolean> {
  const context = await getAuthorizationContext();

  if (!context) return false;
  if (context.isAdmin) return true; // Admin ha tutti i permessi

  return context.permissions.includes(permission);
}

/**
 * Verifica se l'utente ha TUTTI i permessi specificati
 */
export async function hasAllPermissions(permissions: PermissionName[]): Promise<boolean> {
  const context = await getAuthorizationContext();

  if (!context) return false;
  if (context.isAdmin) return true;

  return permissions.every(p => context.permissions.includes(p));
}

/**
 * Verifica se l'utente ha ALMENO UNO dei permessi specificati
 */
export async function hasAnyPermission(permissions: PermissionName[]): Promise<boolean> {
  const context = await getAuthorizationContext();

  if (!context) return false;
  if (context.isAdmin) return true;

  return permissions.some(p => context.permissions.includes(p));
}

// ============================================================================
// ROLE LEVEL CHECKS
// ============================================================================

/**
 * Verifica se l'utente ha un livello ruolo minimo
 */
export async function hasRoleLevel(minLevel: number): Promise<boolean> {
  const context = await getAuthorizationContext();

  if (!context) return false;

  // is_admin equivale a level 80+
  const effectiveLevel = context.isAdmin ? Math.max(context.roleLevel, 80) : context.roleLevel;

  return effectiveLevel >= minLevel;
}

/**
 * Verifica se l'utente è admin (is_admin=true o role_level >= 80)
 */
export async function isAdmin(): Promise<boolean> {
  const context = await getAuthorizationContext();
  return context?.isAdmin ?? false;
}

/**
 * Verifica se l'utente è super admin (role_level >= 100)
 */
export async function isSuperAdmin(): Promise<boolean> {
  const context = await getAuthorizationContext();
  if (!context) return false;
  return context.roleLevel >= 100;
}

// ============================================================================
// SUBSCRIPTION TIER CHECKS
// ============================================================================

/**
 * Verifica se l'utente ha un subscription tier minimo
 */
export async function hasTierLevel(minTier: SubscriptionTier): Promise<boolean> {
  const context = await getAuthorizationContext();

  if (!context) return false;
  if (context.isAdmin) return true; // Admin bypassa tier

  const userTierConfig = SUBSCRIPTION_TIERS[context.subscriptionTier];
  const minTierConfig = SUBSCRIPTION_TIERS[minTier];

  return userTierConfig.level >= minTierConfig.level;
}

/**
 * Ottiene i limiti per il tier corrente dell'utente
 */
export async function getTierLimits() {
  const context = await getAuthorizationContext();

  if (!context) {
    return SUBSCRIPTION_TIERS.explorer.features;
  }

  if (context.isAdmin) {
    // Admin ha accesso illimitato
    return {
      ai_coach_messages_per_day: 'unlimited' as const,
      exercises_access: 'all' as const,
      premium_content: true,
      priority_support: true,
    };
  }

  return SUBSCRIPTION_TIERS[context.subscriptionTier].features;
}

// ============================================================================
// COMBINED AUTHORIZATION CHECKS
// ============================================================================

/**
 * Verifica autorizzazione per accesso admin
 */
export async function requireAdmin(): Promise<AuthorizationResult> {
  const context = await getAuthorizationContext();

  if (!context) {
    return { authorized: false, reason: 'Non autenticato' };
  }

  if (!context.isAdmin) {
    return { authorized: false, reason: 'Accesso riservato agli amministratori', context };
  }

  return { authorized: true, context };
}

/**
 * Verifica autorizzazione per permesso specifico
 */
export async function requirePermission(permission: PermissionName): Promise<AuthorizationResult> {
  const context = await getAuthorizationContext();

  if (!context) {
    return { authorized: false, reason: 'Non autenticato' };
  }

  if (!context.isAdmin && !context.permissions.includes(permission)) {
    return { authorized: false, reason: `Permesso richiesto: ${permission}`, context };
  }

  return { authorized: true, context };
}

/**
 * Verifica autorizzazione per subscription tier
 */
export async function requireTier(minTier: SubscriptionTier): Promise<AuthorizationResult> {
  const context = await getAuthorizationContext();

  if (!context) {
    return { authorized: false, reason: 'Non autenticato' };
  }

  if (context.isAdmin) {
    return { authorized: true, context };
  }

  const userTierConfig = SUBSCRIPTION_TIERS[context.subscriptionTier];
  const minTierConfig = SUBSCRIPTION_TIERS[minTier];

  if (userTierConfig.level < minTierConfig.level) {
    return {
      authorized: false,
      reason: `Richiesto abbonamento ${minTierConfig.display_name} o superiore`,
      context,
    };
  }

  return { authorized: true, context };
}

/**
 * Verifica autenticazione base
 */
export async function requireAuth(): Promise<AuthorizationResult> {
  const context = await getAuthorizationContext();

  if (!context) {
    return { authorized: false, reason: 'Non autenticato' };
  }

  return { authorized: true, context };
}

// ============================================================================
// ROUTE PROTECTION CONFIG
// ============================================================================

export interface RouteProtection {
  path: string;
  type: 'auth' | 'admin' | 'permission' | 'tier';
  value?: string; // permission name o tier name
}

export const PROTECTED_ROUTES: RouteProtection[] = [
  // Admin routes
  { path: '/admin', type: 'admin' },
  { path: '/admin/users', type: 'permission', value: 'users.view' },
  { path: '/admin/ai-coach', type: 'permission', value: 'ai_coach.admin' },

  // Premium content
  { path: '/exercises', type: 'auth' },

  // Tier-gated routes
  // { path: '/advanced-exercises', type: 'tier', value: 'mentor' },
];

/**
 * Verifica se una route è protetta e se l'utente ha accesso
 */
export async function checkRouteAccess(pathname: string): Promise<AuthorizationResult> {
  const context = await getAuthorizationContext();

  // Trova la route protection più specifica
  const protection = PROTECTED_ROUTES
    .filter(r => pathname.startsWith(r.path))
    .sort((a, b) => b.path.length - a.path.length)[0];

  if (!protection) {
    // Route non protetta
    return { authorized: true, context: context || undefined };
  }

  if (!context) {
    return { authorized: false, reason: 'Non autenticato' };
  }

  switch (protection.type) {
    case 'auth':
      return { authorized: true, context };

    case 'admin':
      if (!context.isAdmin) {
        return { authorized: false, reason: 'Accesso riservato agli amministratori', context };
      }
      return { authorized: true, context };

    case 'permission':
      if (!context.isAdmin && !context.permissions.includes(protection.value!)) {
        return { authorized: false, reason: `Permesso richiesto: ${protection.value}`, context };
      }
      return { authorized: true, context };

    case 'tier':
      const userTierConfig = SUBSCRIPTION_TIERS[context.subscriptionTier];
      const minTierConfig = SUBSCRIPTION_TIERS[protection.value as SubscriptionTier];
      if (!context.isAdmin && userTierConfig.level < minTierConfig.level) {
        return {
          authorized: false,
          reason: `Richiesto abbonamento ${minTierConfig.display_name}`,
          context,
        };
      }
      return { authorized: true, context };

    default:
      return { authorized: true, context };
  }
}
