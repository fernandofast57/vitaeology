/**
 * Endpoint download protetto per i libri PDF
 *
 * Due modalità di accesso:
 * 1. Token mode (da email): GET /api/libro/download?token=<JWT>
 * 2. Auth mode (da dashboard/grazie): GET /api/libro/download?book=<slug>
 *
 * In entrambi i casi genera un PDF con watermark personalizzato.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyDownloadToken } from '@/lib/libro/download-token';
import { generateWatermarkedPdf } from '@/lib/libro/watermark-pdf';

// Titoli per Content-Disposition filename
const BOOK_FILENAMES: Record<string, string> = {
  leadership: 'Leadership-Autentica-Vitaeology.pdf',
  risolutore: 'Oltre-gli-Ostacoli-Vitaeology.pdf',
  microfelicita: 'Microfelicita-Digitale-Vitaeology.pdf',
};

const VALID_SLUGS = ['leadership', 'risolutore', 'microfelicita'];
const MAX_DOWNLOADS_PER_BOOK = 20;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const bookParam = searchParams.get('book');

  let email: string;
  let name: string;
  let bookSlug: string;

  // === MODALITÀ 1: Token da email ===
  if (token) {
    const payload = await verifyDownloadToken(token);

    if (!payload) {
      // Token scaduto o invalido → redirect a login con messaggio
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';
      return NextResponse.redirect(
        `${appUrl}/auth/login?message=${encodeURIComponent(
          'Il link di download è scaduto. Accedi al tuo account per scaricare il libro.'
        )}`
      );
    }

    email = payload.email;
    name = payload.name;
    bookSlug = payload.bookSlug;
  }
  // === MODALITÀ 2: Auth da dashboard/grazie ===
  else if (bookParam) {
    if (!VALID_SLUGS.includes(bookParam)) {
      return NextResponse.json({ error: 'Libro non valido' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    // Verifica che l'utente possieda il libro
    const { data: userBook } = await supabase
      .from('user_books')
      .select('id, download_count')
      .eq('user_id', user.id)
      .eq('book_slug', bookParam)
      .maybeSingle();

    if (!userBook) {
      return NextResponse.json(
        { error: 'Non hai acquistato questo libro' },
        { status: 403 }
      );
    }

    // Rate limit soft
    if (userBook.download_count >= MAX_DOWNLOADS_PER_BOOK) {
      return NextResponse.json(
        {
          error:
            'Hai raggiunto il limite di download per questo libro. Contatta supporto@vitaeology.com per assistenza.',
        },
        { status: 429 }
      );
    }

    // Recupera nome dal profilo
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    email = user.email || '';
    name = profile?.full_name || '';
    bookSlug = bookParam;

    // Aggiorna conteggio download
    await supabase
      .from('user_books')
      .update({
        download_count: (userBook.download_count || 0) + 1,
        last_download_at: new Date().toISOString(),
      })
      .eq('id', userBook.id);
  } else {
    return NextResponse.json(
      { error: 'Parametro token o book richiesto' },
      { status: 400 }
    );
  }

  // === Genera PDF con watermark ===
  try {
    const pdfBytes = await generateWatermarkedPdf({
      bookSlug,
      buyerEmail: email,
      buyerName: name || email,
    });

    const filename = BOOK_FILENAMES[bookSlug] || 'Vitaeology-Libro.pdf';

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('Errore generazione PDF watermarked:', err);
    return NextResponse.json(
      { error: 'Errore nella generazione del PDF. Riprova tra qualche minuto.' },
      { status: 500 }
    );
  }
}
