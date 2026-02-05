/**
 * PRICING CONFIGURATION - SINGLE SOURCE OF TRUTH
 *
 * Architettura Value Ladder Vitaeology
 * Riferimento: CONTROL_TOWER v1.1
 *
 * FASE 1 (Attiva): explorer, leader, mentor
 * FASE 2 (Futura): mastermind, coaching, partner_elite
 */

// ============================================================
// TYPES
// ============================================================

export type PricingTierSlug = 'explorer' | 'leader' | 'mentor' | 'mastermind';

// Fase 2 - Altri tiers futuri
// export type PricingTierSlugFase2 = 'coaching_starter' | 'coaching_intensive' | 'partner_elite';

export type BillingInterval = 'year' | 'month' | 'once';

export interface PricingTier {
  slug: PricingTierSlug;
  name: string;                    // Display name (capitalized)
  description: string;
  price: number;                   // In EUR
  originalPrice?: number;          // Per mostrare sconto
  interval: BillingInterval;
  intervalLabel: string;           // "/anno", "/mese", "una tantum"
  stripePriceId: string | null;    // null per tier gratuiti
  stripeProductName: string;       // Nome prodotto su Stripe
  valueLadderLevel: number;        // 1-8
  features: string[];
  highlighted?: boolean;           // Per evidenziare piano consigliato
  badge?: string;                  // Es. "Popolare", "Best Value"
  ctaText: string;                 // Testo bottone
  ctaVariant: 'primary' | 'secondary' | 'outline';
}

export interface PricingConfig {
  tiers: Record<PricingTierSlug, PricingTier>;
  defaultTier: PricingTierSlug;
  trialDays: number;
  currency: string;
  currencySymbol: string;
}

// ============================================================
// FEATURES PER TIER
// ============================================================

const EXPLORER_FEATURES = [
  'Assessment Leadership 72 domande',
  'Radar Chart interattivo',
  'Analisi 4 pilastri leadership',
  'Report base risultati',
  '5 messaggi AI Coach / giorno',
  '10 esercizi introduttivi',
];

const LEADER_FEATURES = [
  'Tutto di Explorer +',
  '52 esercizi settimanali',
  'AI Coach illimitato',
  'Tracciamento progressi',
  'Report PDF completo',
  'Community base',
  'Supporto email',
];

const MENTOR_FEATURES = [
  'Tutto di Leader +',
  '3 percorsi completi',
  'AI Coach cross-pollination',
  'Q&A mensile live con Fernando',
  'Community avanzata',
  'Badge "Praticante Completo"',
  'Supporto prioritario',
];

const MASTERMIND_FEATURES = [
  'Tutto di Mentor +',
  'Gruppo esclusivo max 24 persone',
  '2 sessioni live/mese con Fernando',
  'Ritiro annuale incluso',
  'Hot seat rotativo mensile',
  'Canale privato Mastermind',
  'Networking con imprenditori elite',
  'Accesso anticipato a nuove funzionalità',
];

// ============================================================
// FASE 2 FEATURES (Altri tiers futuri)
// ============================================================

// const COACHING_STARTER_FEATURES = [
//   '3 sessioni 1:1 con Fernando',
//   'Assessment personalizzato',
//   'Piano azione custom',
//   'Supporto email dedicato',
//   'Mentor incluso 3 mesi',
// ];

// const COACHING_INTENSIVE_FEATURES = [
//   '6 sessioni 1:1 con Fernando',
//   'Assessment approfondito',
//   'Piano azione dettagliato',
//   'Supporto email prioritario',
//   'Mentor incluso 6 mesi',
// ];

// const PARTNER_ELITE_FEATURES = [
//   'Licenza territoriale',
//   'Formazione consulenti',
//   'Workshop locali',
//   'Revenue share',
//   'Formazione esclusiva',
// ];

// ============================================================
// PRICING TIERS - FASE 1
// ============================================================

export const PRICING_TIERS: Record<PricingTierSlug, PricingTier> = {
  explorer: {
    slug: 'explorer',
    name: 'Explorer',
    description: 'Inizia il tuo percorso di leadership',
    price: 0,
    interval: 'year',
    intervalLabel: 'per sempre',
    stripePriceId: null,
    stripeProductName: 'Vitaeology Explorer',
    valueLadderLevel: 1,
    features: EXPLORER_FEATURES,
    highlighted: false,
    ctaText: 'Inizia Gratis',
    ctaVariant: 'outline',
  },

  leader: {
    slug: 'leader',
    name: 'Leader',
    description: 'Per chi vuole crescere seriamente',
    price: 149,
    originalPrice: 199,
    interval: 'year',
    intervalLabel: '/anno',
    stripePriceId: process.env.STRIPE_PRICE_LEADER_ANNUAL || null,
    stripeProductName: 'Vitaeology Leader',
    valueLadderLevel: 3,
    features: LEADER_FEATURES,
    highlighted: true,
    badge: 'Popolare',
    ctaText: 'Scegli Leader',
    ctaVariant: 'primary',
  },

  mentor: {
    slug: 'mentor',
    name: 'Mentor',
    description: 'Accesso completo a tutti i percorsi',
    price: 490,
    originalPrice: 590,
    interval: 'year',
    intervalLabel: '/anno',
    stripePriceId: process.env.STRIPE_PRICE_MENTOR_ANNUAL || null,
    stripeProductName: 'Vitaeology Mentor',
    valueLadderLevel: 4,
    features: MENTOR_FEATURES,
    highlighted: false,
    badge: 'Best Value',
    ctaText: 'Scegli Mentor',
    ctaVariant: 'secondary',
  },

  mastermind: {
    slug: 'mastermind',
    name: 'Mastermind',
    description: 'Gruppo esclusivo con Fernando',
    price: 2997,
    originalPrice: 3497,
    interval: 'year',
    intervalLabel: '/anno',
    stripePriceId: process.env.STRIPE_PRICE_MASTERMIND_ANNUAL || null,
    stripeProductName: 'Vitaeology Mastermind',
    valueLadderLevel: 6,
    features: MASTERMIND_FEATURES,
    highlighted: false,
    badge: 'Elite',
    ctaText: 'Richiedi Accesso',
    ctaVariant: 'secondary',
  },
};

