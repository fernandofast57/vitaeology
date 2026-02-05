/**
 * Configurazione centralizzata per le 3 challenge.
 * Colori in hex per evitare classi Tailwind dinamiche (non rilevate al build time).
 */

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

/** Challenge URL slug → assessment URL slug */
export const CHALLENGE_TO_ASSESSMENT: Record<string, string> = {
  leadership: 'leadership',
  ostacoli: 'risolutore',
  microfelicita: 'microfelicita',
};

/** Challenge URL slug → libro URL slug */
export const CHALLENGE_TO_LIBRO: Record<string, string> = {
  leadership: 'leadership',
  ostacoli: 'risolutore',
  microfelicita: 'microfelicita',
};

/** Libro URL slug → challenge DB value */
export const LIBRO_TO_CHALLENGE_DB: Record<string, string> = {
  leadership: 'leadership-autentica',
  risolutore: 'oltre-ostacoli',
  microfelicita: 'microfelicita',
};

export const VALID_CHALLENGE_TYPES = ['leadership', 'ostacoli', 'microfelicita'] as const;

/**
 * Challenge URL/frontend slug → Database value
 * Gestisce sia slug frontend che valori DB già corretti
 */
export const CHALLENGE_TYPE_MAP: Record<string, string> = {
  'leadership': 'leadership-autentica',
  'leadership-autentica': 'leadership-autentica',
  'ostacoli': 'oltre-ostacoli',
  'oltre-ostacoli': 'oltre-ostacoli',
  'microfelicita': 'microfelicita',
};

/** Database value → Display name */
export const CHALLENGE_DB_TO_NAME: Record<string, string> = {
  'leadership-autentica': 'Leadership Autentica',
  'oltre-ostacoli': 'Oltre gli Ostacoli',
  'microfelicita': 'Microfelicità',
};

/** Database value → Discovery type */
export const CHALLENGE_DB_TO_DISCOVERY: Record<string, string> = {
  'leadership-autentica': 'leadership',
  'oltre-ostacoli': 'ostacoli',
  'microfelicita': 'microfelicita',
};

/** Normalize any challenge type input to DB value */
export function normalizeChallengeType(type: string): string | null {
  return CHALLENGE_TYPE_MAP[type] || null;
}

export function isValidChallengeType(type: string): boolean {
  return (VALID_CHALLENGE_TYPES as readonly string[]).includes(type);
}

export function getChallengeColors(type: string): ChallengeColorConfig {
  return CHALLENGE_COLORS[type] || CHALLENGE_COLORS.leadership;
}
