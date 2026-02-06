// ============================================================================
// API: /api/affiliate/register
// Descrizione: Registrazione nuovo affiliato con anti-spam
// Metodo: POST
// Auth: Pubblica (chiunque può registrarsi) + Turnstile
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateEmail, checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { validateName, isDefinitelySpam } from '@/lib/validation/name-validator';
import { isIPBlocked, blockIP, blockedIPResponse } from '@/lib/validation/ip-blocklist';
import { logSignupAttempt, shouldAutoBlockIP } from '@/lib/validation/signup-logger';

interface RegisterAffiliateInput {
  email: string;
  nome: string;
  cognome?: string;
  sito_web?: string;
  canali_promozione?: string[];
  come_promuovera?: string;
  accetta_termini: boolean;
  turnstileToken?: string;
}

// Rate limit per affiliate registration
const AFFILIATE_RATE_LIMIT = {
  maxRequests: 3,
  windowSeconds: 600, // 3 tentativi ogni 10 minuti
  identifier: 'affiliate-register',
};

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || undefined;

  // 0. Verifica IP blocklist
  const ipBlockCheck = await isIPBlocked(clientIP);
  if (ipBlockCheck.isBlocked) {
    return blockedIPResponse();
  }

  // Rate limiting
  const rateLimit = checkRateLimit(clientIP, AFFILIATE_RATE_LIMIT);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetIn);
  }

  try {
    const supabase = await createClient();
    const body: RegisterAffiliateInput = await request.json();

    // 1. Verifica Turnstile
    if (!body.turnstileToken) {
      await logSignupAttempt({
        email: body.email || 'missing',
        name: body.nome,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: false,
        emailValid: true,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: 'missing_turnstile',
        success: false,
        source: 'affiliate',
      });

      return NextResponse.json(
        { error: 'Verifica di sicurezza mancante. Ricarica la pagina.' },
        { status: 400 }
      );
    }

    const turnstileResult = await verifyTurnstileToken(body.turnstileToken, clientIP);
    if (!turnstileResult.success) {
      await logSignupAttempt({
        email: body.email || 'missing',
        name: body.nome,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: false,
        emailValid: true,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: 'turnstile_failed',
        success: false,
        source: 'affiliate',
      });

      return NextResponse.json(
        { error: 'Verifica di sicurezza fallita. Riprova.' },
        { status: 400 }
      );
    }

    // 2. Validazione campi obbligatori
    if (!body.email || !body.nome) {
      return NextResponse.json(
        { error: 'Email e nome sono obbligatori' },
        { status: 400 }
      );
    }

    if (!body.accetta_termini) {
      return NextResponse.json(
        { error: 'Devi accettare i termini del programma affiliati' },
        { status: 400 }
      );
    }

    // 3. Validazione email completa
    const emailValidation = validateEmail(body.email);
    if (!emailValidation.valid) {
      await logSignupAttempt({
        email: body.email,
        name: body.nome,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: false,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: `email_invalid: ${emailValidation.reason}`,
        success: false,
        source: 'affiliate',
      });

      return NextResponse.json(
        { error: emailValidation.reason || 'Email non valida' },
        { status: 400 }
      );
    }

    // 4. Validazione nome (anti-spam)
    const fullName = body.cognome ? `${body.nome} ${body.cognome}` : body.nome;
    const nameValidation = validateName(fullName);
    const nameSuspicionScore = nameValidation.suspicionScore;

    if (isDefinitelySpam(nameValidation)) {
      await logSignupAttempt({
        email: body.email,
        name: fullName,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: true,
        nameSuspicionScore,
        blocked: true,
        blockReason: `spam_name: ${nameValidation.flags.join(', ')}`,
        success: false,
        source: 'affiliate',
      });

      // Auto-block IP se troppi tentativi spam
      const autoBlockCheck = await shouldAutoBlockIP(clientIP);
      if (autoBlockCheck.shouldBlock) {
        await blockIP(clientIP, autoBlockCheck.reason || 'Too many spam attempts', 24);
      }

      return NextResponse.json(
        { error: nameValidation.reason || 'Il nome inserito non è valido' },
        { status: 400 }
      );
    }

    // 5. Verifica email già registrata
    const { data: existingAffiliate } = await supabase
      .from('affiliates')
      .select('id, stato')
      .eq('email', body.email.toLowerCase())
      .single();

    if (existingAffiliate) {
      if (existingAffiliate.stato === 'terminated') {
        return NextResponse.json(
          { error: 'Questo indirizzo email non può essere utilizzato' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Email già registrata nel programma affiliati' },
        { status: 409 }
      );
    }

    // 6. Crea affiliato
    const { data: { user } } = await supabase.auth.getUser();

    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .insert({
        email: body.email.toLowerCase(),
        nome: body.nome.trim(),
        cognome: body.cognome?.trim() || null,
        sito_web: body.sito_web?.trim() || null,
        canali_promozione: body.canali_promozione || [],
        note_admin: body.come_promuovera || null,
        user_id: user?.id || null,
        stato: 'pending',
        categoria: 'BASE',
        commissione_percentuale: 30,
        termini_accettati: true,
        termini_accettati_at: new Date().toISOString(),
      })
      .select('id, ref_code, email, nome, stato, categoria')
      .single();

    if (error) {
      console.error('Errore creazione affiliato:', error);

      await logSignupAttempt({
        email: body.email.toLowerCase(),
        name: fullName,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: true,
        nameSuspicionScore,
        blocked: false,
        blockReason: 'db_error',
        success: false,
        source: 'affiliate',
      });

      return NextResponse.json(
        { error: 'Errore durante la registrazione. Riprova più tardi.' },
        { status: 500 }
      );
    }

    // 7. Log successo
    await logSignupAttempt({
      email: body.email.toLowerCase(),
      name: fullName,
      ipAddress: clientIP,
      userAgent,
      turnstilePassed: true,
      emailValid: true,
      nameSuspicionScore,
      blocked: false,
      success: true,
      source: 'affiliate',
      metadata: {
        affiliateId: affiliate.id,
        refCode: affiliate.ref_code,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registrazione completata! Riceverai una email quando il tuo account sarà attivato.',
      affiliate: {
        id: affiliate.id,
        ref_code: affiliate.ref_code,
        email: affiliate.email,
        nome: affiliate.nome,
        stato: affiliate.stato,
        categoria: affiliate.categoria,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Errore API affiliate/register:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
