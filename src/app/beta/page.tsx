// ============================================================================
// PAGE: /beta
// Descrizione: Landing page per reclutamento beta tester (Founding Tester)
// Form: Google Form embeddato
// Tracking: Notion (manuale)
// ============================================================================

import Link from 'next/link';
import Image from 'next/image';
import { Gift, Sparkles, Award, Users, Clock, Zap } from 'lucide-react';

export const metadata = {
  title: 'Diventa Founding Tester | Vitaeology',
  description: 'Aiutaci a costruire il futuro della leadership e ottieni accesso esclusivo gratuito a Vitaeology',
};

// Configurazione posti disponibili (aggiornare manualmente)
const TOTAL_SPOTS = 20;
const SPOTS_TAKEN = 0; // Aggiornare man mano che arrivano candidature
const SPOTS_LEFT = TOTAL_SPOTS - SPOTS_TAKEN;

export default function BetaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-petrol-50 via-white to-gold-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 text-gold-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Accesso Esclusivo Limitato
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-petrol-600 mb-6 leading-tight">
            Diventa un Founding Tester<br className="hidden sm:block" /> di Vitaeology
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Aiutaci a costruire il futuro della leadership e ottieni
            <span className="text-petrol-600 font-semibold"> accesso esclusivo gratuito</span> alla piattaforma.
          </p>

          {/* Spots Counter */}
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-md border border-gray-100">
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, SPOTS_TAKEN))].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-petrol-100 border-2 border-white flex items-center justify-center text-xs font-medium text-petrol-600">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              {SPOTS_TAKEN === 0 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">
                Posti limitati: <span className="text-gold-600">{SPOTS_LEFT}/{TOTAL_SPOTS}</span>
              </p>
              <p className="text-xs text-gray-500">disponibili</p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 lg:mb-16">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">6-12 Mesi Gratis</h3>
            <p className="text-gray-600 text-sm">
              Accesso completo a tutte le funzionalità premium durante la fase di testing.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-petrol-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-petrol-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Impatto Diretto</h3>
            <p className="text-gray-600 text-sm">
              Il tuo feedback plasma le funzionalità. Costruisci il prodotto insieme a noi.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Badge Founding Tester</h3>
            <p className="text-gray-600 text-sm">
              Riconoscimento permanente come uno dei primi a credere in Vitaeology.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Community Esclusiva</h3>
            <p className="text-gray-600 text-sm">
              Accesso diretto al team e agli altri Founding Tester. Networking di valore.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Accesso Anticipato</h3>
            <p className="text-gray-600 text-sm">
              Prova le nuove funzionalità prima di tutti. Sei sempre un passo avanti.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Sconto Lifetime</h3>
            <p className="text-gray-600 text-sm">
              Al lancio ufficiale, sconto esclusivo riservato ai Founding Tester attivi.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden" id="form">
          <div className="bg-gradient-to-r from-petrol-500 to-petrol-600 p-6 lg:p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Candidati come Founding Tester</h2>
            <p className="text-white/80">
              Compila il form qui sotto. Selezioniamo con cura ogni tester per garantire feedback di qualità.
            </p>
          </div>

          {/* Google Form Embed */}
          <div className="p-6 lg:p-8">
            {/* Google Form iframe */}
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSe9Vk4pOIv_2Ii9TRWtpA6O6LMInf7E9yRS-8hWiWSK76txBA/viewform?embedded=true"
              width="100%"
              height="800"
              frameBorder={0}
              className="rounded-lg w-full"
              title="Form Candidatura Founding Tester"
            >
              Caricamento...
            </iframe>

            {/* Alternativa: Link diretto */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Preferisci compilare il form in una nuova finestra?
              </p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSe9Vk4pOIv_2Ii9TRWtpA6O6LMInf7E9yRS-8hWiWSK76txBA/viewform"
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
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Domande Frequenti
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Quanto dura la fase beta?</h3>
              <p className="text-gray-600 text-sm">
                Prevediamo 8-12 settimane di testing. Come Founding Tester, avrai accesso gratuito per 6-12 mesi.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Cosa devo fare come tester?</h3>
              <p className="text-gray-600 text-sm">
                Usa la piattaforma normalmente e condividi il tuo feedback. Non servono competenze tecniche.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Come funziona la selezione?</h3>
              <p className="text-gray-600 text-sm">
                Valutiamo diversità di background e motivazione. Ti contatteremo entro 48h dalla candidatura.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">I miei dati sono al sicuro?</h3>
              <p className="text-gray-600 text-sm">
                Assolutamente. Trattiamo i tuoi dati secondo il GDPR. Puoi cancellare il tuo account quando vuoi.
              </p>
            </div>
          </div>
        </div>

        {/* CTA finale */}
        <div className="mt-16 text-center">
          <a
            href="#form"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 text-petrol-900 font-bold rounded-xl hover:bg-gold-400 transition-colors shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Candidati Ora - Posti Limitati
          </a>
          <p className="text-sm text-gray-500 mt-3">
            Solo {SPOTS_LEFT} posti disponibili su {TOTAL_SPOTS}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-gray-100 mt-12">
        <div className="max-w-5xl mx-auto text-center text-gray-600 text-sm">
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
