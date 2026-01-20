/**
 * Email di consegna libri dopo acquisto
 *
 * Invia email con link download PDF e CTA per assessment
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Configurazione libri
interface BookConfig {
  title: string;
  subtitle: string;
  color: string;
  pdfEnvKey: string;
  assessmentPath: string;
  assessmentName: string;
}

const BOOK_CONFIG: Record<string, BookConfig> = {
  leadership: {
    title: 'Leadership Autentica',
    subtitle: 'Scopri il Leader che sei già',
    color: '#D4AF37', // Oro
    pdfEnvKey: 'PDF_URL_LEADERSHIP',
    assessmentPath: '/assessment/leadership',
    assessmentName: 'Assessment Leadership',
  },
  risolutore: {
    title: 'Oltre gli Ostacoli',
    subtitle: 'Potenzia il Risolutore che hai in te',
    color: '#10B981', // Verde
    pdfEnvKey: 'PDF_URL_RISOLUTORE',
    assessmentPath: '/assessment/risolutore',
    assessmentName: 'Assessment Risolutore',
  },
  microfelicita: {
    title: 'Microfelicità Digitale',
    subtitle: 'Ritrova equilibrio e benessere',
    color: '#8B5CF6', // Viola
    pdfEnvKey: 'PDF_URL_MICROFELICITA',
    assessmentPath: '/assessment/microfelicita',
    assessmentName: 'Assessment Microfelicità',
  },
};

/**
 * Invia email con libro PDF
 */
export async function sendBookEmail(
  email: string,
  bookSlug: string,
  customerName?: string
): Promise<boolean> {
  const book = BOOK_CONFIG[bookSlug];

  if (!book) {
    console.error(`Book config not found: ${bookSlug}`);
    return false;
  }

  const pdfUrl = process.env[book.pdfEnvKey];
  if (!pdfUrl) {
    console.error(`PDF URL not configured: ${book.pdfEnvKey}`);
    // Continua comunque, ma senza link diretto
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';
  const greeting = customerName ? `Ciao ${customerName}` : 'Ciao';

  try {
    const { error } = await resend.emails.send({
      from: 'Fernando Marongiu <fernando@vitaeology.com>',
      to: email,
      subject: `📖 Il tuo libro: ${book.title}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header con colore libro -->
          <tr>
            <td style="background-color: ${book.color}; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
                ${book.title}
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                ${book.subtitle}
              </p>
            </td>
          </tr>

          <!-- Contenuto principale -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${greeting},
              </p>

              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Grazie per aver acquistato <strong>${book.title}</strong>!
                Il tuo libro è pronto per essere scaricato.
              </p>

              <!-- Bottone Download -->
              ${pdfUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${pdfUrl}"
                       style="display: inline-block; background-color: ${book.color}; color: #ffffff;
                              padding: 16px 40px; text-decoration: none; border-radius: 8px;
                              font-weight: bold; font-size: 16px;">
                      📖 SCARICA IL TUO LIBRO
                    </a>
                  </td>
                </tr>
              </table>
              ` : `
              <p style="color: #666; font-size: 14px; background: #f0f0f0; padding: 15px; border-radius: 8px;">
                ⏳ Il link per il download ti sarà inviato entro 24 ore.
              </p>
              `}

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

              <!-- Sezione Assessment -->
              <h2 style="color: #0A2540; font-size: 20px; margin: 0 0 15px 0;">
                🎯 Il tuo prossimo passo
              </h2>

              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Con l'acquisto del libro hai sbloccato l'accesso al
                <strong>${book.assessmentName}</strong>.
                Scopri il tuo profilo personale e le tue aree di forza!
              </p>

              <!-- Bottone Assessment -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${appUrl}${book.assessmentPath}"
                       style="display: inline-block; background-color: #0A2540; color: #ffffff;
                              padding: 16px 40px; text-decoration: none; border-radius: 8px;
                              font-weight: bold; font-size: 16px;">
                      🎯 FAI L'ASSESSMENT
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

              <!-- Firma -->
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                Buona lettura e buon viaggio di scoperta!
              </p>

              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                <strong>Fernando Marongiu</strong><br>
                <span style="color: #666;">Autore della Trilogia Rivoluzione Aurea</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Hai domande? Rispondi a questa email, ti leggo personalmente.
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} Vitaeology. Tutti i diritti riservati.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      tags: [
        { name: 'type', value: 'book_delivery' },
        { name: 'book', value: bookSlug },
      ],
    });

    if (error) {
      console.error('Errore invio email libro:', error);
      return false;
    }

    console.log(`📧 Email libro inviata: ${bookSlug} a ${email}`);
    return true;
  } catch (err) {
    console.error('Errore sendBookEmail:', err);
    return false;
  }
}

