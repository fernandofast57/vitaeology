// GET /api/beta/stats - Metriche beta testing (admin only)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Forza rendering dinamico (usa cookies)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Verifica admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }

    // Metriche testers
    const { data: testers } = await supabase
      .from('beta_testers')
      .select('status');

    const testerStats = {
      total: testers?.length || 0,
      pending: testers?.filter(t => t.status === 'pending').length || 0,
      approved: testers?.filter(t => t.status === 'approved').length || 0,
      active: testers?.filter(t => t.status === 'active').length || 0,
      rejected: testers?.filter(t => t.status === 'rejected').length || 0,
      completed: testers?.filter(t => t.status === 'completed').length || 0,
    };

    // Metriche feedback
    const { data: feedback } = await supabase
      .from('beta_feedback')
      .select('type, status, severity');

    const feedbackStats = {
      total: feedback?.length || 0,
      bugs: feedback?.filter(f => f.type === 'bug').length || 0,
      suggestions: feedback?.filter(f => f.type === 'suggestion').length || 0,
      questions: feedback?.filter(f => f.type === 'question').length || 0,
      praise: feedback?.filter(f => f.type === 'praise').length || 0,
      open: feedback?.filter(f => f.status === 'new' || f.status === 'in_progress').length || 0,
      resolved: feedback?.filter(f => f.status === 'resolved').length || 0,
      criticalOpen: feedback?.filter(f =>
        f.severity === 'critical' &&
        (f.status === 'new' || f.status === 'in_progress')
      ).length || 0,
      highOpen: feedback?.filter(f =>
        f.severity === 'high' &&
        (f.status === 'new' || f.status === 'in_progress')
      ).length || 0,
    };

    // Bug critici aperti (dettaglio)
    const { data: criticalBugs } = await supabase
      .from('beta_feedback')
      .select(`
        id,
        created_at,
        description,
        page_url,
        beta_testers (
          full_name
        )
      `)
      .eq('type', 'bug')
      .eq('severity', 'critical')
      .in('status', ['new', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(10);

    // Feedback ultimi 7 giorni
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: recentFeedback } = await supabase
      .from('beta_feedback')
      .select('type, created_at')
      .gte('created_at', weekAgo.toISOString());

    const weeklyStats = {
      total: recentFeedback?.length || 0,
      bugs: recentFeedback?.filter(f => f.type === 'bug').length || 0,
      suggestions: recentFeedback?.filter(f => f.type === 'suggestion').length || 0,
    };

    // Candidature ultimi 7 giorni
    const { data: recentTesters } = await supabase
      .from('beta_testers')
      .select('id')
      .gte('created_at', weekAgo.toISOString());

    const weeklyApplications = recentTesters?.length || 0;

    return NextResponse.json({
      testers: testerStats,
      feedback: feedbackStats,
      criticalBugs: criticalBugs || [],
      weekly: {
        applications: weeklyApplications,
        feedback: weeklyStats,
      },
    });
  } catch (error) {
    console.error('Errore API beta/stats:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
