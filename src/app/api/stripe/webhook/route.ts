import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LIBRO_TO_ASSESSMENT, grantAssessmentAccess } from '@/lib/assessment-access';
import { savePendingPurchase } from '@/lib/stripe/process-pending-purchases';
import { sendBookEmail, sendTrilogyEmail } from '@/lib/email/send-book-email';
import { sendUpgradeConfirmationEmail, sendSubscriptionCancelledEmail } from '@/lib/email/subscription-emails';
import { alertPaymentError } from '@/lib/error-alerts';
import { onSubscriptionChanged } from '@/lib/awareness';
import { createAndDispatch } from '@/lib/notion/dispatcher';

export const dynamic = 'force-dynamic';

// ============================================================================
// COSTANTI E CONFIGURAZIONE
// ============================================================================
const SUBSCRIPTION_PRICES = {
  leader: 149,
  mentor: 490,
  mastermind: 2997,
} as const;

const HIGH_TICKET_PRICES = {
  coaching: 4997,
  advisory: 12000,
} as const;

const ALL_BOOKS = ['leadership', 'risolutore', 'microfelicita'] as const;
const ALL_ASSESSMENTS = ['leadership', 'risolutore', 'microfelicita'] as const;

const AFFILIATE_PRODUCT_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_LEADER_ANNUAL || 'price_1SfitcHtGer2Hvotf8O7NlBs']: 'leader',
  [process.env.STRIPE_PRICE_MENTOR_ANNUAL || 'price_1Sfiw6HtGer2HvotaaY1IV2I']: 'mentor',
  [process.env.STRIPE_PRICE_MASTERMIND_ANNUAL || 'price_mastermind']: 'mastermind',
};

// ============================================================================
// CLIENT FACTORY
// ============================================================================
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!);
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Trova profilo utente per email */
async function findProfileByEmail(supabase: SupabaseClient, email: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();
  return data;
}

/** Trova profilo utente per Stripe customer ID */
async function findProfileByCustomerId<T = { id: string }>(
  supabase: SupabaseClient,
  customerId: string,
  fields = 'id'
): Promise<T | null> {
  const { data } = await supabase
    .from('profiles')
    .select(fields)
    .eq('stripe_customer_id', customerId)
    .single();
  return data as T | null;
}

/** Salva libro e concede accesso assessment */
async function grantBookAccess(
  supabase: SupabaseClient,
  userId: string,
  bookSlug: string,
  sessionId: string,
  paymentIntent: string,
  acquiredVia?: string
) {
  await supabase.from('user_books').upsert({
    user_id: userId,
    book_slug: bookSlug,
    stripe_session_id: sessionId,
    stripe_payment_intent: paymentIntent,
    ...(acquiredVia && { acquired_via: acquiredVia }),
  }, { onConflict: 'user_id,book_slug' });

  const assessmentType = LIBRO_TO_ASSESSMENT[bookSlug];
  if (assessmentType) {
    await grantAssessmentAccess(supabase, userId, assessmentType, 'book_purchase', sessionId);
  }
}

/** Concede accesso a tutti gli assessment (per subscription) */
async function grantAllAssessmentAccess(
  supabase: SupabaseClient,
  userId: string,
  subscriptionId: string
) {
  for (const assessmentType of ALL_ASSESSMENTS) {
    await grantAssessmentAccess(supabase, userId, assessmentType, 'subscription', subscriptionId);
  }
}

/** Aggiorna tracking affiliato per libro (NO commissioni) */
async function trackAffiliateBookPurchase(
  supabase: SupabaseClient,
  clickId: string,
  libroSlug: string
) {
  await supabase
    .from('affiliate_clicks')
    .update({
      stato_conversione: 'libro_purchased',
      converted_at: new Date().toISOString(),
      libro_slug: libroSlug
    })
    .eq('id', clickId);
}

