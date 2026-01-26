'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserPathways, type UserPathwayWithDetails } from '@/lib/pathways';
import PathwaysOverview from '@/components/dashboard/PathwaysOverview';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

type PathType = 'leadership' | 'ostacoli' | 'microfelicita';

// Mappa pathway slug → dashboard path
const PATHWAY_TO_DASHBOARD: Record<string, PathType> = {
  'leadership': 'leadership',
  'risolutore': 'ostacoli',
  'microfelicita': 'microfelicita',
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [userPathways, setUserPathways] = useState<UserPathwayWithDetails[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFoundingTester, setIsFoundingTester] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const determineView = async () => {
      try {
        // 1. Controlla query param ?path=
        const pathParam = searchParams.get('path') as PathType | null;
        if (pathParam && ['leadership', 'ostacoli', 'microfelicita'].includes(pathParam)) {
          const openChat = searchParams.get('openChat');
          const redirectUrl = `/dashboard/${pathParam}${openChat ? '?openChat=true' : ''}`;
          router.replace(redirectUrl);
          return;
        }

        // 2. Controlla autenticazione
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/login');
          return;
        }

        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Check if user is a founding tester
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_founding_tester')
          .eq('id', user.id)
          .single();
        setIsFoundingTester(profile?.is_founding_tester || false);

        // 3. Ottieni percorsi attivi da user_pathways
        const pathways = await getUserPathways(supabase, user.id);

        // 4. Determina comportamento basato su numero percorsi
        if (pathways.length === 0) {
          // Nessun percorso → controlla profilo legacy
          const { data: profile } = await supabase
            .from('profiles')
            .select('current_path')
            .eq('id', user.id)
            .single();

          if (profile?.current_path) {
            const dashboardPath = PATHWAY_TO_DASHBOARD[profile.current_path] || 'leadership';
            const openChat = searchParams.get('openChat');
            router.replace(`/dashboard/${dashboardPath}${openChat ? '?openChat=true' : ''}`);
          } else {
            // Default a leadership
            router.replace('/dashboard/leadership');
          }
          return;
        }

        if (pathways.length === 1) {
          // Singolo percorso → redirect diretto
          const dashboardPath = PATHWAY_TO_DASHBOARD[pathways[0].pathway.slug] || 'leadership';
          const openChat = searchParams.get('openChat');
          router.replace(`/dashboard/${dashboardPath}${openChat ? '?openChat=true' : ''}`);
          return;
        }

        // 5. Percorsi multipli → mostra overview
        setUserPathways(pathways);
        setLoading(false);

      } catch (error) {
        console.error('Error determining view:', error);
        router.replace('/dashboard/leadership');
      }
    };

    determineView();
  }, [router, searchParams, supabase]);

  // Loading durante la determinazione
  if (loading && userPathways.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-petrol-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  // Multi-pathway overview
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={userEmail}
        userName={userName}
      />
      <div className="lg:pl-64">
        <DashboardHeader
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setSidebarOpen(true)}
          isBetaTester={isFoundingTester}
        />

        {/* Multi-pathway header */}
        <div className="bg-gradient-to-r from-petrol-600 to-petrol-700 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-medium">
                {userPathways.length} percorsi attivi
              </span>
            </div>
            <span className="text-sm opacity-80">Piano Multi-Percorso</span>
          </div>
        </div>

        <main className="p-4 md:p-6 lg:p-8">
          <PathwaysOverview
            pathways={userPathways}
            userName={userName}
          />
        </main>
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
      <DashboardContent />
    </Suspense>
  );
}
