import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, BookOpen, User, HelpCircle, Star, Gift } from 'lucide-react';
import { getTrilogia, getLibriTrilogia } from '@/data/libri';
import AcquistaTrilogiaButton from './AcquistaTrilogiaButton';

export const metadata: Metadata = {
  title: 'La Trilogia Rivoluzione Aurea | Vitaeology',
  description: 'Il percorso completo: Leadership Autentica + Oltre gli Ostacoli + Microfelicità. 3 libri, 3 assessment, un unico viaggio di trasformazione.',
  openGraph: {
    title: 'La Trilogia Rivoluzione Aurea',
    description: 'Il percorso completo per guidare, risolvere e vivere con equilibrio',
    type: 'book',
  },
};

export default function TrilogiaPage() {
  const trilogia = getTrilogia();
  const libri = getLibriTrilogia();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-horizontal-white.svg"
                alt="Vitaeology"
                width={180}
                height={26}
                className="h-7 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-white/80 hover:text-white font-medium hidden sm:block"
              >
                Accedi
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-gold-500 text-petrol-600 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
              >
                Inizia Gratis
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* HERO - Gradient Background */}
      <section className="bg-gradient-to-br from-petrol-600 via-petrol-700 to-petrol-800 pt-24 pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 rounded-full mb-8">
              <Gift className="w-5 h-5 text-gold-500" />
              <span className="text-gold-500 font-medium">Bundle Completo - Risparmia €{trilogia.risparmio.toFixed(2)}</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {trilogia.titolo}
            </h1>
            <p className="mt-6 text-xl lg:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto">
              {trilogia.sottotitolo}
            </p>

            {/* 3 Book Covers */}
            <div className="mt-12 flex justify-center items-end gap-4 lg:gap-8">
              {libri.map((libro, index) => (
                <div
                  key={libro.slug}
                  className={`
                    w-32 lg:w-44 aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden
                    transform transition-transform duration-300 hover:scale-105
                    ${index === 1 ? 'scale-110 z-10' : ''}
                  `}
                  style={{
                    transform: index === 0 ? 'rotate(-6deg)' : index === 2 ? 'rotate(6deg)' : '',
                  }}
                >
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-4"
                    style={{ background: `linear-gradient(135deg, ${libro.coloreAccent}, ${libro.coloreAccent}dd)` }}
                  >
                    <BookOpen className="w-8 lg:w-12 h-8 lg:h-12 text-white/90 mb-3" />
                    <h3 className="text-sm lg:text-base font-display font-bold text-white text-center leading-tight">
                      {libro.titolo}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Prezzo e CTA */}
            <div className="mt-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-white/50 line-through text-2xl">
                  €{trilogia.prezzoSingoli.toFixed(2)}
                </span>
                <span className="text-5xl md:text-6xl font-bold text-gold-500">
                  €{trilogia.prezzo.toFixed(2)}
                </span>
              </div>

              <AcquistaTrilogiaButton size="large" />

              <p className="mt-4 text-white/60 text-sm">
                3 PDF scaricabili immediatamente + 3 Assessment inclusi
              </p>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap gap-6 justify-center text-white/60 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gold-500" />
                Pagamento sicuro
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gold-500" />
                Garanzia 30 giorni
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gold-500" />
                3 Assessment gratuiti
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS - Bianco */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-petrol-600">
              Ti riconosci in queste situazioni?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {trilogia.painPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-white border-l-4 border-gold-500 rounded-r-lg shadow-sm"
              >
                <HelpCircle className="w-6 h-6 text-petrol-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* I 3 LIBRI - Grigio Perla */}
      <section className="py-20 bg-neutral-pearl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-petrol-600">
              3 Libri, Un Unico Percorso
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Ogni libro affronta un aspetto fondamentale della crescita personale e professionale
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {libri.map((libro, index) => (
              <div
                key={libro.slug}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div
                  className="p-6"
                  style={{ backgroundColor: libro.coloreAccent }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </span>
                    <BookOpen className="w-6 h-6 text-white/80" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white">
                    {libro.titolo}
                  </h3>
                  <p className="mt-2 text-white/80 text-sm">
                    {libro.sottotitolo}
                  </p>
                </div>

                <div className="p-6">
                  <h4 className="font-semibold text-petrol-600 mb-3">Cosa imparerai:</h4>
                  <ul className="space-y-2">
                    {libro.cosaImparerai.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Include:</span>
                    <p className="text-petrol-600 font-medium">{libro.titolo.replace('Leadership ', '')} Assessment</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICI - Blu Petrolio */}
      <section className="py-20 bg-petrol-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Cosa include la Trilogia
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {trilogia.benefici.map((beneficio, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6"
              >
                <CheckCircle className="w-6 h-6 text-gold-500 flex-shrink-0 mt-0.5" />
                <p className="text-white text-lg leading-relaxed">{beneficio}</p>
              </div>
            ))}
          </div>

          {/* CTA centrale */}
          <div className="mt-12 text-center">
            <AcquistaTrilogiaButton size="large" variant="gold" />
          </div>
        </div>
      </section>

      {/* IL PERCORSO - Bianco */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-petrol-600">
              Il Percorso Integrato
            </h2>
            <p className="mt-4 text-gray-600">
              Non 3 libri isolati, ma un viaggio coerente di trasformazione
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: 1,
                title: 'Leadership Autentica',
                desc: 'Scopri chi sei come leader. Le 24 Caratteristiche ti aiutano a riconoscere e sviluppare le tue qualità innate di guida.',
                color: '#0F4C81',
              },
              {
                step: 2,
                title: 'Oltre gli Ostacoli',
                desc: 'Affronta le sfide con metodo. Il Framework CAMBIA trasforma ogni problema in un\'opportunità di crescita.',
                color: '#C1272D',
              },
              {
                step: 3,
                title: 'Microfelicità Digitale',
                desc: 'Trova l\'equilibrio. Il Sistema R.A.D.A.R. ti riconnette con ciò che conta davvero nella vita digitale.',
                color: '#2D9B6D',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-6"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl"
                  style={{ backgroundColor: item.color }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-petrol-600">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTORE - Grigio Perla */}
      <section className="py-20 bg-neutral-pearl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-petrol-600">
              L&apos;Autore
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-white rounded-2xl shadow-lg">
            {/* Avatar */}
            <div className="w-32 h-32 bg-petrol-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-16 h-16 text-gold-500" />
            </div>

            <div className="text-center md:text-left">
              <h3 className="font-display text-2xl font-bold text-petrol-600 mb-3">
                {trilogia.autore.nome}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {trilogia.autore.bio}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {trilogia.autore.credenziali.map((cred, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 text-sm text-petrol-600 bg-neutral-pearl px-4 py-2 rounded-full"
                  >
                    <Star className="w-4 h-4 text-gold-500" />
                    {cred}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-20 bg-gradient-to-br from-petrol-600 via-petrol-700 to-petrol-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Gift className="w-16 h-16 text-gold-500 mx-auto mb-6" />

          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Inizia il tuo percorso completo oggi
          </h2>
          <p className="text-white/70 text-lg mb-8">
            3 libri, 3 assessment, un unico investimento nella tua crescita
          </p>

          {/* Prezzo */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-white/50 line-through text-xl">
                €{trilogia.prezzoSingoli.toFixed(2)}
              </span>
              <span className="text-5xl md:text-6xl font-bold text-gold-500">
                €{trilogia.prezzo.toFixed(2)}
              </span>
            </div>
            <p className="text-gold-500 font-medium">
              Risparmia €{trilogia.risparmio.toFixed(2)}
            </p>
          </div>

          {/* CTA */}
          <AcquistaTrilogiaButton size="large" variant="gold" />

          {/* Garanzia */}
          <p className="mt-8 text-white/60 text-sm max-w-md mx-auto">
            {trilogia.garanzia}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-petrol-800 text-white/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-horizontal-white.svg"
                alt="Vitaeology"
                width={140}
                height={20}
                className="h-5 w-auto opacity-60"
              />
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Termini</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contatti</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm">
            © {new Date().getFullYear()} Vitaeology. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}
