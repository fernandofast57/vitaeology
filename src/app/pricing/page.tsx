import Link from 'next/link'
import Image from 'next/image'
import { Check, ArrowRight, Sparkles } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'per sempre',
    description: 'Inizia il tuo percorso di leadership',
    features: [
      'Test diagnostico completo (240 domande)',
      'Radar chart personalizzato',
      'Analisi dei 4 pilastri',
      'Report base dei risultati',
    ],
    cta: 'Inizia Gratis',
    href: '/auth/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '29',
    period: '/mese',
    description: 'Per chi vuole crescere davvero',
    features: [
      'Tutto del piano Free',
      '52 esercizi settimanali personalizzati',
      'AI Coach Fernando illimitato',
      'Tracking progressi avanzato',
      'Report mensili dettagliati',
      'Supporto prioritario',
    ],
    cta: 'Prova 14 giorni gratis',
    href: '/auth/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Team',
    price: '199',
    period: '/mese',
    description: 'Per team e organizzazioni',
    features: [
      'Tutto del piano Pro',
      'Fino a 10 membri del team',
      'Dashboard team leader',
      'Analisi comparativa del team',
      'Report aggregati',
      'Onboarding dedicato',
      'Account manager dedicato',
    ],
    cta: 'Contattaci',
    href: '/contact?subject=team',
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-horizontal.svg"
                alt="Vitaeology"
                width={220}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-petrol-600 hover:text-petrol-700 font-medium"
              >
                Accedi
              </Link>
              <Link
                href="/auth/signup"
                className="bg-petrol-600 hover:bg-petrol-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Inizia Gratis
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Piani semplici e trasparenti
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scegli il piano giusto per il tuo percorso di leadership.
            Inizia gratis e passa a Pro quando sei pronto.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-sm border-2 ${
                  plan.popular ? 'border-gold-500' : 'border-gray-200'
                } p-8 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gold-500 text-petrol-600 text-sm font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      Piu popolare
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price === '0' ? 'Gratis' : `€${plan.price}`}</span>
                  {plan.price !== '0' && (
                    <span className="text-gray-500">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-petrol-600 hover:bg-petrol-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Domande frequenti
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso provare il piano Pro gratuitamente?
              </h3>
              <p className="text-gray-600">
                Si, offriamo una prova gratuita di 14 giorni per il piano Pro.
                Nessuna carta di credito richiesta per iniziare.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso cambiare piano in qualsiasi momento?
              </h3>
              <p className="text-gray-600">
                Assolutamente. Puoi passare da un piano all&apos;altro in qualsiasi momento.
                Se passi a un piano superiore, pagherai solo la differenza proporzionale.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Come funziona l&apos;AI Coach Fernando?
              </h3>
              <p className="text-gray-600">
                Fernando e il tuo coach personale alimentato dall&apos;intelligenza artificiale.
                Ti guida attraverso gli esercizi, risponde alle tue domande e ti aiuta
                a sviluppare la tua leadership in modo personalizzato.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso annullare in qualsiasi momento?
              </h3>
              <p className="text-gray-600">
                Si, puoi annullare il tuo abbonamento in qualsiasi momento dalla
                sezione Abbonamento del tuo profilo. Non ci sono vincoli o penali.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-petrol-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto a iniziare?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Il test diagnostico e completamente gratuito. Scopri il tuo potenziale oggi.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-petrol-600 font-bold px-8 py-4 rounded-lg transition-colors"
          >
            Inizia il Test Gratuito
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-petrol-700 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Vitaeology. Tutti i diritti riservati.
            </p>
            <div className="flex gap-6 text-sm mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Termini</Link>
              <Link href="/contact" className="hover:text-white">Contatti</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
