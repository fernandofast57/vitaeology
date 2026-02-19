/**
 * Token JWT per download protetto dei libri
 *
 * Genera e verifica token firmati con scadenza (default 24h)
 * usati nei link email post-acquisto.
 */

import { SignJWT, jwtVerify } from 'jose';

interface DownloadTokenPayload {
  email: string;
  name: string;
  bookSlug: string;
}

interface GenerateTokenOptions extends DownloadTokenPayload {
  expiresInSeconds?: number;
}

const DEFAULT_EXPIRY = 24 * 60 * 60; // 24 ore

function getSigningKey(): Uint8Array {
  // Usa chiave dedicata per firma PDF, con fallback a CRON_SECRET per retrocompatibilità
  const secret = process.env.PDF_SIGNING_KEY || process.env.CRON_SECRET;
  if (!secret) {
    throw new Error('PDF_SIGNING_KEY (o CRON_SECRET) non configurato');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Genera un JWT firmato per il download di un libro
 */
export async function generateDownloadToken({
  email,
  name,
  bookSlug,
  expiresInSeconds = DEFAULT_EXPIRY,
}: GenerateTokenOptions): Promise<string> {
  const token = await new SignJWT({
    name,
    book: bookSlug,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(getSigningKey());

  return token;
}

/**
 * Verifica un token di download e restituisce il payload
 * Restituisce null se il token è invalido o scaduto
 */
export async function verifyDownloadToken(
  token: string
): Promise<DownloadTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSigningKey());

    const email = payload.sub;
    const name = payload.name as string | undefined;
    const bookSlug = payload.book as string | undefined;

    if (!email || !bookSlug) {
      return null;
    }

    return {
      email,
      name: name || '',
      bookSlug,
    };
  } catch {
    // Token scaduto o invalido
    return null;
  }
}
