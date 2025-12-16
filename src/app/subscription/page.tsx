'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { CreditCard, Check, Crown, Zap, Star, Loader2, ExternalLink } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  current?: boolean;
  priceId?: string;
}

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('trial');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(14);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

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
          setCurrentPlan(profile.subscription_tier || 'trial');
          setSubscriptionStatus(profile.subscription_status);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
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

  const plans: Plan[] = [
    {
      id: 'trial',
      name: 'Trial',
      price: 'Gratis',
      period: '14 giorni',
      description: 'Prova tutte le funzionalità',
      current: currentPlan === 'trial' || currentPlan === 'free',
      features: [
        'Assessment completo 240 domande',
        'Radar Chart interattivo',
        'AI Coach Fernando',
        '10 esercizi di base',
        'Report PDF base'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '€47',
      period: '/mese',
      description: 'Per chi vuole crescere seriamente',
      highlighted: true,
      current: currentPlan === 'professional',
      priceId: 'professional_monthly',
      features: [
        'Tutto del Trial +',
        'Esercizi illimitati',
        'Coaching AI avanzato',
        'Report PDF completo',
        'Tracciamento progressi',
        'Supporto prioritario'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Per team e aziende',
      current: currentPlan === 'enterprise',
      features: [
        'Tutto del Professional +',
        'Dashboard team',
        'Analytics avanzate',
        'Coaching 1:1 con Fernando',
        'Onboarding personalizzato',
        'SLA dedicato'
      ]
    }
  ];

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

            {/* Current Plan Banner */}
            {(currentPlan === 'trial' || currentPlan === 'free') && (
              <div className="bg-gradient-to-r from-amber-500 to-gold-500 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Periodo di prova attivo</h3>
                      <p className="text-white/90">Ti restano {trialDaysLeft} giorni per esplorare Vitaeology</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCheckout('professional_monthly')}
                    disabled={!!checkoutLoading}
                    className="bg-white text-amber-600 px-5 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {checkoutLoading === 'professional_monthly' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Passa a Pro
                  </button>
                </div>
              </div>
            )}

            {/* Active Subscription Banner */}
            {currentPlan === 'professional' && subscriptionStatus === 'active' && (
              <div className="bg-gradient-to-r from-petrol-500 to-petrol-600 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Piano Professional attivo</h3>
                      <p className="text-white/90">Hai accesso a tutte le funzionalità premium</p>
                    </div>
                  </div>
                  <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="bg-white text-petrol-600 px-5 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
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

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl border-2 overflow-hidden ${
                    plan.highlighted
                      ? 'border-petrol-500 shadow-lg'
                      : plan.current
                      ? 'border-gold-500'
                      : 'border-neutral-200'
                  }`}
                >
                  {plan.highlighted && !plan.current && (
                    <div className="absolute top-0 left-0 right-0 bg-petrol-500 text-white text-center py-1 text-sm font-medium">
                      <Star className="w-4 h-4 inline mr-1" />
                      Consigliato
                    </div>
                  )}
                  {plan.current && (
                    <div className="absolute top-0 left-0 right-0 bg-gold-500 text-white text-center py-1 text-sm font-medium">
                      <Crown className="w-4 h-4 inline mr-1" />
                      Piano attuale
                    </div>
                  )}

                  <div className={`p-6 ${plan.highlighted || plan.current ? 'pt-10' : ''}`}>
                    <h3 className="text-xl font-bold text-neutral-900">{plan.name}</h3>
                    <p className="text-neutral-500 text-sm mt-1">{plan.description}</p>

                    <div className="mt-4 mb-6">
                      <span className="text-3xl font-bold text-neutral-900">{plan.price}</span>
                      <span className="text-neutral-500">{plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-5 h-5 text-green-500 shrink-0" />
                          <span className="text-neutral-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        if (plan.id === 'enterprise') {
                          window.location.href = 'mailto:info@vitaeology.com?subject=Piano%20Enterprise';
                        } else if (plan.priceId && !plan.current) {
                          handleCheckout(plan.priceId);
                        }
                      }}
                      disabled={plan.current || (!!plan.priceId && !!checkoutLoading)}
                      className={`w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        plan.current
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          : plan.highlighted
                          ? 'bg-petrol-600 text-white hover:bg-petrol-700'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {checkoutLoading === plan.priceId && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {plan.current ? 'Piano attuale' : plan.id === 'enterprise' ? 'Contattaci' : 'Scegli piano'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Manage Subscription */}
            {currentPlan === 'professional' && (
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

            {/* Payment Methods - only show for trial */}
            {(currentPlan === 'trial' || currentPlan === 'free') && (
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
                  <p className="font-medium text-neutral-700">Cosa succede dopo il trial?</p>
                  <p className="text-neutral-500">Al termine dei 14 giorni, potrai continuare con un piano a pagamento o l&apos;accesso sarà limitato alle funzionalità base.</p>
                </div>
                <div>
                  <p className="font-medium text-neutral-700">Posso cambiare piano?</p>
                  <p className="text-neutral-500">Sì, puoi passare a un piano superiore in qualsiasi momento. La differenza sarà calcolata pro-rata.</p>
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