/**
 * Invia email per acquisto trilogia completa
 */
export async function sendTrilogyEmail(
  email: string,
  customerName?: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';
  const greeting = customerName ? `Ciao ${customerName}` : 'Ciao';

  const books = [
    { ...BOOK_CONFIG.leadership, slug: 'leadership', pdfUrl: process.env.PDF_URL_LEADERSHIP },
    { ...BOOK_CONFIG.risolutore, slug: 'risolutore', pdfUrl: process.env.PDF_URL_RISOLUTORE },
    { ...BOOK_CONFIG.microfelicita, slug: 'microfelicita', pdfUrl: process.env.PDF_URL_MICROFELICITA },
  ];

  try {
    const { error } = await resend.emails.send({
      from: 'Fernando Marongiu <fernando@vitaeology.com>',
      to: email,
      subject: '📚 La tua Trilogia Rivoluzione Aurea è pronta!',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37, #10B981, #8B5CF6); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                🏆 La Trilogia Completa
              </h1>
              <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px;">
                Rivoluzione Aurea
              </p>
            </td>
          </tr>

          <!-- Contenuto -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${greeting},
              </p>

              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Hai fatto una scelta eccezionale! L'intera <strong>Trilogia Rivoluzione Aurea</strong>
                è tua. Ecco i tuoi 3 libri:
              </p>

              <!-- Lista libri -->
              ${books.map(book => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="background-color: #f8f8f8; border-left: 4px solid ${book.color}; padding: 20px; border-radius: 0 8px 8px 0;">
                    <h3 style="color: #0A2540; margin: 0 0 8px 0; font-size: 18px;">
                      📖 ${book.title}
                    </h3>
                    <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">
                      ${book.subtitle}
                    </p>
                    <p style="margin: 0;">
                      ${book.pdfUrl ? `<a href="${book.pdfUrl}" style="color: ${book.color}; font-weight: bold;">Scarica PDF</a>` : '<span style="color: #999;">PDF in arrivo</span>'}
                      &nbsp;|&nbsp;
                      <a href="${appUrl}${book.assessmentPath}" style="color: #0A2540;">Fai l'Assessment →</a>
                    </p>
                  </td>
                </tr>
              </table>
              `).join('')}

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

              <!-- CTA Dashboard -->
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hai sbloccato <strong>tutti e 3 gli Assessment</strong>.
                Accedi alla tua dashboard per iniziare il tuo percorso completo:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${appUrl}/dashboard"
                       style="display: inline-block; background-color: #0A2540; color: #ffffff;
                              padding: 16px 40px; text-decoration: none; border-radius: 8px;
                              font-weight: bold; font-size: 16px;">
                      🚀 VAI ALLA DASHBOARD
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Firma -->
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                Buon viaggio di trasformazione!
              </p>

              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                <strong>Fernando Marongiu</strong><br>
                <span style="color: #666;">Autore della Trilogia Rivoluzione Aurea</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Hai domande? Rispondi a questa email, ti leggo personalmente.
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} Vitaeology. Tutti i diritti riservati.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      tags: [
        { name: 'type', value: 'book_delivery' },
        { name: 'book', value: 'trilogy' },
      ],
    });

    if (error) {
      console.error('Errore invio email trilogia:', error);
      return false;
    }

    console.log(`📧 Email trilogia inviata a ${email}`);
    return true;
  } catch (err) {
    console.error('Errore sendTrilogyEmail:', err);
    return false;
  }
}
