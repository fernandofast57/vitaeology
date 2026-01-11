'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PathDashboard from '@/components/dashboard/PathDashboard';

function MicrofelicitaDashboardContent() {
  const searchParams = useSearchParams();
  const openChat = searchParams.get('openChat') === 'true';

  return <PathDashboard pathType="microfelicita" autoOpenChat={openChat} />;
}

export default function MicrofelicitaDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-violet-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MicrofelicitaDashboardContent />
    </Suspense>
  );
}
