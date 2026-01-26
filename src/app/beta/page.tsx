'use client';

// ============================================================================
// PAGE: /beta
// Descrizione: Landing page per reclutamento beta tester (Founding Tester)
// Form: Nativo React → Supabase
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gift, Sparkles, Award, Users, Clock, Zap, CheckCircle, Loader2 } from 'lucide-react';

// Configurazione posti disponibili (aggiornare manualmente)
const TOTAL_SPOTS = 20;
const SPOTS_TAKEN = 0; // Aggiornare man mano che arrivano candidature
const SPOTS_LEFT = TOTAL_SPOTS - SPOTS_TAKEN;

interface FormData {
  email: string;
  full_name: string;
  job_title: string;
  company: string;
  years_experience: string;
  device: string;
  motivation: string;
  hours_available: string;
  source: string;
}

export default function BetaPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    full_name: '',
    job_title: '',
    company: '',
    years_experience: '',
    device: '',
    motivation: '',
    hours_available: '',
    source: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/beta/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'invio');
      }

      setIsSubmitted(true);
      setIsApproved(data.approved === true);
      if (data.waitlistPosition) {
        setWaitlistPosition(data.waitlistPosition);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'invio');
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <div className="p-6 lg:p-8">
            {isSubmitted ? (
              // Success State - Different for approved vs waitlist
              <div className="text-center py-12">
                {isApproved ? (
                  // Approved
                  <>
                    <div className="w-20 h-20 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-gold-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Congratulazioni! Sei Dentro!
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-4">
                      Sei stato approvato come <strong className="text-gold-600">Founding Tester</strong>!
                    </p>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Controlla la tua email per le istruzioni su come creare il tuo account
                      e iniziare subito il tuo percorso.
                    </p>
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gold-500 text-petrol-900 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
                    >
                      <Sparkles className="w-5 h-5" />
                      Crea il Tuo Account
                    </Link>
                  </>
                ) : (
                  // Waitlist
                  <>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Sei in Lista d&apos;Attesa
                    </h3>
                    {waitlistPosition && (
                      <div className="bg-gray-100 rounded-xl px-6 py-4 inline-block mb-4">
                        <p className="text-sm text-gray-500">La tua posizione</p>
                        <p className="text-3xl font-bold text-petrol-600">#{waitlistPosition}</p>
                      </div>
                    )}
                    <p className="text-gray-600 max-w-md mx-auto">
                      Tutti i posti sono stati assegnati, ma ti abbiamo inserito in lista d&apos;attesa.
                      Ti contatteremo appena si libera un posto!
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-petrol-600 text-white font-medium rounded-lg hover:bg-petrol-700 transition-colors"
                    >
                      Torna alla Homepage
                    </Link>
                  </>
                )}
              </div>
            ) : (
              // Form
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Nome e Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
                      placeholder="Mario Rossi"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
                      placeholder="mario@esempio.it"
                    />
                  </div>
                </div>

                {/* Row 2: Ruolo e Azienda */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
                      Ruolo professionale *
                    </label>
                    <input
                      type="text"
                      id="job_title"
                      name="job_title"
                      required
                      value={formData.job_title}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
                      placeholder="CEO, Manager, Consulente..."
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Azienda
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
                      placeholder="Nome azienda (opzionale)"
                    />
                  </div>
                </div>

                {/* Row 3: Esperienza e Dispositivo */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700 mb-1">
                      Anni di esperienza *
                    </label>
                    <select
                      id="years_experience"
                      name="years_experience"
                      required
                      value={formData.years_experience}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent bg-white"
                    >
                      <option value="">Seleziona...</option>
                      <option value="0-2">0-2 anni</option>
                      <option value="3-5">3-5 anni</option>
                      <option value="6-10">6-10 anni</option>
                      <option value="10+">Più di 10 anni</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="device" className="block text-sm font-medium text-gray-700 mb-1">
                      Dispositivo principale *
                    </label>
                    <select
                      id="device"
                      name="device"
                      required
                      value={formData.device}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent bg-white"
                    >
                      <option value="">Seleziona...</option>
                      <option value="desktop">Desktop/Laptop</option>
                      <option value="mobile">Smartphone/Tablet</option>
                      <option value="both">Entrambi</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Ore disponibili e Source */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hours_available" className="block text-sm font-medium text-gray-700 mb-1">
                      Ore disponibili a settimana *
                    </label>
                    <select
                      id="hours_available"
                      name="hours_available"
                      required
                      value={formData.hours_available}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent bg-white"
                    >
                      <option value="">Seleziona...</option>
                      <option value="1-2">1-2 ore</option>
                      <option value="3-5">3-5 ore</option>
                      <option value="5+">Più di 5 ore</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                      Come ci hai trovato?
                    </label>
                    <select
                      id="source"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent bg-white"
                    >
                      <option value="">Seleziona...</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="facebook">Facebook</option>
                      <option value="google">Google</option>
                      <option value="referral">Passaparola</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>
                </div>

                {/* Motivazione */}
                <div>
                  <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
                    Perché vuoi diventare Founding Tester? *
                  </label>
                  <textarea
                    id="motivation"
                    name="motivation"
                    required
                    rows={4}
                    value={formData.motivation}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent resize-none"
                    placeholder="Raccontaci cosa ti interessa di Vitaeology e cosa speri di ottenere dalla partecipazione..."
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-petrol-600 text-white font-semibold rounded-lg hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Invia Candidatura
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Inviando questo form accetti la nostra{' '}
                  <Link href="/privacy" className="text-petrol-600 underline">Privacy Policy</Link>
                </p>
              </form>
            )}
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
