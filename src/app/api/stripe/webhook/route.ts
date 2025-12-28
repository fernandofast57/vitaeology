import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { LIBRO_TO_ASSESSMENT, grantAssessmentAccess } from '@/lib/assessment-access';
import { savePendingPurchase } from '@/lib/stripe/process-pending-purchases';
import { sendBookEmail, sendTrilogyEmail } from '@/lib/email/send-book-email';

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
