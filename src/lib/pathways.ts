/**
 * Pathways Service
 *
 * Gestisce l'accesso ai percorsi formativi (user_pathways)
 * Mantiene compatibilità con vecchio schema (profiles.current_path)
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export type PathwaySlug = 'leadership' | 'risolutore' | 'microfelicita';

export type PathwayAccessType =
  | 'subscription'      // Accesso da subscription Leader/Mentor
  | 'book_purchase'     // Accesso da acquisto libro
  | 'challenge_complete' // Accesso da challenge completata
  | 'admin_grant'       // Accesso manuale admin
  | 'trial';            // Accesso trial temporaneo

export interface Pathway {
  id: number;
  slug: PathwaySlug;
  name: string;
  description: string | null;
  book_title: string | null;
  color_hex: string;
  icon_name: string;
  order_index: number;
  is_active: boolean;
}

export interface UserPathway {
  id: string;
  user_id: string;
  pathway_id: number;
  access_type: PathwayAccessType;
  is_active: boolean;
  started_at: string | null;
  completed_at: string | null;
  progress_percentage: number;
  exercises_completed: number;
  exercises_total: number;
  last_assessment_id: string | null;
  last_assessment_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  pathway?: Pathway;
}

export interface UserPathwayWithDetails extends UserPathway {
  pathway: Pathway;
}

// ============================================================
// CONSTANTS
// ============================================================

export const PATHWAY_COLORS: Record<PathwaySlug, string> = {
  leadership: '#D4AF37',    // Oro
  risolutore: '#10B981',    // Verde
  microfelicita: '#8B5CF6', // Viola
};

export const PATHWAY_NAMES: Record<PathwaySlug, string> = {
  leadership: 'Leadership Autentica',
  risolutore: 'Oltre gli Ostacoli',
  microfelicita: 'Microfelicità Digitale',
};

// Mapping vecchio schema → nuovo
export const LEGACY_PATH_MAPPING: Record<string, PathwaySlug> = {
  'leadership': 'leadership',
  'problemi': 'risolutore',
  'benessere': 'microfelicita',
};

// ============================================================
// FUNCTIONS
// ============================================================

/**
 * Ottiene tutti i percorsi attivi
 */
export async function getActivePathways(
  supabase: SupabaseClient
): Promise<Pathway[]> {
  const { data, error } = await supabase
    .from('pathways')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (error) {
    console.error('Error fetching pathways:', error);
    return [];
  }

  return data || [];
}

/**
 * Ottiene i percorsi attivi di un utente con dettagli
 */
