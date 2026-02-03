// API Challenge Beta Feedback
// Gestisce feedback dettagliato per beta tester
// Obiettivo: 30+ feedback, 10+ testimonials utilizzabili

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST - Salva feedback beta tester
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validazione challenge_type
    const validChallenges = ['leadership', 'ostacoli', 'microfelicita'];
    if (!validChallenges.includes(body.challenge_type)) {
      return NextResponse.json({ error: 'Tipo challenge non valido' }, { status: 400 });
    }

    // Validazione overall_rating (obbligatorio)
    const rating = parseInt(body.overall_rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating non valido (1-5)' }, { status: 400 });
    }

    // Validazione NPS score (opzionale ma se presente deve essere 0-10)
    let npsScore = null;
    if (body.nps_score !== undefined && body.nps_score !== null && body.nps_score !== '') {
      npsScore = parseInt(body.nps_score);
      if (isNaN(npsScore) || npsScore < 0 || npsScore > 10) {
        return NextResponse.json({ error: 'NPS score non valido (0-10)' }, { status: 400 });
      }
    }

    // Verifica feedback non già inviato per questa challenge
    const { data: existing } = await supabase
      .from('challenge_beta_feedback')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_type', body.challenge_type)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Hai già inviato un feedback per questa challenge' }, { status: 409 });
    }

    // Salva feedback
    const { error } = await supabase
      .from('challenge_beta_feedback')
      .insert({
        user_id: user.id,
        challenge_type: body.challenge_type,
        overall_rating: rating,
        nps_score: npsScore,
        what_worked: body.what_worked?.trim() || null,
        what_could_improve: body.what_could_improve?.trim() || null,
        testimonial: body.testimonial?.trim() || null,
        testimonial_consent: body.testimonial_consent || false,
        display_name: body.display_name?.trim() || null,
        would_recommend: body.would_recommend,
        is_beta_tester: true,
        completed_days: body.completed_days || 7,
        // UTM tracking
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_content: body.utm_content || null,
      });

    if (error) {
      console.error('Errore salvataggio beta feedback:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Errore parsing body:', err);
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
  }
}

