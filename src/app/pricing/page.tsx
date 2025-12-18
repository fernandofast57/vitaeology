import Link from 'next/link'
import Image from 'next/image'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { getAllTiers, formatPrice } from '@/config/pricing'

// Usa PRICING_TIERS come fonte dati (SINGLE SOURCE OF TRUTH)
const tiers = getAllTiers()

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
            Inizia gratis con Explorer e cresci al tuo ritmo.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.slug}
                className={`relative bg-white rounded-2xl shadow-sm border-2 ${
                  tier.highlighted ? 'border-gold-500' : 'border-gray-200'
                } p-8 flex flex-col`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gold-500 text-petrol-600 text-sm font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(tier)}
                  </span>
                  {tier.originalPrice && (
                    <span className="ml-2 text-lg text-gray-400 line-through">
                      €{tier.originalPrice}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.price === 0 ? '/auth/signup' : `/auth/signup?plan=${tier.slug}`}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2 ${
                    tier.ctaVariant === 'primary'
                      ? 'bg-petrol-600 hover:bg-petrol-700 text-white'
                      : tier.ctaVariant === 'secondary'
                      ? 'bg-gold-500 hover:bg-gold-600 text-petrol-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {tier.ctaText}
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
                Posso provare Vitaeology gratuitamente?
              </h3>
              <p className="text-gray-600">
                Sì! Il piano Explorer è completamente gratuito per sempre.
                Include il test diagnostico completo, il radar chart e l&apos;accesso
                limitato all&apos;AI Coach Fernando.
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
                Fernando è il tuo coach personale alimentato dall&apos;intelligenza artificiale.
                Ti guida attraverso gli esercizi, risponde alle tue domande e ti aiuta
                a sviluppare la tua leadership in modo personalizzato.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                I piani sono annuali o mensili?
              </h3>
              <p className="text-gray-600">
                I piani Leader e Mentor sono con fatturazione annuale, il che ti permette
                di risparmiare rispetto al pagamento mensile. Il piano Explorer è
                gratuito per sempre.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso annullare in qualsiasi momento?
              </h3>
              <p className="text-gray-600">
                Sì, puoi annullare il tuo abbonamento in qualsiasi momento dalla
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
            Il test diagnostico è completamente gratuito. Scopri il tuo potenziale oggi.
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
