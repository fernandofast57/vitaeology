import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyReport } from '@/lib/ai-coach/weekly-report';
import { sendWeeklyReportEmail } from '@/lib/ai-coach/email-report';

// Questo endpoint viene chiamato da Vercel Cron ogni lunedi
// Configurato in vercel.json

export async function GET(request: NextRequest) {
  // Verifica autorizzazione
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const report = await generateWeeklyReport();

    if (report) {
      console.log('Report settimanale generato:', report.id);
      console.log('Settimana:', report.week_start, '-', report.week_end);

      // Invia email a Fernando
      const emailResult = await sendWeeklyReportEmail(report);

      if (emailResult.success) {
        console.log('Email inviata:', emailResult.messageId);
      } else {
        console.warn('Email non inviata:', emailResult.error);
      }

      return NextResponse.json({
        success: true,
        message: 'Report settimanale generato',
        reportId: report.id,
        weekStart: report.week_start,
        weekEnd: report.week_end,
        summary: report.report_content.summary,
        emailSent: emailResult.success,
        emailError: emailResult.error,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Errore generazione report' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Errore cron weekly-report:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
