import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { 
  ArrowRight, 
  ClipboardList, 
  BarChart3, 
  BookOpen, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const userFullName = user?.user_metadata?.full_name || 'Utente'
  const firstName = userFullName.split(' ')[0]

  // TODO: Fetch assessment status from database
  const assessmentStatus = {
    hasStarted: false,
    hasCompleted: false,
    progress: 0, // 0-240
    lastUpdated: null,
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-petrol-600">
          Benvenuto, {firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Ecco una panoramica del tuo percorso di sviluppo della leadership.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Assessment Status Card */}
        <div className="card border-l-4 border-l-petrol-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Test Diagnostico</p>
              <p className="mt-1 text-2xl font-bold text-petrol-600">
                {assessmentStatus.hasCompleted 
                  ? 'Completato' 
                  : assessmentStatus.hasStarted 
                    ? `${assessmentStatus.progress}/240`
                    : 'Non iniziato'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              assessmentStatus.hasCompleted 
                ? 'bg-green-100' 
                : 'bg-gray-100'
            }`}>
              {assessmentStatus.hasCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <ClipboardList className="h-6 w-6 text-gray-600" />
              )}
            </div>
          </div>
          {!assessmentStatus.hasCompleted && (
            <Link 
              href="/test" 
              className="mt-4 inline-flex items-center text-sm font-medium text-petrol-600 hover:text-petrol-700"
            >
              {assessmentStatus.hasStarted ? 'Continua test' : 'Inizia test'}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Results Card */}
        <div className="card border-l-4 border-l-gold-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">I Tuoi Risultati</p>
              <p className="mt-1 text-2xl font-bold text-petrol-600">
                {assessmentStatus.hasCompleted ? 'Disponibili' : 'In attesa'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              assessmentStatus.hasCompleted 
                ? 'bg-gold-100' 
                : 'bg-gray-100'
            }`}>
              <BarChart3 className={`h-6 w-6 ${
                assessmentStatus.hasCompleted 
                  ? 'text-gold-600' 
                  : 'text-gray-400'
              }`} />
            </div>
          </div>
          {assessmentStatus.hasCompleted ? (
            <Link 
              href="/results" 
              className="mt-4 inline-flex items-center text-sm font-medium text-petrol-600 hover:text-petrol-700"
            >
              Vedi radar chart
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Completa il test per vedere i risultati
            </p>
          )}
        </div>

        {/* Exercises Card */}
        <div className="card border-l-4 border-l-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Esercizi Completati</p>
              <p className="mt-1 text-2xl font-bold text-petrol-600">
                0 / 52
              </p>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <Link 
            href="/exercises" 
            className="mt-4 inline-flex items-center text-sm font-medium text-petrol-600 hover:text-petrol-700"
          >
            Vedi esercizi
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Call to Action */}
      {!assessmentStatus.hasStarted && (
        <div className="card bg-gradient-to-r from-petrol-600 to-petrol-700 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Inizia il Tuo Percorso</h2>
              <p className="mt-1 text-gray-200">
                Completa il test diagnostico con 240 domande per scoprire il tuo profilo di leadership.
              </p>
            </div>
            <Link 
              href="/test" 
              className="btn-secondary flex-shrink-0"
            >
              Inizia il Test
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold text-petrol-600 mb-3">
            Come funziona il test
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>240 domande suddivise in 24 caratteristiche di leadership</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Rispondi con VERO, INCERTO o FALSO</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Puoi interrompere e riprendere quando vuoi</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Risultati immediati con radar chart interattivo</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-petrol-600 mb-3">
            I 4 Pilastri
          </h3>
          <div className="space-y-3">
            {[
              { name: 'ESSERE', color: 'bg-blue-500', desc: 'Identità e valori personali' },
              { name: 'SENTIRE', color: 'bg-green-500', desc: 'Intelligenza emotiva' },
              { name: 'PENSARE', color: 'bg-purple-500', desc: 'Capacità cognitive e strategiche' },
              { name: 'AGIRE', color: 'bg-orange-500', desc: 'Azione e conseguimento risultati' },
            ].map((pillar) => (
              <div key={pillar.name} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${pillar.color}`} />
                <div>
                  <span className="font-medium text-petrol-600">{pillar.name}</span>
                  <span className="text-gray-500 text-sm ml-2">- {pillar.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
