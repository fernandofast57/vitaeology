'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type PathType = 'leadership' | 'ostacoli' | 'microfelicita';

function DashboardRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const determineAndRedirect = async () => {
      try {
        // 1. Controlla query param ?path=
        const pathParam = searchParams.get('path') as PathType | null;
        if (pathParam && ['leadership', 'ostacoli', 'microfelicita'].includes(pathParam)) {
          const openChat = searchParams.get('openChat');
          const redirectUrl = `/dashboard/${pathParam}${openChat ? '?openChat=true' : ''}`;
          router.replace(redirectUrl);
          return;
        }

        // 2. Controlla profilo utente per current_path o ultimo assessment
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Controlla current_path nel profilo
          const { data: profile } = await supabase
            .from('profiles')
            .select('current_path')
            .eq('id', user.id)
            .single();

          if (profile?.current_path && ['leadership', 'ostacoli', 'microfelicita'].includes(profile.current_path)) {
            const openChat = searchParams.get('openChat');
            const redirectUrl = `/dashboard/${profile.current_path}${openChat ? '?openChat=true' : ''}`;
            router.replace(redirectUrl);
            return;
          }

          // Controlla ultimo assessment completato
          // Leadership
          const { data: leadershipAssessment } = await supabase
            .from('user_assessments')
            .select('completed_at')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();

          // Ostacoli
          const { data: ostacoliAssessment } = await supabase
            .from('risolutore_results')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Microfelicita
          const { data: microfelicitaAssessment } = await supabase
            .from('microfelicita_results')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Trova il piu recente
          const assessments = [
            { path: 'leadership' as PathType, date: leadershipAssessment?.completed_at },
            { path: 'ostacoli' as PathType, date: ostacoliAssessment?.created_at },
            { path: 'microfelicita' as PathType, date: microfelicitaAssessment?.created_at },
          ].filter(a => a.date);

          if (assessments.length > 0) {
            assessments.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
            const mostRecentPath = assessments[0].path;
            const openChat = searchParams.get('openChat');
            const redirectUrl = `/dashboard/${mostRecentPath}${openChat ? '?openChat=true' : ''}`;
            router.replace(redirectUrl);
            return;
          }
        }

        // 3. Default: leadership
        const openChat = searchParams.get('openChat');
        router.replace(`/dashboard/leadership${openChat ? '?openChat=true' : ''}`);

      } catch (error) {
        console.error('Error determining path:', error);
        // Fallback a leadership
        router.replace('/dashboard/leadership');
      }
    };

    determineAndRedirect();
  }, [router, searchParams, supabase]);

  // Loading durante il redirect
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-petrol-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Caricamento dashboard...</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-petrol-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardRedirect />
    </Suspense>
  );
}
