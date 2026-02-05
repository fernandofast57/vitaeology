import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLibroBySlug } from '@/data/libri';
import ConversionTracker from '@/components/tracking/ConversionTracker';
import DownloadBookButton from '@/components/libro/DownloadBookButton';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string; bump?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const libro = getLibroBySlug(slug);

  return {
    title: libro ? `Grazie per l'acquisto | ${libro.titolo}` : 'Grazie',
  };
}

export default async function GraziePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { session_id, bump } = await searchParams;
  const libro = getLibroBySlug(slug);
  const isBump = bump === 'true';

  if (!libro) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      {/* Tracking conversione acquisto */}
      <ConversionTracker
        event={isBump ? 'Subscribe' : 'Purchase'}
        data={{
          content_name: libro.titolo,
          content_category: isBump ? 'subscription_leader' : 'libro',
          value: isBump ? 149 : libro.prezzo,
          currency: 'EUR',
        }}
      />
      <div className="max-w-lg w-full text-center">
        {/* Icona successo */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl"
          style={{ backgroundColor: isBump ? '#F4B942' : libro.coloreAccent }}
        >
          {isBump ? '🎁' : '✓'}
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {isBump ? 'Benvenuto nel programma Leader!' : 'Grazie per il tuo acquisto!'}
        </h1>

        <p className="text-gray-600 mb-6">
          {isBump ? (
            <>
              Hai attivato l&apos;accesso <strong>Leader</strong> con il libro <strong>{libro.titolo}</strong> incluso.
              <br />
              Il PDF è in arrivo nella tua casella email.
            </>
          ) : (
            <>
              Hai acquistato <strong>{libro.titolo}</strong>.
              <br />
              Il PDF è in arrivo nella tua casella email.
            </>
          )}
        </p>

        {/* Box info */}
        <div
          className="rounded-xl p-6 mb-8 text-white"
          style={{ backgroundColor: isBump ? '#0A2540' : libro.coloreAccent }}
        >
          <h2 className="text-xl font-bold mb-3">
            {isBump ? 'Il tuo accesso Leader include:' : 'Cosa succede ora?'}
          </h2>
          <div className="space-y-3 text-left text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">📧</span>
              <div>
                <strong>Email in arrivo</strong>
                <p className="opacity-90">
                  Riceverai il link per scaricare il PDF entro pochi minuti.
                </p>
              </div>
            </div>
            {isBump ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <div>
                    <strong>52 esercizi settimanali</strong>
                    <p className="opacity-90">
                      Un anno intero di esercizi pratici per sviluppare la tua leadership.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🤖</span>
                  <div>
                    <strong>AI Coach illimitato</strong>
                    <p className="opacity-90">
                      Fernando, il tuo coach AI personale, disponibile 24/7.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📊</span>
                  <div>
                    <strong>Assessment completo</strong>
                    <p className="opacity-90">
                      Mappa le tue 24 caratteristiche di leadership.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📊</span>
                  <div>
                    <strong>Assessment gratuito</strong>
                    <p className="opacity-90">
                      Accedi all&apos;assessment per mappare il tuo punto di partenza.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <strong>Supporto</strong>
                    <p className="opacity-90">
                      Problemi? Scrivici a supporto@vitaeology.com
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Download diretto libro */}
        <div className="mb-6">
          <DownloadBookButton
            bookSlug={slug}
            color={libro.coloreAccent}
          />
          <p className="text-xs text-gray-400 mt-2">
            Il PDF è anche in arrivo nella tua email.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href={`/assessment/${libro.assessmentSlug}`}
            className="block w-full py-3 px-6 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: libro.coloreAccent }}
          >
            Fai l&apos;Assessment Gratuito
          </Link>

          <Link
            href="/dashboard"
            className="block w-full py-3 px-6 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Vai alla Dashboard
          </Link>

          <Link
            href="/"
            className="inline-block text-sm text-gray-500 hover:underline mt-4"
          >
            Torna alla Home
          </Link>
        </div>

        {/* Riferimento ordine */}
        {session_id && (
          <p className="mt-8 text-xs text-gray-400">
            Riferimento ordine: {session_id.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}
