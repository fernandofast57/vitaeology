import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PRICING_TIERS, type PricingTierSlug } from '@/config/pricing';

export const dynamic = 'force-dynamic';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { tierSlug, userId, userEmail } = await request.json();

    // Validate required fields
    if (!tierSlug || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: tierSlug, userId, userEmail' },
        { status: 400 }
      );
    }

    // Validate tier exists
    if (!PRICING_TIERS[tierSlug as PricingTierSlug]) {
      return NextResponse.json(
        { error: `Invalid tier: ${tierSlug}. Valid tiers: explorer, leader, mentor` },
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
    const supabase = getSupabase();

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?plan=${tierSlug}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: userId,
        tier_slug: tierSlug,
      },
      // Add subscription metadata
      subscription_data: {
        metadata: {
          tier_slug: tierSlug,
          tier_name: tier.name,
        },
      },
      // Allow promo codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
