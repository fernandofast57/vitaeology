/**
 * API per checkout bump: Libro GRATIS + Leader subscription
 *
 * Quando un utente sulla pagina libro non compra,
 * offriamo: Libro gratuito + accesso Leader a €149/anno
 */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getLibroBySlug } from '@/data/libri';
import { PRICING_TIERS } from '@/config/pricing';

export const dynamic = 'force-dynamic';

const AFFILIATE_COOKIE_NAME = 'vitae_ref';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { libroSlug } = await request.json();

    // Validazione libro
    const libro = getLibroBySlug(libroSlug);
    if (!libro) {
      return NextResponse.json({ error: 'Libro non trovato' }, { status: 404 });
    }

    // Tier Leader per il bump
    const leaderTier = PRICING_TIERS.leader;
    if (!leaderTier.stripePriceId) {
      console.error('Stripe Price ID non configurato per Leader tier');
      return NextResponse.json(
        { error: 'Configurazione pagamento non disponibile' },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();
    const supabaseAuth = await createServerClient();

    // Verifica utente autenticato
    const { data: { user } } = await supabaseAuth.auth.getUser();

    let customerId: string | undefined;
    let userId: string | undefined;
    let userEmail: string | undefined;
    let isFoundingTester = false;

    if (user) {
      userId = user.id;
      userEmail = user.email;

      // Recupera o crea Stripe customer e founding tester status
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id, is_founding_tester')
        .eq('id', user.id)
        .single();

      customerId = profile?.stripe_customer_id;
      isFoundingTester = profile?.is_founding_tester === true;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        });
        customerId = customer.id;

        await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);
      }
    }

    // Affiliate tracking
    let affiliateId: string | undefined;
    let clickId: string | undefined;

    const refCode = request.cookies.get(AFFILIATE_COOKIE_NAME)?.value;
    if (refCode) {
      const { data: affiliate } = await supabaseAdmin
        .from('affiliates')
        .select('id')
        .eq('ref_code', refCode)
        .eq('stato', 'attivo')
        .single();

      if (affiliate) {
        affiliateId = affiliate.id;

        // Trova click più recente
        const { data: click } = await supabaseAdmin
          .from('affiliate_clicks')
          .select('id')
          .eq('affiliate_id', affiliate.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (click) {
          clickId = click.id;
        }
      }
    }

    // Metadata per il checkout
    const sessionMetadata: Record<string, string> = {
      tipo: 'bump_libro_leader',
      tier_slug: 'leader',
      tier_name: leaderTier.name,
      libro_slug: libro.slug,
      libro_titolo: libro.titolo,
      libro_incluso: 'true',
    };

    if (userId) sessionMetadata.user_id = userId;
    if (affiliateId) sessionMetadata.affiliate_id = affiliateId;
    if (clickId) sessionMetadata.affiliate_click_id = clickId;

    // Founding Tester Discount
    const foundingTesterCouponId = process.env.STRIPE_FOUNDING_TESTER_COUPON_ID;
    const hasFoundingDiscount = isFoundingTester && foundingTesterCouponId;

    // Crea checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: leaderTier.stripePriceId!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/libro/${libro.slug}/grazie?bump=true${hasFoundingDiscount ? '&founding=true' : ''}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/libro/${libro.slug}`,
      metadata: sessionMetadata,
      subscription_data: {
        metadata: {
          tier_slug: 'leader',
          tier_name: leaderTier.name,
          libro_slug: libro.slug,
          libro_incluso: 'true',
          is_founding_tester: hasFoundingDiscount ? 'true' : 'false',
        },
      },
      // Descrizione personalizzata
      custom_text: {
        submit: {
          message: `Include: "${libro.titolo}" (PDF) + Accesso Leader per 1 anno${hasFoundingDiscount ? ' (Sconto Founding Tester applicato!)' : ''}`,
        },
      },
    };

    // Auto-apply founding tester discount OR allow promo codes
    if (hasFoundingDiscount) {
      sessionConfig.discounts = [{ coupon: foundingTesterCouponId }];
    } else {
      sessionConfig.allow_promotion_codes = true;
    }

    // Aggiungi customer se autenticato
    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (userEmail) {
      sessionConfig.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Analytics: traccia visualizzazione bump offer
    if (userId) {
      try {
        await supabaseAdmin.from('analytics_events').insert({
          user_id: userId,
          event_type: 'bump_offer_checkout_started',
          event_data: {
            libro_slug: libro.slug,
            tier: 'leader',
            source: 'libro_page_exit_intent',
          },
        });
      } catch {
        // Non bloccare per errori analytics
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Errore bump checkout:', error);
    return NextResponse.json(
      { error: 'Errore creazione checkout' },
      { status: 500 }
    );
  }
}
