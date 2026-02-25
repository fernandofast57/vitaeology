// ============================================================================
// PAGE: /challenge/ostacoli (Server Component Wrapper)
// Forza rendering dinamico per evitare BAILOUT_TO_CLIENT_SIDE_RENDERING
// Il contenuto client è in OstacoliLandingContent.tsx
// ============================================================================

import { ErrorBoundary } from '@/components/ErrorBoundary';
import OstacoliLandingContent from './OstacoliLandingContent';

export const dynamic = 'force-dynamic';

function OstacoliError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <p className="text-white text-lg mb-4">Si è verificato un errore nel caricamento.</p>
        <a
          href=""
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          Riprova
        </a>
      </div>
    </div>
  );
}

export default function OstacoliLanding() {
  return (
    <ErrorBoundary fallback={<OstacoliError />}>
      <OstacoliLandingContent />
    </ErrorBoundary>
  );
}
