/**
 * Template Email per Programma Affiliati Vitaeology
 *
 * 16 Template totali:
 * - T1: Benvenuto affiliato
 * - D1-D7: Sequenza sviluppo (7 email)
 * - N1-N7: Notifiche eventi (7 email)
 * - E1: Reminder inattività
 *
 * Conformità: VITAEOLOGY_MEGA_PROMPT v4.3
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// TIPI
// ============================================================

export type AffiliateEmailType =
  | 'T1' // Benvenuto
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7' // Sequenza sviluppo
  | 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7' // Notifiche eventi
  | 'E1'; // Reminder inattività

export interface AffiliateEmailData {
  nome: string;
  email: string;
  ref_code: string;
  abbonamento_utente: string;
  commissione_base: number;
  bonus_performance: number;
  commissione_totale: number;
  clienti_attivi: number;
  saldo_disponibile: number;
  giorni_iscrizione?: number;
  esercizi_completati?: number;
  conversazioni_coach?: number;
  // Per notifiche specifiche
  importo_commissione?: number;
  percentuale?: number;
  prodotto?: string;
  tipo_commissione?: string; // 'iniziale' | 'rinnovo'
  bonus?: string;
  milestone?: string;
  importo_payout?: number;
  metodo_pagamento?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
  emailId?: string;
}

// ============================================================
// CONFIGURAZIONE
// ============================================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';

const COLORS = {
  primary: '#0A2540',
  gold: '#F4B942',
  success: '#10B981',
  gray: '#6B7280',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function baseEmailTemplate(
  content: string,
  headerTitle?: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">

          ${headerTitle ? `
          <!-- Header -->
          <tr>
            <td style="background-color: ${COLORS.primary}; padding: 20px 30px;">
              <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 600;">
                VITAEOLOGY PARTNER
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 30px;">
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; text-align: center;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 0;">
                Vitaeology - Leadership Development Platform
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 10px 0 0 0;">
                <a href="${APP_URL}/affiliate/dashboard" style="color: ${COLORS.primary}; text-decoration: underline;">
                  La tua dashboard
                </a>
                &nbsp;|&nbsp;
                <a href="${APP_URL}/affiliate/preferences" style="color: ${COLORS.primary}; text-decoration: underline;">
                  Gestisci preferenze
                </a>
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

function sectionDivider(): string {
  return `<hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 0;">`;
}

function infoBox(content: string): string {
  return `
    <div style="background: #f8f9fa; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
      ${content}
    </div>
  `;
}

function linkButton(text: string, url: string): string {
  return `
    <p style="margin: 20px 0;">
      <a href="${url}" style="display: inline-block; color: ${COLORS.primary}; text-decoration: underline; font-weight: 500;">
        ${text}
      </a>
    </p>
  `;
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

function getT1Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Hai attivato il programma affiliati.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Non ti chiediamo di diventare un venditore.<br>
      Ti chiediamo di condividere ciò che stai già vivendo.
    </p>

    ${sectionDivider()}

    <p style="color: ${COLORS.primary}; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; margin: 0 0 10px 0;">
      IL TUO PROFILO
    </p>

    ${infoBox(`
      <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
        <strong>Codice:</strong> ${data.ref_code}<br>
        <strong>Abbonamento:</strong> ${data.abbonamento_utente}<br>
        <strong>Commissione:</strong> ${data.commissione_base}% su ogni vendita
      </p>
    `)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 8px 0;">
      <strong>Il tuo link:</strong>
    </p>
    <p style="color: ${COLORS.primary}; font-size: 14px; line-height: 24px; margin: 0 0 16px 0;">
      <a href="${APP_URL}/challenge/leadership?ref=${data.ref_code}" style="color: ${COLORS.primary}; word-break: break-all;">
        ${APP_URL}/challenge/leadership?ref=${data.ref_code}
      </a>
    </p>

    ${sectionDivider()}

    <p style="color: ${COLORS.primary}; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; margin: 0 0 10px 0;">
      COSA SUCCEDE ORA
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Nei prossimi giorni riceverai alcune email che ti aiuteranno a capire
      come la tua esperienza con Vitaeology può essere utile ad altri.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Non c'è fretta. Non ci sono quote.<br>
      Solo la possibilità di condividere qualcosa che funziona.
    </p>

    ${linkButton('→ La tua dashboard', `${APP_URL}/affiliate/dashboard`)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      A presto,<br>
      <strong>Fernando</strong>
    </p>
  `;

  return {
    subject: 'La tua esperienza Vitaeology ora può aiutare altri',
    html: baseEmailTemplate(content, 'Partner'),
  };
}

function getD1Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Stai usando Vitaeology da <strong>${data.giorni_iscrizione || 'alcuni'} giorni</strong>.<br>
      Hai completato <strong>${data.esercizi_completati || 0} esercizi</strong>.<br>
      Il tuo AI Coach ti ha supportato in <strong>${data.conversazioni_coach || 0} conversazioni</strong>.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Questo non è un dato statistico.<br>
      È esperienza diretta.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Quando qualcuno ti chiede "Ma funziona davvero?", tu puoi rispondere
      con qualcosa che nessuna pubblicità può offrire: la tua esperienza.
    </p>

    ${sectionDivider()}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Pensa a un momento specifico in cui Vitaeology ti ha aiutato.<br>
      Un esercizio che ti ha fatto riflettere.<br>
      Una domanda dell'AI Coach che ti ha colpito.<br>
      Un'intuizione che è emersa.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Quella è la tua storia. E le storie vere sono più potenti di qualsiasi slogan.
    </p>

    <p style="color: ${COLORS.gray}; font-size: 14px; line-height: 22px; margin: 20px 0 0 0;">
      Domani parliamo di come i tuoi risultati possono ispirare altri.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: 'Cosa sai già di Vitaeology',
    html: baseEmailTemplate(content),
  };
}

function getD2Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Non sono numeri astratti.<br>
      Sono aree della tua leadership che hai esplorato e sviluppato.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Quando parli con un collega, un amico, un conoscente che sta cercando
      di crescere professionalmente, non devi inventare nulla.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Puoi semplicemente dire:<br>
      <em>"Io ho lavorato su [area] e ho notato che..."</em>
    </p>

    ${sectionDivider()}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      È una conversazione, non una vendita.<br>
      È condivisione, non promozione.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Le persone percepiscono la differenza tra chi ripete uno script
      e chi parla di qualcosa che ha vissuto.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: 'I numeri che contano (i tuoi)',
    html: baseEmailTemplate(content),
  };
}

function getD3Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      C'è una differenza enorme tra:
    </p>

    ${infoBox(`
      <p style="color: ${COLORS.gray}; font-size: 15px; line-height: 24px; margin: 0; font-style: italic;">
        "Dovresti provare Vitaeology, è fantastico!"
      </p>
    `)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      e
    </p>

    ${infoBox(`
      <p style="color: ${COLORS.primary}; font-size: 15px; line-height: 24px; margin: 0; font-style: italic;">
        "Sto facendo un percorso sulla leadership che mi sta facendo
        riflettere su come gestisco le decisioni difficili. Se ti interessa,
        ti mando il link alla challenge gratuita."
      </p>
    `)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      La prima frase suona come pubblicità.<br>
      La seconda suona come una persona che condivide qualcosa di vero.
    </p>

    ${sectionDivider()}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Il segreto non è nelle parole.<br>
      È nel fatto che tu stai realmente vivendo quel percorso.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Non devi convincere nessuno.<br>
      Devi solo essere disponibile a condividere quando ha senso farlo.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: 'La differenza che si sente',
    html: baseEmailTemplate(content),
  };
}

function getD4Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Vitaeology non è per tutti.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      È per persone che:
    </p>

    <ul style="color: #525f7f; font-size: 16px; line-height: 28px; margin: 0 0 16px 0; padding-left: 20px;">
      <li>Hanno responsabilità professionali (team, progetti, decisioni)</li>
      <li>Sentono che potrebbero crescere come leader</li>
      <li>Preferiscono la riflessione pratica alla teoria astratta</li>
      <li>Hanno 15-20 minuti a settimana da dedicare a sé stessi</li>
    </ul>

    ${sectionDivider()}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Pensa alle persone che conosci.<br>
      Colleghi, amici, ex compagni di lavoro.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Chi ti viene in mente quando leggi questa lista?
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Non serve un elenco di 100 nomi.<br>
      Bastano 3-5 persone che potrebbero davvero beneficiarne.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Quelle sono le conversazioni che hanno senso.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: 'Non tutti, ma qualcuno',
    html: baseEmailTemplate(content),
  };
}

function getD5Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Ecco i tuoi link pronti all'uso:
    </p>

    ${infoBox(`
      <p style="color: ${COLORS.primary}; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
        CHALLENGE LEADERSHIP (5 giorni gratuiti)
      </p>
      <p style="color: #525f7f; font-size: 14px; margin: 0 0 4px 0;">
        <a href="${APP_URL}/challenge/leadership?ref=${data.ref_code}" style="color: ${COLORS.primary}; word-break: break-all;">
          ${APP_URL}/challenge/leadership?ref=${data.ref_code}
        </a>
      </p>
      <p style="color: ${COLORS.gray}; font-size: 13px; margin: 0;">
        Ideale per chi vuole capire il proprio stile di leadership.
      </p>
    `)}

    ${infoBox(`
      <p style="color: ${COLORS.success}; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
        CHALLENGE OSTACOLI (5 giorni gratuiti)
      </p>
      <p style="color: #525f7f; font-size: 14px; margin: 0 0 4px 0;">
        <a href="${APP_URL}/challenge/ostacoli?ref=${data.ref_code}" style="color: ${COLORS.primary}; word-break: break-all;">
          ${APP_URL}/challenge/ostacoli?ref=${data.ref_code}
        </a>
      </p>
      <p style="color: ${COLORS.gray}; font-size: 13px; margin: 0;">
        Ideale per chi sta affrontando un blocco o una decisione difficile.
      </p>
    `)}

    ${infoBox(`
      <p style="color: #8B5CF6; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
        CHALLENGE MICROFELICITÀ (5 giorni gratuiti)
      </p>
      <p style="color: #525f7f; font-size: 14px; margin: 0 0 4px 0;">
        <a href="${APP_URL}/challenge/microfelicita?ref=${data.ref_code}" style="color: ${COLORS.primary}; word-break: break-all;">
          ${APP_URL}/challenge/microfelicita?ref=${data.ref_code}
        </a>
      </p>
      <p style="color: ${COLORS.gray}; font-size: 13px; margin: 0;">
        Ideale per chi cerca più equilibrio tra performance e benessere.
      </p>
    `)}

    ${sectionDivider()}

    <p style="color: ${COLORS.primary}; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; margin: 0 0 10px 0;">
      COME USARLI
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Quando in una conversazione emerge il tema giusto,
      puoi semplicemente dire:
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0; font-style: italic;">
      "C'è una challenge gratuita di 5 giorni che potrebbe interessarti.
      Te la mando via messaggio?"
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Nessuna pressione. Solo un'offerta.<br>
      Se la persona è interessata, ha un percorso gratuito da provare.<br>
      Se non lo è, va bene così.
    </p>

    ${linkButton('→ Gestisci i tuoi link', `${APP_URL}/affiliate/links`)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: 'Come condividere (in pratica)',
    html: baseEmailTemplate(content),
  };
}

function getD6Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Ecco le domande più comuni e come puoi rispondere:
    </p>

    ${infoBox(`
      <p style="color: ${COLORS.primary}; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
        "QUANTO COSTA?"
      </p>
      <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
        La challenge è gratuita, 5 giorni. Poi ci sono abbonamenti annuali
        a partire da €149. Ma suggerisco di fare prima la challenge
        per capire se è il tipo di percorso che fa per te.
      </p>
    `)}

    ${infoBox(`
      <p style="color: ${COLORS.primary}; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
        "È UN CORSO ONLINE?"
      </p>
      <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
        Non proprio. È un percorso di sviluppo personale con esercizi settimanali
        e un AI Coach che ti guida. Non ci sono video da guardare per ore.
        Sono 15-20 minuti a settimana di riflessione pratica.
      </p>
    `)}

    ${infoBox(`
      <p style="color: ${COLORS.primary}; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
        "FUNZIONA DAVVERO?"
      </p>
      <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
        [Qui puoi raccontare la tua esperienza personale]
      </p>
    `)}

    ${infoBox(`
      <p style="color: ${COLORS.primary}; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
        "NON HO TEMPO"
      </p>
      <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
        Capisco. Gli esercizi richiedono 15-20 minuti a settimana.
        La challenge gratuita ti fa capire se riesci a trovare quel tempo.
      </p>
    `)}

    ${sectionDivider()}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Non devi avere tutte le risposte.<br>
      Se qualcuno fa una domanda che non sai, puoi dire:<br>
      <em>"Non lo so, ma puoi chiedere direttamente nella challenge."</em>
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: 'Cosa rispondere quando chiedono...',
    html: baseEmailTemplate(content),
  };
}

function getD7Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Hai tutto quello che ti serve:
    </p>

    <ul style="color: #525f7f; font-size: 16px; line-height: 28px; margin: 0 0 16px 0; padding-left: 20px;">
      <li>✓ La tua esperienza con Vitaeology</li>
      <li>✓ I tuoi link personalizzati</li>
      <li>✓ La comprensione di chi può beneficiarne</li>
      <li>✓ Le risposte alle domande comuni</li>
    </ul>

    ${sectionDivider()}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Da qui in poi, non riceverai email di "training".<br>
      Riceverai solo notifiche quando succede qualcosa:
      un click, una vendita, una commissione.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Non c'è pressione. Non ci sono obiettivi da raggiungere.<br>
      C'è solo la possibilità di condividere qualcosa che funziona,
      quando e se ha senso farlo.
    </p>

    ${linkButton('→ La tua dashboard è sempre qui', `${APP_URL}/affiliate/dashboard`)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 20px 0 0 0;">
      Grazie per essere parte di questo progetto.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: 'Da qui in poi',
    html: baseEmailTemplate(content),
  };
}

// ============================================================
// NOTIFICATION EMAILS (N1-N7)
// ============================================================

function getN1Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Il tuo link ha ricevuto il primo click.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Qualcuno che conosci (o che ha visto il tuo link da qualche parte)
      ha deciso di dare un'occhiata a Vitaeology.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Non significa ancora una vendita, ma significa che
      la tua condivisione ha raggiunto qualcuno.
    </p>

    ${linkButton('→ Vedi le statistiche', `${APP_URL}/affiliate/dashboard`)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: 'Qualcuno ha cliccato il tuo link',
    html: baseEmailTemplate(content, 'Notifica'),
  };
}

function getN2Content(data: AffiliateEmailData): { subject: string; html: string } {
  const totale = (data.importo_commissione || 0) + 25;

  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: ${COLORS.success}; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
      Hai generato la tua prima vendita.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Qualcuno ha iniziato il percorso Vitaeology grazie a te.
    </p>

    ${infoBox(`
      <p style="color: ${COLORS.primary}; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
        DETTAGLI
      </p>
      <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
        <strong>Prodotto:</strong> ${data.prodotto || 'Abbonamento'}<br>
        <strong>Commissione:</strong> €${data.importo_commissione?.toFixed(2) || '0.00'}<br>
        <strong>Bonus prima vendita:</strong> €25
      </p>
      <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 12px 0;">
      <p style="color: ${COLORS.primary}; font-size: 18px; font-weight: 600; margin: 0;">
        Totale guadagnato: €${totale.toFixed(2)}
      </p>
    `)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Quella persona ora ha accesso agli stessi strumenti che stai usando tu.<br>
      Questo è il vero risultato.
    </p>

    ${linkButton('→ Dashboard', `${APP_URL}/affiliate/dashboard`)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: '🎉 La tua prima vendita',
    html: baseEmailTemplate(content, 'Notifica'),
  };
}

function getN3Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Hai generato una nuova commissione.
    </p>

    ${infoBox(`
      <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
        <strong>Prodotto:</strong> ${data.prodotto || 'Abbonamento'}<br>
        <strong>Commissione:</strong> €${data.importo_commissione?.toFixed(2) || '0.00'} (${data.percentuale || data.commissione_totale}%)<br>
        <strong>Tipo:</strong> ${data.tipo_commissione === 'rinnovo' ? 'Rinnovo' : 'Nuova vendita'}
      </p>
    `)}

    <p style="color: ${COLORS.primary}; font-size: 18px; font-weight: 600; margin: 16px 0;">
      Saldo disponibile: €${data.saldo_disponibile?.toFixed(2) || '0.00'}
    </p>

    ${data.saldo_disponibile >= 50 ? `
      <p style="color: ${COLORS.success}; font-size: 14px; margin: 0 0 16px 0;">
        ✓ Puoi richiedere il payout
      </p>
    ` : ''}

    ${linkButton('→ Dashboard', `${APP_URL}/affiliate/dashboard`)}
  `;

  return {
    subject: `Nuova commissione: €${data.importo_commissione?.toFixed(2) || '0.00'}`,
    html: baseEmailTemplate(content, 'Notifica'),
  };
}

function getN4Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: ${COLORS.success}; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
      Hai raggiunto ${data.clienti_attivi} clienti attivi.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      La tua commissione ora è:
    </p>

    ${infoBox(`
      <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
        <strong>Base:</strong> ${data.commissione_base}%<br>
        <strong>Bonus performance:</strong> +${data.bonus_performance}%<br>
        <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 12px 0;">
        <strong style="color: ${COLORS.primary}; font-size: 18px;">Totale: ${data.commissione_totale}%</strong>
      </p>
    `)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Questo bonus si applica a tutte le tue commissioni, inclusi i rinnovi.
    </p>

    ${linkButton('→ Dashboard', `${APP_URL}/affiliate/dashboard`)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: `Hai sbloccato il bonus +${data.bonus_performance}%`,
    html: baseEmailTemplate(content, 'Notifica'),
  };
}

function getN5Content(data: AffiliateEmailData): { subject: string; html: string } {
  const bonusMensile = data.clienti_attivi >= 100 ? 1000 : 500;

  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: ${COLORS.gold}; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
      🏆 Milestone raggiunto!
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Hai raggiunto <strong>${data.clienti_attivi} clienti attivi</strong>.
    </p>

    ${infoBox(`
      <p style="color: ${COLORS.primary}; font-size: 18px; font-weight: 600; margin: 0;">
        Bonus mensile sbloccato: €${bonusMensile}
      </p>
    `)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      A partire da questo mese, riceverai €${bonusMensile}
      in aggiunta alle tue commissioni standard.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Grazie per il tuo impegno nel condividere Vitaeology.<br>
      Stai facendo davvero la differenza.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: `🏆 Milestone: ${data.clienti_attivi} clienti`,
    html: baseEmailTemplate(content, 'Notifica'),
  };
}

function getN6Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Il tuo saldo disponibile è <strong>€${data.saldo_disponibile?.toFixed(2)}</strong>.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Puoi richiedere il payout quando vuoi.
    </p>

    ${linkButton('→ Richiedi payout', `${APP_URL}/affiliate/dashboard`)}

    <p style="color: ${COLORS.gray}; font-size: 14px; line-height: 22px; margin: 20px 0 0 0;">
      I pagamenti vengono elaborati entro 5 giorni lavorativi.
    </p>
  `;

  return {
    subject: `Puoi richiedere il payout: €${data.saldo_disponibile?.toFixed(2)}`,
    html: baseEmailTemplate(content, 'Notifica'),
  };
}

function getN7Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: ${COLORS.success}; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
      Il tuo payout è stato elaborato.
    </p>

    ${infoBox(`
      <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
        <strong>Importo:</strong> €${data.importo_payout?.toFixed(2) || '0.00'}<br>
        <strong>Metodo:</strong> ${data.metodo_pagamento || 'Bonifico bancario'}<br>
        <strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}
      </p>
    `)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Il trasferimento dovrebbe arrivare entro 2-3 giorni lavorativi.
    </p>

    ${linkButton('→ Storico payout', `${APP_URL}/affiliate/dashboard`)}
  `;

  return {
    subject: `Payout completato: €${data.importo_payout?.toFixed(2) || '0.00'}`,
    html: baseEmailTemplate(content, 'Notifica'),
  };
}

// ============================================================
// ENGAGEMENT EMAIL (E1)
// ============================================================

function getE1Content(data: AffiliateEmailData): { subject: string; html: string } {
  const content = `
    <p style="color: ${COLORS.primary}; font-size: 20px; font-weight: 600; line-height: 28px; margin: 0 0 20px 0;">
      Ciao ${data.nome},
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Sono passate due settimane dal tuo ultimo click.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Nessuna pressione. Il programma affiliati non ha scadenze.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Ma se ti capita una conversazione giusta, ricorda che il tuo link è sempre qui:
    </p>

    ${infoBox(`
      <p style="color: ${COLORS.primary}; font-size: 14px; margin: 0;">
        <a href="${APP_URL}/challenge/leadership?ref=${data.ref_code}" style="color: ${COLORS.primary}; word-break: break-all;">
          ${APP_URL}/challenge/leadership?ref=${data.ref_code}
        </a>
      </p>
    `)}

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      A volte basta un messaggio al momento giusto alla persona giusta.
    </p>

    <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 30px 0 0 0;">
      Fernando
    </p>
  `;

  return {
    subject: 'Il tuo link è sempre attivo',
    html: baseEmailTemplate(content),
  };
}

// ============================================================
// MAIN SEND FUNCTION
// ============================================================

export async function sendAffiliateEmail(
  emailType: AffiliateEmailType,
  data: AffiliateEmailData,
  metadata?: Record<string, unknown>
): Promise<EmailResult> {
  let emailContent: { subject: string; html: string };

  switch (emailType) {
    case 'T1':
      emailContent = getT1Content(data);
      break;
    case 'D1':
      emailContent = getD1Content(data);
      break;
    case 'D2':
      emailContent = getD2Content(data);
      break;
    case 'D3':
      emailContent = getD3Content(data);
      break;
    case 'D4':
      emailContent = getD4Content(data);
      break;
    case 'D5':
      emailContent = getD5Content(data);
      break;
    case 'D6':
      emailContent = getD6Content(data);
      break;
    case 'D7':
      emailContent = getD7Content(data);
      break;
    case 'N1':
      emailContent = getN1Content(data);
      break;
    case 'N2':
      emailContent = getN2Content(data);
      break;
    case 'N3':
      emailContent = getN3Content(data);
      break;
    case 'N4':
      emailContent = getN4Content(data);
      break;
    case 'N5':
      emailContent = getN5Content(data);
      break;
    case 'N6':
      emailContent = getN6Content(data);
      break;
    case 'N7':
      emailContent = getN7Content(data);
      break;
    case 'E1':
      emailContent = getE1Content(data);
      break;
    default:
      return { success: false, error: `Tipo email non valido: ${emailType}` };
  }

  try {
    const { data: resendData, error } = await resend.emails.send({
      from: 'Fernando <fernando@vitaeology.com>',
      to: data.email,
      subject: emailContent.subject,
      html: emailContent.html,
      tags: [
        { name: 'type', value: emailType },
        { name: 'affiliate', value: 'true' },
      ],
    });

    if (error) {
      console.error(`Errore invio email ${emailType}:`, error);
      return { success: false, error: error.message };
    }

    // Log email nel database
    const supabase = getSupabase();
    await supabase.rpc('log_affiliate_email', {
      p_affiliate_id: metadata?.affiliateId as string,
      p_email_type: emailType,
      p_metadata: { resend_id: resendData?.id, ...metadata },
    });

    console.log(`📧 Email affiliato inviata: ${emailType} a ${data.email}`);
    return { success: true, emailId: resendData?.id };
  } catch (err) {
    console.error(`Errore sendAffiliateEmail ${emailType}:`, err);
    return { success: false, error: err instanceof Error ? err.message : 'Errore sconosciuto' };
  }
}

// ============================================================
// HELPER FUNCTION PER NOTIFICHE
// ============================================================

export async function sendAffiliateNotification(
  affiliateId: string,
  type: 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7',
  extraData?: Partial<AffiliateEmailData>
): Promise<boolean> {
  try {
    const supabase = getSupabase();

    // Recupera dati affiliato
    const { data: affiliate } = await supabase
      .from('v_affiliates_email_data')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .single();

    if (!affiliate) {
      console.error('Affiliato non trovato:', affiliateId);
      return false;
    }

    const emailData: AffiliateEmailData = {
      nome: affiliate.nome,
      email: affiliate.email,
      ref_code: affiliate.ref_code,
      abbonamento_utente: affiliate.abbonamento_utente,
      commissione_base: affiliate.commissione_base,
      bonus_performance: affiliate.bonus_performance,
      commissione_totale: affiliate.commissione_totale,
      clienti_attivi: affiliate.clienti_attivi,
      saldo_disponibile: affiliate.saldo_disponibile,
      giorni_iscrizione: affiliate.giorni_iscrizione,
      esercizi_completati: affiliate.esercizi_completati,
      conversazioni_coach: affiliate.conversazioni_coach,
      ...extraData,
    };

    const result = await sendAffiliateEmail(type, emailData, { affiliateId });
    return result.success;
  } catch (error) {
    console.error(`Errore notifica ${type}:`, error);
    return false;
  }
}
