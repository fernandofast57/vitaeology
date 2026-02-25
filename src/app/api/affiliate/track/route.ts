// ============================================================================
// API: /api/affiliate/track
// Descrizione: Tracking click sui link affiliato
// Metodo: POST
// Auth: Pubblica (chiamato dal middleware)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _supabaseAdmin;
}

const COOKIE_DURATION_DAYS = 90;

interface TrackInput {
  event_type: 'click' | 'signup' | 'challenge_started' | 'challenge_complete';
  ref_code: string;
  landing_page: string;
  challenge_type?: string;
  user_agent?: string;
  referrer?: string;
  user_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackInput = await request.json();

    if (!body.ref_code || !body.landing_page) {
      return NextResponse.json({ error: 'ref_code e landing_page sono obbligatori' }, { status: 400 });
    }

    const refCodePattern = /^AFF-[A-Z0-9]{6}$/;
    if (!refCodePattern.test(body.ref_code)) {
      return NextResponse.json({ error: 'Formato ref_code non valido' }, { status: 400 });
    }

    const { data: affiliate, error: affiliateError } = await getSupabaseAdmin()
      .from('affiliates')
      .select('id, stato')
      .eq('ref_code', body.ref_code)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json({ error: 'Affiliato non trovato' }, { status: 404 });
    }

    if (affiliate.stato !== 'active') {
      return NextResponse.json({ error: 'Affiliato non attivo' }, { status: 400 });
    }

    const cookieId = uuidv4();
    const visitorId = generateVisitorId(request);
    const cookieExpiresAt = new Date();
    cookieExpiresAt.setDate(cookieExpiresAt.getDate() + COOKIE_DURATION_DAYS);

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '';
    const ipAnonymized = anonymizeIp(ip);
    const userAgent = body.user_agent || request.headers.get('user-agent') || '';
    const deviceInfo = parseUserAgent(userAgent);

    const { data: click, error: clickError } = await getSupabaseAdmin()
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliate.id,
        ref_code: body.ref_code,
        visitor_id: visitorId,
        cookie_id: cookieId,
        cookie_expires_at: cookieExpiresAt.toISOString(),
        ip_anonymized: ipAnonymized,
        user_agent: userAgent.substring(0, 500),
        landing_page: body.landing_page,
        challenge_type: body.challenge_type || null,
        referrer_url: body.referrer?.substring(0, 1000) || null,
        device_type: deviceInfo.type,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        stato_conversione: body.event_type || 'click',
        user_id: body.user_id || null,
      })
      .select('id, cookie_id')
      .single();

    if (clickError) {
      console.error('Errore salvataggio click:', clickError);
      return NextResponse.json({ error: 'Errore salvataggio tracking' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cookie_id: click.cookie_id,
      expires_at: cookieExpiresAt.toISOString(),
    });

  } catch (error) {
    console.error('Errore API affiliate/track:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

function generateVisitorId(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || '';
  const ua = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept-language') || '';
  const combined = ip + '-' + ua + '-' + accept;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'VIS-' + Math.abs(hash).toString(36).toUpperCase().padStart(12, '0');
}

function anonymizeIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) return parts[0] + '.' + parts[1] + '.' + parts[2] + '.0';
  return 'anonymized';
}

function parseUserAgent(ua: string): { type: string; browser: string; os: string } {
  const lowerUa = ua.toLowerCase();
  let type = 'desktop';
  if (/mobile|android|iphone|ipod/.test(lowerUa)) type = 'mobile';
  else if (/ipad|tablet/.test(lowerUa)) type = 'tablet';

  let browser = 'unknown';
  if (/chrome/.test(lowerUa) && !/edge|edg/.test(lowerUa)) browser = 'Chrome';
  else if (/safari/.test(lowerUa) && !/chrome/.test(lowerUa)) browser = 'Safari';
  else if (/firefox/.test(lowerUa)) browser = 'Firefox';
  else if (/edge|edg/.test(lowerUa)) browser = 'Edge';

  let os = 'unknown';
  if (/windows/.test(lowerUa)) os = 'Windows';
  else if (/mac os|macos/.test(lowerUa)) os = 'macOS';
  else if (/android/.test(lowerUa)) os = 'Android';
  else if (/iphone|ipad|ios/.test(lowerUa)) os = 'iOS';
  else if (/linux/.test(lowerUa)) os = 'Linux';

  return { type, browser, os };
}
