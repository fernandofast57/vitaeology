// ============================================================================
// PAGE: /beta
// Descrizione: Pagina per raccogliere candidature beta tester
// ============================================================================

import Link from 'next/link';
import Image from 'next/image';
import { Users, MessageSquare, Shield, Gift } from 'lucide-react';

export const metadata = {
  title: 'Programma Beta Tester | Vitaeology',
  description: 'Diventa beta tester di Vitaeology e aiutaci a costruire la piattaforma di crescita personale del futuro',
};

export default function BetaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-petrol-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-horizontal.svg"
                alt="Vitaeology"
                width={180}
                height={28}
                className="h-7 w-auto"
              />
            </Link>
            <Link
              href="/login"
              className="text-petrol-600 hover:text-petrol-700 font-medium text-sm"
            >
              Accedi
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-gold-100 text-gold-700 rounded-full text-sm font-medium mb-4">
            Accesso Anticipato
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-petrol-600 mb-4">
            Diventa Beta Tester
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unisciti al gruppo esclusivo di persone che stanno plasmando il futuro
            della crescita personale con Vitaeology.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-petrol-100 rounded-lg flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-petrol-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Accesso Gratuito</h3>
            <p className="text-gray-600 text-sm">
              Accedi gratuitamente a tutte le funzionalità durante la fase beta.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-petrol-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-petrol-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">La Tua Voce Conta</h3>
            <p className="text-gray-600 text-sm">
              Il tuo feedback plasma direttamente le funzionalità della piattaforma.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-petrol-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-petrol-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Community Esclusiva</h3>
            <p className="text-gray-600 text-sm">
              Entra in contatto diretto con il team e altri beta tester.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-petrol-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-petrol-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Vantaggi Founder</h3>
            <p className="text-gray-600 text-sm">
              Sconto speciale al lancio ufficiale per tutti i beta tester attivi.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-petrol-500 to-petrol-600 p-6 text-white">
            <h2 className="text-xl font-semibold mb-2">Candidati come Beta Tester</h2>
            <p className="text-white/80 text-sm">
              Compila il form per unirti al programma. Ti contatteremo presto!
            </p>
          </div>

          {/* Google Form Embed */}
          <div className="p-6">
            {/*
              ISTRUZIONI PER L'EMBED:
              1. Crea un Google Form con le domande per i beta tester
              2. Vai su Invia > Incorpora
              3. Copia l'URL del form (es: https://docs.google.com/forms/d/e/FORM_ID/viewform)
              4. Sostituisci GOOGLE_FORM_URL qui sotto con il tuo URL
            */}
            <div className="aspect-[4/3] w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
              {/* Placeholder - sostituire con iframe quando il form è pronto */}
              <div className="text-center p-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Google Form da configurare</p>
                <p className="text-sm text-gray-400">
                  Sostituisci questo placeholder con l&apos;iframe del Google Form
                </p>
                <code className="block mt-4 p-3 bg-gray-100 rounded text-xs text-left overflow-x-auto">
                  {`<iframe
  src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true"
  width="100%"
  height="600"
  frameBorder="0"
  className="rounded-lg"
>
  Caricamento...
</iframe>`}
                </code>
              </div>
            </div>

            {/* Alternativa: Link diretto al form */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Oppure compila il form direttamente su Google Forms:
              </p>
              <a
                href="#" // Sostituire con URL del Google Form
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-petrol-600 text-white font-medium rounded-lg hover:bg-petrol-700 transition-colors"
              >
                Apri il Form
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Domande Frequenti
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Quanto dura la fase beta?</h3>
              <p className="text-gray-600 text-sm">
                La fase beta durerà indicativamente 4-8 settimane. Ti terremo aggiornato sulle tempistiche.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Cosa devo fare come beta tester?</h3>
              <p className="text-gray-600 text-sm">
                Usa la piattaforma normalmente e condividi il tuo feedback tramite il pulsante dedicato.
                Non servono competenze tecniche particolari.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">I miei dati sono al sicuro?</h3>
              <p className="text-gray-600 text-sm">
                Assolutamente. Trattiamo i tuoi dati con la massima cura secondo il GDPR.
                Potrai eliminare il tuo account in qualsiasi momento.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-gray-100 mt-12">
        <div className="max-w-4xl mx-auto text-center text-gray-600 text-sm">
          <p>2026 Vitaeology. Tutti i diritti riservati.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-petrol-600">Privacy</Link>
            <Link href="/terms" className="hover:text-petrol-600">Termini</Link>
            <Link href="/contact" className="hover:text-petrol-600">Contatti</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
