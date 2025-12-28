/**
 * Sistema di controllo accessi per gli Assessment
 *
 * Ogni utente può accedere solo agli assessment per cui ha ottenuto l'accesso:
 * - Acquisto libro (book_purchase)
 * - Completamento challenge (challenge_complete)
 * - Subscription attiva (subscription)
 * - Grant manuale admin (admin_grant)
 * - Trial temporaneo (trial)
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type AssessmentType = 'lite' | 'risolutore' | 'microfelicita';
export type AccessSource = 'book_purchase' | 'challenge_complete' | 'subscription' | 'admin_grant' | 'trial';

// Mapping libro slug → assessment type
export const LIBRO_TO_ASSESSMENT: Record<string, AssessmentType> = {
  'leadership': 'lite',
  'risolutore': 'risolutore',
  'microfelicita': 'microfelicita',
};

// Mapping challenge → assessment type
export const CHALLENGE_TO_ASSESSMENT: Record<string, AssessmentType> = {
  'leadership-autentica': 'lite',
  'oltre-ostacoli': 'risolutore',
  'microfelicita': 'microfelicita',
};

// Mapping assessment type → info display
export const ASSESSMENT_INFO: Record<AssessmentType, {
  name: string;
  libro: string;
  libroSlug: string;
  challenge: string;
  color: string;
  url: string;
}> = {
  'lite': {
    name: 'Leadership Autentica',
    libro: 'Leadership Autentica',
    libroSlug: 'leadership',
    challenge: 'leadership-autentica',
    color: '#D4AF37',
    url: '/assessment/lite',
  },
  'risolutore': {
    name: 'Oltre gli Ostacoli',
    libro: 'Oltre gli Ostacoli',
    libroSlug: 'risolutore',
    challenge: 'oltre-ostacoli',
    color: '#10B981',
    url: '/assessment/risolutore',
  },
  'microfelicita': {
    name: 'Microfelicità',
    libro: 'Microfelicità Digitale',
    libroSlug: 'microfelicita',
    challenge: 'microfelicita',
    color: '#8B5CF6',
    url: '/assessment/microfelicita',
  },
};

/**
 * Verifica se un utente ha accesso a un assessment
 */
export async function checkAssessmentAccess(
  supabase: SupabaseClient,
  userId: string,
  assessmentType: AssessmentType
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_assessment_access', {
    p_user_id: userId,
    p_assessment_type: assessmentType,
  });

  if (error) {
    console.error('Error checking assessment access:', error);
    return false;
  }

  return data === true;
}

/**
 * Ottiene tutti gli assessment accessibili per un utente
 */
export async function getUserAccessibleAssessments(
  supabase: SupabaseClient,
  userId: string
): Promise<AssessmentType[]> {
  const { data, error } = await supabase.rpc('get_user_accessible_assessments', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error getting accessible assessments:', error);
    return [];
  }

  return (data as AssessmentType[]) || [];
}

/**
 * Concede accesso a un assessment
 */
export async function grantAssessmentAccess(
  supabase: SupabaseClient,
  userId: string,
  assessmentType: AssessmentType,
  accessSource: AccessSource,
  sourceReference?: string,
  expiresAt?: Date
): Promise<string | null> {
  const { data, error } = await supabase.rpc('grant_assessment_access', {
    p_user_id: userId,
    p_assessment_type: assessmentType,
    p_access_source: accessSource,
    p_source_reference: sourceReference || null,
    p_expires_at: expiresAt?.toISOString() || null,
  });

  if (error) {
    console.error('Error granting assessment access:', error);
    return null;
  }

  return data as string;
}

/**
 * Concede accesso basato sull'acquisto di un libro
 */
export async function grantAccessFromBookPurchase(
  supabase: SupabaseClient,
  userId: string,
  libroSlug: string,
  stripeSessionId: string
): Promise<boolean> {
  const assessmentType = LIBRO_TO_ASSESSMENT[libroSlug];
  if (!assessmentType) {
    console.error(`Unknown libro slug: ${libroSlug}`);
    return false;
  }

  const accessId = await grantAssessmentAccess(
    supabase,
    userId,
    assessmentType,
    'book_purchase',
    stripeSessionId
  );

  return accessId !== null;
}

/**
 * Concede accesso basato sul completamento di una challenge
 */
export async function grantAccessFromChallengeComplete(
  supabase: SupabaseClient,
  userId: string,
  challengeSlug: string,
  subscriberId: string
): Promise<boolean> {
  const assessmentType = CHALLENGE_TO_ASSESSMENT[challengeSlug];
  if (!assessmentType) {
    console.error(`Unknown challenge slug: ${challengeSlug}`);
    return false;
  }

  const accessId = await grantAssessmentAccess(
    supabase,
    userId,
    assessmentType,
    'challenge_complete',
    subscriberId
  );

  return accessId !== null;
}

/**
 * Concede accesso trial temporaneo (es. 7 giorni)
 */
export async function grantTrialAccess(
  supabase: SupabaseClient,
  userId: string,
  assessmentType: AssessmentType,
  daysValid: number = 7
): Promise<boolean> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);

  const accessId = await grantAssessmentAccess(
    supabase,
    userId,
    assessmentType,
    'trial',
    undefined,
    expiresAt
  );

  return accessId !== null;
}

/**
 * Ottiene i dettagli degli accessi di un utente
 */
export async function getUserAccessDetails(
  supabase: SupabaseClient,
  userId: string
): Promise<Array<{
  assessmentType: AssessmentType;
  accessSource: AccessSource;
  grantedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}>> {
  const { data, error } = await supabase
    .from('assessment_access')
    .select('assessment_type, access_source, granted_at, expires_at, is_active')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    console.error('Error getting access details:', error);
    return [];
  }

  return (data || []).map(row => ({
    assessmentType: row.assessment_type as AssessmentType,
    accessSource: row.access_source as AccessSource,
    grantedAt: row.granted_at,
    expiresAt: row.expires_at,
    isActive: row.is_active,
  }));
}
