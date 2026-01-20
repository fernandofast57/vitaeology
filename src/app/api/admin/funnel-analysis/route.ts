// API Admin Funnel Analysis
// Analisi conversione: iscrizione → giorni → assessment

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface FunnelData {
  challenge_type: string;
  total_subscribers: number;
  day_completions: number[];
  assessment_completions: number;
  feedback_distribution: Record<string, number>;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  // Verifica admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, role_id')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.role_id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
  }

  // Mapping: display name → db slug
  const challengeMap: Record<string, string> = {
    'leadership': 'leadership-autentica',
    'ostacoli': 'oltre-ostacoli',
    'microfelicita': 'microfelicita'
  };
  const challengeTypes = ['leadership', 'ostacoli', 'microfelicita'];
  const funnelData: FunnelData[] = [];

  for (const challengeType of challengeTypes) {
    const dbSlug = challengeMap[challengeType];

    // 1. Totale iscritti
    const { count: totalSubscribers } = await supabase
      .from('challenge_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('challenge', dbSlug);

    // 2. Completamenti per giorno
    const dayCompletions: number[] = [];
    for (let day = 1; day <= 7; day++) {
      const { count } = await supabase
        .from('challenge_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('challenge', dbSlug)
        .gte('current_day', day);

      dayCompletions.push(count || 0);
    }

    // 3. Assessment completati (mapping challenge → assessment type)
    const assessmentTypeMap: Record<string, string> = {
      'leadership': 'leadership',
      'ostacoli': 'risolutore',
      'microfelicita': 'microfelicita'
    };

    const { count: assessmentCount } = await supabase
      .from('user_assessments_v2')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_type', assessmentTypeMap[challengeType])
      .eq('status', 'completed');

    // 4. Distribuzione feedback
    const { data: feedbackData } = await supabase
      .from('challenge_feedback')
      .select('next_action')
      .eq('challenge_type', challengeType);

    const feedbackDistribution: Record<string, number> = {};
    feedbackData?.forEach(item => {
      feedbackDistribution[item.next_action] = (feedbackDistribution[item.next_action] || 0) + 1;
    });

    funnelData.push({
      challenge_type: challengeType,
      total_subscribers: totalSubscribers || 0,
      day_completions: dayCompletions,
      assessment_completions: assessmentCount || 0,
      feedback_distribution: feedbackDistribution
    });
  }

  return NextResponse.json(funnelData);
}
