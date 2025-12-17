import { NextRequest, NextResponse } from 'next/server';
import { markReportReviewed } from '@/lib/ai-coach/weekly-report';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';

export async function POST(request: NextRequest) {
  // Verifica che l'utente sia admin
  const adminCheck = await verifyAdminFromRequest();
  if (!adminCheck.isAdmin) {
    return adminCheck.response;
  }

  try {
    const { reportId, action, actions } = await request.json();

    if (!reportId || !action) {
      return NextResponse.json(
        { error: 'reportId e action richiesti' },
        { status: 400 }
      );
    }

    if (action === 'review') {
      const success = await markReportReviewed(reportId, actions);

      if (success) {
        return NextResponse.json({
          success: true,
          reportId,
          status: 'reviewed',
        });
      } else {
        return NextResponse.json(
          { error: 'Errore aggiornamento report' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Azione non supportata' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Errore reports API:', error);
    return NextResponse.json(
      { error: 'Errore interno' },
      { status: 500 }
    );
  }
}
