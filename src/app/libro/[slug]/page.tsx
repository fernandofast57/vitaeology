import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { CheckCircle, BookOpen, User, HelpCircle, ExternalLink } from 'lucide-react';
import { getLibroBySlug, getAllLibriSlugs, Libro } from '@/data/libri';
import AcquistaButton from './AcquistaButton';

// Dynamic import per evitare problemi SSR con Supabase browser client
const ChallengeDiscountBanner = dynamic(
  () => import('./ChallengeDiscountBanner'),
  { ssr: false }
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllLibriSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const libro = getLibroBySlug(slug);

  if (!libro) {
    return { title: 'Libro non trovato' };
  }

  return {
    title: `${libro.titolo} | Vitaeology`,
    description: libro.sottotitolo,
    openGraph: {
      title: libro.titolo,
      description: libro.sottotitolo,
      type: 'book',
    },
  };
}

export default async function LibroPage({ params }: PageProps) {
  const { slug } = await params;
  const libro = getLibroBySlug(slug);

  if (!libro) {
    notFound();
  }

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

      {/* Banner sconto per chi ha completato la Challenge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <ChallengeDiscountBanner libroSlug={libro.slug} libroTitolo={libro.titolo} />
      </div>

      {/* HERO - 60% Blu Petrolio */}
      <HeroSection libro={libro} />

      {/* PAIN POINTS - 30% Bianco */}
      <PainPointsSection libro={libro} />

      {/* BENEFICI - Blu Petrolio */}
      <BeneficiSection libro={libro} />

      {/* CONTENUTI - Grigio Perla */}
      <ContenutiSection libro={libro} />

      {/* AUTORE - Bianco */}
      <AutoreSection libro={libro} />

      {/* CTA FINALE */}
      <CTASection libro={libro} />

      {/* Footer */}
      <footer className="bg-petrol-600 text-white/60 py-8">
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

// ============================================================
// HERO SECTION - Background Blu Petrolio
// ============================================================
function HeroSection({ libro }: { libro: Libro }) {
  return (
    <section className="bg-petrol-600 pt-24 pb-20 lg:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Contenuto Hero */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {libro.titolo}
            </h1>
            <p className="mt-6 text-xl lg:text-2xl text-white/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {libro.sottotitolo}
            </p>

            {/* Prezzo e CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <AcquistaButton libro={libro} size="large" />
              <span className="text-white/60 text-sm">
                PDF scaricabile immediatamente
              </span>
            </div>

            {/* CTA Amazon - libro fisico */}
            {libro.amazonUrl && (
              <div className="mt-4 flex items-center gap-3 justify-center lg:justify-start">
                <a
                  href={libro.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preferisci il libro fisico? Acquista su Amazon
                </a>
              </div>
            )}

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap gap-6 justify-center lg:justify-start text-white/60 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gold-500" />
                Pagamento sicuro
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gold-500" />
                Garanzia 30 giorni
              </span>
            </div>
          </div>

          {/* Copertina Libro */}
          <div className="w-64 lg:w-80 flex-shrink-0">
            <div className="aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden transform lg:rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-petrol-700 to-petrol-600">
                <BookOpen className="w-16 h-16 text-gold-500 mb-6" />
                <h3 className="text-2xl font-display font-bold text-white text-center leading-tight">
                  {libro.titolo}
                </h3>
                <div className="mt-4 w-16 h-0.5 bg-gold-500" />
                <p className="mt-4 text-white/70 text-sm">Fernando Marongiu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PAIN POINTS SECTION - Background Bianco
// ============================================================
function PainPointsSection({ libro }: { libro: Libro }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-petrol-600">
            Ti riconosci in queste situazioni?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {libro.painPoints.map((point, index) => (
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
  );
}

// ============================================================
// BENEFICI SECTION - Background Blu Petrolio
// ============================================================
function BeneficiSection({ libro }: { libro: Libro }) {
  return (
    <section className="py-20 bg-petrol-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Questo libro ti offre
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {libro.benefici.map((beneficio, index) => (
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
          <AcquistaButton libro={libro} size="large" variant="gold" />
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CONTENUTI SECTION - Background Grigio Perla
// ============================================================
function ContenutiSection({ libro }: { libro: Libro }) {
  return (
    <section className="py-20 bg-neutral-pearl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-petrol-600">
            Cosa troverai nel libro
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Capitoli */}
          <div>
            <h3 className="font-display text-xl font-bold text-petrol-600 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Capitoli
            </h3>
            <div className="space-y-4">
              {libro.capitoli.map((capitolo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4"
                >
                  <span className="w-10 h-10 bg-gold-500 text-petrol-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{capitolo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cosa imparerai */}
          <div>
            <h3 className="font-display text-xl font-bold text-petrol-600 mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Cosa imparerai
            </h3>
            <div className="space-y-4">
              {libro.cosaImparerai.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-white rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// AUTORE SECTION - Background Bianco
// ============================================================
function AutoreSection({ libro }: { libro: Libro }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-petrol-600">
            L&apos;Autore
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-neutral-pearl rounded-2xl">
          {/* Avatar */}
          <div className="w-32 h-32 bg-petrol-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-16 h-16 text-gold-500" />
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-display text-2xl font-bold text-petrol-600 mb-3">
              {libro.autore.nome}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {libro.autore.bio}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {libro.autore.credenziali.map((cred, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 text-sm text-petrol-600 bg-white px-4 py-2 rounded-full"
                >
                  <CheckCircle className="w-4 h-4 text-gold-500" />
                  {cred}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CTA FINALE SECTION
// ============================================================
function CTASection({ libro }: { libro: Libro }) {
  return (
    <section className="py-20 bg-petrol-600">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          Inizia il tuo percorso oggi
        </h2>
        <p className="text-white/70 text-lg mb-8">
          Un investimento nella tua crescita personale e professionale
        </p>

        {/* Prezzo */}
        <div className="mb-8">
          <span className="text-5xl md:text-6xl font-bold text-gold-500">
            €{libro.prezzo.toFixed(2)}
          </span>
          <p className="mt-2 text-white/60">
            PDF scaricabile immediatamente
          </p>
        </div>

        {/* CTA */}
        <AcquistaButton libro={libro} size="large" variant="gold" />

        {/* CTA Amazon - libro fisico */}
        {libro.amazonUrl && (
          <div className="mt-4">
            <a
              href={libro.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preferisci il libro fisico? Acquista su Amazon
            </a>
          </div>
        )}

        {/* Garanzia */}
        <p className="mt-8 text-white/60 text-sm max-w-md mx-auto">
          {libro.garanzia}
        </p>
      </div>
    </section>
  );
}
