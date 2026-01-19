/**
 * Template Email per Challenge 7 Giorni
 *
 * Gestisce tutte le email del funnel challenge:
 * - Contenuto giornaliero
 * - Reminder inattività
 * - Sblocco forzato
 * - Completamento
 * - Sequenza post-challenge
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// CONFIGURAZIONE CHALLENGE
// ============================================================

type ChallengeType = 'leadership-autentica' | 'oltre-ostacoli' | 'microfelicita';

interface ChallengeConfig {
  name: string;
  color: string;
  bookSlug: string;
  bookTitle: string;
  bookPrice: string;
  assessmentPath: string;
  landingPath: string;
}

const CHALLENGE_CONFIG: Record<ChallengeType, ChallengeConfig> = {
  'leadership-autentica': {
    name: 'Leadership Autentica',
    color: '#0A2540',
    bookSlug: 'leadership',
    bookTitle: 'Leadership Autentica',
    bookPrice: '9,90',
    assessmentPath: '/assessment/lite',
    landingPath: '/libro/leadership',
  },
  'oltre-ostacoli': {
    name: 'Oltre gli Ostacoli',
    color: '#10B981',
    bookSlug: 'risolutore',
    bookTitle: 'Oltre gli Ostacoli',
    bookPrice: '9,90',
    assessmentPath: '/assessment/risolutore',
    landingPath: '/libro/risolutore',
  },
  'microfelicita': {
    name: 'Microfelicità',
    color: '#8B5CF6',
    bookSlug: 'microfelicita',
    bookTitle: 'Microfelicità Digitale',
    bookPrice: '9,90',
    assessmentPath: '/assessment/microfelicita',
    landingPath: '/libro/microfelicita',
  },
};

// Mappa challenge type → URL path (senza accenti e normalizzato)
const CHALLENGE_URL_PATH: Record<ChallengeType, string> = {
  'leadership-autentica': 'leadership',
  'oltre-ostacoli': 'ostacoli',
  'microfelicita': 'microfelicita',
};

// ============================================================
// TITOLI DEI 7 GIORNI PER CHALLENGE
// ============================================================

const DAY_TITLES: Record<ChallengeType, string[]> = {
  'leadership-autentica': [
    'Giorno 1: Scopri la tua Visione',
    'Giorno 2: Connettiti con i tuoi Valori',
    'Giorno 3: Riconosci il tuo Stile',
    'Giorno 4: Costruisci Relazioni Autentiche',
    'Giorno 5: Adatta il tuo Approccio',
    'Giorno 6: Passa all\'Azione',
    'Giorno 7: Integra la tua Leadership',
  ],
  'oltre-ostacoli': [
    'Giorno 1: Riconosci gli Ostacoli',
    'Giorno 2: Cambia Prospettiva',
    'Giorno 3: Attiva le tue Risorse',
    'Giorno 4: Costruisci Resilienza',
    'Giorno 5: Trasforma i Problemi',
    'Giorno 6: Agisci con Coraggio',
    'Giorno 7: Celebra il Risolutore in te',
  ],
  'microfelicita': [
    'Giorno 1: Risveglia la Consapevolezza',
    'Giorno 2: Coltiva la Gratitudine',
    'Giorno 3: Scopri i Micro-Momenti',
    'Giorno 4: Bilancia il Digitale',
    'Giorno 5: Nutri le Relazioni',
    'Giorno 6: Pratica la Presenza',
    'Giorno 7: Integra la Microfelicità',
  ],
};

// ============================================================
// RISULTATI COMPLETAMENTO PER CHALLENGE
// ============================================================

const COMPLETION_BULLETS: Record<ChallengeType, string[]> = {
  'leadership-autentica': [
    'Hai scoperto il tuo stile di leadership unico',
    'Hai identificato i tuoi valori guida',
    'Hai acquisito strumenti per relazioni autentiche',
    'Hai sviluppato consapevolezza del tuo impatto',
    'Hai sbloccato l\'Assessment Leadership LITE',
  ],
  'oltre-ostacoli': [
    'Hai imparato a riconoscere i pattern limitanti',
    'Hai acquisito tecniche di problem solving',
    'Hai sviluppato resilienza mentale',
    'Hai trasformato ostacoli in opportunità',
    'Hai sbloccato l\'Assessment Risolutore',
  ],
  'microfelicita': [
    'Hai scoperto i tuoi micro-momenti di gioia',
    'Hai sviluppato una pratica di gratitudine',
    'Hai migliorato il tuo equilibrio digitale',
    'Hai coltivato relazioni più presenti',
    'Hai sbloccato l\'Assessment Microfelicità',
  ],
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getDayTitle(challengeType: ChallengeType, dayNumber: number): string {
  const titles = DAY_TITLES[challengeType];
  if (!titles || dayNumber < 1 || dayNumber > 7) {
    return `Giorno ${dayNumber}`;
  }
  return titles[dayNumber - 1];
}

export function getCompletionBullets(challengeType: ChallengeType): string[] {
  return COMPLETION_BULLETS[challengeType] || [];
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function logEmail(
  email: string,
  emailType: string,
  challengeType?: ChallengeType,
  dayNumber?: number,
  subject?: string
): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.rpc('log_email_sent', {
      p_email: email,
      p_email_type: emailType,
      p_challenge_type: challengeType || null,
      p_day_number: dayNumber || null,
      p_subject: subject || null,
    });
  } catch (err) {
    console.error('Errore log email:', err);
  }
}

// ============================================================
// BASE EMAIL TEMPLATE
// ============================================================

function baseEmailTemplate(
  content: string,
  headerColor: string,
  headerTitle: string,
  headerSubtitle?: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';

  return `
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

          <!-- Header -->
          <tr>
            <td style="background-color: ${headerColor}; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px;">
                ${headerTitle}
              </h1>
              ${headerSubtitle ? `
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                ${headerSubtitle}
              </p>
              ` : ''}
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Hai domande? Rispondi a questa email.
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                <a href="${appUrl}/unsubscribe" style="color: #999;">Disiscriviti</a> |
                © ${new Date().getFullYear()} Vitaeology
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function ctaButton(text: string, url: string, color: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 25px 0;">
          <a href="${url}"
             style="display: inline-block; background-color: ${color}; color: #ffffff;
                    padding: 16px 40px; text-decoration: none; border-radius: 8px;
                    font-weight: bold; font-size: 16px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

type EmailType =
  | 'day_content'
  | 'reminder_48h'
  | 'day_unlock'
  | 'challenge_complete'
  | 'post_challenge_1'
  | 'post_challenge_2'
  | 'post_challenge_3';

interface EmailResult {
  success: boolean;
  error?: string;
}

export async function sendChallengeEmail(
  to: string,
  type: EmailType,
  challengeType: ChallengeType,
  dayNumber?: number,
  userName?: string
): Promise<EmailResult> {
  const config = CHALLENGE_CONFIG[challengeType];
  if (!config) {
    return { success: false, error: `Challenge type non valido: ${challengeType}` };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';
  const greeting = userName ? `Ciao ${userName}` : 'Ciao';

  let subject = '';
  let html = '';

  switch (type) {
    // --------------------------------------------------------
    // DAY CONTENT - Contenuto giornaliero
    // --------------------------------------------------------
    case 'day_content': {
      if (!dayNumber || dayNumber < 1 || dayNumber > 7) {
        return { success: false, error: 'dayNumber richiesto (1-7)' };
      }

      const dayTitle = getDayTitle(challengeType, dayNumber);
      subject = `🎯 ${dayTitle} - Challenge ${config.name}`;

      const dayUrl = `${appUrl}/challenge/${CHALLENGE_URL_PATH[challengeType]}/day/${dayNumber}`;

      const content = `
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          ${greeting},
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          È il momento del <strong>${dayTitle}</strong>!
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Oggi scoprirai nuovi strumenti e riflessioni per il tuo percorso.
          Dedica 10-15 minuti a questa sessione per ottenere il massimo.
        </p>

        ${ctaButton('🚀 INIZIA IL GIORNO ' + dayNumber, dayUrl, config.color)}

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          <strong>Suggerimento:</strong> Trova un momento tranquillo, prendi appunti,
          e metti in pratica almeno un esercizio oggi stesso.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #333; font-size: 16px; margin: 0;">
          Buon lavoro!<br>
          <strong>Fernando</strong>
        </p>
      `;

      html = baseEmailTemplate(content, config.color, dayTitle, `Challenge ${config.name}`);
      break;
    }

    // --------------------------------------------------------
    // REMINDER 48H - Utente inattivo
    // --------------------------------------------------------
    case 'reminder_48h': {
      subject = `⏰ Ti aspetto! - Challenge ${config.name}`;

      const continueUrl = `${appUrl}/challenge/${CHALLENGE_URL_PATH[challengeType]}/day/${dayNumber || 1}`;

      const content = `
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          ${greeting},
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Ho notato che non ti vedo da un po' nella Challenge ${config.name}.
          Va tutto bene?
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Capisco che la vita sia piena di impegni, ma <strong>bastano 10 minuti al giorno</strong>
          per fare progressi significativi.
        </p>

        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #333; font-size: 16px; margin: 0;">
            📍 <strong>Sei al Giorno ${dayNumber || 1}</strong><br>
            <span style="color: #666;">Hai ancora ${7 - (dayNumber || 1)} giorni per completare la challenge</span>
          </p>
        </div>

        ${ctaButton('▶️ CONTINUA LA CHALLENGE', continueUrl, config.color)}

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          Se hai difficoltà o domande, rispondi a questa email.
          Sono qui per aiutarti.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #333; font-size: 16px; margin: 0;">
          A presto,<br>
          <strong>Fernando</strong>
        </p>
      `;

      html = baseEmailTemplate(content, config.color, 'Ti aspetto!', `Challenge ${config.name}`);
      break;
    }

    // --------------------------------------------------------
    // DAY UNLOCK - Sblocco forzato 72h
    // --------------------------------------------------------
    case 'day_unlock': {
      if (!dayNumber) {
        return { success: false, error: 'dayNumber richiesto' };
      }

      subject = `🔓 Giorno ${dayNumber} sbloccato - Challenge ${config.name}`;

      const dayUrl = `${appUrl}/challenge/${CHALLENGE_URL_PATH[challengeType]}/day/${dayNumber}`;

      const content = `
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          ${greeting},
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Ho sbloccato il <strong>Giorno ${dayNumber}</strong> per te!
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Capisco che i giorni precedenti possano essere stati impegnativi.
          Non preoccuparti: puoi sempre tornare indietro e completarli.
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          L'importante è continuare il percorso, anche se non è perfetto.
          <strong>Fatto è meglio che perfetto!</strong>
        </p>

        ${ctaButton('🚀 VAI AL GIORNO ' + dayNumber, dayUrl, config.color)}

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #333; font-size: 16px; margin: 0;">
          Forza, ce la puoi fare!<br>
          <strong>Fernando</strong>
        </p>
      `;

      html = baseEmailTemplate(content, config.color, `Giorno ${dayNumber} Sbloccato!`, `Challenge ${config.name}`);
      break;
    }

    // --------------------------------------------------------
    // CHALLENGE COMPLETE - Congratulazioni
    // --------------------------------------------------------
    case 'challenge_complete': {
      subject = `🎉 Congratulazioni! Hai completato la Challenge ${config.name}`;

      const bullets = getCompletionBullets(challengeType);
      const assessmentUrl = `${appUrl}${config.assessmentPath}`;
      const bookUrl = `${appUrl}${config.landingPath}`;

      const bulletsList = bullets.map(b => `
        <li style="margin: 10px 0; padding-left: 10px;">✅ ${b}</li>
      `).join('');

      const content = `
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          ${greeting},
        </p>

        <p style="color: #333; font-size: 20px; line-height: 1.6; margin: 0 0 20px 0;">
          <strong>CE L'HAI FATTA! 🏆</strong>
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Hai completato tutti e 7 i giorni della Challenge <strong>${config.name}</strong>.
          Sono davvero orgoglioso di te!
        </p>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid ${config.color}; margin: 20px 0;">
          <p style="color: #333; font-size: 16px; margin: 0 0 15px 0; font-weight: bold;">
            In questi 7 giorni hai:
          </p>
          <ul style="color: #333; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
            ${bulletsList}
          </ul>
        </div>

        <h2 style="color: #0A2540; font-size: 20px; margin: 30px 0 15px 0;">
          🎯 Il tuo prossimo passo
        </h2>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Hai sbloccato l'accesso all'<strong>Assessment</strong>.
          Scopri il tuo profilo dettagliato:
        </p>

        ${ctaButton('🎯 FAI L\'ASSESSMENT', assessmentUrl, config.color)}

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Vuoi approfondire ancora di più? Il libro <strong>${config.bookTitle}</strong>
          contiene esercizi avanzati e strategie complete.
        </p>

        <p style="text-align: center; margin: 20px 0;">
          <a href="${bookUrl}" style="color: ${config.color}; font-weight: bold;">
            Scopri il libro →
          </a>
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #333; font-size: 16px; margin: 0;">
          Complimenti ancora!<br>
          <strong>Fernando</strong>
        </p>
      `;

      html = baseEmailTemplate(content, config.color, '🎉 Challenge Completata!', config.name);
      break;
    }

    // --------------------------------------------------------
    // POST CHALLENGE 1 - 24h dopo (offerta libro)
    // --------------------------------------------------------
    case 'post_challenge_1': {
      subject = `📖 Un regalo per te - ${config.bookTitle}`;

      const bookUrl = `${appUrl}${config.landingPath}`;

      const content = `
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          ${greeting},
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Come ti senti dopo aver completato la Challenge?
          Spero che i 7 giorni ti abbiano dato nuovi strumenti e prospettive.
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Se vuoi continuare il percorso e andare ancora più in profondità,
          ho una proposta per te:
        </p>

        <div style="background: linear-gradient(135deg, #f8f8f8, #fff); padding: 25px; border-radius: 12px; border: 2px solid ${config.color}; margin: 20px 0; text-align: center;">
          <h3 style="color: ${config.color}; margin: 0 0 10px 0; font-size: 22px;">
            📖 ${config.bookTitle}
          </h3>
          <p style="color: #666; margin: 0 0 15px 0; font-size: 16px;">
            La guida completa per trasformare ciò che hai imparato in risultati concreti
          </p>
          <p style="margin: 0;">
            <span style="font-size: 32px; font-weight: bold; color: ${config.color};">€${config.bookPrice}</span>
            <span style="color: #999; text-decoration: line-through; margin-left: 10px;">€19,90</span>
          </p>
        </div>

        ${ctaButton('📖 SCOPRI IL LIBRO', bookUrl, config.color)}

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
          Include: PDF scaricabile + accesso permanente all'Assessment
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #333; font-size: 16px; margin: 0;">
          A presto,<br>
          <strong>Fernando</strong>
        </p>
      `;

      html = baseEmailTemplate(content, config.color, 'Il prossimo passo', `Dopo la Challenge ${config.name}`);
      break;
    }

    // --------------------------------------------------------
    // POST CHALLENGE 2 - 72h dopo (urgenza)
    // --------------------------------------------------------
    case 'post_challenge_2': {
      subject = `⏰ Non perdere lo slancio - ${config.bookTitle}`;

      const bookUrl = `${appUrl}${config.landingPath}`;

      const content = `
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          ${greeting},
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Sono passati alcuni giorni dalla Challenge.
          Come stai applicando ciò che hai imparato?
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          So che è facile tornare alle vecchie abitudini.
          È per questo che ho scritto <strong>${config.bookTitle}</strong>:
          per darti una guida pratica da consultare ogni giorno.
        </p>

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #856404; font-size: 16px; margin: 0;">
            ⚡ <strong>Consiglio:</strong> I primi 7 giorni dopo una challenge sono cruciali.
            È il momento migliore per consolidare i nuovi comportamenti.
          </p>
        </div>

        ${ctaButton('📖 CONTINUA IL PERCORSO', bookUrl, config.color)}

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #333; font-size: 16px; margin: 0;">
          Sono qui se hai domande,<br>
          <strong>Fernando</strong>
        </p>
      `;

      html = baseEmailTemplate(content, config.color, 'Non fermarti ora', `Challenge ${config.name}`);
      break;
    }

    // --------------------------------------------------------
    // POST CHALLENGE 3 - 7 giorni dopo (ultima chance)
    // --------------------------------------------------------
    case 'post_challenge_3': {
      subject = `💫 Ultima opportunità - ${config.bookTitle} a €${config.bookPrice}`;

      const bookUrl = `${appUrl}${config.landingPath}`;

      const content = `
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          ${greeting},
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          È passata una settimana dalla Challenge ${config.name}.
          Volevo farti un ultimo check-in.
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Se hai trovato valore nei 7 giorni insieme, sappi che il libro
          <strong>${config.bookTitle}</strong> contiene:
        </p>

        <ul style="color: #333; font-size: 15px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
          <li>Esercizi avanzati oltre la challenge</li>
          <li>Strategie approfondite per ogni area</li>
          <li>Casi studio e esempi pratici</li>
          <li>Accesso permanente all'Assessment completo</li>
        </ul>

        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #991b1b; font-size: 16px; margin: 0;">
            🔥 <strong>Offerta speciale:</strong> €${config.bookPrice} (invece di €19,90)
          </p>
        </div>

        ${ctaButton('📖 OTTIENI IL LIBRO ORA', bookUrl, '#dc2626')}

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          Questa sarà la mia ultima email su questo argomento.
          Se preferisci continuare da solo, ti auguro il meglio nel tuo percorso!
        </p>

        <p style="color: #333; font-size: 16px; margin: 0;">
          In bocca al lupo,<br>
          <strong>Fernando</strong>
        </p>
      `;

      html = baseEmailTemplate(content, '#dc2626', 'Ultima Opportunità', config.bookTitle);
      break;
    }

    default:
      return { success: false, error: `Tipo email non valido: ${type}` };
  }

  // Invia email
  try {
    const { error } = await resend.emails.send({
      from: 'Fernando <fernando@vitaeology.com>',
      to,
      subject,
      html,
      tags: [
        { name: 'type', value: type },
        { name: 'challenge', value: challengeType },
        ...(dayNumber ? [{ name: 'day', value: String(dayNumber) }] : []),
      ],
    });

    if (error) {
      console.error('Errore invio email challenge:', error);
      return { success: false, error: error.message };
    }

    // Log email inviata
    await logEmail(to, type === 'day_content' ? 'challenge_day' : type, challengeType, dayNumber, subject);

    console.log(`📧 Email inviata: ${type} (${challengeType}) a ${to}`);
    return { success: true };
  } catch (err) {
    console.error('Errore sendChallengeEmail:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ============================================================
// BATCH SEND HELPERS
// ============================================================

/**
 * Invia email giornaliera a tutti gli utenti che hanno completato il giorno precedente
 */