/** Aggiorna profilo per subscription */
async function updateProfileSubscription(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
) {
  await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

/** Formatta data in italiano */
function formatDateIT(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/** Gestisce acquisto singolo libro PDF */
async function handleLibroPurchase(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  const libroSlug = session.metadata?.libro_slug;
  const customerEmail = session.customer_email || session.customer_details?.email;
  const customerName = session.customer_details?.name || undefined;
  const affiliateId = session.metadata?.affiliate_id;
  const clickId = session.metadata?.affiliate_click_id;

  if (!customerEmail || !libroSlug) return;

  const profile = await findProfileByEmail(supabase, customerEmail);

  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id || session.id;

  if (profile) {
    // Utente esistente: grant immediato
    await grantBookAccess(supabase, profile.id, libroSlug, session.id, paymentIntentId);

    if (affiliateId && clickId) {
      await trackAffiliateBookPurchase(supabase, clickId, libroSlug);
    }
  } else {
    // Utente NON esistente: salva pending
    await savePendingPurchase(
      supabase, customerEmail, 'libro', libroSlug,
      session.id, paymentIntentId,
      session.amount_total || undefined
    );

    if (affiliateId && clickId) {
      await trackAffiliateBookPurchase(supabase, clickId, libroSlug).catch(() => {});
    }
  }

  await sendBookEmail(customerEmail, libroSlug, customerName);

  // Hook Notion: libro acquistato (fire-and-forget)
  createAndDispatch('book_purchased', {
    email: customerEmail.toLowerCase(),
    bookSlug: libroSlug,
  });
}

/** Gestisce acquisto trilogia (bundle 3 libri) */
async function handleTrilogyPurchase(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  const customerEmail = session.customer_email || session.customer_details?.email;
  const customerName = session.customer_details?.name || undefined;

  if (!customerEmail) return;

  const profile = await findProfileByEmail(supabase, customerEmail);

  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id || session.id;

  if (profile) {
    for (const bookSlug of ALL_BOOKS) {
      await grantBookAccess(supabase, profile.id, bookSlug, session.id, paymentIntentId);
    }
  } else {
    await savePendingPurchase(
      supabase, customerEmail, 'trilogy', 'trilogy',
      session.id, paymentIntentId,
      session.amount_total || undefined
    );
  }

  await sendTrilogyEmail(customerEmail, customerName);

  // Hook Notion: trilogia acquistata (fire-and-forget)
  createAndDispatch('trilogy_purchased', {
    email: customerEmail.toLowerCase(),
  });
}

/** Gestisce BUMP: Libro GRATIS + Leader subscription */
async function handleBumpLibroLeader(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  const customerEmail = session.customer_email || session.customer_details?.email;
  const libroSlug = session.metadata?.libro_slug;
  const userId = session.metadata?.user_id;
  const affiliateId = session.metadata?.affiliate_id;
  const clickId = session.metadata?.affiliate_click_id;

  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id || '';

  if (userId) {
    // 1. Attiva subscription Leader
    await updateProfileSubscription(supabase, userId, {
      subscription_status: 'active',
      subscription_tier: 'leader',
      stripe_subscription_id: subscriptionId,
    });

    // 2. Concedi libro gratuito
    if (libroSlug) {
      await grantBookAccess(supabase, userId, libroSlug, session.id, 'bump_included', 'bump_offer');
    }

    // 3. Concedi accesso a tutti gli assessment
    await grantAllAssessmentAccess(supabase, userId, subscriptionId);

    // 4. Affiliate tracking
    if (affiliateId && clickId) {
      await supabase.from('subscription_affiliate_tracking').upsert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        affiliate_id: affiliateId,
        affiliate_click_id: clickId,
        is_active: true
      });
    }

    // 5. Analytics (fire and forget)
    supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: 'bump_offer_completed',
      event_data: { libro_slug: libroSlug, tier: 'leader', email: customerEmail },
    }).then(() => {});
  } else if (customerEmail && libroSlug) {
    await savePendingPurchase(
      supabase, customerEmail, 'bump_libro_leader', libroSlug,
      session.id, 'bump_subscription',
      session.amount_total || undefined
    );
  }

  if (customerEmail && libroSlug) {
    await sendBookEmail(customerEmail, libroSlug, session.customer_details?.name || undefined);
  }
}

