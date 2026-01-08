// ============================================================================
// PAGE: /affiliate
// Descrizione: Landing Evangelista - Per chi già parla di Vitaeology
// Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Principio Validante
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
    sito_web: '',
    come_promuovera: '',
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
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Richiesta Inviata</h2>
          <p className="text-slate-600 mb-6">
            Riceverai il tuo link personale entro 24 ore.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[#0A2540] text-white rounded-lg hover:bg-[#0A2540]/90 transition"
          >
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header - identico alla homepage */}
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
          SEZIONE 1: RICONOSCIMENTO
          Principio: Chi già agisce, si riconosce
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0A2540] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#F4B942] text-sm font-medium tracking-wide mb-4">
            PROGRAMMA PARTNER
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-6 leading-tight">
            Parli già di Vitaeology<br />a colleghi e amici?
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            È naturale. Quando qualcosa funziona, lo condividi.
          </p>
          <p className="text-gray-400">
            Il programma partner riconosce quello che fai già.
            Non ti chiede di diventare qualcun altro.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 2: NON SEI UN VENDITORE
          Principio: Chi già agisce, continuerà
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#0A2540] mb-6">
            Non ti stiamo chiedendo di vendere
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Se qualcuno ti chiede consiglio su come crescere professionalmente,
              cosa rispondi?
            </p>
            <p>
              Se un collega si lamenta di non avere tempo per formarsi,
              cosa gli suggerisci?
            </p>
            <p>
              Se il tuo percorso con Vitaeology sta funzionando,
              probabilmente ne parli già.
            </p>
            <p className="font-medium text-[#0A2540]">
              Il programma partner non ti trasforma in promotore.
              Premia quello che fai già naturalmente.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 3: COME FUNZIONA
          Principio: Semplicità
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#0A2540] mb-8">
            Come funziona
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#0A2540] text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-[#0A2540] mb-1">Ricevi un link personale</h3>
                <p className="text-gray-600">
                  Porta alla challenge gratuita di 5 giorni, con il tuo codice di riferimento.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#0A2540] text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-[#0A2540] mb-1">Lo condividi quando ha senso</h3>
                <p className="text-gray-600">
                  In una conversazione, via messaggio, sui social. Quando e come preferisci.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#0A2540] text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-[#0A2540] mb-1">La persona prova gratis</h3>
                <p className="text-gray-600">
                  5 giorni per capire se Vitaeology fa per lei. Nessun pagamento richiesto.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#F4B942] text-[#0A2540] rounded-full flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="font-semibold text-[#0A2540] mb-1">Se si abbona, ricevi una commissione</h3>
                <p className="text-gray-600">
                  Su quel pagamento e su tutti i rinnovi futuri. Finché resta cliente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 4: PERCHÉ LA TUA VOCE CONTA
          Principio: Chi è come me, mi convince + Chi sa, è credibile
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#0A2540] mb-6">
            Perché la tua voce conta
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-700 mb-4">
                Quando qualcuno vede una pubblicità, alza le difese.
              </p>
              <p className="text-gray-700 mb-4">
                Quando un collega gli dice <em>&quot;Questo mi sta aiutando&quot;</em>, ascolta.
              </p>
              <p className="text-gray-700">
                Tu non stai promuovendo qualcosa che non conosci.
                Stai condividendo qualcosa che usi.
                Questa differenza si sente.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-[#0A2540] mb-4">Tu puoi rispondere a:</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B942]">→</span>
                  <span>&quot;Ma funziona davvero?&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B942]">→</span>
                  <span>&quot;Quanto tempo richiede?&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B942]">→</span>
                  <span>&quot;Cosa cambia rispetto a un corso?&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B942]">→</span>
                  <span>&quot;Tu cosa ne stai ricavando?&quot;</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Risposte che vengono dall&apos;esperienza, non da una brochure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 5: IL REQUISITO
          Principio: Chi seleziona, ha valore
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-[#0A2540]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Chi può partecipare
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            Il programma è riservato a chi ha un abbonamento Vitaeology attivo.
          </p>
          <p className="text-gray-400 max-w-xl mx-auto">
            Non è una limitazione. È una garanzia.
            Chi parla di Vitaeology lo sta usando davvero.
            Le sue parole hanno peso perché vengono dall&apos;esperienza.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEZIONE 6: COSA RICEVI
          Principio: Chi riceve, restituisce (ma qui riceve lui)
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#0A2540] mb-8">
            Cosa ricevi
          </h2>

          <div className="space-y-6 mb-10">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">💰</div>
              <div>
                <h3 className="font-semibold text-[#0A2540]">Commissione ricorrente</h3>
                <p className="text-gray-600">
                  Dal 25% al 40% su ogni pagamento, in base al tuo abbonamento.
                  Non solo il primo: tutti i rinnovi, per sempre.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">📈</div>
              <div>
                <h3 className="font-semibold text-[#0A2540]">Bonus automatici</h3>
                <p className="text-gray-600">
                  +3% quando raggiungi 10 clienti attivi, +5% a 30 clienti.
                  Nessuna richiesta, si attiva da solo.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">🏆</div>
              <div>
                <h3 className="font-semibold text-[#0A2540]">Premi milestone</h3>
                <p className="text-gray-600">
                  500 euro al mese con 50 clienti attivi, 1.000 euro al mese con 100.
                  Per chi costruisce una community.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">⏱️</div>
              <div>
                <h3 className="font-semibold text-[#0A2540]">Cookie 90 giorni</h3>
                <p className="text-gray-600">
                  Chi clicca il tuo link oggi e si abbona tra due mesi,
                  la commissione è tua.
                </p>
              </div>
            </div>
          </div>

          {/* Tabella commissioni - collassabile */}
          <details className="bg-gray-50 rounded-xl p-4">
            <summary className="font-semibold text-[#0A2540] cursor-pointer">
              Vedi dettaglio commissioni per livello
            </summary>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Tuo abbonamento</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-600">Base</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-600">+10 cli</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-600">+30 cli</th>
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
          SEZIONE 7: DOMANDE COMUNI
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#0A2540] mb-8">
            Domande comuni
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-semibold text-[#0A2540] cursor-pointer">
                Devo postare sui social tutti i giorni?
              </summary>
              <p className="text-gray-700 mt-3">
                No. Non devi fare nulla che non faresti già. Se vuoi postare, bene.
                Se preferisci parlare solo a persone che conosci, va bene lo stesso.
                Non ci sono obblighi.
              </p>
            </details>
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-semibold text-[#0A2540] cursor-pointer">
                Quando ricevo i soldi?
              </summary>
              <p className="text-gray-700 mt-3">
                Le commissioni maturano dopo 30 giorni (per coprire eventuali rimborsi).
                Quando il saldo raggiunge 50 euro, puoi richiedere il pagamento.
                Arriva entro 5 giorni lavorativi.
              </p>
            </details>
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-semibold text-[#0A2540] cursor-pointer">
                Cosa succede se qualcuno chiede il rimborso?
              </summary>
              <p className="text-gray-700 mt-3">
                Se il rimborso avviene entro 30 giorni, la commissione viene annullata.
                Dopo i 30 giorni, la commissione è tua anche se il cliente disdice.
              </p>
            </details>
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-semibold text-[#0A2540] cursor-pointer">
                Devo avere un sito o una newsletter?
              </summary>
              <p className="text-gray-700 mt-3">
                No. Molti partner condividono il link solo via WhatsApp o in conversazioni dirette.
                Funziona benissimo. Se hai un sito o una newsletter, meglio. Ma non è necessario.
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
          <h2 className="text-2xl font-display font-bold text-[#0A2540] mb-2 text-center">
            Attiva il programma partner
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Se hai un abbonamento Vitaeology attivo, compila il form.
            Riceverai il tuo link personale entro 24 ore.
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F4B942] focus:border-transparent bg-white"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F4B942] focus:border-transparent bg-white"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F4B942] focus:border-transparent bg-white"
                placeholder="mario@esempio.it"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sito Web / Social (opzionale)
              </label>
              <input
                type="text"
                value={formData.sito_web}
                onChange={(e) => setFormData({ ...formData, sito_web: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F4B942] focus:border-transparent bg-white"
                placeholder="linkedin.com/in/tuoprofilo"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Come condividerai il link? (opzionale)
              </label>
              <textarea
                value={formData.come_promuovera}
                onChange={(e) => setFormData({ ...formData, come_promuovera: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F4B942] focus:border-transparent bg-white"
                placeholder="Es: Conversazioni con colleghi, LinkedIn, WhatsApp..."
              />
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  required
                  checked={formData.accetta_termini}
                  onChange={(e) => setFormData({ ...formData, accetta_termini: e.target.checked })}
                  className="mt-1 w-4 h-4 text-[#F4B942] rounded focus:ring-[#F4B942]"
                />
                <span className="text-sm text-slate-600">
                  Accetto i{' '}
                  <Link href="/affiliate/termini" className="text-[#0A2540] underline">
                    termini del programma
                  </Link>{' '}
                  e la{' '}
                  <Link href="/privacy" className="text-[#0A2540] underline">
                    privacy policy
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0A2540] text-white font-semibold rounded-lg hover:bg-[#0A2540]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Invio in corso...' : 'Attiva il programma'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Non hai ancora un abbonamento?{' '}
            <Link href="/challenge/leadership" className="text-[#0A2540] underline">
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
            <Link href="/privacy" className="hover:text-[#0A2540]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#0A2540]">Termini</Link>
            <Link href="/contact" className="hover:text-[#0A2540]">Contatti</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
