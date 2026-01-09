/**
 * Gestione acquisti pendenti per utenti non registrati
 *
 * Quando un utente acquista un libro senza essere registrato,
 * l'acquisto viene salvato in pending_purchases.
 * Al momento della registrazione/login, questa funzione
 * processa gli acquisti pendenti e assegna gli accessi.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { grantAssessmentAccess, LIBRO_TO_ASSESSMENT } from '@/lib/assessment-access';

type PendingProductType = 'libro' | 'subscription' | 'trilogy' | 'bump_libro_leader';

interface PendingPurchase {
  id: string;
  product_type: PendingProductType;
  product_slug: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
}

interface ProcessResult {
  processed: number;
  errors: string[];
  grants: string[];
}

/**
 * Processa tutti gli acquisti pendenti per un utente
 * Chiamare dopo signup o login
 */
export async function processPendingPurchases(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<ProcessResult> {
  const result: ProcessResult = {
    processed: 0,
    errors: [],
    grants: [],
  };

  try {
    // Trova e marca come processati gli acquisti pendenti
    const { data: pending, error: fetchError } = await supabase
      .from('pending_purchases')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('processed', false);

    if (fetchError) {
      console.error('Errore fetch pending purchases:', fetchError);
      result.errors.push(`Fetch error: ${fetchError.message}`);
      return result;
    }

    if (!pending || pending.length === 0) {
      return result;
    }

    console.log(`📦 Trovati ${pending.length} acquisti pendenti per ${email}`);

    for (const purchase of pending as PendingPurchase[]) {
      try {
        if (purchase.product_type === 'libro') {
          // Salva libro in user_books
          await supabase.from('user_books').upsert({
            user_id: userId,
            book_slug: purchase.product_slug,
            stripe_session_id: purchase.stripe_session_id,
            stripe_payment_intent: purchase.stripe_payment_intent,
          }, {
            onConflict: 'user_id,book_slug',
          });

          // Grant accesso assessment corrispondente
          const assessmentType = LIBRO_TO_ASSESSMENT[purchase.product_slug];
          if (assessmentType) {
            await grantAssessmentAccess(
              supabase,
              userId,
              assessmentType,
              'book_purchase',
              purchase.stripe_session_id
            );
            result.grants.push(assessmentType);
          }

          console.log(`✅ Libro ${purchase.product_slug} assegnato a ${userId}`);
        } else if (purchase.product_type === 'trilogy') {
          // Trilogy = tutti e 3 i libri
          const books = ['leadership', 'risolutore', 'microfelicita'] as const;

          for (const bookSlug of books) {
            await supabase.from('user_books').upsert({
              user_id: userId,
              book_slug: bookSlug,
              stripe_session_id: purchase.stripe_session_id,
              stripe_payment_intent: purchase.stripe_payment_intent,
            }, {
              onConflict: 'user_id,book_slug',
            });

            const assessmentType = LIBRO_TO_ASSESSMENT[bookSlug];
            if (assessmentType) {
              await grantAssessmentAccess(
                supabase,
                userId,
                assessmentType,
                'book_purchase',
                purchase.stripe_session_id
              );
              result.grants.push(assessmentType);
            }
          }

          console.log(`✅ Trilogia assegnata a ${userId}`);
        } else if (purchase.product_type === 'bump_libro_leader') {
          // BUMP: Libro gratuito + Leader subscription
          // Nota: la subscription è già attivata dal webhook, qui gestiamo solo il libro

          // 1. Salva libro come ottenuto via bump
          await supabase.from('user_books').upsert({
            user_id: userId,
            book_slug: purchase.product_slug,
            stripe_session_id: purchase.stripe_session_id,
            stripe_payment_intent: 'bump_included',
            acquired_via: 'bump_offer',
          }, {
            onConflict: 'user_id,book_slug',
          });

          // 2. Grant accesso assessment del libro
          const assessmentType = LIBRO_TO_ASSESSMENT[purchase.product_slug];
          if (assessmentType) {
            await grantAssessmentAccess(
              supabase,
              userId,
              assessmentType,
              'book_purchase',
              purchase.stripe_session_id
            );
            result.grants.push(assessmentType);
          }

          // 3. Grant accesso a tutti gli assessment (Leader tier)
          const allAssessments = ['lite', 'risolutore', 'microfelicita'] as const;
          for (const assessment of allAssessments) {
            await grantAssessmentAccess(
              supabase,
              userId,
              assessment,
              'subscription',
              purchase.stripe_session_id
            );
            result.grants.push(assessment);
          }

          console.log(`✅ BUMP (libro ${purchase.product_slug} + Leader) assegnato a ${userId}`);
        }

        // Marca come processato
        await supabase
          .from('pending_purchases')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            processed_user_id: userId,
          })
          .eq('id', purchase.id);

        result.processed++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Errore processing purchase ${purchase.id}:`, err);
        result.errors.push(`Purchase ${purchase.id}: ${errorMsg}`);
      }
    }

    return result;
  } catch (err) {
    console.error('Errore generale processPendingPurchases:', err);
    result.errors.push(err instanceof Error ? err.message : 'Unknown error');
    return result;
  }
}

/**
 * Salva un acquisto pendente (per utenti non registrati)
 */
export async function savePendingPurchase(
  supabase: SupabaseClient,
  email: string,
  productType: PendingProductType,
  productSlug: string,
  stripeSessionId: string,
  stripePaymentIntent?: string,
  amountPaid?: number
): Promise<boolean> {
  try {
    const { error } = await supabase.from('pending_purchases').insert({
      email: email.toLowerCase(),
      product_type: productType,
      product_slug: productSlug,
      stripe_session_id: stripeSessionId,
      stripe_payment_intent: stripePaymentIntent || null,
      amount_paid: amountPaid || null,
    });

    if (error) {
      // Ignora duplicati (già salvato)
      if (error.code === '23505') {
        console.log(`Acquisto già salvato: ${stripeSessionId}`);
        return true;
      }
      console.error('Errore salvataggio pending purchase:', error);
      return false;
    }

    console.log(`📦 Acquisto pendente salvato: ${productType}/${productSlug} per ${email}`);
    return true;
  } catch (err) {
    console.error('Errore savePendingPurchase:', err);
    return false;
  }
}
