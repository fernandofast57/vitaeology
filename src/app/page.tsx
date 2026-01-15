'use client';

/**
 * Homepage Vitaeology - Manifesto Version
 *
 * Versione: 3.0
 * Data: 15 Gennaio 2026
 *
 * Basata su: Vitaeology.txt (Manifesto)
 * Tono: Filosofico, Empowering, Engagement attraverso tensione emotiva
 *
 * Struttura:
 * 1. Hero - "Dare Forma all'Azione"
 * 2. La Verità - Il ribaltamento
 * 3. Il Viaggio - Metafora resilienza
 * 4. I 3 Percorsi - Sentieri del viaggio
 * 5. La Guida - Fernando
 * 6. CTA Finale
 * 7. Footer
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ================================================================== */}
      {/* NAVBAR */}
      {/* ================================================================== */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-petrol-600 hover:text-petrol-700 font-medium hidden sm:block"
              >
                Accedi
              </Link>
              <Link
                href="#percorsi"
                className="bg-petrol-600 hover:bg-petrol-700 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Inizia il Viaggio
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* ================================================================== */}
      {/* SEZIONE 1: HERO - IL MANIFESTO */}
      {/* ================================================================== */}
      <section
        className="relative bg-gradient-to-b from-petrol-600 via-petrol-700 to-petrol-800 text-white overflow-hidden"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}
      >
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Colonna Sinistra - Testo */}
            <div className="text-center lg:text-left">
              {/* Headline - Il Manifesto */}
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-display font-bold leading-tight mb-8">
                Dare Forma all&apos;Azione
              </h1>

              {/* Il cuore del manifesto */}
              <div className="space-y-4 text-lg sm:text-xl text-gray-200 leading-relaxed mb-10">
                <p>
                  Il mondo può sembrare ostile. Le sfide, schiaccianti.
                </p>
                <p className="text-white font-medium">
                  Ma il pericolo non è una barriera al successo.<br/>
                  <span className="text-gold-400">È un catalizzatore per la crescita.</span>
                </p>
                <p>
                  Hai il potere di definire il tuo futuro.
                </p>
              </div>

              {/* CTA */}
              <Link
                href="#percorsi"
                className="inline-flex items-center bg-gold-500 hover:bg-gold-600 text-petrol-700 font-bold px-8 py-4 rounded-lg transition text-lg"
              >
                Inizia il Viaggio
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>

            {/* Colonna Destra - Video Placeholder */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Cerchio esterno decorativo */}
                <div className="absolute -inset-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full opacity-20 blur-sm" />

                {/* Video Container - Cerchio */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-gold-500/50 shadow-2xl">
                  {/* Placeholder - sostituire con video */}
                  <div className="absolute inset-0 bg-gradient-to-br from-petrol-500 to-petrol-700 flex flex-col items-center justify-center">
                    {/* Play button placeholder */}
                    <div className="w-20 h-20 bg-gold-500/90 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-gold-400 transition shadow-lg">
                      <svg className="w-8 h-8 text-petrol-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-white/80 text-sm font-medium">Guarda il video</p>
                    <p className="text-gold-400 text-xs mt-1">2 minuti</p>
                  </div>

                  {/*
                    TODO: Sostituire il placeholder con:
                    <video
                      className="w-full h-full object-cover"
                      poster="/images/fernando-poster.jpg"
                      controls
                    >
                      <source src="/videos/fernando-intro.mp4" type="video/mp4" />
                    </video>
                  */}
                </div>

                {/* Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-petrol-800 text-gold-400 text-xs font-medium px-4 py-1.5 rounded-full border border-gold-500/30">
                  Fernando Marongiu
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 2: LA VERITÀ - IL RIBALTAMENTO */}
      {/* ================================================================== */}
      <section className="pt-8 pb-20 lg:pt-12 lg:pb-28 bg-gray-50 -mt-16 lg:-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-8">
              La Verità Che Nessuno Ti Dice
            </h2>

            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Hai già superato centinaia di sfide nella tua vita.
              </p>
              <p>
                Hai già dimostrato resilienza, leadership, capacità di risolvere problemi.
              </p>
              <p className="text-xl font-medium text-petrol-600">
                Non devi imparare qualcosa di nuovo.
              </p>
              <p className="text-xl">
                Devi <span className="text-gold-600 font-bold">riconoscere</span> quello che già sei —<br/>
                e imparare a usarlo <span className="italic">intenzionalmente</span>.
              </p>
            </div>

            <div className="mt-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-600 italic text-lg">
                &ldquo;La resilienza non è un dono casuale o un talento innato.
                È il risultato del tuo viaggio personale, dei tuoi sforzi,
                della tua volontà di superare le difficoltà.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 3: IL VIAGGIO - METAFORA RESILIENZA */}
      {/* ================================================================== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Testo */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-6">
                L&apos;Albero e la Tempesta
              </h2>

              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Immagina un albero che, nonostante una tempesta violenta,
                  riesce a flettersi senza spezzarsi.
                </p>
                <p>
                  Rimane radicato. Continua a crescere una volta passata la tempesta.
                </p>
                <p className="font-medium text-petrol-600">
                  Questa è la resilienza.
                </p>
                <p>
                  Non è resistere immobili. È adattarsi, piegarsi quando serve,
                  e tornare più forti di prima.
                </p>
                <p className="text-gold-600 font-medium">
                  La resilienza è come un muscolo: più la usi, più diventa forte.
                </p>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-petrol-50 to-petrol-100 rounded-3xl flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-8xl mb-4">🌳</div>
                  <p className="text-petrol-600 font-medium">
                    Radici profonde.<br/>
                    Rami flessibili.<br/>
                    Crescita continua.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 4: I 3 PERCORSI - SENTIERI DEL VIAGGIO */}
      {/* ================================================================== */}
      <section id="percorsi" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600 mb-4">
              Tre Sentieri, Un Viaggio
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ogni sentiero inizia con 7 giorni di esplorazione gratuita.
              Scegli quello che risuona con dove ti trovi ora.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Percorso Leadership */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <div className="h-2 bg-[#D4AF37]" />
              <div className="p-8">
                <div className="text-4xl mb-4">👑</div>
                <h3 className="text-2xl font-bold text-petrol-600 mb-2">
                  Leadership Autentica
                </h3>
                <p className="text-[#D4AF37] font-medium text-sm mb-4">
                  IL SENTIERO DEL RICONOSCIMENTO
                </p>
                <p className="text-gray-600 mb-6">
                  Le persone non seguono chi cerca di essere leader.
                  Seguono chi riconosce la propria leadership — e la usa al livello giusto.
                </p>
                <p className="text-gray-500 text-sm mb-8 italic">
                  &ldquo;Ho provato passione, autorità, tecniche. Niente funzionava.
                  Poi ho capito che non dovevo imparare — dovevo riconoscere.&rdquo;
                </p>
                <Link
                  href="/challenge/leadership"
                  className="block w-full bg-[#D4AF37] hover:bg-[#b8962f] text-white font-bold py-3 px-6 rounded-lg text-center transition"
                >
                  Inizia i 7 Giorni
                </Link>
              </div>
            </div>

            {/* Percorso Ostacoli */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <div className="h-2 bg-[#22C55E]" />
              <div className="p-8">
                <div className="text-4xl mb-4">⛰️</div>
                <h3 className="text-2xl font-bold text-petrol-600 mb-2">
                  Oltre gli Ostacoli
                </h3>
                <p className="text-[#22C55E] font-medium text-sm mb-4">
                  IL SENTIERO DELLA RESILIENZA
                </p>
                <p className="text-gray-600 mb-6">
                  Ogni sfida superata è una prova della tua resilienza.
                  Non devi imparare a risolvere problemi. Devi ricordare che sai già farlo.
                </p>
                <p className="text-gray-500 text-sm mb-8 italic">
                  &ldquo;I problemi non sono barriere. Sono catalizzatori.
                  Ogni ostacolo è un&apos;opportunità per dimostrare chi sei.&rdquo;
                </p>
                <Link
                  href="/challenge/ostacoli"
                  className="block w-full bg-[#22C55E] hover:bg-[#1ea34d] text-white font-bold py-3 px-6 rounded-lg text-center transition"
                >
                  Inizia i 7 Giorni
                </Link>
              </div>
            </div>

            {/* Percorso Microfelicità */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <div className="h-2 bg-[#8B5CF6]" />
              <div className="p-8">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-petrol-600 mb-2">
                  Microfelicità
                </h3>
                <p className="text-[#8B5CF6] font-medium text-sm mb-4">
                  IL SENTIERO DEL BENESSERE
                </p>
                <p className="text-gray-600 mb-6">
                  La felicità non è una destinazione. È un viaggio.
                  Ogni giorno ti attraversano momenti positivi. Devi solo imparare a vederli.
                </p>
                <p className="text-gray-500 text-sm mb-8 italic">
                  &ldquo;Coltivare la felicità non è solo un obiettivo.
                  È un potente strumento che influenza tutto quello che fai.&rdquo;
                </p>
                <Link
                  href="/challenge/microfelicita"
                  className="block w-full bg-[#8B5CF6] hover:bg-[#7c4fe6] text-white font-bold py-3 px-6 rounded-lg text-center transition"
                >
                  Inizia i 7 Giorni
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8">
            Nessuna carta di credito richiesta. Solo la tua email.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 5: LA GUIDA - FERNANDO */}
      {/* ================================================================== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-petrol-600 to-petrol-700 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-3xl font-display font-bold text-gold-500">FM</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-petrol-600 mb-6">
            Fernando Marongiu
          </h2>

          <div className="space-y-4 text-lg text-gray-700">
            <p>
              50 anni di esperienza imprenditoriale.
              Tutti gli errori possibili, già fatti.
            </p>
            <p>
              Ho condensato quello che ho imparato in 3 libri —
              la <strong>Trilogia Rivoluzione Aurea</strong> —
              e in questa piattaforma.
            </p>
            <p className="text-petrol-600 font-medium">
              Non sono qui per insegnarti qualcosa di nuovo.<br/>
              Sono qui per aiutarti a riconoscere quello che già sei.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 6: CTA FINALE */}
      {/* ================================================================== */}
      <section className="py-20 bg-gradient-to-br from-petrol-600 to-petrol-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
            Il Viaggio Inizia Con Un Passo
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            7 giorni. 10 minuti al giorno.<br/>
            Abbastanza per capire se questo percorso fa per te.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/challenge/leadership"
              className="bg-[#D4AF37] hover:bg-[#b8962f] text-white font-bold py-4 px-8 rounded-lg transition"
            >
              Leadership
            </Link>
            <Link
              href="/challenge/ostacoli"
              className="bg-[#22C55E] hover:bg-[#1ea34d] text-white font-bold py-4 px-8 rounded-lg transition"
            >
              Ostacoli
            </Link>
            <Link
              href="/challenge/microfelicita"
              className="bg-[#8B5CF6] hover:bg-[#7c4fe6] text-white font-bold py-4 px-8 rounded-lg transition"
            >
              Microfelicità
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <footer className="bg-petrol-800 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <Image
                src="/logo-horizontal-white.svg"
                alt="Vitaeology"
                width={150}
                height={22}
                className="h-6 w-auto mb-2"
              />
              <p className="text-sm">Dare Forma all&apos;Azione</p>
            </div>

            <div className="flex gap-8 text-sm">
              <Link href="/privacy" className="hover:text-white transition">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition">
                Termini
              </Link>
              <Link href="/contact" className="hover:text-white transition">
                Contatti
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
            © {new Date().getFullYear()} Vitaeology - Fernando Marongiu
          </div>
        </div>
      </footer>
    </div>
  );
}
