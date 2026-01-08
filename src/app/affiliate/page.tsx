// ============================================================================
// PAGE: /affiliate
// Descrizione: Landing completa per reclutamento affiliati
// Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Principio Validante
// ============================================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

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
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Registrazione Completata</h2>
          <p className="text-slate-600 mb-6">
            Riceverai una email di conferma quando il tuo account sarà attivato.
            Di solito entro 24-48 ore.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#0A2540] text-white rounded-lg hover:bg-[#0A2540]/90 transition"
          >
            Torna alla Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-[#0A2540] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Condividi ciò che usi.<br />
            Guadagna aiutando altri.
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Sei già utente Vitaeology? Aiuta altri professionisti a scoprire
            il percorso che stai facendo. Guadagni commissioni ricorrenti
            su ogni persona che porti.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white/10 px-4 py-2 rounded-full">
              Fino al 45% ricorrente
            </span>
            <span className="bg-white/10 px-4 py-2 rounded-full">
              Cookie 90 giorni
            </span>
            <span className="bg-white/10 px-4 py-2 rounded-full">
              Bonus fino a 1.000 euro/mese
            </span>
          </div>
        </div>
      </section>

      {/* COS'È VITAEOLOGY */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0A2540] mb-6">
            Cosa promuovi
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-700 mb-4">
                Vitaeology è un percorso di sviluppo della leadership basato su
                <strong> 24 caratteristiche concrete</strong>, non teoria astratta.
              </p>
              <p className="text-gray-700 mb-4">
                Ogni settimana l&apos;utente riceve un esercizio pratico di 15-20 minuti.
                Un AI Coach personale lo guida nel percorso. Un radar visivo mostra
                i progressi nel tempo.
              </p>
              <p className="text-gray-700">
                Non è un corso da guardare. È un percorso da fare.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-[#0A2540] mb-4">Il percorso</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#F4B942] font-bold">1.</span>
                  <span>Challenge gratuita 5 giorni (assaggio)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F4B942] font-bold">2.</span>
                  <span>Assessment 240 domande (mappa competenze)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F4B942] font-bold">3.</span>
                  <span>52 esercizi settimanali (un anno di pratica)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F4B942] font-bold">4.</span>
                  <span>AI Coach disponibile sempre (supporto continuo)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* A CHI SERVE */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0A2540] mb-6">
            A chi puoi parlarne
          </h2>
          <p className="text-gray-700 mb-8">
            Vitaeology non è per tutti. È per professionisti che:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-4">👔</div>
              <h3 className="font-semibold text-[#0A2540] mb-2">
                Hanno responsabilità
              </h3>
              <p className="text-gray-600 text-sm">
                Gestiscono team, progetti, decisioni. Imprenditori, manager,
                professionisti con 5+ anni di esperienza.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="font-semibold text-[#0A2540] mb-2">
                Vogliono crescere
              </h3>
              <p className="text-gray-600 text-sm">
                Sentono di poter migliorare come leader. Non cercano
                certificati, cercano risultati concreti.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-4">⏱️</div>
              <h3 className="font-semibold text-[#0A2540] mb-2">
                Hanno poco tempo
              </h3>
              <p className="text-gray-600 text-sm">
                Non possono seguire corsi di 40 ore. Preferiscono
                15-20 minuti a settimana, ma costanti.
              </p>
            </div>
          </div>
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>In pratica:</strong> pensa ai tuoi colleghi, ex colleghi,
              clienti, fornitori. Chi ha un ruolo di responsabilità e potrebbe
              beneficiare di un percorso strutturato sulla leadership?
            </p>
          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0A2540] mb-6">
            Come funziona
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-[#0A2540] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold text-[#0A2540] mb-2">Condividi</h3>
              <p className="text-gray-600 text-sm">
                Mandi il tuo link a qualcuno che potrebbe beneficiarne
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-[#0A2540] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold text-[#0A2540] mb-2">Challenge</h3>
              <p className="text-gray-600 text-sm">
                La persona fa la challenge gratuita di 5 giorni
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-[#0A2540] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold text-[#0A2540] mb-2">Abbonamento</h3>
              <p className="text-gray-600 text-sm">
                Se decide di continuare, si abbona (Leader o Mentor)
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-[#F4B942] text-[#0A2540] rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                4
              </div>
              <h3 className="font-semibold text-[#0A2540] mb-2">Commissione</h3>
              <p className="text-gray-600 text-sm">
                Tu ricevi commissione su ogni pagamento, inclusi i rinnovi
              </p>
            </div>
          </div>
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-[#0A2540] mb-3">Nessuna pressione</h3>
            <p className="text-gray-700">
              Non devi convincere nessuno. Condividi il link alla challenge gratuita.
              La persona prova per 5 giorni senza pagare. Se il percorso fa per lei,
              si abbona. Se non fa per lei, non succede nulla.
            </p>
            <p className="text-gray-700 mt-3">
              Il tuo cookie dura <strong>90 giorni</strong>. Se clicca oggi e si abbona
              tra due mesi, la commissione è comunque tua.
            </p>
          </div>
        </div>
      </section>

      {/* REQUISITO */}
      <section className="py-16 px-4 bg-[#0A2540]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-6">
            Un requisito importante
          </h2>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            Per diventare affiliato Vitaeology devi essere un utente con abbonamento attivo.
          </p>
          <div className="bg-white/10 rounded-xl p-6 max-w-2xl mx-auto text-left">
            <p className="text-gray-300 mb-4">
              <strong className="text-white">Perché?</strong> Perché chi promuove Vitaeology
              deve conoscerlo davvero. Non vogliamo affiliati che parlano di qualcosa
              che non hanno mai provato.
            </p>
            <p className="text-gray-300">
              Quando qualcuno ti chiede &quot;Ma funziona?&quot;, tu puoi rispondere dalla tua esperienza.
              Questo fa la differenza tra una raccomandazione autentica e una pubblicità.
            </p>
          </div>
        </div>
      </section>

      {/* COMMISSIONI */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0A2540] mb-6">
            Quanto guadagni
          </h2>

          {/* Tabella Base */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-4">Commissione base (dipende dal tuo abbonamento)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tuo abbonamento</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Commissione</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Esempio su Leader 149 euro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Leader (149 euro/anno)</td>
                    <td className="text-center py-3 px-4 font-semibold">25%</td>
                    <td className="text-right py-3 px-4 text-gray-600">37,25 euro</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Mentor (490 euro/anno)</td>
                    <td className="text-center py-3 px-4 font-semibold">30%</td>
                    <td className="text-right py-3 px-4 text-gray-600">44,70 euro</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Mastermind (2.997 euro)</td>
                    <td className="text-center py-3 px-4 font-semibold">35%</td>
                    <td className="text-right py-3 px-4 text-gray-600">52,15 euro</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Consulente certificato</td>
                    <td className="text-center py-3 px-4 font-semibold">40%</td>
                    <td className="text-right py-3 px-4 text-gray-600">59,60 euro</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bonus Performance */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-4">Bonus performance (automatici)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">10+ clienti attivi</span>
                  <span className="font-bold text-green-700">+3%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Es: Leader 25% → 28%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">30+ clienti attivi</span>
                  <span className="font-bold text-green-700">+5%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Es: Leader 25% → 30%</p>
              </div>
            </div>
          </div>

          {/* Bonus Milestone */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-4">Bonus milestone (ricorrenti)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#F4B942]/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">50+ clienti attivi</span>
                  <span className="font-bold text-[#0A2540]">500 euro/mese</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">6.000 euro/anno extra</p>
              </div>
              <div className="bg-[#F4B942]/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">100+ clienti attivi</span>
                  <span className="font-bold text-[#0A2540]">1.000 euro/mese</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">12.000 euro/anno extra</p>
              </div>
            </div>
          </div>

          {/* Esempio Concreto */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-[#0A2540] mb-4">Esempio concreto</h3>
            <p className="text-gray-700 mb-4">
              <strong>Marco</strong> è utente Mentor (490 euro/anno).
              Diventa affiliato e nel primo anno porta 15 clienti Leader.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Commissione base</p>
                <p className="text-xl font-bold text-[#0A2540]">30%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bonus (10+ clienti)</p>
                <p className="text-xl font-bold text-green-600">+3%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Totale</p>
                <p className="text-xl font-bold text-[#F4B942]">33%</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700">
                <strong>Guadagno anno 1:</strong> 15 x 149 euro x 33% = <strong>737 euro</strong><br />
                <strong>Costo Mentor:</strong> 490 euro<br />
                <strong>Net:</strong> +247 euro + il valore del percorso che sta facendo
              </p>
              <p className="text-gray-600 text-sm mt-2">
                E i rinnovi degli anni successivi generano commissioni senza nuovo sforzo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="py-16 px-4 bg-gray-50" id="registrati">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0A2540] mb-2 text-center">
            Diventa Partner
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Se hai già un abbonamento Vitaeology attivo, compila il form.
            Riceverai accesso alla dashboard affiliati.
          </p>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F4B942] focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F4B942] focus:border-transparent"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F4B942] focus:border-transparent"
                placeholder="mario@esempio.it"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sito Web / Social (opzionale)
              </label>
              <input
                type="url"
                value={formData.sito_web}
                onChange={(e) => setFormData({ ...formData, sito_web: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F4B942] focus:border-transparent"
                placeholder="https://tuosito.it"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Come promuoverai Vitaeology?
              </label>
              <textarea
                value={formData.come_promuovera}
                onChange={(e) => setFormData({ ...formData, come_promuovera: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F4B942] focus:border-transparent"
                placeholder="Es: Passaparola con colleghi, post LinkedIn, newsletter..."
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
                    termini del programma affiliati
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
              {loading ? 'Invio in corso...' : 'Richiedi Accesso Partner'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-4">
            Non hai ancora un abbonamento?{' '}
            <Link href="/challenge/leadership" className="text-[#0A2540] underline">
              Inizia dalla challenge gratuita
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0A2540] mb-8 text-center">
            Domande frequenti
          </h2>
          <div className="space-y-4">
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-[#0A2540] cursor-pointer">
                Devo fare il venditore?
              </summary>
              <p className="text-gray-700 mt-3">
                No. Condividi il link quando ha senso farlo. Se qualcuno ti parla
                di voler crescere professionalmente, puoi dirgli &quot;Sto facendo un
                percorso interessante, ti mando il link alla prova gratuita&quot;.
                Nessuna pressione, nessuno script.
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-[#0A2540] cursor-pointer">
                Quando ricevo i pagamenti?
              </summary>
              <p className="text-gray-700 mt-3">
                Le commissioni maturano dopo 30 giorni (periodo di rimborso).
                Quando il tuo saldo raggiunge 50 euro, puoi richiedere il payout.
                I pagamenti vengono elaborati entro 5 giorni lavorativi.
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-[#0A2540] cursor-pointer">
                Cosa succede se qualcuno disdice?
              </summary>
              <p className="text-gray-700 mt-3">
                Se un cliente disdice entro 30 giorni, la commissione viene annullata.
                Dopo i 30 giorni, la commissione è tua anche se il cliente disdice successivamente.
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-[#0A2540] cursor-pointer">
                Posso promuovere sui social?
              </summary>
              <p className="text-gray-700 mt-3">
                Sì, ma con autenticità. Racconta la tua esperienza, non fare spam.
                Un post che dice &quot;Sto facendo questo percorso e mi sta aiutando su X&quot;
                funziona meglio di &quot;Compra questo corso fantastico!!!&quot;.
              </p>
            </details>
          </div>
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
