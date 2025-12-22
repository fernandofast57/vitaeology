import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  // Verifica che l'utente sia admin
  const adminCheck = await verifyAdminFromRequest();
  if (!adminCheck.isAdmin) {
    return adminCheck.response;
  }

  try {
    const { patternId, action } = await request.json();

    if (!patternId || !action) {
      return NextResponse.json(
        { error: 'patternId e action richiesti' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { error } = await supabase
      .from('ai_coach_patterns')
      .update({
        status: newStatus,
        applied_action: action === 'approve'
          ? (await supabase.from('ai_coach_patterns').select('suggested_action').eq('id', patternId).single()).data?.suggested_action
          : null,
      })
      .eq('id', patternId);

    if (error) {
      console.error('Errore aggiornamento pattern:', error);
      return NextResponse.json(
        { error: 'Errore aggiornamento' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      patternId,
      newStatus,
    });

  } catch (error) {
    console.error('Errore patterns API:', error);
    return NextResponse.json(
      { error: 'Errore interno' },
      { status: 500 }
    );
  }
}
