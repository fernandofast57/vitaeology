// ============================================================================
// PAGE: /affiliate
// Descrizione: Landing Partner - Il passaparola nasce dall'esperienza
// Conformità: STILE_VITAEOLOGY.md | Principio Validante | User Agency
// ============================================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AffiliatePage() {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    cognome: '',
    accetta_termini: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore nella registrazione');
      }

      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-2">Richiesta Inviata</h2>
          <p className="text-slate-600 mb-6">
            Riceverai il tuo link personale entro 24 ore.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 transition"
          >
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
                className="btn-primary"
              >
                Inizia Gratis
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 1: HERO
          Messaggio centrale: Il passaparola nasce dall'esperienza
          Gradient: blu petrolio + tocco dei 3 percorsi (oro, verde, viola)
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative text-white"
        style={{
          background: 'linear-gradient(120deg, #0A2540 0%, #0A2540 70%, rgba(212, 175, 55, 0.4) 80%, rgba(16, 185, 129, 0.4) 90%, rgba(139, 92, 246, 0.4) 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-gold-500 text-sm font-medium tracking-wide mb-4">
              PROGRAMMA PARTNER
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
              Il passaparola nasce dall&apos;esperienza.
            </h1>
            <p className="mt-6 text-xl text-gray-300 leading-relaxed">
              Se stai facendo il percorso Vitaeology e ne parli con altri,
              il programma partner riconosce questo.
            </p>
          </div>
        </div>
        {/* Taglio diagonale come homepage */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 2: IL PRINCIPIO
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-6">
            Il principio è semplice
          </h2>
          <div className="space-y-4 text-gray-700 text-lg">
            <p>
              Chi ha provato qualcosa di utile, lo racconta.
            </p>
            <p>
              Non servono tecniche di vendita. Non serve convincere nessuno.
              Serve aver fatto l&apos;esperienza.
            </p>
            <p className="font-medium text-petrol-600">
              Tu la stai facendo.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 3: COME FUNZIONA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-8">
            Come funziona
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-petrol-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-petrol-600 text-lg mb-1">Ricevi un link personale</h3>
                <p className="text-gray-600">
                  Porta alla challenge gratuita di 5 giorni.
                  Chi arriva da quel link è collegato a te.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-petrol-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-petrol-600 text-lg mb-1">Lo condividi quando ha senso</h3>
                <p className="text-gray-600">
                  In una conversazione, via messaggio, come preferisci.
                  Tu decidi quando e con chi.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-petrol-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-petrol-600 text-lg mb-1">La persona prova il percorso</h3>
                <p className="text-gray-600">
                  5 giorni per capire se fa per lei.
                  Nessun pagamento richiesto.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gold-500 text-petrol-600 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-petrol-600 text-lg mb-1">Se si abbona, ricevi una commissione</h3>
                <p className="text-gray-600">
                  Su quel pagamento e su tutti i rinnovi.
                  Finché resta nel percorso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 4: PERCHÉ FUNZIONA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-6">
            Perché funziona
          </h2>
          <div className="space-y-4 text-gray-700 text-lg">
            <p>
              C&apos;è differenza tra chi promuove qualcosa e chi lo racconta.
            </p>
            <p>
              Chi promuove parla da fuori.
              Chi racconta parla da dentro.
            </p>
            <p>
              Tu conosci Vitaeology dall&apos;interno.
              Sai quanto tempo richiede, cosa dà, dove fa fatica.
            </p>
            <p>
              Quando qualcuno ti chiede &quot;Ma funziona?&quot;,
              rispondi da chi l&apos;ha provato.
            </p>
            <p className="font-medium text-petrol-600">
              Questa differenza si sente.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 5: CHI PUÒ PARTECIPARE
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-petrol-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
            Per chi ha l&apos;esperienza
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            Il programma è per chi ha un abbonamento Vitaeology attivo.
          </p>
          <p className="text-gray-400 max-w-xl mx-auto">
            Perché il passaparola nasce dall&apos;esperienza.
            Chi non ha fatto il percorso, non può raccontarlo.
            Chi lo sta facendo, sì.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 6: COSA RICEVI
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-8">
            Cosa ricevi
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-petrol-600 text-lg mb-2">Commissione ricorrente</h3>
              <p className="text-gray-600">
                Dal 25% al 40% su ogni pagamento.
                Non solo il primo: tutti i rinnovi, ogni anno.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-petrol-600 text-lg mb-2">Bonus automatici</h3>
              <p className="text-gray-600">
                +3% quando raggiungi 10 clienti attivi.
                +5% a 30 clienti. Si attivano da soli.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-petrol-600 text-lg mb-2">Premi per chi costruisce</h3>
              <p className="text-gray-600">
                500 euro al mese con 50 clienti attivi.
                1.000 euro al mese con 100.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-petrol-600 text-lg mb-2">90 giorni di attribuzione</h3>
              <p className="text-gray-600">
                Chi clicca il tuo link oggi e si abbona tra due mesi,
                la commissione è tua.
              </p>
            </div>
          </div>

          {/* Accordion commissioni */}
          <details className="bg-gray-50 rounded-xl p-4">
            <summary className="font-semibold text-petrol-600 cursor-pointer">
              Dettaglio commissioni
            </summary>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Tuo abbonamento</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-600">Base</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-600">+10 clienti</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-600">+30 clienti</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">Leader (149 euro/anno)</td>
                    <td className="text-center py-2 px-2">25%</td>
                    <td className="text-center py-2 px-2">28%</td>
                    <td className="text-center py-2 px-2">30%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">Mentor (490 euro/anno)</td>
                    <td className="text-center py-2 px-2">30%</td>
                    <td className="text-center py-2 px-2">33%</td>
                    <td className="text-center py-2 px-2">35%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">Mastermind (2.997 euro)</td>
                    <td className="text-center py-2 px-2">35%</td>
                    <td className="text-center py-2 px-2">38%</td>
                    <td className="text-center py-2 px-2">40%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Consulente certificato</td>
                    <td className="text-center py-2 px-2">40%</td>
                    <td className="text-center py-2 px-2">43%</td>
                    <td className="text-center py-2 px-2">45%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 7: DOMANDE
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-8">
            Domande pratiche
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-semibold text-petrol-600 cursor-pointer">
                Devo promuovere attivamente?
              </summary>
              <p className="text-gray-700 mt-3">
                No. Parli di Vitaeology quando ha senso.
                Se preferisci condividere solo con persone che conosci,
                va bene così. Non ci sono obiettivi.
              </p>
            </details>
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-semibold text-petrol-600 cursor-pointer">
                Quando ricevo il pagamento?
              </summary>
              <p className="text-gray-700 mt-3">
                Le commissioni maturano dopo 30 giorni.
                Quando il saldo raggiunge 50 euro, puoi chiedere il pagamento.
                Arriva entro 5 giorni lavorativi.
              </p>
            </details>
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-semibold text-petrol-600 cursor-pointer">
                Se qualcuno chiede rimborso?
              </summary>
              <p className="text-gray-700 mt-3">
                Entro 30 giorni, la commissione viene annullata.
                Dopo, resta tua anche se il cliente disdice.
              </p>
            </details>
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-semibold text-petrol-600 cursor-pointer">
                Serve un sito o una newsletter?
              </summary>
              <p className="text-gray-700 mt-3">
                No. Molti partner condividono il link solo in conversazioni dirette.
                Se hai altri canali, puoi usarli. Non è necessario.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 8: FORM
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-white" id="registrati">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-2 text-center">
            Attiva il programma
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Se hai un abbonamento attivo, compila il form.
            Riceverai il tuo link entro 24 ore.
          </p>

          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  placeholder="Mario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cognome
                </label>
                <input
                  type="text"
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  placeholder="Rossi"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                placeholder="mario@esempio.it"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  required
                  checked={formData.accetta_termini}
                  onChange={(e) => setFormData({ ...formData, accetta_termini: e.target.checked })}
                  className="mt-1 w-4 h-4 text-gold-500 rounded focus:ring-gold-500"
                />
                <span className="text-sm text-slate-600">
                  Accetto i{' '}
                  <Link href="/affiliate/termini" className="text-petrol-600 underline">
                    termini del programma
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-petrol-600 text-white font-semibold rounded-lg hover:bg-petrol-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Invio in corso...' : 'Richiedi accesso'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Non hai ancora un abbonamento?{' '}
            <Link href="/challenge/leadership" className="text-petrol-600 underline">
              Inizia dalla challenge gratuita
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-100">
        <div className="max-w-6xl mx-auto text-center text-slate-600 text-sm">
          <p>© 2026 Vitaeology. Tutti i diritti riservati.</p>
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
