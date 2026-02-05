/**
 * Configurazione centralizzata per le 3 challenge.
 * Colori in hex per evitare classi Tailwind dinamiche (non rilevate al build time).
 *
 * NOTA: Per mappature tra slug (frontend, DB, challenge), usa src/lib/path-mappings.ts
 */

import {
  FRONTEND_TO_DATABASE,
  DATABASE_TO_CHALLENGE_DB,
  FRONTEND_TO_CHALLENGE_DB,
  CHALLENGE_DB_DISPLAY_NAMES,
  CHALLENGE_DB_TO_FRONTEND,
  toChallengeDbValue,
  isValidFrontendSlug,
  ALL_FRONTEND_SLUGS,
  type FrontendSlug,
} from '@/lib/path-mappings';

export interface ChallengeColorConfig {
  name: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  badgeColor: string;
}

export const CHALLENGE_COLORS: Record<string, ChallengeColorConfig> = {
  leadership: {
    name: 'Leadership Autentica',
    gradientFrom: '#78350F', // amber-900
    gradientTo: '#0F172A',   // slate-900
    accentColor: '#F59E0B',  // amber-500
    badgeColor: '#FBBF24',   // amber-400
  },
  ostacoli: {
    name: 'Oltre gli Ostacoli',
    gradientFrom: '#064E3B', // emerald-900
    gradientTo: '#0F172A',   // slate-900
    accentColor: '#10B981',  // emerald-500
    badgeColor: '#34D399',   // emerald-400
  },
  microfelicita: {
    name: 'Microfelicità',
    gradientFrom: '#4C1D95', // violet-900
    gradientTo: '#0F172A',   // slate-900
    accentColor: '#8B5CF6',  // violet-500
    badgeColor: '#A78BFA',   // violet-400
  },
};

/** Challenge URL slug → assessment URL slug (re-export from path-mappings) */
export const CHALLENGE_TO_ASSESSMENT = FRONTEND_TO_DATABASE;

/** Challenge URL slug → libro URL slug (re-export from path-mappings) */
export const CHALLENGE_TO_LIBRO = FRONTEND_TO_DATABASE;

/** Libro URL slug → challenge DB value (re-export from path-mappings) */
export const LIBRO_TO_CHALLENGE_DB = DATABASE_TO_CHALLENGE_DB;

export const VALID_CHALLENGE_TYPES = ALL_FRONTEND_SLUGS;

/**
 * Challenge URL/frontend slug → Database value
 * Gestisce sia slug frontend che valori DB già corretti
 */
export const CHALLENGE_TYPE_MAP: Record<string, string> = {
  ...FRONTEND_TO_CHALLENGE_DB,
  // Valori DB passano attraverso invariati
  'leadership-autentica': 'leadership-autentica',
  'oltre-ostacoli': 'oltre-ostacoli',
};

/** Database value → Display name (re-export from path-mappings) */
export const CHALLENGE_DB_TO_NAME = CHALLENGE_DB_DISPLAY_NAMES;

/** Database value → Discovery type (= frontend slug) */
export const CHALLENGE_DB_TO_DISCOVERY = CHALLENGE_DB_TO_FRONTEND;

/**
 * Safe lookup for challenge DB → discovery type (for runtime use with unknown strings)
 * Returns null if not found
 */
export function getChallengeDiscoveryType(challengeDbValue: string): FrontendSlug | null {
  return (CHALLENGE_DB_TO_DISCOVERY as Record<string, FrontendSlug>)[challengeDbValue] ?? null;
}

/**
 * Safe lookup for challenge DB → display name (for runtime use with unknown strings)
 * Returns the input if not found
 */
export function getChallengeDisplayName(challengeDbValue: string): string {
  return (CHALLENGE_DB_TO_NAME as Record<string, string>)[challengeDbValue] ?? challengeDbValue;
}

/** Normalize any challenge type input to DB value */
export function normalizeChallengeType(type: string): string | null {
  return toChallengeDbValue(type);
}

export function isValidChallengeType(type: string): boolean {
  return isValidFrontendSlug(type);
}

export function getChallengeColors(type: string): ChallengeColorConfig {
  return CHALLENGE_COLORS[type as FrontendSlug] || CHALLENGE_COLORS.leadership;
}

/**
 * Safe lookup for challenge type → libro slug (for runtime use with unknown strings)
 * Returns 'leadership' as fallback
 */
export function getChallengeLibroSlug(challengeType: string): string {
  return (CHALLENGE_TO_LIBRO as Record<string, string>)[challengeType] ?? 'leadership';
}

/**
 * Safe lookup for challenge type → assessment slug (for runtime use with unknown strings)
 * Returns 'leadership' as fallback
 */
export function getChallengeAssessmentSlug(challengeType: string): string {
  return (CHALLENGE_TO_ASSESSMENT as Record<string, string>)[challengeType] ?? 'leadership';
}

/**
 * Safe lookup for libro slug → challenge DB value (for runtime use with unknown strings)
 * Returns null if not found
 */
export function getLibroChallengeDbValue(libroSlug: string): string | null {
  return (LIBRO_TO_CHALLENGE_DB as Record<string, string>)[libroSlug] ?? null;
}
