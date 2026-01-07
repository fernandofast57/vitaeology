// API Challenge Feedback
// Salva feedback completamento challenge

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validazione
    const validChallenges = ['leadership', 'ostacoli', 'microfelicita'];
    const validActions = ['assessment', 'exercises', 'coach', 'time', 'book'];

    if (!validChallenges.includes(body.challenge_type)) {
      return NextResponse.json({ error: 'Tipo challenge non valido' }, { status: 400 });
    }

    if (!validActions.includes(body.next_action)) {
      return NextResponse.json({ error: 'Azione non valida' }, { status: 400 });
    }

    const { error } = await supabase
      .from('challenge_feedback')
      .insert({
        user_id: user.id,
        challenge_type: body.challenge_type,
        next_action: body.next_action,
        missing_feedback: body.missing_feedback || null
      });

    if (error) {
      console.error('Errore salvataggio feedback:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Errore parsing body:', err);
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
  }
}

// GET - Ottieni statistiche feedback (per admin)
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

  // Statistiche aggregate
  const { data: stats } = await supabase
    .from('challenge_feedback')
    .select('challenge_type, next_action');

  const aggregated = {
    by_challenge: {} as Record<string, number>,
    by_action: {} as Record<string, number>,
    total: stats?.length || 0
  };

  stats?.forEach(item => {
    aggregated.by_challenge[item.challenge_type] = (aggregated.by_challenge[item.challenge_type] || 0) + 1;
    aggregated.by_action[item.next_action] = (aggregated.by_action[item.next_action] || 0) + 1;
  });

  // Feedback testuale recenti
  const { data: recentFeedback } = await supabase
    .from('challenge_feedback')
    .select('challenge_type, next_action, missing_feedback, created_at')
    .not('missing_feedback', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    stats: aggregated,
    recent_feedback: recentFeedback || []
  });
}
