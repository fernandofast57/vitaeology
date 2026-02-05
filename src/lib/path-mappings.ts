/**
 * ============================================================================
 * PATH MAPPINGS - FONTE UNICA DI VERITÀ
 * ============================================================================
 *
 * ⚠️  ATTENZIONE: NON CREARE MAI MAPPATURE LOCALI IN ALTRI FILE!
 * ⚠️  IMPORTARE SEMPRE DA QUESTO FILE PER QUALSIASI CONVERSIONE SLUG/PATH.
 *
 * Questo file centralizza TUTTE le mappature tra i diversi nomi usati
 * per i 3 percorsi Vitaeology.
 *
 * CONTESTO - Il percorso "Oltre gli Ostacoli" usa nomi diversi:
 * ┌─────────────────────┬──────────────────┬─────────────────────────────────┐
 * │ Contesto            │ Slug             │ Dove si usa                     │
 * ├─────────────────────┼──────────────────┼─────────────────────────────────┤
 * │ Frontend URLs       │ 'ostacoli'       │ /challenge/ostacoli, dashboard  │
 * │ Database            │ 'risolutore'     │ assessment_type, libro slug     │
 * │ Challenge DB        │ 'oltre-ostacoli' │ challenge_subscribers.challenge │
 * │ RAG (legacy)        │ 'problemi'       │ book_chunks.current_path        │
 * └─────────────────────┴──────────────────┴─────────────────────────────────┘
 *
 * COME USARE:
 * ```typescript
 * // ✅ CORRETTO - Importa da qui
 * import { FRONTEND_TO_DATABASE, toFrontendSlug } from '@/lib/path-mappings';
 *
 * // ❌ SBAGLIATO - Mai fare così!
 * const localMap = { ostacoli: 'risolutore' };
 * ```
 *
 * Documentazione completa: CLAUDE.md sezione "PATH/SLUG NAMING CONVENTIONS"
 */

// ============================================================
// TYPES
// ============================================================

/** Slug usati nelle URL frontend (challenge, dashboard) */
export type FrontendSlug = 'leadership' | 'ostacoli' | 'microfelicita';

/** Slug usati nel database (assessment_type, libro, esercizi) */
export type DatabaseSlug = 'leadership' | 'risolutore' | 'microfelicita';

/** Valori usati in challenge_subscribers.challenge */
export type ChallengeDbValue = 'leadership-autentica' | 'oltre-ostacoli' | 'microfelicita';

/** Valori legacy usati in RAG e vecchi schemi */
export type LegacyPathType = 'leadership' | 'problemi' | 'benessere';

/** Unione di tutti i possibili slug/valori */
export type AnyPathSlug = FrontendSlug | DatabaseSlug | ChallengeDbValue | LegacyPathType;

// ============================================================
// CANONICAL DEFINITIONS (Fonte di Verità)
// ============================================================

/**
 * Definizione canonica di ogni percorso con tutti i suoi nomi
 */
export interface PathDefinition {
  /** Nome visualizzato all'utente */
  displayName: string;
  /** Slug per URL frontend (challenge, dashboard) */
  frontendSlug: FrontendSlug;
  /** Slug per database (assessment_type, libro, esercizi) */
  databaseSlug: DatabaseSlug;
  /** Valore in challenge_subscribers.challenge */
  challengeDbValue: ChallengeDbValue;
  /** Valore legacy (RAG, vecchi schemi) */
  legacyPath: LegacyPathType;
  /** Colore primario del percorso */
  color: string;
  /** Titolo del libro associato */
  bookTitle: string;
}

/**
 * I 3 percorsi con tutte le loro definizioni
 */
export const PATH_DEFINITIONS: Record<string, PathDefinition> = {
  leadership: {
    displayName: 'Leadership Autentica',
    frontendSlug: 'leadership',
    databaseSlug: 'leadership',
    challengeDbValue: 'leadership-autentica',
    legacyPath: 'leadership',
    color: '#D4AF37',
    bookTitle: 'Leadership Autentica',
  },
  ostacoli: {
    displayName: 'Oltre gli Ostacoli',
    frontendSlug: 'ostacoli',
    databaseSlug: 'risolutore',
    challengeDbValue: 'oltre-ostacoli',
    legacyPath: 'problemi',
    color: '#10B981',
    bookTitle: 'Oltre gli Ostacoli',
  },
  microfelicita: {
    displayName: 'Microfelicità Digitale',
    frontendSlug: 'microfelicita',
    databaseSlug: 'microfelicita',
    challengeDbValue: 'microfelicita',
    legacyPath: 'benessere',
    color: '#8B5CF6',
    bookTitle: 'Microfelicità Digitale',
  },
};

// ============================================================
// LOOKUP MAPS (Generated from PATH_DEFINITIONS)
// ============================================================

