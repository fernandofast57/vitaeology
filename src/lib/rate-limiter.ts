/**
 * Simple in-memory rate limiter for API protection
 *
 * Limita richieste per IP per prevenire spam bot
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store in-memory (per istanza serverless)
// Per produzione scalabile, considera Redis
const rateLimitStore = new Map<string, RateLimitEntry>();

// Pulisci entries scadute ogni 5 minuti
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Numero massimo di richieste nella finestra */
  maxRequests: number;
  /** Finestra temporale in secondi */
  windowSeconds: number;
  /** Identificatore per distinguere diversi limiter */
  identifier: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // secondi
}

/**
 * Verifica e aggiorna il rate limit per un IP
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.identifier}:${ip}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = rateLimitStore.get(key);

  // Se non esiste o è scaduto, crea nuovo
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowSeconds,
    };
  }

  // Incrementa contatore
  entry.count++;

  // Verifica limite
  if (entry.count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Estrai IP dalla request
 */
export function getClientIP(request: Request): string {
  // Vercel/Cloudflare headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Cloudflare
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }

  return 'unknown';
}

/**
 * Rate limit preconfigurati per diversi endpoint
 */
export const RATE_LIMITS = {
  // Form pubbliche: 5 richieste per minuto
  publicForm: {
    maxRequests: 5,
    windowSeconds: 60,
    identifier: 'public-form',
  },
  // Challenge subscribe: 10 richieste per minuto (evita falsi positivi su 3 landing)
  challengeSubscribe: {
    maxRequests: 10,
    windowSeconds: 60,
    identifier: 'challenge-subscribe',
  },
  // API generiche: 30 richieste per minuto
  api: {
    maxRequests: 30,
    windowSeconds: 60,
    identifier: 'api',
  },
  // Auth: 10 tentativi per 15 minuti
  auth: {
    maxRequests: 10,
    windowSeconds: 900,
    identifier: 'auth',
  },
} as const;

/**
 * Helper per creare risposta rate limit exceeded
 */
export function rateLimitExceededResponse(resetIn: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Troppe richieste. Riprova più tardi.',
      retryAfter: resetIn,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(resetIn),
      },
    }
  );
}

/**
 * Domini email temporanei/disposable comuni
 * Usati per registrazioni spam
 */
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.org',
  '10minutemail.com', '10minutemail.net', 'mailinator.com', 'maildrop.cc',
  'throwaway.email', 'fakeinbox.com', 'trashmail.com', 'getnada.com',
  'mohmal.com', 'tempail.com', 'emailondeck.com', 'dispostable.com',
  'yopmail.com', 'sharklasers.com', 'grr.la', 'guerrillamailblock.com',
  'pokemail.net', 'spam4.me', 'trash-mail.com', 'mytemp.email',
  'tmpmail.org', 'tmpmail.net', 'tempr.email', 'discard.email',
  'mailnesia.com', 'spamgourmet.com', 'mintemail.com', 'tempinbox.com'
]);

/**
 * Valida il formato email (RFC 5322 semplificato)
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  // Trim e lowercase
  const trimmed = email.trim().toLowerCase();

  // Lunghezza ragionevole
  if (trimmed.length < 5 || trimmed.length > 254) return false;

  // Regex RFC 5322 semplificata
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return false;

  const [localPart, domain] = trimmed.split('@');

  // Validazioni parte locale
  if (!localPart || localPart.length > 64) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false;

  // Validazioni dominio
  if (!domain || domain.length < 3) return false;
  if (domain.startsWith('.') || domain.startsWith('-')) return false;
  if (domain.includes('..')) return false;

  return true;
}

/**
 * Rileva email spam con pattern tipici
 * Pattern da CLAUDE.md: più di 3 punti nella parte locale + meno di 15 lettere
 */
export function isSpamEmail(email: string): boolean {
  if (!email) return true;

  const trimmed = email.trim().toLowerCase();
  const [localPart, domain] = trimmed.split('@');

  if (!localPart || !domain) return true;

  // 1. Blocca domini disposable
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return true;
  }

  // 2. Pattern CLAUDE.md: più di 3 punti E meno di 15 lettere
  const dots = (localPart.match(/\./g) || []).length;
  const letters = localPart.replace(/[^a-zA-Z]/g, '').length;

  if (dots > 3 && letters < 15) {
    return true;
  }

  // 3. Pattern: sequenze di singole lettere separate da punti (a.b.c.d)
  const singleLetterPattern = /^([a-z]\.){3,}/i;
  if (singleLetterPattern.test(localPart)) {
    return true;
  }

  // 4. Punti consecutivi o malformati
  if (localPart.includes('..')) {
    return true;
  }

  // 5. Pattern sospetto: 3 punti con pochissime lettere
  if (dots >= 3 && letters < 10) {
    return true;
  }

  // 6. Troppi punti in generale (6+) indipendentemente dalle lettere
  if (dots >= 6) {
    return true;
  }

  return false;
}

/**
 * Validazione email completa (formato + spam)
 * Restituisce { valid: boolean, reason?: string }
 */
export function validateEmail(email: string): { valid: boolean; reason?: string } {
  if (!isValidEmailFormat(email)) {
    return { valid: false, reason: 'Formato email non valido' };
  }

  if (isSpamEmail(email)) {
    return { valid: false, reason: 'Email non accettata' };
  }

  return { valid: true };
}

/**
 * Helper per creare risposta spam detected
 */
export function spamEmailResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Email non valida. Usa un indirizzo email reale.',
    }),
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
