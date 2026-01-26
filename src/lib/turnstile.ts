/**
 * Cloudflare Turnstile Server-Side Verification
 *
 * Verifica token Turnstile lato server
 */

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export interface TurnstileResult {
  success: boolean;
  error?: string;
}

/**
 * Verifica un token Turnstile con l'API Cloudflare
 */
export async function verifyTurnstileToken(
  token: string,
  ip?: string
): Promise<TurnstileResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Se non configurato, bypass in development
  if (!secretKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Turnstile: TURNSTILE_SECRET_KEY non configurato, bypass in dev');
      return { success: true };
    }
    return { success: false, error: 'Turnstile non configurato' };
  }

  // Token bypass per development
  if (token === 'dev-bypass-token' && process.env.NODE_ENV === 'development') {
    return { success: true };
  }

  // Token mancante
  if (!token) {
    return { success: false, error: 'Token Turnstile mancante' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (ip) {
      formData.append('remoteip', ip);
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const data: TurnstileVerifyResponse = await response.json();

    if (data.success) {
      return { success: true };
    }

    // Log errori per debug
    console.warn('Turnstile verification failed:', data['error-codes']);

    return {
      success: false,
      error: data['error-codes']?.join(', ') || 'Verifica fallita',
    };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Errore di verifica' };
  }
}

/**
 * Helper per risposta Turnstile fallita
 */
export function turnstileFailedResponse(error?: string): Response {
  return new Response(
    JSON.stringify({
      error: error || 'Verifica di sicurezza fallita. Ricarica la pagina e riprova.',
    }),
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