/** Gestisce subscription standard (Leader/Mentor/Mastermind) */
async function handleSubscription(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  const tierSlug = session.metadata?.tier_slug || 'leader';

  if (!userId) return;

  const subId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id || '';

  await updateProfileSubscription(supabase, userId, {
    subscription_status: 'active',
    subscription_tier: tierSlug,
    stripe_subscription_id: subId,
  });

  if (tierSlug === 'leader' || tierSlug === 'mentor' || tierSlug === 'mastermind') {
    await grantAllAssessmentAccess(supabase, userId, subId);

    // Invia email conferma
    const customerEmail = session.customer_email || session.customer_details?.email;
    if (customerEmail) {
      const renewalDate = new Date();
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);

      await sendUpgradeConfirmationEmail({
        email: customerEmail,
        firstName: session.customer_details?.name?.split(' ')[0],
        planName: tierSlug as 'leader' | 'mentor' | 'mastermind',
        planPrice: SUBSCRIPTION_PRICES[tierSlug as keyof typeof SUBSCRIPTION_PRICES],
        renewalDate: formatDateIT(renewalDate),
        invoiceUrl: session.invoice ? `https://dashboard.stripe.com/invoices/${session.invoice}` : undefined,
      });
    }

    // Aggiorna awareness (fire and forget)
    onSubscriptionChanged(userId).catch(() => {});

    // Hook Notion: subscription attivata (fire-and-forget)
    const customerEmailForNotion = session.customer_email || session.customer_details?.email;
    if (customerEmailForNotion) {
      createAndDispatch('subscription_started', {
        email: customerEmailForNotion.toLowerCase(),
        tier: tierSlug,
      });
    }
  }
}

/** Gestisce acquisti high-ticket one-time (Coaching/Advisory) */
async function handleHighTicketPurchase(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  const tierSlug = session.metadata?.tier_slug as 'coaching' | 'advisory';
  const customerEmail = session.customer_email || session.customer_details?.email;

  if (!userId || !tierSlug) return;

  const piId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id || session.id;

  // Registra l'acquisto high-ticket
  await supabase.from('high_ticket_purchases').upsert({
    user_id: userId,
    product_type: tierSlug,
    stripe_session_id: session.id,
    stripe_payment_intent: piId,
    amount_paid: (session.amount_total || 0) / 100,
    status: 'active',
    purchased_at: new Date().toISOString(),
  }, { onConflict: 'user_id,product_type' });

  // Per Advisory, grant anche Mastermind incluso
  if (tierSlug === 'advisory') {
    await updateProfileSubscription(supabase, userId, {
      subscription_tier: 'mastermind',
      subscription_status: 'active',
    });
    await grantAllAssessmentAccess(supabase, userId, session.id);
  }

  // Per Coaching, grant Mentor incluso per 1 anno
  if (tierSlug === 'coaching') {
    await updateProfileSubscription(supabase, userId, {
      subscription_tier: 'mentor',
      subscription_status: 'active',
    });
    await grantAllAssessmentAccess(supabase, userId, session.id);
  }

  // Invia email conferma
  if (customerEmail) {
    const productName = tierSlug === 'coaching' ? '1:1 Coaching' : 'Advisory Board';
    const price = HIGH_TICKET_PRICES[tierSlug];

    // TODO: Implementare email specifica per high-ticket
  }

  // Analytics
  await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: 'high_ticket_purchase',
    event_data: {
      product: tierSlug,
      price: HIGH_TICKET_PRICES[tierSlug],
      email: customerEmail
    },
  });
}

