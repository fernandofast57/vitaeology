// API: /api/affiliate/leaderboard - Classifica top affiliati
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface LeaderboardEntry {
  posizione: number;
  nome_visualizzato: string;
  totale_commissioni: number;
  totale_clienti: number;
  categoria: string;
  is_current_user: boolean;
}

// Anonimizza il nome: "Mario Rossi" → "M***o R."
function anonymizeName(nome: string | null, cognome: string | null): string {
  const n = nome?.trim() || 'Anonimo';
  const c = cognome?.trim() || '';

  if (n.length <= 2) {
    return c ? `${n} ${c.charAt(0)}.` : n;
  }

  const firstChar = n.charAt(0).toUpperCase();
  const lastChar = n.charAt(n.length - 1).toLowerCase();
  const cognomeInitial = c ? ` ${c.charAt(0).toUpperCase()}.` : '';

  return `${firstChar}***${lastChar}${cognomeInitial}`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Period filter: 'month' or 'all' (default: 'all')
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all';

    let currentUserAffiliateId: string | null = null;

    // Get current user's affiliate ID if logged in
    if (user) {
      const { data: currentAffiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .single();

      currentUserAffiliateId = currentAffiliate?.id || null;
    }

    let leaderboardData: LeaderboardEntry[] = [];
    let currentUserPosition: { posizione: number; totale_commissioni: number; totale_clienti: number } | null = null;

    if (period === 'month') {
      // For monthly leaderboard, calculate from commissions in current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get monthly totals from affiliate_commissions
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('affiliate_commissions')
        .select(`
          affiliate_id,
          importo_commissione_euro,
          affiliates!inner (
            id,
            nome,
            cognome,
            categoria,
            stato,
            totale_clienti_attivi
          )
        `)
        .gte('created_at', firstDayOfMonth.toISOString())
        .eq('stato', 'approved');

      if (monthlyError) {
        console.error('Error fetching monthly data:', monthlyError);
        return NextResponse.json({ error: 'Errore caricamento dati' }, { status: 500 });
      }

      // Aggregate by affiliate
      const affiliateMap = new Map<string, {
        id: string;
        nome: string | null;
        cognome: string | null;
        categoria: string;
        totale_clienti: number;
        totale_commissioni: number;
      }>();

      for (const row of monthlyData || []) {
        // Supabase returns joined data - handle both array and object cases
        const affiliatesData = row.affiliates;
        const aff = Array.isArray(affiliatesData) ? affiliatesData[0] : affiliatesData;

        if (!aff || aff.stato !== 'active') continue;

        const existing = affiliateMap.get(aff.id);
        if (existing) {
          existing.totale_commissioni += Number(row.importo_commissione_euro) || 0;
        } else {
          affiliateMap.set(aff.id, {
            id: aff.id,
            nome: aff.nome,
            cognome: aff.cognome,
            categoria: aff.categoria,
            totale_clienti: aff.totale_clienti_attivi || 0,
            totale_commissioni: Number(row.importo_commissione_euro) || 0,
          });
        }
      }

      // Sort and create leaderboard
      const sorted = Array.from(affiliateMap.values())
        .sort((a, b) => b.totale_commissioni - a.totale_commissioni);

      leaderboardData = sorted.slice(0, 20).map((aff, index) => ({
        posizione: index + 1,
        nome_visualizzato: anonymizeName(aff.nome, aff.cognome),
        totale_commissioni: aff.totale_commissioni,
        totale_clienti: aff.totale_clienti,
        categoria: aff.categoria,
        is_current_user: aff.id === currentUserAffiliateId,
      }));

      // Find current user position if not in top 20
      if (currentUserAffiliateId) {
        const userIndex = sorted.findIndex(a => a.id === currentUserAffiliateId);
        if (userIndex >= 0) {
          const userData = sorted[userIndex];
          currentUserPosition = {
            posizione: userIndex + 1,
            totale_commissioni: userData.totale_commissioni,
            totale_clienti: userData.totale_clienti,
          };
        }
      }

    } else {
      // All-time leaderboard: use totale_commissioni_euro from affiliates table
      const { data: allTimeData, error: allTimeError } = await supabase
        .from('affiliates')
        .select('id, nome, cognome, categoria, totale_commissioni_euro, totale_clienti_attivi')
        .eq('stato', 'active')
        .gt('totale_commissioni_euro', 0)
        .order('totale_commissioni_euro', { ascending: false })
        .limit(50); // Get more to find user position

      if (allTimeError) {
        console.error('Error fetching all-time data:', allTimeError);
        return NextResponse.json({ error: 'Errore caricamento dati' }, { status: 500 });
      }

      const allAffiliates = allTimeData || [];

      leaderboardData = allAffiliates.slice(0, 20).map((aff, index) => ({
        posizione: index + 1,
        nome_visualizzato: anonymizeName(aff.nome, aff.cognome),
        totale_commissioni: Number(aff.totale_commissioni_euro) || 0,
        totale_clienti: aff.totale_clienti_attivi || 0,
        categoria: aff.categoria,
        is_current_user: aff.id === currentUserAffiliateId,
      }));

      // Find current user position
      if (currentUserAffiliateId) {
        const userIndex = allAffiliates.findIndex(a => a.id === currentUserAffiliateId);
        if (userIndex >= 0) {
          const userData = allAffiliates[userIndex];
          currentUserPosition = {
            posizione: userIndex + 1,
            totale_commissioni: Number(userData.totale_commissioni_euro) || 0,
            totale_clienti: userData.totale_clienti_attivi || 0,
          };
        } else {
          // User not in top 50, get their data separately
          const { data: userData } = await supabase
            .from('affiliates')
            .select('totale_commissioni_euro, totale_clienti_attivi')
            .eq('id', currentUserAffiliateId)
            .single();

          if (userData) {
            // Count how many are ahead
            const { count } = await supabase
              .from('affiliates')
              .select('id', { count: 'exact', head: true })
              .eq('stato', 'active')
              .gt('totale_commissioni_euro', userData.totale_commissioni_euro);

            currentUserPosition = {
              posizione: (count || 0) + 1,
              totale_commissioni: Number(userData.totale_commissioni_euro) || 0,
              totale_clienti: userData.totale_clienti_attivi || 0,
            };
          }
        }
      }
    }

    return NextResponse.json({
      leaderboard: leaderboardData,
      current_user: currentUserPosition,
      period,
    });

  } catch (error) {
    console.error('Errore API affiliate/leaderboard:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
