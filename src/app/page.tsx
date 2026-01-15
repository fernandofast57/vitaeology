'use client';

/**
 * Homepage Vitaeology - Minimal Version
 *
 * Versione: 4.0
 * Data: 15 Gennaio 2026
 *
 * Struttura semplificata:
 * 1. Hero (Dare Forma all'Azione + Video)
 * 2. I 3 Sentieri
 * 3. Footer
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
                src="/logo-horizontal.png"
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
      {/* HERO */}
      {/* ================================================================== */}
      <section className="relative bg-gradient-to-b from-petrol-600 via-petrol-700 to-petrol-800 text-white overflow-visible">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Colonna Sinistra - Testo */}
            <div className="text-center lg:text-left">
              {/* Headline - Sandwich di Mistero */}
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-display font-bold leading-tight mb-8">
                L&apos;hai già fatto.<br/>
                <span className="text-gold-400">Non te lo ricordi.</span>
              </h1>

              {/* Copy - Evoca, non nomina */}
              <div className="space-y-4 text-lg sm:text-xl text-gray-200 leading-relaxed mb-10">
                <p>
                  Sai già come si fa.
                </p>
                <p className="text-white/80">
                  Solo che adesso non funziona più come prima.
                </p>
                <p className="text-white font-medium">
                  È ancora lì. Lo senti.
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
                </div>

                {/* Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-petrol-800 text-gold-400 text-xs font-medium px-4 py-1.5 rounded-full border border-gold-500/30">
                  Fernando Marongiu
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagonale SVG */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            className="relative block w-full h-16 lg:h-24"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 L1200,0 L1200,120 Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* ================================================================== */}
      {/* I 3 SENTIERI */}
      {/* ================================================================== */}
      <section id="percorsi" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600">
              Qual è la tua sfida oggi?
            </h2>
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
                <p className="text-gray-600 mb-6 min-h-[72px]">
                  Sai guidare. L&apos;hai già fatto.<br/>
                  Solo che adesso non funziona.
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
                <p className="text-gray-600 mb-6 min-h-[72px]">
                  Hai già risolto problemi peggiori.<br/>
                  Non te lo ricordi.
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
                <p className="text-gray-600 mb-6 min-h-[72px]">
                  C&apos;era un momento in cui sapevi essere felice.<br/>
                  È ancora lì.
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
                className="h-6 w-auto"
              />
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
