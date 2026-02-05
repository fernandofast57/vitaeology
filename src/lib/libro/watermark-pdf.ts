/**
 * Watermark PDF con nome e email dell'acquirente
 *
 * Fetcha il PDF originale server-side e aggiunge un testo
 * diagonale semi-trasparente su ogni pagina.
 */

import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

// Mapping slug → env var con URL del PDF originale
const PDF_ENV_KEYS: Record<string, string> = {
  leadership: 'PDF_URL_LEADERSHIP',
  risolutore: 'PDF_URL_RISOLUTORE',
  microfelicita: 'PDF_URL_MICROFELICITA',
};

interface WatermarkOptions {
  bookSlug: string;
  buyerEmail: string;
  buyerName: string;
}

/**
 * Genera un PDF con watermark personalizzato
 * Restituisce i bytes del PDF pronto per lo streaming
 */
export async function generateWatermarkedPdf({
  bookSlug,
  buyerEmail,
  buyerName,
}: WatermarkOptions): Promise<Uint8Array> {
  // Recupera URL del PDF originale
  const envKey = PDF_ENV_KEYS[bookSlug];
  if (!envKey) {
    throw new Error(`Slug libro non valido: ${bookSlug}`);
  }

  const pdfUrl = process.env[envKey];
  if (!pdfUrl) {
    throw new Error(`URL PDF non configurato: ${envKey}`);
  }

  // Fetch PDF originale (server-side, URL mai esposto al client)
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Errore fetch PDF: ${response.status} ${response.statusText}`);
  }

  const pdfBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Testo watermark
  const line1 = `Copia personale di ${buyerName}`;
  const line2 = buyerEmail;

  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Calcola posizione centrale della pagina
    const centerX = width / 2;
    const centerY = height / 2;

    // Riga 1: nome (36pt)
    const fontSize1 = 36;
    const textWidth1 = helvetica.widthOfTextAtSize(line1, fontSize1);
    page.drawText(line1, {
      x: centerX - textWidth1 / 2,
      y: centerY + 15,
      size: fontSize1,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.12,
      rotate: degrees(45),
    });

    // Riga 2: email (22pt)
    const fontSize2 = 22;
    const textWidth2 = helvetica.widthOfTextAtSize(line2, fontSize2);
    page.drawText(line2, {
      x: centerX - textWidth2 / 2,
      y: centerY - 25,
      size: fontSize2,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.12,
      rotate: degrees(45),
    });
  }

  return pdfDoc.save();
}
