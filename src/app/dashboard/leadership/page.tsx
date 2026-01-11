'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PathDashboard from '@/components/dashboard/PathDashboard';

function LeadershipDashboardContent() {
  const searchParams = useSearchParams();
  const openChat = searchParams.get('openChat') === 'true';

  return <PathDashboard pathType="leadership" autoOpenChat={openChat} />;
}

export default function LeadershipDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-amber-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeadershipDashboardContent />
    </Suspense>
  );
}
