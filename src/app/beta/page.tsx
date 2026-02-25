// ============================================================================
// PAGE: /beta (Server Component Wrapper)
// Forza rendering dinamico per evitare BAILOUT_TO_CLIENT_SIDE_RENDERING
// Il contenuto client è in BetaPageContent.tsx
// ============================================================================

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import BetaPageContent from './BetaPageContent';

export const dynamic = 'force-dynamic';

function BetaPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-petrol-800 via-petrol-900 to-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
    </div>
  );
}

function BetaPageError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-petrol-800 via-petrol-900 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <p className="text-white text-lg mb-4">Si è verificato un errore nel caricamento.</p>
        <a
          href=""
          className="inline-block bg-gold-500 hover:bg-gold-600 text-petrol-900 font-bold py-3 px-6 rounded-lg transition"
        >
          Riprova
        </a>
      </div>
    </div>
  );
}

export default function BetaPage() {
  return (
    <ErrorBoundary fallback={<BetaPageError />}>
      <Suspense fallback={<BetaPageLoading />}>
        <BetaPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}
