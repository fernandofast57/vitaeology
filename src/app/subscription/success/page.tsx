'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Check, ArrowRight, Sparkles, MessageCircle, BookOpen, BarChart3, Users } from 'lucide-react';
import ConversionTracker from '@/components/tracking/ConversionTracker';

// Configurazione piani
const PLAN_CONFIG = {
  leader: {
    name: 'Leader',
    price: '149',
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    features: [
      { icon: BookOpen, text: 'Tutti i 52 esercizi settimanali' },
      { icon: MessageCircle, text: 'AI Coach Fernando illimitato' },
      { icon: BarChart3, text: 'Radar evolutivo con confronto progressi' },
      { icon: Check, text: 'Storico completo delle tue riflessioni' },
    ],
  },
  mentor: {
    name: 'Mentor',
    price: '490',
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    features: [
      { icon: BookOpen, text: 'Tutti i 52 esercizi settimanali' },
      { icon: MessageCircle, text: 'AI Coach Fernando illimitato' },
      { icon: BarChart3, text: 'Radar evolutivo con confronto progressi' },
      { icon: Check, text: 'Storico completo delle tue riflessioni' },
      { icon: Users, text: '2 sessioni 1:1 con Fernando' },
      { icon: Sparkles, text: 'Badge "Professionista Vitaeology"' },
      { icon: Check, text: 'Accesso a tutti e 3 i percorsi' },
    ],
  },
};

type PlanType = keyof typeof PLAN_CONFIG;

function SuccessContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [userName, setUserName] = useState<string>('');
  const [planType, setPlanType] = useState<PlanType>('leader');
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Leggi piano da query param o da profilo
    const planParam = searchParams.get('plan') as PlanType | null;
    if (planParam && (planParam === 'leader' || planParam === 'mentor')) {
      setPlanType(planParam);
    }

    // Fetch user data
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, subscription_tier')
            .eq('id', user.id)
            .single();

          if (profile?.full_name) {
            setUserName(profile.full_name.split(' ')[0]);
          }
          if (profile?.subscription_tier && !planParam) {
            setPlanType(profile.subscription_tier as PlanType);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    // Nascondi confetti dopo 5 secondi
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [supabase, searchParams]);

  const config = PLAN_CONFIG[planType] || PLAN_CONFIG.leader;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Meta Pixel + GA4 Subscribe event */}
      <ConversionTracker
        event="Subscribe"
        data={{
          content_name: `Piano ${config.name}`,
          content_category: 'subscription',
          value: Number(config.price),
          currency: 'EUR',
        }}
      />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  ['bg-amber-400', 'bg-violet-400', 'bg-emerald-400', 'bg-blue-400', 'bg-pink-400'][
                    Math.floor(Math.random() * 5)
                  ]
                }`}
                style={{
                  animation: `fall ${3 + Math.random() * 2}s linear forwards`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r ${config.gradient} shadow-lg mb-6`}>
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Benvenuto nel piano {config.name}
            {userName && `, ${userName}`}!
          </h1>

          <p className="text-lg text-gray-600">
            Il tuo upgrade è stato completato con successo.
            Ora hai accesso a tutti gli strumenti per il tuo percorso di crescita.
          </p>
        </div>

        {/* Piano Card */}
        <div className={`${config.bgLight} rounded-2xl p-6 mb-8 border-2 border-${config.color}-200`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className={`w-6 h-6 ${config.textColor}`} />
              <span className={`text-lg font-bold ${config.textColor}`}>
                Piano {config.name}
              </span>
            </div>
            <span className="text-gray-600 font-medium">
              €{config.price}/anno
            </span>
          </div>

          <div className="space-y-3">
            {config.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${config.bgLight} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.textColor}`} />
                  </div>
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section - STOP → START */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
            Inizia subito il tuo percorso
          </h2>

          {/* Primary CTA */}
          <Link
            href="/dashboard"
            className={`flex items-center justify-center gap-3 w-full bg-gradient-to-r ${config.gradient} text-white py-4 px-6 rounded-xl font-semibold text-lg hover:opacity-90 transition shadow-lg`}
          >
            Vai alla Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/exercises"
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            <BookOpen className="w-5 h-5" />
            Esplora Esercizi
          </Link>

          {/* Mentor Extra: Book 1:1 */}
          {planType === 'mentor' && (
            <Link
              href="https://calendly.com/vitaeology/mentor-session"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-violet-100 text-violet-700 py-3 px-4 rounded-xl font-medium hover:bg-violet-200 transition border-2 border-violet-200"
            >
              <Users className="w-5 h-5" />
              Prenota la tua sessione 1:1 con Fernando
            </Link>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Riceverai una email di conferma con tutti i dettagli del tuo abbonamento.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Hai domande?{' '}
            <Link href="/contact" className={`${config.textColor} hover:underline`}>
              Contattaci
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
