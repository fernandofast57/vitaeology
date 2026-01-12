/**
 * API Admin - Trigger Cron Challenge Emails
 * POST /api/admin/trigger-cron - Esegue manualmente il cron delle email challenge
 *
 * Questo endpoint fa da proxy sicuro tra l'admin panel e il cron endpoint,
 * evitando di esporre CRON_SECRET al client-side.
 */

import { NextResponse } from 'next/server';
import { verifyPermissionFromRequest } from '@/lib/admin/verify-admin';

export const dynamic = 'force-dynamic';

export async function POST() {
  // Verifica permesso admin (users.view come minimo per admin)
  const auth = await verifyPermissionFromRequest('users.view');
  if (!auth.isAdmin) {
    return auth.response;
  }

  try {
    // Chiama internamente il cron endpoint con il secret (server-side only)
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { success: false, error: 'CRON_SECRET non configurato' },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const response = await fetch(`${appUrl}/api/cron/challenge-emails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.error || 'Errore esecuzione cron' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Errore trigger cron:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno durante esecuzione cron' },
      { status: 500 }
    );
  }
}
