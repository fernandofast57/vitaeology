'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, Crown, ArrowRight, Users } from 'lucide-react';
import { PRICING_TIERS } from '@/config/pricing';

const PRODUCT_CONFIG = {
  coaching: {
    title: '1:1 Coaching Acquistato',
    subtitle: 'Grazie per la tua fiducia in questo percorso trasformativo',
    icon: Calendar,
    color: 'from-blue-500 to-blue-600',
    nextSteps: [
      'Riceverai una email entro 24 ore con le istruzioni per prenotare la prima sessione',
      'Il tuo accesso Mentor è stato attivato immediatamente',
      'Preparati: riceverai un questionario di onboarding'
    ],
    cta: {
      text: 'Vai alla Dashboard',
      href: '/dashboard'
    }
  },
  advisory: {
    title: 'Advisory Board - Benvenuto',
    subtitle: 'Hai fatto un passo importante verso la crescita strategica',
    icon: Crown,
    color: 'from-amber-500 to-amber-600',
    nextSteps: [
      'Fernando ti contatterà personalmente entro 48 ore',
      'Il tuo accesso Mastermind è stato attivato permanentemente',
      'Riceverai le date del prossimo meeting strategico'
    ],
    cta: {
      text: 'Vai alla Dashboard',
      href: '/dashboard'
    }
  }
};

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-petrol-600" />
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product') as 'coaching' | 'advisory' | null;

  if (!productSlug || !PRODUCT_CONFIG[productSlug]) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Prodotto non trovato</p>
          <Link href="/dashboard" className="text-petrol-600 underline mt-2 block">
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const config = PRODUCT_CONFIG[productSlug];
  const tier = PRICING_TIERS[productSlug];
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header con gradiente */}
          <div className={`bg-gradient-to-r ${config.color} p-8 text-white text-center`}>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{config.title}</h1>
            <p className="text-white/90">{config.subtitle}</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Riepilogo acquisto */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${config.color} flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <p className="text-gray-600 text-sm">{tier.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    €{tier.price.toLocaleString()}
                  </p>
                  {tier.originalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      €{tier.originalPrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Prossimi passi */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-petrol-600" />
                Prossimi Passi
              </h2>
              <ul className="space-y-3">
                {config.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-petrol-100 text-petrol-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <Link
              href={config.cta.href}
              className="w-full bg-petrol-600 text-white py-4 rounded-xl font-semibold hover:bg-petrol-700 transition-colors flex items-center justify-center gap-2"
            >
              {config.cta.text}
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Supporto */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Domande? Scrivi a{' '}
              <a href="mailto:supporto@vitaeology.com" className="text-petrol-600 underline">
                supporto@vitaeology.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SuccessContent />
    </Suspense>
  );
}