/** Gestisce aggiornamento subscription */
async function handleSubscriptionUpdated(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const tierSlug = subscription.metadata?.tier_slug;

  const profile = await findProfileByCustomerId<{ id: string; email: string; subscription_tier: string }>(
    supabase, customerId, 'id, email, subscription_tier'
  );
  if (!profile) return;

  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
  };
  const status = statusMap[subscription.status] || 'inactive';

  const updateData: Record<string, unknown> = { subscription_status: status };
  if (tierSlug) updateData.subscription_tier = tierSlug;

  await updateProfileSubscription(supabase, profile.id, updateData);

  if (tierSlug && tierSlug !== profile.subscription_tier) {
    onSubscriptionChanged(profile.id).catch(() => {});

    // Hook Notion: subscription upgrade (fire-and-forget)
    createAndDispatch('subscription_upgraded', {
      email: profile.email,
      tier: tierSlug,
    });
  }
}

/** Gestisce cancellazione subscription */
async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  const profile = await findProfileByCustomerId<{
    id: string;
    email: string;
    full_name: string | null;
    subscription_tier: string;
  }>(supabase, customerId, 'id, email, full_name, subscription_tier');
  if (!profile) return;

  const previousTier = profile.subscription_tier;

  await updateProfileSubscription(supabase, profile.id, {
    subscription_status: 'canceled',
    subscription_tier: 'explorer',
    stripe_subscription_id: null,
  });

  // Invia email cancellazione
  if (profile.email && (previousTier === 'leader' || previousTier === 'mentor' || previousTier === 'mastermind')) {
    const accessEndDate = subscription.current_period_end
      ? formatDateIT(new Date(subscription.current_period_end * 1000))
      : formatDateIT(new Date());

    await sendSubscriptionCancelledEmail({
      email: profile.email,
      firstName: profile.full_name?.split(' ')[0],
      planName: previousTier as 'leader' | 'mentor' | 'mastermind',
      accessEndDate,
      reason: subscription.cancellation_details?.reason || undefined,
    });
  }

  onSubscriptionChanged(profile.id).catch(() => {});

  // Hook Notion: subscription cancellata (fire-and-forget)
  if (profile.email) {
    createAndDispatch('subscription_cancelled', {
      email: profile.email,
      tier: previousTier,
    });
  }
}

/** Gestisce pagamento fallito */
async function handlePaymentFailed(
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;
  const profile = await findProfileByCustomerId(supabase, customerId);

  if (profile) {
    await updateProfileSubscription(supabase, profile.id, { subscription_status: 'past_due' });

    // Hook Notion: pagamento fallito (fire-and-forget)
    const failedEmail = invoice.customer_email;
    if (failedEmail) {
      createAndDispatch('payment_failed', {
        email: failedEmail.toLowerCase(),
      });
    }
  }
}

