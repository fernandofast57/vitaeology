// API per esportare risultati Assessment in PDF
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { jsPDF } from 'jspdf';
import { AssessmentResults, PILLAR_CONFIG } from '@/lib/assessment-scoring';

export const dynamic = 'force-dynamic';

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
    const assessmentId = searchParams.get('id');

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'ID assessment richiesto' },
        { status: 400 }
      );
    }

    // Fetch assessment con risultati
    const { data: assessment, error: queryError } = await supabase
      .from('user_assessments')
      .select(`
        id,
        user_id,
        assessment_type,
        status,
        overall_score,
        completed_at,
        characteristic_scores (
          characteristic_id,
          average_score,
          characteristics (
            id,
            code,
            name,
            pillar
          )
        )
      `)
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single();

    if (queryError || !assessment) {
      console.error('Errore query assessment:', queryError);
      return NextResponse.json(
        { error: 'Assessment non trovato' },
        { status: 404 }
      );
    }

    if (assessment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Assessment non completato' },
        { status: 400 }
      );
    }

    // Calcola risultati formattati
    const results = calculateResults(assessment as AssessmentData);

    // Genera PDF
    const pdfArrayBuffer = await generateAssessmentPdf(results, assessment.completed_at);
    const filename = `vitaeology-assessment-${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Errore API export assessment:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

interface CharacteristicData {
  id: string;
  code: string;
  name: string;
  pillar: string;
}

interface AssessmentData {
  overall_score: number;
  characteristic_scores: Array<{
    characteristic_id: string;
    average_score: number;
    // Supabase può restituire array o oggetto singolo per relazioni
    characteristics: CharacteristicData | CharacteristicData[] | null;
  }>;
}

function calculateResults(assessment: AssessmentData): AssessmentResults {
  const scores = assessment.characteristic_scores || [];

  // Raggruppa per pilastro
  const pillarScores: Record<string, number[]> = {};
  const characteristics: AssessmentResults['characteristics'] = [];

  scores.forEach((score) => {
    // Supabase può restituire array o oggetto singolo per relazioni
    const charData = score.characteristics;
    const char = Array.isArray(charData) ? charData[0] : charData;
    if (!char) return;

    const pillar = char.pillar;
    if (!pillarScores[pillar]) {
      pillarScores[pillar] = [];
    }
    pillarScores[pillar].push(score.average_score);

    characteristics.push({
      // Il DB usa UUID string ma il tipo aspetta number - converti per compatibilità
      characteristicId: typeof char.id === 'number' ? char.id : parseInt(char.id, 10) || 0,
      characteristicCode: char.code,
      characteristicName: char.name,
      pillar: pillar,
      averageScore: score.average_score,
      percentage: Math.round((score.average_score / 5) * 100),
    });
  });

  // Calcola medie pilastri
  const pillars: AssessmentResults['pillars'] = Object.entries(PILLAR_CONFIG).map(
    ([pillarKey, config]) => {
      const pillarCharScores = pillarScores[pillarKey] || [];
      const avg =
        pillarCharScores.length > 0
          ? pillarCharScores.reduce((a, b) => a + b, 0) / pillarCharScores.length
          : 0;

      return {
        pillar: pillarKey,
        pillarLabel: config.label,
        color: config.color,
        averageScore: avg,
        percentage: Math.round((avg / 5) * 100),
      };
    }
  );

  // Ordina caratteristiche per punteggio
  const sorted = [...characteristics].sort((a, b) => b.averageScore - a.averageScore);
  const topStrengths = sorted.slice(0, 5);
  const growthAreas = sorted.slice(-5).reverse();

  // Calcola overall
  const overallScore = assessment.overall_score || 0;
  const overallPercentage = Math.round((overallScore / 5) * 100);

  return {
    overallScore,
    overallPercentage,
    pillars,
    characteristics,
    topStrengths,
    growthAreas,
  };
}

async function generateAssessmentPdf(
  results: AssessmentResults,
  completedAt: string
): Promise<ArrayBuffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Colori Vitaeology (come tuple per TypeScript)
  const petrolio: [number, number, number] = [10, 37, 64]; // #0A2540
  const oro: [number, number, number] = [244, 185, 66]; // #F4B942

  // Footer
  const addFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Vitaeology - vitaeology.com', pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });
  };

  // Nuova pagina se necessario
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
  doc.setFontSize(24);
  doc.setTextColor(...petrolio);
  doc.text('VITAEOLOGY', margin, yPosition);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const exportDate = new Date().toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(exportDate, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 10;

  // Sottotitolo
  doc.setFontSize(14);
  doc.setTextColor(...petrolio);
  doc.text('Il Tuo Profilo Leadership', margin, yPosition);

  yPosition += 8;

  // Data completamento
  if (completedAt) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const completedDate = new Date(completedAt).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Completato il ${completedDate}`, margin, yPosition);
  }

  yPosition += 10;

  // Linea separatrice
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // === PUNTEGGIO COMPLESSIVO ===
  doc.setFillColor(...oro);
  doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('PUNTEGGIO COMPLESSIVO', margin + 10, yPosition + 10);

  doc.setFontSize(24);
  doc.text(`${results.overallPercentage}%`, margin + contentWidth - 30, yPosition + 16, {
    align: 'right',
  });

  doc.setFontSize(10);
  doc.text(
    `Media: ${results.overallScore.toFixed(2)} / 5`,
    margin + contentWidth - 30,
    yPosition + 22,
    { align: 'right' }
  );

  yPosition += 35;

  // === I 4 PILASTRI ===
  doc.setFontSize(14);
  doc.setTextColor(...petrolio);
  doc.text('I Quattro Pilastri della Leadership', margin, yPosition);
  yPosition += 10;

  const pillarBoxWidth = (contentWidth - 10) / 2;
  const pillarBoxHeight = 20;

  results.pillars.forEach((pillar, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = margin + col * (pillarBoxWidth + 10);
    const y = yPosition + row * (pillarBoxHeight + 8);

    // Background grigio chiaro
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, y, pillarBoxWidth, pillarBoxHeight, 2, 2, 'F');

    // Nome pilastro
    doc.setFontSize(10);
    const rgb = hexToRgb(pillar.color);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text(pillar.pillarLabel, x + 5, y + 8);

    // Percentuale
    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text(`${pillar.percentage}%`, x + pillarBoxWidth - 10, y + 13, {
      align: 'right',
    });

    // Barra progresso
    const barY = y + pillarBoxHeight - 5;
    const barWidth = pillarBoxWidth - 10;
    doc.setFillColor(220, 220, 220);
    doc.rect(x + 5, barY, barWidth, 2, 'F');
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.rect(x + 5, barY, (barWidth * pillar.percentage) / 100, 2, 'F');
  });

  yPosition += 2 * (pillarBoxHeight + 8) + 15;

  // === AREE DI ECCELLENZA ===
  checkNewPage(60);

  doc.setFontSize(14);
  doc.setTextColor(...petrolio);
  doc.text('Le Tue Aree di Eccellenza', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Queste sono le caratteristiche in cui già operi con maggiore consapevolezza.',
    margin,
    yPosition
  );
  yPosition += 8;

  results.topStrengths.forEach((char, index) => {
    checkNewPage(12);

    doc.setFillColor(236, 253, 245); // green-50
    doc.roundedRect(margin, yPosition, contentWidth, 10, 1, 1, 'F');

    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74); // green-600
    doc.text(`#${index + 1}`, margin + 5, yPosition + 7);

    doc.setTextColor(50, 50, 50);
    doc.text(char.characteristicName, margin + 20, yPosition + 7);

    doc.setTextColor(22, 163, 74);
    doc.text(`${char.percentage}%`, margin + contentWidth - 5, yPosition + 7, {
      align: 'right',
    });

    yPosition += 12;
  });

  yPosition += 10;

  // === OPPORTUNITÀ DI ESPANSIONE ===
  checkNewPage(60);

  doc.setFontSize(14);
  doc.setTextColor(...petrolio);
  doc.text('Opportunità di Espansione', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Queste caratteristiche rappresentano spazi dove puoi espandere ulteriormente le tue capacità.',
    margin,
    yPosition
  );
  yPosition += 8;

  results.growthAreas.forEach((char, index) => {
    checkNewPage(12);

    doc.setFillColor(255, 251, 235); // amber-50
    doc.roundedRect(margin, yPosition, contentWidth, 10, 1, 1, 'F');

    doc.setFontSize(10);
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text(`#${index + 1}`, margin + 5, yPosition + 7);

    doc.setTextColor(50, 50, 50);
    doc.text(char.characteristicName, margin + 20, yPosition + 7);

    doc.setTextColor(217, 119, 6);
    doc.text(`${char.percentage}%`, margin + contentWidth - 5, yPosition + 7, {
      align: 'right',
    });

    yPosition += 12;
  });

  yPosition += 15;

  // === DETTAGLIO 24 CARATTERISTICHE ===
  checkNewPage(30);

  doc.setFontSize(14);
  doc.setTextColor(...petrolio);
  doc.text('Dettaglio Completo - 24 Caratteristiche', margin, yPosition);
  yPosition += 10;

  Object.entries(PILLAR_CONFIG).forEach(([pillarKey, config]) => {
    const pillarChars = results.characteristics.filter((c) => c.pillar === pillarKey);
    if (pillarChars.length === 0) return;

    checkNewPage(40);

    // Header pilastro
    const rgb = hexToRgb(config.color);
    doc.setFontSize(11);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text(config.label, margin, yPosition);

    doc.setDrawColor(rgb.r, rgb.g, rgb.b);
    doc.line(margin, yPosition + 2, margin + 50, yPosition + 2);
    yPosition += 8;

    // Caratteristiche del pilastro
    pillarChars.forEach((char) => {
      checkNewPage(8);

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(char.characteristicCode, margin, yPosition);

      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text(char.characteristicName, margin + 12, yPosition);

      // Mini barra
      const barX = margin + 90;
      const barWidth = 50;
      doc.setFillColor(220, 220, 220);
      doc.rect(barX, yPosition - 3, barWidth, 3, 'F');
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(barX, yPosition - 3, (barWidth * char.percentage) / 100, 3, 'F');

      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text(`${char.percentage}%`, margin + contentWidth - 5, yPosition, {
        align: 'right',
      });

      yPosition += 6;
    });

    yPosition += 8;
  });

  // === FOOTER FINALE ===
  checkNewPage(30);
  yPosition += 10;

  doc.setFillColor(...petrolio);
  doc.roundedRect(margin, yPosition, contentWidth, 20, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Continua il tuo percorso su vitaeology.com', pageWidth / 2, yPosition + 12, {
    align: 'center',
  });

  // Footer pagina
  addFooter();

  return doc.output('arraybuffer');
}

// Helper: hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