/** Frontend slug → Path definition */
export const BY_FRONTEND_SLUG: Record<FrontendSlug, PathDefinition> = {
  leadership: PATH_DEFINITIONS.leadership,
  ostacoli: PATH_DEFINITIONS.ostacoli,
  microfelicita: PATH_DEFINITIONS.microfelicita,
};

/** Database slug → Path definition */
export const BY_DATABASE_SLUG: Record<DatabaseSlug, PathDefinition> = {
  leadership: PATH_DEFINITIONS.leadership,
  risolutore: PATH_DEFINITIONS.ostacoli,
  microfelicita: PATH_DEFINITIONS.microfelicita,
};

/** Challenge DB value → Path definition */
export const BY_CHALLENGE_DB: Record<ChallengeDbValue, PathDefinition> = {
  'leadership-autentica': PATH_DEFINITIONS.leadership,
  'oltre-ostacoli': PATH_DEFINITIONS.ostacoli,
  'microfelicita': PATH_DEFINITIONS.microfelicita,
};

/** Legacy path → Path definition */
export const BY_LEGACY_PATH: Record<LegacyPathType, PathDefinition> = {
  leadership: PATH_DEFINITIONS.leadership,
  problemi: PATH_DEFINITIONS.ostacoli,
  benessere: PATH_DEFINITIONS.microfelicita,
};

// ============================================================
// CONVERSION FUNCTIONS
// ============================================================

/**
 * Trova la definizione del percorso da qualsiasi slug/valore
 */
export function getPathDefinition(anySlug: string): PathDefinition | null {
  // Try each lookup map
  if (anySlug in BY_FRONTEND_SLUG) return BY_FRONTEND_SLUG[anySlug as FrontendSlug];
  if (anySlug in BY_DATABASE_SLUG) return BY_DATABASE_SLUG[anySlug as DatabaseSlug];
  if (anySlug in BY_CHALLENGE_DB) return BY_CHALLENGE_DB[anySlug as ChallengeDbValue];
  if (anySlug in BY_LEGACY_PATH) return BY_LEGACY_PATH[anySlug as LegacyPathType];
  return null;
}

/**
 * Converte qualsiasi slug nel frontend slug corrispondente
 */
export function toFrontendSlug(anySlug: string): FrontendSlug | null {
  const def = getPathDefinition(anySlug);
  return def?.frontendSlug ?? null;
}

/**
 * Converte qualsiasi slug nel database slug corrispondente
 */
export function toDatabaseSlug(anySlug: string): DatabaseSlug | null {
  const def = getPathDefinition(anySlug);
  return def?.databaseSlug ?? null;
}

/**
 * Converte qualsiasi slug nel valore challenge DB corrispondente
 */
export function toChallengeDbValue(anySlug: string): ChallengeDbValue | null {
  const def = getPathDefinition(anySlug);
  return def?.challengeDbValue ?? null;
}

/**
 * Converte qualsiasi slug nel legacy path corrispondente
 */
export function toLegacyPath(anySlug: string): LegacyPathType | null {
  const def = getPathDefinition(anySlug);
  return def?.legacyPath ?? null;
}

/**
 * Ottiene il nome visualizzato da qualsiasi slug
 */
export function getDisplayName(anySlug: string): string {
  const def = getPathDefinition(anySlug);
  return def?.displayName ?? anySlug;
}

/**
 * Ottiene il colore da qualsiasi slug
 */
export function getPathColor(anySlug: string): string {
  const def = getPathDefinition(anySlug);
  return def?.color ?? '#6B7280'; // gray-500 as fallback
}

/**
 * Ottiene il titolo del libro da qualsiasi slug
 */
export function getBookTitle(anySlug: string): string {
  const def = getPathDefinition(anySlug);
  return def?.bookTitle ?? anySlug;
}

// ============================================================
// DIRECT LOOKUP MAPS (for backward compatibility)
// ============================================================

/** Frontend slug → Database slug (assessment_type, libro slug) */
export const FRONTEND_TO_DATABASE: Record<FrontendSlug, DatabaseSlug> = {
  leadership: 'leadership',
  ostacoli: 'risolutore',
  microfelicita: 'microfelicita',
};

/** Database slug → Frontend slug */
export const DATABASE_TO_FRONTEND: Record<DatabaseSlug, FrontendSlug> = {
  leadership: 'leadership',
  risolutore: 'ostacoli',
  microfelicita: 'microfelicita',
};

/** Frontend slug → Challenge DB value */
export const FRONTEND_TO_CHALLENGE_DB: Record<FrontendSlug, ChallengeDbValue> = {
  leadership: 'leadership-autentica',
  ostacoli: 'oltre-ostacoli',
  microfelicita: 'microfelicita',
};

