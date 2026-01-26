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
 * Rileva email spam con pattern tipici
 * Pattern: molti punti singoli nella parte locale (es. a.b.c.d.e@gmail.com)
 */
export function isSpamEmail(email: string): boolean {
  const localPart = email.split('@')[0];

  // Conta i punti nella parte locale
  const dots = (localPart.match(/\./g) || []).length;

  // Se ha 4+ punti, probabilmente è spam
  if (dots >= 4) {
    return true;
  }

  // Pattern: sequenze di singole lettere separate da punti (a.b.c.d)
  const singleLetterPattern = /^([a-z]\.){3,}/i;
  if (singleLetterPattern.test(localPart)) {
    return true;
  }

  return false;
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
