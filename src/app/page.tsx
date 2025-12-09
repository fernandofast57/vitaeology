import Link from 'next/link'
import { ArrowRight, Target, BarChart3, Calendar, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-display font-bold text-petrol-600">
                Vitaeology
              </span>
            </div>
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-petrol-600 to-petrol-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
              Scopri il Tuo Potenziale di{' '}
              <span className="text-gold-500">Leadership Autentica</span>
            </h1>
            <p className="mt-6 text-xl text-gray-300 leading-relaxed">
              Test diagnostico con 240 domande scientifiche per valutare 
              24 caratteristiche di leadership. Visualizza i tuoi risultati 
              con un radar chart interattivo e migliora con 52 esercizi settimanali.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup" className="btn-secondary text-lg px-8 py-4">
                Inizia il Test Gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="#come-funziona" className="btn-outline border-white text-white hover:bg-white hover:text-petrol-600 text-lg px-8 py-4">
                Come Funziona
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} />
      </section>

      {/* Features Section */}
      <section id="come-funziona" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600">
              Come Funziona
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Un percorso strutturato in tre fasi per sviluppare la tua leadership autentica
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-petrol-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-petrol-600 mb-3">
                1. Test Diagnostico
              </h3>
              <p className="text-gray-600">
                Rispondi a 240 domande scientifiche che valutano 24 caratteristiche 
                di leadership suddivise in 4 pilastri fondamentali.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-8 w-8 text-petrol-600" />
              </div>
              <h3 className="text-xl font-bold text-petrol-600 mb-3">
                2. Radar Chart Personalizzato
              </h3>
              <p className="text-gray-600">
                Visualizza i tuoi risultati con un grafico radar interattivo. 
                Identifica punti di forza e aree di miglioramento.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-petrol-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-petrol-600 mb-3">
                3. 52 Esercizi Settimanali
              </h3>
              <p className="text-gray-600">
                Segui un percorso guidato di un anno con esercizi pratici 
                personalizzati basati sui tuoi risultati.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-petrol-600">
              I 4 Pilastri della Leadership
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              24 caratteristiche organizzate in 4 aree fondamentali
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'ESSERE', color: 'bg-blue-500', count: 6, desc: 'Identità e valori' },
              { name: 'SENTIRE', color: 'bg-green-500', count: 6, desc: 'Intelligenza emotiva' },
              { name: 'PENSARE', color: 'bg-purple-500', count: 6, desc: 'Capacità cognitive' },
              { name: 'AGIRE', color: 'bg-orange-500', count: 6, desc: 'Azione e risultati' },
            ].map((pillar) => (
              <div key={pillar.name} className="card border-t-4" style={{ borderTopColor: pillar.color.replace('bg-', '#') }}>
                <div className={`w-12 h-12 ${pillar.color} rounded-lg flex items-center justify-center mb-4`}>
                  <span className="text-white font-bold">{pillar.count}</span>
                </div>
                <h3 className="text-lg font-bold text-petrol-600">{pillar.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{pillar.desc}</p>
                <p className="text-gray-500 text-xs mt-2">{pillar.count} caratteristiche</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-petrol-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            Pronto a Scoprire il Tuo Potenziale?
          </h2>
          <p className="mt-4 text-xl text-gray-300">
            Il test diagnostico è gratuito. Inizia ora e ricevi il tuo radar chart personalizzato.
          </p>
          <div className="mt-10">
            <Link href="/auth/signup" className="btn-secondary text-lg px-10 py-4">
              Inizia il Test Gratuito
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <p className="mt-6 text-gray-400 text-sm">
            Nessuna carta di credito richiesta • Risultati immediati
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-petrol-700 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-display font-bold text-white">Vitaeology</span>
              <p className="mt-2 text-sm">Leadership Autentica per Imprenditori</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Termini</Link>
              <Link href="/contact" className="hover:text-white">Contatti</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-600 text-center text-sm">
            © {new Date().getFullYear()} Vitaeology - Fernando Marongiu. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  )
}
