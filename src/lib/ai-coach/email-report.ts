/**
 * AI Coach Learning System - Email Report
 * Invia report settimanale via email a Fernando
 */

import { getResend } from '@/lib/email/client';
import { AICoachWeeklyReport } from '@/types/ai-coach-learning';

// Email destinatario (Fernando)
const REPORT_RECIPIENT = process.env.REPORT_EMAIL || 'fernando@vitaeology.com';
const REPORT_FROM = 'AI Coach <noreply@vitaeology.com>';

/**
 * Genera HTML per il report settimanale
 */
function generateReportHTML(report: AICoachWeeklyReport): string {
  const { report_content } = report;
  const { summary, top_issues, suggested_prompt_changes, comparison_last_week } = report_content;

  // Determina colore trend
  const trendColor = summary.trend_vs_last_week === 'in miglioramento' ? '#22c55e' :
                     summary.trend_vs_last_week === 'in calo' ? '#ef4444' : '#f59e0b';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Settimanale AI Coach</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">📊 Report Settimanale AI Coach</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">
        ${report.week_start} — ${report.week_end}
      </p>
    </div>

    <!-- Summary Cards -->
    <div style="padding: 30px;">
      <div style="display: flex; gap: 15px; margin-bottom: 30px;">
        <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Conversazioni</p>
          <p style="margin: 5px 0 0; font-size: 28px; font-weight: bold; color: #1f2937;">${summary.total_conversations}</p>
        </div>
        <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Rating Medio</p>
          <p style="margin: 5px 0 0; font-size: 28px; font-weight: bold; color: #1f2937;">${summary.avg_rating.toFixed(2)}</p>
        </div>
        <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Trend</p>
          <p style="margin: 5px 0 0; font-size: 16px; font-weight: bold; color: ${trendColor};">${summary.trend_vs_last_week}</p>
        </div>
      </div>

      ${summary.highlight ? `
      <!-- Highlight -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">💡 ${summary.highlight}</p>
      </div>
      ` : ''}

      ${top_issues.length > 0 ? `
      <!-- Top Issues -->
      <h2 style="font-size: 18px; color: #1f2937; margin: 0 0 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">🚨 Top Issues</h2>
      <ul style="margin: 0 0 30px; padding: 0; list-style: none;">
        ${top_issues.map(issue => `
          <li style="padding: 12px; background: #fef2f2; border-radius: 8px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="background: #ef4444; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">${issue.count}</span>
              <span style="color: #1f2937; font-size: 14px;">${issue.description}</span>
            </div>
            ${issue.suggested_fix ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">💡 Fix: ${issue.suggested_fix}</p>` : ''}
          </li>
        `).join('')}
      </ul>
      ` : ''}

      ${suggested_prompt_changes.length > 0 ? `
      <!-- Suggested Changes -->
      <h2 style="font-size: 18px; color: #1f2937; margin: 0 0 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">✨ Modifiche Suggerite</h2>
      <ul style="margin: 0 0 30px; padding: 0; list-style: none;">
        ${suggested_prompt_changes.map(suggestion => `
          <li style="padding: 12px; background: #f0fdf4; border-radius: 8px; margin-bottom: 10px;">
            <p style="margin: 0; color: #1f2937; font-size: 14px;">${suggestion.change}</p>
            <p style="margin: 8px 0 0; color: #6b7280; font-size: 12px;">${suggestion.reason}</p>
          </li>
        `).join('')}
      </ul>
      ` : ''}

      <!-- Comparison -->
      <h2 style="font-size: 18px; color: #1f2937; margin: 0 0 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">📈 Confronto Settimana Precedente</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Rating</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right; font-weight: bold;">${comparison_last_week.rating_trend}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Conversazioni</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right; font-weight: bold;">${comparison_last_week.conversations_trend}</td>
        </tr>
        <tr>
          <td style="padding: 10px; color: #6b7280;">Helpful Ratio</td>
          <td style="padding: 10px; color: #1f2937; text-align: right; font-weight: bold;">${comparison_last_week.helpful_ratio_trend}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 12px;">
        Visualizza dettagli completi nella <a href="https://vitaeology.com/admin/ai-coach" style="color: #D4AF37;">Dashboard Admin</a>
      </p>
      <p style="margin: 10px 0 0; color: #9ca3af; font-size: 11px;">
        Vitaeology AI Coach Learning System
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Genera versione plain text del report
 */
function generateReportText(report: AICoachWeeklyReport): string {
  const { report_content } = report;
  const { summary, top_issues, comparison_last_week } = report_content;

  let text = `
REPORT SETTIMANALE AI COACH
${report.week_start} — ${report.week_end}
${'='.repeat(40)}

SOMMARIO
- Conversazioni: ${summary.total_conversations}
- Rating Medio: ${summary.avg_rating.toFixed(2)}
- Trend: ${summary.trend_vs_last_week}
${summary.highlight ? `- Highlight: ${summary.highlight}` : ''}

`;

  if (top_issues.length > 0) {
    text += `TOP ISSUES\n`;
    top_issues.forEach((issue, i) => {
      text += `${i + 1}. [${issue.count}x] ${issue.description}\n`;
      if (issue.suggested_fix) {
        text += `   Fix: ${issue.suggested_fix}\n`;
      }
    });
    text += '\n';
  }

  text += `CONFRONTO SETTIMANA PRECEDENTE
- Rating: ${comparison_last_week.rating_trend}
- Conversazioni: ${comparison_last_week.conversations_trend}
- Helpful Ratio: ${comparison_last_week.helpful_ratio_trend}

---
Dashboard: https://vitaeology.com/admin/ai-coach
`;

  return text.trim();
}

/**
 * Invia report settimanale via email
 */
export async function sendWeeklyReportEmail(
  report: AICoachWeeklyReport
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResend();

  try {
    const { data, error } = await resend.emails.send({
      from: REPORT_FROM,
      to: REPORT_RECIPIENT,
      subject: `📊 Report AI Coach: ${report.week_start} - ${report.week_end}`,
      html: generateReportHTML(report),
      text: generateReportText(report),
    });

    if (error) {
      console.error('Errore invio email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('Email report inviata:', data?.id);
    return {
      success: true,
      messageId: data?.id,
    };

  } catch (error) {
    console.error('Errore Resend:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    };
  }
}
