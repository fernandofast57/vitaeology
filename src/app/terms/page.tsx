import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText, Mail, User, CreditCard, Shield, Scale, BookOpen, AlertTriangle, Clock, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Termini di Servizio | Vitaeology',
  description: 'Termini e Condizioni di utilizzo della piattaforma Vitaeology',
};

export default function TermsOfServicePage() {
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
            <FileText className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Termini di Servizio
          </h1>
          <p className="text-gray-600">
            Condizioni generali di utilizzo della piattaforma Vitaeology
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Ultimo aggiornamento: {lastUpdated}
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Accettazione dei Termini</h3>
              <p className="text-sm text-gray-700">
                Utilizzando Vitaeology, accetti integralmente questi Termini di Servizio.
                Se non accetti una qualsiasi parte di questi termini, ti preghiamo di non utilizzare la piattaforma.
                La registrazione e l&apos;utilizzo del servizio costituiscono accettazione vincolante.
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">

          {/* 1. Descrizione del Servizio */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">1</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Descrizione del Servizio</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                <strong>Vitaeology</strong> è una piattaforma SaaS (Software as a Service) per lo sviluppo della leadership
                destinata a imprenditori e professionisti.
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Il servizio include:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span><strong>Assessment di Leadership:</strong> Test di 240 domande basato su 24 caratteristiche e 4 pilastri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span><strong>AI Coach Fernando:</strong> Assistente virtuale per coaching personalizzato</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span><strong>Esercizi Pratici:</strong> Oltre 50 esercizi per sviluppare le competenze di leadership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span><strong>Dashboard Progressi:</strong> Monitoraggio della crescita nel tempo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span><strong>Contenuti Esclusivi:</strong> Basati sul libro &quot;Rivoluzione Aurea&quot; di Fernando Marongiu</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                Vitaeology è un servizio di sviluppo personale e <strong>non sostituisce</strong> consulenze
                professionali mediche, psicologiche o legali.
              </p>
            </div>
          </section>

          {/* 2. Requisiti Utente */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">2</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Requisiti per l&apos;Utilizzo</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>Per utilizzare Vitaeology devi:</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <User className="w-5 h-5 text-amber-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Maggiore età</h3>
                  <p className="text-sm text-gray-600">Avere almeno 18 anni o la maggiore età nel tuo paese di residenza</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <FileText className="w-5 h-5 text-amber-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Dati veritieri</h3>
                  <p className="text-sm text-gray-600">Fornire informazioni accurate e complete durante la registrazione</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <Scale className="w-5 h-5 text-amber-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Capacità giuridica</h3>
                  <p className="text-sm text-gray-600">Avere la capacità legale di stipulare contratti vincolanti</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <Shield className="w-5 h-5 text-amber-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Uso lecito</h3>
                  <p className="text-sm text-gray-600">Utilizzare il servizio solo per scopi leciti e personali</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Account e Sicurezza */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">3</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Account e Sicurezza</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-medium text-gray-900">Creazione Account</h3>
                  <p className="text-sm">Per accedere ai servizi devi creare un account con email valida e password sicura.</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-medium text-gray-900">Responsabilità delle Credenziali</h3>
                  <p className="text-sm">Sei responsabile della riservatezza delle tue credenziali e di tutte le attività effettuate con il tuo account.</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-medium text-gray-900">Notifica Violazioni</h3>
                  <p className="text-sm">Devi notificarci immediatamente qualsiasi uso non autorizzato del tuo account scrivendo a fernando@vitaeology.com.</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-medium text-gray-900">Un Account per Persona</h3>
                  <p className="text-sm">Ogni persona fisica può avere un solo account. La condivisione delle credenziali è vietata.</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-red-800">
                  <strong>Attenzione:</strong> Ci riserviamo il diritto di sospendere o terminare account che violano
                  questi termini, senza preavviso e senza rimborso.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Piani e Abbonamenti */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">4</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Piani di Abbonamento e Pagamenti</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>Vitaeology offre diversi piani di abbonamento:</p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium">Piano</th>
                      <th className="text-left py-3 px-4 font-medium">Caratteristiche</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 px-4 font-medium">Explorer (Gratuito)</td>
                      <td className="py-3 px-4">Accesso base, assessment limitato, AI Coach limitato</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Leader</td>
                      <td className="py-3 px-4">Assessment completo, AI Coach esteso, esercizi base</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Mentor</td>
                      <td className="py-3 px-4">Tutte le funzionalità Leader + esercizi avanzati + contenuti premium</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Mastermind</td>
                      <td className="py-3 px-4">Accesso illimitato, AI Coach illimitato, supporto prioritario</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Partner Elite</td>
                      <td className="py-3 px-4">Tutto incluso + consulenze dirette + accesso anticipato</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <h3 className="font-medium text-gray-900">Pagamenti</h3>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• I pagamenti sono gestiti in modo sicuro da <strong>Stripe</strong></li>
                  <li>• Accettiamo carte di credito/debito principali</li>
                  <li>• Gli abbonamenti si rinnovano automaticamente alla scadenza</li>
                  <li>• I prezzi sono in Euro e includono IVA dove applicabile</li>
                  <li>• Le fatture sono disponibili nell&apos;area account</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Periodo di Prova */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">5</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Periodo di Prova Gratuito</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                Alcuni piani potrebbero includere un periodo di prova gratuito.
              </p>

              <div className="bg-amber-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Condizioni del periodo di prova:</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>La durata del periodo di prova è specificata al momento dell&apos;attivazione</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>È richiesta una carta di credito/debito valida per attivare la prova</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Puoi cancellare in qualsiasi momento prima della fine della prova senza addebiti</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Al termine della prova, l&apos;abbonamento si attiverà automaticamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Un solo periodo di prova per utente</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Cancellazione e Rimborsi */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">6</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Cancellazione e Rimborsi</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">Cancellazione</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Puoi cancellare in qualsiasi momento</li>
                    <li>• Accedi a Impostazioni → Abbonamento</li>
                    <li>• L&apos;accesso rimane attivo fino alla scadenza</li>
                    <li>• Non ci sono penali di cancellazione</li>
                  </ul>
                </div>
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Rimborsi</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 14 giorni di diritto di recesso dalla sottoscrizione</li>
                    <li>• Rimborso completo se non hai utilizzato il servizio</li>
                    <li>• Rimborso proporzionale se hai utilizzato meno del 20%</li>
                    <li>• Richieste a fernando@vitaeology.com</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                <strong>Nota:</strong> I rimborsi vengono elaborati entro 10 giorni lavorativi sulla stessa
                modalità di pagamento utilizzata per l&apos;acquisto.
              </p>
            </div>
          </section>

          {/* 7. Proprietà Intellettuale */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">7</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Proprietà Intellettuale</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <h3 className="font-medium text-gray-900">Contenuti protetti</h3>
                </div>
                <p className="text-sm mb-3">
                  Tutti i contenuti presenti su Vitaeology sono di proprietà esclusiva di <strong>Fernando Marongiu</strong>
                  e sono protetti dalle leggi sul diritto d&apos;autore:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Testi, articoli e contenuti del libro &quot;Rivoluzione Aurea&quot;</li>
                  <li>• Metodologia dei 4 Pilastri e 24 Caratteristiche</li>
                  <li>• Assessment e domande</li>
                  <li>• Esercizi e percorsi formativi</li>
                  <li>• Prompt e personalità dell&apos;AI Coach Fernando</li>
                  <li>• Logo, grafica e design del sito</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Concesso:</strong> Uso personale dei contenuti per il tuo sviluppo</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span><strong>Vietato:</strong> Copia, distribuzione, vendita o uso commerciale senza autorizzazione scritta</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span><strong>Vietato:</strong> Scraping, reverse engineering o estrazione automatica dei contenuti</span>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Limitazione di Responsabilità */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">8</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Limitazione di Responsabilità</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mb-2" />
                <p className="text-sm">
                  Vitaeology è fornito &quot;così com&apos;è&quot;. Pur impegnandoci a fornire un servizio di qualità,
                  non possiamo garantire risultati specifici nell&apos;ambito dello sviluppo personale.
                </p>
              </div>

              <div className="space-y-3">
                <p><strong>Non siamo responsabili per:</strong></p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Interruzioni temporanee del servizio per manutenzione o cause di forza maggiore</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Decisioni prese sulla base dei risultati dell&apos;assessment o dei consigli dell&apos;AI Coach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Danni indiretti, incidentali o consequenziali</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Perdita di dati dovuta a fattori esterni al nostro controllo</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm">
                <strong>Responsabilità massima:</strong> In ogni caso, la nostra responsabilità totale non potrà
                eccedere l&apos;importo pagato dall&apos;utente nei 12 mesi precedenti l&apos;evento.
              </p>
            </div>
          </section>

          {/* 9. Uso Accettabile */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">9</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Uso Accettabile</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>Utilizzando Vitaeology, ti impegni a <strong>NON</strong>:</p>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                  <span className="text-red-500">✗</span>
                  <span className="text-sm">Violare leggi o regolamenti applicabili</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                  <span className="text-red-500">✗</span>
                  <span className="text-sm">Condividere le tue credenziali con altri</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                  <span className="text-red-500">✗</span>
                  <span className="text-sm">Tentare di accedere ad account di altri utenti</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                  <span className="text-red-500">✗</span>
                  <span className="text-sm">Interferire con il funzionamento della piattaforma</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                  <span className="text-red-500">✗</span>
                  <span className="text-sm">Utilizzare bot o sistemi automatizzati</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                  <span className="text-red-500">✗</span>
                  <span className="text-sm">Rivendere o sublicenziare l&apos;accesso</span>
                </div>
              </div>
            </div>
          </section>

          {/* 10. Modifiche ai Termini */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">10</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Modifiche ai Termini</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                Ci riserviamo il diritto di modificare questi Termini di Servizio in qualsiasi momento.
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h3 className="font-medium text-gray-900">Procedura di modifica:</h3>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Le modifiche saranno pubblicate su questa pagina con data aggiornata</li>
                  <li>• Per modifiche sostanziali, invieremo notifica via email con 30 giorni di preavviso</li>
                  <li>• L&apos;uso continuato del servizio dopo le modifiche costituisce accettazione</li>
                  <li>• Se non accetti le modifiche, puoi cancellare l&apos;account prima dell&apos;entrata in vigore</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 11. Legge Applicabile e Foro */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">11</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Legge Applicabile e Foro Competente</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-5 h-5 text-amber-600" />
                    <h3 className="font-medium text-gray-900">Legge Applicabile</h3>
                  </div>
                  <p className="text-sm">
                    Questi Termini sono regolati dalla <strong>legge italiana</strong>,
                    indipendentemente dal luogo di residenza dell&apos;utente.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <h3 className="font-medium text-gray-900">Foro Competente</h3>
                  </div>
                  <p className="text-sm">
                    Per qualsiasi controversia sarà competente in via esclusiva il
                    <strong> Foro di Cagliari</strong>, Italia.
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                <strong>Risoluzione alternativa:</strong> Prima di adire le vie legali, ti invitiamo a contattarci
                per tentare una risoluzione amichevole della controversia.
              </p>
            </div>
          </section>

          {/* 12. Disposizioni Finali */}
          <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">12</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Disposizioni Finali</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Intero accordo:</strong> Questi Termini costituiscono l&apos;intero accordo tra te e Vitaeology.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Separabilità:</strong> Se una clausola è ritenuta invalida, le altre rimangono in vigore.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Rinuncia:</strong> La mancata applicazione di un diritto non costituisce rinuncia.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Cessione:</strong> Non puoi cedere questi Termini senza il nostro consenso scritto.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contatti */}
          <section className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-sm p-6 md:p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Contattaci</h2>
            </div>
            <p className="mb-4">
              Per qualsiasi domanda sui Termini di Servizio o sull&apos;utilizzo di Vitaeology:
            </p>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-medium">Fernando Marongiu</p>
              <p>Fondatore - Vitaeology</p>
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
