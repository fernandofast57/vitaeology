// ============================================================================
// PAGE: /affiliate/termini
// Descrizione: Termini e condizioni del programma affiliati
// ============================================================================

import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Termini Programma Partner | Vitaeology',
  description: 'Termini e condizioni del programma partner Vitaeology',
};

export default function AffiliateTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
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
              href="/affiliate"
              className="text-petrol-600 hover:text-petrol-700 font-medium text-sm"
            >
              Torna al Programma Partner
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-8">
          Termini del Programma Partner
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            Ultimo aggiornamento: Gennaio 2026
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">1. Definizioni</h2>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Partner:</strong> Utente registrato al programma affiliati Vitaeology.</li>
              <li><strong>Referral:</strong> Utente che si registra tramite il link del Partner.</li>
              <li><strong>Commissione:</strong> Compenso calcolato sulla base degli acquisti dei Referral.</li>
              <li><strong>Cookie di attribuzione:</strong> Durata 90 giorni dalla prima visita.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">2. Requisiti di partecipazione</h2>
            <p className="text-gray-700 mb-4">Per partecipare al programma Partner devi:</p>
            <ul className="space-y-2 text-gray-700">
              <li>Avere un abbonamento Vitaeology attivo (Leader, Mentor o superiore).</li>
              <li>Accettare questi termini e condizioni.</li>
              <li>Fornire dati di fatturazione validi per il pagamento delle commissioni.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">3. Struttura commissioni</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-petrol-600 mb-3">Commissioni base (per abbonamento Partner)</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Leader (149 euro/anno)</td>
                    <td className="py-2 text-right font-medium">25%</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Mentor (490 euro/anno)</td>
                    <td className="py-2 text-right font-medium">30%</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Mastermind (2.997 euro)</td>
                    <td className="py-2 text-right font-medium">35%</td>
                  </tr>
                  <tr>
                    <td className="py-2">Consulente certificato</td>
                    <td className="py-2 text-right font-medium">40%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-petrol-600 mb-3">Bonus performance</h3>
              <ul className="space-y-2 text-gray-700">
                <li>+3% al raggiungimento di 10 clienti attivi</li>
                <li>+5% (totale) al raggiungimento di 30 clienti attivi</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-petrol-600 mb-3">Bonus milestone</h3>
              <ul className="space-y-2 text-gray-700">
                <li>500 euro/mese con 50 clienti attivi</li>
                <li>1.000 euro/mese con 100 clienti attivi</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">4. Commissioni ricorrenti</h2>
            <p className="text-gray-700 mb-4">
              Le commissioni si applicano su ogni pagamento del Referral, inclusi i rinnovi annuali.
              La commissione rimane attiva finché il Referral mantiene un abbonamento attivo.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">5. Maturazione e pagamento</h2>
            <ul className="space-y-2 text-gray-700">
              <li>Le commissioni maturano dopo 30 giorni dalla transazione.</li>
              <li>Il saldo minimo per richiedere il pagamento è di 50 euro.</li>
              <li>I pagamenti vengono elaborati entro 5 giorni lavorativi dalla richiesta.</li>
              <li>I pagamenti avvengono tramite bonifico bancario o PayPal.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">6. Rimborsi e annullamenti</h2>
            <ul className="space-y-2 text-gray-700">
              <li>Se un Referral richiede rimborso entro 30 giorni, la commissione viene annullata.</li>
              <li>Dopo 30 giorni, la commissione rimane acquisita anche in caso di disdetta.</li>
              <li>Le commissioni già pagate non sono soggette a clawback dopo la maturazione.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">7. Attività vietate</h2>
            <p className="text-gray-700 mb-4">Il Partner NON può:</p>
            <ul className="space-y-2 text-gray-700">
              <li>Utilizzare pubblicità ingannevole o spam.</li>
              <li>Acquistare ads con keyword branded Vitaeology senza autorizzazione.</li>
              <li>Creare contenuti che danneggiano la reputazione del brand.</li>
              <li>Auto-referral o referral tramite account fittizi.</li>
              <li>Promettere risultati non garantiti o incentivi non autorizzati.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">8. Terminazione</h2>
            <p className="text-gray-700 mb-4">
              Vitaeology si riserva il diritto di terminare la partecipazione al programma in caso di:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>Violazione dei presenti termini.</li>
              <li>Attività fraudolente o abusive.</li>
              <li>Mancato mantenimento di un abbonamento attivo.</li>
            </ul>
            <p className="text-gray-700 mt-4">
              In caso di terminazione per violazione, le commissioni non maturate vengono annullate.
              Le commissioni già maturate e approvate restano dovute.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">9. Aspetti fiscali</h2>
            <p className="text-gray-700">
              Il Partner è responsabile della corretta gestione fiscale delle commissioni ricevute.
              Vitaeology fornirà la documentazione necessaria per la dichiarazione dei redditi.
              Per importi superiori a 5.000 euro annui potrebbe essere richiesta fattura
              o documentazione aggiuntiva.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">10. Modifiche ai termini</h2>
            <p className="text-gray-700">
              Vitaeology può modificare questi termini con preavviso di 30 giorni via email.
              La continuazione della partecipazione al programma dopo le modifiche
              costituisce accettazione dei nuovi termini.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-petrol-600 mb-4">11. Contatti</h2>
            <p className="text-gray-700">
              Per domande sul programma Partner:<br />
              Email: <a href="mailto:partner@vitaeology.com" className="text-petrol-600 underline">partner@vitaeology.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/affiliate#registrati"
            className="inline-block px-6 py-3 bg-petrol-600 text-white font-semibold rounded-lg hover:bg-petrol-700 transition"
          >
            Accetto e voglio partecipare
          </Link>
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