/** Challenge DB value → Frontend slug */
export const CHALLENGE_DB_TO_FRONTEND: Record<ChallengeDbValue, FrontendSlug> = {
  'leadership-autentica': 'leadership',
  'oltre-ostacoli': 'ostacoli',
  'microfelicita': 'microfelicita',
};

/** Challenge DB value → Database slug */
export const CHALLENGE_DB_TO_DATABASE: Record<ChallengeDbValue, DatabaseSlug> = {
  'leadership-autentica': 'leadership',
  'oltre-ostacoli': 'risolutore',
  'microfelicita': 'microfelicita',
};

/** Database slug → Challenge DB value */
export const DATABASE_TO_CHALLENGE_DB: Record<DatabaseSlug, ChallengeDbValue> = {
  leadership: 'leadership-autentica',
  risolutore: 'oltre-ostacoli',
  microfelicita: 'microfelicita',
};

/** Legacy path → Database slug */
export const LEGACY_TO_DATABASE: Record<LegacyPathType, DatabaseSlug> = {
  leadership: 'leadership',
  problemi: 'risolutore',
  benessere: 'microfelicita',
};

/** Database slug → Legacy path */
export const DATABASE_TO_LEGACY: Record<DatabaseSlug, LegacyPathType> = {
  leadership: 'leadership',
  risolutore: 'problemi',
  microfelicita: 'benessere',
};

// ============================================================
// DISPLAY NAMES (Direct maps for convenience)
// ============================================================

/** Frontend slug → Display name */
export const FRONTEND_DISPLAY_NAMES: Record<FrontendSlug, string> = {
  leadership: 'Leadership Autentica',
  ostacoli: 'Oltre gli Ostacoli',
  microfelicita: 'Microfelicità Digitale',
};

/** Database slug → Display name */
export const DATABASE_DISPLAY_NAMES: Record<DatabaseSlug, string> = {
  leadership: 'Leadership Autentica',
  risolutore: 'Oltre gli Ostacoli',
  microfelicita: 'Microfelicità Digitale',
};

/** Challenge DB → Display name */
export const CHALLENGE_DB_DISPLAY_NAMES: Record<ChallengeDbValue, string> = {
  'leadership-autentica': 'Leadership Autentica',
  'oltre-ostacoli': 'Oltre gli Ostacoli',
  'microfelicita': 'Microfelicità Digitale',
};

// ============================================================
// COLORS (Direct maps for convenience)
// ============================================================

/** Frontend slug → Color */
export const FRONTEND_COLORS: Record<FrontendSlug, string> = {
  leadership: '#D4AF37',
  ostacoli: '#10B981',
  microfelicita: '#8B5CF6',
};

/** Database slug → Color */
export const DATABASE_COLORS: Record<DatabaseSlug, string> = {
  leadership: '#D4AF37',
  risolutore: '#10B981',
  microfelicita: '#8B5CF6',
};

// ============================================================
// VALIDATION HELPERS
// ============================================================

/** Verifica se è un frontend slug valido */
export function isValidFrontendSlug(slug: string): slug is FrontendSlug {
  return slug in BY_FRONTEND_SLUG;
}

/** Verifica se è un database slug valido */
export function isValidDatabaseSlug(slug: string): slug is DatabaseSlug {
  return slug in BY_DATABASE_SLUG;
}

/** Verifica se è un challenge DB value valido */
export function isValidChallengeDbValue(value: string): value is ChallengeDbValue {
  return value in BY_CHALLENGE_DB;
}

/** Verifica se è un legacy path valido */
export function isValidLegacyPath(path: string): path is LegacyPathType {
  return path in BY_LEGACY_PATH;
}

/** Verifica se è qualsiasi tipo di path slug valido */
export function isValidPathSlug(slug: string): boolean {
  return getPathDefinition(slug) !== null;
}

// ============================================================
// LISTS (for iterations)
// ============================================================

export const ALL_FRONTEND_SLUGS: FrontendSlug[] = ['leadership', 'ostacoli', 'microfelicita'];
export const ALL_DATABASE_SLUGS: DatabaseSlug[] = ['leadership', 'risolutore', 'microfelicita'];
export const ALL_CHALLENGE_DB_VALUES: ChallengeDbValue[] = ['leadership-autentica', 'oltre-ostacoli', 'microfelicita'];
export const ALL_LEGACY_PATHS: LegacyPathType[] = ['leadership', 'problemi', 'benessere'];

// ============================================================
// SAFE ACCESSORS (for runtime string indexing)
// ============================================================

/**
 * Safe lookup for database slug → display name (for runtime use with unknown strings)
 * Returns the input if not found
 */
export function getDatabaseDisplayName(slug: string): string {
  return (DATABASE_DISPLAY_NAMES as Record<string, string>)[slug] ?? slug;
}
