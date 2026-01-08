// ============================================================================
// PAGE: /affiliate
// Descrizione: Landing pubblica per reclutamento affiliati
// Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Principio Validante
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Colori Vitaeology
const colors = {
  bluPetrolio: '#0A2540',
  oro: '#F4B942',
  bianco: '#FFFFFF',
  grigio: '#6B7280',
};

export default function AffiliateLandingPage() {
  const router = useRouter();
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
    } catch (err: any) {
      setError(err.message);
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
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Registrazione Completata!</h2>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#0A2540]">
            Vitaeology
          </Link>
          <Link href="/login" className="text-slate-600 hover:text-[#0A2540]">
            Accedi
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1 bg-[#F4B942]/20 text-[#0A2540] rounded-full text-sm font-medium mb-4">
            Programma Partner
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A2540] mb-6">
            Guadagna Condividendo la Leadership Autentica
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Diventa partner Vitaeology e guadagna commissioni ricorrenti fino al 45%
            + bonus mensili fino a 1.000 euro aiutando imprenditori a sviluppare la loro leadership.
          </p>
        </div>
      </section>

      {/* Vantaggi */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-[#F4B942]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#F4B942]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Fino al 45% + Bonus</h3>
              <p className="text-slate-600">
                Commissioni ricorrenti su ogni rinnovo. Base dal 25% (Leader)
                al 40% (Consulente) + bonus fino a +5% e premi mensili fino a 1.000 euro.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-[#F4B942]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#F4B942]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Cookie 90 Giorni</h3>
              <p className="text-slate-600">
                Tre mesi di attribuzione. Se qualcuno clicca il tuo link oggi
                e acquista tra 89 giorni, la commissione è tua.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-[#F4B942]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#F4B942]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Crescita Automatica</h3>
              <p className="text-slate-600">
                Bonus performance automatici: +3% a 10 clienti, +5% a 30 clienti.
                Bonus milestone: 500 euro/mese a 50 clienti, 1000 euro/mese a 100 clienti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabella Commissioni */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#0A2540] mb-8">
            Struttura Commissioni
          </h2>

          {/* Commissione Base per Piano */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Commissione Base (per piano affiliato)</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border text-center">
                <p className="text-sm text-slate-500 mb-1">Leader</p>
                <p className="text-3xl font-bold text-[#0A2540]">25%</p>
                <p className="text-xs text-slate-400">149 euro/anno</p>
              </div>
              <div className="bg-[#F4B942]/10 p-4 rounded-xl border border-[#F4B942]/30 text-center">
                <p className="text-sm text-slate-500 mb-1">Mentor</p>
                <p className="text-3xl font-bold text-[#0A2540]">30%</p>
                <p className="text-xs text-slate-400">490 euro/anno</p>
              </div>
              <div className="bg-[#0A2540]/5 p-4 rounded-xl border text-center">
                <p className="text-sm text-slate-500 mb-1">Mastermind</p>
                <p className="text-3xl font-bold text-[#0A2540]">35%</p>
                <p className="text-xs text-slate-400">2.997 euro</p>
              </div>
              <div className="bg-[#0A2540] p-4 rounded-xl text-center">
                <p className="text-sm text-slate-300 mb-1">Consulente</p>
                <p className="text-3xl font-bold text-[#F4B942]">40%</p>
                <p className="text-xs text-slate-400">Certificato</p>
              </div>
            </div>
          </div>

          {/* Bonus Performance */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Bonus Performance (automatici)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="p-3 text-left rounded-tl-lg">Clienti Attivi</th>
                    <th className="p-3 text-center">Bonus</th>
                    <th className="p-3 text-center">Esempio (Leader)</th>
                    <th className="p-3 text-right rounded-tr-lg">Esempio (Consulente)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 font-medium">10+ clienti</td>
                    <td className="p-3 text-center text-green-600 font-bold">+3%</td>
                    <td className="p-3 text-center text-slate-600">25% + 3% = 28%</td>
                    <td className="p-3 text-right text-slate-600">40% + 3% = 43%</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-3 font-medium">30+ clienti</td>
                    <td className="p-3 text-center text-green-600 font-bold">+5%</td>
                    <td className="p-3 text-center text-slate-600">25% + 5% = 30%</td>
                    <td className="p-3 text-right text-slate-600">40% + 5% = 45%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bonus Milestone */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Bonus Milestone Mensili</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-600 text-white">
                    <th className="p-3 text-left rounded-tl-lg">Traguardo</th>
                    <th className="p-3 text-center">Bonus Mensile</th>
                    <th className="p-3 text-center">Bonus Annuale</th>
                    <th className="p-3 text-right rounded-tr-lg">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 font-medium">50+ clienti attivi</td>
                    <td className="p-3 text-center text-purple-600 font-bold">500 euro/mese</td>
                    <td className="p-3 text-center text-slate-600">6.000 euro/anno</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Ricorrente</span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-3 font-medium">100+ clienti attivi</td>
                    <td className="p-3 text-center text-purple-600 font-bold">1.000 euro/mese</td>
                    <td className="p-3 text-center text-slate-600">12.000 euro/anno</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Ricorrente</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Esempio Guadagno */}
          <div className="bg-[#0A2540] text-white p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-center">Esempio: Consulente con 100 Clienti Mentor</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-slate-300 text-sm">Commissione Base</p>
                <p className="text-2xl font-bold text-[#F4B942]">40%</p>
              </div>
              <div>
                <p className="text-slate-300 text-sm">Bonus Performance</p>
                <p className="text-2xl font-bold text-green-400">+5%</p>
              </div>
              <div>
                <p className="text-slate-300 text-sm">Bonus Milestone</p>
                <p className="text-2xl font-bold text-purple-400">1.000 euro/mese</p>
              </div>
              <div>
                <p className="text-slate-300 text-sm">Guadagno Annuale</p>
                <p className="text-2xl font-bold text-white">34.050 euro</p>
                <p className="text-xs text-slate-400">(45% x 490 euro x 100) + 12.000 euro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Registrazione */}
      <section className="py-16 px-4 bg-[#0A2540]" id="registrati">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            Diventa Partner Vitaeology
          </h2>
          <p className="text-slate-300 text-center mb-8">
            Compila il form e riceverai accesso alla dashboard affiliati
          </p>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl">
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
                placeholder="Es: Blog di sviluppo personale, canale YouTube, newsletter..."
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
              className="w-full py-3 bg-[#F4B942] text-[#0A2540] font-semibold rounded-lg hover:bg-[#F4B942]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Invio in corso...' : 'Richiedi Accesso Partner'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-100">
        <div className="max-w-6xl mx-auto text-center text-slate-600 text-sm">
          <p>© 2026 Vitaeology. Tutti i diritti riservati.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-[#0A2540]">Privacy</Link>
            <Link href="/termini" className="hover:text-[#0A2540]">Termini</Link>
            <Link href="/contatti" className="hover:text-[#0A2540]">Contatti</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
