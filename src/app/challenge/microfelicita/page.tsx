// ============================================================================
// PAGE: /challenge/microfelicita (Server Component Wrapper)
// Forza rendering dinamico per evitare BAILOUT_TO_CLIENT_SIDE_RENDERING
// Il contenuto client è in MicrofelicitaLandingContent.tsx
// ============================================================================

import MicrofelicitaLandingContent from './MicrofelicitaLandingContent';

export const dynamic = 'force-dynamic';

export default function MicrofelicitaLanding() {
  return <MicrofelicitaLandingContent />;
}
