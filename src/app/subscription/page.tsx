'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { CreditCard, Check, Crown, Zap, Star, Loader2, ExternalLink, Target, Heart, Compass } from 'lucide-react';
import { PRICING_TIERS, getAllTiers, type PricingTierSlug } from '@/config/pricing';
import { getUserPathways, type UserPathwayWithDetails, PATHWAY_COLORS, PATHWAY_NAMES } from '@/lib/pathways';

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState<PricingTierSlug>('explorer');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(14);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userPathways, setUserPathways] = useState<UserPathwayWithDetails[]>([]);

  const supabase = createClient();

  // Icone per percorso
  const PATHWAY_ICONS: Record<string, React.ElementType> = {
    'leadership': Crown,
    'risolutore': Target,
    'microfelicita': Heart,
  };

  // Mappa pathway slug → dashboard path
  const PATHWAY_TO_DASHBOARD: Record<string, string> = {
    'leadership': 'leadership',
    'risolutore': 'ostacoli',
    'microfelicita': 'microfelicita',
  };

  // Get tiers from config
  const tiers = getAllTiers();

  useEffect(() => {
    // Check URL params for success/cancel
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setMessage({ type: 'success', text: 'Abbonamento attivato con successo!' });
    } else if (canceled === 'true') {
      setMessage({ type: 'error', text: 'Checkout annullato. Puoi riprovare quando vuoi.' });
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Calculate trial days remaining
        const createdAt = new Date(user.created_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const remaining = Math.max(0, 14 - diffDays);
        setTrialDaysLeft(remaining);

        // Fetch subscription status from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_tier, stripe_customer_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          // Map old tier names to new ones
          const tierMapping: Record<string, PricingTierSlug> = {
            'free': 'explorer',
            'trial': 'explorer',
            'explorer': 'explorer',
            'leader': 'leader',
            'professional': 'leader', // Legacy mapping
            'mentor': 'mentor',
          };
          const mappedTier = tierMapping[profile.subscription_tier || 'explorer'] || 'explorer';
          setCurrentTier(mappedTier);
          setSubscriptionStatus(profile.subscription_status);
        }

        // Fetch user pathways
        const pathways = await getUserPathways(supabase, user.id);
        setUserPathways(pathways);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  const handleCheckout = async (tierSlug: PricingTierSlug) => {
    setCheckoutLoading(tierSlug);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierSlug,
          userId,
          userEmail,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: 'error', text: data.error || 'Errore durante il checkout' });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setMessage({ type: 'error', text: 'Errore durante il checkout' });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: 'error', text: data.error || 'Errore durante l\'accesso al portale' });
      }
    } catch (error) {
      console.error('Portal error:', error);
      setMessage({ type: 'error', text: 'Errore durante l\'accesso al portale' });
    } finally {
      setPortalLoading(false);
    }
  };

  const isPaidTier = (slug: PricingTierSlug) => PRICING_TIERS[slug].price > 0;
  const isCurrentTier = (slug: PricingTierSlug) => slug === currentTier;
  const canUpgradeTo = (slug: PricingTierSlug) => {
    return PRICING_TIERS[slug].valueLadderLevel > PRICING_TIERS[currentTier].valueLadderLevel;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-petrol-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userEmail={userEmail} userName={userName} />
      <div className="lg:pl-64">
        <DashboardHeader userName={userName} userEmail={userEmail} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Abbonamento</h1>
              <p className="text-neutral-600 mt-1">Gestisci il tuo piano e la fatturazione</p>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Explorer (Free) Plan Banner */}
            {currentTier === 'explorer' && (
              <div className="bg-gradient-to-r from-amber-500 to-gold-500 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Piano Explorer attivo</h3>
                      <p className="text-white/90">
                        {trialDaysLeft > 0
                          ? `Ti restano ${trialDaysLeft} giorni di prova completa`
                          : 'Passa a Leader per sbloccare tutte le funzionalità'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCheckout('leader')}
                    disabled={!!checkoutLoading}
                    className="bg-white text-amber-600 px-5 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {checkoutLoading === 'leader' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Passa a Leader
                  </button>
                </div>
              </div>
            )}

            {/* Leader Plan Banner */}
            {currentTier === 'leader' && subscriptionStatus === 'active' && (
              <div className="bg-gradient-to-r from-petrol-500 to-petrol-600 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Piano Leader attivo</h3>
                      <p className="text-white/90">Hai accesso a tutte le funzionalità Leader</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCheckout('mentor')}
                      disabled={!!checkoutLoading}
                      className="bg-gold-500 text-petrol-700 px-4 py-2 rounded-lg font-medium hover:bg-gold-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {checkoutLoading === 'mentor' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                      Upgrade a Mentor
                    </button>
                    <button
                      onClick={handlePortal}
                      disabled={portalLoading}
                      className="bg-white text-petrol-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {portalLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                      Gestisci
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mentor Plan Banner */}
            {currentTier === 'mentor' && subscriptionStatus === 'active' && (
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Piano Mentor attivo</h3>
                      <p className="text-white/90">Accesso completo a tutti i percorsi e funzionalità</p>
                    </div>
                  </div>
                  <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="bg-white text-purple-600 px-5 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {portalLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    Gestisci abbonamento
                  </button>
                </div>
              </div>
            )}

            {/* I Tuoi Percorsi - Multi-pathway section */}
            {userPathways.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-petrol-600" />
                    I Tuoi Percorsi
                  </h3>
                  <span className="text-sm text-neutral-500">
                    {userPathways.length} di {currentTier === 'mentor' ? '3' : currentTier === 'leader' ? '1' : '1'} percorsi attivi
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userPathways.map((pathway) => {
                    const slug = pathway.pathway.slug;
                    const Icon = PATHWAY_ICONS[slug] || Compass;
                    const color = PATHWAY_COLORS[slug as keyof typeof PATHWAY_COLORS] || '#D4AF37';
                    const dashboardPath = PATHWAY_TO_DASHBOARD[slug];
                    const progress = pathway.progress_percentage || 0;
                    const hasAssessment = !!pathway.last_assessment_at;

                    return (
                      <div
                        key={pathway.id}
                        className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors"
                        style={{ borderLeftWidth: '4px', borderLeftColor: color }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 truncate">
                              {PATHWAY_NAMES[slug as keyof typeof PATHWAY_NAMES] || pathway.pathway.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {hasAssessment ? (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  Assessment completato
                                </span>
                              ) : (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  Assessment da fare
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-500">Progresso</span>
                            <span className="font-medium" style={{ color }}>{progress}%</span>
                          </div>
                          <div className="w-full bg-neutral-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${progress}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>

                        {/* Link to dashboard */}
                        <a
                          href={`/dashboard/${dashboardPath}`}
                          className="mt-3 block text-center text-sm font-medium py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: `${color}10`, color }}
                        >
                          Vai al percorso
                        </a>
                      </div>
                    );
                  })}

                  {/* Placeholder for additional pathways (Mentor only) */}
                  {currentTier === 'mentor' && userPathways.length < 3 && (
                    <div className="border-2 border-dashed border-neutral-200 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                        <Compass className="w-5 h-5 text-neutral-400" />
                      </div>
                      <p className="text-sm text-neutral-500">
                        Puoi attivare {3 - userPathways.length} {3 - userPathways.length === 1 ? 'altro percorso' : 'altri percorsi'}
                      </p>
                      <a
                        href="/dashboard"
                        className="mt-2 text-sm text-petrol-600 font-medium hover:underline"
                      >
                        Scopri i percorsi →
                      </a>
                    </div>
                  )}
                </div>

                {/* Upgrade hint for non-mentor users with limited pathways */}
                {currentTier !== 'mentor' && userPathways.length >= 1 && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">
                      <Star className="w-4 h-4 inline mr-1" />
                      <strong>Piano Mentor:</strong> Accedi a tutti e 3 i percorsi (Leadership, Ostacoli, Microfelicità) con un unico abbonamento.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map((tier) => {
                const isCurrent = isCurrentTier(tier.slug);
                const canUpgrade = canUpgradeTo(tier.slug);

                return (
                  <div
                    key={tier.slug}
                    className={`relative bg-white rounded-xl border-2 overflow-hidden ${
                      tier.highlighted
                        ? 'border-petrol-500 shadow-lg'
                        : isCurrent
                        ? 'border-gold-500'
                        : 'border-neutral-200'
                    }`}
                  >
                    {tier.badge && !isCurrent && (
                      <div className={`absolute top-0 left-0 right-0 text-white text-center py-1 text-sm font-medium ${
                        tier.highlighted ? 'bg-petrol-500' : 'bg-purple-500'
                      }`}>
                        <Star className="w-4 h-4 inline mr-1" />
                        {tier.badge}
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-0 left-0 right-0 bg-gold-500 text-white text-center py-1 text-sm font-medium">
                        <Crown className="w-4 h-4 inline mr-1" />
                        Piano attuale
                      </div>
                    )}

                    <div className={`p-6 ${(tier.badge || isCurrent) ? 'pt-10' : ''}`}>
                      <h3 className="text-xl font-bold text-neutral-900">{tier.name}</h3>
                      <p className="text-neutral-500 text-sm mt-1">{tier.description}</p>

                      <div className="mt-4 mb-6">
                        {tier.price === 0 ? (
                          <span className="text-3xl font-bold text-neutral-900">Gratis</span>
                        ) : (
                          <>
                            {tier.originalPrice && (
                              <span className="text-lg text-neutral-400 line-through mr-2">€{tier.originalPrice}</span>
                            )}
                            <span className="text-3xl font-bold text-neutral-900">€{tier.price}</span>
                            <span className="text-neutral-500">{tier.intervalLabel}</span>
                          </>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-neutral-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => {
                          if (isPaidTier(tier.slug) && canUpgrade) {
                            handleCheckout(tier.slug);
                          }
                        }}
                        disabled={isCurrent || !canUpgrade || !!checkoutLoading}
                        className={`w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          isCurrent
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : tier.ctaVariant === 'primary'
                            ? 'bg-petrol-600 text-white hover:bg-petrol-700'
                            : tier.ctaVariant === 'secondary'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        } ${!canUpgrade && !isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {checkoutLoading === tier.slug && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        {isCurrent ? 'Piano attuale' : tier.ctaText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Manage Subscription - Show for paid tiers */}
            {isPaidTier(currentTier) && subscriptionStatus === 'active' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-petrol-600" />
                  Gestione abbonamento
                </h3>
                <p className="text-neutral-500 text-sm mb-4">
                  Puoi gestire il tuo abbonamento, aggiornare il metodo di pagamento o annullare dal portale Stripe.
                </p>
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="bg-petrol-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-petrol-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  Apri portale fatturazione
                </button>
              </div>
            )}

            {/* Payment Methods - only show for explorer */}
            {currentTier === 'explorer' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-petrol-600" />
                  Metodi di pagamento
                </h3>
                <p className="text-neutral-500 text-sm">
                  Accettiamo tutte le principali carte di credito. Il pagamento viene elaborato in modo sicuro da Stripe.
                </p>
                <div className="mt-4 flex gap-2">
                  <div className="w-12 h-8 bg-neutral-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-neutral-400">VISA</span>
                  </div>
                  <div className="w-12 h-8 bg-neutral-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-neutral-400">MC</span>
                  </div>
                  <div className="w-12 h-8 bg-neutral-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-neutral-400">AMEX</span>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h3 className="font-semibold text-neutral-900 mb-3">Domande frequenti</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-neutral-700">Posso annullare in qualsiasi momento?</p>
                  <p className="text-neutral-500">Sì, puoi annullare il tuo abbonamento quando vuoi. L&apos;accesso rimarrà attivo fino alla fine del periodo pagato.</p>
                </div>
                <div>
                  <p className="font-medium text-neutral-700">I piani sono annuali?</p>
                  <p className="text-neutral-500">Sì, Leader e Mentor sono piani annuali. Risparmi rispetto al pagamento mensile e hai accesso per 12 mesi completi.</p>
                </div>
                <div>
                  <p className="font-medium text-neutral-700">Posso passare a un piano superiore?</p>
                  <p className="text-neutral-500">Sì, puoi passare da Leader a Mentor in qualsiasi momento. La differenza sarà calcolata pro-rata.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-petrol-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}
