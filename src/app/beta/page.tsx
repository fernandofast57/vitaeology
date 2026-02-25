// ============================================================================
// PAGE: /beta (Server Component Wrapper)
// Forza rendering dinamico per evitare BAILOUT_TO_CLIENT_SIDE_RENDERING
// Il contenuto client è in BetaPageContent.tsx
// ============================================================================

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import BetaPageContent from './BetaPageContent';

export const dynamic = 'force-dynamic';

function BetaPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-petrol-800 via-petrol-900 to-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
    </div>
  );
}

export default function BetaPage() {
  return (
    <Suspense fallback={<BetaPageLoading />}>
      <BetaPageContent />
    </Suspense>
  );
}
