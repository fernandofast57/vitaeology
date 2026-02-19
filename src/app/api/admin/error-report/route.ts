import { NextResponse } from 'next/server';
import { sendErrorAlert } from '@/lib/error-alerts';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * API per segnalare errori
 *
 * Può essere chiamata da:
 * - Frontend (errori client-side)
 * - Altri servizi
 * - Webhook esterni
 *
 * POST /api/admin/error-report
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      type,
      message,
      severity = 'medium',
      endpoint,
      stack,
      userAgent,
      url
    } = body;

    if (!type || !message) {
      return NextResponse.json(
        { error: 'type and message are required' },
        { status: 400 }
      );
    }

    // Prova a ottenere info utente se autenticato
    let userId: string | undefined;
    let userEmail: string | undefined;

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email || undefined;
      }
    } catch {
      // Ignora errori auth - l'errore potrebbe essere proprio nell'auth
    }

    // Invia alert
    await sendErrorAlert({
      type,
      message,
      severity,
      context: {
        userId,
        userEmail,
        endpoint: endpoint || url,
        stack,
        headers: {
          'User-Agent': userAgent || request.headers.get('user-agent') || 'unknown'
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ErrorReport] Failed:', err);
    return NextResponse.json(
      { error: 'Failed to report error' },
      { status: 500 }
    );
  }
}
