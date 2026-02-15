import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { PRICING_TIERS, type PricingTierSlug } from '@/config/pricing';
import { checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

// Rate limit checkout: 5 sessioni per minuto (previene abuse)
const CHECKOUT_RATE_LIMIT = {
  maxRequests: 5,
  windowSeconds: 60,
  identifier: 'stripe-checkout',
};

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP, CHECKOUT_RATE_LIMIT);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetIn);
  }

  try {
    // === AUTENTICAZIONE SERVER-SIDE (C13 fix) ===
    const authSupabase = await createServerClient();
    const { data: { user: authUser }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Usa userId e email dall'auth server-side, non dal body
    const userId = authUser.id;
    const userEmail = authUser.email;

    const { tierSlug } = await request.json();

    // Validate required fields
    if (!tierSlug) {
      return NextResponse.json(
        { error: 'Missing required field: tierSlug' },
        { status: 400 }
      );
    }

    // Validate tier exists
    if (!PRICING_TIERS[tierSlug as PricingTierSlug]) {
      return NextResponse.json(
        { error: `Invalid tier: ${tierSlug}. Valid tiers: ${Object.keys(PRICING_TIERS).join(', ')}` },
        { status: 400 }
      );
    }

    const tier = PRICING_TIERS[tierSlug as PricingTierSlug];

    // Explorer is free, no checkout needed
    if (tier.price === 0) {
      return NextResponse.json(
        { error: 'Explorer is a free tier, no checkout required' },
        { status: 400 }
      );
    }

    // Get Stripe Price ID from tier config
    const priceId = tier.stripePriceId;

    if (!priceId) {
      console.error(`No Stripe Price ID configured for tier: ${tierSlug}`);
      return NextResponse.json(
        { error: `Stripe not configured for tier: ${tier.name}. Contact support.` },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const supabase = getServiceClient();

    // Check if user already has a Stripe customer ID and founding tester status
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, is_founding_tester')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Founding Tester Discount: auto-apply lifetime 30% discount
    const isFoundingTester = profile?.is_founding_tester === true;
    const foundingTesterCouponId = process.env.STRIPE_FOUNDING_TESTER_COUPON_ID;

    // Determine if this is a one-time payment or subscription
    const isOneTime = tier.interval === 'once';
    const checkoutMode = isOneTime ? 'payment' : 'subscription';

    // Build checkout session options
    const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: checkoutMode,
      success_url: isOneTime
        ? `${process.env.NEXT_PUBLIC_APP_URL}/acquisto/success?product=${tierSlug}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?plan=${tierSlug}${isFoundingTester ? '&founding=true' : ''}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: userId,
        tier_slug: tierSlug,
        is_founding_tester: isFoundingTester ? 'true' : 'false',
        payment_type: isOneTime ? 'one_time' : 'subscription',
      },
    };

    // Add subscription metadata only for subscriptions
    if (!isOneTime) {
      checkoutOptions.subscription_data = {
        metadata: {
          tier_slug: tierSlug,
          tier_name: tier.name,
          is_founding_tester: isFoundingTester ? 'true' : 'false',
        },
      };
    }

    // Auto-apply founding tester discount OR allow promo codes
    if (isFoundingTester && foundingTesterCouponId) {
      checkoutOptions.discounts = [{ coupon: foundingTesterCouponId }];
    } else {
      // Allow manual promo codes for non-founding testers
      checkoutOptions.allow_promotion_codes = true;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(checkoutOptions);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