// GET - Statistiche feedback (per admin)
export async function GET(request: NextRequest) {
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

  const url = new URL(request.url);
  const challengeFilter = url.searchParams.get('challenge');

  // Query base
  let query = supabase
    .from('challenge_beta_feedback')
    .select('*')
    .eq('is_beta_tester', true);

  if (challengeFilter) {
    query = query.eq('challenge_type', challengeFilter);
  }

  const { data: feedbacks, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Errore lettura feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calcola statistiche
  const stats = {
    total_feedbacks: feedbacks?.length || 0,
    avg_rating: 0,
    avg_nps: 0,
    testimonials_available: 0,
    promoters: 0,       // NPS 9-10
    passives: 0,        // NPS 7-8
    detractors: 0,      // NPS 0-6
    by_challenge: {} as Record<string, {
      count: number;
      avg_rating: number;
      testimonials: number;
    }>,
    rating_distribution: [0, 0, 0, 0, 0], // 1-5 stars
  };

  if (feedbacks && feedbacks.length > 0) {
    let totalRating = 0;
    let npsCount = 0;
    let totalNps = 0;

    feedbacks.forEach((fb) => {
      // Rating stats
      totalRating += fb.overall_rating;
      stats.rating_distribution[fb.overall_rating - 1]++;

      // NPS stats
      if (fb.nps_score !== null) {
        totalNps += fb.nps_score;
        npsCount++;
        if (fb.nps_score >= 9) stats.promoters++;
        else if (fb.nps_score >= 7) stats.passives++;
        else stats.detractors++;
      }

      // Testimonials
      if (fb.testimonial_consent && fb.testimonial && fb.testimonial.length > 20) {
        stats.testimonials_available++;
      }

      // By challenge
      if (!stats.by_challenge[fb.challenge_type]) {
        stats.by_challenge[fb.challenge_type] = {
          count: 0,
          avg_rating: 0,
          testimonials: 0,
        };
      }
      stats.by_challenge[fb.challenge_type].count++;
      stats.by_challenge[fb.challenge_type].avg_rating += fb.overall_rating;
      if (fb.testimonial_consent && fb.testimonial) {
        stats.by_challenge[fb.challenge_type].testimonials++;
      }
    });

    stats.avg_rating = Math.round((totalRating / feedbacks.length) * 10) / 10;
    stats.avg_nps = npsCount > 0 ? Math.round((totalNps / npsCount) * 10) / 10 : 0;

    // Calcola avg per challenge
    Object.keys(stats.by_challenge).forEach((key) => {
      const ch = stats.by_challenge[key];
      ch.avg_rating = Math.round((ch.avg_rating / ch.count) * 10) / 10;
    });
  }

  // NPS Score: (Promoters - Detractors) / Total * 100
  const totalNpsResponses = stats.promoters + stats.passives + stats.detractors;
  const npsNetScore = totalNpsResponses > 0
    ? Math.round(((stats.promoters - stats.detractors) / totalNpsResponses) * 100)
    : 0;

  // Testimonials approvati
  const { data: testimonials } = await supabase
    .from('challenge_beta_feedback')
    .select('id, challenge_type, overall_rating, testimonial, display_name, created_at')
    .eq('testimonial_consent', true)
    .not('testimonial', 'is', null)
    .order('overall_rating', { ascending: false })
    .limit(20);

  // Beta tester challenge choice stats (from /beta signups with variant='beta')
  const { data: betaSubscribers } = await supabase
    .from('challenge_subscribers')
    .select('challenge, status, current_day')
    .eq('variant', 'beta');

  // Calculate challenge choice stats
  const challengeChoiceStats = {
    total_signups: 0,
    by_challenge: {} as Record<string, {
      signups: number;
      active: number;
      completed: number;
      avg_progress: number;
      percentage: number;
    }>,
  };

  if (betaSubscribers && betaSubscribers.length > 0) {
    challengeChoiceStats.total_signups = betaSubscribers.length;

    // Map DB challenge names to display names
    const challengeMap: Record<string, string> = {
      'leadership-autentica': 'leadership',
      'oltre-ostacoli': 'ostacoli',
      'microfelicita': 'microfelicita',
    };

    betaSubscribers.forEach((sub) => {
      const normalizedChallenge = challengeMap[sub.challenge] || sub.challenge;

      if (!challengeChoiceStats.by_challenge[normalizedChallenge]) {
        challengeChoiceStats.by_challenge[normalizedChallenge] = {
          signups: 0,
          active: 0,
          completed: 0,
          avg_progress: 0,
          percentage: 0,
        };
      }

      challengeChoiceStats.by_challenge[normalizedChallenge].signups++;
      if (sub.status === 'active') {
        challengeChoiceStats.by_challenge[normalizedChallenge].active++;
      }
      if (sub.status === 'completed') {
        challengeChoiceStats.by_challenge[normalizedChallenge].completed++;
      }
      challengeChoiceStats.by_challenge[normalizedChallenge].avg_progress += sub.current_day || 0;
    });

    // Calculate averages and percentages
    Object.keys(challengeChoiceStats.by_challenge).forEach((key) => {
      const ch = challengeChoiceStats.by_challenge[key];
      ch.avg_progress = ch.signups > 0 ? Math.round((ch.avg_progress / ch.signups) * 10) / 10 : 0;
      ch.percentage = Math.round((ch.signups / challengeChoiceStats.total_signups) * 100);
    });
  }

  return NextResponse.json({
    stats: {
      ...stats,
      nps_net_score: npsNetScore,
    },
    testimonials: testimonials || [],
    recent_feedbacks: feedbacks?.slice(0, 10) || [],
    challenge_choice_stats: challengeChoiceStats,
  });
}
