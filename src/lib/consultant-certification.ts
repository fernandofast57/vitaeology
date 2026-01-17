/**
 * Consultant Certification Service
 *
 * Gestisce la certificazione consulenti Vitaeology
 * Separato dalla subscription tier (un Mentor può diventare Consulente)
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export type CertificationStatus =
  | 'pending'       // In attesa (ha iniziato formazione)
  | 'in_training'   // In formazione
  | 'exam_pending'  // Formazione completata, attesa esame
  | 'active'        // Certificato attivo
  | 'suspended'     // Sospeso temporaneamente
  | 'revoked'       // Revocato
  | 'expired';      // Scaduto

export type CertificationLevel = 'base' | 'advanced' | 'master';

export interface ConsultantCertification {
  id: string;
  user_id: string;
  certification_number: string | null;
  status: CertificationStatus;

  // Formazione
  training_started_at: string | null;
  training_completed_at: string | null;
  training_modules_completed: number;
  training_modules_total: number;

  // Esame
  exam_scheduled_at: string | null;
  exam_passed_at: string | null;
  exam_score: number | null;
  exam_attempts: number;
  exam_max_attempts: number;

  // Certificazione
  certified_at: string | null;
  certified_by: string | null;
  certification_level: CertificationLevel;

  // Licenza
  license_agreement_signed: boolean;
  license_agreement_signed_at: string | null;
  license_agreement_version: string | null;
  territory: string | null;

  // Scadenza
  expires_at: string | null;

  // Metadata
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsultantCertificationSummary {
  isCertified: boolean;
  status: CertificationStatus | null;
  certificationNumber: string | null;
  level: CertificationLevel | null;
  certifiedAt: string | null;
  expiresAt: string | null;
  trainingProgress: number; // 0-100
  examScore: number | null;
}

// ============================================================
// CONSTANTS
// ============================================================

export const CERTIFICATION_LEVELS: Record<CertificationLevel, {
  name: string;
  description: string;
  commission_bonus: number; // % bonus commissione
}> = {
  base: {
    name: 'Consulente Base',
    description: 'Abilitato a erogare consulenze individuali',
    commission_bonus: 0,
  },
  advanced: {
    name: 'Consulente Avanzato',
    description: 'Abilitato a formare altri consulenti base',
    commission_bonus: 5,
  },
  master: {
    name: 'Master Consulente',
    description: 'Abilitato a licenze territoriali e formazione avanzata',
    commission_bonus: 10,
  },
};

export const EXAM_PASSING_SCORE = 70;

// ============================================================
// FUNCTIONS
// ============================================================

/**
 * Verifica se l'utente è un consulente certificato attivo
 */
export async function isCertifiedConsultant(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('consultant_certifications')
    .select('id, status, expires_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  // Verifica scadenza
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return false;
  }

  return true;
}

/**
 * Ottiene il riepilogo certificazione di un utente
 */
export async function getConsultantCertificationSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<ConsultantCertificationSummary> {
  const { data, error } = await supabase
    .from('consultant_certifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return {
      isCertified: false,
      status: null,
      certificationNumber: null,
      level: null,
      certifiedAt: null,
      expiresAt: null,
      trainingProgress: 0,
      examScore: null,
    };
  }

  const cert = data as ConsultantCertification;
  const isExpired = cert.expires_at && new Date(cert.expires_at) < new Date();

  return {
    isCertified: cert.status === 'active' && !isExpired,
    status: cert.status,
    certificationNumber: cert.certification_number,
    level: cert.certification_level,
    certifiedAt: cert.certified_at,
    expiresAt: cert.expires_at,
    trainingProgress: cert.training_modules_total > 0
      ? Math.round((cert.training_modules_completed / cert.training_modules_total) * 100)
      : 0,
    examScore: cert.exam_score,
  };
}

/**
 * Ottiene i dettagli completi della certificazione
 */
