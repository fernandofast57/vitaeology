/**
 * Intelligent Name Validator
 *
 * Rileva nomi spam/gibberish senza bloccare nomi reali insoliti.
 * Usa un sistema di scoring (0-100) dove 100 = sicuramente spam.
 *
 * IMPORTANTE: MAI bloccare nomi corti, stranieri, con accenti o apostrofi.
 * Target: SOLO stringhe gibberish evidenti tipo "Qjkdflsjflksdjf"
 */

export interface NameValidationResult {
  valid: boolean;
  reason?: string;
  suspicionScore: number;
  flags: string[];
}

// Pattern di nomi spam noti
const KNOWN_SPAM_NAMES = new Set([
  'visitatore',
  'guest',
  'user',
  'test',
  'admin',
  'root',
  'anonymous',
  'anonimo',
]);

// Vocali per calcolo rapporto consonanti/vocali
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'à', 'è', 'é', 'ì', 'ò', 'ù']);

/**
 * Conta consonanti consecutive massime in una stringa
 */
function maxConsecutiveConsonants(str: string): number {
  let maxCount = 0;
  let currentCount = 0;

  for (const char of str.toLowerCase()) {
    if (/[a-zàèéìòù]/i.test(char) && !VOWELS.has(char)) {
      currentCount++;
      maxCount = Math.max(maxCount, currentCount);
    } else {
      currentCount = 0;
    }
  }

  return maxCount;
}

/**
 * Calcola rapporto consonanti/vocali
 */
function consonantVowelRatio(str: string): number {
  let consonants = 0;
  let vowels = 0;

  for (const char of str.toLowerCase()) {
    if (/[a-zàèéìòù]/i.test(char)) {
      if (VOWELS.has(char)) {
        vowels++;
      } else {
        consonants++;
      }
    }
  }

  if (vowels === 0) return consonants > 0 ? 999 : 0;
  return consonants / vowels;
}

/**
 * Verifica pattern nome italiano (finisce in vocale)
 */
function hasItalianNamePattern(str: string): boolean {
  const words = str.trim().toLowerCase().split(/\s+/);
  // Molti nomi italiani finiscono in vocale
  return words.some(word => word.length > 2 && VOWELS.has(word[word.length - 1]));
}

/**
 * Verifica se sembra un nome reale (ha maiuscola iniziale per parola)
 */
function hasProperCapitalization(str: string): boolean {
  const words = str.trim().split(/\s+/);
  return words.every(word => {
    if (word.length === 0) return true;
    // Prima lettera maiuscola, resto minuscolo (o tutto maiuscolo per acronimi)
    return /^[A-ZÀÈÉÌÒÙ][a-zàèéìòù]*$/.test(word) || /^[A-ZÀÈÉÌÒÙ]+$/.test(word);
  });
}

/**
 * Valida un nome e restituisce un punteggio di sospetto (0-100)
 *
 * @param name Il nome da validare
 * @returns { valid, reason, suspicionScore, flags }
 *
 * SOGLIE:
 * - score >= 70: BLOCCA (quasi certamente spam)
 * - score 40-69: ACCETTA ma FLAGGA per review
 * - score < 40: ACCETTA normalmente
 */
