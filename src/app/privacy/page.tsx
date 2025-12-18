import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Mail, Database, CreditCard, Cookie, UserCheck, Clock, Globe } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Vitaeology',
  description: 'Informativa sulla Privacy e trattamento dei dati personali di Vitaeology',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '17 Dicembre 2025';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-horizontal.svg"
              alt="Vitaeology"
              width={220}
              height={32}
              className="h-8 w-auto"
            />
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
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">
            Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR)
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Ultimo aggiornamento: {lastUpdated}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">

          {/* Titolare del Trattamento */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">1. Titolare del Trattamento</h2>
            </div>
            <div className="text-gray-700 space-y-3">
              <p>
                Il Titolare del trattamento dei dati personali è:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">Fernando Marongiu</p>
                <p>Vitaeology - Piattaforma di Leadership Development</p>
                <p className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <a href="mailto:fernando@vitaeology.com" className="text-amber-600 hover:underline">
                    fernando@vitaeology.com
                  </a>
                </p>
              </div>
              <p>
                Per qualsiasi richiesta relativa al trattamento dei tuoi dati personali,
                puoi contattarci all&apos;indirizzo email sopra indicato.
              </p>
            </div>
          </section>

          {/* Dati Raccolti */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">2. Dati Personali Raccolti</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>Raccogliamo le seguenti categorie di dati personali:</p>

              <div className="space-y-3">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-medium text-gray-900">Dati di registrazione</h3>
                  <p className="text-sm">Nome, cognome, indirizzo email, password (criptata)</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-medium text-gray-900">Dati dell&apos;Assessment</h3>
                  <p className="text-sm">Risposte alle 240 domande del test di leadership, punteggi per pilastro e caratteristica</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-medium text-gray-900">Dati di interazione con AI Coach</h3>
                  <p className="text-sm">Conversazioni con Fernando AI Coach, feedback sulle risposte</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-medium text-gray-900">Dati di navigazione</h3>
                  <p className="text-sm">Indirizzo IP, tipo di browser, pagine visitate, durata delle sessioni</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-medium text-gray-900">Dati di pagamento</h3>
                  <p className="text-sm">Gestiti direttamente da Stripe; non memorizziamo dati delle carte di credito</p>
                </div>
              </div>
            </div>
          </section>

          {/* Finalità del Trattamento */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">3. Finalità del Trattamento</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>I tuoi dati personali sono trattati per le seguenti finalità:</p>

              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Erogazione del servizio:</strong> Fornitura della piattaforma Vitaeology, accesso all&apos;assessment, agli esercizi e all&apos;AI Coach</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Personalizzazione:</strong> Adattamento dei contenuti e delle raccomandazioni in base ai tuoi risultati</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Miglioramento AI Coach:</strong> Analisi aggregata e anonimizzata delle conversazioni per migliorare la qualità delle risposte</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Comunicazioni di servizio:</strong> Invio di email relative al tuo account, abbonamento e aggiornamenti importanti</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Gestione pagamenti:</strong> Elaborazione degli abbonamenti tramite Stripe</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Base Giuridica */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">4. Base Giuridica del Trattamento</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>Il trattamento dei tuoi dati si basa sulle seguenti basi giuridiche (art. 6 GDPR):</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Esecuzione del contratto</h3>
                  <p className="text-sm">Per l&apos;erogazione dei servizi richiesti con la registrazione e l&apos;abbonamento</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Consenso</h3>
                  <p className="text-sm">Per l&apos;invio di comunicazioni promozionali e l&apos;utilizzo di cookie non essenziali</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Legittimo interesse</h3>
                  <p className="text-sm">Per il miglioramento dei servizi e la sicurezza della piattaforma</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Obbligo legale</h3>
                  <p className="text-sm">Per adempiere a obblighi fiscali e normativi</p>
                </div>
              </div>
            </div>
          </section>

          {/* Conservazione */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">5. Periodo di Conservazione</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>I tuoi dati personali saranno conservati per i seguenti periodi:</p>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Tipo di dato</th>
                    <th className="text-left py-2 font-medium">Periodo di conservazione</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2">Dati account</td>
                    <td className="py-2">Durata abbonamento + 2 anni</td>
                  </tr>
                  <tr>
                    <td className="py-2">Risultati assessment</td>
                    <td className="py-2">Durata abbonamento + 2 anni</td>
                  </tr>
                  <tr>
                    <td className="py-2">Conversazioni AI Coach</td>
                    <td className="py-2">12 mesi dalla creazione</td>
                  </tr>
                  <tr>
                    <td className="py-2">Dati di fatturazione</td>
                    <td className="py-2">10 anni (obbligo fiscale)</td>
                  </tr>
                  <tr>
                    <td className="py-2">Log di navigazione</td>
                    <td className="py-2">6 mesi</td>
                  </tr>
                </tbody>
              </table>

              <p className="text-sm text-gray-600">
                Al termine del periodo di conservazione, i dati saranno cancellati o anonimizzati in modo irreversibile.
              </p>
            </div>
          </section>

          {/* Diritti dell'Utente */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">6. I Tuoi Diritti</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>In conformità al GDPR, hai i seguenti diritti:</p>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-amber-600 font-bold text-lg">1</span>
                  <div>
                    <h3 className="font-medium">Diritto di accesso</h3>
                    <p className="text-sm text-gray-600">Ottenere copia dei tuoi dati</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-amber-600 font-bold text-lg">2</span>
                  <div>
                    <h3 className="font-medium">Diritto di rettifica</h3>
                    <p className="text-sm text-gray-600">Correggere dati inesatti</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-amber-600 font-bold text-lg">3</span>
                  <div>
                    <h3 className="font-medium">Diritto alla cancellazione</h3>
                    <p className="text-sm text-gray-600">Richiedere l&apos;eliminazione dei dati</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-amber-600 font-bold text-lg">4</span>
                  <div>
                    <h3 className="font-medium">Diritto alla portabilità</h3>
                    <p className="text-sm text-gray-600">Ricevere i dati in formato strutturato</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-amber-600 font-bold text-lg">5</span>
                  <div>
                    <h3 className="font-medium">Diritto di opposizione</h3>
                    <p className="text-sm text-gray-600">Opporti a determinati trattamenti</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-amber-600 font-bold text-lg">6</span>
                  <div>
                    <h3 className="font-medium">Diritto alla limitazione</h3>
                    <p className="text-sm text-gray-600">Limitare il trattamento dei dati</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong>Come esercitare i tuoi diritti:</strong> Invia una richiesta a{' '}
                  <a href="mailto:fernando@vitaeology.com" className="text-amber-600 hover:underline">
                    fernando@vitaeology.com
                  </a>
                  . Risponderemo entro 30 giorni.
                </p>
                <p className="text-sm mt-2">
                  <strong>Reclamo:</strong> Hai diritto di presentare reclamo al Garante per la Protezione dei Dati Personali
                  (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">www.garanteprivacy.it</a>).
                </p>
              </div>
            </div>
          </section>

          {/* Cookie Policy */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">7. Cookie Policy</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>Utilizziamo i seguenti tipi di cookie:</p>

              <div className="space-y-3">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">Cookie tecnici (essenziali)</h3>
                  <p className="text-sm">Necessari per il funzionamento del sito: autenticazione, sessione, preferenze. Non richiedono consenso.</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900">Cookie analitici</h3>
                  <p className="text-sm">Per analizzare l&apos;utilizzo del sito e migliorare l&apos;esperienza utente. Richiedono consenso.</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-medium text-gray-900">Cookie di terze parti</h3>
                  <p className="text-sm">Stripe (pagamenti), Supabase (autenticazione). Soggetti alle rispettive privacy policy.</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Puoi gestire le preferenze sui cookie tramite le impostazioni del tuo browser.
              </p>
            </div>
          </section>

          {/* Trasferimento Dati */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">8. Trasferimento Dati e Fornitori</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>I tuoi dati possono essere trattati dai seguenti fornitori:</p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium">Fornitore</th>
                      <th className="text-left py-3 px-4 font-medium">Servizio</th>
                      <th className="text-left py-3 px-4 font-medium">Località</th>
                      <th className="text-left py-3 px-4 font-medium">Garanzie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 px-4 font-medium">Supabase</td>
                      <td className="py-3 px-4">Database e autenticazione</td>
                      <td className="py-3 px-4">UE (Francoforte)</td>
                      <td className="py-3 px-4 text-green-600">GDPR compliant</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Vercel</td>
                      <td className="py-3 px-4">Hosting applicazione</td>
                      <td className="py-3 px-4">USA/Global</td>
                      <td className="py-3 px-4">DPA, SCCs</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Stripe</td>
                      <td className="py-3 px-4">Pagamenti</td>
                      <td className="py-3 px-4">USA/UE</td>
                      <td className="py-3 px-4">PCI-DSS, SCCs</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Anthropic</td>
                      <td className="py-3 px-4">AI Coach (Claude)</td>
                      <td className="py-3 px-4">USA</td>
                      <td className="py-3 px-4">DPA, SCCs</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Resend</td>
                      <td className="py-3 px-4">Invio email</td>
                      <td className="py-3 px-4">USA</td>
                      <td className="py-3 px-4">DPA, SCCs</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-gray-600">
                I trasferimenti verso paesi extra-UE sono effettuati sulla base di Clausole Contrattuali Standard (SCCs)
                approvate dalla Commissione Europea o altre garanzie appropriate.
              </p>
            </div>
          </section>

          {/* Sicurezza */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">9. Sicurezza dei Dati</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>Adottiamo misure tecniche e organizzative appropriate per proteggere i tuoi dati:</p>

              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Crittografia HTTPS per tutte le comunicazioni</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Password criptate con algoritmi sicuri</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Accesso ai dati limitato al personale autorizzato</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Backup regolari e disaster recovery</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Row Level Security (RLS) nel database</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Modifiche */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">10. Modifiche alla Privacy Policy</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                Ci riserviamo il diritto di modificare questa Privacy Policy in qualsiasi momento.
                Le modifiche saranno pubblicate su questa pagina con la data di aggiornamento.
              </p>
              <p>
                Per modifiche sostanziali, ti invieremo una notifica via email.
                Ti consigliamo di consultare periodicamente questa pagina.
              </p>
            </div>
          </section>

          {/* Contatti */}
          <section className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-sm p-6 md:p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Contattaci</h2>
            </div>
            <p className="mb-4">
              Per qualsiasi domanda sulla Privacy Policy o sul trattamento dei tuoi dati personali:
            </p>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-medium">Fernando Marongiu</p>
              <p>Titolare del Trattamento - Vitaeology</p>
              <a
                href="mailto:fernando@vitaeology.com"
                className="inline-flex items-center gap-2 mt-2 text-white hover:text-amber-200 transition-colors"
              >
                <Mail className="w-4 h-4" />
                fernando@vitaeology.com
              </a>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Vitaeology. Tutti i diritti riservati.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="hover:text-amber-600">Termini di Servizio</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-amber-600">Privacy Policy</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