export async function getConsultantCertification(
  supabase: SupabaseClient,
  userId: string
): Promise<ConsultantCertification | null> {
  const { data, error } = await supabase
    .from('consultant_certifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ConsultantCertification;
}

/**
 * Inizia il processo di certificazione
 */
export async function startCertificationProcess(
  supabase: SupabaseClient,
  userId: string
): Promise<{ success: boolean; certificationId?: string; error?: string }> {
  const { data, error } = await supabase
    .from('consultant_certifications')
    .upsert({
      user_id: userId,
      status: 'in_training',
      training_started_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error starting certification:', error);
    return { success: false, error: error.message };
  }

  return { success: true, certificationId: data.id };
}

/**
 * Aggiorna progresso formazione
 */
export async function updateTrainingProgress(
  supabase: SupabaseClient,
  userId: string,
  modulesCompleted: number,
  modulesTotal?: number
): Promise<void> {
  const updateData: any = {
    training_modules_completed: modulesCompleted,
    updated_at: new Date().toISOString(),
  };

  if (modulesTotal !== undefined) {
    updateData.training_modules_total = modulesTotal;
  }

  await supabase
    .from('consultant_certifications')
    .update(updateData)
    .eq('user_id', userId);
}

/**
 * Completa la formazione e passa a exam_pending
 */
export async function completeTraining(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await supabase
    .from('consultant_certifications')
    .update({
      status: 'exam_pending',
      training_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('status', 'in_training');
}

/**
 * Registra risultato esame
 */
export async function recordExamResult(
  supabase: SupabaseClient,
  userId: string,
  score: number
): Promise<{ passed: boolean; canRetry: boolean }> {
  const passed = score >= EXAM_PASSING_SCORE;

  // Ottieni stato attuale
  const { data: current } = await supabase
    .from('consultant_certifications')
    .select('exam_attempts, exam_max_attempts')
    .eq('user_id', userId)
    .single();

  if (!current) {
    return { passed: false, canRetry: false };
  }

  const newAttempts = current.exam_attempts + 1;
  const canRetry = newAttempts < current.exam_max_attempts;

  // Determina nuovo status
  let newStatus: CertificationStatus;
  if (passed) {
    newStatus = 'active';
  } else if (!canRetry) {
    newStatus = 'suspended';
  } else {
    newStatus = 'exam_pending';
  }

  await supabase
    .from('consultant_certifications')
    .update({
      exam_score: score,
      exam_attempts: newAttempts,
      exam_passed_at: passed ? new Date().toISOString() : null,
      status: newStatus,
      certified_at: passed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return { passed, canRetry: !passed && canRetry };
}

/**
 * Certifica manualmente un utente (admin)
 */
export async function certifyConsultant(
  supabase: SupabaseClient,
  userId: string,
  adminId: string,
  options: {
    level?: CertificationLevel;
    territory?: string;
    expiresAt?: string;
    skipExam?: boolean;
  } = {}
): Promise<{ success: boolean; certificationNumber?: string; error?: string }> {
  const { data, error } = await supabase
    .from('consultant_certifications')
    .upsert({
      user_id: userId,
      status: 'active',
      certification_level: options.level || 'base',
      certified_by: adminId,
      certified_at: new Date().toISOString(),
      territory: options.territory,
      expires_at: options.expiresAt,
      license_agreement_signed: true,
      license_agreement_signed_at: new Date().toISOString(),
      license_agreement_version: 'v1.0',
      // Se skip exam, imposta formazione completata
      ...(options.skipExam ? {
        training_completed_at: new Date().toISOString(),
        training_modules_completed: 10,
        exam_passed_at: new Date().toISOString(),
        exam_score: 100,
      } : {}),
    }, {
      onConflict: 'user_id',
    })
    .select('certification_number')
    .single();

  if (error) {
    console.error('Error certifying consultant:', error);
    return { success: false, error: error.message };
  }

  return { success: true, certificationNumber: data.certification_number };
}

/**
 * Sospende/Revoca una certificazione
 */
export async function updateCertificationStatus(
  supabase: SupabaseClient,
  userId: string,
  newStatus: 'suspended' | 'revoked' | 'expired',
  adminId: string,
  notes?: string
): Promise<void> {
  await supabase
    .from('consultant_certifications')
    .update({
      status: newStatus,
      notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

/**
 * Ottiene lista consulenti attivi (admin)
 */
export async function getActiveConsultants(
  supabase: SupabaseClient
): Promise<Array<{
  userId: string;
  fullName: string;
  email: string;
  certificationNumber: string;
  level: CertificationLevel;
  certifiedAt: string;
  territory: string | null;
}>> {
  const { data, error } = await supabase
    .from('consultant_certifications')
    .select(`
      user_id,
      certification_number,
      certification_level,
      certified_at,
      territory,
      profiles:user_id (full_name, email)
    `)
    .eq('status', 'active');

  if (error || !data) {
    return [];
  }

  return data.map((cert: any) => ({
    userId: cert.user_id,
    fullName: cert.profiles?.full_name || '',
    email: cert.profiles?.email || '',
    certificationNumber: cert.certification_number,
    level: cert.certification_level,
    certifiedAt: cert.certified_at,
    territory: cert.territory,
  }));
}

/**
 * Verifica requisiti per diventare consulente
 * Requisito: essere Mentor con almeno 2 percorsi completati
 */
export async function checkConsultantEligibility(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  isEligible: boolean;
  reasons: string[];
  missingRequirements: string[];
}> {
  const reasons: string[] = [];
  const missingRequirements: string[] = [];

  // 1. Verifica subscription tier (deve essere Mentor)
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (profile?.subscription_tier === 'mentor') {
    reasons.push('Subscription Mentor attiva');
  } else {
    missingRequirements.push('Subscription Mentor richiesta');
  }

  // 2. Verifica percorsi completati (almeno 2)
  const { data: pathways } = await supabase
    .from('user_pathways')
    .select('completed_at')
    .eq('user_id', userId)
    .not('completed_at', 'is', null);

  const completedCount = pathways?.length || 0;
  if (completedCount >= 2) {
    reasons.push(`${completedCount} percorsi completati`);
  } else {
    missingRequirements.push(`Completare almeno 2 percorsi (attualmente: ${completedCount})`);
  }

  // 3. Verifica non già in processo certificazione
  const { data: existing } = await supabase
    .from('consultant_certifications')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'active') {
      missingRequirements.push('Già consulente certificato');
    } else if (existing.status === 'revoked') {
      missingRequirements.push('Certificazione revocata - contattare supporto');
    }
  }

  return {
    isEligible: missingRequirements.length === 0,
    reasons,
    missingRequirements,
  };
}