// ============================================================
// FASE 2 TIERS (Commentati)
// ============================================================

// export const PRICING_TIERS_FASE2 = {
//   mastermind: {
//     slug: 'mastermind',
//     name: 'Mastermind',
//     description: 'Gruppo esclusivo con Fernando',
//     price: 2997,
//     interval: 'year',
//     intervalLabel: '/anno',
//     stripePriceId: process.env.STRIPE_PRICE_MASTERMIND_ANNUAL || null,
//     stripeProductName: 'Vitaeology Mastermind',
//     valueLadderLevel: 6,
//     features: MASTERMIND_FEATURES,
//     ctaText: 'Richiedi Accesso',
//     ctaVariant: 'primary',
//   },
//   coaching_starter: {
//     slug: 'coaching_starter',
//     name: 'Coaching Starter',
//     description: '3 sessioni 1:1 con Fernando',
//     price: 997,
//     interval: 'once',
//     intervalLabel: 'una tantum',
//     stripePriceId: process.env.STRIPE_PRICE_COACHING_STARTER || null,
//     stripeProductName: 'Vitaeology Coaching Starter',
//     valueLadderLevel: 5,
//     features: COACHING_STARTER_FEATURES,
//     ctaText: 'Prenota Coaching',
//     ctaVariant: 'primary',
//   },
//   coaching_intensive: {
//     slug: 'coaching_intensive',
//     name: 'Coaching Intensive',
//     description: '6 sessioni 1:1 con Fernando',
//     price: 1997,
//     interval: 'once',
//     intervalLabel: 'una tantum',
//     stripePriceId: process.env.STRIPE_PRICE_COACHING_INTENSIVE || null,
//     stripeProductName: 'Vitaeology Coaching Intensive',
//     valueLadderLevel: 5,
//     features: COACHING_INTENSIVE_FEATURES,
//     ctaText: 'Prenota Coaching',
//     ctaVariant: 'primary',
//   },
//   partner_elite: {
//     slug: 'partner_elite',
//     name: 'Partner Elite',
//     description: 'Licenza territoriale esclusiva',
//     price: 9997,
//     interval: 'year',
//     intervalLabel: '/anno',
//     stripePriceId: process.env.STRIPE_PRICE_PARTNER_ELITE || null,
//     stripeProductName: 'Vitaeology Partner Elite',
//     valueLadderLevel: 8,
//     features: PARTNER_ELITE_FEATURES,
//     ctaText: 'Contattaci',
//     ctaVariant: 'outline',
//   },
// };

// ============================================================
// PRICING CONFIG
// ============================================================

export const PRICING_CONFIG: PricingConfig = {
  tiers: PRICING_TIERS,
  defaultTier: 'explorer',
  trialDays: 14,
  currency: 'EUR',
  currencySymbol: '€',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get tier by slug
 */
export function getTier(slug: PricingTierSlug): PricingTier {
  return PRICING_TIERS[slug];
}

/**
 * Get all tiers as array (ordered by value ladder level)
 */
export function getAllTiers(): PricingTier[] {
  return Object.values(PRICING_TIERS).sort((a, b) => a.valueLadderLevel - b.valueLadderLevel);
}

/**
 * Get tier display price
 */
export function formatPrice(tier: PricingTier): string {
  if (tier.price === 0) {
    return 'Gratis';
  }
  return `€${tier.price}${tier.intervalLabel}`;
}

/**
 * Check if tier is paid
 */
export function isPaidTier(slug: PricingTierSlug): boolean {
  return PRICING_TIERS[slug].price > 0;
}

/**
 * Check if user can upgrade from current tier to target tier
 */
export function canUpgrade(currentTier: PricingTierSlug, targetTier: PricingTierSlug): boolean {
  return PRICING_TIERS[targetTier].valueLadderLevel > PRICING_TIERS[currentTier].valueLadderLevel;
}

/**
 * Get upgrade options for a tier
 */
export function getUpgradeOptions(currentTier: PricingTierSlug): PricingTier[] {
  const currentLevel = PRICING_TIERS[currentTier].valueLadderLevel;
  return getAllTiers().filter(tier => tier.valueLadderLevel > currentLevel);
}

// ============================================================
// ENV VARIABLES REQUIRED
// ============================================================

/**
 * Required environment variables for Stripe integration:
 *
 * STRIPE_PRICE_LEADER_ANNUAL=price_xxxxxxxxxxxxx
 * STRIPE_PRICE_MENTOR_ANNUAL=price_xxxxxxxxxxxxx
 *
 * Fase 2:
 * STRIPE_PRICE_MASTERMIND_ANNUAL=price_xxxxxxxxxxxxx
 * STRIPE_PRICE_COACHING_STARTER=price_xxxxxxxxxxxxx
 * STRIPE_PRICE_COACHING_INTENSIVE=price_xxxxxxxxxxxxx
 * STRIPE_PRICE_PARTNER_ELITE=price_xxxxxxxxxxxxx
 */
