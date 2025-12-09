import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Test Diagnostico',
}

export default async function TestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/test')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="flex items-center text-gray-600 hover:text-petrol-600"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Torna alla Dashboard
          </Link>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            ~45 minuti
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold text-petrol-600">
            Test Diagnostico Leadership
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            240 domande per valutare le tue 24 caratteristiche di leadership 
            suddivise nei 4 pilastri: Essere, Sentire, Pensare, Agire.
          </p>
        </div>

        {/* Instructions Card */}
        <div className="card max-w-2xl mx-auto mb-8">
          <h2 className="text-xl font-bold text-petrol-600 mb-4">
            Prima di iniziare
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-petrol-600 text-white text-sm flex items-center justify-center flex-shrink-0">1</span>
              <span>Rispondi con sincerità - non ci sono risposte giuste o sbagliate</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-petrol-600 text-white text-sm flex items-center justify-center flex-shrink-0">2</span>
              <span>Per ogni affermazione, scegli VERO, INCERTO o FALSO</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-petrol-600 text-white text-sm flex items-center justify-center flex-shrink-0">3</span>
              <span>Puoi interrompere e riprendere il test quando vuoi</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-petrol-600 text-white text-sm flex items-center justify-center flex-shrink-0">4</span>
              <span>I risultati saranno disponibili subito dopo il completamento</span>
            </li>
          </ul>
        </div>

        {/* Info Alert */}
        <div className="max-w-2xl mx-auto mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium">Test in fase di caricamento</p>
            <p className="text-blue-600 text-sm mt-1">
              Le 240 domande del test diagnostico saranno disponibili a breve. 
              Stiamo completando il caricamento dei contenuti.
            </p>
          </div>
        </div>

        {/* Start Button (disabled for now) */}
        <div className="text-center">
          <button 
            disabled
            className="btn-primary opacity-50 cursor-not-allowed"
          >
            Inizia il Test (Presto disponibile)
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Tempo stimato: 45 minuti | 240 domande
          </p>
        </div>
      </main>
    </div>
  )
}
