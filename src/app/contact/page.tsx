'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Mail, MapPin, MessageSquare, HelpCircle, Wrench, Handshake, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // Simula invio email (in produzione, collegare a un endpoint API)
    try {
      // Per ora, apri il client email
      const mailtoLink = `mailto:support@vitaeology.com?subject=${encodeURIComponent(
        `[${formData.subject}] Messaggio da ${formData.name}`
      )}&body=${encodeURIComponent(
        `Nome: ${formData.name}\nEmail: ${formData.email}\n\nMessaggio:\n${formData.message}`
      )}`;

      window.location.href = mailtoLink;
      setStatus('success');

      // Reset form dopo 3 secondi
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: 'general', message: '' });
        setStatus('idle');
      }, 3000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Vitaeology</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna al sito</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contattaci
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Siamo qui per aiutarti nel tuo percorso di sviluppo della leadership.
            Scegli il modo migliore per raggiungerci.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Email */}
          <a
            href="mailto:support@vitaeology.com"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <Mail className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-amber-600 font-medium">support@vitaeology.com</p>
            <p className="text-sm text-gray-500 mt-2">Rispondiamo entro 24-48h</p>
          </a>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Sede</h3>
            <p className="text-gray-700">Fernando Marongiu</p>
            <p className="text-gray-700">Cagliari, Italia</p>
          </div>

          {/* Response Time */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Tempi di risposta</h3>
            <p className="text-gray-700">Lun - Ven: 24h</p>
            <p className="text-gray-700">Weekend: 48-72h</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-600" />
              Inviaci un messaggio
            </h2>

            {status === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Messaggio pronto!</h3>
                <p className="text-gray-600">
                  Si aprirà il tuo client email per completare l&apos;invio.
                </p>
              </div>
            ) : status === 'error' ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ops! Qualcosa è andato storto</h3>
                <p className="text-gray-600 mb-4">
                  Prova a inviarci un&apos;email direttamente a support@vitaeology.com
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-amber-600 hover:underline"
                >
                  Riprova
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="Mario Rossi"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="mario@esempio.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Oggetto
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  >
                    <option value="general">Domanda generale</option>
                    <option value="support">Assistenza tecnica</option>
                    <option value="billing">Fatturazione e pagamenti</option>
                    <option value="partnership">Collaborazioni e partnership</option>
                    <option value="feedback">Feedback e suggerimenti</option>
                    <option value="other">Altro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Messaggio
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                    placeholder="Come possiamo aiutarti?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Preparazione...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Invia messaggio
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Cliccando &quot;Invia&quot; si aprirà il tuo client email preferito
                </p>
              </form>
            )}
          </div>

          {/* Right: Categories */}
          <div className="space-y-6">
            {/* FAQ */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Domande Frequenti</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Prima di contattarci, potresti trovare la risposta nelle nostre FAQ.
                  </p>
                  <div className="space-y-2 text-sm">
                    <details className="group">
                      <summary className="cursor-pointer text-gray-700 hover:text-amber-600 font-medium">
                        Come funziona l&apos;assessment?
                      </summary>
                      <p className="mt-2 text-gray-600 pl-4">
                        L&apos;assessment consiste in 240 domande che valutano 24 caratteristiche di leadership
                        distribuite su 4 pilastri. Richiede circa 30-45 minuti.
                      </p>
                    </details>
                    <details className="group">
                      <summary className="cursor-pointer text-gray-700 hover:text-amber-600 font-medium">
                        Posso cancellare il mio abbonamento?
                      </summary>
                      <p className="mt-2 text-gray-600 pl-4">
                        Sì, puoi cancellare in qualsiasi momento dalla sezione Abbonamento del tuo profilo.
                        L&apos;accesso rimane attivo fino alla scadenza del periodo pagato.
                      </p>
                    </details>
                    <details className="group">
                      <summary className="cursor-pointer text-gray-700 hover:text-amber-600 font-medium">
                        Come funziona l&apos;AI Coach Fernando?
                      </summary>
                      <p className="mt-2 text-gray-600 pl-4">
                        Fernando è un assistente AI basato sui contenuti del libro &quot;Rivoluzione Aurea&quot;
                        che ti guida nel tuo percorso di sviluppo con consigli personalizzati.
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Support */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Assistenza Tecnica</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Problemi tecnici con la piattaforma? Il nostro team è pronto ad aiutarti.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Problemi di accesso o login</li>
                    <li>• Errori durante l&apos;assessment</li>
                    <li>• Problemi con i pagamenti</li>
                    <li>• Bug o malfunzionamenti</li>
                  </ul>
                  <a
                    href="mailto:support@vitaeology.com?subject=[Assistenza Tecnica]"
                    className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline mt-3"
                  >
                    <Mail className="w-4 h-4" />
                    Contatta supporto tecnico
                  </a>
                </div>
              </div>
            </div>

            {/* Partnerships */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Handshake className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Collaborazioni e Partnership</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Sei interessato a collaborare con Vitaeology? Siamo aperti a:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Partnership aziendali</li>
                    <li>• Programmi per team e organizzazioni</li>
                    <li>• Collaborazioni con coach e formatori</li>
                    <li>• Proposte di affiliazione</li>
                  </ul>
                  <a
                    href="mailto:fernando@vitaeology.com?subject=[Partnership]"
                    className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline mt-3"
                  >
                    <Mail className="w-4 h-4" />
                    Contatta per partnership
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Contact */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-semibold mb-2">Contatto Diretto</h3>
              <p className="text-sm text-amber-100 mb-4">
                Per questioni urgenti o comunicazioni dirette con il fondatore:
              </p>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="font-medium">Fernando Marongiu</p>
                <a
                  href="mailto:fernando@vitaeology.com"
                  className="text-sm text-amber-100 hover:text-white flex items-center gap-1 mt-1"
                >
                  <Mail className="w-4 h-4" />
                  fernando@vitaeology.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Vitaeology. Tutti i diritti riservati.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="hover:text-amber-600">Termini di Servizio</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-amber-600">Privacy Policy</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-amber-600">Contatti</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
