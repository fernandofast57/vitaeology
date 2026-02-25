// ============================================================================
// PAGE: /challenge/ostacoli (Server Component Wrapper)
// Forza rendering dinamico per evitare BAILOUT_TO_CLIENT_SIDE_RENDERING
// Il contenuto client è in OstacoliLandingContent.tsx
// ============================================================================

import OstacoliLandingContent from './OstacoliLandingContent';

export const dynamic = 'force-dynamic';

export default function OstacoliLanding() {
  return <OstacoliLandingContent />;
}