/** Gestisce commissione affiliato su pagamento invoice */
async function handleInvoicePaid(
  stripe: Stripe,
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
) {
  if (!invoice.subscription) return;

  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id;
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id;

  if (!subscriptionId || !customerId) return;

  const userProfile = await findProfileByCustomerId(supabase, customerId);
  if (!userProfile) return;

  // Cerca tracking affiliato
  const { data: tracking } = await supabase
    .from('subscription_affiliate_tracking')
    .select('affiliate_id, affiliate_click_id')
    .eq('user_id', userProfile.id)
    .eq('is_active', true)
    .single();

  let affiliateId = tracking?.affiliate_id;
  let clickId = tracking?.affiliate_click_id;

  // Fallback: cerca click recenti
  if (!affiliateId) {
    const { data: recentClick } = await supabase
      .from('affiliate_clicks')
      .select('id, affiliate_id')
      .eq('user_id', userProfile.id)
      .in('stato_conversione', ['signup', 'challenge_started', 'challenge_complete'])
      .order('clicked_at', { ascending: false })
      .limit(1)
      .single();

    if (recentClick) {
      affiliateId = recentClick.affiliate_id;
      clickId = recentClick.id;

      await supabase.from('subscription_affiliate_tracking').upsert({
        user_id: userProfile.id,
        stripe_subscription_id: subscriptionId,
        affiliate_id: affiliateId,
        affiliate_click_id: clickId,
        is_active: true
      });
    }
  }

  if (!affiliateId) return;

  // Crea commissione
  const priceId = invoice.lines.data[0]?.price?.id || '';
  const prodotto = AFFILIATE_PRODUCT_MAP[priceId] || 'unknown';
  const importo = (invoice.amount_paid || 0) / 100;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const isInitial = subscription.metadata?.affiliate_commission_created !== 'true';

  const { data: commissionId, error } = await supabase.rpc('create_affiliate_commission_from_stripe', {
    p_affiliate_id: affiliateId,
    p_click_id: clickId,
    p_customer_user_id: userProfile.id,
    p_customer_email: invoice.customer_email || '',
    p_stripe_subscription_id: subscriptionId,
    p_stripe_invoice_id: invoice.id,
    p_prodotto: prodotto,
    p_prezzo_euro: importo,
    p_tipo: isInitial ? 'initial' : 'recurring'
  });

  if (error) return;

  if (isInitial) {
    await stripe.subscriptions.update(subscriptionId, {
      metadata: { affiliate_commission_created: 'true' }
    });
  }

  if (clickId) {
    await supabase.from('affiliate_clicks').update({
      stato_conversione: 'converted',
      converted_at: new Date().toISOString(),
      subscription_id: subscriptionId,
      commissione_id: commissionId
    }).eq('id', clickId);
  }
}

/** Gestisce rimborso (annulla commissione affiliato) */
async function handleChargeRefunded(
  supabase: SupabaseClient,
  charge: Stripe.Charge
) {
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  const { data: commission } = await supabase
    .from('affiliate_commissions')
    .select('id, affiliate_id, importo_commissione_euro, stato')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (!commission || commission.stato === 'paid') return;

  await supabase
    .from('affiliate_commissions')
    .update({ stato: 'refunded', refunded_at: new Date().toISOString() })
    .eq('id', commission.id);

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('saldo_disponibile_euro')
    .eq('id', commission.affiliate_id)
    .single();

  if (affiliate) {
    const newBalance = Math.max(0,
      Number(affiliate.saldo_disponibile_euro) - Number(commission.importo_commissione_euro)
    );
    await supabase.from('affiliates').update({ saldo_disponibile_euro: newBalance }).eq('id', commission.affiliate_id);
  }
}

// ============================================================================
// MAIN WEBHOOK HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();
  const supabase = getSupabase();

  let event: Stripe.Event;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET non configurato');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // === IDEMPOTENCY CHECK (C12 fix): evita processamento duplicati ===
  try {
    const { data: existing } = await supabase
      .from('stripe_processed_events')
      .select('id')
      .eq('event_id', event.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    await supabase
      .from('stripe_processed_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString(),
      });
  } catch {
    // Graceful degradation: se tabella non esiste, continua
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tipo = session.metadata?.tipo;
        const paymentType = session.metadata?.payment_type;
        const tierSlug = session.metadata?.tier_slug;

        if (tipo === 'libro_pdf') await handleLibroPurchase(supabase, session);
        else if (tipo === 'trilogy') await handleTrilogyPurchase(supabase, session);
        else if (tipo === 'bump_libro_leader') await handleBumpLibroLeader(supabase, session);
        else if (paymentType === 'one_time' && (tierSlug === 'coaching' || tierSlug === 'advisory')) {
          await handleHighTicketPurchase(supabase, session);
        }
        else await handleSubscription(supabase, session);
        break;
      }

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object as Stripe.Invoice);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(stripe, supabase, event.data.object as Stripe.Invoice);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(supabase, event.data.object as Stripe.Charge);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    await alertPaymentError(
      error instanceof Error ? error : new Error('Unknown payment error'),
      { endpoint: '/api/stripe/webhook', requestBody: { eventType: event?.type || 'unknown' } }
    );

    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
