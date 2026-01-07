/**
 * Client-side Authorization Hook
 *
 * Hook React per verificare permessi, ruoli e subscription tier lato client.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PermissionName, SubscriptionTier, SUBSCRIPTION_TIERS } from '@/lib/types/roles';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthorizationState {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  isAdmin: boolean;
  subscriptionTier: SubscriptionTier;
  roleName: string | null;
  roleLevel: number;
  permissions: string[];
}

export interface UseAuthorizationReturn extends AuthorizationState {
  // Permission checks
  hasPermission: (permission: PermissionName) => boolean;
  hasAllPermissions: (permissions: PermissionName[]) => boolean;
  hasAnyPermission: (permissions: PermissionName[]) => boolean;
  // Role checks
  hasRoleLevel: (minLevel: number) => boolean;
  // Tier checks
  hasTierLevel: (minTier: SubscriptionTier) => boolean;
  getTierLimits: () => typeof SUBSCRIPTION_TIERS[SubscriptionTier]['features'];
  // Utilities
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuthorization(): UseAuthorizationReturn {
  const [state, setState] = useState<AuthorizationState>({
    isLoading: true,
    isAuthenticated: false,
    userId: null,
    email: null,
    fullName: null,
    isAdmin: false,
    subscriptionTier: 'explorer',
    roleName: null,
    roleLevel: 0,
    permissions: [],
  });

  const supabase = createClient();

  const fetchAuthorizationData = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setState({
          isLoading: false,
          isAuthenticated: false,
          userId: null,
          email: null,
          fullName: null,
          isAdmin: false,
          subscriptionTier: 'explorer',
          roleName: null,
          roleLevel: 0,
          permissions: [],
        });
        return;
      }

      // Fetch authorization data from view
      const { data: authData } = await supabase
        .from('user_authorization')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (authData) {
        setState({
          isLoading: false,
          isAuthenticated: true,
          userId: user.id,
          email: authData.email || user.email || null,
          fullName: authData.full_name || null,
          isAdmin: authData.is_admin || authData.role_level >= 80,
          subscriptionTier: authData.subscription_tier || 'explorer',
          roleName: authData.role_name || null,
          roleLevel: authData.role_level || 0,
          permissions: authData.permissions || [],
        });
      } else {
        // Utente autenticato ma senza profilo completo
        setState({
          isLoading: false,
          isAuthenticated: true,
          userId: user.id,
          email: user.email || null,
          fullName: user.user_metadata?.full_name || null,
          isAdmin: false,
          subscriptionTier: 'explorer',
          roleName: null,
          roleLevel: 0,
          permissions: [],
        });
      }
    } catch (error) {
      console.error('Error fetching authorization data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchAuthorizationData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchAuthorizationData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAuthorizationData, supabase.auth]);

  // Permission check functions
  const hasPermission = useCallback((permission: PermissionName): boolean => {
    if (state.isAdmin) return true;
    return state.permissions.includes(permission);
  }, [state.isAdmin, state.permissions]);

  const hasAllPermissions = useCallback((permissions: PermissionName[]): boolean => {
    if (state.isAdmin) return true;
    return permissions.every(p => state.permissions.includes(p));
  }, [state.isAdmin, state.permissions]);

  const hasAnyPermission = useCallback((permissions: PermissionName[]): boolean => {
    if (state.isAdmin) return true;
    return permissions.some(p => state.permissions.includes(p));
  }, [state.isAdmin, state.permissions]);

  // Role level check
  const hasRoleLevel = useCallback((minLevel: number): boolean => {
    const effectiveLevel = state.isAdmin ? Math.max(state.roleLevel, 80) : state.roleLevel;
    return effectiveLevel >= minLevel;
  }, [state.isAdmin, state.roleLevel]);

  // Tier level check
  const hasTierLevel = useCallback((minTier: SubscriptionTier): boolean => {
    if (state.isAdmin) return true;
    const userTierConfig = SUBSCRIPTION_TIERS[state.subscriptionTier];
    const minTierConfig = SUBSCRIPTION_TIERS[minTier];
    return userTierConfig.level >= minTierConfig.level;
  }, [state.isAdmin, state.subscriptionTier]);

  // Get tier limits
  const getTierLimits = useCallback(() => {
    if (state.isAdmin) {
      return {
        ai_coach_messages_per_day: 'unlimited' as const,
        exercises_access: 'all' as const,
        premium_content: true,
        priority_support: true,
      };
    }
    return SUBSCRIPTION_TIERS[state.subscriptionTier].features;
  }, [state.isAdmin, state.subscriptionTier]);

  return {
    ...state,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRoleLevel,
    hasTierLevel,
    getTierLimits,
    refresh: fetchAuthorizationData,
  };
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface RequireAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface RequirePermissionProps {
  permission: PermissionName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface RequireTierProps {
  tier: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente che mostra i children solo se autenticato
 */
export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const { isLoading, isAuthenticated } = useAuthorization();

  if (isLoading) return null;
  if (!isAuthenticated) return <>{fallback}</>;

  return <>{children}</>;
}

/**
 * Componente che mostra i children solo se admin
 */
export function RequireAdmin({ children, fallback = null }: RequireAdminProps) {
  const { isLoading, isAdmin } = useAuthorization();

  if (isLoading) return null;
  if (!isAdmin) return <>{fallback}</>;

  return <>{children}</>;
}

/**
 * Componente che mostra i children solo se ha il permesso
 */
export function RequirePermission({ permission, children, fallback = null }: RequirePermissionProps) {
  const { isLoading, hasPermission } = useAuthorization();

  if (isLoading) return null;
  if (!hasPermission(permission)) return <>{fallback}</>;

  return <>{children}</>;
}

/**
 * Componente che mostra i children solo se ha il tier minimo
 */
export function RequireTier({ tier, children, fallback = null }: RequireTierProps) {
  const { isLoading, hasTierLevel } = useAuthorization();

  if (isLoading) return null;
  if (!hasTierLevel(tier)) return <>{fallback}</>;

  return <>{children}</>;
}

export default useAuthorization;
