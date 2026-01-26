/**
 * Script per creare il coupon Stripe "Founding Tester"
 *
 * Uso:
 *   npx ts-node scripts/setup-founding-tester-coupon.ts
 *
 * Requisiti:
 *   - STRIPE_SECRET_KEY nel .env.local
 *
 * Oppure crea manualmente in Stripe Dashboard:
 *   1. Vai su Products > Coupons
 *   2. Crea nuovo coupon con:
 *      - Name: Founding Tester Lifetime Discount
 *      - ID: FOUNDINGTESTER (esattamente questo, senza underscore)
 *      - Type: Percentage discount
 *      - Percent off: 30%
 *      - Duration: Forever
 *      - Redemption limits: None
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const COUPON_CONFIG = {
  id: 'FOUNDINGTESTER',
  name: 'Founding Tester Lifetime Discount',
  percent_off: 30, // 30% sconto
  duration: 'forever' as const, // Lifetime - si applica per sempre
  metadata: {
    description: 'Sconto esclusivo per i Founding Tester di Vitaeology',
    created_by: 'setup-founding-tester-coupon.ts',
  },
};

async function main() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    console.error('❌ STRIPE_SECRET_KEY non trovata in .env.local');
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey);

  console.log('🔍 Verifico se il coupon esiste già...');

  try {
    // Prova a recuperare il coupon esistente
    const existingCoupon = await stripe.coupons.retrieve(COUPON_CONFIG.id);
    console.log(`✅ Coupon "${COUPON_CONFIG.id}" già esistente:`);
    console.log(`   - Sconto: ${existingCoupon.percent_off}%`);
    console.log(`   - Durata: ${existingCoupon.duration}`);
    console.log(`   - Valido: ${existingCoupon.valid}`);
    console.log('\n📋 Aggiungi al .env.local:');
    console.log(`   STRIPE_FOUNDING_TESTER_COUPON_ID=${existingCoupon.id}`);
    return;
  } catch {
    // Coupon non esiste, lo creiamo
    console.log('📝 Coupon non trovato, lo creo...');
  }

  try {
    const coupon = await stripe.coupons.create(COUPON_CONFIG);

    console.log(`✅ Coupon creato con successo!`);
    console.log(`   - ID: ${coupon.id}`);
    console.log(`   - Nome: ${coupon.name}`);
    console.log(`   - Sconto: ${coupon.percent_off}%`);
    console.log(`   - Durata: ${coupon.duration}`);
    console.log('\n📋 Aggiungi al .env.local:');
    console.log(`   STRIPE_FOUNDING_TESTER_COUPON_ID=${coupon.id}`);
    console.log('\n🎉 Fatto! Il coupon verrà applicato automaticamente ai Founding Tester.');

  } catch (error) {
    console.error('❌ Errore nella creazione del coupon:', error);
    process.exit(1);
  }
}

main();
