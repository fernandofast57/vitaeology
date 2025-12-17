/**
 * Sistema Ruoli e Autorizzazioni - Tipi TypeScript
 *
 * ARCHITETTURA:
 * - CLIENTI: usano subscription_tier (explorer, leader, mentor, mastermind, partner_elite)
 * - ADMIN/STAFF: usano roles + permissions
 */

// ============================================================
// RUOLI ADMIN/STAFF
// ============================================================

export type RoleName =
  | 'super_admin'      // Fernando, owner - accesso totale
  | 'content_admin'    // Staff gestione contenuti
  | 'tech_admin'       // Staff gestione tecnica
  | 'tester_staff'     // Tester interno staff
  | 'consultant_tech'  // Consulente esterno tecnico
  | 'consultant_comm'  // Consulente esterno comunicazione
  | 'tester_avanzato'  // Tester con accesso avanzato
  | 'tester_base';     // Tester base

export interface Role {
  id: string;
  name: RoleName;
  display_name: string;
  description: string | null;
  level: number;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// PERMESSI
// ============================================================

export type PermissionCategory =
  | 'admin'
  | 'users'
  | 'exercises'
  | 'ai_coach'
  | 'content'
  | 'system';

export type PermissionName =
  // Admin Dashboard
  | 'admin.dashboard.view'
  | 'admin.dashboard.metrics'
  | 'admin.dashboard.export'
  // Gestione Utenti
  | 'users.view'
  | 'users.edit'
  | 'users.delete'
  | 'users.roles.assign'
  | 'users.impersonate'
  // Esercizi
  | 'exercises.view.all'
  | 'exercises.create'
  | 'exercises.edit'
  | 'exercises.delete'
  | 'exercises.publish'
  // AI Coach
  | 'ai_coach.use'
  | 'ai_coach.unlimited'
  | 'ai_coach.admin'
  | 'ai_coach.prompts.edit'
  | 'ai_coach.rag.manage'
  // Contenuti
  | 'content.premium'
  | 'content.advanced'
  | 'content.create'
  | 'content.edit'
  // Sistema
  | 'system.settings'
  | 'system.logs'
  | 'system.maintenance';

export interface Permission {
  id: string;
  name: PermissionName;
  display_name: string;
  description: string | null;
  category: PermissionCategory;
  created_at: string;
}

// ============================================================
// SUBSCRIPTION TIERS (CLIENTI)
// ============================================================

export type SubscriptionTier =
  | 'explorer'       // Base gratuito
  | 'leader'         // Piano entry
  | 'mentor'         // Piano intermedio
  | 'mastermind'     // Piano avanzato
  | 'partner_elite'; // Piano top

export interface SubscriptionTierConfig {
  name: SubscriptionTier;
  display_name: string;
  level: number;
  features: {
    ai_coach_messages_per_day: number | 'unlimited';
    exercises_access: 'basic' | 'advanced' | 'all';
    premium_content: boolean;
    priority_support: boolean;
  };
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierConfig> = {
  explorer: {
    name: 'explorer',
    display_name: 'Explorer',
    level: 10,
    features: {
      ai_coach_messages_per_day: 5,
      exercises_access: 'basic',
      premium_content: false,
      priority_support: false,
    },
  },
  leader: {
    name: 'leader',
    display_name: 'Leader',
    level: 20,
    features: {
      ai_coach_messages_per_day: 20,
      exercises_access: 'basic',
      premium_content: false,
      priority_support: false,
    },
  },
  mentor: {
    name: 'mentor',
    display_name: 'Mentor',
    level: 30,
    features: {
      ai_coach_messages_per_day: 50,
      exercises_access: 'advanced',
      premium_content: true,
      priority_support: false,
    },
  },
  mastermind: {
    name: 'mastermind',
    display_name: 'Mastermind',
    level: 40,
    features: {
      ai_coach_messages_per_day: 'unlimited',
      exercises_access: 'all',
      premium_content: true,
      priority_support: true,
    },
  },
  partner_elite: {
    name: 'partner_elite',
    display_name: 'Partner Elite',
    level: 50,
    features: {
      ai_coach_messages_per_day: 'unlimited',
      exercises_access: 'all',
      premium_content: true,
      priority_support: true,
    },
  },
};

// ============================================================
// PROFILO UTENTE ESTESO
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  // Subscription (clienti)
  subscription_tier: SubscriptionTier;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  // Ruolo (admin/staff)
  role_id: string | null;
  role?: Role | null;
  is_admin: boolean;
  // Metadata
  user_type: string;
  current_path: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CONTEXT AUTORIZZAZIONE
// ============================================================

export interface AuthorizationContext {
  userId: string;
  email: string;
  // Per admin/staff
  role: Role | null;
  permissions: PermissionName[];
  // Per clienti
  subscriptionTier: SubscriptionTier;
  subscriptionConfig: SubscriptionTierConfig;
  // Helper
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
}

// ============================================================
// HELPER TYPES
// ============================================================

export interface RolePermissionCheck {
  hasPermission: boolean;
  reason?: string;
}

export interface FeatureAccessCheck {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: SubscriptionTier;
}
