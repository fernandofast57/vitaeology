// ============================================================================
// PAGE: /challenge/leadership (Server Component Wrapper)
// Forza rendering dinamico per evitare BAILOUT_TO_CLIENT_SIDE_RENDERING
// Il contenuto client è in LeadershipLandingContent.tsx
// ============================================================================

import { ErrorBoundary } from '@/components/ErrorBoundary';
import LeadershipLandingContent from './LeadershipLandingContent';

export const dynamic = 'force-dynamic';

function LeadershipError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <p className="text-white text-lg mb-4">Si è verificato un errore nel caricamento.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-6 rounded-lg transition"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}

export default function LeadershipLanding() {
  return (
    <ErrorBoundary fallback={<LeadershipError />}>
      <LeadershipLandingContent />
    </ErrorBoundary>
  );
}