export function validateName(name: string | null | undefined): NameValidationResult {
  const flags: string[] = [];
  let score = 0;

  // Nome vuoto/null è accettabile (campo opzionale)
  if (!name || name.trim().length === 0) {
    return { valid: true, suspicionScore: 0, flags: [] };
  }

  const trimmed = name.trim();
  const normalized = trimmed.toLowerCase();

  // === FATTORI CHE AUMENTANO SOSPETTO ===

  // 1. Match esatto con nomi spam noti (+40)
  if (KNOWN_SPAM_NAMES.has(normalized)) {
    score += 40;
    flags.push('known_spam_name');
  }

  // 2. Solo consonanti consecutive (>5): +35
  const maxConsonants = maxConsecutiveConsonants(trimmed);
  if (maxConsonants > 5) {
    score += 35;
    flags.push(`consecutive_consonants_${maxConsonants}`);
  } else if (maxConsonants > 4) {
    score += 20;
    flags.push(`consecutive_consonants_${maxConsonants}`);
  }

  // 3. Nessuno spazio E lunghezza > 20: +30
  if (!trimmed.includes(' ') && trimmed.length > 20) {
    score += 30;
    flags.push('long_single_word');
  }

  // 4. Rapporto consonanti/vocali > 4:1: +25
  const cvRatio = consonantVowelRatio(trimmed);
  if (cvRatio > 4) {
    score += 25;
    flags.push(`high_cv_ratio_${cvRatio.toFixed(1)}`);
  } else if (cvRatio > 3) {
    score += 15;
    flags.push(`elevated_cv_ratio_${cvRatio.toFixed(1)}`);
  }

  // 5. Stringa casuale: solo lettere, nessuno spazio, lunghezza > 15: +25
  if (/^[a-zA-Z]+$/.test(trimmed) && !trimmed.includes(' ') && trimmed.length > 15) {
    score += 25;
    flags.push('random_letter_string');
  }

  // 6. Nessuna maiuscola (nomi reali di solito hanno maiuscola): +10
  if (!/[A-ZÀÈÉÌÒÙ]/.test(trimmed)) {
    score += 10;
    flags.push('no_capital_letters');
  }

  // 7. Caratteri ripetuti (aaaa, xxxx): +20
  if (/(.)\1{3,}/.test(trimmed)) {
    score += 20;
    flags.push('repeated_chars');
  }

  // 8. Solo numeri mescolati con lettere in modo sospetto: +15
  if (/\d/.test(trimmed) && /[a-zA-Z].*\d|\d.*[a-zA-Z]/.test(trimmed)) {
    // Ma non penalizzare nomi legittimi come "Giovanni 2°" o "III"
    if (!/^[IVXLCDM]+$/.test(trimmed.replace(/[^IVXLCDM]/gi, ''))) {
      score += 15;
      flags.push('mixed_numbers');
    }
  }

  // === FATTORI CHE DIMINUISCONO SOSPETTO ===

  // 1. Contiene spazio (nome + cognome): -20
  if (trimmed.includes(' ')) {
    score -= 20;
    flags.push('has_space');
  }

  // 2. Lunghezza ragionevole (2-40 caratteri): -10
  if (trimmed.length >= 2 && trimmed.length <= 40) {
    score -= 10;
    flags.push('reasonable_length');
  }

  // 3. Pattern nome italiano (finisce in vocale): -15
  if (hasItalianNamePattern(trimmed)) {
    score -= 15;
    flags.push('italian_pattern');
  }

  // 4. Capitalizzazione corretta: -10
  if (hasProperCapitalization(trimmed)) {
    score -= 10;
    flags.push('proper_capitalization');
  }

  // 5. Contiene apostrofo o trattino (O'Brien, Mary-Jane): -10
  if (/['\-]/.test(trimmed)) {
    score -= 10;
    flags.push('has_apostrophe_or_hyphen');
  }

  // 6. Contiene caratteri accentati (nomi europei): -5
  if (/[àèéìòùäëïöüâêîôûñç]/i.test(trimmed)) {
    score -= 5;
    flags.push('has_accents');
  }

  // Normalizza score tra 0 e 100
  score = Math.max(0, Math.min(100, score));

  // Determina validità basata su soglia
  const valid = score < 70;
  let reason: string | undefined;

  if (!valid) {
    reason = 'Il nome inserito non sembra valido. Usa il tuo nome reale.';
  }

  return { valid, reason, suspicionScore: score, flags };
}

/**
 * Helper per determinare se un nome dovrebbe essere flaggato per review
 * (non bloccato, ma monitorato)
 */
export function shouldFlagForReview(result: NameValidationResult): boolean {
  return result.suspicionScore >= 40 && result.suspicionScore < 70;
}

/**
 * Helper per determinare se un nome è sicuramente spam
 */
export function isDefinitelySpam(result: NameValidationResult): boolean {
  return result.suspicionScore >= 70;
}
