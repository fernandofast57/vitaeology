import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challengeType = searchParams.get('type');
  const dayNumber = searchParams.get('day');

  if (!challengeType || !dayNumber) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Validate challenge type
  if (!['leadership', 'ostacoli', 'microfelicita'].includes(challengeType)) {
    return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
  }

  // Validate day number
  const day = parseInt(dayNumber);
  if (isNaN(day) || day < 1 || day > 7) {
    return NextResponse.json({ error: 'Invalid day number' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Day 1 is always unlocked
  if (day === 1) {
    // Check if Day 1 is completed
    const { count: day1Count } = await supabase
      .from('challenge_discovery_responses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('challenge_type', challengeType)
      .eq('day_number', 1);

    return NextResponse.json({
      unlocked: true,
      completed: day1Count === 3,
      currentDay: 1,
      responsesCount: day1Count || 0
    });
  }

  // Check if previous day is completed (has 3 responses)
  const previousDay = day - 1;

  const { count: prevCount } = await supabase
    .from('challenge_discovery_responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('challenge_type', challengeType)
    .eq('day_number', previousDay);

  const isUnlocked = prevCount === 3;

  // Check if current day is completed
  const { count: currentCount } = await supabase
    .from('challenge_discovery_responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('challenge_type', challengeType)
    .eq('day_number', day);

  return NextResponse.json({
    unlocked: isUnlocked,
    completed: currentCount === 3,
    currentDay: day,
    previousDayCompleted: prevCount === 3,
    responsesCount: currentCount || 0
  });
}

// Get full progress for a challenge
export async function POST(request: NextRequest) {
  try {
    const { challengeType } = await request.json();

    if (!challengeType || !['leadership', 'ostacoli', 'microfelicita'].includes(challengeType)) {
      return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all responses for this challenge
    const { data: responses } = await supabase
      .from('challenge_discovery_responses')
      .select('day_number, question_number, response')
      .eq('user_id', user.id)
      .eq('challenge_type', challengeType)
      .order('day_number', { ascending: true });

    // Calculate progress
    const dayProgress: Record<number, { completed: boolean; responses: number }> = {};

    for (let day = 1; day <= 7; day++) {
      const dayResponses = responses?.filter(r => r.day_number === day) || [];
      dayProgress[day] = {
        completed: dayResponses.length === 3,
        responses: dayResponses.length
      };
    }

    // Find current unlocked day (first incomplete or next after last complete)
    let currentUnlockedDay = 1;
    for (let day = 1; day <= 7; day++) {
      if (dayProgress[day].completed) {
        currentUnlockedDay = Math.min(day + 1, 7);
      } else {
        break;
      }
    }

    // Calculate completion percentage
    const totalResponses = responses?.length || 0;
    const completionPercentage = Math.round((totalResponses / 21) * 100);

    return NextResponse.json({
      challengeType,
      dayProgress,
      currentUnlockedDay,
      totalResponses,
      completionPercentage,
      isComplete: totalResponses === 21
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
