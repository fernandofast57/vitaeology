import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { LIBRO_TO_ASSESSMENT, grantAssessmentAccess } from '@/lib/assessment-access';
import { savePendingPurchase } from '@/lib/stripe/process-pending-purchases';
import { sendBookEmail, sendTrilogyEmail } from '@/lib/email/send-book-email';

export const dynamic = 'force-dynamic';

// ============================================================================
// AFFILIATE PRODUCT MAP - Mappa price ID Stripe -> prodotti Vitaeology
// ============================================================================
const AFFILIATE_PRODUCT_MAP: Record<string, string> = {
  // Subscription annuali
  [process.env.STRIPE_PRICE_LEADER_ANNUAL || 'price_1SfitcHtGer2Hvotf8O7NlBs']: 'leader',
  [process.env.STRIPE_PRICE_MENTOR_ANNUAL || 'price_1Sfiw6HtGer2HvotaaY1IV2I']: 'mentor',
  // Espandibile per coaching, mastermind, corporate
};

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
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();
  const supabase = getSupabase();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const libroSlug = session.metadata?.libro_slug;
        const tipo = session.metadata?.tipo;

        // Gestione acquisto libro (one-time payment)
        if (tipo === 'libro_pdf' && libroSlug) {
          const customerEmail = session.customer_email || session.customer_details?.email;
          const customerName = session.customer_details?.name || undefined;

          if (customerEmail) {
            // Trova utente per email
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', customerEmail.toLowerCase())
              .single();

            if (profile) {
              // Utente esistente: grant immediato
              // Salva libro in user_books
              await supabase.from('user_books').upsert({
                user_id: profile.id,
                book_slug: libroSlug,
                stripe_session_id: session.id,
                stripe_payment_intent: session.payment_intent as string,
              }, {
                onConflict: 'user_id,book_slug',
              });

              // Concedi accesso all'assessment corrispondente
              const assessmentType = LIBRO_TO_ASSESSMENT[libroSlug];
              if (assessmentType) {
                await grantAssessmentAccess(
                  supabase,
                  profile.id,
                  assessmentType,
                  'book_purchase',
                  session.id
                );
                console.log(`✅ Access granted: ${assessmentType} to user ${profile.id} (libro: ${libroSlug})`);
              }
            } else {
              // Utente NON esistente: salva per elaborazione futura al signup
              await savePendingPurchase(
                supabase,
                customerEmail,
                'libro',
                libroSlug,
                session.id,
                session.payment_intent as string,
                session.amount_total || undefined
              );
              console.log(`📦 Pending purchase saved: ${libroSlug} for ${customerEmail}`);
            }

            // Invia email con libro PDF (in entrambi i casi)
            await sendBookEmail(customerEmail, libroSlug, customerName);
          }
          break;
        }

        // Gestione acquisto trilogia (bundle 3 libri)
        if (tipo === 'trilogy') {
          const customerEmail = session.customer_email || session.customer_details?.email;
          const customerName = session.customer_details?.name || undefined;

          if (customerEmail) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', customerEmail.toLowerCase())
              .single();

            const books = ['leadership', 'risolutore', 'microfelicita'] as const;

            if (profile) {
              // Utente esistente: grant immediato per tutti i libri
              for (const bookSlug of books) {
                await supabase.from('user_books').upsert({
                  user_id: profile.id,
                  book_slug: bookSlug,
                  stripe_session_id: session.id,
                  stripe_payment_intent: session.payment_intent as string,
                }, {
                  onConflict: 'user_id,book_slug',
                });

                const assessmentType = LIBRO_TO_ASSESSMENT[bookSlug];
                if (assessmentType) {
                  await grantAssessmentAccess(
                    supabase,
                    profile.id,
                    assessmentType,
                    'book_purchase',
                    session.id
                  );
                }
              }
              console.log(`✅ Trilogy access granted to user ${profile.id}`);
            } else {
              // Utente NON esistente: salva per elaborazione futura
              await savePendingPurchase(
                supabase,
                customerEmail,
                'trilogy',
                'trilogy',
                session.id,
                session.payment_intent as string,
                session.amount_total || undefined
              );
              console.log(`📦 Pending trilogy purchase saved for ${customerEmail}`);
            }

            // Invia email con tutti i libri
            await sendTrilogyEmail(customerEmail, customerName);
          }
          break;
        }

        // Gestione subscription
        const tierSlug = session.metadata?.tier_slug || 'leader';

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_tier: tierSlug,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          // Concedi accesso a tutti gli assessment per subscription
          if (tierSlug === 'leader' || tierSlug === 'mentor') {
            const assessments = ['lite', 'risolutore', 'microfelicita'] as const;
            for (const assessmentType of assessments) {
              await grantAssessmentAccess(
                supabase,
                userId,
                assessmentType,
                'subscription',
                session.subscription as string
              );
            }
            console.log(`Full access granted to user ${userId} (subscription: ${tierSlug})`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const tierSlug = subscription.metadata?.tier_slug;

        // Find user by stripe_customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, subscription_tier')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const status = subscription.status === 'active' ? 'active' :
                         subscription.status === 'past_due' ? 'past_due' :
                         subscription.status === 'canceled' ? 'canceled' :
                         'inactive';

          const updateData: Record<string, unknown> = {
            subscription_status: status,
            updated_at: new Date().toISOString(),
          };

          // Update tier if provided in metadata (for upgrades/downgrades)
          if (tierSlug) {
            updateData.subscription_tier = tierSlug;
          }

          await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', profile.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'canceled',
              subscription_tier: 'explorer', // Downgrade to explorer (free tier)
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
        }
        break;
      }

      // =====================================================================
      // AFFILIATE COMMISSION: Crea commissione su pagamento riuscito
      // =====================================================================
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;

        // Salta se non è una subscription
        if (!invoice.subscription) break;

        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;
        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;

        if (!subscriptionId || !customerId) break;

        // Trova utente da customer Stripe
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!userProfile) break;

        // Cerca tracking affiliato per questo utente
        const { data: tracking } = await supabase
          .from('subscription_affiliate_tracking')
          .select('affiliate_id, affiliate_click_id')
          .eq('user_id', userProfile.id)
          .eq('is_active', true)
          .single();

        let affiliateId = tracking?.affiliate_id;
        let clickId = tracking?.affiliate_click_id;

        // Se non c'è tracking, cerca nei click recenti
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

            // Crea tracking per rinnovi futuri
            await supabase
              .from('subscription_affiliate_tracking')
              .upsert({
                user_id: userProfile.id,
                stripe_subscription_id: subscriptionId,
                affiliate_id: affiliateId,
                affiliate_click_id: clickId,
                is_active: true
              });
          }
        }

        // Se abbiamo un affiliato, crea commissione
        if (affiliateId) {
          const priceId = invoice.lines.data[0]?.price?.id || '';
          const prodotto = AFFILIATE_PRODUCT_MAP[priceId] || 'unknown';
          const importo = (invoice.amount_paid || 0) / 100;

          // Determina tipo: initial o recurring
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const isInitial = subscription.metadata?.affiliate_commission_created !== 'true';

          // Crea commissione via funzione DB
          const { data: commissionId, error: commissionError } = await supabase
            .rpc('create_affiliate_commission_from_stripe', {
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

          if (commissionError) {
            console.error('Errore creazione commissione affiliato:', commissionError);
          } else {
            console.log(`✅ Commissione affiliato creata: ${commissionId}`);

            // Marca subscription per evitare doppie commissioni initial
            if (isInitial) {
              await stripe.subscriptions.update(subscriptionId, {
                metadata: { affiliate_commission_created: 'true' }
              });
            }

            // Aggiorna click come convertito
            if (clickId) {
              await supabase
                .from('affiliate_clicks')
                .update({
                  stato_conversione: 'converted',
                  converted_at: new Date().toISOString(),
                  subscription_id: subscriptionId,
                  commissione_id: commissionId
                })
                .eq('id', clickId);
            }
          }
        }
        break;
      }

      // =====================================================================
      // AFFILIATE REFUND: Gestisce rimborsi annullando commissioni
      // =====================================================================
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (!paymentIntentId) break;

        // Trova commissione associata al payment intent
        const { data: commission } = await supabase
          .from('affiliate_commissions')
          .select('id, affiliate_id, importo_commissione_euro, stato')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single();

        if (commission && commission.stato !== 'paid') {
          // Marca commissione come rimborsata
          await supabase
            .from('affiliate_commissions')
            .update({
              stato: 'refunded',
              refunded_at: new Date().toISOString()
            })
            .eq('id', commission.id);

          // Aggiorna saldo affiliato (decrementa)
          const { data: currentAffiliate } = await supabase
            .from('affiliates')
            .select('saldo_disponibile_euro')
            .eq('id', commission.affiliate_id)
            .single();

          if (currentAffiliate) {
            const newBalance = Math.max(0,
              Number(currentAffiliate.saldo_disponibile_euro) - Number(commission.importo_commissione_euro)
            );
            await supabase
              .from('affiliates')
              .update({ saldo_disponibile_euro: newBalance })
              .eq('id', commission.affiliate_id);
          }

          console.log(`⚠️ Commissione ${commission.id} rimborsata`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
