'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PathDashboard from '@/components/dashboard/PathDashboard';

function OstacoliDashboardContent() {
  const searchParams = useSearchParams();
  const openChat = searchParams.get('openChat') === 'true';

  return <PathDashboard pathType="ostacoli" autoOpenChat={openChat} />;
}

export default function OstacoliDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OstacoliDashboardContent />
    </Suspense>
  );
}
