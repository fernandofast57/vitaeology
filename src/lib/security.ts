/**
 * Valida che l'URL sia sicuro per redirect (solo Stripe o path relativi).
 */
export function isValidRedirectUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('stripe.com');
  } catch {
    return false;
  }
}