export async function sendDailyEmails(): Promise<{ sent: number; errors: number }> {
  const supabase = getSupabase();
  let sent = 0;
  let errors = 0;

  // Trova utenti che devono ricevere email del giorno successivo
  // (hanno completato il giorno N ieri, devono ricevere giorno N+1)
  const { data: subscribers } = await supabase
    .from('challenge_subscribers')
    .select('*')
    .eq('status', 'active')
    .lt('current_day', 7)
    .is('completed_at', null);

  if (!subscribers || subscribers.length === 0) {
    return { sent: 0, errors: 0 };
  }

  for (const sub of subscribers) {
    const nextDay = sub.current_day + 1;
    const result = await sendChallengeEmail(
      sub.email,
      'day_content',
      sub.challenge_type as ChallengeType,
      nextDay,
      sub.name
    );

    if (result.success) {
      sent++;
    } else {
      errors++;
      console.error(`Errore email a ${sub.email}:`, result.error);
    }
  }

  return { sent, errors };
}

/**
 * Invia reminder a utenti inattivi (48h)
 */
export async function sendInactivityReminders(): Promise<{ sent: number; errors: number }> {
  const supabase = getSupabase();
  let sent = 0;
  let errors = 0;

  const { data: inactive } = await supabase.rpc('get_inactive_subscribers', { p_hours_inactive: 48 });

  if (!inactive || inactive.length === 0) {
    return { sent: 0, errors: 0 };
  }

  for (const sub of inactive) {
    const result = await sendChallengeEmail(
      sub.email,
      'reminder_48h',
      sub.challenge_type as ChallengeType,
      sub.current_day
    );

    if (result.success) {
      // Aggiorna last_reminder_sent_at
      await supabase
        .from('challenge_subscribers')
        .update({ last_reminder_sent_at: new Date().toISOString() })
        .eq('id', sub.id);
      sent++;
    } else {
      errors++;
    }
  }

  return { sent, errors };
}

/**
 * Invia email post-challenge
 */
export async function sendPostChallengeEmails(): Promise<{ sent: number; errors: number }> {
  const supabase = getSupabase();
  let sent = 0;
  let errors = 0;

  const { data: pending } = await supabase.rpc('get_post_challenge_pending');

  if (!pending || pending.length === 0) {
    return { sent: 0, errors: 0 };
  }

  for (const sub of pending) {
    if (sub.next_email === 0) continue;

    const emailType = `post_challenge_${sub.next_email}` as EmailType;

    const result = await sendChallengeEmail(
      sub.email,
      emailType,
      sub.challenge_type as ChallengeType
    );

    if (result.success) {
      // Aggiorna flag email inviata
      const updateField = `post_email_${sub.next_email}_sent`;
      await supabase
        .from('challenge_subscribers')
        .update({ [updateField]: new Date().toISOString() })
        .eq('id', sub.id);
      sent++;
    } else {
      errors++;
    }
  }

  return { sent, errors };
}
