// API per esportare conversazioni AI Coach in TXT o PDF
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { jsPDF } from 'jspdf';

interface ConversationMessage {
  user_message: string;
  ai_response: string;
  created_at: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Parametri dalla query string
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const format = searchParams.get('format') || 'txt';

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId richiesto' },
        { status: 400 }
      );
    }

    if (format !== 'txt' && format !== 'pdf') {
      return NextResponse.json(
        { error: 'Formato non valido. Usa "txt" o "pdf"' },
        { status: 400 }
      );
    }

    // Fetch messaggi della sessione
    const { data: messages, error: queryError } = await supabase
      .from('ai_coach_conversations')
      .select('user_message, ai_response, created_at')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error('Errore query export:', queryError);
      return NextResponse.json(
        { error: 'Errore nel recupero della conversazione' },
        { status: 500 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Conversazione non trovata' },
        { status: 404 }
      );
    }

    // Genera contenuto in base al formato
    if (format === 'txt') {
      const txtContent = generateTxt(messages);
      const filename = generateFilename(messages, 'txt');

      return new NextResponse(txtContent, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === 'pdf') {
      const pdfArrayBuffer = await generatePdf(messages);
      const filename = generateFilename(messages, 'pdf');

      return new NextResponse(pdfArrayBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Formato non supportato' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Errore API export:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Genera contenuto TXT
function generateTxt(messages: ConversationMessage[]): string {
  const date = new Date().toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let content = `CONVERSAZIONE CON FERNANDO AI COACH
Data export: ${date}
Vitaeology - Leadership Autentica

${'='.repeat(50)}

`;

  messages.forEach(msg => {
    const timestamp = new Date(msg.created_at).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Messaggio utente
    content += `[${timestamp}] Tu:\n${msg.user_message}\n\n`;

    // Risposta Fernando
    content += `[${timestamp}] Fernando:\n${msg.ai_response}\n\n`;
    content += `${'-'.repeat(50)}\n\n`;
  });

  content += `${'='.repeat(50)}

Esportato da Vitaeology - vitaeology.com
Questo documento contiene ${messages.length} scambi di messaggi.`;

  return content;
}

// Genera nome file
function generateFilename(messages: ConversationMessage[], ext: string): string {
  const date = new Date().toISOString().split('T')[0];

  // Usa il primo messaggio utente per il titolo
  const firstMessage = messages[0]?.user_message || 'conversazione';
  const titleWords = firstMessage
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Rimuovi accenti
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 4)
    .join('-');

  return `vitaeology-chat-${date}-${titleWords || 'export'}.${ext}`;
}

// Genera PDF
async function generatePdf(messages: ConversationMessage[]): Promise<ArrayBuffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Funzione per aggiungere footer
  const addFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Vitaeology - vitaeology.com',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // Funzione per verificare e gestire nuova pagina
  const checkNewPage = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - 25) {
      addFooter();
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // === HEADER ===
  doc.setFontSize(20);
  doc.setTextColor(10, 37, 64); // Blu petrolio #0A2540
  doc.text('VITAEOLOGY', margin, yPosition);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const exportDate = new Date().toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(exportDate, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 8;

  // Sottotitolo
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Conversazione con Fernando AI Coach', margin, yPosition);

  yPosition += 10;

  // === TITOLO CONVERSAZIONE ===
  const firstMessage = messages[0]?.user_message || 'Conversazione';
  const title = firstMessage.slice(0, 70);
  doc.setFontSize(14);
  doc.setTextColor(10, 37, 64);

  const titleLines = doc.splitTextToSize(title + (firstMessage.length > 70 ? '...' : ''), contentWidth);
  titleLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 4;

  // Linea separatrice
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // === MESSAGGI ===
  // Limita a 50 messaggi (scambi)
  const messagesToExport = messages.slice(0, 50);
  const wasTruncated = messages.length > 50;

  messagesToExport.forEach((msg, index) => {
    // Timestamp
    const timestamp = new Date(msg.created_at).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // --- Messaggio Utente ---
    checkNewPage(25);

    // Background grigio per messaggio utente
    doc.setFillColor(245, 245, 245);

    // Calcola altezza messaggio utente
    doc.setFontSize(10);
    const userLines = doc.splitTextToSize(msg.user_message, contentWidth - 10);
    const userHeight = userLines.length * 5 + 14;

    doc.roundedRect(margin, yPosition - 2, contentWidth, userHeight, 2, 2, 'F');

    // Header messaggio utente
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tu - ${timestamp}`, margin + 5, yPosition + 4);
    yPosition += 10;

    // Contenuto messaggio utente
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    userLines.forEach((line: string) => {
      checkNewPage(8);
      doc.text(line, margin + 5, yPosition);
      yPosition += 5;
    });

    yPosition += 8;

    // --- Risposta Fernando ---
    checkNewPage(25);

    // Header risposta Fernando
    doc.setFontSize(9);
    doc.setTextColor(10, 37, 64);
    doc.text(`Fernando - ${timestamp}`, margin, yPosition);
    yPosition += 6;

    // Contenuto risposta Fernando
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const fernandoLines = doc.splitTextToSize(msg.ai_response, contentWidth);
    fernandoLines.forEach((line: string) => {
      checkNewPage(8);
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });

    yPosition += 10;

    // Separatore tra scambi (tranne ultimo)
    if (index < messagesToExport.length - 1) {
      doc.setDrawColor(230, 230, 230);
      doc.line(margin + 20, yPosition - 5, pageWidth - margin - 20, yPosition - 5);
    }
  });

  // Nota troncamento
  if (wasTruncated) {
    checkNewPage(15);
    yPosition += 5;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `[Conversazione troncata - mostrati ${messagesToExport.length} di ${messages.length} scambi]`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
  }

  // Footer ultima pagina
  addFooter();

  // Ritorna ArrayBuffer direttamente
  return doc.output('arraybuffer');
}