export async function getUserPathways(
  supabase: SupabaseClient,
  userId: string
): Promise<UserPathwayWithDetails[]> {
  const { data, error } = await supabase
    .from('user_pathways')
    .select(`
      *,
      pathway:pathways (*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user pathways:', error);
    return [];
  }

  return (data || []).map(up => ({
    ...up,
    pathway: up.pathway as Pathway
  }));
}

/**
 * Verifica se l'utente ha accesso a un percorso
 */
export async function hasPathwayAccess(
  supabase: SupabaseClient,
  userId: string,
  pathwaySlug: PathwaySlug
): Promise<boolean> {
  // Prima prova con il nuovo schema
  const { data: userPathway } = await supabase
    .from('user_pathways')
    .select(`
      id,
      is_active,
      expires_at,
      pathway:pathways!inner (slug)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('pathway.slug', pathwaySlug)
    .maybeSingle();

  if (userPathway) {
    // Verifica scadenza
    if (userPathway.expires_at && new Date(userPathway.expires_at) < new Date()) {
      return false;
    }
    return true;
  }

  // Fallback: controlla assessment_access (vecchio schema)
  const { data: legacyAccess } = await supabase
    .from('assessment_access')
    .select('id')
    .eq('user_id', userId)
    .eq('assessment_type', pathwaySlug === 'leadership' ? 'lite' : pathwaySlug)
    .maybeSingle();

  return !!legacyAccess;
}

/**
 * Ottiene il percorso corrente dell'utente
 * Compatibile con vecchio e nuovo schema
 */
export async function getUserCurrentPath(
  supabase: SupabaseClient,
  userId: string
): Promise<PathwaySlug | null> {
  // Prima prova con il nuovo schema
  const { data: userPathway } = await supabase
    .from('user_pathways')
    .select(`
      pathway:pathways (slug)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (userPathway?.pathway) {
    return (userPathway.pathway as any).slug as PathwaySlug;
  }

  // Fallback: profiles.current_path (vecchio schema)
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_path')
    .eq('id', userId)
    .single();

  if (profile?.current_path) {
    // Mappa vecchi valori a nuovi
    return LEGACY_PATH_MAPPING[profile.current_path] || profile.current_path as PathwaySlug;
  }

  return null;
}

/**
 * Assegna accesso a un percorso
 */
export async function grantPathwayAccess(
  supabase: SupabaseClient,
  userId: string,
  pathwaySlug: PathwaySlug,
  accessType: PathwayAccessType = 'subscription'
): Promise<{ success: boolean; userPathwayId?: string; error?: string }> {
  // Trova pathway
  const { data: pathway } = await supabase
    .from('pathways')
    .select('id')
    .eq('slug', pathwaySlug)
    .eq('is_active', true)
    .single();

  if (!pathway) {
    return { success: false, error: `Pathway ${pathwaySlug} not found` };
  }

  // Conta esercizi per questo percorso
  const { count: exercisesTotal } = await supabase
    .from('exercises')
    .select('id', { count: 'exact', head: true })
    .eq('book_slug', pathwaySlug)
    .eq('is_active', true);

  // Inserisci o aggiorna user_pathway
  const { data, error } = await supabase
    .from('user_pathways')
    .upsert({
      user_id: userId,
      pathway_id: pathway.id,
      access_type: accessType,
      is_active: true,
      started_at: new Date().toISOString(),
      exercises_total: exercisesTotal || 0,
    }, {
      onConflict: 'user_id,pathway_id',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error granting pathway access:', error);
    return { success: false, error: error.message };
  }

  return { success: true, userPathwayId: data.id };
}

/**
 * Aggiorna il progresso di un percorso
 */
export async function updatePathwayProgress(
  supabase: SupabaseClient,
  userId: string,
  pathwaySlug: PathwaySlug,
  exercisesCompleted: number,
  exercisesTotal?: number
): Promise<void> {
  const progressPercentage = exercisesTotal && exercisesTotal > 0
    ? Math.min(100, Math.round((exercisesCompleted / exercisesTotal) * 100))
    : 0;

  const { error } = await supabase
    .from('user_pathways')
    .update({
      exercises_completed: exercisesCompleted,
      exercises_total: exercisesTotal,
      progress_percentage: progressPercentage,
      completed_at: progressPercentage >= 100 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('pathway_id', (
      await supabase
        .from('pathways')
        .select('id')
        .eq('slug', pathwaySlug)
        .single()
    ).data?.id);

  if (error) {
    console.error('Error updating pathway progress:', error);
  }
}

/**
 * Ottiene tutti i percorsi di un utente (per Mentor)
 */
export async function getAllUserPathways(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  pathways: UserPathwayWithDetails[];
  hasAllPaths: boolean;
  completedPaths: number;
}> {
  const userPathways = await getUserPathways(supabase, userId);

  const allPathways = await getActivePathways(supabase);
  const hasAllPaths = userPathways.length >= allPathways.length;
  const completedPaths = userPathways.filter(up => up.completed_at).length;

  return {
    pathways: userPathways,
    hasAllPaths,
    completedPaths,
  };
}

/**
 * Imposta il percorso corrente dell'utente
 * Aggiorna anche profiles.current_path per backward compatibility
 */
export async function setUserCurrentPath(
  supabase: SupabaseClient,
  userId: string,
  pathwaySlug: PathwaySlug
): Promise<void> {
  // Aggiorna profiles.current_path (backward compat)
  await supabase
    .from('profiles')
    .update({ current_path: pathwaySlug })
    .eq('id', userId);

  // Il trigger sync_current_path_from_user_pathways gestisce il resto
}
