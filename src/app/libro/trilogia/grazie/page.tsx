import { Metadata } from 'next';
import Link from 'next/link';
import { getTrilogia, getLibriTrilogia } from '@/data/libri';
import ConversionTracker from '@/components/tracking/ConversionTracker';

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export const metadata: Metadata = {
  title: 'Grazie per l\'acquisto | La Trilogia Rivoluzione Aurea',
};

export default async function GrazieTrilogiaPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;
  const trilogia = getTrilogia();
  const libri = getLibriTrilogia();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      {/* Tracking conversione acquisto */}
      <ConversionTracker
        event="Purchase"
        data={{
          content_name: trilogia.titolo,
          content_category: 'trilogy',
          value: trilogia.prezzo,
          currency: 'EUR',
        }}
      />

      <div className="max-w-lg w-full text-center">
        {/* Icona successo */}
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl bg-gradient-to-br from-petrol-600 to-petrol-700">
          🎉
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Complimenti per il tuo acquisto!
        </h1>

        <p className="text-gray-600 mb-6">
          Hai acquistato <strong>La Trilogia Rivoluzione Aurea</strong>.
          <br />
          I 3 PDF sono in arrivo nella tua casella email.
        </p>

        {/* Box info */}
        <div className="rounded-xl p-6 mb-8 text-white bg-gradient-to-br from-petrol-600 to-petrol-700">
          <h2 className="text-xl font-bold mb-4">
            La tua Trilogia include:
          </h2>
          <div className="space-y-3 text-left text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">📧</span>
              <div>
                <strong>Email con 3 link download</strong>
                <p className="opacity-90">
                  Riceverai i link per scaricare tutti i PDF entro pochi minuti.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📊</span>
              <div>
                <strong>3 Assessment completi</strong>
                <p className="opacity-90">
                  Accesso a Leadership, Risolutore e Microfelicità Assessment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📚</span>
              <div>
                <strong>3 Framework pratici</strong>
                <p className="opacity-90">
                  Le 24 Caratteristiche + CAMBIA + R.A.D.A.R.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mini cards libri */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {libri.map((libro) => (
            <div
              key={libro.slug}
              className="p-3 rounded-lg text-white text-center"
              style={{ backgroundColor: libro.coloreAccent }}
            >
              <span className="text-2xl mb-1 block">📖</span>
              <span className="text-xs font-medium leading-tight block">
                {libro.titolo}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full py-3 px-6 rounded-lg font-bold text-white bg-petrol-600 hover:bg-petrol-700 transition"
          >
            🚀 Vai alla Dashboard
          </Link>

          <Link
            href="/assessment/leadership"
            className="block w-full py-3 px-6 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Inizia con l&apos;Assessment Leadership
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
