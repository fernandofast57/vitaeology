/**
 * Challenges Service
 *
 * Gestisce le challenge 7 giorni degli utenti
 * Riferimento: ARCHITETTURA_DASHBOARD_VITAEOLOGY_DEFINITIVA.md
 *
 * NOTA: Per mappature tra slug, usa src/lib/path-mappings.ts
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  CHALLENGE_DB_DISPLAY_NAMES,
  CHALLENGE_DB_TO_DATABASE,
  type ChallengeDbValue,
} from '@/lib/path-mappings';

// ============================================================
// TYPES
// ============================================================

// ChallengeType = ChallengeDbValue (valore in DB)
export type ChallengeType = ChallengeDbValue;
export type ChallengeStatus = 'active' | 'completed' | 'unsubscribed';

export interface UserChallenge {
  id: string;
  user_id: string | null;
  email: string;
  nome: string | null;
  challenge: ChallengeType;
  variant: string;
  current_day: number;
  status: ChallengeStatus;
  converted_to_assessment: boolean;
  converted_to_subscription: boolean;
  subscribed_at: string;
  completed_at: string | null;
  // Computed
  progress_percentage: number;
  days_remaining: number;
  challenge_name: string;
  challenge_color: string;
}

export interface ChallengeStats {
  total: number;
  active: number;
  completed: number;
  converted: number;
}

// ============================================================
// CONSTANTS (re-exported from path-mappings with local additions)
// ============================================================

export const CHALLENGE_NAMES: Record<ChallengeType, string> = CHALLENGE_DB_DISPLAY_NAMES;

export const CHALLENGE_COLORS: Record<ChallengeType, string> = {
  'leadership-autentica': '#D4AF37',  // Oro
  'oltre-ostacoli': '#10B981',         // Verde
  'microfelicita': '#8B5CF6',          // Viola
};

export const CHALLENGE_ICONS: Record<ChallengeType, string> = {
  'leadership-autentica': 'crown',
  'oltre-ostacoli': 'target',
  'microfelicita': 'heart',
};

// Mapping challenge DB → pathway/database slug (re-export from path-mappings)
export const CHALLENGE_TO_PATHWAY: Record<ChallengeType, string> = CHALLENGE_DB_TO_DATABASE;

// ============================================================
// FUNCTIONS
// ============================================================

/**
 * Collega le challenge esistenti a un utente basandosi sull'email
 * Da chiamare dopo login/signup
 */
export async function linkUserChallenges(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<number> {
  const { data, error } = await supabase.rpc('link_user_challenges', {
    p_user_id: userId,
    p_email: email,
  });

  if (error) {
    console.error('Error linking challenges:', error);
    // Fallback: aggiornamento diretto
    const { data: updateResult } = await supabase
      .from('challenge_subscribers')
      .update({ user_id: userId })
      .eq('email', email.toLowerCase())
      .is('user_id', null)
      .select('id');

    return updateResult?.length || 0;
  }

  return data || 0;
}

/**
 * Ottiene tutte le challenge di un utente
 */
export async function getUserChallenges(
  supabase: SupabaseClient,
  userId: string
): Promise<UserChallenge[]> {
  const { data, error } = await supabase
    .from('challenge_subscribers')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'unsubscribed')
    .order('subscribed_at', { ascending: false });

  if (error) {
    console.error('Error fetching user challenges:', error);
    return [];
  }

  return (data || []).map(formatChallenge);
}

/**
 * Ottiene le challenge di un utente per email (fallback se user_id non collegato)
 */
export async function getUserChallengesByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<UserChallenge[]> {
  const { data, error } = await supabase
    .from('challenge_subscribers')
    .select('*')
    .ilike('email', email)
    .neq('status', 'unsubscribed')
    .order('subscribed_at', { ascending: false });

  if (error) {
    console.error('Error fetching challenges by email:', error);
    return [];
  }

  return (data || []).map(formatChallenge);
}

/**
 * Ottiene una singola challenge
 */
export async function getChallenge(
  supabase: SupabaseClient,
  challengeId: string
): Promise<UserChallenge | null> {
  const { data, error } = await supabase
    .from('challenge_subscribers')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (error) {
    console.error('Error fetching challenge:', error);
    return null;
  }

  return formatChallenge(data);
}

/**
 * Ottiene statistiche challenge utente
 */
export async function getUserChallengeStats(
  supabase: SupabaseClient,
  userId: string
): Promise<ChallengeStats> {
  const challenges = await getUserChallenges(supabase, userId);

  return {
    total: challenges.length,
    active: challenges.filter(c => c.status === 'active').length,
    completed: challenges.filter(c => c.status === 'completed').length,
    converted: challenges.filter(c => c.converted_to_assessment || c.converted_to_subscription).length,
  };
}

/**
 * Verifica se l'utente ha challenge attive
 */
export async function hasActiveChallenges(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('challenge_subscribers')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error checking active challenges:', error);
    return false;
  }

  return (count || 0) > 0;
}

/**
 * Marca una challenge come convertita ad assessment
 */
export async function markChallengeConvertedToAssessment(
  supabase: SupabaseClient,
  challengeId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('challenge_subscribers')
    .update({ converted_to_assessment: true })
    .eq('id', challengeId);

  if (error) {
    console.error('Error marking challenge converted:', error);
    return false;
  }

  return true;
}

/**
 * Marca una challenge come convertita a subscription
 */
export async function markChallengeConvertedToSubscription(
  supabase: SupabaseClient,
  challengeId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('challenge_subscribers')
    .update({ converted_to_subscription: true })
    .eq('id', challengeId);

  if (error) {
    console.error('Error marking challenge converted:', error);
    return false;
  }

  return true;
}

// ============================================================
// HELPERS
// ============================================================

function formatChallenge(data: any): UserChallenge {
  const challenge = data.challenge as ChallengeType;
  const currentDay = data.current_day || 0;
  const status = data.status as ChallengeStatus;

  return {
    id: data.id,
    user_id: data.user_id,
    email: data.email,
    nome: data.nome,
    challenge,
    variant: data.variant || 'A',
    current_day: currentDay,
    status,
    converted_to_assessment: data.converted_to_assessment || false,
    converted_to_subscription: data.converted_to_subscription || false,
    subscribed_at: data.subscribed_at,
    completed_at: data.completed_at,
    // Computed
    progress_percentage: Math.round((currentDay / 7) * 100),
    days_remaining: status === 'completed' ? 0 : 7 - currentDay,
    challenge_name: CHALLENGE_NAMES[challenge] || challenge,
    challenge_color: CHALLENGE_COLORS[challenge] || '#6B7280',
  };
}
